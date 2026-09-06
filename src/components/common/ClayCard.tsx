import React from 'react';

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'orange' | 'blue' | 'emerald' | 'purple' | 'rose' | 'amber';
  interactive?: boolean;
}

export const ClayCard: React.FC<ClayCardProps> = ({ 
  children, 
  className = '',
  interactive = false,
}) => {
  return (
    <div className={`
      bg-white dark:bg-slate-900 
      border border-slate-200/80 dark:border-slate-800
      shadow-sm
      ${interactive ? 'hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] cursor-pointer' : ''}
      rounded-3xl p-6
      transition-all duration-150
      ${className}
    `}>
      {children}
    </div>
  );
};
