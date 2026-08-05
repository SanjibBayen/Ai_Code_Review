import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium tracking-wide transition-all focus:outline-none focus:ring-1 focus:ring-[#C5A059] disabled:opacity-50 disabled:cursor-not-allowed rounded select-none text-xs md:text-sm';

  const variants = {
    primary: 'bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A0A0A] font-semibold border border-[#C5A059] shadow-md shadow-[#C5A059]/10',
    secondary: 'bg-[#141414] hover:bg-[#1a1a1a] text-[#D4CFC9] border border-[rgba(197,160,89,0.25)] hover:border-[#C5A059]',
    danger: 'bg-red-950/80 hover:bg-red-900/90 text-red-300 border border-red-800/60 shadow-sm',
    ghost: 'bg-transparent hover:bg-[#141414] text-[#D4CFC9]/80 hover:text-[#C5A059]',
    outline: 'border border-[rgba(197,160,89,0.3)] text-[#C5A059] hover:bg-[#C5A059]/10 hover:border-[#C5A059]'
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs font-medium gap-2',
    lg: 'px-5 py-2.5 text-sm font-semibold gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
