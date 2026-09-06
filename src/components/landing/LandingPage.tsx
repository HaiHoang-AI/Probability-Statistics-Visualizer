import React from 'react';
import { ClayCard } from '../common/ClayCard';
import { ClayButton } from '../common/ClayButton';
import { CURRICULUM_DATA } from '../../data/curriculum';
import { ChapterId } from '../../types';

interface LandingPageProps {
  onSelectChapter: (id: ChapterId) => void;
}

const getChapterIcon = (id: ChapterId) => {
  switch (id) {
    case 'ch7-1-derived':
      return (
        <div className="w-11 h-11 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-sky-100 dark:bg-sky-950/60 shadow-xs flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 stroke-slate-900 dark:stroke-sky-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 18c4 0 4-12 8-12s4 12 8 12 4-6 4-6" />
          </svg>
        </div>
      );
    case 'ch7-2-mgf':
      return (
        <div className="w-11 h-11 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-purple-100 dark:bg-purple-950/60 shadow-xs flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 stroke-slate-900 dark:stroke-purple-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20c4-1 8-5 11-10 2-3.5 3-5 5-6" />
            <path d="M2 20h20" />
            <path d="M8 20v-5" />
          </svg>
        </div>
      );
    case 'ch8-limit-theorems':
      return (
        <div className="w-11 h-11 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-emerald-100 dark:bg-emerald-950/60 shadow-xs flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 stroke-slate-900 dark:stroke-emerald-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 20h20" />
            <path d="M4 20c3 0 5-14 8-14s5 14 8 14" />
          </svg>
        </div>
      );
    case 'ch9-bayesian':
      return (
        <div className="w-11 h-11 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-indigo-100 dark:bg-indigo-950/60 shadow-xs flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 stroke-slate-900 dark:stroke-indigo-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18" />
            <path d="M6 7l6-2 6 2" />
            <path d="m3 13 3-6 3 6a3 3 0 0 1-6 0Z" />
            <path d="m15 15 3-6 3 6a3 3 0 0 1-6 0Z" />
          </svg>
        </div>
      );
    case 'ch10-1-estimation':
      return (
        <div className="w-11 h-11 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-rose-100 dark:bg-rose-950/60 shadow-xs flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 stroke-slate-900 dark:stroke-rose-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18" />
            <path d="M3 12h18" />
          </svg>
        </div>
      );
    case 'ch10-2-hypothesis':
      return (
        <div className="w-11 h-11 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-amber-100 dark:bg-amber-950/60 shadow-xs flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 stroke-slate-900 dark:stroke-amber-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 20h18" />
            <path d="M3 20c2 0 4-10 6-10s4 10 6 10" />
            <path d="M12 20c2 0 4-10 6-10s2 7 3 10" strokeDasharray="2 2" />
            <line x1="14" y1="5" x2="14" y2="20" strokeWidth="1.5" />
          </svg>
        </div>
      );
    case 'ch11-regression':
      return (
        <div className="w-11 h-11 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-sky-100 dark:bg-sky-950/60 shadow-xs flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 stroke-slate-900 dark:stroke-sky-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m7 17 12-12" />
            <circle cx="8" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="15" r="1.5" fill="currentColor" />
            <circle cx="16" cy="7" r="1.5" fill="currentColor" />
          </svg>
        </div>
      );
    case 'ch1-foundations':
      return (
        <div className="w-10 h-10 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-xs flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 stroke-slate-900 dark:stroke-slate-200" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="12" r="5" />
            <circle cx="15" cy="12" r="5" />
          </svg>
        </div>
      );
    case 'ch2-basic-prob':
      return (
        <div className="w-10 h-10 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-teal-100 dark:bg-teal-950/60 shadow-xs flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 stroke-slate-900 dark:stroke-teal-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="16" height="16" x="4" y="4" rx="3" />
            <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
            <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </svg>
        </div>
      );
    case 'ch3-discrete-rv':
      return (
        <div className="w-10 h-10 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-violet-100 dark:bg-violet-950/60 shadow-xs flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 stroke-slate-900 dark:stroke-violet-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 20V10" />
            <path d="M12 20V4" />
            <path d="M6 20v-6" />
            <path d="M2 20h20" />
          </svg>
        </div>
      );
    case 'ch4-continuous-rv':
    default:
      return (
        <div className="w-10 h-10 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-cyan-100 dark:bg-cyan-950/60 shadow-xs flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 stroke-slate-900 dark:stroke-cyan-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 18c3-2 6-12 10-12s7 10 10 12" />
            <path d="M2 20h20" />
          </svg>
        </div>
      );
  }
};

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectChapter }) => {
  const priorityChapters = CURRICULUM_DATA.filter((c) => c.isPriority);
  const foundationChapters = CURRICULUM_DATA.filter((c) => !c.isPriority);

  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION (Page 1 Style) */}
      <section className="pt-6 pb-2 text-center space-y-5 max-w-4xl mx-auto">
        {/* Tagline Badge */}
        <div className="inline-block">
          <span className="px-4 py-1.5 rounded-full text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs transition-all duration-150 inline-block cursor-default select-none">
            MAT1101 — Xác suất Thống kê Tương tác (VNU-UET)
          </span>
        </div>

        {/* Main 2D Cartoon Title (Single Line, No Scrollbar) */}
        <div className="py-2">
          <h1 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl lg:text-[46px] text-slate-900 dark:text-white tracking-tight leading-tight">
            Trực Quan Hóa <span className="text-sky-600 dark:text-sky-400">Xác Suất Thống Kê</span>
          </h1>
        </div>

        {/* Dual CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <ClayButton
            variant="primary"
            size="lg"
            onClick={() => {
              document.getElementById('priority-chapters-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Bắt đầu học ngay (Bài 7 - 11)
          </ClayButton>

          <ClayButton
            variant="outline"
            size="lg"
            onClick={() => {
              document.getElementById('foundation-chapters-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Phần cơ sở (Bài 1 - 6)
          </ClayButton>
        </div>

        {/* Stats Row */}
        <div className="pt-4 flex justify-center gap-8 sm:gap-16 font-mono text-center border-t border-slate-200 dark:border-slate-800 max-w-md mx-auto">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">11</div>
            <div className="text-xs font-sans text-slate-500 dark:text-slate-400 font-bold mt-0.5">Bài học</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">20+</div>
            <div className="text-xs font-sans text-slate-500 dark:text-slate-400 font-bold mt-0.5">Mô phỏng</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">100%</div>
            <div className="text-xs font-sans text-slate-500 dark:text-slate-400 font-bold mt-0.5">Trực quan 2D</div>
          </div>
        </div>
      </section>

      {/* 4 FEATURE CARDS WITH PASTEL ICON BOXES (Matching media_1788535946795.png) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-sm active:scale-[0.98] rounded-2xl p-4 text-center flex flex-col items-center gap-2.5 transition-all duration-150 cursor-pointer select-none">
          <div className="w-12 h-12 rounded-2xl bg-rose-200 dark:bg-rose-950/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-center">
            <svg className="w-6 h-6 stroke-slate-900 dark:stroke-rose-200" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>
          <span className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
            Tự do học theo tiến độ
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-sm active:scale-[0.98] rounded-2xl p-4 text-center flex flex-col items-center gap-2.5 transition-all duration-150 cursor-pointer select-none">
          <div className="w-12 h-12 rounded-2xl bg-sky-200 dark:bg-sky-950/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-center">
            <svg className="w-6 h-6 stroke-slate-900 dark:stroke-sky-200" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="12" rx="2" />
              <path d="M8 20h8" />
              <path d="M12 16v4" />
            </svg>
          </div>
          <span className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
            Mô phỏng trực quan 2D
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-sm active:scale-[0.98] rounded-2xl p-4 text-center flex flex-col items-center gap-2.5 transition-all duration-150 cursor-pointer select-none">
          <div className="w-12 h-12 rounded-2xl bg-purple-200 dark:bg-purple-950/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-center">
            <svg className="w-6 h-6 stroke-slate-900 dark:stroke-purple-200" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6" />
              <path d="m15.5 14 2 7-5.5-3-5.5 3 2-7" />
              <path d="m9 8 2 2 4-4" />
            </svg>
          </div>
          <span className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
            Chuẩn ĐH Công Nghệ
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-sm active:scale-[0.98] rounded-2xl p-4 text-center flex flex-col items-center gap-2.5 transition-all duration-150 cursor-pointer select-none">
          <div className="w-12 h-12 rounded-2xl bg-emerald-200 dark:bg-emerald-950/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-center">
            <svg className="w-6 h-6 stroke-slate-900 dark:stroke-emerald-200" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
            Tương tác không giới hạn
          </span>
        </div>
      </section>

      {/* NEW VISUAL INNOVATIONS SHOWCASE */}
      <section className="space-y-4 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2 border-b border-slate-200 dark:border-slate-800 gap-1">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-1">
              Tính năng Nâng cấp Mới
            </div>
            <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
              Phòng Thí Nghiệm Trực Quan Đột Phá
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Các mô hình đồ họa động, mô phỏng hạt và không gian 3D tương tác thế hệ mới.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            Click vào thẻ để vào thẳng lab
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Galton Board */}
          <div
            onClick={() => onSelectChapter('ch8-limit-theorems')}
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Bài 8 • Tab 5
              </span>
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mt-1 group-hover:text-sky-600 transition-colors">
                Bàn Galton Cơ học (Quincunx)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Bi rơi qua mạng lưới chốt tam giác kèm âm thanh va chạm, tự động hội tụ thành đường cong Gauss.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
              <span>Trải nghiệm ngay</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* Card 2: Particle Simulation */}
          <div
            onClick={() => onSelectChapter('ch3-discrete-rv')}
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Bài 3 & 4 • Nút Chuyển Chế Độ
              </span>
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mt-1 group-hover:text-amber-600 transition-colors">
                Mô Phỏng Mưa Hạt Rơi
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Hàng ngàn hạt rơi theo hàm khối xác suất cho 5 phân bố: Bernoulli, Đều, Nhị thức, Hình học, Poisson.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>Trải nghiệm ngay</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* Card 3: 3D Surface & Heatmap */}
          <div
            onClick={() => onSelectChapter('ch7-1-derived')}
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Bài 7.1 • Tab 2
              </span>
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mt-1 group-hover:text-purple-600 transition-colors">
                Mặt Cong 3D & Heatmap 2D
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Xoay 360° bề mặt phân phối Gauss 2D (Three.js WebGL) và bản đồ nhiệt màu biến dạng theo hệ số tương quan.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
              <span>Trải nghiệm ngay</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* Card 4: Bayes Sankey Flow */}
          <div
            onClick={() => onSelectChapter('ch9-bayesian')}
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Bài 9 • Tab 4
              </span>
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mt-1 group-hover:text-rose-600 transition-colors">
                Dòng Chảy Phân Nhánh Bayes
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Sankey Flow trực quan hóa dòng chảy xác suất giải mã nghịch lý Ảo giác Tỷ lệ nền (Base Rate Fallacy).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
              <span>Trải nghiệm ngay</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM SECTION 1: PRIORITY CHAPTERS (Page 2 Card Grid) */}
      <section id="priority-chapters-section" className="space-y-4 scroll-mt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2 border-b border-slate-200 dark:border-slate-800 gap-1">
          <div>
            <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
              Phần Trọng Tâm (Bài 7 — Bài 11)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Các bài học trọng điểm thi cuối kỳ: Tích chập, MGF, CLT, Bayes, Ước lượng & Hồi quy.
            </p>
          </div>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 font-mono">
            {priorityChapters.length} Bài học ưu tiên
          </span>
        </div>

        {/* Priority Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {priorityChapters.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => onSelectChapter(chapter.id)}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md active:scale-[0.98] rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-150"
            >
              <div className="space-y-3">
                {/* Header Row: Icon box + number badge + Priority badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {getChapterIcon(chapter.id)}
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-heading font-extrabold bg-sky-600 text-white border border-slate-200 dark:border-slate-700">
                      {chapter.number}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-sky-600 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-slate-800">
                    Ưu tiên
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                    {chapter.titleVi}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    {chapter.titleEn}
                  </p>
                </div>

                {/* Mini Lab Tags (No long wordy subtitle!) */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {chapter.modules.map((m) => (
                    <span 
                      key={m.id} 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                    >
                      {m.tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {chapter.modules.length} Phòng thí nghiệm
                </span>
                <span className="text-xs font-heading font-bold text-sky-600 dark:text-sky-400 hover:underline">
                  Vào học
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CURRICULUM SECTION 2: FOUNDATION CHAPTERS */}
      <section id="foundation-chapters-section" className="space-y-4 pt-2 scroll-mt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2 border-b border-slate-200 dark:border-slate-800 gap-1">
          <div>
            <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
              Phần Cơ Sở (Bài 1 — Bài 6)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nền tảng xác suất cổ điển, biến ngẫu nhiên rời rạc và liên tục.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {foundationChapters.length} Bài học cơ sở
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {foundationChapters.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => onSelectChapter(chapter.id)}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md active:scale-[0.98] rounded-3xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-150"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getChapterIcon(chapter.id)}
                    <span className="px-2 py-0.5 rounded-lg text-xs font-heading font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                      {chapter.number}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {chapter.modules.length} Labs
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    {chapter.titleVi}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {chapter.titleEn}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <span className="text-xs font-heading font-bold text-sky-600 dark:text-sky-400 hover:underline">
                  Mở Lab
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ENROLLMENT / LEARNING CTA BANNER (Page 5 Flat Style) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-sky-600 border border-slate-200/80 dark:border-slate-800 text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150 text-center space-y-3 max-w-3xl mx-auto">
        <h3 className="font-heading font-black text-2xl sm:text-3xl">
          Sẵn sàng khám phá phòng thí nghiệm?
        </h3>
        <p className="text-xs sm:text-sm text-sky-100 max-w-lg mx-auto">
          Lựa chọn một trong các thí nghiệm trực quan nổi bật bên dưới để bắt đầu tương tác ngay:
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <ClayButton
            variant="secondary"
            size="md"
            onClick={() => onSelectChapter('ch8-limit-theorems')}
          >
            Định lý Giới hạn CLT
          </ClayButton>
          <ClayButton
            variant="outline"
            size="md"
            onClick={() => onSelectChapter('ch11-regression')}
          >
            Hồi quy Tuyến tính OLS
          </ClayButton>
        </div>
      </section>
    </div>
  );
};
