import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { BarChart3, TrendingUp, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

export const Analytics: React.FC = () => {
  const qualityTrendData = [
    { week: 'W1', score: 78, reviews: 12 },
    { week: 'W2', score: 82, reviews: 18 },
    { week: 'W3', score: 85, reviews: 24 },
    { week: 'W4', score: 89, reviews: 31 },
    { week: 'W5', score: 92, reviews: 42 },
  ];

  const issueSeverityData = [
    { category: 'Security', critical: 1, warning: 4, suggestion: 8 },
    { category: 'Performance', critical: 0, warning: 6, suggestion: 12 },
    { category: 'Maintainability', critical: 0, warning: 3, suggestion: 15 },
    { category: 'Readability', critical: 0, warning: 1, suggestion: 9 },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-rose-400" />
          <span>Developer Analytics & Velocity</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Monitor codebase health trends, security vulnerability distribution, and team review output.
        </p>
      </div>

      {/* Top Stat Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <span className="text-xs text-gray-400 block">Avg Quality Score</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">92%</div>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">+14% improvement</span>
        </div>

        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <span className="text-xs text-gray-400 block">Audits Conducted</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">248</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Last 30 days</span>
        </div>

        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <span className="text-xs text-gray-400 block">Mean Fix Velocity</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">1.8 hrs</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Time to resolve criticals</span>
        </div>

        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <span className="text-xs text-gray-400 block">Vulnerability Prevention</span>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">100%</div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Pre-production intercept</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Trend Line Chart */}
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg space-y-3">
          <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Code Quality Score Over Time (%)</span>
          </h3>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qualityTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="week" stroke="#6e7681" tick={{ fontSize: 11 }} />
                <YAxis domain={[60, 100]} stroke="#6e7681" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1117', borderColor: '#30363d', borderRadius: '6px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue Severity Distribution Bar Chart */}
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg space-y-3">
          <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Issue Severity Breakdown</span>
          </h3>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issueSeverityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="category" stroke="#6e7681" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6e7681" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1117', borderColor: '#30363d', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="warning" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="suggestion" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
