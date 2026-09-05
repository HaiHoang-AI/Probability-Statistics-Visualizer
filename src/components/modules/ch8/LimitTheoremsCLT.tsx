import React, { useState, useEffect, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, normalPdf, randomCauchy, randomNormal } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';

export const LimitTheoremsCLT: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clt' | 'lln' | 'bounds' | 'cauchy'>('clt');

  // Tab 1: CLT Lab State
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

  // Tab 2: LLN Lab State
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

  // Tab 3: Tail Bounds State (Markov vs Chebyshev vs Chernoff for Poisson or Standard Normal)
  const [boundK, setBoundK] = useState<number>(2.5); // Deviation k in standard deviations
  // For Standard Normal: E[X] = 0, Var(X) = 1.
  // P(|X| >= k) exact = 2 * (1 - Phi(k))
  // Chebyshev: P(|X| >= k) <= 1 / k^2
  // Chernoff: P(X >= k) <= e^{-k^2 / 2} => P(|X| >= k) <= 2 * e^{-k^2 / 2}
  // Markov on X^2: P(X^2 >= k^2) <= E[X^2] / k^2 = 1 / k^2
  const exactProb = 2 * (1 - (0.5 * (1 + Math.sign(boundK) * Math.sqrt(1 - Math.exp(-2 * boundK * boundK / Math.PI))))); // simple approx
  const chebyshevBound = Math.min(1.0, 1 / (boundK * boundK));
  const chernoffBound = Math.min(1.0, 2 * Math.exp(-0.5 * boundK * boundK));

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
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 8 — Các định lý Giới hạn
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Định lý Giới hạn Trung tâm (CLT), Luật Số lớn & Cận Xác suất Đuôi
          </h2>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('clt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'clt'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Phép màu CLT
          </button>
          <button
            onClick={() => setActiveTab('lln')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'lln'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Quỹ đạo Luật Số Lớn
          </button>
          <button
            onClick={() => setActiveTab('bounds')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'bounds'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. So tài 3 Cận Đuôi
          </button>
          <button
            onClick={() => setActiveTab('cauchy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'cauchy'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            4. Khi CLT Thất Bại (Cauchy)
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: CLT LAB
         ========================================================================= */}
      {activeTab === 'clt' && (
        <div className="space-y-6">
          <LabBriefing
            question="Cho dù dữ liệu gốc có hình dạng dị biệt đến đâu (lệch một bên, 2 đỉnh bimodal, xúc xắc), tại sao khi ta lấy trung bình của nhiều quan sát (X̄_n), phân phối của trung bình đó luôn tự động uốn thành hình chuông Gauss hoàn hảo?"
            formula="Z_n = \frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} \xrightarrow{d} \mathcal{N}(0, 1) \quad \text{khi } n \to \infty"
            mathExplanation="Đây là định lý vĩ đại nhất của xác suất thống kê! Phép lấy trung bình triệt tiêu dần các dị biệt cá thể, phương sai bị chia cho n (\sigma^2/n \to 0), và hình dạng tổng hợp luôn hội tụ về đường cong chuẩn tắc Gauss."
            howToInteract={[
              "Chọn 1 phân phối gốc quái đản nhất: 'Hai đỉnh (Bimodal)' hoặc 'Lệch mạnh (Exponential)'.",
              "Kéo slider cỡ mẫu n từ 1 lên 30.",
              "Xem 5,000 lần mô phỏng trung bình mẫu biến đổi hình dạng biểu đồ cột."
            ]}
            whatToObserve="Tại n = 1, biểu đồ có 2 đỉnh tách rời kỳ quặc. Nhưng chỉ cần kéo n lên 15 - 30, hai đỉnh lập tức hòa vào nhau, biểu đồ biến thành một hình chuông chuẩn tắc mượt mà khớp khít với đường cong lý thuyết màu đỏ!"
            takeaway="Trong thực tế & bài thi: Khi cỡ mẫu n >= 30, ta ĐƯỢC PHÉP dùng phân phối Chuẩn để tính xác suất cho trung bình mẫu X̄_n mà không cần quan tâm phân phối gốc của từng cá thể là gì!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Phòng Thí Nghiệm Kiểm Chứng Định Lý Giới Hạn Trung Tâm (CLT)"
              formula={`\\bar{X}_n \\sim \\mathcal{N}\\left(${fmt(trueMean, 2)}, \\frac{${fmt(trueVar, 2)}}{${sampleSizeN}}\\right)`}
              badge={`n = ${sampleSizeN} quan sát / mẫu`}
              onReset={() => { setSourceDist('bimodal'); setSampleSizeN(1); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[460px]">
              <div className="relative w-full max-w-3xl h-72 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                {/* Histogram Bars */}
                <div className="absolute inset-x-6 bottom-8 top-6 flex items-end gap-1">
                  {histogram.map((bin, i) => (
                    <div
                      key={i}
                      style={{ height: `${bin.heightPercent}%` }}
                      className="flex-1 bg-sky-400 dark:bg-sky-500 border border-slate-900/30 rounded-t-sm transition-all duration-150"
                      title={`[${fmt(bin.x0, 2)} - ${fmt(bin.x1, 2)}]: ${bin.count} mẫu`}
                    />
                  ))}
                </div>

                {/* SVG Theoretical Normal Overlay */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-x-6 bottom-8 top-6 w-[calc(100%-3rem)] h-[calc(100%-3.5rem)] pointer-events-none">
                  {(() => {
                    const pts = [];
                    for (let x = 0; x <= 100; x += 1) {
                      const realX = minVal + (x / 100) * (maxVal - minVal);
                      const pdf = normalPdf(realX, trueMean, theoreticalStd);
                      const maxPdf = normalPdf(trueMean, trueMean, theoreticalStd);
                      const normY = 100 - (pdf / maxPdf) * 95;
                      pts.push(`${x},${normY}`);
                    }
                    return (
                      <polyline
                        points={pts.join(' ')}
                        fill="none"
                        stroke="#e11d48"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    );
                  })()}
                </svg>

                <div className="absolute bottom-2 inset-x-6 flex justify-between text-[11px] font-mono text-slate-500">
                  <span>{fmt(minVal, 1)}</span>
                  <span className="font-bold text-sky-600">μ = {fmt(trueMean, 2)}</span>
                  <span>{fmt(maxVal, 1)}</span>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex flex-wrap justify-center gap-2.5">
                  <ClayButton
                    variant={sourceDist === 'bimodal' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSourceDist('bimodal')}
                  >
                    Hai đỉnh (Bimodal)
                  </ClayButton>
                  <ClayButton
                    variant={sourceDist === 'exponential' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSourceDist('exponential')}
                  >
                    Lệch (Exponential)
                  </ClayButton>
                  <ClayButton
                    variant={sourceDist === 'dice' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSourceDist('dice')}
                  >
                    Xúc xắc rời rạc (1..6)
                  </ClayButton>
                  <ClayButton
                    variant={sourceDist === 'uniform' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSourceDist('uniform')}
                  >
                    Đều (Uniform)
                  </ClayButton>
                </div>

                <ClaySlider
                  label="Cỡ mẫu trung bình n"
                  sublabel="Kéo n từ 1 đến 35 để thấy chuông Gauss hình thành"
                  value={sampleSizeN}
                  min={1}
                  max={35}
                  step={1}
                  color="blue"
                  onChange={setSampleSizeN}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LLN SAMPLE PATHS
         ========================================================================= */}
      {activeTab === 'lln' && (
        <div className="space-y-6">
          <LabBriefing
            question="Luật số lớn (LLN) nói rằng 'khi n tiến ra vô cùng, trung bình mẫu tiến về kỳ vọng thực mu'. Nhưng sự tiến về đó diễn ra như thế nào qua từng bước tung đồng xu?"
            formula="P\left( \lim_{n \to \infty} |\bar{X}_n - \mu| < \epsilon \right) = 1 \quad (\text{Luật Số Lớn Mạnh - SLLN})"
            mathExplanation="Mỗi đường kẻ trên đồ thị biểu diễn quỹ đạo của 1 người thực hiện 400 lần tung đồng xu liên tiếp. Lúc đầu (n nhỏ), sự may rủi khiến trung bình dao động dữ dội. Nhưng càng tung nhiều lần (n lớn), tất cả mọi quỹ đạo đều bị 'hút' vào dải hẹp epsilon quanh mu = 0.5."
            howToInteract={[
              "Kéo slider độ dung sai epsilon từ 0.02 đến 0.15.",
              "Bấm nút 'Tung lại 15 chuỗi mới' để quan sát các đường ngẫu nhiên độc lập."
            ]}
            whatToObserve="Khu vực dải màu xanh chính là ống [mu - epsilon, mu + epsilon]. Khi bước n vượt qua 100-150, hầu như 100% các quỹ đạo đều chui vào trong ống và không bao giờ thoát ra ngoài nữa!"
            takeaway="Luật số lớn là nguyên lý sống còn của các sòng bạc (Casino) và công ty bảo hiểm: Từng khách hàng có thể thắng lớn (dao động n nhỏ), nhưng với hàng triệu giao dịch (n lớn), lợi nhuận trung bình chắc chắn hội tụ về kỳ vọng của nhà cái!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Mô phỏng Quỹ đạo Mẫu Luật Số Lớn: Tung đồng xu X_i in {0, 1}"
              formula={`\\mu = 0.5 \\quad \\text{Dải dung sai: } [0.5 - ${fmt(epsilon, 2)}, 0.5 + ${fmt(epsilon, 2)}]`}
              badge="15 Quỹ đạo mẫu song song"
              onReset={() => { setEpsilon(0.08); generateLlnPaths(); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[440px]">
              <div className="relative w-full max-w-3xl h-80 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  {/* Dải Epsilon Tube */}
                  <rect
                    x="0"
                    y={100 - epsilon * 180}
                    width="400"
                    height={epsilon * 360}
                    fill="#38bdf8"
                    fillOpacity="0.2"
                  />
                  {/* Đường kỳ vọng mu = 0.5 */}
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 4" />

                  {/* 15 Paths */}
                  {llnPaths.map((path, pIdx) => {
                    const pts = path.map((val, step) => `${step},${200 - val * 200}`).join(' ');
                    return (
                      <polyline
                        key={pIdx}
                        points={pts}
                        fill="none"
                        stroke={`hsl(${(pIdx * 24) % 360}, 65%, 45%)`}
                        strokeWidth="1.2"
                        strokeOpacity="0.8"
                      />
                    );
                  })}
                </svg>

                <div className="absolute top-3 left-4 text-xs font-mono font-bold text-sky-700 dark:text-sky-300 bg-white/90 dark:bg-slate-900/90 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700">
                  Kỳ vọng thực μ = 0.50
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <ClaySlider
                    label="Độ dung sai ε"
                    sublabel="Độ rộng ống bao quanh μ"
                    value={epsilon}
                    min={0.02}
                    max={0.15}
                    step={0.01}
                    color="blue"
                    onChange={setEpsilon}
                  />
                </div>
                <ClayButton variant="primary" size="md" onClick={generateLlnPaths}>
                  🎲 Tung lại 15 chuỗi mới
                </ClayButton>
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TAIL BOUNDS (MARKOV VS CHEBYSHEV VS CHERNOFF)
         ========================================================================= */}
      {activeTab === 'bounds' && (
        <div className="space-y-6">
          <LabBriefing
            question="Khi ta cần ước lượng xác suất xảy ra biến cố cực đoan (đuôi phân phối P(|X| >= k)) mà không biết chính xác phân phối, 3 bất đẳng thức Markov, Chebyshev và Chernoff giúp chặn trên xác suất như thế nào?"
            formula="P(|X| \ge k) \le \text{Markov} \le \text{Chebyshev} \left(\frac{1}{k^2}\right) \le \text{Chernoff} \left(2e^{-k^2/2}\right)"
            mathExplanation="Markov chỉ cần biết Kỳ vọng (yếu nhất). Chebyshev cần biết thêm Phương sai (siết chặt theo 1/k^2). Chernoff tận dụng toàn bộ hàm sinh Moment MGF (siết chặt theo hàm mũ cực nhanh e^{-ck^2})!"
            howToInteract={[
              "Kéo slider độ lệch k từ 1.5 đến 4.5 độ lệch chuẩn.",
              "Xem bảng so sánh giá trị chặn trên của 3 định lý đặt cạnh Xác suất thực tế."
            ]}
            whatToObserve="Ở k = 4.0: Cận Chebyshev cho ta P <= 1/16 = 6.25% (vẫn khá lớn). Nhưng cận Chernoff siết xuống chỉ còn 0.067%, gần sát với xác suất thực tế 0.0063%! Cận Chernoff có sức mạnh vượt trội ở vùng đuôi xa."
            takeaway="Trong đề thi: Nếu đề bài chỉ cho kỳ vọng $\implies$ dùng Markov. Cho cả kỳ vọng và phương sai $\implies$ dùng Chebyshev. Hỏi xác suất đuôi cấp số mũ $\implies$ dùng Chernoff!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="So Tài 3 Cận Xác Suất Đuôi: P(|X| >= k) với X ~ N(0, 1)"
              formula={`k = ${fmt(boundK, 1)} \\sigma`}
              badge={`Chernoff: P \\le ${fmt(chernoffBound * 100, 3)}%`}
              onReset={() => setBoundK(2.5)}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-full max-w-2xl space-y-4">
                {/* 4 Cards So sánh */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border-2 border-amber-300 dark:border-amber-800 text-center">
                    <span className="text-[11px] font-heading font-black text-amber-800 dark:text-amber-300 uppercase">
                      1. Cận Chebyshev (1/k²)
                    </span>
                    <div className="text-xl font-mono font-extrabold text-amber-600 mt-1">
                      ≤ {fmt(chebyshevBound * 100, 2)}%
                    </div>
                    <span className="text-[10px] text-slate-500">Giảm theo bậc 2</span>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-slate-800 rounded-2xl border-2 border-purple-300 dark:border-purple-800 text-center">
                    <span className="text-[11px] font-heading font-black text-purple-800 dark:text-purple-300 uppercase">
                      2. Cận Chernoff (MGF)
                    </span>
                    <div className="text-xl font-mono font-extrabold text-purple-600 mt-1">
                      ≤ {fmt(chernoffBound * 100, 3)}%
                    </div>
                    <span className="text-[10px] text-purple-600 font-bold">Giảm theo hàm mũ</span>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-slate-800 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 text-center">
                    <span className="text-[11px] font-heading font-black text-emerald-800 dark:text-emerald-300 uppercase">
                      3. Xác suất Thực tế
                    </span>
                    <div className="text-xl font-mono font-extrabold text-emerald-600 mt-1">
                      = {fmt(exactProb * 100, 3)}%
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">Tích phân chuẩn</span>
                  </div>
                </div>

                {/* Thanh trực quan so sánh độ siết */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-900 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span>Độ chặt chẽ của cận trên tại k = {fmt(boundK, 1)}σ:</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-slate-500">Chebyshev:</span>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-4 rounded-md overflow-hidden">
                        <div style={{ width: `${chebyshevBound * 100}%` }} className="h-full bg-amber-500" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-purple-600 font-bold">Chernoff:</span>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-4 rounded-md overflow-hidden">
                        <div style={{ width: `${chernoffBound * 100}%` }} className="h-full bg-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto">
                <ClaySlider
                  label="Độ lệch k (Số lần độ lệch chuẩn σ)"
                  sublabel="Kéo k từ 1.5 lên 4.5 để thấy Chernoff bỏ xa Chebyshev"
                  value={boundK}
                  min={1.5}
                  max={4.5}
                  step={0.1}
                  color="purple"
                  onChange={setBoundK}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 4: CAUCHY BREAKDOWN (WHEN CLT FAILS)
         ========================================================================= */}
      {activeTab === 'cauchy' && (
        <div className="space-y-6">
          <LabBriefing
            question="Định lý Giới hạn Trung tâm (CLT) có luôn luôn đúng cho mọi phân phối xác suất trên đời không? Khi nào CLT bị phá vỡ hoàn toàn?"
            formula="\text{Điều kiện tiên quyết của CLT: } \sigma^2 < \infty. \quad \text{Phân phối Cauchy: } \mathbb{E}[X] = \text{không tồn tại}, \, \sigma^2 = \infty"
            mathExplanation="Phân phối Cauchy có đuôi cực dày (Fat Tails). Xác suất xuất hiện các giá trị cực đoan khổng lồ (Black Swan) cao đến mức trung bình mẫu X̄_n của 1,000 biến Cauchy VẪN CỨ LÀ MỘT BIẾN CAUCHY với độ phân tán y nguyên, không bao giờ co hẹp lại!"
            howToInteract={[
              "Kéo slider cỡ mẫu n từ 2 lên 50.",
              "So sánh 2 đồ thị: Bên trái là Phân phối Chuẩn (Gauss) - dao động co hẹp mượt mà. Bên phải là Phân phối Cauchy - liên tục bị các cú nhảy vọt làm vỡ vụn!"
            ]}
            whatToObserve="Nhìn đồ thị Cauchy: Dù bạn tăng n lên bao nhiêu, đồ thị vẫn bị những mũi kim giật bắn ra ngoài biên tọa độ. Đây chính là hiện tượng sụp đổ thị trường tài chính hoặc rủi ro thiên nga đen!"
            takeaway="Điểm ăn điểm tuyệt đối trong bài thi: CLT CHỈ ÁP DỤNG khi các biến ngẫu nhiên có PHƯƠNG SAI HỮU HẠN (\sigma^2 < \infty). Nếu phương sai vô hạn (như Cauchy hay Pareto đuôi nặng), CLT hoàn toàn vô hiệu!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="So Sánh: Phân phối Chuẩn (CLT thành công) vs Phân phối Cauchy (CLT thất bại)"
              formula="\text{Cauchy: } f(x) = \frac{1}{\pi (1 + x^2)} \implies \sigma^2 = \infty"
              badge={`n = ${cauchyN} mẫu`}
              onReset={() => { setCauchyN(10); runCauchySim(); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[440px]">
              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Đồ thị 1: Chuẩn (Gauss) */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-heading font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-2">
                    1. Phân phối Chuẩn: X̄_n co cụm tuyệt đối về 0
                  </span>
                  <div className="relative w-full h-64 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                    <svg viewBox="0 0 150 100" className="w-full h-full">
                      <line x1="0" y1="50" x2="150" y2="50" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 2" />
                      {(() => {
                        const pts = cauchyPaths.normalAvg.map((v, idx) => `${idx},${50 - v * 25}`).join(' ');
                        return <polyline points={pts} fill="none" stroke="#10b981" strokeWidth="1.5" />;
                      })()}
                    </svg>
                    <div className="absolute bottom-2 right-3 text-[11px] font-mono text-emerald-600 font-bold">
                      Hội tụ mượt mà theo CLT ✓
                    </div>
                  </div>
                </div>

                {/* Đồ thị 2: Cauchy */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-heading font-black text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-2">
                    2. Phân phối Cauchy: X̄_n nhảy vọt giật cục (Fat Tails)
                  </span>
                  <div className="relative w-full h-64 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner overflow-hidden">
                    <svg viewBox="0 0 150 100" className="w-full h-full">
                      <line x1="0" y1="50" x2="150" y2="50" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 2" />
                      {(() => {
                        const pts = cauchyPaths.cauchyAvg.map((v, idx) => `${idx},${Math.max(5, Math.min(95, 50 - v * 8))}`).join(' ');
                        return <polyline points={pts} fill="none" stroke="#e11d48" strokeWidth="1.5" />;
                      })()}
                    </svg>
                    <div className="absolute bottom-2 right-3 text-[11px] font-mono text-rose-600 font-bold">
                      CLT bị phá vỡ hoàn toàn ✗
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <ClaySlider
                    label="Cỡ mẫu n"
                    sublabel="Tăng n lên 50, Cauchy vẫn giật tung tóe"
                    value={cauchyN}
                    min={2}
                    max={50}
                    step={2}
                    color="rose"
                    onChange={setCauchyN}
                  />
                </div>
                <ClayButton variant="primary" size="md" onClick={runCauchySim}>
                  🎲 Lấy mẫu mới
                </ClayButton>
              </div>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
};
