import React, { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { 
  FolderGit2, 
  Code2, 
  AlertOctagon, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  GitBranch, 
  History as HistoryIcon,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { projects, fetchProjects, selectProject } = useProjectStore();
  const { runReview } = useReviewStore();
  const { setActiveSection } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#161b22] border border-[#30363d] rounded-lg">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Good morning, {user?.name || 'Developer'}</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Review your code, monitor projects, and ship with confidence using automated AI analysis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => {
              setActiveSection('review');
              navigate('/review');
            }}
          >
            Start Code Review
          </Button>
        </div>
      </div>

      {/* Top Statistic Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 bg-[#161b22] border border-[#30363d] rounded-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{projects.length || 3}</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Active codebases</span>
        </div>

        <div className="p-3.5 bg-[#161b22] border border-[#30363d] rounded-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Total Reviews</span>
            <Code2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">248</div>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">+18 this week</span>
        </div>

        <div className="p-3.5 bg-[#161b22] border border-[#30363d] rounded-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Critical Issues</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl font-bold font-mono text-red-400">1</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Requires attention</span>
        </div>

        <div className="p-3.5 bg-[#161b22] border border-[#30363d] rounded-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Issues Fixed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">142</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">92% resolution rate</span>
        </div>

        <div className="p-3.5 bg-[#161b22] border border-[#30363d] rounded-lg col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Review Score</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-400">92%</div>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">Healthy Quality</span>
        </div>
      </div>

      {/* Quick Action Command Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setActiveSection('review');
            navigate('/review');
          }}
          className="p-3.5 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-lg text-left transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-950/80 border border-blue-800/60 rounded text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-200 block group-hover:text-white">Review Code</span>
              <span className="text-[10px] text-gray-400">Run AI Analysis</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-gray-500 bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#30363d]">
            Ctrl+R
          </span>
        </button>

        <button
          onClick={() => {
            setActiveSection('github');
            navigate('/github');
          }}
          className="p-3.5 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-lg text-left transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950/80 border border-emerald-800/60 rounded text-emerald-400">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-200 block group-hover:text-white">Connect GitHub</span>
              <span className="text-[10px] text-gray-400">Sync Repositories</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-gray-500 bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#30363d]">
            Ctrl+4
          </span>
        </button>

        <button
          onClick={() => {
            setActiveSection('history');
            navigate('/history');
          }}
          className="p-3.5 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-lg text-left transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-950/80 border border-purple-800/60 rounded text-purple-400">
              <HistoryIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-200 block group-hover:text-white">View History</span>
              <span className="text-[10px] text-gray-400">Past Audit Logs</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-gray-500 bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#30363d]">
            Ctrl+5
          </span>
        </button>

        <button
          onClick={() => {
            setActiveSection('projects');
            navigate('/projects');
          }}
          className="p-3.5 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-lg text-left transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-950/80 border border-amber-800/60 rounded text-amber-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-200 block group-hover:text-white">Projects Explorer</span>
              <span className="text-[10px] text-gray-400">Manage Repos</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-gray-500 bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#30363d]">
            Ctrl+2
          </span>
        </button>
      </div>

      {/* Main Grid: Recent Projects & Recent Reviews Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#30363d]">
              <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-blue-400" />
                <span>Recent Projects</span>
              </h3>
              <button
                onClick={() => {
                  setActiveSection('projects');
                  navigate('/projects');
                }}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => {
                    selectProject(proj);
                    navigate(`/projects/${proj.id}`);
                  }}
                  className="p-3 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] rounded-md transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-gray-200">{proj.name}</h4>
                    <p className="text-[10px] text-gray-500 font-mono">{proj.repository}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-gray-400 bg-[#161b22] px-1.5 py-0.2 rounded font-mono">
                        {proj.language}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Branch: {proj.branch}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-blue-400 block">{proj.score}%</span>
                    <Badge variant={proj.status === 'Healthy' ? 'success' : 'warning'} size="sm">
                      {proj.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reviews Timeline */}
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#30363d]">
            <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 text-purple-400" />
              <span>Recent AI Review Audits</span>
            </h3>
            <button
              onClick={() => {
                setActiveSection('history');
                navigate('/history');
              }}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>View logs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 font-sans">
            <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-200 font-mono">Review #rev-1092</span>
                <span className="text-[10px] text-gray-500 font-mono">12 mins ago</span>
              </div>
              <p className="text-xs text-gray-400">Project: <span className="text-gray-200 font-medium">AI-Code-Review</span></p>
              <div className="flex items-center gap-2 text-[10px]">
                <Badge variant="danger">0 Critical</Badge>
                <Badge variant="warning">1 Warning</Badge>
                <Badge variant="info">2 Suggestions</Badge>
              </div>
            </div>

            <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-200 font-mono">Review #rev-1091</span>
                <span className="text-[10px] text-gray-500 font-mono">4 hours ago</span>
              </div>
              <p className="text-xs text-gray-400">Project: <span className="text-gray-200 font-medium">E-Commerce Core API</span></p>
              <div className="flex items-center gap-2 text-[10px]">
                <Badge variant="danger">1 Critical SQLi</Badge>
                <Badge variant="warning">2 Warnings</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
