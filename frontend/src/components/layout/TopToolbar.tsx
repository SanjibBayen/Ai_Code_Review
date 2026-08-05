import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useGitHubStore } from '../../store/githubStore';
import { useReviewStore } from '../../store/reviewStore';
import { useAuthStore } from '../../store/authStore';
import { 
  GitBranch, 
  Sparkles, 
  Save, 
  Bell, 
  Command, 
  PanelLeft, 
  PanelBottom, 
  Github, 
  Search,
  Check,
  User,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TopToolbar: React.FC<{ onNewProjectClick: () => void }> = ({ onNewProjectClick }) => {
  const { toggleSidebar, toggleBottomPanel, setCommandPaletteOpen, notifications } = useUIStore();
  const { selectedProject } = useProjectStore();
  const { connected, selectedBranch } = useGitHubStore();
  const { activeFile, runReview, reviewLoading } = useReviewStore();
  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleRunReview = () => {
    if (activeFile) {
      runReview({
        code: activeFile.content || '',
        fileName: activeFile.name,
        language: activeFile.language || 'JavaScript'
      });
    } else {
      navigate('/review');
    }
  };

  return (
    <header className="h-10 bg-[#0A0A0A] border-b border-[rgba(197,160,89,0.18)] px-3 flex items-center justify-between z-20 shrink-0 select-none text-xs">
      {/* Left side: Sidebar toggles & Workspace context */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={toggleSidebar}
          title="Toggle Side Panel (Ctrl+B)"
          className="p-1.5 text-[#D4CFC9]/60 hover:text-[#C5A059] rounded hover:bg-[#141414] transition-colors shrink-0"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-[rgba(197,160,89,0.18)] shrink-0" />

        {/* Project & Branch Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[#D4CFC9] font-medium min-w-0 truncate">
          <span className="text-[#D4CFC9]/80 font-mono truncate max-w-[100px] sm:max-w-none">
            {selectedProject ? selectedProject.name : 'AI-Code-Review'}
          </span>
          <span className="text-[#D4CFC9]/30 hidden sm:inline">/</span>
          <div className="hidden sm:flex items-center gap-1 bg-[#141414] px-2 py-0.5 rounded border border-[rgba(197,160,89,0.2)] text-[11px] text-[#C5A059] shrink-0">
            <GitBranch className="w-3 h-3 text-[#C5A059]" />
            <span className="font-mono">{selectedBranch || 'main'}</span>
          </div>
        </div>
      </div>

      {/* Middle: Command Palette Launcher */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden md:flex items-center gap-2 bg-[#111111] hover:bg-[#161616] border border-[rgba(197,160,89,0.18)] text-[#D4CFC9]/60 px-3 py-1 rounded text-xs w-64 max-w-xs transition-colors"
      >
        <Search className="w-3.5 h-3.5 text-[#C5A059]/70" />
        <span className="flex-1 text-left">Search commands or files...</span>
        <span className="flex items-center gap-0.5 bg-[#0A0A0A] px-1.5 py-0.2 rounded border border-[rgba(197,160,89,0.2)] text-[10px] font-mono text-[#C5A059]">
          <Command className="w-2.5 h-2.5" /> K
        </span>
      </button>

      {/* Right side: Actions, Run Review, Status & User Menu */}
      <div className="flex items-center gap-2">
        {/* Run AI Review Primary Button */}
        <button
          onClick={handleRunReview}
          disabled={reviewLoading}
          className="flex items-center gap-1.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0A] font-semibold px-3 py-1 rounded shadow-sm shadow-[#C5A059]/10 transition-colors text-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{reviewLoading ? 'Reviewing...' : 'Run Review'}</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          title="Save file (Ctrl+S)"
          className="p-1 text-[#D4CFC9]/60 hover:text-[#C5A059] rounded hover:bg-[#141414] transition-colors relative"
        >
          {savedSuccess ? (
            <Check className="w-4 h-4 text-emerald-400 animate-in zoom-in" />
          ) : (
            <Save className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={toggleBottomPanel}
          title="Toggle Bottom Terminal (Ctrl+J)"
          className="p-1 text-[#D4CFC9]/60 hover:text-[#C5A059] rounded hover:bg-[#141414] transition-colors"
        >
          <PanelBottom className="w-4 h-4" />
        </button>

        {/* GitHub Indicator */}
        <div 
          onClick={() => navigate('/github')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer border ${
            connected ? 'bg-[#1a231b] border-emerald-800/40 text-emerald-400' : 'bg-[#141414] border-[rgba(197,160,89,0.2)] text-[#D4CFC9]/60'
          }`}
          title={connected ? 'GitHub Connected' : 'Connect GitHub'}
        >
          <Github className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono hidden lg:inline">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="h-4 w-px bg-[rgba(197,160,89,0.18)]" />

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 p-0.5 rounded hover:bg-[#141414] transition-colors"
          >
            <div className="w-6 h-6 rounded bg-[#C5A059] flex items-center justify-center text-[10px] font-bold text-[#0A0A0A] overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0] || 'U'
              )}
            </div>
            <ChevronDown className="w-3 h-3 text-[#D4CFC9]/60" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-[#111111] border border-[rgba(197,160,89,0.25)] rounded shadow-2xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-[rgba(197,160,89,0.18)]">
                <p className="font-semibold text-[#D4CFC9]">{user?.name || 'Developer'}</p>
                <p className="text-[10px] text-[#D4CFC9]/50 truncate">{user?.email || 'uttammaji842@gmail.com'}</p>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-3 py-2 text-[#D4CFC9]/80 hover:bg-[#161616] hover:text-[#C5A059] flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-[#C5A059]/70" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 text-[#D4CFC9]/80 hover:bg-[#161616] hover:text-[#C5A059] flex items-center gap-2"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-[#C5A059]/70" />
                <span>Settings</span>
              </button>
              <div className="border-t border-[rgba(197,160,89,0.18)] my-1" />
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-950/40 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
