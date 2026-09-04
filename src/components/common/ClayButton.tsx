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
    sm: 'px-3 py-1.5 text-xs font-bold rounded-xl',
    md: 'px-5 py-2.5 text-sm font-bold rounded-2xl',
    lg: 'px-6 py-3.5 text-base font-extrabold rounded-2xl',
  };

  const variantClasses = {
    primary: 'bg-sky-600 text-white hover:bg-sky-500',
    secondary: 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500',
    purple: 'bg-indigo-600 text-white hover:bg-indigo-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
    outline: 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center text-center font-heading select-none cursor-pointer
        border-2 border-slate-900 dark:border-slate-700
        shadow-[3px_3px_0px_#0f172a] dark:shadow-[3px_3px_0px_#0284c7]
        hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#0f172a] dark:hover:shadow-[1px_1px_0px_#0284c7]
        active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
        transition-all duration-100
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
