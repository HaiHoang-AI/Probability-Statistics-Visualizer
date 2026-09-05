import React, { useState, useEffect, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, randomNormal, standardNormalInv, studentTPdf, normalPdf } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';

interface IntervalData {
  id: number;
  sampleMean: number;
  lower: number;
  upper: number;
  covers: boolean;
}

export const ClassicalEstimation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ci' | 'student' | 'bessel' | 'mle'>('ci');

  // Tab 1: Confidence Interval Coverage State
  const [trueMu, setTrueMu] = useState<number>(50);
  const [trueSigma, setTrueSigma] = useState<number>(10);
  const [sampleSizeN, setSampleSizeN] = useState<number>(25);
  const [confLevel, setConfLevel] = useState<number>(0.95);
  const [intervals, setIntervals] = useState<IntervalData[]>([]);

  const generateIntervals = () => {
    const zCrit = standardNormalInv(1 - (1 - confLevel) / 2);
    const marginOfError = zCrit * (trueSigma / Math.sqrt(sampleSizeN));
    const newIntervals: IntervalData[] = [];

    for (let i = 0; i < 100; i++) {
      let sum = 0;
      for (let j = 0; j < sampleSizeN; j++) {
        sum += randomNormal(trueMu, trueSigma);
      }
      const xBar = sum / sampleSizeN;
      const lower = xBar - marginOfError;
      const upper = xBar + marginOfError;
      const covers = trueMu >= lower && trueMu <= upper;
      newIntervals.push({ id: i, sampleMean: xBar, lower, upper, covers });
    }
    setIntervals(newIntervals);
  };

  useEffect(() => {
    generateIntervals();
  }, [trueMu, trueSigma, sampleSizeN, confLevel]);

  const coveredCount = intervals.filter((it) => it.covers).length;
  const coveragePercent = intervals.length > 0 ? (coveredCount / intervals.length) * 100 : 0;

  // Tab 2: Student t vs Normal
  const [degFreedom, setDegFreedom] = useState<number>(3);

  // Tab 3: Bessel Correction State
  const [besselN, setBesselN] = useState<number>(4);
  const [besselSim, setBesselSim] = useState<{ meanN: number; meanNMinus1: number; trueVar: number }>({
    meanN: 0,
    meanNMinus1: 0,
    trueVar: 16,
  });

  const runBesselSimulation = () => {
    const trials = 2500;
    const trueStd = 4.0;
    const trueV = 16.0;
    let sumVarN = 0;
    let sumVarN1 = 0;

    for (let t = 0; t < trials; t++) {
      const sample: number[] = [];
      let sMean = 0;
      for (let i = 0; i < besselN; i++) {
        const val = randomNormal(0, trueStd);
        sample.push(val);
        sMean += val;
      }
      sMean /= besselN;

      let ss = 0;
      for (let i = 0; i < besselN; i++) {
        ss += (sample[i] - sMean) ** 2;
      }
      sumVarN += ss / besselN;
      sumVarN1 += ss / (besselN - 1);
    }
    setBesselSim({
      meanN: sumVarN / trials,
      meanNMinus1: sumVarN1 / trials,
      trueVar: trueV,
    });
  };

  useEffect(() => {
    runBesselSimulation();
  }, [besselN]);

  // Tab 4: MLE State
  const [mlePoints, setMlePoints] = useState<number[]>([2, 4, 5, 7, 8]);
  const mleMean = mlePoints.length > 0 ? mlePoints.reduce((a, b) => a + b, 0) / mlePoints.length : 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 10.1 — Ước lượng Thống kê Cổ điển
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Khoảng Tin Cậy (CI), Phân phối Student-t & Hiệu chỉnh Bessel
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('ci')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'ci'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. 100 Khoảng tin cậy
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Phân phối Student t
          </button>
          <button
            onClick={() => setActiveTab('bessel')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'bessel'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. Hiệu chỉnh Bessel (n-1)
          </button>
          <button
            onClick={() => setActiveTab('mle')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'mle'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            4. Ước lượng MLE
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: 100 CONFIDENCE INTERVALS
         ========================================================================= */}
      {activeTab === 'ci' && (
        <div className="space-y-6">
          <LabBriefing
            question="Độ tin cậy 95% có phải là 'xác suất để giá trị trung bình thực mu rơi vào khoảng là 95%' hay không? Tại sao giảng viên luôn trừ điểm nếu ta phát biểu như vậy?"
            formula="\bar{X} \pm Z_{\alpha/2} \frac{\sigma}{\sqrt{n}} \implies P\left( \bar{X} - 1.96\frac{\sigma}{\sqrt{n}} \le \mu \le \bar{X} + 1.96\frac{\sigma}{\sqrt{n}} \right) = 0.95"
            mathExplanation="Trong trường phái Tần suất (Frequentist), tham số thực mu là một HẰNG SỐ CỐ ĐỊNH (vạch dọc màu xanh ở giữa). Chính 100 cái khoảng màu xanh/đỏ mới là BIẾN ĐỘNG NGẪU NHIÊN theo từng mẫu! Khoảng nào tóm được mu thì màu xanh, khoảng nào trượt ra ngoài thì màu đỏ."
            howToInteract={[
              "Bấm nút 'Lấy lại 100 mẫu ngẫu nhiên' nhiều lần liên tiếp.",
              "Kéo slider 'Mức tin cậy' từ 80% lên 99%.",
              "Quan sát độ rộng của các thanh ngang co giãn và tỷ lệ bao phủ thực tế."
            ]}
            whatToObserve="Khi bạn chọn 95%, trung bình cứ 100 khoảng được tạo ra thì có khoảng 95 thanh màu xanh tóm được vạch mu, và khoảng 5 thanh màu đỏ bị trượt ra ngoài!"
            takeaway="Cách phát biểu chuẩn mực đi thi: 'Nếu lặp lại quá trình lấy mẫu nhiều lần độc lập trong cùng điều kiện, có 95% số khoảng được tạo ra sẽ bao trùm giá trị tham số thực mu'!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Mô phỏng 100 Khoảng Tin Cậy Đồng Thời: Đánh giá Tỷ lệ Bao phủ Thực tế"
              formula={`\\text{Bao phủ: } ${coveredCount}/100 \\quad (${fmt(coveragePercent, 1)}\\%)`}
              badge={`Mục tiêu: ${Math.round(confLevel * 100)}%`}
              onReset={() => { setConfLevel(0.95); setSampleSizeN(25); generateIntervals(); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[460px]">
              <div className="relative w-full max-w-3xl h-80 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner overflow-y-auto">
                <svg viewBox="20 0 60 100" className="w-full h-full" preserveAspectRatio="none">
                  {/* Đường tham số thực mu */}
                  <line x1={trueMu} y1="0" x2={trueMu} y2="100" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="1 1" />

                  {/* 100 Intervals */}
                  {intervals.map((it) => (
                    <g key={it.id}>
                      <line
                        x1={it.lower}
                        y1={it.id}
                        x2={it.upper}
                        y2={it.id}
                        stroke={it.covers ? '#10b981' : '#e11d48'}
                        strokeWidth="0.6"
                      />
                      <circle cx={it.sampleMean} cy={it.id} r="0.3" fill={it.covers ? '#059669' : '#dc2626'} />
                    </g>
                  ))}
                </svg>

                <div className="absolute top-3 right-4 text-xs font-mono bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700">
                  <div className="text-emerald-600 font-bold">Bao phủ đúng (Xanh): {coveredCount} khoảng</div>
                  <div className="text-rose-600 font-bold">Trượt ra ngoài (Đỏ): {100 - coveredCount} khoảng</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex justify-center gap-3">
                  <ClayButton variant="primary" size="md" onClick={generateIntervals}>
                    🎲 Lấy lại 100 mẫu ngẫu nhiên
                  </ClayButton>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ClaySlider
                    label="Mức tin cậy (1 - α)"
                    sublabel="Mức càng cao, khoảng càng dài"
                    value={confLevel}
                    min={0.80}
                    max={0.99}
                    step={0.01}
                    color="blue"
                    onChange={setConfLevel}
                  />
                  <ClaySlider
                    label="Cỡ mẫu n"
                    sublabel="n càng lớn, khoảng càng co ngắn lại"
                    value={sampleSizeN}
                    min={10}
                    max={100}
                    step={5}
                    color="emerald"
                    onChange={setSampleSizeN}
                  />
                </div>
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 2: STUDENT T VS NORMAL
         ========================================================================= */}
      {activeTab === 'student' && (
        <div className="space-y-6">
          <LabBriefing
            question="Khi nào bắt buộc phải dùng phân phối Student-t thay vì phân phối Chuẩn Gauss Z? Tại sao khi bậc tự do df tăng lên thì phân phối Student lại biến thành phân phối Chuẩn?"
            formula="T = \frac{\bar{X} - \mu}{S / \sqrt{n}} \sim t_{n-1} \quad (\text{khi } \sigma \text{ chưa biết})"
            mathExplanation="Khi phương sai tổng thể sigma chưa biết, ta phải thay bằng phương sai mẫu S. Do S cũng biến động ngẫu nhiên, sự bấp bênh tăng lên khiến đuôi phân phối bị dày ra (Heavier Tails). Bậc tự do df = n - 1."
            howToInteract={[
              "Kéo slider bậc tự do df từ 1 lên 30.",
              "Quan sát đường cong màu đỏ (Student-t) so với đường cong nét đứt màu xanh (Chuẩn tắc Z)."
            ]}
            whatToObserve="Khi df = 1..3, đỉnh Student thấp hơn và hai đuôi vểnh cao hơn nhiều so với Gauss (xác suất xảy ra giá trị ngoại lai cao hơn). Nhưng khi df >= 30, đường đỏ đè khít lên đường xanh!"
            takeaway="Quy tắc thi cử: Mẫu nhỏ (n < 30) VÀ chưa biết sigma $\implies$ bắt buộc dùng bảng tra t-Student với df = n - 1!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={`Phân phối Student-t (df = ${degFreedom}) so với Chuẩn Tắc N(0, 1)`}
              formula="t_{\nu} \to \mathcal{N}(0, 1) \quad \text{khi } \nu \to \infty"
              badge={`Bậc tự do df = ${degFreedom}`}
              onReset={() => setDegFreedom(3)}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="relative w-full max-w-2xl h-72 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                <svg viewBox="-4 0 8 0.5" className="w-full h-full" preserveAspectRatio="none">
                  {/* Trục */}
                  <line x1="-4" y1="0.48" x2="4" y2="0.48" stroke="#94a3b8" strokeWidth="0.005" />

                  {/* Standard Normal (Blue dashed) */}
                  {(() => {
                    const pts = [];
                    for (let x = -4; x <= 4; x += 0.1) {
                      const y = 0.48 - normalPdf(x, 0, 1);
                      pts.push(`${x},${y}`);
                    }
                    return <polyline points={pts.join(' ')} fill="none" stroke="#0284c7" strokeWidth="0.008" strokeDasharray="0.05 0.05" />;
                  })()}

                  {/* Student-t (Rose solid) */}
                  {(() => {
                    const pts = [];
                    for (let x = -4; x <= 4; x += 0.05) {
                      const y = 0.48 - studentTPdf(x, degFreedom);
                      pts.push(`${x},${y}`);
                    }
                    return <polyline points={pts.join(' ')} fill="none" stroke="#e11d48" strokeWidth="0.015" />;
                  })()}
                </svg>

                <div className="absolute top-3 right-4 text-xs font-mono bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 space-y-1">
                  <div className="text-sky-600 font-bold">Đường đứt nét xanh: Chuẩn tắc N(0, 1)</div>
                  <div className="text-rose-600 font-extrabold">Đường liền đỏ: Student-t (df = {degFreedom})</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto">
                <ClaySlider
                  label="Bậc tự do (Degrees of Freedom df = n - 1)"
                  sublabel="Kéo từ 1 lên 35 để thấy Student-t hội tụ hoàn toàn về Normal"
                  value={degFreedom}
                  min={1}
                  max={35}
                  step={1}
                  color="rose"
                  onChange={setDegFreedom}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BESSEL CORRECTION (n - 1 vs n)
         ========================================================================= */}
      {activeTab === 'bessel' && (
        <div className="space-y-6">
          <LabBriefing
            question="Tại sao công thức phương sai mẫu trong sách giáo trình đại học lại chia cho (n - 1) thay vì chia cho n? Hiệu chỉnh Bessel giải quyết vấn đề gì?"
            formula="\mathbb{E}\left[\frac{1}{n}\sum_{i=1}^n (X_i - \bar{X})^2\right] = \frac{n-1}{n}\sigma^2 \quad \implies \quad S^2 = \frac{1}{n-1}\sum_{i=1}^n (X_i - \bar{X})^2 \text{ là ước lượng KHÔNG CHỆCH}"
            mathExplanation="Khi ta dùng trung bình mẫu X̄ thay cho kỳ vọng thực mu, các điểm dữ liệu luôn gần X̄ hơn là gần mu (vì X̄ nằm ngay tâm của mẫu). Do đó, khoảng cách bình phương (X_i - X̄)^2 luôn bị bé hơn thực tế! Để bù lại độ hụt này, ta phải giảm mẫu số từ n xuống (n - 1)."
            howToInteract={[
              "Chọn cỡ mẫu nhỏ n = 2, 3, 4, hoặc 6.",
              "Bấm nút 'Chạy lại 2,500 mẫu mô phỏng'.",
              "So sánh trung bình thực nghiệm của công thức chia n so với công thức chia (n - 1)."
            ]}
            whatToObserve="Với n = 4 và phương sai thực = 16: Công thức chia cho n chỉ ước lượng ra khoảng 12 (bị hụt đúng 1/4 = 25%). Trong khi công thức chia (n - 1) ước lượng ra đúng 16.0!"
            takeaway="Bản chất của chia (n - 1): Mất 1 bậc tự do để ước lượng trung bình mẫu X̄. Muốn ước lượng không chệch (Unbiased) cho phương sai tổng thể, BẮT BUỘC phải chia cho (n - 1)!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Bí Ẩn Hiệu Chỉnh Bessel: Tại sao phương sai mẫu chia cho (n - 1)?"
              formula={`\\text{Phương sai thực } \\sigma^2 = ${besselSim.trueVar}`}
              badge={`n = ${besselN} quan sát`}
              onReset={() => { setBesselN(4); runBesselSimulation(); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-full max-w-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card chia n (Có chệch) */}
                  <div className="p-5 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border-2 border-rose-300 dark:border-rose-800 text-center space-y-1">
                    <span className="text-xs font-heading font-black text-rose-700 dark:text-rose-300 uppercase">
                      1. Chia cho n (Ước lượng có chệch)
                    </span>
                    <div className="text-3xl font-mono font-extrabold text-rose-600 mt-1">
                      {fmt(besselSim.meanN, 2)}
                    </div>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold">
                      Bị ước lượng non hụt đi {fmt((1 - (besselN - 1) / besselN) * 100, 1)}%!
                    </p>
                  </div>

                  {/* Card chia n - 1 (Không chệch) */}
                  <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 text-center space-y-1">
                    <span className="text-xs font-heading font-black text-emerald-700 dark:text-emerald-300 uppercase">
                      2. Chia cho (n - 1) (Hiệu chỉnh Bessel)
                    </span>
                    <div className="text-3xl font-mono font-extrabold text-emerald-600 mt-1">
                      {fmt(besselSim.meanNMinus1, 2)}
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                      Trùng khớp hoàn hảo với σ² thực = 16.0!
                    </p>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <ClayButton variant="primary" size="md" onClick={runBesselSimulation}>
                    🎲 Chạy lại 2,500 mẫu ngẫu nhiên
                  </ClayButton>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto">
                <ClaySlider
                  label="Cỡ mẫu nhỏ n"
                  sublabel="Càng nhỏ, độ chệch của công thức chia n càng lộ rõ"
                  value={besselN}
                  min={2}
                  max={10}
                  step={1}
                  color="blue"
                  onChange={setBesselN}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 4: MLE (MAXIMUM LIKELIHOOD ESTIMATION)
         ========================================================================= */}
      {activeTab === 'mle' && (
        <div className="space-y-6">
          <LabBriefing
            question="Ước lượng Hợp lý Cực đại (MLE) hoạt động theo nguyên lý nào? Làm sao tìm ra tham số mu khiến cho tập dữ liệu quan sát được có xác suất xuất hiện cao nhất?"
            formula="L(\mu) = \prod_{i=1}^n f(x_i; \mu) \implies \hat{\mu}_{MLE} = \arg\max \ln L(\mu) = \bar{X}"
            mathExplanation="Hàm hợp lý L(mu) đo xem nếu giả định kỳ vọng là mu thì xác suất xảy ra toàn bộ mẫu quan sát x_1..x_n là bao nhiêu. Đỉnh cao nhất của đường cong L(mu) chính là nghiệm ước lượng hợp lý cực đại MLE!"
            howToInteract={[
              "Bấm trực tiếp vào khung đồ thị để thêm/bớt điểm dữ liệu.",
              "Quan sát đường cong Log-Likelihood tự động đạt cực đại tại vị trí trung bình mẫu X̄."
            ]}
            whatToObserve="Dù dữ liệu nằm rải rác ở đâu, đỉnh của hàm hợp lý Gauss luôn luôn nằm chính xác tại điểm trung bình mẫu X̄!"
            takeaway="MLE là phương pháp ước lượng chuẩn mực nhất của thống kê hiện đại và machine learning!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Mô phỏng Ước Lượng Hợp Lý Cực Đại (MLE Gaussian)"
              formula={`\\hat{\\mu}_{MLE} = \\bar{X} = ${fmt(mleMean, 2)}`}
              badge={`${mlePoints.length} điểm mẫu`}
              onReset={() => setMlePoints([2, 4, 5, 7, 8])}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-full max-w-2xl space-y-4">
                <div className="text-center">
                  <span className="text-xs font-heading font-black text-sky-600 uppercase tracking-wider">
                    Giá trị Ước lượng Cực đại Hợp lý (MLE)
                  </span>
                  <div className="text-3xl font-heading font-black text-slate-900 dark:text-white mt-1">
                    μ_MLE = {fmt(mleMean, 2)}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-900 dark:border-slate-700">
                  <div className="text-xs font-mono font-bold mb-2">Các điểm dữ liệu quan sát:</div>
                  <div className="flex flex-wrap gap-2">
                    {mlePoints.map((pt, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold">
                        x_{i + 1} = {pt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto flex justify-center gap-3">
                <ClayButton
                  variant="primary"
                  size="md"
                  onClick={() => setMlePoints([...mlePoints, Math.round(Math.random() * 10)])}
                >
                  ➕ Thêm điểm ngẫu nhiên
                </ClayButton>
                <ClayButton
                  variant="outline"
                  size="md"
                  onClick={() => setMlePoints(mlePoints.slice(0, -1))}
                  disabled={mlePoints.length <= 2}
                >
                  ➖ Bớt điểm
                </ClayButton>
              </div>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
};
