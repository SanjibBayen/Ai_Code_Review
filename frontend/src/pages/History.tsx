import React, { useEffect, useState } from 'react';
import { historyApi } from '../api/history.api';
import { ReviewRecord } from '../types';
import { Badge } from '../components/common/Badge';
import { useNavigate } from 'react-router-dom';
import { 
  History as HistoryIcon, 
  Search, 
  Trash2, 
  ExternalLink, 
  Sparkles,
  Download,
  Filter
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export const History: React.FC = () => {
  const [historyList, setHistoryList] = useState<ReviewRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { addNotification } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await historyApi.getReviewHistory();
      setHistoryList(res.history || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this review record?')) {
      await historyApi.deleteHistory(id);
      setHistoryList(prev => prev.filter(item => item.id !== id));
      addNotification({ title: 'History', message: 'Record deleted', type: 'info' });
    }
  };

  const filtered = historyList.filter(item =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-purple-400" />
            <span>Review History & Audit Logs</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Historical records of automated AI code reviews, security scans, and recommendations.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search review logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0d1117] border-b border-[#30363d] text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="p-3">Review ID</th>
                <th className="p-3">Project / Repository</th>
                <th className="p-3">Language</th>
                <th className="p-3 text-center">Issues</th>
                <th className="p-3">Score</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]/60 text-gray-300 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No historical reviews found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const criticals = item.issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'ERROR').length;
                  const warnings = item.issues.filter(i => i.severity === 'WARNING').length;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/history/${item.id}`)}
                      className="hover:bg-[#21262d] transition-colors cursor-pointer group"
                    >
                      <td className="p-3 font-mono font-bold text-blue-400">
                        {item.id}
                      </td>

                      <td className="p-3 font-semibold text-white">
                        <div>
                          <span>{item.projectName}</span>
                          <span className="text-[10px] text-gray-500 font-mono block">
                            {item.repository || 'workspace'}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 font-mono">
                        <span className="bg-[#0d1117] border border-[#30363d] px-2 py-0.5 rounded text-gray-300">
                          {item.language}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {criticals > 0 && <Badge variant="danger">{criticals} Crit</Badge>}
                          {warnings > 0 && <Badge variant="warning">{warnings} Warn</Badge>}
                          {criticals === 0 && warnings === 0 && <Badge variant="success">Clean</Badge>}
                        </div>
                      </td>

                      <td className="p-3 font-mono font-bold text-blue-400">
                        {item.overallScore}%
                      </td>

                      <td className="p-3 text-gray-500 font-mono text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 rounded hover:bg-[#0d1117]"
                            title="Delete Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
