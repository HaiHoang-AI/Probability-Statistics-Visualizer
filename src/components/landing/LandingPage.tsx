import React from 'react';
import { ClayCard } from '../common/ClayCard';
import { ClayButton } from '../common/ClayButton';
import { CURRICULUM_DATA } from '../../data/curriculum';
import { ChapterId } from '../../types';

interface LandingPageProps {
  onSelectChapter: (id: ChapterId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectChapter }) => {
  const priorityChapters = CURRICULUM_DATA.filter((c) => c.isPriority);
  const foundationChapters = CURRICULUM_DATA.filter((c) => !c.isPriority);

  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION (Page 1 Style) */}
      <section className="pt-6 pb-2 text-center space-y-5 max-w-4xl mx-auto">
        {/* Tagline Badge */}
        <div className="inline-block">
          <span className="px-4 py-1.5 rounded-full text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]">
            MAT1101 — Xác suất Thống kê Tương tác (VNU-UET)
          </span>
        </div>

        {/* Main 2D Cartoon Title */}
        <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-tight">
          Trực Quan Hóa <span className="text-sky-600 dark:text-sky-400">Xác Suất & Thống Kê</span>
        </h1>

        {/* Concise Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
          Tương tác trực tiếp với các đồ thị mô phỏng 2D: kéo slider tích chập, kiểm chứng định lý giới hạn trung tâm và xoay đường hồi quy OLS thời gian thực.
        </p>

        {/* Dual CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
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

        {/* Stats Row (Page 1 10K+ / 2M+ / 500+ Style) */}
        <div className="pt-6 flex justify-center gap-8 sm:gap-16 font-mono text-center border-t-2 border-slate-900/10 dark:border-slate-800 max-w-md mx-auto">
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

      {/* CURRICULUM SECTION 1: PRIORITY CHAPTERS (Page 2 Card Grid) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2 border-b-2 border-slate-900/20 dark:border-slate-800 gap-1">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {priorityChapters.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => onSelectChapter(chapter.id)}
              className="
                bg-white dark:bg-slate-900 
                border-2 border-slate-900 dark:border-slate-700 
                shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] 
                hover:translate-x-[-1px] hover:translate-y-[-1px] 
                hover:shadow-[6px_6px_0px_#0f172a] dark:hover:shadow-[6px_6px_0px_#0284c7]
                rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-150
              "
            >
              <div className="space-y-3">
                {/* Header Pills */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-heading font-extrabold bg-sky-600 text-white border border-slate-900">
                    {chapter.number}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-sky-600 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-slate-800">
                    Ưu tiên
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
                    {chapter.titleVi}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {chapter.titleEn}
                  </p>
                </div>

                {/* Subtitle */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {chapter.subtitle}
                </p>

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
                <span className="text-xs font-heading font-bold text-sky-600 dark:text-sky-400 hover:underline">
                  Vào học
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CURRICULUM SECTION 2: FOUNDATION CHAPTERS */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2 border-b-2 border-slate-900/20 dark:border-slate-800 gap-1">
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
              className="
                bg-white dark:bg-slate-900 
                border-2 border-slate-900 dark:border-slate-700 
                shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] 
                hover:translate-x-[-1px] hover:translate-y-[-1px] 
                hover:shadow-[6px_6px_0px_#0f172a] dark:hover:shadow-[6px_6px_0px_#0284c7]
                rounded-3xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-150
              "
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-heading font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                    {chapter.number}
                  </span>
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

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {chapter.subtitle}
                </p>
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
      <section className="p-6 sm:p-8 rounded-3xl bg-sky-600 border-[2.5px] border-slate-900 text-white shadow-[6px_6px_0px_#0f172a] dark:shadow-[6px_6px_0px_#0284c7] text-center space-y-3 max-w-3xl mx-auto">
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
