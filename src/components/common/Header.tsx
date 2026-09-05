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
    <header className="sticky top-3 z-40 w-full px-4 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 border-[2.5px] border-slate-900 dark:border-slate-700 rounded-2xl md:rounded-full px-5 sm:px-8 py-2.5 shadow-[5px_5px_0px_#0f172a] dark:shadow-[5px_5px_0px_#0284c7] flex items-center justify-between transition-all duration-150">
        
        {/* Brand & Logo */}
        <div 
          onClick={() => onSelectChapter('overview')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-600 border-2 border-slate-900 flex items-center justify-center text-white font-heading font-black text-sm shadow-[2px_2px_0px_#0f172a] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all duration-100">
            PS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                ProbStat <span className="text-sky-600 dark:text-sky-400">Visualizer</span>
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-slate-900/30 dark:border-sky-800">
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
              px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all duration-100 cursor-pointer border-2 border-slate-900 dark:border-slate-700
              shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]
              hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-none
              active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
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
                border-2 border-slate-900 dark:border-slate-700 
                text-slate-900 dark:text-slate-100 
                text-xs font-heading font-bold rounded-xl px-3 py-1.5 pr-7 
                cursor-pointer focus:outline-none 
                shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]
                hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-none
                active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                transition-all duration-100
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
