import React from 'react';
import { Severity } from '../../types';

interface BadgeProps {
  severity?: Severity;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  severity,
  variant,
  children,
  className = '',
  size = 'sm'
}) => {
  let colorStyle = 'bg-gray-800 text-gray-300 border-gray-700';

  if (severity) {
    switch (severity) {
      case 'CRITICAL':
        colorStyle = 'bg-red-950/80 text-red-300 border-red-800/80 font-semibold animate-pulse';
        break;
      case 'ERROR':
        colorStyle = 'bg-red-950/50 text-red-400 border-red-900/60 font-medium';
        break;
      case 'WARNING':
        colorStyle = 'bg-[#1f1a0e] text-[#C5A059] border-[rgba(197,160,89,0.3)] font-medium';
        break;
      case 'SUGGESTION':
        colorStyle = 'bg-blue-950/50 text-blue-300 border-blue-800/40 font-medium';
        break;
      case 'INFO':
        colorStyle = 'bg-[#141414] text-[#D4CFC9]/70 border-[rgba(197,160,89,0.15)] font-normal';
        break;
    }
  } else if (variant) {
    switch (variant) {
      case 'success':
        colorStyle = 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40';
        break;
      case 'warning':
        colorStyle = 'bg-[#1f1a0e] text-[#C5A059] border-[rgba(197,160,89,0.3)]';
        break;
      case 'danger':
        colorStyle = 'bg-red-950/60 text-red-400 border-red-800/50';
        break;
      case 'info':
        colorStyle = 'bg-[#141414] text-[#C5A059] border-[rgba(197,160,89,0.3)]';
        break;
      case 'purple':
        colorStyle = 'bg-purple-950/50 text-purple-300 border-purple-800/40';
        break;
      default:
        colorStyle = 'bg-[#141414] text-[#D4CFC9] border-[rgba(197,160,89,0.2)]';
    }
  }

  const sizeStyle = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 rounded border font-mono uppercase tracking-wider ${colorStyle} ${sizeStyle} ${className}`}>
      {children}
    </span>
  );
};
