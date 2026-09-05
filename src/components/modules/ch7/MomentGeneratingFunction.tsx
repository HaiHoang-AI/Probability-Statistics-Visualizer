import React, { useState, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, randomPoisson, randomExponential, randomNormal } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';

export const MomentGeneratingFunction: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tangent' | 'product' | 'wald'>('tangent');

  // Tab 1: MGF Tangent State
  const [dist, setDist] = useState<'poisson' | 'exponential' | 'normal'>('poisson');
  const [param, setParam] = useState<number>(2.0);
  const [showTangent, setShowTangent] = useState<boolean>(true);
  const [showParabola, setShowParabola] = useState<boolean>(true);

  // Tab 2: MGF Product Sum State
  const [sumDist, setSumDist] = useState<'poisson' | 'normal'>('poisson');
  const [param1, setParam1] = useState<number>(2.0); // lambda1 or mu1
  const [param2, setParam2] = useState<number>(3.0); // lambda2 or mu2

  // Tab 3: Wald Identity (Random Sum of Random Variables)
  const [lambdaN, setLambdaN] = useState<number>(5.0); // Mean number of customers N ~ Poisson(lambda)
  const [muX, setMuX] = useState<number>(10.0); // Mean transaction amount X ~ Exp(1/muX)
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
  const mapV = (v: number) => 360 - v * 70;

  // Simulate Wald random sum
  const runWaldSimulation = () => {
    const trials = 3000;
    const samples: number[] = new Array(trials);
    for (let t = 0; t < trials; t++) {
      // Sample N from Poisson
      let n = 0;
      const L = Math.exp(-lambdaN);
      let p = 1.0;
      do {
        n++;
        p *= Math.random();
      } while (p > L);
      n = Math.max(0, n - 1);

      // Sum N exponential variables
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += -muX * Math.log(1 - Math.random());
      }
      samples[t] = sum;
    }
    setWaldSamples(samples);
  };

  const { waldEmpiricalMean, waldEmpiricalVar } = useMemo(() => {
    if (waldSamples.length === 0) return { waldEmpiricalMean: 0, waldEmpiricalVar: 0 };
    const m = waldSamples.reduce((a, b) => a + b, 0) / waldSamples.length;
    const v = waldSamples.reduce((acc, x) => acc + (x - m) ** 2, 0) / waldSamples.length;
    return { waldEmpiricalMean: m, waldEmpiricalVar: v };
  }, [waldSamples]);

  const waldTheoMean = lambdaN * muX;
  const varX = muX * muX; // for Exponential
  const varN = lambdaN; // for Poisson
  const waldTheoVar = lambdaN * varX + muX * muX * varN;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 7.2 — Hàm sinh Moment (MGF)
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Hàm sinh Moment <MathView math="M_X(s) = \mathbb{E}[e^{sX}]" /> & Định lý Wald
          </h2>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('tangent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'tangent'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Tiếp tuyến & Moment tại Gốc
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'product'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Nhân MGF (Thay cho Tích chập)
          </button>
          <button
            onClick={() => setActiveTab('wald')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'wald'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. Tổng ngẫu nhiên & Định lý Wald
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: MGF TANGENT & MOMENTS AT ORIGIN
         ========================================================================= */}
      {activeTab === 'tangent' && (
        <div className="space-y-6">
          <LabBriefing
            question="Tại sao hàm M_X(s) = E[e^{sX}] lại được gọi là 'Hàm sinh Moment'? Biến số s ở đây mang ý nghĩa gì và làm sao để tìm E[X], E[X^2] mà không cần tính tích phân phức tạp?"
            formula="M_X(s) = 1 + \mathbb{E}[X]s + \frac{\mathbb{E}[X^2]}{2!}s^2 + \dots \implies M_X'(0) = \mathbb{E}[X], \quad M_X''(0) = \mathbb{E}[X^2]"
            mathExplanation="Khi khai triển chuỗi Taylor của e^{sX} tại s=0, hệ số của s chính là kỳ vọng E[X], hệ số của s^2 chính là E[X^2]/2. Do đó, hình học của đồ thị MGF tại điểm gốc (s=0, M=1) gói trọn mọi thông tin: Độ dốc tiếp tuyến chính là Kỳ vọng, còn độ cong parabol chính là Moment bậc hai!"
            howToInteract={[
              "Chuyển đổi giữa 3 phân phối: Poisson, Exponential, và Normal.",
              "Kéo slider tham số để xem đường cong MGF và tiếp tuyến thay đổi theo thời gian thực.",
              "Bật/tắt checkbox 'Hiện Tiếp Tuyến Taylor' và 'Hiện Parabol xấp xỉ' để so sánh độ khít quanh s = 0."
            ]}
            whatToObserve="Tại s = 0, đồ thị MGF luôn luôn đi qua điểm cố định (0, 1) vì M(0) = E[e^0] = 1. Khi bạn tăng kỳ vọng E[X], tiếp tuyến màu cam quay dốc đứng lên trên!"
            takeaway="Muốn tìm kỳ vọng và phương sai của một biến ngẫu nhiên bất kỳ: Đạo hàm MGF cấp 1 lấy tại s=0 ra E[X]; đạo hàm cấp 2 lấy tại s=0 ra E[X^2]; sau đó tính Var(X) = E[X^2] - (E[X])^2!"
          />

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
                      className="rounded text-sky-600 focus:ring-0"
                    />
                    <span>Tiếp tuyến</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-heading font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={showParabola}
                      onChange={(e) => setShowParabola(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-0"
                    />
                    <span>Parabol</span>
                  </label>
                </div>
              }
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[460px]">
              <div className="relative w-full max-w-3xl h-80 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                <svg viewBox="100 0 600 420" className="w-full h-full">
                  <line x1="100" y1="360" x2="680" y2="360" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="380" y1="20" x2="380" y2="400" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="100" y1="290" x2="680" y2="290" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="365" y="295" fontSize="12" fill="#64748b" textAnchor="end" fontFamily="monospace">
                    M(0) = 1
                  </text>

                  {/* MGF Curve */}
                  <path
                    d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapS(p.s)} ${mapV(p.val)}`).join(' ')}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Tangent at s=0 */}
                  {showTangent && (
                    <path
                      d={tangentPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapS(p.s)} ${mapV(p.val)}`).join(' ')}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Parabola at s=0 */}
                  {showParabola && (
                    <path
                      d={parabolaPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapS(p.s)} ${mapV(p.val)}`).join(' ')}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      strokeDasharray="2 2"
                    />
                  )}

                  <circle cx={mapS(0)} cy={mapV(1)} r="5" fill="#e11d48" />
                </svg>

                <div className="absolute top-3 left-4 text-xs font-mono bg-white/90 dark:bg-slate-900/90 p-2 rounded-lg border border-slate-300 dark:border-slate-700">
                  <div>Độ dốc tiếp tuyến M'(0) = E[X] = {fmt(mean, 2)}</div>
                  <div>Độ cong M''(0) = E[X²] = {fmt(moment2, 2)}</div>
                  <div className="text-sky-600 font-bold">Phương sai Var(X) = {fmt(variance, 2)}</div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex justify-center gap-3">
                  <ClayButton
                    variant={dist === 'poisson' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => { setDist('poisson'); setParam(2.0); }}
                  >
                    Poisson (λ)
                  </ClayButton>
                  <ClayButton
                    variant={dist === 'exponential' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => { setDist('exponential'); setParam(1.5); }}
                  >
                    Exponential (λ)
                  </ClayButton>
                  <ClayButton
                    variant={dist === 'normal' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => { setDist('normal'); setParam(0.0); }}
                  >
                    Normal (μ, σ=1)
                  </ClayButton>
                </div>

                <ClaySlider
                  label={dist === 'normal' ? 'Kỳ vọng μ' : 'Tham số λ'}
                  sublabel="Kéo để quan sát tiếp tuyến quay"
                  value={param}
                  min={dist === 'normal' ? -2 : 0.5}
                  max={dist === 'normal' ? 2 : 4}
                  step={0.1}
                  color="blue"
                  onChange={setParam}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MGF PRODUCT (ALGEBRAIC CONVOLUTION)
         ========================================================================= */}
      {activeTab === 'product' && (
        <div className="space-y-6">
          <LabBriefing
            question="Khi cộng hai biến ngẫu nhiên độc lập Z = X + Y, tích phân tích chập rất khó tính. Tại sao MGF lại biến bài toán tích chập thành phép nhân đại số đơn giản?"
            formula="M_{X+Y}(s) = \mathbb{E}[e^{s(X+Y)}] = \mathbb{E}[e^{sX} \cdot e^{sY}] = \mathbb{E}[e^{sX}] \cdot \mathbb{E}[e^{sY}] = M_X(s) \cdot M_Y(s)"
            mathExplanation="Do X và Y độc lập, kỳ vọng của tích bằng tích các kỳ vọng! Khi nhân 2 hàm MGF với nhau, các số mũ cộng lại. Nhìn vào dạng hàm MGF kết quả, ta nhận dạng được ngay phân phối của tổng mà không cần giải bất kỳ một tích phân nào!"
            howToInteract={[
              "Chọn kịch bản: Tổng 2 biến Poisson hoặc Tổng 2 biến Normal.",
              "Kéo slider tham số của X và Y.",
              "Xem công thức đại số M_Z(s) tự động suy luận ra phân phối đích."
            ]}
            whatToObserve="Nếu X ~ Poisson(λ₁) và Y ~ Poisson(λ₂), thì M_X(s) M_Y(s) = e^{λ₁(e^s - 1)} e^{λ₂(e^s - 1)} = e^{(λ₁ + λ₂)(e^s - 1)}. Đây chính là MGF của phân phối Poisson(λ₁ + λ₂)! Tính chất ổn định này giải thích vì sao cộng nhiều biến Poisson vẫn ra Poisson!"
            takeaway="MGF là 'biến đổi Fourier' của xác suất: Chuyển phép tích chập phức tạp ở miền không gian thành phép nhân đơn giản ở miền tần số s!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
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

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-3xl p-6 shadow-[3px_3px_0px_#0f172a] space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-sky-50 dark:bg-slate-800 rounded-2xl border border-sky-200 dark:border-sky-900">
                    <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">Biến 1: X</span>
                    <div className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {sumDist === 'poisson' ? `P(${param1})` : `N(${param1}, 1)`}
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-xl font-black text-slate-400">
                    ×
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-900">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">Biến 2: Y</span>
                    <div className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {sumDist === 'poisson' ? `P(${param2})` : `N(${param2}, 1)`}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-slate-800/80 rounded-2xl border-2 border-purple-300 dark:border-purple-800 text-center">
                  <span className="text-xs font-heading font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    Kết quả Tổng Z = X + Y (Nhờ định lý duy nhất MGF)
                  </span>
                  <div className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white mt-1">
                    {sumDist === 'poisson'
                      ? `Z tuân theo phân phối Poisson với λ_Z = ${fmt(param1 + param2, 1)}`
                      : `Z tuân theo phân phối Chuẩn với μ_Z = ${fmt(param1 + param2, 1)}, σ_Z² = 2.0`}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex justify-center gap-3">
                  <ClayButton
                    variant={sumDist === 'poisson' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSumDist('poisson')}
                  >
                    Tổng 2 biến Poisson
                  </ClayButton>
                  <ClayButton
                    variant={sumDist === 'normal' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSumDist('normal')}
                  >
                    Tổng 2 biến Gaussian
                  </ClayButton>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ClaySlider
                    label="Tham số biến X"
                    value={param1}
                    min={1}
                    max={5}
                    step={0.5}
                    color="blue"
                    onChange={setParam1}
                  />
                  <ClaySlider
                    label="Tham số biến Y"
                    value={param2}
                    min={1}
                    max={5}
                    step={0.5}
                    color="emerald"
                    onChange={setParam2}
                  />
                </div>
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TỔNG NGẪU NHIÊN CÁC BIẾN NGẪU NHIÊN & ĐỊNH LÝ WALD
         ========================================================================= */}
      {activeTab === 'wald' && (
        <div className="space-y-6">
          <LabBriefing
            question="Một ngân hàng có N khách hàng ghé thăm trong ngày (N ngẫu nhiên ~ Poisson). Mỗi khách rút một số tiền X_i ngẫu nhiên. Tổng số tiền rút trong ngày S = X₁ + X₂ + ... + X_N có kỳ vọng và phương sai tính như thế nào khi cả số phần tử N lẫn giá trị X_i đều ngẫu nhiên?"
            formula="\mathbb{E}[S] = \mathbb{E}[N]\mathbb{E}[X], \quad Var(S) = \mathbb{E}[N]Var(X) + (\mathbb{E}[X])^2 Var(N)"
            mathExplanation="Đây là đẳng thức Wald kinh điển! Phương sai của tổng ngẫu nhiên gồm 2 nguồn: Sự bấp bênh từ giá trị của từng khách hàng E[N]Var(X) CỘNG VỚI sự bấp bênh từ số lượng khách hàng ghé thăm (E[X])^2 Var(N)."
            howToInteract={[
              "Kéo slider 'Kỳ vọng số khách E[N]' và 'Kỳ vọng số tiền mỗi khách E[X]'.",
              "Bấm nút 'Chạy Mô Phỏng Monte Carlo 3,000 ngày' để xem kết quả thực nghiệm.",
              "So sánh số liệu thực nghiệm với công thức lý thuyết Wald."
            ]}
            whatToObserve="Sau 3,000 lần mô phỏng, trung bình thực tế E_emp và phương sai Var_emp hội tụ sát sàn sạt với giá trị tính từ công thức Wald!"
            takeaway="Trong bài thi: Cứ gặp bài toán 'Tổng số ngẫu nhiên các biến ngẫu nhiên độc lập cùng phân phối (i.i.d)' $\implies$ áp dụng ngay Định lý Wald!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Mô phỏng Monte Carlo Kiểm chứng Định lý Wald (Random Sum)"
              formula="\mathbb{E}[S] = \mathbb{E}[N]\mathbb{E}[X]"
              badge={`E[S] lý thuyết = ${fmt(waldTheoMean, 1)}`}
              onReset={() => { setLambdaN(5.0); setMuX(10.0); setWaldSamples([]); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-full max-w-2xl space-y-5">
                {/* Bảng so sánh Lý thuyết vs Thực nghiệm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-sky-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-900 dark:border-slate-700">
                    <span className="text-xs font-heading font-black text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                      Công thức Lý thuyết Wald
                    </span>
                    <div className="mt-2 space-y-1.5 text-xs font-mono">
                      <div>E[S] = E[N] · E[X] = <span className="font-bold text-sky-600 text-sm">{fmt(waldTheoMean, 1)}</span></div>
                      <div>Var(S) = <span className="font-bold text-sky-600 text-sm">{fmt(waldTheoVar, 1)}</span></div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-900 dark:border-slate-700">
                    <span className="text-xs font-heading font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                      Mô phỏng Thực nghiệm (3,000 ván)
                    </span>
                    <div className="mt-2 space-y-1.5 text-xs font-mono">
                      {waldSamples.length > 0 ? (
                        <>
                          <div>E_thực tế = <span className="font-bold text-emerald-600 text-sm">{fmt(waldEmpiricalMean, 1)}</span></div>
                          <div>Var_thực tế = <span className="font-bold text-emerald-600 text-sm">{fmt(waldEmpiricalVar, 1)}</span></div>
                        </>
                      ) : (
                        <div className="text-slate-400 italic">Bấm nút bên dưới để chạy mô phỏng</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nút kích hoạt mô phỏng */}
                <div className="text-center pt-2">
                  <ClayButton variant="primary" size="lg" onClick={runWaldSimulation}>
                    🎲 Chạy Mô Phỏng 3,000 Ván Ngẫu Nhiên
                  </ClayButton>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <ClaySlider
                  label="Số lượng khách bình quân E[N] (Poisson λ)"
                  value={lambdaN}
                  min={1}
                  max={15}
                  step={1}
                  color="blue"
                  onChange={setLambdaN}
                />
                <ClaySlider
                  label="Số tiền rút bình quân E[X] (Exp μ)"
                  value={muX}
                  min={5}
                  max={50}
                  step={5}
                  color="emerald"
                  onChange={setMuX}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
};
