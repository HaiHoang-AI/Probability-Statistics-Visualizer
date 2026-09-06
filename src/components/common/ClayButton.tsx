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
    primary: 'bg-sky-600 text-white hover:bg-sky-500 shadow-sm hover:shadow active:scale-[0.98]',
    secondary: 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600 shadow-sm hover:shadow active:scale-[0.98]',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm hover:shadow active:scale-[0.98]',
    purple: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm hover:shadow active:scale-[0.98]',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm hover:shadow active:scale-[0.98]',
    outline: 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs hover:shadow-sm active:scale-[0.98]',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center text-center font-heading select-none cursor-pointer
        transition-all duration-150
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
