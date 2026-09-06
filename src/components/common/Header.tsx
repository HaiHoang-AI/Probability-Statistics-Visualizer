import React from 'react';
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
}) => {
  return (
    <header className="sticky top-3 z-40 w-full px-4 sm:px-8 xl:px-10 transition-colors">
      <div className="w-full max-w-[1920px] mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-full px-5 sm:px-8 py-2.5 shadow-sm flex items-center justify-between transition-all duration-150">
        
        {/* Brand & Logo */}
        <div 
          onClick={() => onSelectChapter('overview')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-heading font-black text-sm shadow-sm group-hover:scale-105 transition-all duration-150">
            PS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                ProbStat <span className="text-sky-600 dark:text-sky-400">Visualizer</span>
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                MAT1101
              </span>
            </div>
          </div>
        </div>

        {/* Quick Nav & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Back to Home / Overview Button */}
          <button
            onClick={() => onSelectChapter('overview')}
            className={`
              px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all duration-150 cursor-pointer border border-slate-200 dark:border-slate-700
              shadow-xs hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98]
              ${currentChapterId === 'overview'
                ? 'bg-sky-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }
            `}
          >
            Trang chủ
          </button>

          {/* Quick Jump to Lessons dropdown */}
          <div className="relative hidden md:block">
            <select
              value={currentChapterId}
              onChange={(e) => onSelectChapter(e.target.value as ChapterId)}
              className="
                appearance-none bg-white dark:bg-slate-800 
                border border-slate-200 dark:border-slate-700 
                text-slate-900 dark:text-slate-100 
                text-xs font-heading font-bold rounded-xl px-3 py-1.5 pr-7 
                cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20
                shadow-xs hover:border-slate-300 dark:hover:border-slate-600
                active:scale-[0.98] transition-all duration-150
              "
            >
              <option value="overview">Chọn bài học</option>
              <optgroup label="ƯU TIÊN: BÀI 7 - 11">
                <option value="ch7-1-derived">Bài 7.1: Biến dẫn xuất & Tích chập</option>
                <option value="ch7-2-mgf">Bài 7.2: Hàm sinh Moment (MGF)</option>
                <option value="ch8-limit-theorems">Bài 8: Định lý Giới hạn & CLT</option>
                <option value="ch9-bayesian">Bài 9: Suy luận Bayes</option>
                <option value="ch10-1-estimation">Bài 10.1: Ước lượng Thống kê</option>
                <option value="ch10-2-hypothesis">Bài 10.2: Kiểm định Giả thuyết</option>
                <option value="ch11-regression">Bài 11: Hồi quy Tuyến tính</option>
              </optgroup>
              <optgroup label="CƠ SỞ: BÀI 1 - 6">
                <option value="ch1-foundations">Bài 1: Cơ sở Tập hợp</option>
                <option value="ch2-basic-prob">Bài 2: Xác suất Cơ bản</option>
                <option value="ch3-discrete-rv">Bài 3 & 4: Biến ngẫu nhiên Rời rạc</option>
                <option value="ch4-continuous-rv">Bài 5 & 6: Biến ngẫu nhiên Liên tục</option>
              </optgroup>
            </select>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
