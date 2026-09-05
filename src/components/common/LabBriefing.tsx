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
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[3px_3px_0px_#0f172a] dark:shadow-[3px_3px_0px_#0284c7] overflow-hidden transition-all duration-200 mb-5">
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-sky-50 dark:bg-slate-800/80 border-b-2 border-slate-900/20 dark:border-slate-700/60 flex items-center justify-between cursor-pointer select-none hover:bg-sky-100/70 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
            ℹ
          </span>
          <span className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            {title}
          </span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
            (Đọc trước khi làm thí nghiệm)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
            {isExpanded ? 'Thu gọn ▲' : 'Xem giải thích ▼'}
          </span>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm leading-relaxed">
          {/* 1. Goal / Core Question */}
          <div className="flex items-start gap-2.5">
            <span className="text-base leading-none">🎯</span>
            <div>
              <div className="font-heading font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-0.5 text-sky-700 dark:text-sky-300">
                Vấn đề thực tế & Câu hỏi cốt lõi
              </div>
              <FormattedMathText
                as="p"
                className="text-slate-700 dark:text-slate-300 font-medium"
                text={question}
              />
            </div>
          </div>

          {/* 2. Formula & Mathematical Insight */}
          <div className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-base leading-none">📐</span>
            <div className="space-y-1.5 w-full">
              <div className="font-heading font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Bản chất toán học & Công thức
              </div>
              {formula && (
                <div className="overflow-x-auto py-1">
                  <MathView math={formula} block={true} />
                </div>
              )}
              <FormattedMathText
                as="p"
                className="text-slate-600 dark:text-slate-300 text-xs"
                text={mathExplanation}
              />
            </div>
          </div>

          {/* 3. What to do & observe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60">
              <div className="font-heading font-bold text-amber-900 dark:text-amber-300 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>🕹️</span> Cách tương tác thí nghiệm
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-amber-950 dark:text-amber-200">
                {howToInteract.map((step, idx) => (
                  <li key={idx} className="leading-snug">
                    <FormattedMathText text={step} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
              <div className="font-heading font-bold text-emerald-900 dark:text-emerald-300 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>🔍</span> Hiện tượng cần quan sát trên đồ thị
              </div>
              <FormattedMathText
                as="p"
                className="text-xs text-emerald-950 dark:text-emerald-200 leading-snug"
                text={whatToObserve}
              />
            </div>
          </div>

          {/* 4. Exam Takeaway / Key Takeaway */}
          <div className="p-2.5 rounded-xl bg-sky-100/80 dark:bg-sky-950/60 border-2 border-sky-300 dark:border-sky-800 flex items-center gap-2.5 text-xs text-sky-900 dark:text-sky-200 font-semibold">
            <span className="text-base">💡</span>
            <div>
              <span className="font-heading font-black mr-1 text-sky-700 dark:text-sky-300 uppercase">Chốt kiến thức:</span>
              <FormattedMathText text={takeaway} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
