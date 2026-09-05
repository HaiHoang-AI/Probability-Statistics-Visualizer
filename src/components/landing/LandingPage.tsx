import React from 'react';
import { ClayCard } from '../common/ClayCard';
import { ClayButton } from '../common/ClayButton';
import { CURRICULUM_DATA } from '../../data/curriculum';
import { ChapterId } from '../../types';

interface LandingPageProps {
  onSelectChapter: (id: ChapterId) => void;
}

const CHAPTER_MASCOTS: Partial<Record<ChapterId, { src: string; bg: string; border: string }>> = {
  'overview': {
    src: '/roxy/roxy_hero.png',
    bg: 'bg-sky-100 dark:bg-sky-950/60',
    border: 'border-sky-300 dark:border-sky-800',
  },
  'ch7-1-derived': {
    src: '/roxy/roxy_chibi_magic.png',
    bg: 'bg-sky-100 dark:bg-sky-950/60',
    border: 'border-sky-300 dark:border-sky-800',
  },
  'ch7-2-mgf': {
    src: '/roxy/roxy_grimoire.png',
    bg: 'bg-purple-100 dark:bg-purple-950/60',
    border: 'border-purple-300 dark:border-purple-800',
  },
  'ch8-limit-theorems': {
    src: '/roxy/roxy_teacher.png',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    border: 'border-emerald-300 dark:border-emerald-800',
  },
  'ch9-bayesian': {
    src: '/roxy/roxy_thinking.png',
    bg: 'bg-indigo-100 dark:bg-indigo-950/60',
    border: 'border-indigo-300 dark:border-indigo-800',
  },
  'ch10-1-estimation': {
    src: '/roxy/roxy_chibi_teaching.png',
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    border: 'border-rose-300 dark:border-rose-800',
  },
  'ch10-2-hypothesis': {
    src: '/roxy/roxy_potion.png',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    border: 'border-amber-300 dark:border-amber-800',
  },
  'ch11-regression': {
    src: '/roxy/roxy_thinking.png',
    bg: 'bg-sky-100 dark:bg-sky-950/60',
    border: 'border-sky-300 dark:border-sky-800',
  },
  'ch1-foundations': {
    src: '/roxy/roxy_chibi_reading.png',
    bg: 'bg-slate-100 dark:bg-slate-800',
    border: 'border-slate-300 dark:border-slate-700',
  },
  'ch2-basic-prob': {
    src: '/roxy/roxy_chibi_dice.png',
    bg: 'bg-teal-100 dark:bg-teal-950/60',
    border: 'border-teal-300 dark:border-teal-800',
  },
  'ch3-discrete-rv': {
    src: '/roxy/roxy_chibi_wink.png',
    bg: 'bg-violet-100 dark:bg-violet-950/60',
    border: 'border-violet-300 dark:border-violet-800',
  },
  'ch4-continuous-rv': {
    src: '/roxy/roxy_chibi_teaching.png',
    bg: 'bg-cyan-100 dark:bg-cyan-950/60',
    border: 'border-cyan-300 dark:border-cyan-800',
  },
};

const getChapterMascotBox = (id: ChapterId, isLarge = true) => {
  const item = CHAPTER_MASCOTS[id] || {
    src: '/roxy/roxy_avatar_smile.png',
    bg: 'bg-sky-100 dark:bg-slate-800',
    border: 'border-sky-300 dark:border-sky-700',
  };
  const size = isLarge ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10 rounded-xl';
  return (
    <div
      className={`${size} border-2 border-slate-900 dark:border-slate-700 ${item.bg} shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform p-1`}
    >
      <img
        src={item.src}
        alt="Roxy mascot"
        className="w-full h-full object-contain select-none pointer-events-none"
        loading="lazy"
      />
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectChapter }) => {
  const priorityChapters = CURRICULUM_DATA.filter((c) => c.isPriority);
  const foundationChapters = CURRICULUM_DATA.filter((c) => !c.isPriority);

  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION WITH ROXY MASCOT */}
      <section className="pt-4 pb-2 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Heading, Dialogue Bubble & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-5">
            {/* Tagline Badge */}
            <div className="inline-block">
              <span className="px-4 py-1.5 rounded-full text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150 inline-block cursor-default select-none">
                MAT1101 — Xác suất Thống kê Tương tác (VNU-UET)
              </span>
            </div>

            {/* Main Title (Single Line) */}
            <div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl lg:text-[42px] text-slate-900 dark:text-white tracking-tight leading-tight">
                Trực Quan Hóa <span className="text-sky-600 dark:text-sky-400">Xác Suất Thống Kê</span>
              </h1>
            </div>

            {/* Roxy Mascot Dialogue Bubble */}
            <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-4 shadow-[3px_3px_0px_#0f172a] dark:shadow-[3px_3px_0px_#0284c7] text-left max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
                <span className="text-[11px] font-heading font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Roxy Migurdia — Cố Vấn Học Tập
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                &ldquo;Chào bạn! Cùng mình khám phá ma thuật của Tích chập biến ngẫu nhiên, Định lý Giới hạn CLT và Hồi quy OLS qua các mô phỏng trực quan 2D nhé!&rdquo;
              </p>
            </div>

            {/* Dual CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
              <ClayButton
                variant="primary"
                size="lg"
                onClick={() => onSelectChapter('ch8-limit-theorems')}
              >
                Bắt đầu học ngay (Bài 7 - 11)
              </ClayButton>

              <ClayButton
                variant="outline"
                size="lg"
                onClick={() => onSelectChapter('ch1-foundations')}
              >
                Phần cơ sở (Bài 1 - 6)
              </ClayButton>
            </div>

            {/* Stats Row */}
            <div className="pt-3 flex justify-center lg:justify-start gap-8 sm:gap-12 font-mono border-t-2 border-slate-900/10 dark:border-slate-800 max-w-md mx-auto lg:mx-0">
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
          </div>

          {/* Right Column: Hero Mascot Artwork */}
          <div className="lg:col-span-5 flex justify-center select-none">
            <div className="relative max-w-[320px] sm:max-w-[360px] w-full">
              <div className="relative bg-gradient-to-b from-sky-50 to-sky-100/60 dark:from-slate-800 dark:to-slate-900/90 border-[2.5px] border-slate-900 dark:border-slate-700 rounded-3xl p-3 shadow-[6px_6px_0px_#0f172a] dark:shadow-[6px_6px_0px_#0284c7] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#0f172a] dark:hover:shadow-[4px_4px_0px_#0284c7] transition-all duration-150 group">
                <img
                  src="/roxy/roxy_hero.png"
                  alt="Roxy Migurdia - Đại Pháp Sư Xác Suất Thống Kê"
                  className="w-full h-auto object-contain rounded-2xl group-hover:scale-[1.02] transition-transform duration-200"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-full shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] text-[11px] font-heading font-black text-slate-800 dark:text-slate-100 whitespace-nowrap">
                  Thủy Thần Cấp Pháp Sư ✦
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4 FEATURE CARDS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_#0f172a] dark:shadow-[3px_3px_0px_#0284c7] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#0f172a] dark:hover:shadow-[1px_1px_0px_#0284c7] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none rounded-2xl p-4 text-center flex flex-col items-center gap-2.5 transition-all duration-150 cursor-pointer select-none">
          <div className="w-12 h-12 rounded-2xl bg-rose-200 dark:bg-rose-950/80 border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center">
            <svg className="w-6 h-6 stroke-slate-900 dark:stroke-rose-200" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>
          <span className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
            Tự do học theo tiến độ
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_#0f172a] dark:shadow-[3px_3px_0px_#0284c7] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#0f172a] dark:hover:shadow-[1px_1px_0px_#0284c7] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none rounded-2xl p-4 text-center flex flex-col items-center gap-2.5 transition-all duration-150 cursor-pointer select-none">
          <div className="w-12 h-12 rounded-2xl bg-sky-200 dark:bg-sky-950/80 border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center">
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

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_#0f172a] dark:shadow-[3px_3px_0px_#0284c7] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#0f172a] dark:hover:shadow-[1px_1px_0px_#0284c7] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none rounded-2xl p-4 text-center flex flex-col items-center gap-2.5 transition-all duration-150 cursor-pointer select-none">
          <div className="w-12 h-12 rounded-2xl bg-purple-200 dark:bg-purple-950/80 border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center">
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

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_#0f172a] dark:shadow-[3px_3px_0px_#0284c7] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#0f172a] dark:hover:shadow-[1px_1px_0px_#0284c7] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none rounded-2xl p-4 text-center flex flex-col items-center gap-2.5 transition-all duration-150 cursor-pointer select-none">
          <div className="w-12 h-12 rounded-2xl bg-emerald-200 dark:bg-emerald-950/80 border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center">
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

      {/* CURRICULUM SECTION 1: PRIORITY CHAPTERS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2 border-b-2 border-slate-900/20 dark:border-slate-800 gap-1">
          <div className="flex items-center gap-3">
            <img
              src="/roxy/roxy_teacher.png"
              alt="Roxy Teacher Mascot"
              className="w-10 h-10 object-contain rounded-xl border border-slate-900 bg-emerald-50 dark:bg-slate-800 p-0.5"
            />
            <div>
              <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                Phần Trọng Tâm (Bài 7 — Bài 11)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Các bài học trọng điểm thi cuối kỳ: Tích chập, MGF, CLT, Bayes, Ước lượng & Hồi quy.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 font-mono">
            {priorityChapters.length} Bài học ưu tiên
          </span>
        </div>

        {/* Priority Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {priorityChapters.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => onSelectChapter(chapter.id)}
              className="
                group
                bg-white dark:bg-slate-900 
                border-2 border-slate-900 dark:border-slate-700 
                shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] 
                hover:translate-x-[2.5px] hover:translate-y-[2.5px] 
                hover:shadow-[1.5px_1.5px_0px_#0f172a] dark:hover:shadow-[1.5px_1.5px_0px_#0284c7]
                active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-150
              "
            >
              <div className="space-y-3">
                {/* Header Row: Mascot Box + Number Badge + Priority Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {getChapterMascotBox(chapter.id, true)}
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-heading font-extrabold bg-sky-600 text-white border border-slate-900">
                      {chapter.number}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-sky-600 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-slate-800">
                    Ưu tiên
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {chapter.titleVi}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    {chapter.titleEn}
                  </p>
                </div>

                {/* Mini Lab Tags */}
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
                <span className="text-xs font-heading font-bold text-sky-600 dark:text-sky-400 group-hover:underline">
                  Vào học →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CURRICULUM SECTION 2: FOUNDATION CHAPTERS */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2 border-b-2 border-slate-900/20 dark:border-slate-800 gap-1">
          <div className="flex items-center gap-3">
            <img
              src="/roxy/roxy_chibi_reading.png"
              alt="Roxy Reading Mascot"
              className="w-9 h-9 object-contain rounded-xl border border-slate-900 bg-slate-100 dark:bg-slate-800 p-0.5"
            />
            <div>
              <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                Phần Cơ Sở (Bài 1 — Bài 6)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nền tảng xác suất cổ điển, biến ngẫu nhiên rời rạc và liên tục.
              </p>
            </div>
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
              className="
                group
                bg-white dark:bg-slate-900 
                border-2 border-slate-900 dark:border-slate-700 
                shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] 
                hover:translate-x-[2.5px] hover:translate-y-[2.5px] 
                hover:shadow-[1.5px_1.5px_0px_#0f172a] dark:hover:shadow-[1.5px_1.5px_0px_#0284c7]
                active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                rounded-3xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-150
              "
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getChapterMascotBox(chapter.id, false)}
                    <span className="px-2 py-0.5 rounded-lg text-xs font-heading font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                      {chapter.number}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {chapter.modules.length} Labs
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {chapter.titleVi}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {chapter.titleEn}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <span className="text-xs font-heading font-bold text-sky-600 dark:text-sky-400 group-hover:underline">
                  Mở Lab →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ENROLLMENT / LEARNING CTA BANNER WITH ROXY */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-sky-600 border-[2.5px] border-slate-900 text-white shadow-[6px_6px_0px_#0f172a] dark:shadow-[6px_6px_0px_#0284c7] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_#0f172a] dark:hover:shadow-[3px_3px_0px_#0284c7] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all duration-150 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2 max-w-xl">
            <span className="inline-block px-3 py-0.5 rounded-full bg-sky-700/90 border border-sky-300/40 text-[10px] font-heading font-extrabold tracking-wider uppercase">
              Thực Hành Tương Tác
            </span>
            <h3 className="font-heading font-black text-2xl sm:text-3xl">
              Sẵn sàng khám phá phòng thí nghiệm?
            </h3>
            <p className="text-xs sm:text-sm text-sky-100">
              Lựa chọn một trong các thí nghiệm trực quan nổi bật bên dưới để bắt đầu tương tác ngay:
            </p>
            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
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
          </div>
          <div className="shrink-0 select-none">
            <img
              src="/roxy/roxy_chibi_magic.png"
              alt="Roxy Water Magic"
              className="w-32 sm:w-40 h-auto object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
