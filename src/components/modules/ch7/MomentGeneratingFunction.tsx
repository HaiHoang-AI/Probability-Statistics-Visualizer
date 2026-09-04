import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { MathView } from '../../common/MathView';
import { fmt } from '../../../utils/math';
import { Sparkles, Info, TrendingUp } from 'lucide-react';

export const MomentGeneratingFunction: React.FC = () => {
  const [dist, setDist] = useState<'poisson' | 'exponential' | 'normal'>('poisson');
  const [param, setParam] = useState<number>(2.0); // lambda for poisson/exp, or mu for normal
  const [showTangent, setShowTangent] = useState<boolean>(true);
  const [showParabola, setShowParabola] = useState<boolean>(true);

  // Theoretical moments based on distribution
  let mean = 0;
  let variance = 0;
  let moment2 = 0;
  let mgfFormula = '';
  let titleParam = '';

  if (dist === 'poisson') {
    mean = param;
    variance = param;
    moment2 = variance + mean * mean;
    mgfFormula = `M_X(s) = e^{${param}(e^s - 1)}`;
    titleParam = `\\lambda = ${param}`;
  } else if (dist === 'exponential') {
    mean = 1 / param;
    variance = 1 / (param * param);
    moment2 = variance + mean * mean;
    mgfFormula = `M_X(s) = \\frac{${param}}{${param} - s} \\quad (s < ${param})`;
    titleParam = `\\lambda = ${param}`;
  } else {
    mean = param;
    variance = 1.0;
    moment2 = variance + mean * mean;
    mgfFormula = `M_X(s) = e^{${param}s + 0.5s^2}`;
    titleParam = `\\mu = ${param}, \\sigma = 1`;
  }

  // Calculate MGF curve points around s in [-1, 0.8]
  const points = [];
  const tangentPoints = [];
  const parabolaPoints = [];

  for (let s = -0.8; s <= 0.6; s += 0.02) {
    let val = 1;
    if (dist === 'poisson') {
      val = Math.exp(param * (Math.exp(s) - 1));
    } else if (dist === 'exponential') {
      if (s < param) val = param / (param - s);
    } else {
      val = Math.exp(param * s + 0.5 * s * s);
    }
    points.push({ s, val });

    // Tangent at s = 0: T(s) = M(0) + M'(0)*s = 1 + mean*s
    tangentPoints.push({ s, val: 1 + mean * s });

    // Parabola at s = 0: P(s) = 1 + mean*s + 0.5*moment2*s^2
    parabolaPoints.push({ s, val: 1 + mean * s + 0.5 * moment2 * s * s });
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border-2 border-rose-200 dark:border-rose-900/40">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
          MAT1101 Bài 7.2 — Hàm sinh Moment (Moment Generating Function - MGF)
        </span>
        <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-0.5">
          Hàm sinh Moment <MathView math="M_X(s) = \mathbb{E}[e^{sX}]" /> & Đạo hàm tại Gốc
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          Quan sát trực quan tại sao đạo hàm cấp 1 tại gốc <MathView math="s=0" /> cho kỳ vọng <MathView math="\mathbb{E}[X]" />, và đạo hàm cấp 2 cho Moment cấp hai <MathView math="\mathbb{E}[X^2]" />.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <ClayCard glowColor="rose">
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-3">
              🎯 Chọn Phân bố Xác suất
            </h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setDist('poisson')}
                className={`flex-1 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                  dist === 'poisson' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Poisson(λ)
              </button>
              <button
                onClick={() => setDist('exponential')}
                className={`flex-1 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                  dist === 'exponential' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Mũ Exp(λ)
              </button>
              <button
                onClick={() => setDist('normal')}
                className={`flex-1 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                  dist === 'normal' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Chuẩn N(μ, 1)
              </button>
            </div>

            <ClaySlider
              label={dist === 'normal' ? 'Kỳ vọng mu' : 'Tham số lambda'}
              value={param}
              min={dist === 'normal' ? -1 : 0.5}
              max={dist === 'normal' ? 3 : 4}
              step={0.1}
              color="rose"
              formatValue={(v) => fmt(v, 1)}
              onChange={setParam}
            />

            <div className="mt-4 space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTangent}
                  onChange={(e) => setShowTangent(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
                <span>Hiện Tiếp tuyến tại s = 0 (Độ dốc = E[X])</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showParabola}
                  onChange={(e) => setShowParabola(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
                <span>Hiện Parabol xấp xỉ bậc 2 (Độ cong = E[X²])</span>
              </label>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs space-y-1 font-mono">
              <div className="text-rose-700 dark:text-rose-300 font-bold">
                <MathView math={mgfFormula} />
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                E[X] = M'(0) = {fmt(mean, 2)}
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                E[X²] = M''(0) = {fmt(moment2, 2)}
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Var(X) = {fmt(variance, 2)}
              </div>
            </div>
          </ClayCard>
        </div>

        {/* MGF Curve SVG */}
        <div className="lg:col-span-2">
          <ClayCard glowColor="rose" className="p-6">
            <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
              <span>Đồ thị MGF & Tiếp tuyến Khai triển Taylor quanh s = 0</span>
              <span className="text-xs px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono font-bold">
                <MathView math={titleParam} />
              </span>
            </h4>

            <div className="w-full h-80 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between">
              <svg viewBox="-0.9 0 1.7 4" className="w-full h-full">
                {/* Axes */}
                <line x1="-0.9" y1="3.6" x2="0.8" y2="3.6" stroke="#475569" strokeWidth="0.015" />
                <line x1="0" y1="0.2" x2="0" y2="3.8" stroke="#475569" strokeWidth="0.015" />

                {/* Point (0, 1) where M(0) = 1 */}
                <line x1="-0.04" y1="2.6" x2="0.04" y2="2.6" stroke="#94A3B8" strokeWidth="0.01" />
                <text x="-0.06" y="2.63" fill="#94A3B8" fontSize="0.08" textAnchor="end">
                  M(0)=1
                </text>

                {/* Tangent line at s = 0 */}
                {showTangent && (
                  <path
                    d={tangentPoints
                      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.s} ${3.6 - p.val}`)
                      .join(' ')}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="0.02"
                    strokeDasharray="0.04 0.02"
                  />
                )}

                {/* Parabola at s = 0 */}
                {showParabola && (
                  <path
                    d={parabolaPoints
                      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.s} ${3.6 - p.val}`)
                      .join(' ')}
                    fill="none"
                    stroke="#FBBF24"
                    strokeWidth="0.02"
                    strokeDasharray="0.02 0.02"
                  />
                )}

                {/* True MGF curve */}
                <path
                  d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.s} ${3.6 - p.val}`).join(' ')}
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="0.035"
                />

                {/* Anchor dot at (0, 1) */}
                <circle cx="0" cy="2.6" r="0.04" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="0.01" />
              </svg>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-rose-400 font-bold">
                    <span className="w-3 h-0.5 bg-rose-500"></span> M_X(s)
                  </span>
                  {showTangent && (
                    <span className="flex items-center gap-1 text-sky-400">
                      <span className="w-3 h-0.5 bg-sky-400 border-dashed"></span> Tiếp tuyến E[X]
                    </span>
                  )}
                  {showParabola && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="w-3 h-0.5 bg-amber-400"></span> Parabol E[X²]
                    </span>
                  )}
                </div>
                <span className="text-slate-400 text-[11px]">
                  Khai triển Taylor: <MathView math="M(s) \approx 1 + s\mathbb{E}[X] + \frac{s^2}{2}\mathbb{E}[X^2]" />
                </span>
              </div>
            </div>
          </ClayCard>
        </div>
      </div>
    </div>
  );
};
