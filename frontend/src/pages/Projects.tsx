import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  ExternalLink, 
  Code2, 
  Settings, 
  Trash2, 
  Sparkles,
  GitBranch
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const Projects: React.FC = () => {
  const { projects, fetchProjects, deleteProject, selectProject } = useProjectStore();
  const { setActiveSection, addNotification } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.repository.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete project ${name}?`)) {
      await deleteProject(id);
      addNotification({
        title: 'Project Deleted',
        message: `Deleted ${name}`,
        type: 'info'
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-blue-400" />
            <span>Projects Explorer</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your connected codebases, trigger AI reviews, and inspect code quality grades.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Filter projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0d1117] border-b border-[#30363d] text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="p-3">Project</th>
                <th className="p-3">Repository</th>
                <th className="p-3">Language</th>
                <th className="p-3 text-center">Reviews</th>
                <th className="p-3">Score</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]/60 text-gray-300">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No projects found matching filter.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => (
                  <tr
                    key={proj.id}
                    onClick={() => {
                      selectProject(proj);
                      navigate(`/projects/${proj.id}`);
                    }}
                    className="hover:bg-[#21262d] transition-colors cursor-pointer group"
                  >
                    <td className="p-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{proj.name}</span>
                      </div>
                    </td>

                    <td className="p-3 font-mono text-gray-400 text-[11px]">
                      {proj.repository}
                    </td>

                    <td className="p-3 font-mono">
                      <span className="bg-[#0d1117] border border-[#30363d] px-2 py-0.5 rounded text-gray-300">
                        {proj.language}
                      </span>
                    </td>

                    <td className="p-3 text-center font-mono text-gray-300 font-bold">
                      {proj.reviewsCount}
                    </td>

                    <td className="p-3 font-mono font-bold text-blue-400">
                      {proj.score}%
                    </td>

                    <td className="p-3">
                      <Badge variant={proj.status === 'Healthy' ? 'success' : 'warning'}>
                        {proj.status}
                      </Badge>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            selectProject(proj);
                            setActiveSection('review');
                            navigate('/review');
                          }}
                          className="p-1.5 text-blue-400 hover:text-white rounded hover:bg-[#0d1117]"
                          title="Run AI Review"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            selectProject(proj);
                            navigate(`/projects/${proj.id}`);
                          }}
                          className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#0d1117]"
                          title="Open Settings"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, proj.id, proj.name)}
                          className="p-1.5 text-gray-500 hover:text-red-400 rounded hover:bg-[#0d1117]"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
