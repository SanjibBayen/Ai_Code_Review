import { create } from 'zustand';
import { FileItem, GitHubRepo, GitHubUser } from '../types';
import { githubApi } from '../api/github.api';

interface GitHubState {
  connected: boolean;
  user: GitHubUser | null;
  repositories: GitHubRepo[];
  selectedRepo: GitHubRepo | null;
  branches: string[];
  selectedBranch: string;
  repositoryFiles: FileItem[];
  repositoryLoading: boolean;
  loading: boolean;
  error: string | null;

  fetchStatus: () => Promise<void>;
  fetchRepositories: () => Promise<void>;
  fetchBranches: (owner: string, repo: string) => Promise<void>;
  loadRepositoryTree: (repo: GitHubRepo) => Promise<void>;
  openRepositoryFile: (file: FileItem) => Promise<FileItem>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setSelectedRepo: (repo: GitHubRepo | null) => void;
  setSelectedBranch: (branch: string) => void;
}

export const useGitHubStore = create<GitHubState>((set) => ({
  connected: false,
  user: null,
  repositories: [],
  selectedRepo: null,
  branches: ['main'],
  selectedBranch: 'main',
  repositoryFiles: [],
  repositoryLoading: false,
  loading: false,
  error: null,

  fetchStatus: async () => {
    try {
      const data = await githubApi.getGitHubUser();
      set({ connected: data.connected, user: data.user, error: null });
    } catch (err: any) {
      set({ connected: false, user: null, error: err.response?.data?.message || 'Failed to fetch GitHub status' });
    }
  },

  fetchRepositories: async () => {
    set({ loading: true, error: null });
    try {
      const data = await githubApi.getRepositories();
      set({ repositories: data.repositories || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch repositories', loading: false });
    }
  },

  fetchBranches: async (owner: string, repo: string) => {
    try {
      const data = await githubApi.getBranches(owner, repo);
      set({ branches: data.branches || ['main'], selectedBranch: data.branches?.[0] || 'main' });
    } catch {
      set({ branches: ['main', 'develop'] });
    }
  },

  loadRepositoryTree: async (repo) => {
    const [owner, repository] = repo.full_name.split('/');
    if (!owner || !repository) throw new Error('Invalid GitHub repository name');
    set({ repositoryLoading: true, error: null, selectedRepo: repo, selectedBranch: repo.default_branch || 'main' });
    try {
      const data = await githubApi.getRepositoryTree(owner, repository, repo.default_branch);
      const root: FileItem[] = [];
      for (const entry of data.files || []) {
        const parts = entry.path.split('/').filter(Boolean);
        let level = root;
        let currentPath = '';
        parts.forEach((part: string, index: number) => {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          const isFile = index === parts.length - 1;
          let item = level.find((node) => node.path === currentPath);
          if (!item) {
            item = {
              id: `github-${currentPath}`,
              name: part,
              path: currentPath,
              type: isFile ? 'file' : 'folder',
              language: isFile ? undefined : undefined,
              children: isFile ? undefined : [],
            };
            level.push(item);
          }
          if (!isFile) level = item.children!;
        });
      }
      set({ repositoryFiles: root, repositoryLoading: false });
    } catch (err: any) {
      set({ repositoryFiles: [], repositoryLoading: false, error: err.response?.data?.message || 'Unable to load repository files' });
      throw err;
    }
  },

  openRepositoryFile: async (file) => {
    const repo = useGitHubStore.getState().selectedRepo;
    const branch = useGitHubStore.getState().selectedBranch;
    if (!repo) throw new Error('Select a repository first');
    const [owner, repository] = repo.full_name.split('/');
    const data = await githubApi.getRepositoryFile(owner, repository, file.path, branch);
    const extension = file.name.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', py: 'python', java: 'java', c: 'c', cpp: 'cpp', cc: 'cpp', go: 'go', rs: 'rust', json: 'json', html: 'html', css: 'css' };
    return { ...file, language: languageMap[extension || ''] || 'plaintext', content: data.content };
  },

  connect: async () => {
    set({ loading: true });
    try {
      const data = await githubApi.connectGitHub();
      window.location.assign(data.authorizationUrl);
    } catch (err: any) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to connect GitHub' });
    }
  },

  disconnect: async () => {
    set({ loading: true });
    try {
      await githubApi.disconnectGitHub();
      set({ connected: false, user: null, repositories: [], repositoryFiles: [], selectedRepo: null, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to disconnect GitHub' });
    }
  },

  setSelectedRepo: (repo) => set({ selectedRepo: repo }),
  setSelectedBranch: (branch) => set({ selectedBranch: branch })
}));
