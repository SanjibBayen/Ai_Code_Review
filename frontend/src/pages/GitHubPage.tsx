import React, { useEffect, useState } from 'react';
import { useGitHubStore } from '../store/githubStore';
import { useUIStore } from '../store/uiStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Github, 
  Search, 
  GitBranch, 
  Star, 
  GitFork, 
  Sparkles, 
  CheckCircle2, 
  Unlink, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const GitHubPage: React.FC = () => {
  const { connected, user, repositories, fetchStatus, fetchRepositories, loadRepositoryTree, connect, disconnect, loading, error } = useGitHubStore();
  const { setActiveSection, addNotification } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLang, setSelectedLang] = useState('ALL');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    const connection = searchParams.get('connection');
    if (!connection) return;

    addNotification({
      title: 'GitHub',
      message: connection === 'success' ? 'GitHub account connected successfully' : 'GitHub connection was cancelled or failed',
      type: connection === 'success' ? 'success' : 'error',
    });
    setSearchParams({}, { replace: true });
  }, [addNotification, searchParams, setSearchParams]);

  useEffect(() => {
    if (connected) {
      fetchRepositories();
    }
  }, [connected, fetchRepositories]);

  const filteredRepos = repositories.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = selectedLang === 'ALL' || r.language === selectedLang;
    return matchesSearch && matchesLang;
  });

  const languages = ['ALL', 'TypeScript', 'JavaScript', 'Python', 'Go'];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#161b22] border border-[#30363d] rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-white">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>GitHub Integration</span>
              {connected && <Badge variant="success">Connected</Badge>}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Connect your GitHub account to review repositories and pull requests directly.
            </p>
          </div>
        </div>

        <div>
          {connected ? (
            <Button
              variant="secondary"
              icon={<Unlink className="w-4 h-4 text-red-400" />}
              loading={loading}
              onClick={async () => {
                await disconnect();
                addNotification({ title: 'GitHub', message: 'Account disconnected', type: 'info' });
              }}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={<Github className="w-4 h-4" />}
              loading={loading}
              onClick={async () => {
                await connect();
              }}
            >
              Connect GitHub Account
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800/60 bg-red-950/40 px-4 py-3 text-xs text-red-200">
          <span className="font-semibold">GitHub connection issue: </span>{error}
        </div>
      )}

      {connected ? (
        <div className="space-y-4">
          {/* Controls & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs">
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  className={`px-2.5 py-1 rounded font-mono border transition-colors ${
                    selectedLang === lang 
                      ? 'bg-blue-600 text-white border-blue-500 font-medium' 
                      : 'bg-[#161b22] text-gray-400 border-[#30363d] hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Repository Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map(repo => (
              <div
                key={repo.id}
                className="p-4 bg-[#161b22] border border-[#30363d] hover:border-gray-600 rounded-lg transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-blue-400 group-hover:underline font-mono truncate">
                      {repo.full_name}
                    </h3>
                    <Badge variant="info" size="sm">{repo.language}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {repo.description || 'No repository description provided.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#30363d]/60 flex items-center justify-between text-xs text-gray-400 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {repo.stars}</span>
                    <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5 text-blue-400" /> {repo.forks}</span>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Sparkles className="w-3.5 h-3.5 text-blue-400" />}
                    onClick={async () => {
                      try {
                        addNotification({ title: 'GitHub', message: `Opening ${repo.name} in the Explorer…`, type: 'info' });
                        await loadRepositoryTree(repo);
                        setActiveSection('review');
                        navigate('/review');
                      } catch (err: any) {
                        addNotification({ title: 'GitHub', message: err?.response?.data?.message || 'Failed to open repository files', type: 'error' });
                      }
                    }}
                  >
                    Open in Explorer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-[#161b22] border border-[#30363d] rounded-lg space-y-3">
          <Github className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-sm font-semibold text-gray-200">No GitHub Account Connected</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Authorize AI Code Review to access your private and public repositories for automated pull request security reviews.
          </p>
          <Button
            variant="primary"
            icon={<Github className="w-4 h-4" />}
            onClick={() => connect()}
          >
            Connect GitHub
          </Button>
        </div>
      )}
    </div>
  );
};
