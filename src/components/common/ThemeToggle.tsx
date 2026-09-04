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
        bg-amber-100 dark:bg-slate-800 
        text-slate-800 dark:text-slate-200
        border border-amber-300 dark:border-slate-700 
        hover:bg-amber-200 dark:hover:bg-slate-700
        cursor-pointer transition-colors duration-200
      "
    >
      {isDark ? 'Chế độ: Tối' : 'Chế độ: Sáng'}
    </button>
  );
};
