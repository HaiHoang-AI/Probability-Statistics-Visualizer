import React, { useState, useEffect, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, normalPdf, randomCauchy, randomNormal } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';
import { GaltonBoard } from '../../canvas/GaltonBoard';

interface LimitTheoremsCLTProps {
  initialTab?: 'clt' | 'lln' | 'bounds' | 'cauchy' | 'galton';
}

export const LimitTheoremsCLT: React.FC<LimitTheoremsCLTProps> = ({ initialTab = 'clt' }) => {
  const [activeTab, setActiveTab] = useState<'clt' | 'lln' | 'bounds' | 'cauchy' | 'galton'>(initialTab);

  // Tab 1: CLT Lab State (Original Lab)
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
      return { trueMean: 3.5, trueVar: 35 / 12, minVal: 1, maxVal: 6 };
    }
  }, [sourceDist]);

  const theoreticalStd = Math.sqrt(trueVar / sampleSizeN);

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

  // Tab 2: LLN Lab State (Original Lab)
  const [epsilon, setEpsilon] = useState<number>(0.08);
  const [llnPaths, setLlnPaths] = useState<number[][]>([]);

  const generateLlnPaths = () => {
    const numPaths = 15;
    const maxSteps = 400;
    const paths: number[][] = [];

    for (let p = 0; p < numPaths; p++) {
      const currentPath: number[] = [];
      let currentSum = 0;
      for (let step = 1; step <= maxSteps; step++) {
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

  // Tab 3: Tail Bounds State
  const [boundK, setBoundK] = useState<number>(2.5);
  const chebyshevBound = Math.min(1.0, 1 / (boundK * boundK));
  const chernoffBound = Math.min(1.0, 2 * Math.exp(-0.5 * boundK * boundK));
  // Exact Standard Normal 2-tail prob
  const exactProb = useMemo(() => {
    const z = boundK;
    const t = 1 / (1 + 0.2316419 * z);
    const d = 0.39894228 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return 2 * p;
  }, [boundK]);

  // Tab 4: Cauchy Failure State
  const [cauchyN, setCauchyN] = useState<number>(10);
  const [cauchyPaths, setCauchyPaths] = useState<{ normalAvg: number[]; cauchyAvg: number[] }>({
    normalAvg: [],
    cauchyAvg: [],
  });

  const runCauchySim = () => {
    const steps = 150;
    const nAvgs: number[] = [];
    const cAvgs: number[] = [];

    for (let i = 1; i <= steps; i++) {
      let nSum = 0;
      let cSum = 0;
      for (let s = 0; s < cauchyN; s++) {
        nSum += randomNormal(0, 1);
        cSum += randomCauchy(0, 1);
      }
      nAvgs.push(nSum / cauchyN);
      cAvgs.push(cSum / cauchyN);
    }
    setCauchyPaths({ normalAvg: nAvgs, cauchyAvg: cAvgs });
  };

  useEffect(() => {
    runCauchySim();
  }, [cauchyN]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 8 — Các định lý giới hạn
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Định lý Giới hạn Trung tâm (CLT), Luật số lớn & Cận xác suất
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('clt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'clt'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Phòng thí nghiệm CLT
          </button>
          <button
            onClick={() => setActiveTab('lln')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'lln'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Quỹ đạo Luật số lớn (LLN)
          </button>
          <button
            onClick={() => setActiveTab('bounds')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'bounds'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. So tài Cận Đuôi (Chernoff)
          </button>
          <button
            onClick={() => setActiveTab('cauchy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'cauchy'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            4. Khi CLT Thất Bại (Cauchy)
          </button>
          <button
            onClick={() => setActiveTab('galton')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'galton'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            5. Bàn Galton (Quincunx)
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: CLT LAB (ORIGINAL LAB - DIRECTLY ON DESMOS GRID)
         ========================================================================= */}
      {activeTab === 'clt' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Phân bố biến gốc X
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSourceDist('bimodal')}
                  className={`py-2 px-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-heading font-bold cursor-pointer transition-all ${
                    sourceDist === 'bimodal' ? 'bg-sky-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  2 Đỉnh (Bimodal)
                </button>
                <button
                  onClick={() => setSourceDist('exponential')}
                  className={`py-2 px-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-heading font-bold cursor-pointer transition-all ${
                    sourceDist === 'exponential' ? 'bg-sky-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  Hàm mũ Exp(1)
                </button>
                <button
                  onClick={() => setSourceDist('uniform')}
                  className={`py-2 px-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-heading font-bold cursor-pointer transition-all ${
                    sourceDist === 'uniform' ? 'bg-sky-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  Phẳng Uniform[0,1]
                </button>
                <button
                  onClick={() => setSourceDist('dice')}
                  className={`py-2 px-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-heading font-bold cursor-pointer transition-all ${
                    sourceDist === 'dice' ? 'bg-sky-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  Xúc xắc 6 mặt
                </button>
              </div>
            </ClayCard>

            <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Cỡ Mẫu n Quan Sát
              </h4>
              <ClaySlider
                label="Cỡ mẫu n"
                sublabel="Số biến độc lập được lấy trung bình"
                value={sampleSizeN}
                min={1}
                max={40}
                step={1}
                color="blue"
                onChange={setSampleSizeN}
              />
              <div className="mt-3 flex gap-2">
                {[1, 2, 5, 15, 30].map((quickN) => (
                  <button
                    key={quickN}
                    onClick={() => setSampleSizeN(quickN)}
                    className="flex-1 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                  >
                    n={quickN}
                  </button>
                ))}
              </div>
            </ClayCard>

            <ClayCard glowColor="emerald" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Hội tụ Thống kê
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Độ lệch chuẩn thu hẹp:</span>
                  <span className="font-mono font-bold text-sky-600">{fmt(theoreticalStd, 3)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Tốc độ co cụm:</span>
                  <span className="font-mono font-bold text-emerald-600">O(1/√n) = {fmt(1 / Math.sqrt(sampleSizeN), 2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {sampleSizeN < 5 ? 'Chưa chuẩn hóa' : sampleSizeN < 20 ? 'Bắt đầu thành chuông' : 'Chuẩn Gauss hoàn hảo!'}
                  </span>
                </div>
              </div>
            </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <DesmosStageHeader
              title="Phân Bố Mẫu vs Chuông Gauss Lý Thuyết"
              formula="Z_n = \frac{\bar{X}_n - \mu}{\sigma/\sqrt{n}} \xrightarrow{d} \mathcal{N}(0, 1)"
              badge={`5,000 Mẫu | n = ${sampleSizeN}`}
              onReset={runSimulation}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <div className="relative w-full h-80 sm:h-96 flex items-end gap-1 pt-8 pb-8 px-4 sm:px-8 select-none">
                {/* Histogram Bars sitting directly on the grid */}
                {histogram.map((bin, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-sky-500/85 hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-400 rounded-t-sm transition-all duration-150 border-t border-sky-600 dark:border-sky-300 shadow-xs"
                    style={{ height: `${Math.max(2, bin.heightPercent)}%` }}
                    title={`Khoảng: [${fmt(bin.x0, 2)}, ${fmt(bin.x1, 2)}] - Mẫu: ${bin.count}`}
                  />
                ))}

                {/* SVG Overlay: Desmos Gaussian Bell Curve directly on the grid */}
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
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                    <span className="w-3 h-3 bg-sky-500 rounded-xs"></span>
                    Histogram Mẫu (5,000 thực nghiệm)
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-orange-600 dark:text-orange-400">
                    <span className="w-4 h-1 bg-orange-600 rounded-full"></span>
                    Chuông Gauss Chuẩn Hóa
                  </span>
                </div>
                <div className="font-mono text-slate-500 text-[11px]">
                  μ = {fmt(trueMean, 2)} | σ/√n = {fmt(theoreticalStd, 3)}
                </div>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Dù biến ngẫu nhiên gốc có hình thù kỳ dị tới mức nào (2 đỉnh bimodal, lệch hẳn về một bên như Exponential, hay phân phối rời rạc xúc xắc), tại sao khi ta cộng trung bình nhiều biến lại thì kết quả LUÔN LUÔN biến thành quả chuông đối xứng Gauss?"
            formula="Z_n = \frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} \xrightarrow{d} \mathcal{N}(0, 1) \quad \text{khi } n \to \infty"
            mathExplanation="Đây là định lý vĩ đại nhất của thống kê học! Nó khẳng định rằng tổng của một lượng lớn các biến độc lập có phương sai hữu hạn sẽ triệt tiêu các đặc tính riêng lẻ kỳ quặc của từng biến và hội tụ về phân phối Chuẩn phổ quát."
            howToInteract={[
              "Chọn phân phối gốc: '2 Đỉnh (Bimodal)' hoặc 'Hàm mũ Exp(1)'.",
              "Khi $n = 1$: Đồ thị thể hiện chính xác hình dáng méo mó của phân phối gốc.",
              "Kéo slider cỡ mẫu $n$ từ 1 lên 2, 5, 10, rồi 30 để chứng kiến phép màu xảy ra!"
            ]}
            whatToObserve="Chỉ cần $n \ge 15 - 20$, hai ngọn núi của phân phối bimodal sụp đổ và dồn hết về giữa, khớp hoàn hảo 100% với đường cong quả chuông Gauss màu cam!"
            takeaway="Trong các bài toán thực tế: Khi cỡ mẫu $n \ge 30$, ta được phép dùng bảng phân phối chuẩn $Z$ để tính xấp xỉ xác suất của trung bình mẫu!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 2: LUẬT SỐ LỚN (LLN) (ORIGINAL LAB - DIRECTLY ON DESMOS GRID)
         ========================================================================= */}
      {activeTab === 'lln' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="blue" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Ống Dung Sai Epsilon
                </h4>
                <ClaySlider
                  label="Độ rộng ống dung sai Epsilon (ε)"
                  value={epsilon}
                  min={0.02}
                  max={0.2}
                  step={0.01}
                  color="blue"
                  onChange={setEpsilon}
                />
                <div className="mt-4">
                  <ClayButton variant="primary" size="md" className="w-full text-xs font-bold" onClick={generateLlnPaths}>
                    Sinh 15 Quỹ Đạo Mới
                  </ClayButton>
                </div>
              </ClayCard>

              <ClayCard glowColor="purple" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Luật Số Lớn (LLN)
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  Khi cỡ mẫu n tăng lên, xác suất trung bình mẫu lệch khỏi kỳ vọng lớn hơn epsilon sẽ tiến về 0:
                </p>
                <div className="mt-2.5 p-2 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 font-bold text-sky-700 dark:text-sky-300 text-xs text-center">
                  <MathView math="P(|\bar{X}_n - \mu| \ge \epsilon) \xrightarrow{n \to \infty} 0" />
                </div>
              </ClayCard>

              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Thông Số Hội Tụ
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Kỳ vọng chân lý mu:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">0.50</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Dung sai ống:</span>
                    <span className="font-mono font-bold text-sky-600">±{fmt(epsilon, 2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Số bước tối đa:</span>
                    <span className="font-mono font-bold text-emerald-600">n = 400 bước</span>
                  </div>
                </div>
              </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
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

                {/* Epsilon corridor tube */}
                <rect
                  x="60"
                  y={180 - epsilon * 320}
                  width="700"
                  height={epsilon * 640}
                  fill="rgba(56, 189, 248, 0.18)"
                  stroke="#0284C7"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />

                {/* Center target mu = 0.5 */}
                <line x1="60" y1="180" x2="760" y2="180" stroke="#0F172A" strokeWidth="2.5" />
                <text x="765" y="184" fill="#0F172A" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  μ = 0.5
                </text>

                {/* 15 Sample Paths */}
                {llnPaths.map((path, pIdx) => {
                  const pts = path.map((val, step) => {
                    const px = 60 + (step / 400) * 700;
                    const py = 180 - (val - 0.5) * 320;
                    return `${px},${py}`;
                  });
                  const colors = ['#0284C7', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
                  const color = colors[pIdx % colors.length];
                  return (
                    <path
                      key={pIdx}
                      d={`M ${pts.join(' L ')}`}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      opacity="0.8"
                    />
                  );
                })}
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-semibold text-sky-600">
                    <span className="w-3 h-2 bg-sky-400/40 border border-sky-600"></span>
                    Hành lang sai số [-ε, +ε]
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="w-4 h-0.5 bg-slate-900 dark:bg-white"></span>
                    Kỳ vọng chân lý μ = 0.5
                  </span>
                </div>
                <div className="font-mono text-slate-500 text-[11px]">
                  Bước chạy: n = 1 đến 400
                </div>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Nếu ta tung một đồng xu cân bằng 1,000 lần, làm sao chắc chắn rằng tỷ lệ ra mặt ngửa sẽ dần dần ổn định quanh 0.5? Bản chất của Luật số lớn là gì?"
            formula="P(|\bar{X}_n - \mu| \ge \epsilon) \xrightarrow{n \to \infty} 0 \quad (\forall \epsilon > 0)"
            mathExplanation="Khi số phép thử $n$ tăng lên, phương sai của trung bình mẫu $\text{Var}(\bar{X}_n) = \sigma^2/n$ tiến về 0. Điều này ép toàn bộ các quỹ đạo thực nghiệm phải lọt vào và nằm im trong đường ống dung sai $[-\epsilon, +\epsilon]$ quanh tâm $\mu$."
            howToInteract={[
              "Kéo slider 'Dung sai Epsilon ($\epsilon$)' để mở rộng hoặc bóp hẹp đường ống màu xanh dương.",
              "Bấm nút 'Sinh 15 Quỹ đạo Mới' để tái tạo các ván tung đồng xu khác nhau.",
              "Xem tỷ lệ bao nhiêu phần trăm quỹ đạo nằm trọn trong ống khi bước chạy $n$ tiến đến 400."
            ]}
            whatToObserve="Ở những bước đầu ($n < 50$), các đường đi giật cục rất mạnh và bay ra ngoài ống. Nhưng càng về cuối ($n > 200$), tất cả các đường đều ngoan ngoãn hội tụ phẳng lì vào tâm 0.5!"
            takeaway="Luật số lớn đảm bảo các nhà cái sòng bạc hay công ty bảo hiểm luôn có lãi ổn định khi phục vụ số lượng người chơi đủ lớn!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 3: SO TÀI CẬN ĐUÔI (CHERNOFF VS CHEBYSHEV) - TRÊN Ô GRID TRỰC TIẾP
         ========================================================================= */}
      {activeTab === 'bounds' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="rose" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Độ Lệch Ngưỡng k
                </h4>
                <ClaySlider
                  label="Ngưỡng lệch k (số lần độ lệch chuẩn)"
                  value={boundK}
                  min={1.5}
                  max={4.0}
                  step={0.1}
                  color="rose"
                  formatValue={(v) => `${fmt(v, 1)}σ`}
                  onChange={setBoundK}
                />
                <div className="mt-3 flex gap-2">
                  {[1.5, 2.0, 2.5, 3.0, 3.5].map((quickK) => (
                    <button
                      key={quickK}
                      onClick={() => setBoundK(quickK)}
                      className="flex-1 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                    >
                      {quickK}σ
                    </button>
                  ))}
                </div>
              </ClayCard>

              <ClayCard glowColor="blue" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  So Sánh Các Cận Đuôi
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  Chebyshev chỉ dùng phương sai cho cận O(1/k²). Chernoff dùng toàn bộ MGF cho cận giảm theo hàm mũ O(e^(-k²/2)).
                </p>
                <div className="mt-2.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 font-bold text-amber-700 dark:text-amber-300 text-xs text-center">
                  <MathView math="P(|X| \ge k) \le \inf_{s>0} e^{-sk} M_X(s) \le \frac{\sigma^2}{k^2}" />
                </div>
              </ClayCard>

              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  So Sánh Kết Quả
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Xác suất thực:</span>
                    <span className="font-mono font-extrabold text-emerald-600">{fmt(exactProb * 100, 3)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Cận Chernoff:</span>
                    <span className="font-mono font-bold text-amber-600">≤ {fmt(chernoffBound * 100, 3)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Cận Chebyshev:</span>
                    <span className="font-mono font-bold text-rose-600">≤ {fmt(chebyshevBound * 100, 3)}%</span>
                  </div>
                </div>
              </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <DesmosStageHeader
              title="So Sánh Độ Thắt Chặt Của Cận Đuôi Xác Suất (N(0, 1))"
              formula="P(|X| \ge k) \le \text{Chernoff} \le \text{Chebyshev}"
              badge={`k = ${fmt(boundK, 2)}σ`}
              onReset={() => setBoundK(2.5)}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-bnd-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-bnd-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Cartesian Axes */}
                <line x1="60" y1="300" x2="740" y2="300" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-bnd-x)" />
                <line x1="400" y1="330" x2="400" y2="40" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-bnd-y)" />
                <text x="750" y="304" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">x</text>
                <text x="400" y="30" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">f(x)</text>

                {/* Normal Bell Curve */}
                {(() => {
                  const pts = [];
                  for (let x = -4; x <= 4; x += 0.1) {
                    const px = 400 + (x / 4) * 320;
                    const py = 300 - normalPdf(x, 0, 1) * 600;
                    pts.push(`${px},${py}`);
                  }
                  return (
                    <path d={`M ${pts.join(' L ')}`} fill="none" stroke="#0284C7" strokeWidth="3" />
                  );
                })()}

                {/* Shaded Tail Area for |X| >= k */}
                {(() => {
                  const rightPts = [];
                  for (let x = boundK; x <= 4; x += 0.05) {
                    const px = 400 + (x / 4) * 320;
                    const py = 300 - normalPdf(x, 0, 1) * 600;
                    rightPts.push(`${px},${py}`);
                  }
                  const leftPts = [];
                  for (let x = -4; x <= -boundK; x += 0.05) {
                    const px = 400 + (x / 4) * 320;
                    const py = 300 - normalPdf(x, 0, 1) * 600;
                    leftPts.push(`${px},${py}`);
                  }
                  const pxRightK = 400 + (boundK / 4) * 320;
                  const pxLeftK = 400 - (boundK / 4) * 320;
                  return (
                    <g>
                      {rightPts.length > 0 && (
                        <path
                          d={`M ${pxRightK},300 L ${rightPts.join(' L ')} L ${400 + 320},300 Z`}
                          fill="rgba(16, 185, 129, 0.4)"
                        />
                      )}
                      {leftPts.length > 0 && (
                        <path
                          d={`M ${400 - 320},300 L ${leftPts.join(' L ')} L ${pxLeftK},300 Z`}
                          fill="rgba(16, 185, 129, 0.4)"
                        />
                      )}
                    </g>
                  );
                })()}

                {/* Cutoff markers at +k and -k */}
                <line x1={400 + (boundK / 4) * 320} y1="60" x2={400 + (boundK / 4) * 320} y2="300" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 3" />
                <line x1={400 - (boundK / 4) * 320} y1="60" x2={400 - (boundK / 4) * 320} y2="300" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 3" />
                <text x={400 + (boundK / 4) * 320} y="50" fill="#EF4444" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  +k = +{fmt(boundK, 1)}
                </text>
                <text x={400 - (boundK / 4) * 320} y="50" fill="#EF4444" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  -k = -{fmt(boundK, 1)}
                </text>
              </svg>

              {/* Bottom Stage Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="w-3 h-3 bg-emerald-500 rounded-xs"></span> Xác suất thực P(|X| ≥ k): {fmt(exactProb * 100, 3)}%
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                    <span className="w-3 h-3 bg-amber-500 rounded-xs"></span> Cận Chernoff: ≤ {fmt(chernoffBound * 100, 3)}%
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                    <span className="w-3 h-3 bg-rose-500 rounded-xs"></span> Cận Chebyshev: ≤ {fmt(chebyshevBound * 100, 3)}%
                  </span>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  Chernoff thắt chặt hơn Chebyshev {fmt(chebyshevBound / Math.max(1e-5, chernoffBound), 1)} lần!
                </span>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Trong lý thuyết tính toán và máy học, ta rất hay cần chặn cận xác suất xảy ra biến cố cực đoan $P(X \ge a)$ khi không biết chính xác hàm phân phối. Tại sao cận Chernoff lại vượt trội hoàn toàn so với Markov và Chebyshev?"
            formula="\text{Markov: } \frac{\mathbb{E}[X]}{a}, \quad \text{Chebyshev: } \frac{\sigma^2}{a^2}, \quad \text{Chernoff: } \inf_{s > 0} e^{-s a} M_X(s)"
            mathExplanation="Markov chỉ dùng thông tin bậc 1 (kỳ vọng), cho cận giảm chậm theo $\mathcal{O}(1/a)$. Chebyshev dùng thông tin bậc 2 (phương sai), cho cận $\mathcal{O}(1/a^2)$. Nhưng Chernoff tận dụng toàn bộ hàm sinh moment MGF (toàn bộ mọi bậc moment), cho cận giảm nhanh theo hàm mũ $\mathcal{O}(e^{-a^2})$!"
            howToInteract={[
              "Kéo slider 'Khoảng cách $k$ (số độ lệch chuẩn)' từ 1.5 đến 4.0.",
              "Xem diện tích đuôi xác suất thật màu xanh lá.",
              "So sánh độ thắt chặt giữa cận Chebyshev ($\mathcal{O}(1/k^2)$) và cận Chernoff ($\mathcal{O}(e^{-k^2/2})$)."
            ]}
            whatToObserve="Khi $k = 3$ hoặc 4, Chebyshev chặn cận rất lỏng lẻo (chỉ biết xác suất $\le 6.25\%$), trong khi Chernoff thắt chặt xuống dưới 0.05%, cực kỳ sát với xác suất thực tế!"
            takeaway="Chernoff Bound là vũ khí số 1 trong chứng minh bảo mật mật mã và lý thuyết độ phức tạp tính toán (PAC Learning)!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 4: KHI CLT THẤT BẠI (PHÂN PHỐI CAUCHY) - TRÊN Ô GRID TRỰC TIẾP
         ========================================================================= */}
      {activeTab === 'cauchy' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="rose" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Cỡ Mẫu Khảo Sát
                </h4>
                <ClaySlider
                  label="Cỡ mẫu n"
                  sublabel="Tăng n không giúp Cauchy hội tụ"
                  value={cauchyN}
                  min={1}
                  max={50}
                  step={1}
                  color="rose"
                  onChange={setCauchyN}
                />
                <div className="mt-4">
                  <ClayButton variant="primary" size="md" className="w-full text-xs font-bold" onClick={runCauchySim}>
                    Lấy 150 Mẫu Mới
                  </ClayButton>
                </div>
              </ClayCard>

              <ClayCard glowColor="blue" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Ngoại Lệ Định Lý CLT
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  Phân phối Cauchy có đuôi cực dày khiến kỳ vọng và phương sai phân kỳ ra vô hạn:
                </p>
                <div className="mt-2.5 p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 font-bold text-red-700 dark:text-red-300 text-xs text-center">
                  <MathView math="X \sim \text{Cauchy}(0,1) \implies \mathbb{E}[|X|]=\infty, \, \bar{X}_n \sim \text{Cauchy}(0,1)" />
                </div>
              </ClayCard>

              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Trạng Thái Hội Tụ
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Đường Gaussian:</span>
                    <span className="font-mono font-bold text-sky-600">Hội tụ êm ả về 0</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Đường Cauchy:</span>
                    <span className="font-mono font-bold text-rose-600">Giật nổ cực đoan</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Kết luận:</span>
                    <span className="font-mono font-bold text-amber-600">CLT sụp đổ</span>
                  </div>
                </div>
              </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <DesmosStageHeader
              title="So Sánh Hội Tụ Trung Bình Mẫu: Gaussian Chuẩn vs Cauchy Đuôi Dày"
              formula="\text{Gaussian: } \text{Var}(\bar{X}_n) = \frac{\sigma^2}{n} \to 0 \quad \text{vs} \quad \text{Cauchy: } \bar{X}_n \sim \text{Cauchy}"
              badge={`n = ${cauchyN} quan sát / mẫu`}
              onReset={() => { setCauchyN(10); runCauchySim(); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-cy-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-cy-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Axes */}
                <line x1="60" y1="180" x2="740" y2="180" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrow-cy-x)" />
                <line x1="80" y1="330" x2="80" y2="30" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-cy-y)" />
                <text x="750" y="184" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">Mẫu thứ i</text>
                <text x="80" y="22" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">X̄_n</text>

                {/* Y ticks at -10, -5, 0, 5, 10 */}
                {[-10, -5, 0, 5, 10].map((v) => {
                  const py = 180 - (v / 15) * 140;
                  return (
                    <g key={`cy-tick-${v}`}>
                      <line x1="76" y1={py} x2="84" y2={py} stroke="#64748B" strokeWidth="1.5" />
                      <text x="70" y={py + 4} fill="#64748B" fontSize="11" textAnchor="end" fontWeight="bold" fontFamily="monospace">
                        {v}
                      </text>
                    </g>
                  );
                })}

                {/* Gaussian Running Mean (Clean Blue Line) */}
                {(() => {
                  const pts = cauchyPaths.normalAvg.map((val, idx) => {
                    const px = 80 + (idx / 150) * 640;
                    const py = 180 - (val / 15) * 140;
                    return `${px},${py}`;
                  });
                  return (
                    pts.length > 0 && (
                      <path d={`M ${pts.join(' L ')}`} fill="none" stroke="#0284C7" strokeWidth="2.5" />
                    )
                  );
                })()}

                {/* Cauchy Running Mean (Erratic Rose Line with Wild Spikes) */}
                {(() => {
                  const pts = cauchyPaths.cauchyAvg.map((val, idx) => {
                    const px = 80 + (idx / 150) * 640;
                    const clampedVal = Math.max(-15, Math.min(15, val));
                    const py = 180 - (clampedVal / 15) * 140;
                    return `${px},${py}`;
                  });
                  return (
                    pts.length > 0 && (
                      <path d={`M ${pts.join(' L ')}`} fill="none" stroke="#F43F5E" strokeWidth="2" strokeDasharray="3 2" />
                    )
                  );
                })()}
              </svg>

              {/* Bottom Stage Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                    <span className="w-4 h-0.5 bg-sky-500"></span> Gaussian: Hội tụ êm ả về 0 (CLT hoạt động)
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                    <span className="w-4 h-0.5 bg-rose-500 border-dashed"></span> Cauchy: Nổ gai cực đoan bất thường (CLT sụp đổ hoàn toàn)
                  </span>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  Phương sai Cauchy: Var = ∞
                </span>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Liệu định lý giới hạn trung tâm CLT có luôn luôn đúng cho mọi biến ngẫu nhiên không? Khi nào thì việc lấy trung bình mẫu KHÔNG THỂ triệt tiêu được rủi ro?"
            formula="X \sim \text{Cauchy}(0, 1) \implies \mathbb{E}[|X|] = \infty, \quad \bar{X}_n = \frac{1}{n}\sum_{i=1}^n X_i \sim \text{Cauchy}(0, 1)"
            mathExplanation="Phân phối Cauchy có đuôi cực dày (Fat Tails) khiến tích phân kỳ vọng và phương sai phân kỳ ra vô hạn. Kỳ lạ thay: Trung bình mẫu của $n$ biến Cauchy độc lập vẫn tuân theo đúng phân phối Cauchy ban đầu! Việc lấy thêm dữ liệu hoàn toàn vô dụng để giảm phương sai!"
            howToInteract={[
              "Kéo slider 'Cỡ mẫu $n$' từ 1 đến 50.",
              "Xem hai đường chạy trung bình mẫu: Đường xanh dương (Gaussian) vs Đường đỏ (Cauchy).",
              "Bấm nút 'Lấy 150 Mẫu Mới' để quan sát các cú sốc cực đoan (Black Swan)."
            ]}
            whatToObserve="Trong khi đường Gaussian co cụm phẳng lì quanh trục 0, đường Cauchy liên tục bị những cú giật vọt lên hàng chục đơn vị do xuất hiện các ngoại lai cực đoan!"
            takeaway="Trong tài chính và quản trị rủi ro: Nếu dữ liệu có hiện tượng đuôi dày (Fat Tails - phân phối Pareto/Cauchy), không được áp dụng CLT mù quáng kẻo dẫn tới sụp đổ danh mục!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 5: GALTON BOARD (QUINCUNX SIMULATION)
         ========================================================================= */}
      {activeTab === 'galton' && (
        <div className="space-y-6">
          <GaltonBoard />

          <LabBriefing
            question="Làm thế nào mà sự hỗn loạn thuần túy của từng viên bi lại tự động kiến tạo nên một trật tự hoàn hảo hình chuông đối xứng?"
            formula="S_n = \sum_{i=1}^n X_i, \quad X_i \in \{0, 1\} \implies \frac{S_n - np}{\sqrt{np(1-p)}} \xrightarrow{d} \mathcal{N}(0, 1)"
            mathExplanation="Bàn Galton (Quincunx) do Francis Galton phát minh năm 1889. Mỗi lần một viên bi chạm một chiếc đinh, nó rẽ trái hoặc phải ngẫu nhiên độc lập như một phép thử tung đồng xu Bernoulli. Sau n tầng đinh, số lần rẽ phải là biến nhị thức B(n, p). Theo Định lý Moivre-Laplace (dạng sơ khai của CLT), khi n lớn, phân phối nhị thức hội tụ tiệm cận về phân phối chuẩn Gaussian."
            howToInteract={[
              "Bấm 'Thả 1 bi' hoặc 'Thả 20 bi' để theo dõi từng đường rẽ ngẫu nhiên của các hạt qua từng hàng chốt.",
              "Bấm 'Tự động thả bi' và quan sát tháp bi tích lũy trong các ô chứa ở đáy.",
              "Bật/Tắt 'Âm thanh' để nghe nhịp va chạm vào chốt gỗ và tiếng rơi vào ô đáy.",
              "Kéo slider 'Xác suất rẽ phải (p)' lệch khỏi 0.5 (ví dụ 0.3 hoặc 0.7) để thấy hình chuông bị kéo lệch (Skewness) sang một bên."
            ]}
            whatToObserve="Dù đường đi của từng hạt hoàn toàn bất định và không thể đoán trước, khi số lượng bi đủ lớn, cột tháp bi luôn luôn ôm khít lấy đường cong chuẩn Gauss màu đỏ!"
            takeaway="Đây là trực giác cốt lõi của thống kê hiện đại: Từ vô số tác động ngẫu nhiên vi mô, quy luật vĩ mô tất yếu xuất hiện."
          />
        </div>
      )}
    </div>
  );
};
