import React, { useState } from 'react';
import { MathView } from './MathView';
import { FormattedMathText } from './FormattedMathText';

export interface LabBriefingProps {
  title?: string;
  question: string;
  formula?: string;
  mathExplanation: string;
  howToInteract: string[];
  whatToObserve: string;
  takeaway: string;
  defaultExpanded?: boolean;
}

export const LabBriefing: React.FC<LabBriefingProps> = ({
  title = 'Hướng dẫn & Bản chất Toán học',
  question,
  formula,
  mathExplanation,
  howToInteract,
  whatToObserve,
  takeaway,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 mb-5">
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-sky-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer select-none hover:bg-sky-100/70 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center text-sm font-black shadow-xs">
            ℹ
          </span>
          <span className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider">
            {title}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
            (Đọc trước khi làm thí nghiệm)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-sky-600 dark:text-sky-400">
            {isExpanded ? 'Thu gọn ▲' : 'Xem giải thích ▼'}
          </span>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-5 text-sm sm:text-base leading-relaxed">
          {/* 1. Goal / Core Question */}
          <div className="flex items-start gap-3">
            <div>
              <div className="font-heading font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider mb-1 text-sky-700 dark:text-sky-300">
                Vấn đề thực tế & Câu hỏi cốt lõi
              </div>
              <FormattedMathText
                as="p"
                className="text-slate-900 dark:text-slate-100 text-sm sm:text-base font-semibold leading-relaxed"
                text={question}
              />
            </div>
          </div>

          {/* 2. Formula & Mathematical Insight */}
          <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="space-y-2 w-full">
              <div className="font-heading font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Bản chất toán học & Công thức
              </div>
              {formula && (
                <div className="overflow-x-auto py-2 text-base sm:text-lg">
                  <MathView math={formula} block={true} />
                </div>
              )}
              <FormattedMathText
                as="p"
                className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-normal"
                text={mathExplanation}
              />
            </div>
          </div>

          {/* 3. What to do & observe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50/80 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60">
              <div className="font-heading font-bold text-amber-900 dark:text-amber-300 text-xs sm:text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                Cách tương tác thí nghiệm
              </div>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-[15px] text-amber-950 dark:text-amber-100 leading-relaxed">
                {howToInteract.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <FormattedMathText text={step} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60">
              <div className="font-heading font-bold text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                Hiện tượng cần quan sát trên đồ thị
              </div>
              <FormattedMathText
                as="p"
                className="text-sm sm:text-[15px] text-emerald-950 dark:text-emerald-100 leading-relaxed font-normal"
                text={whatToObserve}
              />
            </div>
          </div>

          {/* 4. Exam Takeaway / Key Takeaway */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-100/90 dark:bg-sky-950/70 border-2 border-sky-300 dark:border-sky-800 flex items-start gap-3 text-sm sm:text-base text-sky-950 dark:text-sky-100 leading-relaxed">
            <div>
              <span className="font-heading font-black mr-2 text-sky-800 dark:text-sky-300 uppercase tracking-wide">Chốt kiến thức:</span>
              <FormattedMathText text={takeaway} className="font-medium" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
