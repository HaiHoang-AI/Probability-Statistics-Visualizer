import React from 'react';
import { MathView } from './MathView';

interface DesmosStageHeaderProps {
  title: string;
  formula?: string;
  badge?: string;
  onReset?: () => void;
  show3DAxes?: boolean;
  extraActions?: React.ReactNode;
}

export const DesmosStageHeader: React.FC<DesmosStageHeaderProps> = ({
  title,
  formula,
  badge,
  onReset,
  show3DAxes = true,
  extraActions,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 rounded-t-[1.4rem]">
      {/* Left: Title & Formula HUD */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {show3DAxes && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold shadow-xs">
              <span className="text-red-500 font-extrabold">X</span>
              <span className="text-slate-300">·</span>
              <span className="text-emerald-500 font-extrabold">Y</span>
              <span className="text-slate-300">·</span>
              <span className="text-sky-500 font-extrabold">Z</span>
            </div>
          )}
          <span className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white">
            {title}
          </span>
        </div>

        {formula && (
          <div className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-xs font-mono font-semibold">
            <MathView math={formula} />
          </div>
        )}

        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {badge}
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {extraActions}
        {onReset && (
          <button
            onClick={onReset}
            className="px-2.5 py-1 text-[11px] font-heading font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all"
            title="Đặt lại góc nhìn đồ thị"
          >
            Reset View
          </button>
        )}
      </div>
    </div>
  );
};
