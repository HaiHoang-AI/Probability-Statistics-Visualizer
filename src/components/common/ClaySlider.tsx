import React from 'react';

interface ClaySliderProps {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  color?: 'orange' | 'blue' | 'emerald' | 'purple' | 'rose' | 'amber';
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
}

export const ClaySlider: React.FC<ClaySliderProps> = ({
  label,
  sublabel,
  value,
  min,
  max,
  step = 1,
  unit = '',
  color = 'orange',
  onChange,
  formatValue,
}) => {
  const accentColors = {
    orange: 'accent-sky-600 bg-sky-100 dark:bg-slate-700',
    blue: 'accent-sky-600 bg-sky-100 dark:bg-slate-700',
    emerald: 'accent-emerald-600 bg-emerald-100 dark:bg-slate-700',
    purple: 'accent-indigo-600 bg-indigo-100 dark:bg-slate-700',
    rose: 'accent-rose-600 bg-rose-100 dark:bg-slate-700',
    amber: 'accent-sky-600 bg-sky-100 dark:bg-slate-700',
  };

  const badgeColors = {
    orange: 'bg-sky-600 text-white',
    blue: 'bg-sky-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    purple: 'bg-indigo-600 text-white',
    rose: 'bg-rose-600 text-white',
    amber: 'bg-sky-600 text-white',
  };

  const displayVal = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ''}`;

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-heading font-bold text-slate-900 dark:text-slate-100 text-xs">
            {label}
          </span>
          {sublabel && (
            <span className="ml-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              ({sublabel})
            </span>
          )}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold shadow-xs ${badgeColors[color]}`}>
          {displayVal}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 min-w-[24px]">
          {min}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${accentColors[color]}`}
        />
        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 min-w-[24px] text-right">
          {max}
        </span>
      </div>
    </div>
  );
};
