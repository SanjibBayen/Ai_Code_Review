import React from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, ShieldCheck, Key } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const Profile: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          <span>Developer Profile</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage your account details and authentication credentials.
        </p>
      </div>

      <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-lg max-w-xl space-y-4 text-xs">
        <div className="flex items-center gap-4 pb-4 border-b border-[#30363d]">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white overflow-hidden border-2 border-blue-400">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0] || 'U'
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{user?.name || 'Uttam Maji'}</h2>
            <p className="text-gray-400 font-mono">{user?.email || 'uttammaji842@gmail.com'}</p>
            <Badge variant="success" className="mt-1">Verified Developer</Badge>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="text-gray-500 text-[10px] uppercase font-mono block">User ID</label>
            <span className="font-mono text-gray-200">{user?.id || 'u_1092837'}</span>
          </div>

          <div>
            <label className="text-gray-500 text-[10px] uppercase font-mono block">Authentication Method</label>
            <span className="font-mono text-gray-200">Email OTP Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};
