import React from 'react';

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'orange' | 'blue' | 'emerald' | 'purple' | 'rose' | 'amber';
}

export const ClayCard: React.FC<ClayCardProps> = ({ 
  children, 
  className = '',
}) => {
  return (
    <div className={`
      bg-white dark:bg-slate-900 
      border-2 border-slate-900 dark:border-slate-700
      shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]
      hover:translate-x-[2px] hover:translate-y-[2px] 
      hover:shadow-[2px_2px_0px_#0f172a] dark:hover:shadow-[2px_2px_0px_#0284c7]
      active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
      rounded-3xl p-6
      transition-all duration-150
      ${className}
    `}>
      {children}
    </div>
  );
};
