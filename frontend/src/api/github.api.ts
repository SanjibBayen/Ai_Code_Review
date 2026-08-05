import apiClient from './axios';

export const githubApi = {
  connectGitHub: async () => {
    const res = await apiClient.post('/github/connect');
    return res.data;
  },

  getGitHubUser: async () => {
    const res = await apiClient.get('/github/user');
    return res.data;
  },

  getRepositories: async () => {
    const res = await apiClient.get('/github/repositories');
    return res.data;
  },

  getBranches: async (owner: string, repo: string) => {
    const res = await apiClient.get(`/github/repos/${owner}/${repo}/branches`);
    return res.data;
  },

  getRepositoryTree: async (owner: string, repo: string, branch?: string) => {
    const res = await apiClient.get(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/tree`, { params: { branch } });
    return res.data;
  },

  getRepositoryFile: async (owner: string, repo: string, path: string, branch?: string) => {
    const res = await apiClient.get(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/file`, { params: { path, branch } });
    return res.data;
  },

  reviewRepository: async (owner: string, repo: string, branch?: string) => {
    const res = await apiClient.post('/github/review', { owner, repo, branch });
    return res.data;
  },

  disconnectGitHub: async () => {
    const res = await apiClient.delete('/github/disconnect');
    return res.data;
  }
};
