import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { notifications, dismissNotification } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-10 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        const icons = {
          info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
          error: <XCircle className="w-4 h-4 text-red-400 shrink-0" />
        };

        const borderStyles = {
          info: 'border-blue-500/40 bg-[#161b22]',
          success: 'border-emerald-500/40 bg-[#161b22]',
          warning: 'border-amber-500/40 bg-[#161b22]',
          error: 'border-red-500/40 bg-[#161b22]'
        };

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-3 rounded-md border shadow-xl transition-all animate-in slide-in-from-right duration-200 ${borderStyles[n.type]}`}
          >
            {icons[n.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-gray-200">{n.title}</h4>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{n.message}</p>
              <span className="text-[10px] text-gray-500 mt-1 block">{n.time}</span>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="text-gray-500 hover:text-gray-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
