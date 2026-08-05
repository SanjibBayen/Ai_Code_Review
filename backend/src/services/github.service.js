import axios from 'axios';

const githubApi = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    },
});

const authHeaders = (accessToken) => ({
    Authorization: `token ${accessToken}`,
});

export const exchangeOAuthCode = async (code) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('GitHub OAuth is not configured on the server');
    }

    const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
            client_id: clientId,
            client_secret: clientSecret,
            code,
        },
        { headers: { Accept: 'application/json' } }
    );

    if (!response.data.access_token) {
        throw new Error(response.data.error_description || 'GitHub did not return an access token');
    }

    return response.data.access_token;
};

export const getAuthenticatedUser = async (accessToken) => {
    const response = await githubApi.get('/user', { headers: authHeaders(accessToken) });
    return response.data;
};

export const getRepositories = async (accessToken) => {
    const response = await githubApi.get('/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member', {
        headers: authHeaders(accessToken),
    });

    return response.data;
};

export const getRepositoryBranches = async (accessToken, owner, repo) => {
    const response = await githubApi.get(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches?per_page=100`,
        { headers: authHeaders(accessToken) }
    );
    return response.data;
};

export const getRepositoryTree = async (accessToken, owner, repo, branch = 'HEAD') => {
    // Get the recursive tree for the branch (limit depth via per GitHub API)
    const response = await githubApi.get(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`, {
        headers: authHeaders(accessToken),
    });
    return response.data;
};

export const getFileContent = async (accessToken, owner, repo, path, ref) => {
    const url = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;
    const response = await githubApi.get(url, { headers: authHeaders(accessToken) });
    // content is base64-encoded for files
    return response.data;
};
