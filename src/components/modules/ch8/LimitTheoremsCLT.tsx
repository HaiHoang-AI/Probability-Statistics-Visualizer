import React, { useState, useEffect, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, normalPdf } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';

export const LimitTheoremsCLT: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clt' | 'lln'>('clt');

  // CLT Lab State
  const [sourceDist, setSourceDist] = useState<'uniform' | 'exponential' | 'bimodal' | 'dice'>('bimodal');
  const [sampleSizeN, setSampleSizeN] = useState<number>(1);
  const [simulatedAverages, setSimulatedAverages] = useState<number[]>([]);
  const numTrials = 5000;

  // Distribution true parameters
  const { trueMean, trueVar, minVal, maxVal } = useMemo(() => {
    if (sourceDist === 'uniform') {
      return { trueMean: 0.5, trueVar: 1 / 12, minVal: 0, maxVal: 1 };
    } else if (sourceDist === 'exponential') {
      return { trueMean: 1.0, trueVar: 1.0, minVal: 0, maxVal: 3.5 };
    } else if (sourceDist === 'bimodal') {
      return { trueMean: 0.5, trueVar: 0.12, minVal: 0, maxVal: 1 };
    } else {
      // Dice 1..6
      return { trueMean: 3.5, trueVar: 35 / 12, minVal: 1, maxVal: 6 };
    }
  }, [sourceDist]);

  const theoreticalStd = Math.sqrt(trueVar / sampleSizeN);

  // Generate a single sample from chosen distribution
  const sampleOne = (): number => {
    if (sourceDist === 'uniform') {
      return Math.random();
    } else if (sourceDist === 'exponential') {
      return -Math.log(1 - Math.random());
    } else if (sourceDist === 'bimodal') {
      return Math.random() < 0.5
        ? 0.15 + (Math.random() - 0.5) * 0.1
        : 0.85 + (Math.random() - 0.5) * 0.1;
    } else {
      return Math.floor(Math.random() * 6) + 1;
    }
  };

  // Run CLT Simulation
  const runSimulation = () => {
    const avgs: number[] = new Array(numTrials);
    for (let i = 0; i < numTrials; i++) {
      let sum = 0;
      for (let s = 0; s < sampleSizeN; s++) {
        sum += sampleOne();
      }
      avgs[i] = sum / sampleSizeN;
    }
    setSimulatedAverages(avgs);
  };

  useEffect(() => {
    runSimulation();
  }, [sourceDist, sampleSizeN]);

  // Compute Histogram Bins
  const histogram = useMemo(() => {
    if (simulatedAverages.length === 0) return [];
    const numBins = 40;
    const step = (maxVal - minVal) / numBins;
    const counts = new Array(numBins).fill(0);

    for (const val of simulatedAverages) {
      const idx = Math.min(numBins - 1, Math.max(0, Math.floor((val - minVal) / step)));
      counts[idx]++;
    }

    const maxCount = Math.max(...counts, 1);
    return counts.map((count, i) => ({
      x0: minVal + i * step,
      x1: minVal + (i + 1) * step,
      count,
      heightPercent: (count / maxCount) * 100,
    }));
  }, [simulatedAverages, minVal, maxVal]);

  // LLN Lab State: 15 Sample Paths
  const [epsilon, setEpsilon] = useState<number>(0.1);
  const [llnPaths, setLlnPaths] = useState<number[][]>([]);

  const generateLlnPaths = () => {
    const numPaths = 15;
    const maxSteps = 400;
    const paths: number[][] = [];

    for (let p = 0; p < numPaths; p++) {
      const currentPath: number[] = [];
      let currentSum = 0;
      for (let step = 1; step <= maxSteps; step++) {
        // Coin flip 0 or 1, mean = 0.5
        currentSum += Math.random() < 0.5 ? 1 : 0;
        currentPath.push(currentSum / step);
      }
      paths.push(currentPath);
    }
    setLlnPaths(paths);
  };

  useEffect(() => {
    generateLlnPaths();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 8 — Các định lý giới hạn
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Định lý Giới hạn Trung tâm (CLT) & Luật số lớn (LLN)
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('clt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              activeTab === 'clt'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Phòng thí nghiệm CLT
          </button>
          <button
            onClick={() => setActiveTab('lln')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              activeTab === 'lln'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Quỹ đạo Luật số lớn (LLN)
          </button>
        </div>
      </div>

      {/* TAB 1: CLT LAB */}
      {activeTab === 'clt' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA (DESMOS 3D VIEWPORT) */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Phân Bố Mẫu vs Chuông Gauss Lý Thuyết"
              formula="Z_n = \frac{\bar{X}_n - \mu}{\sigma/\sqrt{n}} \xrightarrow{d} \mathcal{N}(0, 1)"
              badge={`5,000 Mẫu | n = ${sampleSizeN}`}
              onReset={runSimulation}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <div className="relative w-full h-80 sm:h-96 flex items-end gap-1 pt-8 pb-8 px-4 sm:px-8 select-none">
                {/* Histogram Bars */}
                {histogram.map((bin, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-sky-500/85 hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400 rounded-t-sm transition-all duration-150 border-t border-sky-600 dark:border-sky-300 shadow-xs"
                    style={{ height: `${Math.max(2, bin.heightPercent)}%` }}
                    title={`Khoảng: [${fmt(bin.x0, 2)}, ${fmt(bin.x1, 2)}] - Mẫu: ${bin.count}`}
                  />
                ))}

                {/* SVG Overlay: Desmos Gaussian Bell Curve */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none p-4 sm:p-8" viewBox="0 0 800 320" preserveAspectRatio="none">
                  {(() => {
                    const maxNorm = normalPdf(trueMean, trueMean, theoreticalStd);
                    const points = [];
                    for (let px = 0; px <= 800; px += 8) {
                      const xVal = minVal + (px / 800) * (maxVal - minVal);
                      const pdfVal = normalPdf(xVal, trueMean, theoreticalStd);
                      const py = 300 - (pdfVal / maxNorm) * 260;
                      points.push(`${px},${py}`);
                    }
                    return (
                      <polyline
                        points={points.join(' ')}
                        fill="none"
                        stroke="#EA580C"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    );
                  })()}
                </svg>
              </div>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-3 h-3 bg-sky-500 rounded-sm"></span> Cột Histogram Thực nghiệm
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-orange-600 dark:text-orange-400">
                    <span className="w-5 h-1 bg-orange-600 rounded-full"></span> Đường Chuông Gauss N(μ, σ²/n)
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  μ = {fmt(trueMean, 2)} | σ/√n = {fmt(theoreticalStd, 3)}
                </div>
              </div>
            </div>
          </ClayCard>

          {/* 2. BẢNG TÙY CHỌN ĐIỀU CHỈNH THÔNG SỐ Ở DƯỚI (BOTTOM DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Cột 1: Chọn Phân bố Gốc */}
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  1. Chọn Phân Bố Gốc
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Thử chọn phân bố cực kỳ bất đối xứng để xem CLT nén thành hình chuông:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSourceDist('bimodal')}
                  className={`py-2 px-2 rounded-xl text-xs font-heading font-bold transition-all text-center border-2 border-slate-900 dark:border-slate-700 cursor-pointer ${
                    sourceDist === 'bimodal'
                      ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  2 Đỉnh (Bimodal)
                </button>
                <button
                  onClick={() => setSourceDist('exponential')}
                  className={`py-2 px-2 rounded-xl text-xs font-heading font-bold transition-all text-center border-2 border-slate-900 dark:border-slate-700 cursor-pointer ${
                    sourceDist === 'exponential'
                      ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  Mũ Lệch (Exp)
                </button>
                <button
                  onClick={() => setSourceDist('uniform')}
                  className={`py-2 px-2 rounded-xl text-xs font-heading font-bold transition-all text-center border-2 border-slate-900 dark:border-slate-700 cursor-pointer ${
                    sourceDist === 'uniform'
                      ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  Đều (Uniform)
                </button>
                <button
                  onClick={() => setSourceDist('dice')}
                  className={`py-2 px-2 rounded-xl text-xs font-heading font-bold transition-all text-center border-2 border-slate-900 dark:border-slate-700 cursor-pointer ${
                    sourceDist === 'dice'
                      ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  Xúc xắc 6 mặt
                </button>
              </div>
            </ClayCard>

            {/* Cột 2: Thanh trượt cỡ mẫu n & Lấy mẫu */}
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  2. Cỡ Mẫu n (Cộng Dồn)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Kéo n tăng dần từ 1 đến 50 để quan sát hiệu ứng chuẩn hóa:
                </p>
              </div>

              <ClaySlider
                label="Số biến cộng dồn n"
                value={sampleSizeN}
                min={1}
                max={50}
                step={1}
                color="blue"
                formatValue={(v) => `n = ${v}`}
                onChange={setSampleSizeN}
              />

              <ClayButton
                variant="primary"
                size="sm"
                className="w-full"
                onClick={runSimulation}
              >
                Lấy Mẫu Lại (5,000 lần)
              </ClayButton>
            </ClayCard>

            {/* Cột 3: Thông số lý thuyết & Kết luận */}
            <ClayCard className="p-5 space-y-2.5 flex flex-col justify-between">
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                3. Thông Số Lý Thuyết
              </h3>

              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs space-y-1">
                <div className="text-sky-800 dark:text-sky-300 font-mono font-bold">
                  Kỳ vọng: μ = {fmt(trueMean, 2)}
                </div>
                <div className="text-sky-800 dark:text-sky-300 font-mono font-bold">
                  Độ lệch chuẩn: σ/√n = {fmt(theoreticalStd, 3)}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Khi n = 1, đồ thị phản ánh phân bố gốc. Khi n ≥ 30, hình dáng đồ thị hội tụ hoàn toàn về đường cong chuẩn Gauss màu cam.
              </p>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 2: LLN SAMPLE PATHS */}
      {activeTab === 'lln' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="15 Quỹ Đạo Hội Tụ Của Trung Bình Mẫu (Tung Đồng Xu μ = 0.5)"
              formula="P(|\bar{X}_n - \mu| \ge \epsilon) \xrightarrow{n \to \infty} 0"
              badge={`Ống ε = ±${fmt(epsilon, 2)}`}
              onReset={generateLlnPaths}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                {/* Grid lines */}
                {[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((v) => {
                  const py = 180 - (v - 0.5) * 320;
                  return (
                    <g key={`lln-y-${v}`}>
                      <line x1="60" y1={py} x2="760" y2={py} stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />
                      <text x="50" y={py + 4} textAnchor="end" className="text-[11px] font-mono font-bold fill-slate-500">
                        {v.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Epsilon corridor */}
                <rect
                  x="60"
                  y={180 - epsilon * 320}
                  width="700"
                  height={2 * epsilon * 320}
                  fill="rgba(16, 185, 129, 0.15)"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  rx="4"
                />

                {/* True mean line mu = 0.5 */}
                <line x1="60" y1="180" x2="760" y2="180" stroke="#0284C7" strokeWidth="2.5" strokeDasharray="6 3" />
                <text x="765" y="184" fill="#0284C7" className="text-xs font-mono font-black">
                  μ = 0.5
                </text>

                {/* 15 Paths */}
                {llnPaths.map((path, idx) => {
                  const polyPoints = path.map((val, n) => {
                    const px = 60 + (n / path.length) * 700;
                    const py = 180 - (val - 0.5) * 320;
                    return `${px},${py}`;
                  }).join(' ');

                  const colors = ['#0284c7', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4'];
                  return (
                    <polyline
                      key={idx}
                      points={polyPoints}
                      fill="none"
                      stroke={colors[idx % colors.length]}
                      strokeWidth="1.8"
                      opacity={0.85}
                    />
                  );
                })}
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-3.5 h-3 bg-emerald-500/30 border border-emerald-500 rounded-xs"></span> Dải ống sai số [μ - ε, μ + ε]
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-0.5 bg-sky-600"></span> Kỳ vọng lý thuyết μ = 0.5
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  Bước thử n: 1 → 400
                </div>
              </div>
            </div>
          </ClayCard>

          {/* 2. BẢNG THÔNG SỐ Ở DƯỚI (BOTTOM DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  1. Bán Kính Ống Epsilon (ε)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Thu hẹp hoặc mở rộng độ rộng của dải ống kiểm chứng hội tụ:
                </p>
              </div>

              <ClaySlider
                label="Bán kính ống sai số ε"
                value={epsilon}
                min={0.05}
                max={0.25}
                step={0.01}
                color="blue"
                formatValue={(v) => `± ${fmt(v, 2)}`}
                onChange={setEpsilon}
              />
            </ClayCard>

            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  2. Sinh Thử Nghiệm Mới
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Tạo 15 chuỗi thử nghiệm ngẫu nhiên mới, mỗi chuỗi gồm 400 lần tung đồng xu:
                </p>
              </div>

              <ClayButton
                variant="primary"
                size="md"
                className="w-full"
                onClick={generateLlnPaths}
              >
                Sinh 15 Quỹ Đạo Mới
              </ClayButton>
            </ClayCard>

            <ClayCard className="p-5 space-y-2 flex flex-col justify-between">
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                3. Bản Chất Định Lý (SLLN)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ở những bước đầu (n &lt; 50), các đường dao động rất mạnh. Khi n tăng lớn dần, 100% tất cả các quỹ đạo ngẫu nhiên đều bị hút vào bên trong dải ống [μ - ε, μ + ε].
              </p>
              <div className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 pt-1">
                P(lim X̄ₙ = μ) = 1
              </div>
            </ClayCard>
          </div>
        </div>
      )}
    </div>
  );
};
