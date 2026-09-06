import React, { useState, useEffect, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, normalPdf, standardNormalInv, studentTPdf, randomNormal } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';

interface IntervalItem {
  id: number;
  mean: number;
  lower: number;
  upper: number;
  covers: boolean;
}

export const ClassicalEstimation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ci' | 'student' | 'bessel' | 'mle'>('ci');

  // Tab 1: 100 Confidence Intervals State (Original Lab)
  const [confLevel, setConfLevel] = useState<number>(0.95);
  const [sampleSizeN, setSampleSizeN] = useState<number>(25);
  const [intervals, setIntervals] = useState<IntervalItem[]>([]);
  const trueMu = 50.0;
  const trueSigma = 10.0;

  const generateIntervals = () => {
    const alpha = 1 - confLevel;
    const zCrit = standardNormalInv(1 - alpha / 2);
    const se = trueSigma / Math.sqrt(sampleSizeN);
    const margin = zCrit * se;

    const list: IntervalItem[] = [];
    for (let i = 0; i < 100; i++) {
      let sum = 0;
      for (let s = 0; s < sampleSizeN; s++) {
        sum += randomNormal(trueMu, trueSigma);
      }
      const m = sum / sampleSizeN;
      const lower = m - margin;
      const upper = m + margin;
      const covers = lower <= trueMu && trueMu <= upper;
      list.push({ id: i + 1, mean: m, lower, upper, covers });
    }
    setIntervals(list);
  };

  useEffect(() => {
    generateIntervals();
  }, [confLevel, sampleSizeN]);

  const coveredCount = intervals.filter((it) => it.covers).length;
  const coveragePercent = coveredCount;

  // Tab 2: Student t vs Normal State (Original Lab)
  const [dfNu, setDfNu] = useState<number>(4);

  // Tab 3: Bessel's Correction State
  const [besselSampleSize, setBesselSampleSize] = useState<number>(5);
  const [besselRuns, setBesselRuns] = useState<{ biasedVar: number; unbiasedVar: number } | null>(null);

  const runBesselMonteCarlo = () => {
    const K = 2500;
    const popSigma2 = 4.0;
    let sumBiased = 0;
    let sumUnbiased = 0;

    for (let k = 0; k < K; k++) {
      const sample = [];
      for (let i = 0; i < besselSampleSize; i++) {
        sample.push(randomNormal(0, 2.0));
      }
      const m = sample.reduce((a, b) => a + b, 0) / besselSampleSize;
      let ss = 0;
      for (const x of sample) {
        ss += (x - m) ** 2;
      }
      sumBiased += ss / besselSampleSize;
      sumUnbiased += ss / (besselSampleSize - 1);
    }

    setBesselRuns({
      biasedVar: sumBiased / K,
      unbiasedVar: sumUnbiased / K,
    });
  };

  useEffect(() => {
    runBesselMonteCarlo();
  }, [besselSampleSize]);

  // Tab 4: MLE Curve State (Original Lab)
  const [mlePoints, setMlePoints] = useState<number[]>([2.0, 3.5, 4.2, 5.8, 6.5]);
  const mleMean = mlePoints.length > 0 ? mlePoints.reduce((a, b) => a + b, 0) / mlePoints.length : 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 10.1 — Ước lượng thống kê cổ điển
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Khoảng Tin cậy, Phân bố Student t, Hiệu chỉnh Bessel & Cực đại Hợp lý (MLE)
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('ci')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'ci'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. 100 Khoảng tin cậy
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Phân bố Student t
          </button>
          <button
            onClick={() => setActiveTab('bessel')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'bessel'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. Bí ẩn Bessel (n-1 vs n)
          </button>
          <button
            onClick={() => setActiveTab('mle')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              activeTab === 'mle'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            4. Đường cong MLE
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: 100 CONFIDENCE INTERVALS (ORIGINAL LAB - DIRECTLY ON DESMOS GRID)
         ========================================================================= */}
      {activeTab === 'ci' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Mức Tin Cậy (1 - α)
              </h4>
              <ClaySlider
                label="Độ tin cậy"
                value={confLevel}
                min={0.8}
                max={0.99}
                step={0.01}
                color="blue"
                formatValue={(v) => `${Math.round(v * 100)}%`}
                onChange={setConfLevel}
              />
              <div className="mt-3 flex gap-2">
                {[0.8, 0.9, 0.95, 0.99].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setConfLevel(lvl)}
                    className="flex-1 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                  >
                    {Math.round(lvl * 100)}%
                  </button>
                ))}
              </div>
            </ClayCard>

            <ClayCard glowColor="emerald" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Cỡ Mẫu n Lấy Thử
              </h4>
              <ClaySlider
                label="Số quan sát n"
                sublabel="Càng lớn thì khoảng càng hẹp"
                value={sampleSizeN}
                min={5}
                max={100}
                step={5}
                color="emerald"
                onChange={setSampleSizeN}
              />
              <div className="mt-4 text-center">
                <ClayButton variant="primary" size="md" onClick={generateIntervals} className="w-full text-xs">
                  Lấy Lại 100 Mẫu Ngẫu Nhiên
                </ClayButton>
              </div>
            </ClayCard>

            <ClayCard glowColor="amber" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Bản chất Tần Suất
              </h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                Tham số <MathView math="\mu" /> là cố định và duy nhất. Khoảng tin cậy là ngẫu nhiên, thay đổi theo từng mẫu. Phát biểu đúng: Có 95% số khoảng sinh ra sẽ bao trùm giá trị thực <MathView math="\mu" />.
              </p>
            </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <DesmosStageHeader
              title="100 Khoảng Tin Cậy Xếp Chồng Độc Lập"
              formula="CI = \left[\bar{X} - z_{\alpha/2}\frac{\sigma}{\sqrt{n}}, \bar{X} + z_{\alpha/2}\frac{\sigma}{\sqrt{n}}\right]"
              badge={`Độ phủ: ${coveragePercent}%`}
              onReset={generateIntervals}
              extraActions={
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold border border-emerald-300">
                    Trúng: {coveredCount}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono font-bold border border-rose-300">
                    Trượt: {100 - coveredCount}
                  </span>
                </div>
              }
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                {/* Vertical grid lines */}
                {[35, 40, 45, 50, 55, 60, 65].map((val) => {
                  const px = 400 + (val - 50) * 14;
                  return (
                    <g key={`ci-grid-${val}`}>
                      <line x1={px} y1="20" x2={px} y2="330" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />
                      <text x={px} y="348" textAnchor="middle" className="text-[11px] font-mono font-bold fill-slate-500">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical line for true mu (center) */}
                <line x1="400" y1="15" x2="400" y2="330" stroke="#0284C7" strokeWidth="3" strokeDasharray="6 3" />
                <text x="400" y="12" fill="#0284C7" fontSize="11" textAnchor="middle" fontWeight="black" className="font-mono">
                  Tham số thực μ = {trueMu} (Cố định)
                </text>

                {/* 100 Intervals sitting directly on the grid */}
                {intervals.map((it, idx) => {
                  const y = 25 + idx * 3.0;
                  const x1 = 400 + (it.lower - trueMu) * 14;
                  const x2 = 400 + (it.upper - trueMu) * 14;
                  const strokeColor = it.covers ? '#10B981' : '#EF4444';

                  return (
                    <g key={it.id}>
                      <line x1={x1} y1={y} x2={x2} y2={y} stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
                      {!it.covers && (
                        <circle cx={(x1 + x2) / 2} cy={y} r="2.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.8" />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-4 h-1 bg-emerald-500 rounded-full"></span> Xanh lá: Chứa tham số μ ({coveredCount})
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                    <span className="w-4 h-1 bg-rose-500 rounded-full"></span> Đỏ: Trượt khỏi tham số μ ({100 - coveredCount})
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-0.5 bg-sky-600 border-dashed"></span> Vạch chuẩn μ = {trueMu}
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tỷ lệ độ phủ: {coveragePercent}% (Mục tiêu: {Math.round(confLevel * 100)}%)
                </div>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Độ tin cậy 95% có phải là 'xác suất để giá trị trung bình thực $\mu$ rơi vào khoảng là 95%' hay không? Tại sao giảng viên luôn trừ điểm nếu ta phát biểu như vậy?"
            formula="\bar{X} \pm Z_{\alpha/2} \frac{\sigma}{\sqrt{n}} \implies P\left( \bar{X} - 1.96\frac{\sigma}{\sqrt{n}} \le \mu \le \bar{X} + 1.96\frac{\sigma}{\sqrt{n}} \right) = 0.95"
            mathExplanation="Trong trường phái Tần suất (Frequentist), tham số thực $\mu$ là một HẰNG SỐ CỐ ĐỊNH (vạch dọc màu xanh ở giữa). Chính 100 cái khoảng màu xanh/đỏ mới là BIẾN ĐỘNG NGẪU NHIÊN theo từng mẫu! Khoảng nào tóm được $\mu$ thì màu xanh, khoảng nào trượt ra ngoài thì màu đỏ."
            howToInteract={[
              "Bấm nút 'Lấy lại 100 mẫu ngẫu nhiên' nhiều lần liên tiếp.",
              "Kéo slider 'Mức tin cậy' từ 80% lên 99%.",
              "Quan sát độ rộng của các thanh ngang co giãn và tỷ lệ bao phủ thực tế."
            ]}
            whatToObserve="Khi bạn chọn 95%, trung bình cứ 100 khoảng được tạo ra thì có khoảng 95 thanh màu xanh tóm được vạch $\mu$, và khoảng 5 thanh màu đỏ bị trượt ra ngoài!"
            takeaway="Cách phát biểu chuẩn mực đi thi: 'Nếu lặp lại quá trình lấy mẫu nhiều lần độc lập trong cùng điều kiện, có 95% số khoảng được tạo ra sẽ bao trùm giá trị tham số thực $\mu$'!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 2: STUDENT T VS NORMAL (ORIGINAL LAB - DIRECTLY ON DESMOS GRID)
         ========================================================================= */}
      {activeTab === 'student' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="purple" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Bậc Tự Do (df)
                </h4>
                <ClaySlider
                  label="Bậc tự do nu (Degrees of Freedom = n - 1)"
                  value={dfNu}
                  min={1}
                  max={35}
                  step={1}
                  color="purple"
                  onChange={setDfNu}
                />
                <div className="mt-3 flex gap-2">
                  {[1, 5, 15, 30].map((quickNu) => (
                    <button
                      key={quickNu}
                      onClick={() => setDfNu(quickNu)}
                      className="flex-1 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                    >
                      nu={quickNu}
                    </button>
                  ))}
                </div>
              </ClayCard>

              <ClayCard glowColor="blue" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Bản Chất Student t
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  Khi chưa biết phương sai tổng thể, ta dùng độ lệch chuẩn mẫu S khiến phân phối có <strong>đuôi dày hơn</strong> để bù đắp bất định.
                </p>
                <div className="mt-3 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center font-mono font-bold text-purple-700 dark:text-purple-300 text-sm">
                  <MathView math="T = \frac{\bar{X} - \mu}{S/\sqrt{n}} \sim t(\nu = n - 1)" />
                </div>
              </ClayCard>

              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Hội Tụ Tiệm Cận
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Bậc tự do nu:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{dfNu}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Cỡ mẫu tương ứng:</span>
                    <span className="font-mono font-extrabold text-purple-600 dark:text-purple-400 text-sm">n = {dfNu + 1}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Trạng thái:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {dfNu >= 30 ? 'Trùng khít Gauss N(0,1)' : 'Đuôi dày (Bất định cao)'}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <DesmosStageHeader
              title="So Sánh Phân Bố Student t vs Chuẩn Chuẩn Hóa Gauss"
              formula="t(\nu) \xrightarrow{\nu \to \infty} \mathcal{N}(0, 1)"
              badge={`Bậc tự do ν = ${dfNu}`}
              onReset={() => setDfNu(4)}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                <line x1="60" y1="300" x2="740" y2="300" stroke="#0F172A" strokeWidth="2" />
                {[-3, -2, -1, 0, 1, 2, 3].map((t) => (
                  <g key={`t-tick-${t}`}>
                    <line x1={400 + t * 90} y1="300" x2={400 + t * 90} y2="306" stroke="#0F172A" strokeWidth="1.5" />
                    <text x={400 + t * 90} y="324" textAnchor="middle" className="text-xs font-mono font-bold fill-slate-600">
                      {t}
                    </text>
                  </g>
                ))}

                {/* Normal Gauss (Blue dashed) */}
                {(() => {
                  const pts = [];
                  for (let x = -3.8; x <= 3.8; x += 0.1) {
                    const px = 400 + x * 90;
                    const py = 300 - normalPdf(x, 0, 1) * 600;
                    pts.push(`${px},${py}`);
                  }
                  return (
                    <path d={`M ${pts.join(' L ')}`} fill="none" stroke="#0284C7" strokeWidth="2.5" strokeDasharray="6 3" />
                  );
                })()}

                {/* Student t Curve (Purple solid) */}
                {(() => {
                  const pts = [];
                  for (let x = -3.8; x <= 3.8; x += 0.1) {
                    const px = 400 + x * 90;
                    const py = 300 - studentTPdf(x, dfNu) * 600;
                    pts.push(`${px},${py}`);
                  }
                  return (
                    <path d={`M ${pts.join(' L ')}`} fill="none" stroke="#8B5CF6" strokeWidth="3.5" strokeLinecap="round" />
                  );
                })()}
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-0.5 bg-sky-500 border-dashed"></span> Chuẩn N(0, 1) cố định
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                    <span className="w-5 h-1 bg-purple-600 rounded-full"></span> Student t(ν = {dfNu})
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  {dfNu >= 30 ? 'ν ≥ 30: Student t trùng khít Gauss!' : 'Đuôi Student dày hơn (Bất định cao)'}
                </div>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Khi cỡ mẫu $n$ nhỏ (ví dụ $n < 30$) và chưa biết phương sai tổng thể $\sigma^2$, tại sao bắt buộc phải dùng phân phối Student $t$ thay cho phân phối Chuẩn Gauss?"
            formula="T = \frac{\bar{X} - \mu}{S / \sqrt{n}} \sim t(\nu = n - 1), \quad t(\nu) \xrightarrow{\nu \to \infty} \mathcal{N}(0, 1)"
            mathExplanation="Khi thay độ lệch chuẩn lý thuyết $\sigma$ bằng độ lệch chuẩn mẫu $S$, ta đưa thêm một nguồn bất định ngẫu nhiên mới vào mẫu số. Điều này làm cho phân phối của $T$ có ĐUÔI DÀY HƠN phân phối chuẩn Gauss để bù đắp rủi ro của việc ước lượng non."
            howToInteract={[
              "Kéo slider 'Bậc tự do $\\nu$' từ 1 đến 35.",
              "Quan sát đuôi của phân phối Student $t$ (màu tím) dày hơn nhiều so với phân phối Chuẩn Gauss (màu xanh dương).",
              "Khi kéo $\\nu \\ge 30$: Quan sát đường Student xẹp dần và trùng khít hoàn hảo với đường Gauss!"
            ]}
            whatToObserve="Tại $\nu = 1$ (Phân phối Cauchy), đuôi cực dày. Tại $\nu = 30$, sự khác biệt giữa Student và Gauss gần như bằng 0, giải thích vì sao quy tắc ngón tay cái thường chọn mốc $n = 30$!"
            takeaway="Trong bài thi: Nếu không cho $\sigma$ mà chỉ cho độ lệch chuẩn mẫu $s$, cỡ mẫu $n < 30 \implies$ BẮT BUỘC dùng bảng Student $t$ với bậc tự do $\nu = n - 1$!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 3: BÍ ẨN BESSEL (n-1 vs n) - TRÊN Ô GRID TRỰC TIẾP
         ========================================================================= */}
      {activeTab === 'bessel' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="blue" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Cỡ Mẫu Khảo Sát
                </h4>
                <ClaySlider
                  label="Cỡ mẫu nhỏ n"
                  sublabel="Khi n nhỏ, hiệu ứng chệch thể hiện rõ nhất"
                  value={besselSampleSize}
                  min={2}
                  max={15}
                  step={1}
                  color="blue"
                  onChange={setBesselSampleSize}
                />
                <div className="mt-3">
                  <ClayButton variant="primary" size="md" className="w-full text-xs font-bold" onClick={runBesselMonteCarlo}>
                    Lấy Lại 2,500 Lần Mẫu
                  </ClayButton>
                </div>
              </ClayCard>

              <ClayCard glowColor="amber" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Bí Ẩn Hiệu Chỉnh Bessel
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  Nếu chia cho n, kỳ vọng phương sai mẫu luôn <strong>ước lượng non</strong>:
                </p>
                <div className="mt-2.5 space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 font-bold text-red-700 dark:text-red-300">
                    <MathView math="\mathbb{E}[S^2_n] = \frac{n-1}{n}\sigma^2 < \sigma^2 \quad (\text{Bị chệch})" />
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 font-bold text-emerald-700 dark:text-emerald-300">
                    <MathView math="\mathbb{E}[S^2_{n-1}] = \sigma^2 \quad (\text{Không chệch})" />
                  </div>
                </div>
              </ClayCard>

              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Kết Quả Monte Carlo
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">sigma^2 chân lý:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">4.00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Không chệch (n - 1):</span>
                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {besselRuns ? fmt(besselRuns.unbiasedVar, 2) : '...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Có chệch (n):</span>
                    <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                      {besselRuns ? fmt(besselRuns.biasedVar, 2) : '...'}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <DesmosStageHeader
              title="Mô phỏng Monte Carlo 2,500 Lần: Kiểm chứng Độ Chệch Hiệu Chỉnh Bessel"
              formula="\mathbb{E}[S^2_{n-1}] = \sigma^2 \quad \text{vs} \quad \mathbb{E}[S^2_n] = \frac{n-1}{n}\sigma^2"
              badge={`n = ${besselSampleSize} quan sát`}
              onReset={() => { setBesselSampleSize(5); runBesselMonteCarlo(); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                <line x1="80" y1="300" x2="720" y2="300" stroke="#0F172A" strokeWidth="2.5" />

                {/* True Variance line: sigma^2 = 4.0 */}
                <line x1="80" y1="120" x2="720" y2="120" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="6 4" />
                <text x="725" y="124" fill="#EF4444" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  σ² thực = 4.00
                </text>

                {/* Column 1: Biased (divide by n) */}
                {besselRuns && (
                  <g>
                    <rect
                      x="220"
                      y={300 - (besselRuns.biasedVar / 4.0) * 180}
                      width="120"
                      height={(besselRuns.biasedVar / 4.0) * 180}
                      fill="#F43F5E"
                      stroke="#BE123C"
                      strokeWidth="2"
                      rx="6"
                    />
                    <text x="280" y="325" fill="#F43F5E" fontSize="12" fontWeight="bold" textAnchor="middle">
                      Chia cho n (Có chệch)
                    </text>
                    <text
                      x="280"
                      y={290 - (besselRuns.biasedVar / 4.0) * 180}
                      fill="#F43F5E"
                      fontSize="13"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {fmt(besselRuns.biasedVar, 2)}
                    </text>
                  </g>
                )}

                {/* Column 2: Unbiased (divide by n-1) */}
                {besselRuns && (
                  <g>
                    <rect
                      x="460"
                      y={300 - (besselRuns.unbiasedVar / 4.0) * 180}
                      width="120"
                      height={(besselRuns.unbiasedVar / 4.0) * 180}
                      fill="#10B981"
                      stroke="#047857"
                      strokeWidth="2"
                      rx="6"
                    />
                    <text x="520" y="325" fill="#047857" fontSize="12" fontWeight="bold" textAnchor="middle">
                      Chia cho n - 1 (Bessel)
                    </text>
                    <text
                      x="520"
                      y={290 - (besselRuns.unbiasedVar / 4.0) * 180}
                      fill="#047857"
                      fontSize="13"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {fmt(besselRuns.unbiasedVar, 2)}
                    </text>
                  </g>
                )}
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <span className="text-rose-600 font-bold">
                  Chia n bị ước lượng hụt: {fmt(((besselSampleSize - 1) / besselSampleSize) * 100, 1)}% giá trị thật
                </span>
                <span className="text-emerald-600 font-bold">
                  Chia n - 1 đạt kỳ vọng chuẩn không chệch: E[S²] = σ²
                </span>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Tại sao trong công thức tính phương sai mẫu $S^2$, ta bắt buộc phải chia cho $n - 1$ (Hiệu chỉnh Bessel) thay vì chia cho $n$ như trực giác tự nhiên?"
            formula="S^2 = \frac{1}{n-1}\sum_{i=1}^n (X_i - \bar{X})^2 \implies \mathbb{E}[S^2] = \sigma^2, \quad \mathbb{E}\left[\frac{1}{n}\sum_{i=1}^n (X_i - \bar{X})^2\right] = \frac{n-1}{n}\sigma^2"
            mathExplanation="Vì trung bình mẫu $\bar{X}$ được tính từ chính các điểm dữ liệu, các điểm dữ liệu luôn có xu hướng nằm gần $\bar{X}$ hơn là nằm gần trung bình thực $\mu$! Việc chia cho $n$ sẽ luôn luôn đánh giá thấp (ước lượng non) phương sai thực tế một tỷ lệ $(n-1)/n$. Chia cho $n-1$ sẽ triệt tiêu hoàn toàn độ chệch này!"
            howToInteract={[
              "Kéo slider 'Cỡ mẫu nhỏ $n$' từ 2 đến 12.",
              "Xem đồ thị so sánh 2 cột phương sai mẫu sau 2,500 lần lấy mẫu Monte Carlo.",
              "Quan sát độ lệch: Cột chia cho $n$ luôn bị hụt dưới vạch phương sai chân lý $\sigma^2 = 4.00$, trong khi cột chia cho $n-1$ đạt chuẩn không chệch 100%!"
            ]}
            whatToObserve="Khi $n = 2$ hoặc 3, công thức chia cho $n$ ước lượng non tới 33-50% phương sai thật! Khi $n$ tăng lên 30, sai số này nhỏ dần, nhưng về mặt giải tích chỉ có chia $n-1$ mới là ước lượng không chệch (Unbiased Estimator)!"
            takeaway="Bessel correction giải thích triệt để vì sao máy tính Casio luôn có 2 phím tính phương sai: $s_x$ (chia $n-1$ cho mẫu) và $\sigma_x$ (chia $n$ cho toàn thể)!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 4: ĐƯỜNG CONG MLE (ORIGINAL LAB - DIRECTLY ON DESMOS GRID)
         ========================================================================= */}
      {activeTab === 'mle' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="blue" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Quản Lý Mẫu Quan Sát
                </h4>
                <div className="flex gap-2 mb-3">
                  <ClayButton
                    variant="primary"
                    size="md"
                    className="flex-1 text-xs"
                    onClick={() => setMlePoints([...mlePoints, Math.round((2 + Math.random() * 6) * 10) / 10])}
                  >
                    + Thêm Mẫu Mới
                  </ClayButton>
                  <ClayButton
                    variant="outline"
                    size="md"
                    className="flex-1 text-xs"
                    onClick={() => setMlePoints(mlePoints.slice(0, -1))}
                    disabled={mlePoints.length <= 1}
                  >
                    - Xóa Điểm Cuối
                  </ClayButton>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Dữ liệu: [{mlePoints.map(p => fmt(p, 1)).join(', ')}]
                </div>
              </ClayCard>

              <ClayCard glowColor="amber" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Nguyên Lý Cực Đại Hợp Lý
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  Giá trị mu tối ưu chính là tọa độ đỉnh của đường cong Log-Likelihood:
                </p>
                <div className="mt-2.5 p-2.5 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-center font-mono font-bold text-sky-700 dark:text-sky-300 text-sm">
                  <MathView math="\hat{\mu}_{\text{MLE}} = \arg\max \ln L(\mu) = \bar{X}" />
                </div>
              </ClayCard>

              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Ước Lượng Điểm MLE
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Số điểm mẫu n:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{mlePoints.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Đỉnh MLE mu_hat:</span>
                    <span className="font-mono font-extrabold text-sky-600 dark:text-sky-400 text-sm">
                      {fmt(mleMean, 2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Kết luận:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      mu_MLE trùng khít X_bar
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <DesmosStageHeader
              title="Đường Cong Hàm Hợp Lý Cực Đại L(μ)"
              formula="\hat{\mu}_{\text{MLE}} = \arg\max_\mu L(\mu) = \bar{X}"
              badge={`Nghiệm MLE: μ̂ = ${fmt(mleMean, 2)}`}
              onReset={() => setMlePoints([2.0, 3.5, 4.2, 5.8, 6.5])}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                {/* Horizontal axis */}
                <line x1="60" y1="300" x2="740" y2="300" stroke="#0F172A" strokeWidth="2" />
                {[0, 2, 4, 6, 8, 10].map((v) => (
                  <g key={`mle-x-${v}`}>
                    <line x1={80 + (v / 10) * 640} y1="300" x2={80 + (v / 10) * 640} y2="306" stroke="#0F172A" strokeWidth="1.5" />
                    <text x={80 + (v / 10) * 640} y="324" textAnchor="middle" className="text-xs font-mono font-bold fill-slate-600">
                      {v}
                    </text>
                  </g>
                ))}

                {/* Likelihood Curve */}
                {(() => {
                  const pts = [];
                  for (let mu = 0.5; mu <= 9.5; mu += 0.1) {
                    let logL = 0;
                    for (const pt of mlePoints) {
                      logL += -0.5 * ((pt - mu) ** 2);
                    }
                    const lVal = Math.exp(logL * 0.4);
                    const px = 80 + (mu / 10) * 640;
                    const py = 300 - lVal * 240;
                    pts.push(`${px},${py}`);
                  }
                  return (
                    <path d={`M ${pts.join(' L ')}`} fill="none" stroke="#0284C7" strokeWidth="3.5" />
                  );
                })()}

                {/* Data Points on Axis */}
                {mlePoints.map((pt, i) => (
                  <g key={i}>
                    <circle cx={80 + (pt / 10) * 640} cy="300" r="5" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.5" />
                    <line x1={80 + (pt / 10) * 640} y1="300" x2={80 + (pt / 10) * 640} y2="270" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" />
                  </g>
                ))}

                {/* MLE Peak Marker */}
                <line
                  x1={80 + (mleMean / 10) * 640}
                  y1="50"
                  x2={80 + (mleMean / 10) * 640}
                  y2="300"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <circle cx={80 + (mleMean / 10) * 640} cy="60" r="6" fill="#EF4444" />
                <text
                  x={80 + (mleMean / 10) * 640}
                  y="40"
                  fill="#EF4444"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  Đỉnh MLE μ̂ = {fmt(mleMean, 2)}
                </text>
              </svg>

              {/* Bottom Stage Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> {mlePoints.length} Điểm dữ liệu mẫu
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                    <span className="w-4 h-0.5 bg-sky-500"></span>
                    <span>Đường cong Hợp lý Likelihood <MathView math="L(\mu)" /></span>
                  </span>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  Nghiệm tối ưu: <MathView math="\bar{x}" /> = {fmt(mleMean, 2)}
                </span>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Khi ta thu được một tập dữ liệu mẫu, làm thế nào để tìm ra giá trị tham số $\mu$ có khả năng cao nhất đã sinh ra bộ dữ liệu đó? Nguyên lý Hợp lý Cực đại (MLE) hoạt động ra sao?"
            formula="L(\mu) = \prod_{i=1}^n f(x_i \mid \mu), \quad \ln L(\mu) = -\frac{n}{2}\ln(2\pi\sigma^2) - \sum_{i=1}^n \frac{(x_i - \mu)^2}{2\sigma^2}"
            mathExplanation="Hàm hợp lý $L(\mu)$ đo lường 'mức độ hợp lý' của giả thuyết $\mu$ đối với dữ liệu quan sát được. Để tìm điểm cực đại, ta lấy log rồi đạo hàm triệt tiêu: Đỉnh cực đại của đường cong Likelihood chính là nghiệm MLE $\hat{\mu}$!"
            howToInteract={[
              "Quan sát các điểm dữ liệu trên trục số.",
              "Đường cong Likelihood dâng lên và đạt đỉnh cực đại duy nhất tại giá trị trung bình mẫu.",
              "Bấm 'Thêm điểm dữ liệu' hoặc 'Xóa điểm' để xem đỉnh MLE dịch chuyển."
            ]}
            whatToObserve="Đỉnh của quả chuông hàm hợp lý luôn nằm chính xác tại điểm trung bình cộng của các mẫu dữ liệu!"
            takeaway="Đối với phân phối Chuẩn: Ước lượng hợp lý cực đại MLE của kỳ vọng $\mu$ chính là trung bình mẫu $\bar{x}$!"
          />
        </div>
      )}
    </div>
  );
};
