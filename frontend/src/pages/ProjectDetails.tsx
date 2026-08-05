import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { useReviewStore } from '../store/reviewStore';
import { 
  FolderGit2, 
  Sparkles, 
  GitBranch, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  History, 
  Settings, 
  FileCode,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedProject, fetchProjectById } = useProjectStore();
  const { setActiveSection } = useUIStore();
  const { runReview } = useReviewStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'history' | 'settings'>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProjectById(id);
    }
  }, [id, fetchProjectById]);

  if (!selectedProject) {
    return (
      <div className="flex-1 p-6 text-center text-xs text-gray-500">
        Loading project workspace...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#30363d]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-1.5 text-gray-400 hover:text-white rounded bg-[#161b22] border border-[#30363d]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">{selectedProject.name}</h1>
              <Badge variant="info">{selectedProject.language}</Badge>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedProject.repository}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => {
              setActiveSection('review');
              navigate('/review');
            }}
          >
            Run AI Code Review
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#30363d] text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'overview' ? 'border-blue-500 text-white font-semibold' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-3 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'files' ? 'border-blue-500 text-white font-semibold' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Codebase Files
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'history' ? 'border-blue-500 text-white font-semibold' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Audit History
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'settings' ? 'border-blue-500 text-white font-semibold' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quality Grades */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              <span className="text-gray-400 text-xs block">Code Quality Grade</span>
              <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                {selectedProject.score >= 90 ? 'A+' : selectedProject.score >= 80 ? 'B' : 'C'}
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block">Score: {selectedProject.score}%</span>
            </div>

            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              <span className="text-gray-400 text-xs block flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Security Rating
              </span>
              <div className="text-xl font-bold font-mono text-white mt-2">Passed</div>
              <span className="text-[10px] text-emerald-400 mt-1 block">0 Critical CVEs</span>
            </div>

            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              <span className="text-gray-400 text-xs block flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> Maintainability
              </span>
              <div className="text-xl font-bold font-mono text-white mt-2">Excellent</div>
              <span className="text-[10px] text-gray-500 mt-1 block">Low coupling</span>
            </div>

            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
              <span className="text-gray-400 text-xs block flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Performance
              </span>
              <div className="text-xl font-bold font-mono text-white mt-2">Optimized</div>
              <span className="text-[10px] text-gray-500 mt-1 block">Fast execution</span>
            </div>
          </div>

          {/* Details Card */}
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg space-y-3 text-xs">
            <h3 className="font-semibold text-gray-200 uppercase tracking-wider text-[11px]">Repository Metadata</h3>
            <div className="grid grid-cols-2 gap-4 text-gray-300 font-mono">
              <div>
                <span className="text-gray-500 block text-[10px]">Description</span>
                <span>{selectedProject.description}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Default Branch</span>
                <span>{selectedProject.branch}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Total Reviews Conducted</span>
                <span>{selectedProject.reviewsCount} audits</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Last Reviewed</span>
                <span>{selectedProject.lastReviewed}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'files' && (
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg text-xs space-y-2">
          <h3 className="font-semibold text-gray-200 mb-2">Indexed Source Files</h3>
          <div className="space-y-1">
            {['src/controllers/auth.controller.js', 'src/controllers/project.controller.js', 'src/services/aiReview.service.js', 'src/routes/auth.routes.js'].map(f => (
              <div key={f} className="p-2 bg-[#0d1117] border border-[#30363d] rounded flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>{f}</span>
                </div>
                <button
                  onClick={() => {
                    setActiveSection('review');
                    navigate('/review');
                  }}
                  className="text-blue-400 hover:underline text-[11px]"
                >
                  Review in IDE
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'history' || activeTab === 'settings') && (
        <div className="p-6 text-center text-xs text-gray-400 bg-[#161b22] border border-[#30363d] rounded-lg">
          Workspace parameters for {selectedProject.name} configured.
        </div>
      )}
    </div>
  );
};
