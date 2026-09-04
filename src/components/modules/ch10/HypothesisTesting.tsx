import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { MathView } from '../../common/MathView';
import { fmt, normalPdf, normalCdf, standardNormalInv } from '../../../utils/math';

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
  // Type I Error alpha = P(X_bar > threshold | H0)
  const alpha = 1 - normalCdf(threshold, mu0, stdMean);
  // Type II Error beta = P(X_bar <= threshold | H1)
  const beta = normalCdf(threshold, mu1, stdMean);
  // Power of test
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
      <div className="p-4 rounded-3xl bg-gradient-to-r from-red-500/10 via-rose-500/10 to-orange-500/10 border-2 border-red-200 dark:border-red-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            MAT1101 Bài 10.2 — Kiểm tra Giả thuyết Thống kê (Hypothesis Testing)
          </span>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-0.5">
            Đánh đổi Sai lầm Loại I / II, Lực kiểm định & Trị số p (p-value)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            "Bác bỏ <MathView math="H_0" /> khi <MathView math="H_0" /> đúng là Sai lầm loại I (<MathView math="\alpha" />). Bỏ sót <MathView math="H_1" /> khi <MathView math="H_1" /> đúng là Sai lầm loại II (<MathView math="\beta" />)."
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('tradeoff')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all ${
              activeTab === 'tradeoff'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            1. Đánh đổi Loại I / II & Power
          </button>
          <button
            onClick={() => setActiveTab('pvalue')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all ${
              activeTab === 'pvalue'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            2. Trực quan hóa p-value
          </button>
        </div>
      </div>

      {/* TAB 1: ERROR TRADEOFF */}
      {activeTab === 'tradeoff' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <ClayCard glowColor="rose">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-3">
                Điều khiển Ngưỡng & Cỡ mẫu
              </h3>

              <div className="space-y-3">
                <ClaySlider
                  label="Ngưỡng bác bỏ (Critical Threshold)"
                  value={threshold}
                  min={-1}
                  max={3.5}
                  step={0.05}
                  color="rose"
                  formatValue={(v) => `t = ${fmt(v, 2)}`}
                  onChange={setThreshold}
                />

                <ClaySlider
                  label="Cỡ mẫu n (Tăng n để giảm cả 2 lỗi)"
                  value={sampleN}
                  min={4}
                  max={64}
                  step={4}
                  color="blue"
                  formatValue={(v) => `n = ${v}`}
                  onChange={setSampleN}
                />
              </div>

              {/* Real-time stats card */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between items-center text-red-600 dark:text-red-400 font-bold">
                  <span>Sai lầm Loại I (alpha):</span>
                  <span className="font-mono text-sm">{fmt(alpha * 100, 1)}%</span>
                </div>
                <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-bold">
                  <span>Sai lầm Loại II (beta):</span>
                  <span className="font-mono text-sm">{fmt(beta * 100, 1)}%</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold border-t border-slate-200 dark:border-slate-700 pt-1">
                  <span>Lực kiểm định (1 - beta):</span>
                  <span className="font-mono text-sm">{fmt(power * 100, 1)}%</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs">
                <span className="font-bold text-rose-950 dark:text-rose-200">Bí quyết giải quyết đánh đổi:</span>
                <p className="text-rose-900 dark:text-rose-300 mt-1">
                  Nếu giữ nguyên <MathView math="n" />, giảm <MathView math="\alpha" /> sẽ làm tăng <MathView math="\beta" />. <strong>Cách duy nhất để giảm cả 2 lỗi cùng lúc</strong> là <em>tăng cỡ mẫu <MathView math="n" /></em> (làm 2 quả chuông co hẹp lại)!
                </p>
              </div>
            </ClayCard>
          </div>

          {/* Visualization: Two overlapping bell curves */}
          <div className="lg:col-span-2">
            <ClayCard glowColor="rose" className="p-6">
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>Hai Quả Chuông: H₀ (Xanh) vs H₁ (Đỏ)</span>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                  Power: {fmt(power * 100, 1)}%
                </span>
              </h4>

              <div className="w-full h-80 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between">
                <svg viewBox="-2 0 6 1.1" className="w-full h-full">
                  <line x1="-2" y1="1.0" x2="4" y2="1.0" stroke="#475569" strokeWidth="0.01" />

                  {/* Curve under H0 (Blue) */}
                  <path
                    d={Array.from({ length: 120 }, (_, i) => {
                      const x = -2 + (i / 120) * 6;
                      const y = 1.0 - Math.min(0.9, normalPdf(x, mu0, stdMean) * 0.7);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="0.02"
                  />

                  {/* Curve under H1 (Red) */}
                  <path
                    d={Array.from({ length: 120 }, (_, i) => {
                      const x = -2 + (i / 120) * 6;
                      const y = 1.0 - Math.min(0.9, normalPdf(x, mu1, stdMean) * 0.7);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="0.02"
                  />

                  {/* Rejection Threshold Line */}
                  <line
                    x1={threshold}
                    y1="0.1"
                    x2={threshold}
                    y2="1.0"
                    stroke="#FBBF24"
                    strokeWidth="0.03"
                    strokeDasharray="0.04 0.02"
                  />
                  <text
                    x={threshold}
                    y="0.08"
                    fill="#FBBF24"
                    fontSize="0.12"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    Ngưỡng t = {fmt(threshold, 2)}
                  </text>
                </svg>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-sky-400">
                      <span className="w-2.5 h-2.5 bg-sky-500 rounded-sm"></span> H₀: μ = {mu0}
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span> H₁: μ = {mu1}
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <span className="w-3 h-0.5 bg-amber-400 border-dashed"></span> Vạch Ngưỡng
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    σ/√n = {fmt(stdMean, 2)}
                  </span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 2: P-VALUE */}
      {activeTab === 'pvalue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <ClayCard glowColor="rose">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-3">
                Thử nghiệm p-value
              </h3>

              {/* Tail Selector */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setTailType('right')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-heading font-bold ${
                    tailType === 'right' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  Phải (μ &gt; μ₀)
                </button>
                <button
                  onClick={() => setTailType('left')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-heading font-bold ${
                    tailType === 'left' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  Trái (μ &lt; μ₀)
                </button>
                <button
                  onClick={() => setTailType('two')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-heading font-bold ${
                    tailType === 'two' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  Hai phía (≠)
                </button>
              </div>

              <ClaySlider
                label="Giá trị thống kê quan sát được (Z)"
                value={sampleZ}
                min={-3.5}
                max={3.5}
                step={0.05}
                color="rose"
                formatValue={(v) => `Z = ${fmt(v, 2)}`}
                onChange={setSampleZ}
              />

              <ClaySlider
                label="Mức ý nghĩa alpha"
                value={sigAlpha * 100}
                min={1}
                max={10}
                step={1}
                color="blue"
                formatValue={(v) => `${v}%`}
                onChange={(v) => setSigAlpha(v / 100)}
              />

              {/* Decision Box */}
              <div
                className={`mt-4 p-4 rounded-2xl border ${
                  rejectH0
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div>
                  <div className="font-heading font-black text-sm">
                    {rejectH0 ? 'BÁC BỎ H₀ (Reject H₀)' : 'CHƯA ĐỦ CƠ SỞ BÁC BỎ H₀'}
                  </div>
                  <div className="text-xs font-mono mt-0.5">
                    p-value = {fmt(pValue, 4)} {rejectH0 ? '≤' : '>'} α = {fmt(sigAlpha, 2)}
                  </div>
                </div>
              </div>
            </ClayCard>
          </div>

          <div className="lg:col-span-2">
            <ClayCard glowColor="rose" className="p-6">
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>Diện tích Quét p-value trên Phân bố Chuẩn tắc N(0, 1)</span>
                <span className="text-xs px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono font-bold">
                  p = {fmt(pValue, 4)}
                </span>
              </h4>

              <div className="w-full h-80 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between">
                <svg viewBox="-4 0 8 0.5" className="w-full h-full">
                  <line x1="-4" y1="0.48" x2="4" y2="0.48" stroke="#475569" strokeWidth="0.005" />

                  {/* Standard Normal curve */}
                  <path
                    d={Array.from({ length: 120 }, (_, i) => {
                      const x = -4 + (i / 120) * 8;
                      const y = 0.48 - normalPdf(x, 0, 1);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="0.015"
                  />

                  {/* Z sample marker */}
                  <line
                    x1={sampleZ}
                    y1="0.05"
                    x2={sampleZ}
                    y2="0.48"
                    stroke="#F43F5E"
                    strokeWidth="0.02"
                  />
                  <circle cx={sampleZ} cy="0.05" r="0.04" fill="#F43F5E" />
                </svg>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span className="text-rose-400 font-bold">Vị trí Z = {fmt(sampleZ, 2)}</span>
                  <span className="font-mono text-slate-300">
                    Quy tắc quyết định: Bác bỏ H₀ khi <MathView math="p \le \alpha" />
                  </span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}
    </div>
  );
};
