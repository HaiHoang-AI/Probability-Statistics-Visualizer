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
    orange: 'accent-orange-500 bg-orange-100 dark:bg-orange-950/40',
    blue: 'accent-blue-500 bg-blue-100 dark:bg-blue-950/40',
    emerald: 'accent-emerald-500 bg-emerald-100 dark:bg-emerald-950/40',
    purple: 'accent-purple-500 bg-purple-100 dark:bg-purple-950/40',
    rose: 'accent-rose-500 bg-rose-100 dark:bg-rose-950/40',
    amber: 'accent-amber-500 bg-amber-100 dark:bg-amber-950/40',
  };

  const badgeColors = {
    orange: 'bg-orange-500 text-white shadow-orange-500/30',
    blue: 'bg-blue-500 text-white shadow-blue-500/30',
    emerald: 'bg-emerald-500 text-white shadow-emerald-500/30',
    purple: 'bg-purple-500 text-white shadow-purple-500/30',
    rose: 'bg-rose-500 text-white shadow-rose-500/30',
    amber: 'bg-amber-500 text-white shadow-amber-500/30',
  };

  const displayVal = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ''}`;

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-heading font-semibold text-slate-800 dark:text-slate-200 text-sm">
            {label}
          </span>
          {sublabel && (
            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
              ({sublabel})
            </span>
          )}
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold shadow-sm ${badgeColors[color]}`}>
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
