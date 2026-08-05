import React from 'react';
import { CodeIssue } from '../../types';
import { Badge } from '../common/Badge';
import { useReviewStore } from '../../store/reviewStore';
import { Button } from '../common/Button';
import { Code2, ArrowRight, Check } from 'lucide-react';

interface IssueCardProps {
  issue: CodeIssue;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const { selectedIssue, setSelectedIssue, setDiffViewActive } = useReviewStore();
  const isSelected = selectedIssue?.id === issue.id;

  return (
    <div
      onClick={() => setSelectedIssue(issue)}
      className={`p-3 rounded border transition-all cursor-pointer ${
        isSelected
          ? 'bg-[#181818] border-[#C5A059] shadow-md ring-1 ring-[#C5A059]/40'
          : 'bg-[#0A0A0A] border-[rgba(197,160,89,0.18)] hover:border-[rgba(197,160,89,0.35)]'
      }`}
    >
      {/* Header & Badges */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <Badge severity={issue.severity}>{issue.severity}</Badge>
        <span className="font-mono text-[10px] text-[#C5A059] bg-[#141414] px-1.5 py-0.5 rounded border border-[rgba(197,160,89,0.2)]">
          {issue.file}:{issue.line}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-[#D4CFC9] leading-snug mb-1 font-serif">
        {issue.title}
      </h4>

      {/* Description */}
      <p className="text-[11px] text-[#D4CFC9]/70 leading-relaxed mb-2">
        {issue.description}
      </p>

      {/* Why it matters */}
      <div className="bg-[#141414] p-2 rounded border border-[rgba(197,160,89,0.18)] mb-2 text-[10px]">
        <span className="font-semibold text-[#C5A059] block mb-0.5 font-serif">Why this matters:</span>
        <span className="text-[#D4CFC9]/80 leading-normal">{issue.whyItMatters}</span>
      </div>

      {/* Suggested fix */}
      <div className="text-[10px] text-[#D4CFC9]/80 mb-2.5">
        <span className="font-semibold text-emerald-400 block mb-0.5">Suggested Fix:</span>
        <span className="text-[#D4CFC9]/60">{issue.suggestedFix}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-[rgba(197,160,89,0.15)]">
        <Button
          variant="secondary"
          size="sm"
          icon={<Code2 className="w-3 h-3 text-[#C5A059]" />}
          onClick={(e) => {
            e.stopPropagation();
            setDiffViewActive(true, issue);
          }}
        >
          Compare Diff
        </Button>
      </div>
    </div>
  );
};
