import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

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
        relative flex items-center justify-between w-14 h-8 px-1 rounded-full 
        bg-amber-100 dark:bg-slate-800 
        border-2 border-amber-300 dark:border-slate-700 
        shadow-inner cursor-pointer transition-colors duration-300
      "
    >
      <span className="text-amber-500 pl-0.5">
        <Sun size={14} strokeWidth={2.5} />
      </span>
      <span className="text-indigo-400 pr-0.5">
        <Moon size={14} strokeWidth={2.5} />
      </span>
      <span
        className={`
          absolute top-0.5 left-0.5 w-6 h-6 rounded-full 
          bg-gradient-to-r from-orange-400 to-amber-500 dark:from-indigo-500 dark:to-purple-600
          shadow-md transform transition-transform duration-300 ease-spring
          ${isDark ? 'translate-x-6' : 'translate-x-0'}
        `}
      />
    </button>
  );
};
