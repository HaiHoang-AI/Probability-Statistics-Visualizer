import React from 'react';
import { Sparkles, Compass, Flame, BookOpen, ExternalLink } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ChapterId } from '../../types';

interface HeaderProps {
  currentChapterId: ChapterId;
  onSelectChapter: (id: ChapterId) => void;
  completedCount?: number;
  totalCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentChapterId,
  onSelectChapter,
  completedCount = 0,
  totalCount = 20
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-amber-200/50 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div 
          onClick={() => onSelectChapter('overview')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 p-0.5 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform flex items-center justify-center text-white text-2xl">
            🎲
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xl tracking-tight text-slate-900 dark:text-white">
                ProbStat <span className="text-orange-500">Visualizer</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                <Flame size={10} className="fill-orange-500 text-orange-500" /> MAT1101
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Interactive Probability & Statistics Learning
            </p>
          </div>
        </div>

        {/* Quick Priority Nav & Actions */}
        <div className="flex items-center gap-3">
          
          {/* Back to Home / Overview Button */}
          <button
            onClick={() => onSelectChapter('overview')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all
              ${currentChapterId === 'overview'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <Compass size={14} />
            <span>Trang chủ</span>
          </button>

          {/* Quick Jump to Priority Lessons 7-11 dropdown */}
          <div className="relative hidden md:block">
            <select
              value={currentChapterId}
              onChange={(e) => onSelectChapter(e.target.value as ChapterId)}
              className="
                appearance-none bg-amber-50 dark:bg-slate-800 
                border-2 border-amber-200 dark:border-slate-700 
                text-slate-800 dark:text-slate-200 
                text-xs font-heading font-bold rounded-xl px-3 py-1.5 pr-7 
                cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500
              "
            >
              <option value="overview">📚 Xem tất cả các bài</option>
              <optgroup label="🔥 ƯU TIÊN: BÀI 7 - 11">
                <option value="ch7-1-derived">Bài 7.1: Biến dẫn xuất & Tích chập</option>
                <option value="ch7-2-mgf">Bài 7.2: Hàm sinh Moment (MGF)</option>
                <option value="ch8-limit-theorems">Bài 8: Định lý Giới hạn & CLT</option>
                <option value="ch9-bayesian">Bài 9: Suy luận Bayes</option>
                <option value="ch10-1-estimation">Bài 10.1: Ước lượng Thống kê</option>
                <option value="ch10-2-hypothesis">Bài 10.2: Kiểm định Giả thuyết</option>
                <option value="ch11-regression">Bài 11: Hồi quy Tuyến tính</option>
              </optgroup>
              <optgroup label="📖 CƠ SỞ: BÀI 1 - 6">
                <option value="ch1-foundations">Bài 1: Cơ sở Tập hợp</option>
                <option value="ch2-basic-prob">Bài 2: Xác suất Cơ bản</option>
                <option value="ch3-discrete-rv">Bài 3 & 4: Biến ngẫu nhiên Rời rạc</option>
                <option value="ch4-continuous-rv">Bài 5 & 6: Biến ngẫu nhiên Liên tục</option>
              </optgroup>
            </select>
          </div>

          {/* Progress Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono">
            <Sparkles size={12} className="text-emerald-500" />
            <span>Ưu tiên Bài 7-11</span>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
