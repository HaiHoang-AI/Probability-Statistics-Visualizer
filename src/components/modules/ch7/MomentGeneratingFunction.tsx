import React, { useState, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';

export const MomentGeneratingFunction: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tangent' | 'product' | 'wald'>('tangent');

  // Tab 1: MGF Tangent State (Original Lab)
  const [dist, setDist] = useState<'poisson' | 'exponential' | 'normal'>('poisson');
  const [param, setParam] = useState<number>(2.0);
  const [showTangent, setShowTangent] = useState<boolean>(true);
  const [showParabola, setShowParabola] = useState<boolean>(true);

  // Tab 2: MGF Product Sum State
  const [sumDist, setSumDist] = useState<'poisson' | 'normal'>('poisson');
  const [param1, setParam1] = useState<number>(2.0);
  const [param2, setParam2] = useState<number>(3.0);

  // Tab 3: Wald Identity (Random Sum)
  const [lambdaN, setLambdaN] = useState<number>(5.0);
  const [muX, setMuX] = useState<number>(10.0);
  const [waldSamples, setWaldSamples] = useState<number[]>([]);

  // Theoretical moments for Tab 1
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
    tangentPoints.push({ s, val: 1 + mean * s });
    parabolaPoints.push({ s, val: 1 + mean * s + 0.5 * moment2 * s * s });
  }

  const mapS = (s: number) => 380 + s * 340;
  const mapV = (v: number) => 310 - (v - 0) * 55;

  // Simulate Wald random sum
  const runWaldSimulation = () => {
    const trials = 3000;
    const samples: number[] = new Array(trials);
    for (let t = 0; t < trials; t++) {
      let n = 0;
      const L = Math.exp(-lambdaN);
      let p = 1.0;
      do {
        n++;
        p *= Math.random();
      } while (p > L);
      n = Math.max(0, n - 1);

      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += -muX * Math.log(1 - Math.random());
      }
      samples[t] = sum;
    }
    setWaldSamples(samples);
  };

  const waldTheoMean = lambdaN * muX;
  const waldTheoVar = lambdaN * (muX * muX) + lambdaN * (muX * muX); // Exp Var = mu^2, Poisson Var = lambda

  const waldEmpiricalMean = useMemo(() => {
    if (waldSamples.length === 0) return 0;
    return waldSamples.reduce((a, b) => a + b, 0) / waldSamples.length;
  }, [waldSamples]);

  const waldEmpiricalVar = useMemo(() => {
    if (waldSamples.length === 0) return 0;
    const m = waldEmpiricalMean;
    return waldSamples.reduce((a, b) => a + (b - m) ** 2, 0) / waldSamples.length;
  }, [waldSamples, waldEmpiricalMean]);

  return (
    <div className="space-y-6">
      {/* Chapter Subtitle & Context Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            MAT1101 Bài 7.2 — Hàm sinh Moment (MGF)
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Hàm sinh Moment, Khai triển Taylor & Phép nhân Đại số
          </h2>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('tangent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'tangent'
                ? 'bg-rose-600 text-white shadow-xs dark:shadow-[2px_2px_0px_#f43f5e]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Tiếp tuyến & Độ cong tại s = 0
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'product'
                ? 'bg-rose-600 text-white shadow-xs dark:shadow-[2px_2px_0px_#f43f5e]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Nhân đại số thay cho Tích chập
          </button>
          <button
            onClick={() => setActiveTab('wald')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'wald'
                ? 'bg-rose-600 text-white shadow-xs dark:shadow-[2px_2px_0px_#f43f5e]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. Tổng ngẫu nhiên & Định lý Wald
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: TIẾP TUYẾN & ĐỘ CONG TẠI s = 0 (2-COLUMN LAYOUT)
         ========================================================================= */}
      {activeTab === 'tangent' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              {/* Card 1: Chọn Phân bố & Tham số */}
              <ClayCard glowColor="rose" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Chọn Phân bố Xác suất
                </h4>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setDist('poisson')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
                      dist === 'poisson'
                        ? 'bg-rose-600 text-white shadow-xs dark:shadow-[2px_2px_0px_#f43f5e]'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    Poisson(λ)
                  </button>
                  <button
                    onClick={() => setDist('exponential')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
                      dist === 'exponential'
                        ? 'bg-rose-600 text-white shadow-xs dark:shadow-[2px_2px_0px_#f43f5e]'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    Mũ Exp(λ)
                  </button>
                  <button
                    onClick={() => setDist('normal')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
                      dist === 'normal'
                        ? 'bg-rose-600 text-white shadow-xs dark:shadow-[2px_2px_0px_#f43f5e]'
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
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Ý nghĩa Hình học tại s = 0
                </h4>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed mb-3 font-medium">
                  Hàm sinh moment mã hóa toàn bộ thông tin của các moment vào độ dốc và độ cong tại gốc:
                </p>
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700">
                    <span className="font-bold text-sky-700 dark:text-sky-300">Độ dốc tiếp tuyến:</span>{' '}
                    <MathView math="M'_X(0) = \mathbb{E}[X]" />
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
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

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <DesmosStageHeader
                  title="Đồ Thị Hàm Sinh Moment & Tiếp Tuyến Taylor tại s = 0"
                  formula={mgfFormula}
                  badge={`Phân bố: ${dist.toUpperCase()} (${titleParam})`}
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
                          className="rounded text-sky-600 focus:ring-0"
                        />
                        <span>Tiếp tuyến E[X]</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-heading font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                        <input
                          type="checkbox"
                          checked={showParabola}
                          onChange={(e) => setShowParabola(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-0"
                        />
                        <span>Parabol E[X²]</span>
                      </label>
                    </div>
                  }
                />

                <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
                  <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                    <defs>
                      <marker id="arrow-mgf-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                      </marker>
                      <marker id="arrow-mgf-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                      </marker>
                    </defs>

                    {/* Axes directly on the Desmos Cartesian Grid */}
                    <line x1="60" y1="310" x2="740" y2="310" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-mgf-x)" />
                    <line x1="380" y1="340" x2="380" y2="30" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-mgf-y)" />
                    <text x="750" y="314" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">s</text>
                    <text x="380" y="22" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">M_X(s)</text>

                    {/* Baseline M(0) = 1 line */}
                    <line x1="60" y1={mapV(1)} x2="720" y2={mapV(1)} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="370" y={mapV(1) + 4} fill="#64748B" fontSize="11" textAnchor="end" fontWeight="bold" fontFamily="monospace">
                      M(0) = 1
                    </text>

                    {/* Tangent line at s = 0 */}
                    {showTangent && (
                      <path
                        d={tangentPoints
                          .filter((p) => p.val >= 0 && p.val <= 5.5)
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
                          .filter((p) => p.val >= 0 && p.val <= 5.5)
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
                        .filter((p) => p.val >= 0 && p.val <= 5.5)
                        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapS(p.s)} ${mapV(p.val)}`)
                        .join(' ')}
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* Origin point (0, 1) */}
                    <circle cx={mapS(0)} cy={mapV(1)} r="6" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>

                  {/* Bottom Stage Legend */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                        <span className="w-4 h-1 bg-rose-500 rounded-full"></span>
                        <span>Đường cong <MathView math="M_X(s)" /></span>
                      </span>
                      {showTangent && (
                        <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                          <span className="w-4 h-0.5 bg-sky-500 border-dashed"></span>
                          <span>Tiếp tuyến: Độ dốc = <MathView math="E[X]" /> = {fmt(mean, 2)}</span>
                        </span>
                      )}
                      {showParabola && (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                          <span className="w-4 h-0.5 bg-amber-500"></span>
                          <span>Parabol: Độ cong = <MathView math="E[X^2]" /> = {fmt(moment2, 2)}</span>
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-xs">
                      Taylor: M(s) ≈ 1 + s·E[X] + (s²/2)·E[X²]
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Hàm sinh Moment $M_X(s) = \mathbb{E}[e^{sX}]$ là một công cụ biến đổi đại số cực mạnh. Làm thế nào mà chỉ cần đạo hàm hàm số này tại điểm gốc $s = 0$, ta lại thu được toàn bộ các moment kỳ vọng và phương sai?"
            formula="M_X(s) = \mathbb{E}[e^{sX}] = 1 + s\mathbb{E}[X] + \frac{s^2}{2!}\mathbb{E}[X^2] + \dots \implies M'_X(0) = \mathbb{E}[X], \quad M''_X(0) = \mathbb{E}[X^2]"
            mathExplanation="Khai triển chuỗi Taylor của hàm $e^{sX}$ tại $s = 0$ biến các lũy thừa của $s$ thành hệ số chứa các moment $\mathbb{E}[X^k]$. Do đó: độ dốc tiếp tuyến tại 0 chính là Kỳ vọng $\mathbb{E}[X]$, và độ cong uốn parabol tại 0 chính là Moment bậc 2 $\mathbb{E}[X^2]$!"
            howToInteract={[
              "Chọn một trong 3 phân phối: Poisson($\lambda$), Mũ Exp($\lambda$), hoặc Chuẩn $\\mathcal{N}(\\mu, 1)$.",
              "Kéo slider tham số để xem đường cong $M_X(s)$ đổi độ dốc tại điểm $s = 0$.",
              "Bật/tắt checkbox 'Hiện tiếp tuyến' và 'Hiện parabol' để kiểm chứng xấp xỉ Taylor bậc 1 và bậc 2 quanh gốc tọa độ."
            ]}
            whatToObserve="Tại $s = 0$, $M_X(0)$ LUÔN LUÔN BẰNG 1.00 với mọi phân phối (do $e^0 = 1$). Đường tiếp tuyến màu cam bám khít hàm số quanh lân cận $s = 0$ với độ dốc bằng đúng $\mathbb{E}[X]$."
            takeaway="Mẹo thi cử: Muốn tìm kỳ vọng và phương sai từ MGF: Tính đạo hàm $M'(0)$ được $\mathbb{E}[X]$, tính đạo hàm cấp hai $M''(0)$ được $\mathbb{E}[X^2]$, rồi dùng $\\text{Var}(X) = \mathbb{E}[X^2] - (\mathbb{E}[X])^2$!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 2: NHÂN ĐẠI SỐ MGF THAY CHO TÍCH CHẬP (2-COLUMN LAYOUT)
         ========================================================================= */}
      {activeTab === 'product' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              {/* Card 1: Chọn Phân bố & Tham số */}
              <ClayCard glowColor="rose" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Chọn Phân bố & Tham số
                </h4>
                <div className="flex gap-2 mb-4">
                  <ClayButton
                    variant={sumDist === 'poisson' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSumDist('poisson')}
                    className="flex-1 text-xs"
                  >
                    Poisson
                  </ClayButton>
                  <ClayButton
                    variant={sumDist === 'normal' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSumDist('normal')}
                    className="flex-1 text-xs"
                  >
                    Gaussian
                  </ClayButton>
                </div>

                <div className="space-y-3">
                  <ClaySlider
                    label={sumDist === 'poisson' ? 'Tham số lambda_X' : 'Kỳ vọng mu_X'}
                    value={param1}
                    min={1}
                    max={5}
                    step={0.5}
                    color="blue"
                    onChange={setParam1}
                  />
                  <ClaySlider
                    label={sumDist === 'poisson' ? 'Tham số lambda_Y' : 'Kỳ vọng mu_Y'}
                    value={param2}
                    min={1}
                    max={5}
                    step={0.5}
                    color="emerald"
                    onChange={setParam2}
                  />
                </div>
              </ClayCard>

              {/* Card 2: Ý nghĩa Phép nhân MGF */}
              <ClayCard glowColor="blue" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Ý nghĩa Phép nhân MGF
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-3 font-medium">
                  Tích chập phân phối của hai biến ngẫu nhiên độc lập trở thành phép nhân đại số đơn giản:
                </p>
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sm font-bold text-sky-700 dark:text-sky-300 text-center">
                  <MathView math="M_{X+Y}(s) = M_X(s) \cdot M_Y(s)" />
                </div>
              </ClayCard>

              {/* Card 3: Tham số Phân phối Tổng Z */}
              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Tham số Phân phối Tổng Z
                </h4>
                <div className="space-y-2 text-xs">
                  {sumDist === 'poisson' ? (
                    <>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500">Phân bố Z:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Poisson(λ_Z)</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500">λ_Z = λ_X + λ_Y:</span>
                        <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                          {fmt(param1 + param2, 1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500">E[Z] = Var(Z):</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {fmt(param1 + param2, 1)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500">Phân bố Z:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Normal(μ_Z, σ²_Z)</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500">μ_Z = μ_X + μ_Y:</span>
                        <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                          {fmt(param1 + param2, 1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500">σ²_Z = σ²_X + σ²_Y:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">2.00</span>
                      </div>
                    </>
                  )}
                </div>
              </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <DesmosStageHeader
                  title="Đại số MGF: Phép nhân thay thế cho Tích chập liên tục"
                  formula={
                    sumDist === 'poisson'
                      ? `M_Z(s) = e^{${param1}(e^s-1)} \\cdot e^{${param2}(e^s-1)} = e^{${fmt(param1 + param2, 1)}(e^s-1)}`
                      : `M_Z(s) = e^{${param1}s + 0.5s^2} \\cdot e^{${param2}s + 0.5s^2} = e^{${fmt(param1 + param2, 1)}s + s^2}`
                  }
                  badge={sumDist === 'poisson' ? `Z ~ Poisson(${fmt(param1 + param2, 1)})` : `Z ~ Normal(${fmt(param1 + param2, 1)}, σ²=2)`}
                  onReset={() => { setParam1(2.0); setParam2(3.0); }}
                />

                <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
                  <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                    <defs>
                      <marker id="arrow-prod-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                      </marker>
                      <marker id="arrow-prod-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                      </marker>
                    </defs>

                    {/* Cartesian Axes */}
                    <line x1="80" y1="300" x2="740" y2="300" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-prod-x)" />
                    <line x1="380" y1="330" x2="380" y2="40" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-prod-y)" />
                    <text x="750" y="304" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">s</text>
                    <text x="380" y="30" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">M(s)</text>

                    {/* Grid ticks for s in [-0.6, 0.6] */}
                    {[-0.6, -0.4, -0.2, 0.2, 0.4, 0.6].map((sv) => (
                      <g key={`prod-s-${sv}`}>
                        <line x1={mapS(sv)} y1="296" x2={mapS(sv)} y2="304" stroke="#64748B" strokeWidth="1.5" />
                        <text x={mapS(sv)} y="322" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                          {sv.toFixed(1)}
                        </text>
                      </g>
                    ))}

                    {/* Baseline 1.0 */}
                    <line x1="80" y1={300 - 45} x2="720" y2={300 - 45} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="370" y={300 - 41} fill="#64748B" fontSize="11" textAnchor="end" fontWeight="bold">1.0</text>

                    {/* Plot M_X, M_Y, M_Z */}
                    {(() => {
                      const ptsX = [], ptsY = [], ptsZ = [];
                      for (let s = -0.6; s <= 0.6; s += 0.03) {
                        let vx = 1, vy = 1, vz = 1;
                        if (sumDist === 'poisson') {
                          vx = Math.exp(param1 * (Math.exp(s) - 1));
                          vy = Math.exp(param2 * (Math.exp(s) - 1));
                          vz = vx * vy;
                        } else {
                          vx = Math.exp(param1 * s + 0.5 * s * s);
                          vy = Math.exp(param2 * s + 0.5 * s * s);
                          vz = vx * vy;
                        }
                        const px = mapS(s);
                        const pyX = 300 - Math.min(250, vx * 45);
                        const pyY = 300 - Math.min(250, vy * 45);
                        const pyZ = 300 - Math.min(250, vz * 45);
                        ptsX.push(`${px},${pyX}`);
                        ptsY.push(`${px},${pyY}`);
                        ptsZ.push(`${px},${pyZ}`);
                      }
                      return (
                        <g>
                          <path d={`M ${ptsX.join(' L ')}`} fill="none" stroke="#0284C7" strokeWidth="2.5" strokeDasharray="5 3" />
                          <path d={`M ${ptsY.join(' L ')}`} fill="none" stroke="#10B981" strokeWidth="2.5" strokeDasharray="5 3" />
                          <path d={`M ${ptsZ.join(' L ')}`} fill="none" stroke="#F43F5E" strokeWidth="4" strokeLinecap="round" />
                        </g>
                      );
                    })()}
                  </svg>

                  {/* Bottom Stage Legend */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                        <span className="w-4 h-0.5 bg-sky-500 border-dashed"></span>
                        <span><MathView math="M_X(s)" /> (Biến 1)</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="w-4 h-0.5 bg-emerald-500 border-dashed"></span>
                        <span><MathView math="M_Y(s)" /> (Biến 2)</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                        <span className="w-4 h-1 bg-rose-500 rounded-full"></span>
                        <span><MathView math="M_Z(s) = M_X(s) \cdot M_Y(s)" /></span>
                      </span>
                    </div>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                      {sumDist === 'poisson' ? (
                        <span><MathView math={`\\lambda_Z = ${fmt(param1 + param2, 1)}`} /></span>
                      ) : (
                        <span><MathView math={`\\mu_Z = ${fmt(param1 + param2, 1)}, \\sigma_Z^2 = 2.0`} /></span>
                      )}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Khi cộng hai biến ngẫu nhiên độc lập $Z = X + Y$, tích phân tích chập rất khó tính. Tại sao MGF lại biến bài toán tích chập thành phép nhân đại số đơn giản?"
            formula="M_{X+Y}(s) = \mathbb{E}[e^{s(X+Y)}] = \mathbb{E}[e^{sX} \cdot e^{sY}] = M_X(s) \cdot M_Y(s)"
            mathExplanation="Do $X$ và $Y$ độc lập, kỳ vọng của tích bằng tích các kỳ vọng! Khi nhân 2 hàm MGF với nhau, các số mũ cộng lại. Nhìn vào dạng hàm MGF kết quả, ta nhận dạng được ngay phân phối của tổng mà không cần giải bất kỳ một tích phân nào!"
            howToInteract={[
              "Chọn loại phân phối: Tổng 2 biến Poisson hoặc Tổng 2 biến Gaussian.",
              "Kéo slider tham số của $X$ và $Y$.",
              "Quan sát 3 đường cong $M_X$, $M_Y$ và đường tích $M_{X+Y}$ trên cùng hệ trục tọa độ Desmos."
            ]}
            whatToObserve="Đường cong tích $M_{X+Y}(s)$ dâng lên rất nhanh vì là tích của 2 hàm tăng. Tham số của tổng chính là tổng các tham số: $\lambda_Z = \lambda_X + \lambda_Y$ hoặc $\mu_Z = \mu_X + \mu_Y$."
            takeaway="Tổng các biến Poisson độc lập LÀ một biến Poisson. Tổng các biến Gauss độc lập LÀ một biến Gauss. Điều này được chứng minh dễ dàng nhất qua MGF!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 3: TỔNG NGẪU NHIÊN CÁC BIẾN NGẪU NHIÊN & ĐỊNH LÝ WALD (2-COLUMN LAYOUT)
         ========================================================================= */}
      {activeTab === 'wald' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              {/* Card 1: Điều khiển Tham số */}
              <ClayCard glowColor="blue" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Tham số Quá trình
                </h4>
                <div className="space-y-3 mb-4">
                  <ClaySlider
                    label="Kỳ vọng số khách E[N]"
                    sublabel="N ~ Poisson(λ)"
                    value={lambdaN}
                    min={1}
                    max={15}
                    step={1}
                    color="blue"
                    onChange={setLambdaN}
                  />
                  <ClaySlider
                    label="Kỳ vọng tiền mỗi khách E[X]"
                    sublabel="X ~ Exp(1/μ)"
                    value={muX}
                    min={5}
                    max={30}
                    step={1}
                    color="emerald"
                    onChange={setMuX}
                  />
                </div>
                <ClayButton variant="primary" size="md" className="w-full text-xs font-bold" onClick={runWaldSimulation}>
                  Chạy Mô Phỏng 3,000 Mẫu
                </ClayButton>
              </ClayCard>

              {/* Card 2: Công thức & Định lý Wald */}
              <ClayCard glowColor="amber" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Định lý Wald & Phương sai
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-3 font-medium">
                  Tổng ngẫu nhiên các biến ngẫu nhiên i.i.d:
                </p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="p-2 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 font-bold text-sky-700 dark:text-sky-300">
                    <MathView math="\mathbb{E}[S] = \mathbb{E}[N]\mathbb{E}[X]" />
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 font-bold text-amber-700 dark:text-amber-300">
                    <MathView math="\text{Var}(S) = \mathbb{E}[N]\text{Var}(X) + (\mathbb{E}[X])^2\text{Var}(N)" />
                  </div>
                </div>
              </ClayCard>

              {/* Card 3: So sánh Lý thuyết vs Thực nghiệm */}
              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Kiểm chứng Thống kê
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">E[S] Wald lý thuyết:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{fmt(waldTheoMean, 1)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">E[S] Thực tế 3,000 mẫu:</span>
                    <span className="font-mono font-extrabold text-sky-600 dark:text-sky-400 text-sm">
                      {waldSamples.length > 0 ? fmt(waldEmpiricalMean, 1) : 'Chưa chạy'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Var(S) Wald lý thuyết:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{fmt(waldTheoVar, 1)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Var(S) Thực tế:</span>
                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {waldSamples.length > 0 ? fmt(waldEmpiricalVar, 1) : 'Chưa chạy'}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <DesmosStageHeader
                  title="Mô phỏng Monte Carlo Kiểm chứng Định lý Wald (Random Sum)"
                  formula="\mathbb{E}[S] = \mathbb{E}[N]\mathbb{E}[X]"
                  badge={`E[S] lý thuyết = ${fmt(waldTheoMean, 1)}`}
                  onReset={() => { setLambdaN(5.0); setMuX(10.0); setWaldSamples([]); }}
                />

                <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
                  <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                    <defs>
                      <marker id="arrow-wald-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                      </marker>
                      <marker id="arrow-wald-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                      </marker>
                    </defs>

                    {/* Cartesian Axes */}
                    <line x1="80" y1="300" x2="740" y2="300" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-wald-x)" />
                    <line x1="120" y1="330" x2="120" y2="40" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-wald-y)" />
                    <text x="750" y="304" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">Tổng tiền S</text>
                    <text x="120" y="30" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Tần số</text>

                    {/* Samples histogram or empty guide */}
                    {waldSamples.length > 0 ? (
                      (() => {
                        const maxVal = Math.max(...waldSamples, waldTheoMean * 2.5);
                        const binCount = 30;
                        const bins = new Array(binCount).fill(0);
                        for (const s of waldSamples) {
                          const idx = Math.min(binCount - 1, Math.floor((s / maxVal) * binCount));
                          if (idx >= 0) bins[idx]++;
                        }
                        const maxBin = Math.max(...bins, 1);
                        return (
                          <g>
                            {bins.map((cnt, i) => {
                              const px = 120 + (i / binCount) * 600;
                              const bw = 600 / binCount - 2;
                              const bh = (cnt / maxBin) * 230;
                              return (
                                <rect
                                  key={i}
                                  x={px}
                                  y={300 - bh}
                                  width={bw}
                                  height={bh}
                                  fill="#0284C7"
                                  opacity="0.65"
                                  stroke="#0369A1"
                                  strokeWidth="1"
                                />
                              );
                            })}

                            {/* Theoretical Mean Vertical Line */}
                            <line
                              x1={120 + (waldTheoMean / maxVal) * 600}
                              y1="50"
                              x2={120 + (waldTheoMean / maxVal) * 600}
                              y2="300"
                              stroke="#EF4444"
                              strokeWidth="3"
                              strokeDasharray="6 3"
                            />
                            <text
                              x={120 + (waldTheoMean / maxVal) * 600}
                              y="40"
                              fill="#EF4444"
                              fontSize="12"
                              fontWeight="bold"
                              textAnchor="middle"
                              fontFamily="monospace"
                            >
                              E[S] lý thuyết = {fmt(waldTheoMean, 1)}
                            </text>
                          </g>
                        );
                      })()
                    ) : (
                      <text x="400" y="180" fill="#94A3B8" fontSize="14" fontWeight="bold" textAnchor="middle">
                        Bấm nút "Chạy Mô Phỏng 3,000 Mẫu" ở bảng điều khiển bên trái để vẽ đồ thị
                      </text>
                    )}
                  </svg>

                  {/* Bottom Stage Legend */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                        <span className="w-3.5 h-1.5 rounded-sm bg-sky-500"></span> Phân phối thực nghiệm 3,000 mẫu
                      </span>
                      <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                        <span className="w-4 h-0.5 bg-rose-500 border-dashed"></span> Kỳ vọng lý thuyết Wald
                      </span>
                    </div>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                      {waldSamples.length > 0 ? `E_thực tế = ${fmt(waldEmpiricalMean, 1)} | Var_thực tế = ${fmt(waldEmpiricalVar, 1)}` : 'Chưa có mẫu'}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Một ngân hàng có $N$ khách hàng ghé thăm trong ngày ($N$ ngẫu nhiên $\\sim \\text{Poisson}$). Mỗi khách rút một số tiền $X_i$ ngẫu nhiên. Tổng số tiền rút trong ngày $S = X_1 + X_2 + \dots + X_N$ có kỳ vọng và phương sai tính như thế nào khi cả số phần tử $N$ lẫn giá trị $X_i$ đều ngẫu nhiên?"
            formula="\mathbb{E}[S] = \mathbb{E}[N]\mathbb{E}[X], \quad \text{Var}(S) = \mathbb{E}[N]\text{Var}(X) + (\mathbb{E}[X])^2 \text{Var}(N)"
            mathExplanation="Đây là đẳng thức Wald kinh điển! Phương sai của tổng ngẫu nhiên gồm 2 nguồn: Sự bấp bênh từ giá trị của từng khách hàng $\mathbb{E}[N]\text{Var}(X)$ CỘNG VỚI sự bấp bênh từ số lượng khách hàng ghé thăm $(\mathbb{E}[X])^2 \text{Var}(N)$."
            howToInteract={[
              "Kéo slider 'Kỳ vọng số khách $\\mathbb{E}[N]$' và 'Kỳ vọng số tiền mỗi khách $\\mathbb{E}[X]$'.",
              "Bấm nút 'Chạy Mô Phỏng Monte Carlo 3,000 ngày' để xem phân phối mẫu.",
              "So sánh số liệu thực nghiệm với công thức lý thuyết Wald."
            ]}
            whatToObserve="Sau 3,000 lần mô phỏng, trung bình thực tế $\mathbb{E}_{\\text{emp}}$ và phương sai $\\text{Var}_{\\text{emp}}$ hội tụ sát sàn sạt với giá trị tính từ công thức Wald!"
            takeaway="Trong bài thi: Cứ gặp bài toán 'Tổng số ngẫu nhiên các biến ngẫu nhiên độc lập cùng phân phối (i.i.d)' $\\implies$ áp dụng ngay Định lý Wald!"
          />
        </div>
      )}
    </div>
  );
};
