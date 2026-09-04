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
        border-2 border-slate-900 dark:border-slate-700 
        shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]
        hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-none
        hover:bg-slate-100 dark:hover:bg-slate-700
        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
        cursor-pointer transition-all duration-100
      "
    >
      {isDark ? 'Chế độ: Tối' : 'Chế độ: Sáng'}
    </button>
  );
};
