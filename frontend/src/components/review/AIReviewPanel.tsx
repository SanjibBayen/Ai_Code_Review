import React, { useState } from 'react';
import { useReviewStore } from '../../store/reviewStore';
import { IssueCard } from './IssueCard';
import { Sparkles, ShieldAlert, Zap, Cpu, Eye, ListChecks, Wand2 } from 'lucide-react';
import { Button } from '../common/Button';

export const AIReviewPanel: React.FC = () => {
  const { currentReview, reviewLoading, reviewStep, previewImprovedCode, activeFile } = useReviewStore();
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  if (reviewLoading) {
    return (
      <div className="w-full lg:w-80 xl:w-96 bg-[#111111] border-l border-[rgba(197,160,89,0.18)] flex flex-col p-4 shrink-0 font-mono text-xs">
        <div className="flex items-center gap-2 text-[#C5A059] font-semibold mb-3">
          <Sparkles className="w-4 h-4 animate-spin text-[#C5A059]" />
          <span>AI REVIEW IN PROGRESS</span>
        </div>

        {/* Terminal Animation Display */}
        <div className="bg-[#0A0A0A] border border-[rgba(197,160,89,0.2)] p-3 rounded flex-1 font-mono text-[11px] text-[#D4CFC9] flex flex-col justify-between">
          <div className="space-y-2">
            <p className="text-[#C5A059] font-bold">$ ai-review analyze --deep</p>
            <p className="text-[#D4CFC9]/60">{reviewStep}</p>
            <div className="w-full bg-[#141414] rounded-full h-1.5 overflow-hidden mt-4 border border-[rgba(197,160,89,0.15)]">
              <div className="bg-[#C5A059] h-full animate-pulse w-3/4 rounded-full" />
            </div>
          </div>

          <div className="text-[#D4CFC9]/40 text-[10px] space-y-1 border-t border-[rgba(197,160,89,0.15)] pt-3">
            <p>Evaluating AST structure...</p>
            <p>Querying Gemini 2.5 Flash security models...</p>
            <p>Detecting memory & SQL injection hazards...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentReview) {
    return (
      <div className="w-full lg:w-80 xl:w-96 bg-[#111111] border-l border-[rgba(197,160,89,0.18)] flex flex-col items-center justify-center p-6 text-center shrink-0">
        <div className="w-12 h-12 rounded-full bg-[#1c170d] border border-[rgba(197,160,89,0.3)] flex items-center justify-center text-[#C5A059] mb-3 shadow-lg shadow-[#C5A059]/5">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-[#D4CFC9] font-serif tracking-wide">AI Code Review Panel</h3>
        <p className="text-xs text-[#D4CFC9]/50 mt-1 max-w-xs leading-relaxed">
          Select code in the editor or click "Run Review" to generate instant security, performance, and architecture feedback.
        </p>
      </div>
    );
  }

  const { overallScore, scores, issues, summary, suggestions, improvedCode } = currentReview;
  const hasImprovedCode = Boolean(improvedCode && activeFile && improvedCode.trim() !== (activeFile.content || '').trim());

  const filteredIssues = severityFilter === 'ALL'
    ? issues
    : issues.filter(i => i.severity === severityFilter);

  return (
    <div className="w-full lg:w-80 xl:w-96 bg-[#111111] border-l border-[rgba(197,160,89,0.18)] flex flex-col h-full shrink-0 select-none">
      {/* Header */}
      <div className="p-3 border-b border-[rgba(197,160,89,0.18)] bg-[#0A0A0A] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C5A059]" />
          <span className="text-xs font-semibold text-[#D4CFC9] font-serif uppercase tracking-wider">AI REVIEW REPORT</span>
        </div>
        <span className="text-[10px] font-mono text-[#C5A059] bg-[#141414] px-2 py-0.5 rounded border border-[rgba(197,160,89,0.25)]">
          {issues.length} Issues
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {/* Overall Score Gauge */}
        <div className="p-3 bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-[rgba(197,160,89,0.2)] rounded flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#C5A059] uppercase font-semibold block tracking-wider font-serif">Overall Code Score</span>
            <span className="text-2xl font-bold font-mono text-[#D4CFC9] mt-0.5 block">{overallScore} / 100</span>
            <span className="text-[10px] text-emerald-400 font-medium">
              {overallScore >= 90 ? 'Healthy Codebase' : overallScore >= 75 ? 'Needs Optimization' : 'Critical Risks Detected'}
            </span>
          </div>

          <div className="w-16 h-16 rounded-full border-2 border-[#C5A059] flex items-center justify-center font-mono font-bold text-lg text-[#C5A059] bg-[#1c170d] shadow-lg shadow-[#C5A059]/10">
            {overallScore}%
          </div>
        </div>

        {summary && (
          <div className="rounded border border-[rgba(197,160,89,0.18)] bg-[#0A0A0A] p-3 text-[11px] leading-relaxed text-[#D4CFC9]/75">
            <span className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#C5A059] font-serif">
              <Eye className="h-3 w-3" /> AI assessment
            </span>
            {summary}
          </div>
        )}

        {hasImprovedCode && (
          <Button
            variant="primary"
            size="sm"
            className="w-full justify-center"
            icon={<Wand2 className="h-3.5 w-3.5" />}
            onClick={previewImprovedCode}
          >
            Preview AI-improved code
          </Button>
        )}

        {/* Category Breakdown Progress Bars */}
        <div className="p-3 bg-[#0A0A0A] border border-[rgba(197,160,89,0.18)] rounded space-y-2 text-[11px]">
          <span className="text-[10px] font-semibold text-[#C5A059] uppercase tracking-wider block mb-1 font-serif">
            Category Breakdown
          </span>

          <div className="space-y-1">
            <div className="flex justify-between text-[#D4CFC9]">
              <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-red-400" /> Security</span>
              <span className="font-mono text-emerald-400">{scores.security}%</span>
            </div>
            <div className="w-full bg-[#141414] h-1.5 rounded-full overflow-hidden border border-[rgba(197,160,89,0.1)]">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${scores.security}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[#D4CFC9]">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-[#C5A059]" /> Performance</span>
              <span className="font-mono text-[#C5A059]">{scores.performance}%</span>
            </div>
            <div className="w-full bg-[#141414] h-1.5 rounded-full overflow-hidden border border-[rgba(197,160,89,0.1)]">
              <div className="bg-[#C5A059] h-full rounded-full" style={{ width: `${scores.performance}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[#D4CFC9]">
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-purple-400" /> Maintainability</span>
              <span className="font-mono text-purple-400">{scores.maintainability}%</span>
            </div>
            <div className="w-full bg-[#141414] h-1.5 rounded-full overflow-hidden border border-[rgba(197,160,89,0.1)]">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${scores.maintainability}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[#D4CFC9]">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-sky-400" /> Readability</span>
              <span className="font-mono text-sky-400">{scores.readability}%</span>
            </div>
            <div className="w-full bg-[#141414] h-1.5 rounded-full overflow-hidden border border-[rgba(197,160,89,0.1)]">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: `${scores.readability}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[#D4CFC9]">
              <span className="flex items-center gap-1"><ListChecks className="w-3 h-3 text-emerald-400" /> Best practices</span>
              <span className="font-mono text-emerald-400">{scores.bestPractices}%</span>
            </div>
            <div className="w-full bg-[#141414] h-1.5 rounded-full overflow-hidden border border-[rgba(197,160,89,0.1)]">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${scores.bestPractices}%` }} />
            </div>
          </div>
        </div>

        {suggestions && suggestions.length > 0 && (
          <div className="rounded border border-[rgba(197,160,89,0.18)] bg-[#0A0A0A] p-3">
            <span className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#C5A059] font-serif">
              <ListChecks className="h-3 w-3" /> Quality improvement plan
            </span>
            <ol className="space-y-1.5 pl-4 text-[11px] leading-relaxed text-[#D4CFC9]/70 list-decimal">
              {suggestions.slice(0, 5).map((suggestion, index) => <li key={`${index}-${suggestion}`}>{suggestion}</li>)}
            </ol>
          </div>
        )}

        {/* Severity Filters */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 text-[10px]">
          {['ALL', 'CRITICAL', 'WARNING', 'SUGGESTION', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2 py-0.5 rounded font-mono font-medium border transition-colors ${
                severityFilter === sev
                  ? 'bg-[#C5A059] text-[#0A0A0A] border-[#C5A059] font-bold'
                  : 'bg-[#0A0A0A] text-[#D4CFC9]/60 border-[rgba(197,160,89,0.18)] hover:text-[#C5A059] hover:border-[rgba(197,160,89,0.3)]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Issues List */}
        <div className="space-y-2">
          {filteredIssues.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#D4CFC9]/50 bg-[#0A0A0A] border border-[rgba(197,160,89,0.18)] rounded">
              No issues match selected filter.
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
