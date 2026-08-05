import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useReviewStore } from '../../store/reviewStore';
import { useGitHubStore } from '../../store/githubStore';
import { 
  FolderGit2, 
  ChevronDown, 
  ChevronRight, 
  FileCode, 
  Plus, 
  Search, 
  Play, 
  GitBranch, 
  Sparkles,
  Layers,
  History as HistoryIcon,
  Filter,
  CheckCircle2,
  AlertOctagon,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FileItem } from '../../types';

export const Sidebar: React.FC<{ onNewProjectClick: () => void }> = ({ onNewProjectClick }) => {
  const { activeSection, sidebarOpen } = useUIStore();
  const { projects, selectedProject, selectProject } = useProjectStore();
  const { openFiles, activeFile, openFile, runReview, reviewLoading } = useReviewStore();
  const { repositories, branches, selectedBranch, setSelectedBranch, selectedRepo, repositoryFiles, repositoryLoading, openRepositoryFile } = useGitHubStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [treeExpanded, setTreeExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggleFolder = (path: string) => {
    setExpandedFolders((paths) => {
      const next = new Set(paths);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const renderRepositoryFiles = (items: FileItem[], depth = 0): React.ReactNode => items
    .filter((item) => item.type === 'folder' || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((item) => {
      const isFolder = item.type === 'folder';
      const isExpanded = expandedFolders.has(item.path);
      const isActive = activeFile?.path === item.path;
      return (
        <React.Fragment key={item.path}>
          <button
            onClick={async () => {
              if (isFolder) return toggleFolder(item.path);
              try {
                openFile(await openRepositoryFile(item));
              } catch {
                // The GitHub page and store retain the detailed API error.
              }
            }}
            style={{ paddingLeft: `${8 + depth * 12}px` }}
            className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 hover:bg-[#181818] transition-colors ${
              isActive ? 'bg-[#181818] text-[#C5A059] font-medium border-l-2 border-[#C5A059]' : 'text-[#D4CFC9]/70'
            }`}
          >
            {isFolder ? (isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#C5A059] shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />) : <FileCode className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />}
            <span className="truncate">{item.name}</span>
          </button>
          {isFolder && isExpanded && item.children && renderRepositoryFiles(item.children, depth + 1)}
        </React.Fragment>
      );
    });

  if (!sidebarOpen) return null;

  return (
    <div className="w-60 md:w-64 bg-[#111111] border-r border-[rgba(197,160,89,0.18)] flex flex-col h-full shrink-0 select-none text-xs md:static absolute left-12 md:left-0 top-0 bottom-0 z-40 shadow-2xl">
      {/* Dynamic Content based on section */}
      {activeSection === 'dashboard' && (
        <div className="flex flex-col h-full">
          <div className="px-3 py-2.5 border-b border-[rgba(197,160,89,0.18)] flex items-center justify-between font-medium text-[#D4CFC9] uppercase tracking-wider text-[11px]">
            <span className="font-serif tracking-widest text-[#C5A059]">COMMAND CENTER</span>
            <button 
              onClick={onNewProjectClick}
              className="p-1 hover:bg-[#1a1a1a] rounded text-[#D4CFC9]/60 hover:text-[#C5A059]"
              title="New Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 flex flex-col gap-2 border-b border-[rgba(197,160,89,0.18)]">
            <button 
              onClick={() => navigate('/review')}
              className="w-full flex items-center gap-2 px-3 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0A] rounded font-semibold shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run AI Review</span>
              <span className="ml-auto text-[10px] bg-[#0A0A0A]/20 px-1.5 py-0.5 rounded font-mono">Ctrl+R</span>
            </button>

            <button 
              onClick={onNewProjectClick}
              className="w-full flex items-center gap-2 px-3 py-1.5 bg-[#141414] hover:bg-[#1a1a1a] text-[#D4CFC9] rounded font-medium border border-[rgba(197,160,89,0.2)]"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>New Project</span>
              <span className="ml-auto text-[10px] text-[#D4CFC9]/50 font-mono">Ctrl+N</span>
            </button>
          </div>

          <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
            <span className="px-2 text-[10px] font-semibold text-[#C5A059]/80 uppercase tracking-wider block mb-1">
              Active Projects
            </span>
            <div className="flex flex-col gap-0.5">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    selectProject(p);
                    navigate(`/projects/${p.id}`);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between hover:bg-[#181818] transition-colors ${
                    selectedProject?.id === p.id ? 'bg-[#181818] text-[#C5A059] font-medium border-l-2 border-[#C5A059]' : 'text-[#D4CFC9]/80'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FolderGit2 className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                    <span className="truncate">{p.name}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    p.score >= 90 ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-[#2a1d0d] text-[#C5A059] border border-[rgba(197,160,89,0.3)]'
                  }`}>
                    {p.score}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'review' && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-3 py-2 border-b border-[rgba(197,160,89,0.18)] flex items-center justify-between text-[#D4CFC9] font-medium uppercase tracking-wider text-[11px]">
            <span className="font-serif text-[#C5A059] tracking-widest">EXPLORER</span>
            <button
              onClick={() => setTreeExpanded(!treeExpanded)}
              className="text-[#D4CFC9]/60 hover:text-[#C5A059]"
            >
              {treeExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick Filter */}
          <div className="px-2 py-1.5 border-b border-[rgba(197,160,89,0.18)]">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-2 text-[#C5A059]/60" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[rgba(197,160,89,0.2)] rounded pl-7 pr-2 py-1 text-[11px] text-[#D4CFC9] placeholder-[#D4CFC9]/40 focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* File Tree */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
            <div className="flex items-center gap-1.5 px-2 py-1 text-[#D4CFC9]/60 font-medium cursor-pointer hover:text-[#D4CFC9]">
              <FolderGit2 className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
              <span className="truncate font-semibold text-[#D4CFC9]">{selectedRepo?.name || 'Workspace'}</span>
            </div>

            <div className="flex flex-col gap-0.5">
              {repositoryLoading ? (
                <p className="px-2 py-2 text-[11px] text-[#D4CFC9]/50">Loading repository files…</p>
              ) : repositoryFiles.length > 0 ? renderRepositoryFiles(repositoryFiles) : openFiles
                .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((file) => {
                  const isActive = activeFile?.path === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => openFile(file)}
                      className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 hover:bg-[#181818] transition-colors ${
                        isActive ? 'bg-[#181818] text-[#C5A059] font-medium border-l-2 border-[#C5A059]' : 'text-[#D4CFC9]/70'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* AI Trigger in Explorer */}
          <div className="p-3 border-t border-[rgba(197,160,89,0.18)] bg-[#0A0A0A]">
            <button
              onClick={() => {
                if (activeFile) {
                  runReview({
                    code: activeFile.content || '',
                    fileName: activeFile.name,
                    language: activeFile.language || 'JavaScript'
                  });
                }
              }}
              disabled={reviewLoading || !activeFile}
              className="w-full py-1.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0A] rounded font-semibold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{reviewLoading ? 'Analyzing...' : 'Run AI Review'}</span>
            </button>
          </div>
        </div>
      )}

      {activeSection === 'projects' && (
        <div className="flex flex-col h-full">
          <div className="px-3 py-2.5 border-b border-[rgba(197,160,89,0.18)] flex items-center justify-between text-[#D4CFC9] font-medium uppercase tracking-wider text-[11px]">
            <span className="font-serif text-[#C5A059] tracking-widest">PROJECTS</span>
            <button onClick={onNewProjectClick} className="p-1 hover:bg-[#181818] rounded text-[#D4CFC9]/60 hover:text-[#C5A059]">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-2 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  selectProject(p);
                  navigate(`/projects/${p.id}`);
                }}
                className={`p-2 rounded border cursor-pointer transition-colors ${
                  selectedProject?.id === p.id 
                    ? 'bg-[#181818] border-[#C5A059] text-[#C5A059]' 
                    : 'bg-[#0A0A0A] border-[rgba(197,160,89,0.15)] text-[#D4CFC9]/80 hover:border-[#C5A059]/40'
                }`}
              >
                <div className="font-semibold truncate text-xs">{p.name}</div>
                <div className="text-[10px] text-[#D4CFC9]/50 truncate mt-0.5">{p.repository}</div>
                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <span className="text-[#D4CFC9]/60 font-mono">{p.language}</span>
                  <span className="text-[#C5A059] font-mono font-medium">{p.score}% Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'github' && (
        <div className="flex flex-col h-full">
          <div className="px-3 py-2.5 border-b border-[rgba(197,160,89,0.18)] font-medium text-[#D4CFC9] uppercase tracking-wider text-[11px]">
            <span className="font-serif text-[#C5A059] tracking-widest">GITHUB BRANCHES</span>
          </div>
          <div className="p-2">
            <label className="text-[10px] text-[#D4CFC9]/50 block mb-1">Active Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[rgba(197,160,89,0.25)] rounded p-1.5 text-[#D4CFC9] text-xs focus:border-[#C5A059]"
            >
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
            <span className="text-[10px] font-semibold text-[#C5A059]/80 uppercase tracking-wider block mb-1">Repositories</span>
            {repositories.map(r => (
              <div key={r.id} className="p-2 border-b border-[rgba(197,160,89,0.12)] hover:bg-[#181818] rounded cursor-pointer">
                <div className="text-xs font-medium text-[#D4CFC9] truncate">{r.name}</div>
                <div className="text-[10px] text-[#D4CFC9]/50">{r.language} • ⭐ {r.stars}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'history' && (
        <div className="flex flex-col h-full">
          <div className="px-3 py-2.5 border-b border-[rgba(197,160,89,0.18)] font-medium text-[#D4CFC9] uppercase tracking-wider text-[11px] flex items-center justify-between">
            <span className="font-serif text-[#C5A059] tracking-widest">HISTORY FILTERS</span>
            <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
          </div>
          <div className="p-3 flex flex-col gap-2 text-[#D4CFC9]">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input type="checkbox" defaultChecked className="rounded border-[rgba(197,160,89,0.3)] bg-[#0A0A0A] text-[#C5A059] accent-[#C5A059]" />
              <span>Critical Security Alerts</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input type="checkbox" defaultChecked className="rounded border-[rgba(197,160,89,0.3)] bg-[#0A0A0A] text-[#C5A059] accent-[#C5A059]" />
              <span>Performance Bottlenecks</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input type="checkbox" defaultChecked className="rounded border-[rgba(197,160,89,0.3)] bg-[#0A0A0A] text-[#C5A059] accent-[#C5A059]" />
              <span>Maintainability Refactors</span>
            </label>
          </div>
        </div>
      )}

      {(activeSection === 'analytics' || activeSection === 'settings') && (
        <div className="p-3 text-[#D4CFC9]/60 text-xs">
          <div className="font-semibold text-[#C5A059] font-serif uppercase tracking-wider text-[11px] mb-2">NAVIGATE</div>
          <p className="text-[11px] text-[#D4CFC9]/50">Configure engine heuristics, view developer velocity charts, or update workspace parameters.</p>
        </div>
      )}
    </div>
  );
};
