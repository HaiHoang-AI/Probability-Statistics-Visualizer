import React from 'react';

interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'purple' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const ClayButton: React.FC<ClayButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl',
    md: 'px-5 py-2.5 text-sm font-bold rounded-2xl',
    lg: 'px-6 py-3.5 text-base font-black rounded-2xl',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/25 border-b-4 border-orange-600 active:border-b-0 active:translate-y-1',
    secondary: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/25 border-b-4 border-blue-700 active:border-b-0 active:translate-y-1',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/25 border-b-4 border-red-700 active:border-b-0 active:translate-y-1',
    outline: 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:translate-y-0.5',
  };

  return (
    <button
      className={`
        clay-button inline-flex items-center justify-center text-center
        transition-all duration-150 cursor-pointer select-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      <span>{children}</span>
    </button>
  );
};
