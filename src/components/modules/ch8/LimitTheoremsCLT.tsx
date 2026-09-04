import React, { useState, useEffect, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, normalPdf } from '../../../utils/math';
import { Play, RotateCcw, TrendingUp, Sparkles, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

export const LimitTheoremsCLT: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clt' | 'lln' | 'bounds'>('clt');

  // CLT Lab State
  const [sourceDist, setSourceDist] = useState<'uniform' | 'exponential' | 'bimodal' | 'dice'>('bimodal');
  const [sampleSizeN, setSampleSizeN] = useState<number>(1);
  const [simulatedAverages, setSimulatedAverages] = useState<number[]>([]);
  const [numTrials, setNumTrials] = useState<number>(5000);

  // Distribution true parameters
  const { trueMean, trueVar, minVal, maxVal } = useMemo(() => {
    if (sourceDist === 'uniform') {
      return { trueMean: 0.5, trueVar: 1 / 12, minVal: 0, maxVal: 1 };
    } else if (sourceDist === 'exponential') {
      return { trueMean: 1.0, trueVar: 1.0, minVal: 0, maxVal: 3.5 };
    } else if (sourceDist === 'bimodal') {
      return { trueMean: 0.5, trueVar: 0.12, minVal: 0, maxVal: 1 };
    } else {
      // Dice: 1, 2, 3, 4, 5, 6
      return { trueMean: 3.5, trueVar: 35 / 12, minVal: 1, maxVal: 6 };
    }
  }, [sourceDist]);

  // Generate Monte Carlo samples when sourceDist or sampleSizeN changes
  const runSimulation = () => {
    const avgs: number[] = [];
    for (let i = 0; i < numTrials; i++) {
      let sum = 0;
      for (let j = 0; j < sampleSizeN; j++) {
        if (sourceDist === 'uniform') {
          sum += Math.random();
        } else if (sourceDist === 'exponential') {
          sum += -Math.log(1 - Math.random());
        } else if (sourceDist === 'bimodal') {
          // Mixture of two peaks at 0.2 and 0.8
          const peak = Math.random() < 0.5 ? 0.2 : 0.8;
          sum += peak + (Math.random() - 0.5) * 0.2;
        } else {
          // Dice
          sum += Math.floor(Math.random() * 6) + 1;
        }
      }
      avgs.push(sum / sampleSizeN);
    }
    setSimulatedAverages(avgs);

    if (sampleSizeN >= 30) {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    }
  };

  useEffect(() => {
    runSimulation();
  }, [sourceDist, sampleSizeN]);

  // Compute 30 histogram bins
  const histogram = useMemo(() => {
    if (simulatedAverages.length === 0) return [];
    const numBins = 30;
    const step = (maxVal - minVal) / numBins;
    const bins = new Array(numBins).fill(0);

    for (const val of simulatedAverages) {
      const idx = Math.min(numBins - 1, Math.max(0, Math.floor((val - minVal) / step)));
      bins[idx]++;
    }

    const maxCount = Math.max(...bins);
    return bins.map((count, i) => ({
      x0: minVal + i * step,
      x1: minVal + (i + 1) * step,
      center: minVal + (i + 0.5) * step,
      count,
      density: count / (simulatedAverages.length * step),
      heightPercent: maxCount > 0 ? (count / maxCount) * 100 : 0,
    }));
  }, [simulatedAverages, minVal, maxVal]);

  // Theoretical Gaussian PDF for overlay
  const theoreticalStd = Math.sqrt(trueVar / sampleSizeN);

  // Tab 2: LLN Paths State
  const [epsilon, setEpsilon] = useState<number>(0.15);
  const [llnPaths, setLlnPaths] = useState<Array<number[]>>([]);

  const generateLlnPaths = () => {
    const paths: Array<number[]> = [];
    const numSteps = 400;
    for (let p = 0; p < 15; p++) {
      const path: number[] = [];
      let sum = 0;
      for (let n = 1; n <= numSteps; n++) {
        sum += Math.random() < 0.5 ? 0 : 1; // Coin flips with mean = 0.5
        path.push(sum / n);
      }
      paths.push(path);
    }
    setLlnPaths(paths);
  };

  useEffect(() => {
    generateLlnPaths();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-2 border-emerald-200 dark:border-emerald-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            MAT1101 Bài 8 — Các định lý giới hạn (Limit Theorems)
          </span>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-0.5">
            Định lý Giới hạn Trung tâm (CLT) & Luật số lớn (LLN)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Khám phá "Phép màu toán học": Dù phân bố gốc méo mó đến đâu, trung bình mẫu <MathView math="\bar{X}_n" /> luôn hội tụ về hình chuông Gauss hoàn hảo!
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('clt')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'clt'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sparkles size={14} /> 1. Phòng thí nghiệm CLT
          </button>
          <button
            onClick={() => setActiveTab('lln')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'lln'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <TrendingUp size={14} /> 2. Quỹ đạo Luật số lớn (LLN)
          </button>
        </div>
      </div>

      {/* TAB 1: CLT LAB */}
      {activeTab === 'clt' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <ClayCard glowColor="emerald">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
                🧪 Chọn Phân bố Gốc
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Thử chọn phân bố cực kỳ lệch hoặc hai đỉnh để kiểm chứng tính phổ quát của CLT:
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setSourceDist('bimodal')}
                  className={`py-2 px-2 rounded-xl text-xs font-heading font-bold transition-all text-center ${
                    sourceDist === 'bimodal'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  2 Đỉnh (Bimodal)
                </button>
                <button
                  onClick={() => setSourceDist('exponential')}
                  className={`py-2 px-2 rounded-xl text-xs font-heading font-bold transition-all text-center ${
                    sourceDist === 'exponential'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  Mũ Lệch (Exp)
                </button>
                <button
                  onClick={() => setSourceDist('uniform')}
                  className={`py-2 px-2 rounded-xl text-xs font-heading font-bold transition-all text-center ${
                    sourceDist === 'uniform'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  Đều U[0, 1]
                </button>
                <button
                  onClick={() => setSourceDist('dice')}
                  className={`py-2 px-2 rounded-xl text-xs font-heading font-bold transition-all text-center ${
                    sourceDist === 'dice'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  Xúc xắc 6 mặt
                </button>
              </div>

              {/* Slider for n */}
              <ClaySlider
                label="Cỡ mẫu n (Số biến cộng dồn)"
                value={sampleSizeN}
                min={1}
                max={50}
                step={1}
                color="emerald"
                formatValue={(v) => `n = ${v}`}
                onChange={setSampleSizeN}
              />

              <div className="mt-4 flex gap-2">
                <ClayButton
                  variant="success"
                  size="sm"
                  className="w-full"
                  onClick={runSimulation}
                  icon={<RotateCcw size={14} />}
                >
                  Lấy mẫu lại (5,000 lần)
                </ClayButton>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <span className="font-bold text-emerald-950 dark:text-emerald-200">
                  Thông số lý thuyết của <MathView math="\bar{X}_n" />:
                </span>
                <div className="text-emerald-800 dark:text-emerald-300 font-mono">
                  μ = {fmt(trueMean, 2)}, σ/√n = {fmt(theoreticalStd, 3)}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Khi <MathView math="n = 1" />, biểu đồ phản ánh đúng phân bố gốc. Khi kéo <MathView math="n \ge 30" />, biểu đồ lập tức khớp hoàn hảo với đường chuông màu cam!
                </p>
              </div>
            </ClayCard>
          </div>

          {/* Histogram Visualization */}
          <div className="lg:col-span-2">
            <ClayCard glowColor="emerald" className="p-6">
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>Histogram Thực nghiệm (5,000 mẫu) vs Đường Gauss Lý thuyết</span>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                  n = {sampleSizeN}
                </span>
              </h4>

              <div className="w-full h-80 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between">
                <div className="relative w-full h-full flex items-end gap-1 pt-6 pb-6 px-4">
                  {/* Bars of Histogram */}
                  {histogram.map((bin, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-sm transition-all duration-200 hover:brightness-125"
                      style={{ height: `${bin.heightPercent}%` }}
                      title={`Khoảng: [${fmt(bin.x0, 2)}, ${fmt(bin.x1, 2)}] - Số mẫu: ${bin.count}`}
                    />
                  ))}

                  {/* SVG Overlay: Theoretical Bell Curve */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none p-4 pb-6" viewBox="0 0 500 200">
                    {(() => {
                      // Calculate maximum density for scale
                      const maxNorm = normalPdf(trueMean, trueMean, theoreticalStd);
                      const points = [];
                      for (let px = 0; px <= 500; px += 5) {
                        const xVal = minVal + (px / 500) * (maxVal - minVal);
                        const pdfVal = normalPdf(xVal, trueMean, theoreticalStd);
                        const py = 190 - (pdfVal / maxNorm) * 160;
                        points.push(`${px},${py}`);
                      }
                      return (
                        <polyline
                          points={points.join(' ')}
                          fill="none"
                          stroke="#F97316"
                          strokeWidth="3.5"
                        />
                      );
                    })()}
                  </svg>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Cột thực nghiệm mẫu
                    </span>
                    <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                      <span className="w-4 h-0.5 bg-orange-500"></span> Đường cong Gauss N(μ, σ²/n)
                    </span>
                  </div>
                  <span className="font-mono text-emerald-300">
                    CLT Theorem: <MathView math="Z_n = \frac{\bar{X}_n - \mu}{\sigma/\sqrt{n}} \xrightarrow{d} \mathcal{N}(0, 1)" />
                  </span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 2: LLN SAMPLE PATHS */}
      {activeTab === 'lln' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <ClayCard glowColor="emerald">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
                🛤️ Ống Sai số Epsilon
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Luật số lớn yếu (WLLN) khẳng định với mọi <MathView math="\epsilon > 0" />, xác suất để <MathView math="|\bar{X}_n - \mu| \ge \epsilon" /> tiến dần về 0 khi <MathView math="n \to \infty" />.
              </p>

              <ClaySlider
                label="Bán kính dải ống epsilon"
                value={epsilon}
                min={0.05}
                max={0.3}
                step={0.01}
                color="emerald"
                formatValue={(v) => `± ${fmt(v, 2)}`}
                onChange={setEpsilon}
              />

              <div className="mt-4">
                <ClayButton
                  variant="success"
                  size="sm"
                  className="w-full"
                  onClick={generateLlnPaths}
                  icon={<RotateCcw size={14} />}
                >
                  Sinh 15 Quỹ đạo Mới
                </ClayButton>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">Quan sát bản chất:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Ở những bước đầu (<MathView math="n < 50" />), các đường quỹ đạo dao động mạnh và vượt ra ngoài ống. Khi <MathView math="n" /> tăng dần, 100% các đường đều chui vào dải màu xanh <MathView math="[\mu - \epsilon, \mu + \epsilon]" />.
                </p>
              </div>
            </ClayCard>
          </div>

          <div className="lg:col-span-2">
            <ClayCard glowColor="emerald" className="p-6">
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>15 Quỹ đạo Ngẫu nhiên của Trung bình Mẫu Tung Đồng xu (μ = 0.5)</span>
                <span className="text-xs font-mono text-emerald-500 font-bold">
                  Ống [0.5 - {fmt(epsilon, 2)}, 0.5 + {fmt(epsilon, 2)}]
                </span>
              </h4>

              <div className="w-full h-80 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between">
                <svg viewBox="0 0 500 220" className="w-full h-full">
                  {/* Epsilon corridor */}
                  <rect
                    x="40"
                    y={110 - epsilon * 160}
                    width="440"
                    height={2 * epsilon * 160}
                    fill="rgba(16, 185, 129, 0.15)"
                    stroke="#10B981"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />

                  {/* True mean line mu = 0.5 */}
                  <line x1="40" y1="110" x2="480" y2="110" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="6 3" />
                  <text x="35" y="113" fill="#FFFFFF" fontSize="10" textAnchor="end">μ=0.5</text>

                  {/* 15 Paths */}
                  {llnPaths.map((path, idx) => {
                    const polyPoints = path.map((val, n) => {
                      const px = 40 + (n / path.length) * 440;
                      const py = 110 - (val - 0.5) * 160;
                      return `${px},${py}`;
                    }).join(' ');

                    return (
                      <polyline
                        key={idx}
                        points={polyPoints}
                        fill="none"
                        stroke={['#60A5FA', '#F472B6', '#FBBF24', '#A78BFA', '#34D399'][idx % 5]}
                        strokeWidth="1.2"
                        opacity={0.7}
                      />
                    );
                  })}
                </svg>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span>Trục hoành: Số phép thử n (1 đến 400)</span>
                  <span className="text-emerald-400 font-bold">
                    SLLN: <MathView math="P\left(\lim_{n \to \infty} \bar{X}_n = \mu\right) = 1" />
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
