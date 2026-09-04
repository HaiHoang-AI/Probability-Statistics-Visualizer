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
      {/* HERO SECTION */}
      <section className="relative pt-6 pb-4">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-400/15 dark:bg-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-purple-400/15 dark:bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/80 shadow-sm">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-orange-700 dark:text-orange-300">
              Nền tảng Học tập Trực quan Hóa MAT1101 — VNU-UET
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-tight">
            Hình dung <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500">Xác suất Thống kê</span> bằng Trực quan Sinh động
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Biến các công thức trừu tượng thành trải nghiệm trực quan. Tương tác với từng lát cắt tích chập, kéo thanh trượt định lý CLT, cập nhật niềm tin Bayes và quan sát hình vuông phần dư hồi quy OLS thời gian thực.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <ClayButton
              variant="primary"
              size="lg"
              onClick={() => onSelectChapter('ch8-limit-theorems')}
              className="shadow-lg shadow-orange-500/30"
            >
              Vào Thí Nghiệm Bài 7 - 11 (Ưu tiên)
            </ClayButton>

            <ClayButton
              variant="outline"
              size="lg"
              onClick={() => onSelectChapter('ch1-foundations')}
            >
              Bắt đầu từ Bài 1 (Cơ sở)
            </ClayButton>
          </div>

          {/* Feature Badges Row */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs font-heading font-bold text-slate-700 dark:text-slate-300">
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm text-center">
              20+ Phòng Thí Nghiệm
            </div>
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm text-center">
              Song ngữ Anh - Việt
            </div>
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm text-center">
              Công thức KaTeX Chuẩn
            </div>
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm text-center">
              Chế độ Sáng & Tối
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM SECTION 1: PRIORITY CHAPTERS (7-11) */}
      <section className="space-y-6">
        <div className="border-b border-amber-200 dark:border-slate-800 pb-4">
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
            Phần Trọng Tâm: Bài 7 đến Bài 11 (Ưu tiên)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Nội dung trọng tâm: Biến ngẫu nhiên dẫn xuất, MGF, Định lý giới hạn, Suy luận Bayes, Ước lượng cổ điển & Hồi quy tuyến tính.
          </p>
        </div>

        {/* Priority Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {priorityChapters.map((chapter) => (
            <ClayCard
              key={chapter.id}
              glowColor="orange"
              className="flex flex-col justify-between hover:scale-[1.02] cursor-pointer group"
            >
              <div onClick={() => onSelectChapter(chapter.id)} className="space-y-3">
                {/* Header Pills */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl text-xs font-heading font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm">
                    {chapter.number}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 group-hover:text-orange-500 transition-colors">
                    {chapter.modules.length} Phòng thí nghiệm
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                    {chapter.titleVi}
                  </h3>
                  <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {chapter.titleEn}
                  </p>
                </div>

                {/* Subtitle */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {chapter.subtitle}
                </p>

                {/* Labs list preview */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  {chapter.modules.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate pr-2">
                        - {m.titleVi}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${m.badgeColor}`}>
                        {m.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 truncate max-w-[170px]">
                  {chapter.lecturePdf}
                </span>
                <ClayButton
                  variant="primary"
                  size="sm"
                  onClick={() => onSelectChapter(chapter.id)}
                >
                  Khám phá
                </ClayButton>
              </div>
            </ClayCard>
          ))}
        </div>
      </section>

      {/* CURRICULUM SECTION 2: FOUNDATION CHAPTERS (1-6) */}
      <section className="space-y-6 pt-6">
        <div className="border-b border-amber-200 dark:border-slate-800 pb-4">
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
            Phần Cơ Sở: Bài 1 đến Bài 6
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Nền tảng xác suất cổ điển, các nghịch lý kinh điển, biến ngẫu nhiên rời rạc và liên tục.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {foundationChapters.map((chapter) => (
            <ClayCard
              key={chapter.id}
              glowColor="blue"
              className="flex flex-col justify-between hover:scale-[1.02] cursor-pointer group"
            >
              <div onClick={() => onSelectChapter(chapter.id)} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-heading font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {chapter.number}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {chapter.modules.length} Labs
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                    {chapter.titleVi}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    {chapter.titleEn}
                  </p>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {chapter.subtitle}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <ClayButton
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectChapter(chapter.id)}
                >
                  Mở Lab
                </ClayButton>
              </div>
            </ClayCard>
          ))}
        </div>
      </section>

      {/* ENROLLMENT / LEARNING CTA BANNER */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm inline-block">
            Sẵn sàng làm chủ môn Xác suất Thống kê?
          </span>
          <h3 className="font-heading font-black text-3xl sm:text-4xl">
            Bắt đầu khám phá ngay hôm nay — Hoàn toàn Miễn phí
          </h3>
          <p className="text-sm sm:text-base text-orange-50">
            Ứng dụng được thiết kế bám sát 100% giáo trình MAT1101 Xác suất Thống kê của Trường ĐH Công nghệ (VNU-UET).
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <ClayButton
              variant="outline"
              size="md"
              className="bg-white text-orange-600 border-white hover:bg-orange-50"
              onClick={() => onSelectChapter('ch8-limit-theorems')}
            >
              Thử nghiệm CLT Lab
            </ClayButton>
            <ClayButton
              variant="outline"
              size="md"
              className="bg-orange-600/60 text-white border-white/40 hover:bg-orange-600"
              onClick={() => onSelectChapter('ch11-regression')}
            >
              Thử nghiệm Hồi quy OLS
            </ClayButton>
          </div>
        </div>
      </section>
    </div>
  );
};
