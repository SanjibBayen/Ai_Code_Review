import React from 'react';
import { useGitHubStore } from '../../store/githubStore';
import { useReviewStore } from '../../store/reviewStore';
import { GitBranch, Wifi, CheckCircle2, AlertCircle } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { selectedBranch } = useGitHubStore();
  const { activeFile, reviewLoading, reviewStep, currentReview } = useReviewStore();

  return (
    <footer className="h-6 bg-[#0A0A0A] border-t border-[rgba(197,160,89,0.18)] text-[#D4CFC9]/80 px-2 flex items-center justify-between z-20 shrink-0 select-none text-[11px] font-sans">
      {/* Left side: Branch, Sync status & File stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 hover:bg-[#141414] hover:text-[#C5A059] px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <GitBranch className="w-3 h-3 text-[#C5A059]" />
          <span className="font-mono">{selectedBranch || 'main'}</span>
        </div>

        <div className="flex items-center gap-1 hover:bg-[#141414] px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span>API Connected (200 OK)</span>
        </div>

        {reviewLoading && (
          <div className="flex items-center gap-1 bg-[#1a170d] text-[#C5A059] border border-[rgba(197,160,89,0.3)] px-2 py-0.5 rounded animate-pulse font-mono text-[10px]">
            <span>●</span>
            <span>{reviewStep}</span>
          </div>
        )}
      </div>

      {/* Right side: Editor stats, language & AI review status */}
      <div className="flex items-center gap-3">
        {currentReview && (
          <div className="flex items-center gap-1 bg-[#141414] border border-[rgba(197,160,89,0.2)] px-1.5 py-0.5 rounded font-mono text-[#C5A059]">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Score: {currentReview.overallScore}%</span>
          </div>
        )}

        <div className="hover:bg-[#141414] hover:text-[#C5A059] px-1.5 py-0.5 rounded cursor-pointer font-mono">
          Ln 42, Col 18
        </div>

        <div className="hover:bg-[#141414] hover:text-[#C5A059] px-1.5 py-0.5 rounded cursor-pointer font-mono uppercase">
          {activeFile?.language || 'JavaScript'}
        </div>

        <div className="hover:bg-[#141414] hover:text-[#C5A059] px-1.5 py-0.5 rounded cursor-pointer font-mono">
          UTF-8
        </div>
      </div>
    </footer>
  );
};
