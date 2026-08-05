import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { historyApi } from '../api/history.api';
import { ReviewRecord } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ArrowLeft, Download, Share2, Sparkles, ShieldCheck, Zap, Cpu } from 'lucide-react';

export const ReviewDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<ReviewRecord | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      historyApi.getHistoryById(id).then(res => setReview(res.historyItem || null));
    }
  }, [id]);

  if (!review) {
    return <div className="p-6 text-xs text-gray-500">Loading review details...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#30363d]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="p-1.5 text-gray-400 hover:text-white rounded bg-[#161b22] border border-[#30363d]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">{review.id}</h1>
            <p className="text-xs text-gray-400">Audit report for {review.projectName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => alert('Downloading JSON Audit Report...')}
          >
            Download Report
          </Button>
        </div>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 bg-[#161b22] border border-[#30363d] rounded text-center">
          <span className="text-gray-500 text-[10px] uppercase">Overall Score</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{review.overallScore}%</div>
        </div>
        <div className="p-3 bg-[#161b22] border border-[#30363d] rounded text-center">
          <span className="text-gray-500 text-[10px] uppercase">Security</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{review.scores.security}%</div>
        </div>
        <div className="p-3 bg-[#161b22] border border-[#30363d] rounded text-center">
          <span className="text-gray-500 text-[10px] uppercase">Performance</span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{review.scores.performance}%</div>
        </div>
        <div className="p-3 bg-[#161b22] border border-[#30363d] rounded text-center">
          <span className="text-gray-500 text-[10px] uppercase">Maintainability</span>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">{review.scores.maintainability}%</div>
        </div>
        <div className="p-3 bg-[#161b22] border border-[#30363d] rounded text-center col-span-2 md:col-span-1">
          <span className="text-gray-500 text-[10px] uppercase">Readability</span>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{review.scores.readability}%</div>
        </div>
      </div>

      {/* Issues list */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Detected Issues ({review.issues.length})</h3>
        {review.issues.map(iss => (
          <div key={iss.id} className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge severity={iss.severity}>{iss.severity}</Badge>
                <span className="font-semibold text-white">{iss.title}</span>
              </div>
              <span className="font-mono text-gray-500 text-[10px]">{iss.file}:{iss.line}</span>
            </div>
            <p className="text-gray-300">{iss.description}</p>
            <div className="p-2 bg-[#0d1117] border border-[#30363d] rounded text-[11px]">
              <span className="text-amber-400 font-semibold block">Fix Recommendation:</span>
              <span className="text-gray-400">{iss.suggestedFix}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
