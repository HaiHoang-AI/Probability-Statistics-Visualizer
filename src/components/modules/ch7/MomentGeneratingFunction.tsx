import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { MathView } from '../../common/MathView';
import { fmt } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';

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

  // Calculate MGF curve points around s in [-0.8, 0.6]
  const points = [];
  const tangentPoints = [];
  const parabolaPoints = [];

  for (let s = -0.8; s <= 0.6; s += 0.02) {
    let val = 1;
    if (dist === 'poisson') {
      val = Math.exp(param * (Math.exp(s) - 1));
    } else if (dist === 'exponential') {
      if (s < param) val = param / (param - s);
      else val = 10;
    } else {
      val = Math.exp(param * s + 0.5 * s * s);
    }
    points.push({ s, val });

    // Tangent at s = 0: T(s) = M(0) + M'(0)*s = 1 + mean*s
    tangentPoints.push({ s, val: 1 + mean * s });

    // Parabola at s = 0: P(s) = 1 + mean*s + 0.5*moment2*s^2
    parabolaPoints.push({ s, val: 1 + mean * s + 0.5 * moment2 * s * s });
  }

  // SVG coordinate transformation
  // Origin (s=0, val=0) at (380, 360)
  const mapS = (s: number) => 380 + s * 340;
  const mapV = (v: number) => 360 - v * 70;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          MAT1101 Bài 7.2 — Hàm sinh Moment (MGF)
        </span>
        <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
          Hàm sinh Moment <MathView math="M_X(s) = \mathbb{E}[e^{sX}]" /> & Đạo hàm tại Gốc
        </h2>
      </div>

      {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA (DESMOS 3D VIEWPORT) */}
      <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
        <DesmosStageHeader
          title="Đồ thị Hàm Sinh Moment MGF & Tiếp Tuyến Taylor tại Gốc"
          formula={mgfFormula}
          badge={titleParam}
          onReset={() => {
            setDist('poisson');
            setParam(2.0);
            setShowTangent(true);
            setShowParabola(true);
          }}
          extraActions={
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs font-heading font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={showTangent}
                  onChange={(e) => setShowTangent(e.target.checked)}
                  className="rounded text-sky-600 accent-sky-600"
                />
                <span>Tiếp tuyến E[X]</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs font-heading font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={showParabola}
                  onChange={(e) => setShowParabola(e.target.checked)}
                  className="rounded text-amber-500 accent-amber-500"
                />
                <span>Parabol E[X²]</span>
              </label>
            </div>
          }
        />

        <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
          <svg viewBox="0 0 800 400" className="w-full h-auto select-none">
            <defs>
              <marker id="arrow-mgf-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
              </marker>
              <marker id="arrow-mgf-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
              </marker>
            </defs>

            {/* Desmos Cartesian Axes (Origin at 380, 360) */}
            <line x1="50" y1="360" x2="740" y2="360" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-mgf-x)" />
            <line x1="380" y1="385" x2="380" y2="30" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-mgf-y)" />
            <text x="750" y="364" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">s</text>
            <text x="380" y="20" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">M_X(s)</text>

            {/* s-axis ticks */}
            {[-0.8, -0.6, -0.4, -0.2, 0.2, 0.4, 0.6].map((val) => (
              <g key={val}>
                <line x1={mapS(val)} y1="356" x2={mapS(val)} y2="364" stroke="#64748B" strokeWidth="1.5" />
                <text x={mapS(val)} y="380" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                  {val.toFixed(1)}
                </text>
              </g>
            ))}

            {/* M-axis ticks */}
            {[1, 2, 3, 4].map((val) => (
              <g key={val}>
                <line x1="376" y1={mapV(val)} x2="384" y2={mapV(val)} stroke="#64748B" strokeWidth="1.5" />
                <text x={368} y={mapV(val) + 4} fill="#64748B" fontSize="11" textAnchor="end" fontWeight="bold" fontFamily="monospace">
                  {val}
                </text>
              </g>
            ))}

            {/* Point (0, 1) reference where M(0) = 1 always */}
            <line x1="80" y1={mapV(1)} x2="720" y2={mapV(1)} stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx={mapS(0)} cy={mapV(1)} r="7" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2.5" />
            <text x={mapS(0) - 15} y={mapV(1) - 10} fill="#F43F5E" fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">
              M(0) = 1
            </text>

            {/* Tangent line at s = 0 */}
            {showTangent && (
              <path
                d={tangentPoints
                  .filter((p) => p.val >= 0 && p.val <= 4.8)
                  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapS(p.s)} ${mapV(p.val)}`)
                  .join(' ')}
                fill="none"
                stroke="#0284C7"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
            )}

            {/* Parabola approx at s = 0 */}
            {showParabola && (
              <path
                d={parabolaPoints
                  .filter((p) => p.val >= 0 && p.val <= 4.8)
                  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapS(p.s)} ${mapV(p.val)}`)
                  .join(' ')}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeDasharray="3 3"
              />
            )}

            {/* True MGF curve */}
            <path
              d={points
                .filter((p) => p.val >= 0 && p.val <= 4.8)
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapS(p.s)} ${mapV(p.val)}`)
                .join(' ')}
              fill="none"
              stroke="#F43F5E"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          {/* Bottom Stage Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                <span className="w-4 h-1 bg-rose-500 rounded-full"></span> Đường cong M_X(s)
              </span>
              {showTangent && (
                <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                  <span className="w-4 h-0.5 bg-sky-500 border-dashed"></span> Tiếp tuyến: Độ dốc = E[X] = {fmt(mean, 2)}
                </span>
              )}
              {showParabola && (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                  <span className="w-4 h-0.5 bg-amber-500"></span> Parabol: Độ cong = E[X²] = {fmt(moment2, 2)}
                </span>
              )}
            </div>
            <span className="font-mono text-slate-700 dark:text-slate-300 text-xs">
              Taylor: M(s) ≈ 1 + s·E[X] + (s²/2)·E[X²]
            </span>
          </div>
        </div>
      </ClayCard>

      {/* 2. BẢNG TÙY CHỌN ĐIỀU CHỈNH THÔNG SỐ Ở DƯỚI (BOTTOM CONTROL DOCK) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Chọn Phân bố & Tham số */}
        <ClayCard glowColor="rose" className="p-5">
          <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Chọn Phân bố Xác suất
          </h4>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setDist('poisson')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                dist === 'poisson'
                  ? 'bg-rose-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#f43f5e]'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Poisson(λ)
            </button>
            <button
              onClick={() => setDist('exponential')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                dist === 'exponential'
                  ? 'bg-rose-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#f43f5e]'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Mũ Exp(λ)
            </button>
            <button
              onClick={() => setDist('normal')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                dist === 'normal'
                  ? 'bg-rose-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#f43f5e]'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
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
        </ClayCard>

        {/* Card 2: Khai triển Taylor & Đạo hàm */}
        <ClayCard glowColor="blue" className="p-5">
          <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Ý nghĩa Hình học tại s = 0
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            Hàm sinh moment mã hóa toàn bộ thông tin của các moment vào độ dốc và độ cong tại gốc:
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700">
              <span className="font-bold text-sky-700 dark:text-sky-300">Độ dốc tiếp tuyến:</span>{' '}
              <MathView math="M'_X(0) = \mathbb{E}[X]" />
            </div>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="font-bold text-amber-700 dark:text-amber-300">Độ cong bậc 2:</span>{' '}
              <MathView math="M''_X(0) = \mathbb{E}[X^2]" />
            </div>
          </div>
        </ClayCard>

        {/* Card 3: Bảng Moment & Phương sai */}
        <ClayCard glowColor="emerald" className="p-5">
          <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Các Moment Giải tích
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">M(0) [Chuẩn hóa]:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">1.00</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">E[X] = M'(0):</span>
              <span className="font-mono font-extrabold text-sky-600 dark:text-sky-400 text-sm">
                {fmt(mean, 2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">E[X²] = M''(0):</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {fmt(moment2, 2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Var(X) = E[X²] - (E[X])²:</span>
              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                {fmt(variance, 2)}
              </span>
            </div>
          </div>
        </ClayCard>
      </div>
    </div>
  );
};

