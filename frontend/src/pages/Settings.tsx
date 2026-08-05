import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/common/Button';
import { Settings as SettingsIcon, Shield, Sparkles, Moon, Lock, User } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [strictness, setStrictness] = useState('HIGH');
  const [secPriority, setSecPriority] = useState('CRITICAL_FIRST');

  const handleSave = () => {
    addNotification({ title: 'Settings', message: 'Preferences updated successfully', type: 'success' });
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-gray-400" />
          <span>System & AI Preferences</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure AI review strictness heuristics, security priority rules, and developer workspace theme.
        </p>
      </div>

      <div className="space-y-4 max-w-3xl">
        {/* AI Preferences */}
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg space-y-3 text-xs">
          <h3 className="font-semibold text-gray-200 flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI Code Review Heuristics</span>
          </h3>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Review Strictness</label>
            <select
              value={strictness}
              onChange={(e) => setStrictness(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="MAXIMUM">Maximum (Zero-tolerance security & AST checks)</option>
              <option value="HIGH">High (Default - Standard production rules)</option>
              <option value="BALANCED">Balanced (Flags critical vulnerabilities & performance)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Security Priority</label>
            <select
              value={secPriority}
              onChange={(e) => setSecPriority(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="CRITICAL_FIRST">OWASP Top 10 Security First</option>
              <option value="PERFORMANCE_FIRST">Performance & Memory Optimization First</option>
            </select>
          </div>
        </div>

        {/* Appearance */}
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg space-y-3 text-xs">
          <h3 className="font-semibold text-gray-200 flex items-center gap-2 text-sm">
            <Moon className="w-4 h-4 text-purple-400" />
            <span>Workspace Theme</span>
          </h3>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-[#0d1117] border border-blue-500 text-white font-medium rounded">
              VS Code Dark (Default)
            </button>
          </div>
        </div>

        <Button variant="primary" onClick={handleSave}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
};
