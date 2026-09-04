import React from 'react';

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'orange' | 'blue' | 'emerald' | 'purple' | 'rose' | 'amber';
}

export const ClayCard: React.FC<ClayCardProps> = ({ 
  children, 
  className = '',
  glowColor = 'orange' 
}) => {
  const glowBorders = {
    orange: 'border-orange-200/60 dark:border-orange-500/20 hover:border-orange-300',
    blue: 'border-blue-200/60 dark:border-blue-500/20 hover:border-blue-300',
    emerald: 'border-emerald-200/60 dark:border-emerald-500/20 hover:border-emerald-300',
    purple: 'border-purple-200/60 dark:border-purple-500/20 hover:border-purple-300',
    rose: 'border-rose-200/60 dark:border-rose-500/20 hover:border-rose-300',
    amber: 'border-amber-200/60 dark:border-amber-500/20 hover:border-amber-300',
  };

  return (
    <div className={`
      clay-card
      bg-white/95 dark:bg-slate-900/95 
      border-2 ${glowBorders[glowColor]}
      rounded-3xl p-6
      transition-all duration-300
      ${className}
    `}>
      {children}
    </div>
  );
};
