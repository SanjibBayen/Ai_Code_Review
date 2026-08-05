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

const stateSecret = process.env.JWT_SECRET || 'development-secret';
const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:5000/api/github/callback';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const respondWithError = (res, status, message) => res.status(status).json({ success: false, message });

const githubUserPayload = (connection) => ({
    connected: true,
    username: connection.username,
    avatar: connection.avatarUrl,
    connectedAt: connection.createdAt,
});

const redirectToClient = (res, status) => {
    const url = new URL('/github', clientUrl);
    url.searchParams.set('connection', status);
    return res.redirect(url.toString());
};

export const connectGitHub = async (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
        return respondWithError(res, 503, 'GitHub OAuth is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to the backend environment.');
    }

    const state = jwt.sign({ userId: req.user._id.toString(), purpose: 'github-oauth' }, stateSecret, { expiresIn: '10m' });
    const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('redirect_uri', redirectUri);
    authorizeUrl.searchParams.set('scope', 'read:user repo');
    authorizeUrl.searchParams.set('state', state);

    return res.status(200).json({ success: true, authorizationUrl: authorizeUrl.toString() });
};

export const githubOAuthCallback = async (req, res) => {
    const { code, state, error } = req.query;
    if (error || !code || !state) {
        return redirectToClient(res, 'failed');
    }

    try {
        const payload = jwt.verify(state, stateSecret);
        if (payload.purpose !== 'github-oauth' || !payload.userId) {
            return redirectToClient(res, 'failed');
        }

        const accessToken = await exchangeOAuthCode(code);
        const githubUser = await getAuthenticatedUser(accessToken);
        await GithubConnection.findOneAndUpdate(
            { user: payload.userId },
            {
                githubId: String(githubUser.id),
                username: githubUser.login,
                accessToken,
                avatarUrl: githubUser.avatar_url || '',
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        return redirectToClient(res, 'success');
    } catch (callbackError) {
        console.error('GitHub OAuth callback failed:', callbackError.message);
        return redirectToClient(res, 'failed');
    }
};

export const getGitHubUser = async (req, res) => {
    try {
        const connection = await GithubConnection.findOne({ user: req.user._id });
        return res.status(200).json({
            success: true,
            connected: Boolean(connection),
            user: connection ? githubUserPayload(connection) : null,
        });
    } catch (error) {
        return respondWithError(res, 500, 'Failed to fetch GitHub status');
    }
};

export const getGithubRepos = async (req, res) => {
    try {
        const connection = await GithubConnection.findOne({ user: req.user._id });
        if (!connection) return respondWithError(res, 404, 'Connect a GitHub account first');

        const repositories = await getRepositories(connection.accessToken);
        return res.status(200).json({
            success: true,
            repositories: repositories.map((repo) => ({
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                description: repo.description || '',
                language: repo.language || 'Unknown',
                stars: repo.stargazers_count || 0,
                forks: repo.forks_count || 0,
                updated_at: repo.updated_at,
                default_branch: repo.default_branch,
            })),
        });
    } catch (error) {
        // This is an expired GitHub token, not an expired application session.
        // Do not return 401 here or the frontend auth interceptor would log out
        // the signed-in user.
        const status = error.response?.status === 401 ? 409 : 502;
        return respondWithError(res, status, 'Unable to load GitHub repositories. Reconnect your GitHub account and try again.');
    }
};

export const getBranches = async (req, res) => {
    try {
        const connection = await GithubConnection.findOne({ user: req.user._id });
        if (!connection) return respondWithError(res, 404, 'Connect a GitHub account first');
        const branches = await getRepositoryBranches(connection.accessToken, req.params.owner, req.params.repo);
        return res.status(200).json({ success: true, branches: branches.map((branch) => branch.name) });
    } catch (error) {
        return respondWithError(res, 502, 'Unable to load repository branches');
    }
};

export const getRepositoryFiles = async (req, res) => {
    try {
        const connection = await GithubConnection.findOne({ user: req.user._id });
        if (!connection) return respondWithError(res, 404, 'Connect a GitHub account first');

        const treeResponse = await getRepositoryTree(
            connection.accessToken,
            req.params.owner,
            req.params.repo,
            req.query.branch || 'HEAD'
        );
        const files = (treeResponse.tree || [])
            .filter((item) => item.type === 'blob')
            .slice(0, 1_000)
            .map((item) => ({ path: item.path, size: item.size || 0 }));

        return res.status(200).json({ success: true, files, truncated: files.length === 1_000 });
    } catch (error) {
        return respondWithError(res, 502, 'Unable to load the repository file tree');
    }
};

export const getRepositoryFile = async (req, res) => {
    try {
        const { path, branch } = req.query;
        if (typeof path !== 'string' || !path) return respondWithError(res, 400, 'A file path is required');

        const connection = await GithubConnection.findOne({ user: req.user._id });
        if (!connection) return respondWithError(res, 404, 'Connect a GitHub account first');

        const file = await getFileContent(connection.accessToken, req.params.owner, req.params.repo, path, branch);
        if (!file.content || file.size > 50_000) {
            return respondWithError(res, 413, 'This file is too large to open for AI review. Choose a file under 50 KB.');
        }

        return res.status(200).json({
            success: true,
            path: file.path,
            content: Buffer.from(file.content, 'base64').toString('utf8'),
        });
    } catch (error) {
        return respondWithError(res, 502, 'Unable to load the requested repository file');
    }
};

export const disconnectGitHub = async (req, res) => {
    try {
        await GithubConnection.deleteOne({ user: req.user._id });
        return res.status(200).json({ success: true, message: 'GitHub account disconnected successfully' });
    } catch (error) {
        return respondWithError(res, 500, 'Failed to disconnect GitHub');
    }
};

export const reviewRepository = async (req, res) => {
    try {
        const { owner, repo, branch } = req.body;
        if (!owner || !repo) return respondWithError(res, 400, 'owner and repo are required');

        const connection = await GithubConnection.findOne({ user: req.user._id });
        if (!connection) return respondWithError(res, 404, 'Connect a GitHub account first');

        const accessToken = connection.accessToken;
        // Get repo tree
        const treeResp = await getRepositoryTree(accessToken, owner, repo, branch || connection.default_branch || 'HEAD');
        const tree = treeResp.tree || [];

        // Filter files by common code extensions and exclude large/binary-looking files
        const exts = ['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.java', '.c', '.cpp', '.cs', '.rs', '.rb'];
        const codeFiles = tree.filter((item) => item.type === 'blob' && exts.some((e) => item.path.endsWith(e)));

        if (codeFiles.length === 0) return respondWithError(res, 404, 'No code files found in repository');

        // Limit number of files and total bytes to avoid huge requests
        const MAX_FILES = 10;
        const selected = codeFiles.slice(0, MAX_FILES);

        const contents = [];
        for (const file of selected) {
            try {
                const fileResp = await getFileContent(accessToken, owner, repo, file.path, branch || undefined);
                // API returns content base64 when file
                const fileContent = fileResp.content ? Buffer.from(fileResp.content, 'base64').toString('utf8') : '';
                contents.push({ path: file.path, content: fileContent });
            } catch (err) {
                console.warn('Failed to fetch file', file.path, err.message);
            }
        }

        if (contents.length === 0) return respondWithError(res, 502, 'Unable to fetch repository files');

        // Concatenate files with separators for context
        const combined = contents.map((f) => `// FILE: ${f.path}\n${f.content}`).join('\n\n');

        // Choose language heuristically based on most common extension
        const extCount = {};
        for (const f of contents) {
            const ext = f.path.split('.').pop()?.toLowerCase() || 'txt';
            extCount[ext] = (extCount[ext] || 0) + 1;
        }
        const mostCommonExt = Object.entries(extCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'js';
        const language = {
            js: 'javascript',
            ts: 'typescript',
            py: 'python',
            go: 'go',
            java: 'java',
            c: 'c',
            cpp: 'cpp',
            cs: 'csharp',
            rs: 'rust',
            rb: 'ruby',
        }[mostCommonExt] || 'javascript';

        // Chunk files into manageable batches and run per-chunk AI reviews, then aggregate
        const MAX_TOTAL_FILES = 100; // overall cap
        const CHUNK_SIZE = 5; // files per AI call
        const selectedLimited = codeFiles.slice(0, MAX_TOTAL_FILES);

        const fileContents = [];
        for (const file of selectedLimited) {
            try {
                const fileResp = await getFileContent(accessToken, owner, repo, file.path, branch || undefined);
                const fileContent = fileResp.content ? Buffer.from(fileResp.content, 'base64').toString('utf8') : '';
                fileContents.push({ path: file.path, content: fileContent });
            } catch (err) {
                console.warn('Failed to fetch file', file.path, err.message);
            }
        }

        if (fileContents.length === 0) return respondWithError(res, 502, 'Unable to fetch repository files');

        // Prepare chunks
        const chunks = [];
        for (let i = 0; i < fileContents.length; i += CHUNK_SIZE) {
            chunks.push(fileContents.slice(i, i + CHUNK_SIZE));
        }

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
                // accumulate score
                if (typeof chunkResult.score === 'number') {
                    aggregated.scoreSum += chunkResult.score;
                    aggregated.scoreCount += 1;
                }

                // accumulate categories
                if (chunkResult.categories) {
                    aggregated.categoriesCount += 1;
                    for (const [k, v] of Object.entries(chunkResult.categories)) {
                        aggregated.categoriesSum[k] = (aggregated.categoriesSum[k] || 0) + (typeof v === 'number' ? v : 0);
                    }
                }

                if (chunkResult.summary) aggregated.summaryParts.push(chunkResult.summary);
                if (Array.isArray(chunkResult.bugs)) aggregated.bugs.push(...chunkResult.bugs.map((b) => ({ ...b, file: b.file || chunk[0]?.path })));
                if (Array.isArray(chunkResult.securityIssues)) aggregated.securityIssues.push(...chunkResult.securityIssues.map((s) => ({ ...s, file: s.file || chunk[0]?.path })));
                if (Array.isArray(chunkResult.performanceIssues)) aggregated.performanceIssues.push(...chunkResult.performanceIssues.map((p) => ({ ...p, file: p.file || chunk[0]?.path })));
                if (Array.isArray(chunkResult.suggestions)) aggregated.suggestions.push(...chunkResult.suggestions);
                if (chunkResult.improvedCode) aggregated.improvedCodeParts.push(chunkResult.improvedCode);
            } catch (err) {
                console.warn('AI chunk review failed for a chunk:', err.message);
                // continue with next chunk
            }
        }

        const finalScore = aggregated.scoreCount > 0 ? Math.round(aggregated.scoreSum / aggregated.scoreCount) : 0;
        const finalCategories = {};
        if (aggregated.categoriesCount > 0) {
            for (const [k, v] of Object.entries(aggregated.categoriesSum)) {
                finalCategories[k] = Math.round(v / aggregated.categoriesCount);
            }
        }

        const finalImprovedCode = aggregated.improvedCodeParts.join('\n\n// ---- CHUNK BREAK ----\n\n');

        // Persist aggregated CodeReview
        const reviewDoc = await CodeReview.create({
            user: req.user._id,
            project: null,
            language,
            code: fileContents.slice(0, 20).map((f) => `// FILE: ${f.path}\n${f.content}`).join('\n\n'), // store sample of files for reference
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

        // create history entry
        try {
            await ReviewHistory.create({ user: req.user._id, review: reviewDoc._id, project: null, language: reviewDoc.language, score: reviewDoc.score, status: 'completed' });
        } catch (err) {
            console.warn('Failed to create history entry', err.message);
        }

        const payload = buildReviewResponse(reviewDoc.toObject(), null);

        return res.status(201).json({ success: true, message: 'Repository reviewed successfully', review: payload });
    } catch (error) {
        console.error('Review repository failed:', error);
        return respondWithError(res, 500, 'Failed to review repository', error.message);
    }
};
