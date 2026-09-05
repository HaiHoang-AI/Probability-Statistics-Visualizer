import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { MathView } from '../../common/MathView';
import { fmt, normalPdf, normalCdf, standardNormalInv } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';

export const HypothesisTesting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tradeoff' | 'pvalue'>('tradeoff');

  // Tab 1: Type I & II Error Tradeoff State
  const [mu0, setMu0] = useState<number>(0);
  const [mu1, setMu1] = useState<number>(2.5);
  const [sampleN, setSampleN] = useState<number>(16);
  const [threshold, setThreshold] = useState<number>(1.2);

  // Standard deviation of sample mean
  const sigma = 2.0;
  const stdMean = sigma / Math.sqrt(sampleN);

  // Error probabilities:
  // Reject H0 if X_bar > threshold
  const alpha = 1 - normalCdf(threshold, mu0, stdMean);
  const beta = normalCdf(threshold, mu1, stdMean);
  const power = 1 - beta;

  // Tab 2: P-Value Visualizer State
  const [tailType, setTailType] = useState<'right' | 'left' | 'two'>('right');
  const [sigAlpha, setSigAlpha] = useState<number>(0.05);
  const [sampleZ, setSampleZ] = useState<number>(1.96);

  // Calculate p-value based on tail type
  let pValue = 0;
  let zCrit = 0;
  if (tailType === 'right') {
    pValue = 1 - normalCdf(sampleZ, 0, 1);
    zCrit = standardNormalInv(1 - sigAlpha);
  } else if (tailType === 'left') {
    pValue = normalCdf(sampleZ, 0, 1);
    zCrit = -standardNormalInv(1 - sigAlpha);
  } else {
    pValue = 2 * (1 - normalCdf(Math.abs(sampleZ), 0, 1));
    zCrit = standardNormalInv(1 - sigAlpha / 2);
  }

  const rejectH0 = pValue <= sigAlpha;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 10.2 — Kiểm tra Giả thuyết Thống kê
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Đánh đổi Sai lầm Loại I / II & Trị số p (p-value)
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('tradeoff')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              activeTab === 'tradeoff'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Đánh đổi Loại I / II & Power
          </button>
          <button
            onClick={() => setActiveTab('pvalue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              activeTab === 'pvalue'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Trực quan hóa p-value
          </button>
        </div>
      </div>

      {/* TAB 1: ERROR TRADEOFF */}
      {activeTab === 'tradeoff' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Phân Bố H₀ vs H₁ & Đánh Đổi Sai Lầm Loại I - II"
              formula="\text{Power} = 1 - \beta = P(\text{Bác bỏ } H_0 \mid H_1 \text{ đúng})"
              badge={`Ngưỡng x_c = ${fmt(threshold, 2)}`}
              extraActions={
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono font-bold border border-rose-300">
                    α = {fmt(alpha * 100, 1)}%
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono font-bold border border-amber-300">
                    β = {fmt(beta * 100, 1)}%
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold border border-emerald-300">
                    Power = {fmt(power * 100, 1)}%
                  </span>
                </div>
              }
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="-3 0 8 1.05" className="w-full h-auto select-none">
                {/* Horizontal baseline */}
                <line x1="-3" y1="1.0" x2="5" y2="1.0" stroke="#0F172A" strokeWidth="0.015" />

                {/* Vertical Axis at 0 */}
                <line x1="0" y1="0.05" x2="0" y2="1.0" stroke="#0F172A" strokeWidth="0.01" strokeDasharray="0.03 0.02" opacity="0.5" />

                {/* Shaded Area: Type I Error (Alpha) under H0 from threshold to 5 */}
                <path
                  d={`M ${threshold} 1.0 ` +
                    Array.from({ length: 60 }, (_, i) => {
                      const x = threshold + (i / 59) * (5 - threshold);
                      const y = 1.0 - normalPdf(x, mu0, stdMean);
                      return `L ${x} ${Math.max(0.05, y)}`;
                    }).join(' ') +
                    ` L 5 1.0 Z`}
                  fill="rgba(239, 68, 68, 0.35)"
                  stroke="none"
                />

                {/* Shaded Area: Type II Error (Beta) under H1 from -3 to threshold */}
                <path
                  d={`M -3 1.0 ` +
                    Array.from({ length: 60 }, (_, i) => {
                      const x = -3 + (i / 59) * (threshold - (-3));
                      const y = 1.0 - normalPdf(x, mu1, stdMean);
                      return `L ${x} ${Math.max(0.05, y)}`;
                    }).join(' ') +
                    ` L ${threshold} 1.0 Z`}
                  fill="rgba(245, 158, 11, 0.35)"
                  stroke="none"
                />

                {/* H0 Curve (Blue) */}
                <path
                  d={Array.from({ length: 140 }, (_, i) => {
                    const x = -3 + (i / 140) * 8;
                    const y = 1.0 - normalPdf(x, mu0, stdMean);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${Math.max(0.05, y)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="0.025"
                  strokeLinecap="round"
                />

                {/* H1 Curve (Green) */}
                <path
                  d={Array.from({ length: 140 }, (_, i) => {
                    const x = -3 + (i / 140) * 8;
                    const y = 1.0 - normalPdf(x, mu1, stdMean);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${Math.max(0.05, y)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="0.025"
                  strokeLinecap="round"
                />

                {/* Rejection Threshold Line (Red Dashed) */}
                <line
                  x1={threshold}
                  y1="0.08"
                  x2={threshold}
                  y2="1.0"
                  stroke="#EF4444"
                  strokeWidth="0.02"
                  strokeDasharray="0.04 0.02"
                />
                <circle cx={threshold} cy="0.08" r="0.03" fill="#EF4444" />
                <text
                  x={threshold}
                  y="0.05"
                  fill="#EF4444"
                  fontSize="0.14"
                  textAnchor="middle"
                  fontWeight="black"
                  className="font-mono"
                >
                  Ngưỡng x_c = {fmt(threshold, 2)}
                </text>
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-1 bg-sky-600 rounded-full"></span> Giả thuyết H₀: μ = {mu0}
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-5 h-1 bg-emerald-600 rounded-full"></span> Đối thuyết H₁: μ = {mu1}
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                    <span className="w-3.5 h-3.5 bg-rose-500/40 border border-rose-500 rounded-xs"></span> Vùng Sai lầm Loại I (α)
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                    <span className="w-3.5 h-3.5 bg-amber-500/40 border border-amber-500 rounded-xs"></span> Vùng Sai lầm Loại II (β)
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  σ/√n = {fmt(stdMean, 3)}
                </div>
              </div>
            </div>
          </ClayCard>

          {/* 2. BẢNG TÙY CHỌN ĐIỀU CHỈNH THÔNG SỐ Ở DƯỚI (BOTTOM DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Cột 1: Ngưỡng & Cỡ mẫu */}
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  1. Ngưỡng Bác Bỏ & Cỡ Mẫu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Dịch chuyển ngưỡng x_c để thấy sự đánh đổi bù trừ giữa α và β:
                </p>
              </div>

              <div className="space-y-3">
                <ClaySlider
                  label="Vị trí ngưỡng bác bỏ x_c"
                  value={threshold}
                  min={0.2}
                  max={2.3}
                  step={0.05}
                  color="rose"
                  formatValue={(v) => `x_c = ${fmt(v, 2)}`}
                  onChange={setThreshold}
                />

                <ClaySlider
                  label="Cỡ mẫu n"
                  value={sampleN}
                  min={4}
                  max={64}
                  step={4}
                  color="blue"
                  formatValue={(v) => `n = ${v}`}
                  onChange={setSampleN}
                />
              </div>
            </ClayCard>

            {/* Cột 2: Hiệu ứng khác biệt */}
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  2. Độ Lệch Hiệu Ứng
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Khoảng cách giữa hai kỳ vọng đối nghịch |μ₁ - μ₀|:
                </p>
              </div>

              <ClaySlider
                label="Kỳ vọng đối thuyết mu1"
                value={mu1}
                min={1.0}
                max={3.5}
                step={0.1}
                color="emerald"
                formatValue={(v) => `μ₁ = ${fmt(v, 1)}`}
                onChange={setMu1}
              />

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">Quy tắc vàng:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Cách duy nhất để <strong>giảm đồng thời cả α và β</strong> là <strong>tăng cỡ mẫu n</strong> (chuông sẽ co hẹp lại)!
                </p>
              </div>
            </ClayCard>

            {/* Cột 3: Bảng quyết định 4 ô */}
            <ClayCard className="p-5 space-y-2.5 flex flex-col justify-between">
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                3. Bảng Ma Trận Sai Lầm
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                  <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-sans font-bold">Chấp nhận H₀ đúng:</div>
                  <div className="text-base font-black text-emerald-600">{fmt((1 - alpha) * 100, 1)}%</div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800">
                  <div className="text-[10px] text-rose-800 dark:text-rose-300 font-sans font-bold">Sai lầm Loại I (α):</div>
                  <div className="text-base font-black text-rose-600">{fmt(alpha * 100, 1)}%</div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
                  <div className="text-[10px] text-amber-800 dark:text-amber-300 font-sans font-bold">Sai lầm Loại II (β):</div>
                  <div className="text-base font-black text-amber-600">{fmt(beta * 100, 1)}%</div>
                </div>

                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800">
                  <div className="text-[10px] text-sky-800 dark:text-sky-300 font-sans font-bold">Công lực (Power):</div>
                  <div className="text-base font-black text-sky-600">{fmt(power * 100, 1)}%</div>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 2: P-VALUE */}
      {activeTab === 'pvalue' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Diện Tích Quét p-value Trên Phân Bố Chuẩn Tắc N(0, 1)"
              formula="\text{p-value} \le \alpha \implies \text{Bác bỏ } H_0"
              badge={`p = ${fmt(pValue, 4)}`}
              extraActions={
                <span className={`text-xs px-2.5 py-1 rounded-full font-heading font-black border ${
                  rejectH0
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300'
                }`}>
                  {rejectH0 ? 'BÁC BỎ H₀' : 'CHƯA ĐỦ CƠ SỞ BÁC BỎ'}
                </span>
              }
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="-4 0 8 0.5" className="w-full h-auto select-none">
                {/* Horizontal baseline */}
                <line x1="-4" y1="0.48" x2="4" y2="0.48" stroke="#0F172A" strokeWidth="0.006" />

                {/* Standard Normal curve */}
                <path
                  d={Array.from({ length: 160 }, (_, i) => {
                    const x = -4 + (i / 160) * 8;
                    const y = 0.48 - normalPdf(x, 0, 1);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="0.015"
                  strokeLinecap="round"
                />

                {/* Shaded P-value tail */}
                {tailType === 'right' && (
                  <path
                    d={`M ${sampleZ} 0.48 ` +
                      Array.from({ length: 40 }, (_, i) => {
                        const x = sampleZ + (i / 39) * (4 - sampleZ);
                        const y = 0.48 - normalPdf(x, 0, 1);
                        return `L ${x} ${y}`;
                      }).join(' ') +
                      ` L 4 0.48 Z`}
                    fill="rgba(239, 68, 68, 0.35)"
                    stroke="none"
                  />
                )}

                {tailType === 'left' && (
                  <path
                    d={`M -4 0.48 ` +
                      Array.from({ length: 40 }, (_, i) => {
                        const x = -4 + (i / 39) * (sampleZ - (-4));
                        const y = 0.48 - normalPdf(x, 0, 1);
                        return `L ${x} ${y}`;
                      }).join(' ') +
                      ` L ${sampleZ} 0.48 Z`}
                    fill="rgba(239, 68, 68, 0.35)"
                    stroke="none"
                  />
                )}

                {tailType === 'two' && (
                  <>
                    <path
                      d={`M ${Math.abs(sampleZ)} 0.48 ` +
                        Array.from({ length: 40 }, (_, i) => {
                          const x = Math.abs(sampleZ) + (i / 39) * (4 - Math.abs(sampleZ));
                          const y = 0.48 - normalPdf(x, 0, 1);
                          return `L ${x} ${y}`;
                        }).join(' ') +
                        ` L 4 0.48 Z`}
                      fill="rgba(239, 68, 68, 0.35)"
                      stroke="none"
                    />
                    <path
                      d={`M -4 0.48 ` +
                        Array.from({ length: 40 }, (_, i) => {
                          const x = -4 + (i / 39) * (-Math.abs(sampleZ) - (-4));
                          const y = 0.48 - normalPdf(x, 0, 1);
                          return `L ${x} ${y}`;
                        }).join(' ') +
                        ` L ${-Math.abs(sampleZ)} 0.48 Z`}
                      fill="rgba(239, 68, 68, 0.35)"
                      stroke="none"
                    />
                  </>
                )}

                {/* Z Sample Statistic Marker */}
                <line
                  x1={sampleZ}
                  y1="0.05"
                  x2={sampleZ}
                  y2="0.48"
                  stroke="#EF4444"
                  strokeWidth="0.02"
                />
                <circle cx={sampleZ} cy="0.05" r="0.04" fill="#EF4444" />
                <text
                  x={sampleZ}
                  y="0.03"
                  fill="#EF4444"
                  fontSize="0.08"
                  textAnchor="middle"
                  fontWeight="black"
                  className="font-mono"
                >
                  Z = {fmt(sampleZ, 2)}
                </text>
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-1 bg-sky-600 rounded-full"></span> Chuẩn tắc N(0, 1)
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                    <span className="w-3.5 h-3.5 bg-rose-500/35 border border-rose-500 rounded-xs"></span> Diện tích p-value ({fmt(pValue * 100, 2)}%)
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mức ý nghĩa α = {fmt(sigAlpha, 2)}
                </div>
              </div>
            </div>
          </ClayCard>

          {/* 2. BẢNG THÔNG SỐ Ở DƯỚI (BOTTOM DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Cột 1: Loại đuôi */}
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  1. Hướng Kiểm Định
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Chọn kiểm định 1 phía (trái/phải) hoặc 2 phía:
                </p>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setTailType('right')}
                  className={`py-2 px-1 rounded-xl text-xs font-heading font-bold transition-all text-center border-2 border-slate-900 dark:border-slate-700 cursor-pointer ${
                    tailType === 'right' ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a]' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  Phải (&gt;)
                </button>
                <button
                  onClick={() => setTailType('left')}
                  className={`py-2 px-1 rounded-xl text-xs font-heading font-bold transition-all text-center border-2 border-slate-900 dark:border-slate-700 cursor-pointer ${
                    tailType === 'left' ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a]' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  Trái (&lt;)
                </button>
                <button
                  onClick={() => setTailType('two')}
                  className={`py-2 px-1 rounded-xl text-xs font-heading font-bold transition-all text-center border-2 border-slate-900 dark:border-slate-700 cursor-pointer ${
                    tailType === 'two' ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a]' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  2 Phía (≠)
                </button>
              </div>
            </ClayCard>

            {/* Cột 2: Thống kê mẫu Z & Alpha */}
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  2. Thống Kê Z & Mức Ý Nghĩa α
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Di chuyển giá trị Z quan sát từ mẫu:
                </p>
              </div>

              <div className="space-y-3">
                <ClaySlider
                  label="Thống kê mẫu quan sát Z"
                  value={sampleZ}
                  min={-3.5}
                  max={3.5}
                  step={0.05}
                  color="blue"
                  formatValue={(v) => `Z = ${fmt(v, 2)}`}
                  onChange={setSampleZ}
                />

                <ClaySlider
                  label="Mức ý nghĩa alpha"
                  value={sigAlpha * 100}
                  min={1}
                  max={10}
                  step={1}
                  color="rose"
                  formatValue={(v) => `${v}%`}
                  onChange={(v) => setSigAlpha(v / 100)}
                />
              </div>
            </ClayCard>

            {/* Cột 3: Kết luận kiểm định */}
            <ClayCard className="p-5 space-y-2.5 flex flex-col justify-between">
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                3. Kết Luận Thống Kê
              </h3>

              <div className={`p-3.5 rounded-2xl border-2 border-slate-900 dark:border-slate-700 ${
                rejectH0 ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}>
                <div className="font-heading font-black text-sm">
                  {rejectH0 ? 'BÁC BỎ H₀ (Reject H₀)' : 'CHƯA ĐỦ CƠ SỞ BÁC BỎ H₀'}
                </div>
                <div className="text-xs font-mono mt-1">
                  p-value = {fmt(pValue, 4)} {rejectH0 ? '≤' : '>'} α = {fmt(sigAlpha, 2)}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                p-value là xác suất thu được một kết quả cực đoan như hoặc hơn quan sát thực tế nếu H₀ đúng. p-value càng nhỏ chứng cứ chống lại H₀ càng mạnh.
              </p>
            </ClayCard>
          </div>
        </div>
      )}
    </div>
  );
};
