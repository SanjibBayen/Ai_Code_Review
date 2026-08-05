import jwt from 'jsonwebtoken';
import GithubConnection from '../models/GithubConnection.js';
import CodeReview from '../models/CodeReview.js';
import ReviewHistory from '../models/ReviewHistory.js';
import { reviewCode } from '../services/aiReview.service.js';
import {
    exchangeOAuthCode,
    getAuthenticatedUser,
    getRepositories,
    getRepositoryBranches,
    getRepositoryTree,
    getFileContent,
} from '../services/github.service.js';
import { buildReviewResponse } from '../utils/transformers.js';

// Configuration with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5000/api/github/callback';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Supported code file extensions
const CODE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.java', '.c', '.cpp', '.cs', '.rs', '.rb', '.php', '.swift', '.kt'];
const MAX_FILE_SIZE = 50000; // 50KB
const MAX_FILES_PER_REVIEW = 10;
const CHUNK_SIZE = 5;

// Language mapping
const LANGUAGE_MAP = {
    js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
    py: 'python', go: 'go', java: 'java', c: 'c', cpp: 'cpp',
    cs: 'csharp', rs: 'rust', rb: 'ruby', php: 'php', swift: 'swift', kt: 'kotlin'
};

// Helper Functions
const respondWithError = (res, status, message) => {
    return res.status(status).json({ success: false, message });
};

const respondWithSuccess = (res, data, status = 200) => {
    return res.status(status).json({ success: true, ...data });
};

const githubUserPayload = (connection) => ({
    connected: true,
    username: connection.username,
    avatar: connection.avatarUrl,
    connectedAt: connection.createdAt,
});

const redirectToClient = (res, status, errorMessage = '') => {
    const url = new URL('/github', CLIENT_URL);
    url.searchParams.set('connection', status);
    if (errorMessage) url.searchParams.set('error', errorMessage);
    return res.redirect(url.toString());
};

const getGitHubConnection = async (userId) => {
    const connection = await GithubConnection.findOne({ user: userId });
    if (!connection) {
        throw new Error('GitHub account not connected');
    }
    
    // Check if token might be expired (simple check)
    if (connection.updatedAt && (Date.now() - new Date(connection.updatedAt).getTime()) > 7 * 24 * 60 * 60 * 1000) {
        console.warn('GitHub token might be expired for user:', userId);
    }
    
    return connection;
};

const detectLanguage = (files) => {
    const extCount = {};
    for (const file of files) {
        const ext = '.' + (file.path.split('.').pop()?.toLowerCase() || 'txt');
        extCount[ext] = (extCount[ext] || 0) + 1;
    }
    const mostCommonExt = Object.entries(extCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '.js';
    return LANGUAGE_MAP[mostCommonExt.replace('.', '')] || 'javascript';
};

// Controller Functions
export const connectGitHub = async (req, res) => {
    try {
        if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
            return respondWithError(res, 503, 'GitHub OAuth is not configured. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to environment variables.');
        }

        const state = jwt.sign(
            { userId: req.user._id.toString(), purpose: 'github-oauth' },
            JWT_SECRET,
            { expiresIn: '10m' }
        );

        const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
        authorizeUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
        authorizeUrl.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI);
        authorizeUrl.searchParams.set('scope', 'read:user repo');
        authorizeUrl.searchParams.set('state', state);
        authorizeUrl.searchParams.set('allow_signup', 'true');

        return respondWithSuccess(res, { authorizationUrl: authorizeUrl.toString() });
    } catch (error) {
        console.error('Error creating GitHub auth URL:', error);
        return respondWithError(res, 500, 'Failed to create GitHub authorization URL');
    }
};

export const githubOAuthCallback = async (req, res) => {
    const { code, state, error: githubError, error_description } = req.query;

    // Handle GitHub OAuth errors
    if (githubError) {
        console.error('GitHub OAuth error:', githubError, error_description);
        return redirectToClient(res, 'failed', error_description || 'Authorization denied');
    }

    // Validate required parameters
    if (!code || !state) {
        return redirectToClient(res, 'failed', 'Missing authorization code or state');
    }

    try {
        // Verify JWT state
        let payload;
        try {
            payload = jwt.verify(state, JWT_SECRET);
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError.message);
            return redirectToClient(res, 'failed', 'Invalid or expired state token');
        }

        if (payload.purpose !== 'github-oauth' || !payload.userId) {
            return redirectToClient(res, 'failed', 'Invalid state purpose');
        }

        // Exchange code for access token
        let accessToken;
        try {
            accessToken = await exchangeOAuthCode(code);
        } catch (tokenError) {
            console.error('Failed to exchange OAuth code:', tokenError.message);
            return redirectToClient(res, 'failed', 'Failed to obtain access token');
        }

        // Get GitHub user info
        let githubUser;
        try {
            githubUser = await getAuthenticatedUser(accessToken);
        } catch (userError) {
            console.error('Failed to get GitHub user:', userError.message);
            return redirectToClient(res, 'failed', 'Failed to fetch GitHub user info');
        }

        // Save or update connection
        await GithubConnection.findOneAndUpdate(
            { user: payload.userId },
            {
                githubId: String(githubUser.id),
                username: githubUser.login,
                accessToken,
                avatarUrl: githubUser.avatar_url || '',
                updatedAt: new Date(),
            },
            { 
                new: true, 
                upsert: true, 
                runValidators: true, 
                setDefaultsOnInsert: true 
            }
        );

        console.log(`GitHub connected successfully for user: ${payload.userId}`);
        return redirectToClient(res, 'success');
    } catch (error) {
        console.error('GitHub OAuth callback error:', error);
        return redirectToClient(res, 'failed', 'An unexpected error occurred');
    }
};

export const getGitHubUser = async (req, res) => {
    try {
        const connection = await GithubConnection.findOne({ user: req.user._id });
        
        if (!connection) {
            return respondWithSuccess(res, {
                connected: false,
                user: null
            });
        }

        return respondWithSuccess(res, {
            connected: true,
            user: githubUserPayload(connection)
        });
    } catch (error) {
        console.error('Failed to fetch GitHub status:', error);
        return respondWithError(res, 500, 'Failed to fetch GitHub connection status');
    }
};

export const getGithubRepos = async (req, res) => {
    try {
        const connection = await getGitHubConnection(req.user._id);
        
        let repositories;
        try {
            repositories = await getRepositories(connection.accessToken);
        } catch (apiError) {
            if (apiError.response?.status === 401) {
                // Token expired or revoked
                await GithubConnection.deleteOne({ user: req.user._id });
                return respondWithError(res, 401, 'GitHub token expired. Please reconnect your GitHub account.');
            }
            throw apiError;
        }

        const formattedRepos = repositories.map((repo) => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description || '',
            language: repo.language || 'Unknown',
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            updated_at: repo.updated_at,
            default_branch: repo.default_branch,
            private: repo.private,
            html_url: repo.html_url,
        }));

        return respondWithSuccess(res, { repositories: formattedRepos });
    } catch (error) {
        const status = error.message === 'GitHub account not connected' ? 404 : 502;
        const message = error.message === 'GitHub account not connected' 
            ? 'Please connect a GitHub account first' 
            : 'Failed to fetch GitHub repositories';
        
        return respondWithError(res, status, message);
    }
};

export const getBranches = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        if (!owner || !repo) {
            return respondWithError(res, 400, 'Owner and repository name are required');
        }

        const connection = await getGitHubConnection(req.user._id);
        const branches = await getRepositoryBranches(connection.accessToken, owner, repo);
        
        return respondWithSuccess(res, { 
            branches: branches.map((branch) => ({
                name: branch.name,
                sha: branch.commit?.sha,
                protected: branch.protected || false
            }))
        });
    } catch (error) {
        if (error.message === 'GitHub account not connected') {
            return respondWithError(res, 404, 'Please connect a GitHub account first');
        }
        console.error('Failed to fetch branches:', error);
        return respondWithError(res, 502, 'Failed to load repository branches');
    }
};

export const getRepositoryFiles = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const { branch = 'HEAD' } = req.query;

        if (!owner || !repo) {
            return respondWithError(res, 400, 'Owner and repository name are required');
        }

        const connection = await getGitHubConnection(req.user._id);
        const treeResponse = await getRepositoryTree(connection.accessToken, owner, repo, branch);
        
        const files = (treeResponse.tree || [])
            .filter((item) => item.type === 'blob')
            .slice(0, 1000)
            .map((item) => ({ 
                path: item.path, 
                size: item.size || 0,
                url: item.url 
            }));

        return respondWithSuccess(res, { 
            files, 
            truncated: files.length === 1000 
        });
    } catch (error) {
        if (error.message === 'GitHub account not connected') {
            return respondWithError(res, 404, 'Please connect a GitHub account first');
        }
        console.error('Failed to fetch repository files:', error);
        return respondWithError(res, 502, 'Failed to load repository file tree');
    }
};

export const getRepositoryFile = async (req, res) => {
    try {
        const { owner, repo } = req.params;
        const { path, branch } = req.query;

        if (!path || typeof path !== 'string') {
            return respondWithError(res, 400, 'A valid file path is required');
        }

        if (!owner || !repo) {
            return respondWithError(res, 400, 'Owner and repository name are required');
        }

        const connection = await getGitHubConnection(req.user._id);
        const file = await getFileContent(connection.accessToken, owner, repo, path, branch);

        if (!file.content) {
            return respondWithError(res, 404, 'File content not available');
        }

        if (file.size > MAX_FILE_SIZE) {
            return respondWithError(res, 413, `File size exceeds ${MAX_FILE_SIZE / 1000}KB limit for AI review`);
        }

        const content = Buffer.from(file.content, 'base64').toString('utf8');
        
        return respondWithSuccess(res, {
            path: file.path,
            content,
            size: file.size,
            encoding: file.encoding
        });
    } catch (error) {
        if (error.message === 'GitHub account not connected') {
            return respondWithError(res, 404, 'Please connect a GitHub account first');
        }
        console.error('Failed to fetch file content:', error);
        return respondWithError(res, 502, 'Failed to load file content');
    }
};

export const disconnectGitHub = async (req, res) => {
    try {
        const result = await GithubConnection.deleteOne({ user: req.user._id });
        
        if (result.deletedCount === 0) {
            return respondWithSuccess(res, { message: 'No GitHub account was connected' });
        }

        return respondWithSuccess(res, { message: 'GitHub account disconnected successfully' });
    } catch (error) {
        console.error('Failed to disconnect GitHub:', error);
        return respondWithError(res, 500, 'Failed to disconnect GitHub account');
    }
};

export const reviewRepository = async (req, res) => {
    try {
        const { owner, repo, branch, files: selectedFiles } = req.body;

        if (!owner || !repo) {
            return respondWithError(res, 400, 'Owner and repository name are required');
        }

        const connection = await getGitHubConnection(req.user._id);
        const accessToken = connection.accessToken;

        // Get repository tree
        const treeResp = await getRepositoryTree(accessToken, owner, repo, branch || 'HEAD');
        const tree = treeResp.tree || [];

        // Filter and select code files
        let codeFiles = tree.filter((item) => 
            item.type === 'blob' && 
            CODE_EXTENSIONS.some((ext) => item.path.endsWith(ext)) &&
            (!item.size || item.size <= MAX_FILE_SIZE)
        );

        if (selectedFiles && Array.isArray(selectedFiles) && selectedFiles.length > 0) {
            codeFiles = codeFiles.filter((file) => selectedFiles.includes(file.path));
        }

        if (codeFiles.length === 0) {
            return respondWithError(res, 404, 'No reviewable code files found in the repository');
        }

        // Limit files for review
        const filesToReview = codeFiles.slice(0, MAX_FILES_PER_REVIEW);

        // Fetch file contents
        const fileContents = [];
        for (const file of filesToReview) {
            try {
                const fileResp = await getFileContent(accessToken, owner, repo, file.path, branch || undefined);
                if (fileResp.content) {
                    const content = Buffer.from(fileResp.content, 'base64').toString('utf8');
                    fileContents.push({ path: file.path, content });
                }
            } catch (err) {
                console.warn(`Failed to fetch file: ${file.path}`, err.message);
            }
        }

        if (fileContents.length === 0) {
            return respondWithError(res, 502, 'Failed to fetch any repository files');
        }

        // Detect language
        const language = detectLanguage(fileContents);

        // Chunk files for AI review
        const chunks = [];
        for (let i = 0; i < fileContents.length; i += CHUNK_SIZE) {
            chunks.push(fileContents.slice(i, i + CHUNK_SIZE));
        }

        // Perform AI review on chunks
        const aggregated = {
            scoreSum: 0,
            scoreCount: 0,
            categoriesSum: {},
            categoriesCount: 0,
            summaryParts: [],
            bugs: [],
            securityIssues: [],
            performanceIssues: [],
            suggestions: [],
            improvedCodeParts: [],
        };

        for (const chunk of chunks) {
            const chunkCombined = chunk.map((f) => `// FILE: ${f.path}\n${f.content}`).join('\n\n');
            try {
                const chunkResult = await reviewCode(chunkCombined, language);
                
                // Aggregate scores
                if (typeof chunkResult.score === 'number') {
                    aggregated.scoreSum += chunkResult.score;
                    aggregated.scoreCount++;
                }

                // Aggregate categories
                if (chunkResult.categories) {
                    aggregated.categoriesCount++;
                    for (const [key, value] of Object.entries(chunkResult.categories)) {
                        if (typeof value === 'number') {
                            aggregated.categoriesSum[key] = (aggregated.categoriesSum[key] || 0) + value;
                        }
                    }
                }

                // Aggregate other results
                if (chunkResult.summary) aggregated.summaryParts.push(chunkResult.summary);
                if (Array.isArray(chunkResult.bugs)) {
                    aggregated.bugs.push(...chunkResult.bugs.map((b) => ({ ...b, file: b.file || chunk[0]?.path })));
                }
                if (Array.isArray(chunkResult.securityIssues)) {
                    aggregated.securityIssues.push(...chunkResult.securityIssues.map((s) => ({ ...s, file: s.file || chunk[0]?.path })));
                }
                if (Array.isArray(chunkResult.performanceIssues)) {
                    aggregated.performanceIssues.push(...chunkResult.performanceIssues.map((p) => ({ ...p, file: p.file || chunk[0]?.path })));
                }
                if (Array.isArray(chunkResult.suggestions)) {
                    aggregated.suggestions.push(...chunkResult.suggestions);
                }
                if (chunkResult.improvedCode) {
                    aggregated.improvedCodeParts.push(chunkResult.improvedCode);
                }
            } catch (err) {
                console.warn('AI chunk review failed:', err.message);
                // Continue with next chunk
            }
        }

        // Calculate final scores
        const finalScore = aggregated.scoreCount > 0 
            ? Math.round(aggregated.scoreSum / aggregated.scoreCount) 
            : 0;

        const finalCategories = {};
        if (aggregated.categoriesCount > 0) {
            for (const [key, value] of Object.entries(aggregated.categoriesSum)) {
                finalCategories[key] = Math.round(value / aggregated.categoriesCount);
            }
        }

        const finalImprovedCode = aggregated.improvedCodeParts.join('\n\n// ---- CHUNK BREAK ----\n\n');

        // Save review to database
        const reviewDoc = await CodeReview.create({
            user: req.user._id,
            project: null,
            language,
            code: fileContents.slice(0, 20).map((f) => `// FILE: ${f.path}\n${f.content}`).join('\n\n'),
            score: finalScore,
            categories: {
                security: finalCategories.security || 0,
                performance: finalCategories.performance || 0,
                quality: finalCategories.quality || 0,
                maintainability: finalCategories.maintainability || 0,
                readability: finalCategories.readability || 85,
                bestPractices: finalCategories.bestPractices || 80,
            },
            summary: aggregated.summaryParts.join('\n\n'),
            bugs: aggregated.bugs,
            securityIssues: aggregated.securityIssues,
            performanceIssues: aggregated.performanceIssues,
            suggestions: aggregated.suggestions,
            improvedCode: finalImprovedCode || '',
        });

        // Create history entry
        try {
            await ReviewHistory.create({
                user: req.user._id,
                review: reviewDoc._id,
                project: null,
                language: reviewDoc.language,
                score: reviewDoc.score,
                status: 'completed'
            });
        } catch (err) {
            console.warn('Failed to create history entry:', err.message);
        }

        const payload = buildReviewResponse(reviewDoc.toObject(), null);

        return respondWithSuccess(res, {
            message: 'Repository reviewed successfully',
            review: payload
        }, 201);
    } catch (error) {
        if (error.message === 'GitHub account not connected') {
            return respondWithError(res, 404, 'Please connect a GitHub account first');
        }
        console.error('Repository review failed:', error);
        return respondWithError(res, 500, 'Failed to review repository');
    }
};