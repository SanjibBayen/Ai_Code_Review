import React from 'react';
import { useUIStore, BottomTab } from '../../store/uiStore';
import { useReviewStore } from '../../store/reviewStore';
import { 
  AlertOctagon, 
  Terminal as TerminalIcon, 
  FileText, 
  Sparkles, 
  X, 
  Maximize2, 
  Minimize2,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const BottomPanel: React.FC = () => {
  const { bottomPanelOpen, toggleBottomPanel, bottomTab, setBottomTab } = useUIStore();
  const { currentReview, setSelectedIssue, selectedIssue } = useReviewStore();

  if (!bottomPanelOpen) return null;

  const issues = currentReview?.issues || [];
  const criticalCount = issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'ERROR').length;
  const warningCount = issues.filter(i => i.severity === 'WARNING').length;
  const suggestionCount = issues.filter(i => i.severity === 'SUGGESTION' || i.severity === 'INFO').length;

  return (
    <div className="h-44 sm:h-52 md:h-56 bg-[#111111] border-t border-[rgba(197,160,89,0.18)] flex flex-col shrink-0 text-xs font-mono select-none">
      {/* Panel Header & Tabs */}
      <div className="h-7 bg-[#0A0A0A] border-b border-[rgba(197,160,89,0.18)] px-2 sm:px-3 flex items-center justify-between overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setBottomTab('problems')}
            className={`px-2.5 py-1 flex items-center gap-1.5 border-b-2 font-sans transition-colors ${
              bottomTab === 'problems'
                ? 'border-[#C5A059] text-[#C5A059] font-semibold bg-[#111111]'
                : 'border-transparent text-[#D4CFC9]/60 hover:text-[#D4CFC9]'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>PROBLEMS</span>
            <span className="bg-[#141414] text-[#C5A059] border border-[rgba(197,160,89,0.2)] text-[10px] px-1.5 py-0.2 rounded font-mono">
              {issues.length}
            </span>
          </button>

          <button
            onClick={() => setBottomTab('review')}
            className={`px-2.5 py-1 flex items-center gap-1.5 border-b-2 font-sans transition-colors ${
              bottomTab === 'review'
                ? 'border-[#C5A059] text-[#C5A059] font-semibold bg-[#111111]'
                : 'border-transparent text-[#D4CFC9]/60 hover:text-[#D4CFC9]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>AI REVIEW</span>
            {currentReview && (
              <span className="bg-[#1c170d] text-[#C5A059] border border-[rgba(197,160,89,0.3)] text-[10px] px-1.5 py-0.2 rounded font-mono">
                {currentReview.overallScore}%
              </span>
            )}
          </button>

          <button
            onClick={() => setBottomTab('terminal')}
            className={`px-2.5 py-1 flex items-center gap-1.5 border-b-2 font-sans transition-colors ${
              bottomTab === 'terminal'
                ? 'border-[#C5A059] text-[#C5A059] font-semibold bg-[#111111]'
                : 'border-transparent text-[#D4CFC9]/60 hover:text-[#D4CFC9]'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>TERMINAL</span>
          </button>

          <button
            onClick={() => setBottomTab('output')}
            className={`px-2.5 py-1 flex items-center gap-1.5 border-b-2 font-sans transition-colors ${
              bottomTab === 'output'
                ? 'border-[#C5A059] text-[#C5A059] font-semibold bg-[#111111]'
                : 'border-transparent text-[#D4CFC9]/60 hover:text-[#D4CFC9]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>OUTPUT</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleBottomPanel}
            className="p-1 text-[#D4CFC9]/60 hover:text-[#C5A059] rounded hover:bg-[#141414]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-[#0A0A0A]">
        {bottomTab === 'problems' && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 text-[11px] text-[#D4CFC9]/60 mb-2 font-sans px-2">
              <span className="text-red-400 font-semibold">{criticalCount} Critical/Errors</span>
              <span>•</span>
              <span className="text-[#C5A059] font-semibold">{warningCount} Warnings</span>
              <span>•</span>
              <span className="text-blue-400 font-semibold">{suggestionCount} Suggestions</span>
            </div>

            {issues.length === 0 ? (
              <div className="p-4 text-center text-[#D4CFC9]/50 font-sans text-xs">
                No problems detected in workspace code.
              </div>
            ) : (
              issues.map((iss) => (
                <button
                  key={iss.id}
                  onClick={() => setSelectedIssue(iss)}
                  className={`w-full text-left p-2 rounded border flex items-start gap-2.5 transition-colors ${
                    selectedIssue?.id === iss.id
                      ? 'bg-[#181818] border-[#C5A059] text-[#D4CFC9]'
                      : 'bg-[#111111] border-[rgba(197,160,89,0.15)] text-[#D4CFC9]/80 hover:border-[rgba(197,160,89,0.3)]'
                  }`}
                >
                  <Badge severity={iss.severity}>{iss.severity}</Badge>
                  <div className="flex-1 min-w-0 font-sans">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="truncate">{iss.title}</span>
                      <span className="font-mono text-[10px] text-[#C5A059] shrink-0">
                        {iss.file}:{iss.line}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#D4CFC9]/60 mt-0.5 truncate">{iss.description}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {bottomTab === 'review' && (
          <div className="font-sans text-xs text-[#D4CFC9] p-2">
            {currentReview ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 bg-[#111111] border border-[rgba(197,160,89,0.2)] rounded">
                  <div>
                    <span className="text-[#C5A059] block text-[10px] font-serif">Project Analysis</span>
                    <span className="font-bold text-sm text-[#D4CFC9]">{currentReview.projectName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#C5A059] block text-[10px] font-serif">Quality Score</span>
                    <span className="text-xl font-bold font-mono text-[#C5A059]">{currentReview.overallScore} / 100</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                  <div className="p-2 bg-[#111111] border border-[rgba(197,160,89,0.15)] rounded">
                    <span className="text-[#D4CFC9]/50 block text-[10px]">Security</span>
                    <span className="font-mono font-bold text-emerald-400">{currentReview.scores.security}%</span>
                  </div>
                  <div className="p-2 bg-[#111111] border border-[rgba(197,160,89,0.15)] rounded">
                    <span className="text-[#D4CFC9]/50 block text-[10px]">Performance</span>
                    <span className="font-mono font-bold text-[#C5A059]">{currentReview.scores.performance}%</span>
                  </div>
                  <div className="p-2 bg-[#111111] border border-[rgba(197,160,89,0.15)] rounded">
                    <span className="text-[#D4CFC9]/50 block text-[10px]">Maintainability</span>
                    <span className="font-mono font-bold text-purple-400">{currentReview.scores.maintainability}%</span>
                  </div>
                  <div className="p-2 bg-[#111111] border border-[rgba(197,160,89,0.15)] rounded">
                    <span className="text-[#D4CFC9]/50 block text-[10px]">Readability</span>
                    <span className="font-mono font-bold text-amber-400">{currentReview.scores.readability}%</span>
                  </div>
                  <div className="p-2 bg-[#111111] border border-[rgba(197,160,89,0.15)] rounded">
                    <span className="text-[#D4CFC9]/50 block text-[10px]">Best Practices</span>
                    <span className="font-mono font-bold text-cyan-400">{currentReview.scores.bestPractices}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-[#D4CFC9]/50 py-6">
                No active code review report available. Click "Run Review" to analyze your code.
              </div>
            )}
          </div>
        )}

        {bottomTab === 'terminal' && (
          <div className="text-xs text-[#D4CFC9]/90 font-mono space-y-1 p-2">
            <p className="text-emerald-400">$ ai-code-review-cli v2.4.0 --daemon active</p>
            <p className="text-[#D4CFC9]/60">[info] Express API backend connected at http://localhost:3000/api</p>
            <p className="text-[#D4CFC9]/60">[info] AST static analysis analyzer ready</p>
            <p className="text-[#D4CFC9]/40">[logs] Security heuristics: SQLi, XSS, JWT unbound expiration filters enabled</p>
            <p className="text-[#C5A059] animate-pulse">&gt; Ready for commands (type Ctrl+K to view palette)...</p>
          </div>
        )}

        {bottomTab === 'output' && (
          <div className="text-xs text-[#D4CFC9]/60 font-mono space-y-1 p-2">
            <p>[Compiler] TypeScript v5.8.2 syntax check passed with 0 errors.</p>
            <p>[Vite] Dev server HMR synchronized with backend API routes.</p>
            <p>[Monaco Editor] Language workers mounted (JavaScript, TypeScript, Python, Go, SQL).</p>
          </div>
        )}
      </div>
    </div>
  );
};
