import React, { useState, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, normalPdf, normalCdf, standardNormalInv } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';

export const HypothesisTesting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tradeoff' | 'pvalue' | 'power'>('tradeoff');

  // =========================================================================
  // Tab 1: Type I & II Error Tradeoff State
  // =========================================================================
  const [mu0, setMu0] = useState<number>(0);
  const [mu1, setMu1] = useState<number>(2.5);
  const [sampleN, setSampleN] = useState<number>(16);
  const [threshold, setThreshold] = useState<number>(1.2);

  const sigma = 2.0;
  const stdMean = sigma / Math.sqrt(sampleN);

  const alpha = 1 - normalCdf(threshold, mu0, stdMean);
  const beta = normalCdf(threshold, mu1, stdMean);
  const power = 1 - beta;

  // =========================================================================
  // Tab 2: P-Value Visualizer State
  // =========================================================================
  const [tailType, setTailType] = useState<'right' | 'left' | 'two'>('right');
  const [sigAlpha, setSigAlpha] = useState<number>(0.05);
  const [sampleZ, setSampleZ] = useState<number>(1.96);

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

  // =========================================================================
  // Tab 3: Power Analysis & Power Curve State
  // =========================================================================
  const [effectSizeD, setEffectSizeD] = useState<number>(0.5); // Cohen's d
  const [powerAlpha, setPowerAlpha] = useState<number>(0.05);
  const [planN, setPlanN] = useState<number>(30);

  const zAlphaVal = standardNormalInv(1 - powerAlpha / 2);
  const curPower = 1 - normalCdf(zAlphaVal - effectSizeD * Math.sqrt(planN), 0, 1);

  // Minimum sample size for 80% power
  const zBeta80 = 0.8416; // standardNormalInv(0.80)
  const nRequired80 = useMemo(() => {
    if (effectSizeD <= 0) return 999;
    return Math.ceil(Math.pow((zAlphaVal + zBeta80) / effectSizeD, 2));
  }, [effectSizeD, zAlphaVal]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 10.2 — Kiểm tra Giả thuyết Thống kê
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Đánh đổi Sai lầm Loại I / II, Trị số p & Phân tích Lực kiểm định
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('tradeoff')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'tradeoff'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Đánh đổi Loại I / II & Power
          </button>
          <button
            onClick={() => setActiveTab('pvalue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'pvalue'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Trực quan hóa p-value
          </button>
          <button
            onClick={() => setActiveTab('power')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'power'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. Đường Cong Lực Kiểm Định (Power)
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: TRADEOFF & POWER
         ========================================================================= */}
      {activeTab === 'tradeoff' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              {/* Cột 1: Ngưỡng & Cỡ mẫu */}
                <ClayCard className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-1">
                      1. Ngưỡng Bác Bỏ & Cỡ Mẫu
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      Dịch chuyển ngưỡng x_c để thấy sự bù trừ giữa α và β:
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
                <ClayCard className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-1">
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
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Quy tắc vàng:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Cách duy nhất để <strong>giảm đồng thời cả α và β</strong> là <strong>tăng cỡ mẫu n</strong> (chuông co hẹp lại)!
                    </p>
                  </div>
                </ClayCard>

                {/* Cột 3: Bảng ma trận sai lầm */}
                <ClayCard className="p-4 space-y-2.5 flex flex-col justify-between">
                  <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
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

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
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

            {/* FULL DESMOS VIEWPORT DIRECTLY ON GRID */}
            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="-3 0 8 1.05" className="w-full h-auto select-none">
                {/* Cartesian baseline */}
                <line x1="-3" y1="1.0" x2="5" y2="1.0" stroke="#0F172A" strokeWidth="0.015" />

                {/* Vertical Axis at 0 */}
                <line x1="0" y1="0.05" x2="0" y2="1.0" stroke="#0F172A" strokeWidth="0.01" strokeDasharray="0.03 0.02" opacity="0.4" />

                {/* Ticks on X axis */}
                {[-2, -1, 0, 1, 2, 3, 4].map((tx) => (
                  <g key={`tx-${tx}`}>
                    <line x1={tx} y1="1.0" x2={tx} y2="1.025" stroke="#475569" strokeWidth="0.01" />
                    <text x={tx} y="1.045" fontSize="0.03" textAnchor="middle" className="font-mono font-bold fill-slate-500">
                      {tx}
                    </text>
                  </g>
                ))}

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
                  fontSize="0.04"
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
            </div>
          </div>

          <LabBriefing
            question="Trong kiểm định giả thuyết, tại sao ta không thể giảm cả Sai lầm loại I (kết tội oan người vô tội) và Sai lầm loại II (bỏ lọt kẻ có tội) về 0 cùng một lúc? Làm sao để tăng Lực kiểm định (Power)?"
            formula="\alpha = P(\text{Bác bỏ } H_0 \mid H_0 \text{ đúng}), \quad \beta = P(\text{Chấp nhận } H_0 \mid H_1 \text{ đúng}), \quad \text{Power} = 1 - \beta"
            mathExplanation="Ngưỡng quyết định $x_c$ là một ranh giới cắt đôi không gian: Dịch $x_c$ sang phải sẽ giảm $\alpha$ (bớt kết tội oan), nhưng lại làm phình to diện tích $\beta$ (bỏ lọt tội phạm)! Cách DUY NHẤT để giảm cả 2 sai lầm cùng lúc là TĂNG CỠ MẪU $n$ để 2 quả chuông cùng co thắt lại!"
            howToInteract={[
              "Kéo slider 'Vị trí ngưỡng bác bỏ $x_c$' sang trái và sang phải.",
              "Xem diện tích màu đỏ ($\alpha$) và diện tích màu vàng ($\beta$) giằng co bù trừ nhau.",
              "Kéo slider 'Cỡ mẫu $n$' tăng lên 36 hoặc 64 để thấy 2 quả chuông co hẹp và tách rời nhau ra."
            ]}
            whatToObserve="Khi kéo ngưỡng $x_c$ sang phải: $\alpha$ giảm xuống nhưng $\beta$ lập tức tăng vọt. Chỉ khi kéo $n$ tăng lên (độ lệch chuẩn thu hẹp), cả $\alpha$ và $\beta$ mới cùng co bé lại, đưa Lực kiểm định ($\text{Power} = 1 - \beta$) lên sát 100%!"
            takeaway="Muốn kiểm định vừa nghiêm ngặt ($\alpha$ bé) vừa nhạy bén ($\text{Power}$ cao) $\implies$ BẮT BUỘC PHẢI THU THẬP THÊM MẪU $n$!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 2: P-VALUE VISUALIZER
         ========================================================================= */}
      {activeTab === 'pvalue' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              {/* Cột 1: Loại đuôi */}
                <ClayCard className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-1">
                      1. Hướng Kiểm Định
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Chọn kiểm định 1 phía (trái/phải) hoặc 2 phía:
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setTailType('right')}
                      className={`py-2 px-1 rounded-xl text-xs font-heading font-bold transition-all text-center border border-slate-200/80 dark:border-slate-800 cursor-pointer ${
                        tailType === 'right' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      Phải (&gt;)
                    </button>
                    <button
                      onClick={() => setTailType('left')}
                      className={`py-2 px-1 rounded-xl text-xs font-heading font-bold transition-all text-center border border-slate-200/80 dark:border-slate-800 cursor-pointer ${
                        tailType === 'left' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      Trái (&lt;)
                    </button>
                    <button
                      onClick={() => setTailType('two')}
                      className={`py-2 px-1 rounded-xl text-xs font-heading font-bold transition-all text-center border border-slate-200/80 dark:border-slate-800 cursor-pointer ${
                        tailType === 'two' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      2 Phía (≠)
                    </button>
                  </div>
                </ClayCard>

                {/* Cột 2: Thống kê mẫu Z & Alpha */}
                <ClayCard className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-1">
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
                <ClayCard className="p-4 space-y-2.5 flex flex-col justify-between">
                  <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    3. Kết Luận Thống Kê
                  </h3>
                  <div className={`p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 ${
                    rejectH0 ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}>
                    <div className="font-heading font-black text-sm">
                      {rejectH0 ? 'BÁC BỎ H₀ (Reject H₀)' : 'CHƯA ĐỦ CƠ SỞ BÁC BỎ H₀'}
                    </div>
                    <div className="text-xs font-mono mt-1">
                      p-value = {fmt(pValue, 4)} {rejectH0 ? '≤' : '>'} α = {fmt(sigAlpha, 2)}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    <MathView math="p\text{-value}" /> là xác suất thu được kết quả cực đoan như hoặc hơn quan sát thực tế nếu <MathView math="H_0" /> đúng. <MathView math="p\text{-value}" /> càng nhỏ chứng cứ chống lại <MathView math="H_0" /> càng mạnh.
                  </p>
                </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
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
                  {rejectH0 ? 'BÁC BỎ H₀ (p ≤ α)' : 'CHƯA ĐỦ CƠ SỞ (p > α)'}
                </span>
              }
            />

            {/* FULL DESMOS VIEWPORT DIRECTLY ON GRID */}
            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="-4 0 8 0.52" className="w-full h-auto select-none">
                {/* Horizontal baseline */}
                <line x1="-4" y1="0.48" x2="4" y2="0.48" stroke="#0F172A" strokeWidth="0.006" />

                {/* Ticks on baseline */}
                {[-3, -2, -1, 0, 1, 2, 3].map((tx) => (
                  <g key={`ztick-${tx}`}>
                    <line x1={tx} y1="0.48" x2={tx} y2="0.495" stroke="#475569" strokeWidth="0.004" />
                    <text x={tx} y="0.512" fontSize="0.018" textAnchor="middle" className="font-mono font-bold fill-slate-500">
                      {tx}
                    </text>
                  </g>
                ))}

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

                {/* Critical Boundary Line Z_crit */}
                <line
                  x1={zCrit}
                  y1="0.10"
                  x2={zCrit}
                  y2="0.48"
                  stroke="#0F172A"
                  strokeWidth="0.008"
                  strokeDasharray="0.02 0.01"
                />
                <text
                  x={zCrit}
                  y="0.09"
                  fill="#0F172A"
                  fontSize="0.02"
                  textAnchor="middle"
                  fontWeight="bold"
                  className="font-mono dark:fill-slate-200"
                >
                  z_crit = {fmt(zCrit, 2)}
                </text>

                {/* Z Sample Statistic Marker */}
                <line
                  x1={sampleZ}
                  y1="0.05"
                  x2={sampleZ}
                  y2="0.48"
                  stroke="#EF4444"
                  strokeWidth="0.015"
                />
                <circle cx={sampleZ} cy="0.05" r="0.03" fill="#EF4444" />
                <text
                  x={sampleZ}
                  y="0.035"
                  fill="#EF4444"
                  fontSize="0.025"
                  textAnchor="middle"
                  fontWeight="black"
                  className="font-mono"
                >
                  Z_obs = {fmt(sampleZ, 2)}
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
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-0.5 border-t-2 border-dashed border-slate-800 dark:border-slate-300"></span> Ngưỡng tới hạn z_crit ({fmt(zCrit, 2)})
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mức ý nghĩa α = {fmt(sigAlpha, 2)}
                </div>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Trị số $p$ ($p\text{-value}$) thực chất là gì? Tại sao quy tắc quyết định luôn là: 'Nếu $p\text{-value} \le \alpha$ thì BÁC BỎ $H_0$'?"
            formula="p\text{-value} = P(\text{Thống kê mẫu cực đoan hơn hoặc bằng giá trị quan sát được} \mid H_0 \text{ đúng})"
            mathExplanation="$p\text{-value}$ đo 'mức độ ngạc nhiên' của dữ liệu nếu giả định $H_0$ là đúng. Nếu $p\text{-value}$ cực nhỏ (ví dụ 0.01), nghĩa là nếu $H_0$ đúng thì cơ hội xảy ra dữ liệu mẫu như vậy chỉ là 1% $\implies$ quá phi lý $\implies H_0$ sai $\implies$ BÁC BỎ $H_0$!"
            howToInteract={[
              "Chọn loại kiểm định: Phía phải, Phía trái, hoặc Hai phía.",
              "Kéo slider giá trị thống kê mẫu $Z$ quan sát từ -3.5 đến +3.5.",
              "Xem diện tích quét màu đỏ ($p\text{-value}$) co giãn và thẻ trạng thái BÁC BỎ / CHƯA ĐỦ CƠ SỞ đổi màu tương ứng."
            ]}
            whatToObserve="Khi $Z$ quan sát vượt qua vạch tới hạn $Z_{\text{crit}}$ (vạch xám/đen), diện tích $p\text{-value}$ lập tức nhỏ hơn $\alpha$ ($0.05$) $\implies$ Thẻ kết luận chuyển sang màu đỏ: 'BÁC BỎ $H_0$, CÓ Ý NGHĨA THỐNG KÊ'!"
            takeaway="Câu thần chú ôn thi: 'Nếu $p\text{-value} \le \alpha$ thì BÁC BỎ $H_0$, nếu $p\text{-value} > \alpha$ thì CHƯA ĐỦ BẰNG CHỨNG để bác bỏ'!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 3: POWER ANALYSIS & POWER CURVE
         ========================================================================= */}
      {activeTab === 'power' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              {/* Cột 1: Effect Size */}
                <ClayCard className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-1">
                      1. Kích Thước Hiệu Ứng (Cohen's d)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      Độ chênh lệch chuẩn hóa giữa 2 nhóm:
                    </p>
                  </div>
                  <ClaySlider
                    label="Effect Size d"
                    sublabel="0.2 (Nhỏ) - 0.5 (Vừa) - 0.8 (Lớn)"
                    value={effectSizeD}
                    min={0.2}
                    max={1.0}
                    step={0.05}
                    color="purple"
                    formatValue={(v) => `d = ${fmt(v, 2)}`}
                    onChange={setEffectSizeD}
                  />
                  <div className="text-xs text-slate-500">
                    d càng lớn, đường cong Power dâng lên càng nhanh!
                  </div>
                </ClayCard>

                {/* Cột 2: Cỡ mẫu n */}
                <ClayCard className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-1">
                      2. Cỡ Mẫu Khảo Sát n
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      Kéo n để di chuyển điểm quan sát:
                    </p>
                  </div>
                  <div className="space-y-3">
                    <ClaySlider
                      label="Cỡ mẫu n"
                      value={planN}
                      min={5}
                      max={120}
                      step={5}
                      color="emerald"
                      formatValue={(v) => `n = ${v}`}
                      onChange={setPlanN}
                    />
                    <ClaySlider
                      label="Mức ý nghĩa alpha"
                      value={powerAlpha * 100}
                      min={1}
                      max={10}
                      step={1}
                      color="rose"
                      formatValue={(v) => `${v}%`}
                      onChange={(v) => setPowerAlpha(v / 100)}
                    />
                  </div>
                </ClayCard>

                {/* Cột 3: Khuyến nghị cỡ mẫu */}
                <ClayCard className="p-4 space-y-2.5 flex flex-col justify-between">
                  <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    3. Đánh Giá Lực Kiểm Định
                  </h3>
                  <div className={`p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 ${
                    curPower >= 0.80 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                  }`}>
                    <div className="font-heading font-black text-sm">
                      {curPower >= 0.80 ? 'ĐẠT CHUẨN VÀNG (≥ 80%)' : 'THIẾU MẪU (< 80%)'}
                    </div>
                    <div className="text-xs font-mono mt-1">
                      Power = {fmt(curPower * 100, 1)}% | Cần n ≥ {nRequired80}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Nếu thử nghiệm thực tế với $n &lt; {nRequired80}$, bạn có nguy cơ cao bỏ lọt hiệu ứng thực sự do sai lầm loại II!
                  </p>
                </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <DesmosStageHeader
              title={`Đường Cong Lực Kiểm Định (Power Curve): Power = ${fmt(curPower * 100, 1)}% tại n = ${planN}`}
              formula="n \ge \left(\frac{Z_{\alpha/2} + Z_{\beta}}{d}\right)^2"
              badge={curPower >= 0.80 ? 'ĐẠT CHUẨN VÀNG (≥ 80%)' : 'THIẾU MẪU (< 80%)'}
              onReset={() => { setEffectSizeD(0.5); setPlanN(30); }}
            />

            {/* FULL DESMOS VIEWPORT DIRECTLY ON GRID */}
            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-power-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-power-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Coordinate Mapping: X: n from 0 to 125, Y: Power from 0 to 1.05 */}
                {(() => {
                  const toX = (nVal: number) => 60 + (nVal / 125) * 700;
                  const toY = (pVal: number) => 310 - (pVal / 1.05) * 270;

                  // Power curve path
                  const curvePts: string[] = [];
                  const areaPts: string[] = [`M ${toX(5)} ${toY(0)}`];
                  for (let nVal = 5; nVal <= 125; nVal += 1) {
                    const pVal = 1 - normalCdf(zAlphaVal - effectSizeD * Math.sqrt(nVal), 0, 1);
                    const x = toX(nVal);
                    const y = toY(pVal);
                    curvePts.push(`${nVal === 5 ? 'M' : 'L'} ${x} ${y}`);
                    areaPts.push(`L ${x} ${y}`);
                  }
                  areaPts.push(`L ${toX(125)} ${toY(0)} Z`);

                  return (
                    <>
                      {/* Grid lines and tick numbers */}
                      {[20, 40, 60, 80, 100, 120].map((v) => (
                        <g key={`grid-pn-${v}`}>
                          <line
                            x1={toX(v)}
                            y1={toY(0)}
                            x2={toX(v)}
                            y2={toY(1.0)}
                            stroke="rgba(148, 163, 184, 0.25)"
                            strokeWidth="1"
                          />
                          <text
                            x={toX(v)}
                            y={toY(0) + 18}
                            textAnchor="middle"
                            className="text-[11px] font-mono font-bold fill-slate-500 dark:fill-slate-400"
                          >
                            {v}
                          </text>
                        </g>
                      ))}

                      {[0.2, 0.4, 0.6, 0.8, 1.0].map((v) => (
                        <g key={`grid-pp-${v}`}>
                          <line
                            x1={toX(0)}
                            y1={toY(v)}
                            x2={toX(125)}
                            y2={toY(v)}
                            stroke="rgba(148, 163, 184, 0.25)"
                            strokeWidth="1"
                          />
                          <text
                            x={toX(0) - 10}
                            y={toY(v) + 4}
                            textAnchor="end"
                            className="text-[11px] font-mono font-bold fill-slate-500 dark:fill-slate-400"
                          >
                            {fmt(v * 100, 0)}%
                          </text>
                        </g>
                      ))}

                      {/* Gold Standard 80% Benchmark Line */}
                      <line
                        x1={toX(0)}
                        y1={toY(0.8)}
                        x2={toX(125)}
                        y2={toY(0.8)}
                        stroke="#F59E0B"
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                      />
                      <rect
                        x={toX(125) - 145}
                        y={toY(0.8) - 22}
                        width="140"
                        height="20"
                        rx="4"
                        fill="#FEF3C7"
                        stroke="#F59E0B"
                        strokeWidth="1"
                      />
                      <text
                        x={toX(125) - 75}
                        y={toY(0.8) - 8}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="#92400E"
                      >
                        ⭐ Chuẩn vàng Power 80%
                      </text>

                      {/* Shaded Area under Power Curve */}
                      <path d={areaPts.join(' ')} fill="rgba(139, 92, 246, 0.12)" stroke="none" />

                      {/* Power Curve line */}
                      <path
                        d={curvePts.join(' ')}
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Coordinate Axes */}
                      <line
                        x1={toX(0)}
                        y1={toY(0)}
                        x2={toX(125) + 15}
                        y2={toY(0)}
                        stroke="#EF4444"
                        strokeWidth="2"
                        markerEnd="url(#arrow-power-x)"
                      />
                      <text x={toX(125) + 25} y={toY(0) + 5} className="text-xs font-mono font-black fill-red-500">
                        n
                      </text>

                      <line
                        x1={toX(0)}
                        y1={toY(0)}
                        x2={toX(0)}
                        y2={toY(1.05) - 10}
                        stroke="#10B981"
                        strokeWidth="2"
                        markerEnd="url(#arrow-power-y)"
                      />
                      <text x={toX(0) - 5} y={toY(1.05) - 18} className="text-xs font-mono font-black fill-emerald-500">
                        Power (1 - β)
                      </text>

                      {/* Operating Point Indicator (planN, curPower) */}
                      <line
                        x1={toX(planN)}
                        y1={toY(0)}
                        x2={toX(planN)}
                        y2={toY(curPower)}
                        stroke="#8B5CF6"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      <line
                        x1={toX(0)}
                        y1={toY(curPower)}
                        x2={toX(planN)}
                        y2={toY(curPower)}
                        stroke="#8B5CF6"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />

                      <circle cx={toX(planN)} cy={toY(curPower)} r="10" fill="none" stroke="#8B5CF6" strokeWidth="2" opacity="0.5" />
                      <circle cx={toX(planN)} cy={toY(curPower)} r="6" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2" />

                      {/* Operating Point Badge */}
                      <g transform={`translate(${toX(planN)}, ${toY(curPower) - 24})`}>
                        <rect x="-65" y="-14" width="130" height="22" rx="6" fill="#1E1B4B" stroke="#8B5CF6" strokeWidth="1.5" />
                        <text x="0" y="1" textAnchor="middle" fill="#C4B5FD" fontSize="11" fontWeight="bold" className="font-mono">
                          n={planN} | {fmt(curPower * 100, 1)}%
                        </text>
                      </g>
                    </>
                  );
                })()}
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                    <span className="w-5 h-1 bg-purple-600 rounded-full"></span> Đường cong Power(n)
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                    <span className="w-5 h-0.5 border-t-2 border-dashed border-amber-500"></span> Ngưỡng chuẩn 80%
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <span className="w-3 h-3 bg-purple-600 rounded-full border border-white"></span> Điểm khảo sát hiện tại
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  Cỡ mẫu n tối thiểu để đạt 80% Power: <span className="text-amber-600 dark:text-amber-400 font-black">{nRequired80}</span>
                </div>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Một công ty công nghệ muốn thử nghiệm A/B tính năng mới. Họ cần lấy mẫu tối thiểu bao nhiêu người dùng $n$ để chắc chắn (với xác suất 80% trở lên) phát hiện ra sự cải tiến nếu tính năng đó thực sự hiệu quả?"
            formula="\text{Power}(n) = 1 - \beta = \Phi\left( d\sqrt{n} - Z_{\alpha/2} \right) \quad \text{với } d = \frac{\mu_1 - \mu_0}{\sigma}"
            mathExplanation="Đường cong Lực kiểm định (Power Curve) biểu diễn quan hệ phi tuyến giữa cỡ mẫu $n$ và xác suất phát hiện hiệu ứng thực sự. Ngưỡng chuẩn vàng trong khoa học luôn là 80% (0.80). Điểm giao cắt giữa đường cong với vạch 80% chính là cỡ mẫu tối thiểu $n$ cần thiết!"
            howToInteract={[
              "Kéo slider 'Effect Size $d$' (độ chênh lệch chuẩn hóa) từ 0.2 (hiệu ứng yếu) đến 0.8 (hiệu ứng mạnh).",
              "Kéo slider 'Cỡ mẫu $n$' từ 5 đến 120 quan sát.",
              "Quan sát điểm chấm tím di chuyển dọc theo đường cong Power và vượt qua vạch chuẩn vàng 80%."
            ]}
            whatToObserve="Nếu hiệu ứng $d$ rất nhỏ (0.2), bạn cần cỡ mẫu $n > 100$ mới đạt 80% Power! Nhưng nếu hiệu ứng rất rõ nét ($d = 0.8$), chỉ cần $n = 25$ là đủ để kiểm định thành công."
            takeaway="Phân tích lực kiểm định là bước đầu tiên của mọi dự án Data Science & thử nghiệm lâm sàng: Tính toán trước cỡ mẫu $n$ cần thiết trước khi bắt đầu thu thập dữ liệu!"
          />
        </div>
      )}
    </div>
  );
};
