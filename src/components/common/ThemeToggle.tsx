import React, { useEffect, useState } from 'react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle Theme"
      className="
        px-3 py-1.5 rounded-xl text-xs font-heading font-bold
        bg-white dark:bg-slate-800 
        text-slate-900 dark:text-slate-100
        border border-slate-200 dark:border-slate-700 
        shadow-xs hover:border-slate-300 dark:hover:border-slate-600
        hover:bg-slate-100 dark:hover:bg-slate-700
        active:scale-[0.98]
        cursor-pointer transition-all duration-150
      "
    >
      {isDark ? 'Chế độ: Tối' : 'Chế độ: Sáng'}
    </button>
  );
};
