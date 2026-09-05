import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, normalPdf, normalCdf, standardNormalInv } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';

export const HypothesisTesting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tradeoff' | 'pvalue' | 'power'>('tradeoff');

  // Tab 1: Type I & II Error Tradeoff State
  const [mu0, setMu0] = useState<number>(0);
  const [mu1, setMu1] = useState<number>(2.5);
  const [sampleN, setSampleN] = useState<number>(16);
  const [threshold, setThreshold] = useState<number>(1.2);

  const sigma = 2.0;
  const stdMean = sigma / Math.sqrt(sampleN);

  const alpha = 1 - normalCdf(threshold, mu0, stdMean);
  const beta = normalCdf(threshold, mu1, stdMean);
  const power = 1 - beta;

  // Tab 2: P-Value Visualizer State
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

  // Tab 3: Power Analysis & Sample Size Planning
  const [effectSizeD, setEffectSizeD] = useState<number>(0.5); // Cohen's d: (mu1 - mu0) / sigma
  const [powerAlpha, setPowerAlpha] = useState<number>(0.05);
  const [planN, setPlanN] = useState<number>(30);

  // Compute power for given n and d
  const zAlphaVal = standardNormalInv(1 - powerAlpha / 2);
  const curPower = 1 - normalCdf(zAlphaVal - effectSizeD * Math.sqrt(planN), 0, 1);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'tradeoff'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Đánh đổi Loại I / II & Power
          </button>
          <button
            onClick={() => setActiveTab('pvalue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'pvalue'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Trực quan hóa p-value
          </button>
          <button
            onClick={() => setActiveTab('power')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'power'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. Phân tích Lực Kiểm Định
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: TRADEOFF & POWER
         ========================================================================= */}
      {activeTab === 'tradeoff' && (
        <div className="space-y-6">
          <LabBriefing
            question="Trong kiểm định giả thuyết, tại sao ta không thể giảm cả Sai lầm loại I (kết tội oan người vô tội) và Sai lầm loại II (bỏ lọt kẻ có tội) về 0 cùng một lúc? Làm sao để tăng Lực kiểm định (Power)?"
            formula="\alpha = P(\text{Bác bỏ } H_0 \mid H_0 \text{ đúng}), \quad \beta = P(\text{Chấp nhận } H_0 \mid H_1 \text{ đúng}), \quad \text{Power} = 1 - \beta"
            mathExplanation="Ngưỡng quyết định x_c là một ranh giới cắt đôi không gian: Dịch x_c sang phải sẽ giảm α (bớt kết tội oan), nhưng lại làm phình to diện tích β (bỏ lọt tội phạm)! Cách DUY NHẤT để giảm cả 2 sai lầm cùng lúc là TĂNG CỠ MẪU n để 2 quả chuông cùng co thắt lại!"
            howToInteract={[
              "Kéo slider 'Ngưỡng quyết định x_c' sang trái và sang phải.",
              "Xem diện tích màu đỏ (α) và diện tích màu vàng (β) giằng co nhau.",
              "Kéo slider 'Cỡ mẫu n' tăng lên 36 để thấy 2 quả chuông tách rời nhau ra."
            ]}
            whatToObserve="Khi kéo ngưỡng x_c sang phải: α giảm xuống nhưng β lập tức tăng vọt. Chỉ khi kéo n tăng lên (độ lệch chuẩn thu hẹp), cả α và β mới cùng co bé lại, đưa Lực kiểm định (Power = 1 - β) lên sát 100%!"
            takeaway="Muốn kiểm định vừa nghiêm ngặt (α bé) vừa nhạy bén (Power cao) $\implies$ BẮT BUỘC PHẢI THU THẬP THÊM MẪU n!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
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
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold border border-emerald-300">
                    Power = {fmt(power * 100, 1)}%
                  </span>
                </div>
              }
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[440px]">
              <div className="relative w-full max-w-3xl h-72 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                <svg viewBox="-2 0 7 1" className="w-full h-full" preserveAspectRatio="none">
                  {/* Trục */}
                  <line x1="-2" y1="0.95" x2="5" y2="0.95" stroke="#94a3b8" strokeWidth="0.008" />

                  {/* Curve H0 (Blue) */}
                  {(() => {
                    const pts = [];
                    for (let x = -2; x <= 4; x += 0.05) {
                      const y = 0.95 - normalPdf(x, mu0, stdMean) * 0.8;
                      pts.push(`${x},${y}`);
                    }
                    return <polyline points={pts.join(' ')} fill="none" stroke="#0284c7" strokeWidth="0.02" />;
                  })()}

                  {/* Curve H1 (Emerald) */}
                  {(() => {
                    const pts = [];
                    for (let x = -1; x <= 5; x += 0.05) {
                      const y = 0.95 - normalPdf(x, mu1, stdMean) * 0.8;
                      pts.push(`${x},${y}`);
                    }
                    return <polyline points={pts.join(' ')} fill="none" stroke="#10b981" strokeWidth="0.02" />;
                  })()}

                  {/* Ngưỡng Threshold x_c */}
                  <line x1={threshold} y1="0.05" x2={threshold} y2="0.95" stroke="#e11d48" strokeWidth="0.03" strokeDasharray="0.05 0.05" />
                </svg>

                <div className="absolute top-3 left-4 text-xs font-mono bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 space-y-1">
                  <div className="text-sky-600 font-bold">Chuông xanh trái: H₀ (μ₀ = 0)</div>
                  <div className="text-emerald-600 font-bold">Chuông xanh phải: H₁ (μ₁ = {fmt(mu1, 1)})</div>
                  <div className="text-rose-600 font-extrabold border-t border-slate-200 dark:border-slate-700 pt-1">
                    Vạch đỏ: Ngưỡng quyết định x_c = {fmt(threshold, 2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <ClaySlider
                  label="Ngưỡng quyết định x_c"
                  sublabel="Dịch để đánh đổi giữa α (Loại I) và β (Loại II)"
                  value={threshold}
                  min={0.2}
                  max={2.2}
                  step={0.05}
                  color="rose"
                  onChange={setThreshold}
                />
                <ClaySlider
                  label="Cỡ mẫu n"
                  sublabel="n càng lớn, 2 quả chuông càng co cụm và tách rời"
                  value={sampleN}
                  min={4}
                  max={40}
                  step={2}
                  color="blue"
                  onChange={setSampleN}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 2: P-VALUE VISUALIZER
         ========================================================================= */}
      {activeTab === 'pvalue' && (
        <div className="space-y-6">
          <LabBriefing
            question="Trị số p (p-value) thực chất là gì? Tại sao quy tắc quyết định luôn là: 'Nếu p-value <= alpha thì BÁC BỎ H_0'?"
            formula="p\text{-value} = P(\text{Thống kê mẫu cực đoan hơn hoặc bằng giá trị quan sát được} \mid H_0 \text{ đúng})"
            mathExplanation="p-value đo 'mức độ ngạc nhiên' của dữ liệu nếu giả định H_0 là đúng. Nếu p-value cực nhỏ (ví dụ 0.01), nghĩa là nếu H_0 đúng thì cơ hội xảy ra dữ liệu mẫu như vậy chỉ là 1% $\implies$ quá phi lý $\implies$ H_0 sai $\implies$ BÁC BỎ H_0!"
            howToInteract={[
              "Chọn loại kiểm định: Phía phải, Phía trái, hoặc Hai phía.",
              "Kéo slider giá trị thống kê mẫu Z_obs từ 0.0 đến 3.5.",
              "Xem diện tích đuôi p-value co hẹp lại và trạng thái BÁC BỎ / CHẤP NHẬN đổi màu."
            ]}
            whatToObserve="Khi Z_obs vượt qua vạch tới hạn Z_crit (vạch đỏ), diện tích p-value lập tức nhỏ hơn alpha (0.05) $\implies$ Hộp kết luận nhảy sang màu đỏ: 'BÁC BỎ H₀, CÓ Ý NGHĨA THỐNG KÊ'!"
            takeaway="Câu thần chú ôn thi: 'p-value nhỏ hơn alpha thì BÁC BỎ H_0, lớn hơn alpha thì CHƯA ĐỦ BẰNG CHỨNG để bác bỏ'!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={`Trực Quan Hóa p-value (${tailType === 'two' ? 'Kiểm định 2 phía' : tailType === 'right' ? 'Phía phải' : 'Phía trái'})`}
              formula={`p\\text{-value} = ${fmt(pValue, 4)} \\quad vs \\quad \\alpha = ${sigAlpha}`}
              badge={rejectH0 ? 'BÁC BỎ H₀ (p ≤ α)' : 'CHƯA ĐỦ BẰNG CHỨNG (p > α)'}
              onReset={() => { setSampleZ(1.96); setTailType('right'); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-full max-w-2xl space-y-4">
                {/* Kết luận Box */}
                <div className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  rejectH0
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-700 dark:text-rose-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                }`}>
                  <span className="text-xs font-heading font-black uppercase tracking-wider">
                    Quyết định Thống kê
                  </span>
                  <div className="text-2xl font-heading font-black mt-1">
                    {rejectH0 ? 'BÁC BỎ H₀ (Reject H₀)' : 'CHẤP NHẬN H₀ (Fail to Reject H₀)'}
                  </div>
                  <p className="text-xs mt-1">
                    p-value = <strong className="font-mono">{fmt(pValue, 4)}</strong> {rejectH0 ? '≤' : '>'} α = {sigAlpha}
                  </p>
                </div>

                {/* Sơ đồ vị trí Z */}
                <div className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span>Giá trị Thống kê Mẫu Z_obs:</span>
                    <span className="font-bold text-sky-600">{fmt(sampleZ, 2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span>Giá trị Tới hạn Z_crit (tại α = {sigAlpha}):</span>
                    <span className="font-bold text-rose-600">{fmt(zCrit, 2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex justify-center gap-3">
                  <ClayButton
                    variant={tailType === 'right' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTailType('right')}
                  >
                    Phía Phải (Z &gt; z_c)
                  </ClayButton>
                  <ClayButton
                    variant={tailType === 'two' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTailType('two')}
                  >
                    Hai Phía (|Z| &gt; z_c)
                  </ClayButton>
                  <ClayButton
                    variant={tailType === 'left' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTailType('left')}
                  >
                    Phía Trái (Z &lt; -z_c)
                  </ClayButton>
                </div>

                <ClaySlider
                  label="Giá trị Thống kê kiểm định Z_obs"
                  sublabel="Kéo để đưa Z_obs vào hoặc ra khỏi Miền Bác Bỏ"
                  value={sampleZ}
                  min={-3}
                  max={3.5}
                  step={0.05}
                  color="blue"
                  onChange={setSampleZ}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 3: POWER ANALYSIS
         ========================================================================= */}
      {activeTab === 'power' && (
        <div className="space-y-6">
          <LabBriefing
            question="Một công ty công nghệ muốn thử nghiệm A/B tính năng mới. Họ cần lấy mẫu tối thiểu bao nhiêu người dùng n để chắc chắn (với xác suất 80% trở lên) phát hiện ra sự cải tiến nếu tính năng đó thực sự hiệu quả?"
            formula="\text{Power} = 1 - \beta = \Phi\left( d\sqrt{n} - Z_{\alpha/2} \right) \quad \text{với } d = \frac{\mu_1 - \mu_0}{\sigma}"
            mathExplanation="Đây là bài toán Phân Tích Lực Kiểm Định (Power Analysis). Lực kiểm định chuẩn vàng trong thực tế luôn là 80% (0.80). Nếu cỡ mẫu n quá bé, dù tính năng mới cực tốt, bạn vẫn có tới 70-80% khả năng thất bại trong việc chứng minh nó (Sai lầm loại II)."
            howToInteract={[
              "Kéo slider Effect Size d (độ chênh lệch chuẩn hóa) từ 0.2 (hiệu ứng yếu) đến 0.8 (hiệu ứng mạnh).",
              "Kéo slider Cỡ mẫu n từ 10 đến 120 quan sát.",
              "Quan sát Lực kiểm định Power dâng lên và vượt qua ngưỡng chuẩn vàng 80%."
            ]}
            whatToObserve="Nếu hiệu ứng d rất nhỏ (0.2), bạn cần cỡ mẫu n > 100 mới đạt 80% Power! Nhưng nếu hiệu ứng rất rõ nét (d = 0.8), chỉ cần n = 25 là đủ để kiểm định thành công."
            takeaway="Phân tích lực kiểm định là bước đầu tiên của mọi dự án Data Science & thử nghiệm lâm sàng: Tính toán trước cỡ mẫu n cần thiết trước khi bắt đầu thu thập dữ liệu!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={`Phân Tích Lực Kiểm Định: Power = ${fmt(curPower * 100, 1)}% với n = ${planN}`}
              formula="n \propto \frac{(Z_{\alpha/2} + Z_{\beta})^2}{d^2}"
              badge={curPower >= 0.80 ? 'ĐẠT CHUẨN VÀNG (≥ 80%)' : 'THIẾU MẪU (< 80%)'}
              onReset={() => { setEffectSizeD(0.5); setPlanN(30); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-full max-w-2xl space-y-5">
                <div className="text-center">
                  <span className="text-xs font-heading font-black text-purple-600 uppercase tracking-wider">
                    Lực Kiểm Định Hiện Tại (Power = 1 - β)
                  </span>
                  <div className={`text-4xl sm:text-5xl font-heading font-black mt-1 ${
                    curPower >= 0.80 ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {fmt(curPower * 100, 1)}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Ngưỡng chuẩn vàng khoa học: <strong className="text-slate-800 dark:text-slate-200">80.0%</strong>
                  </p>
                </div>

                {/* Thanh đo Power */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-6 rounded-xl overflow-hidden border-2 border-slate-900 relative">
                  <div
                    style={{ width: `${curPower * 100}%` }}
                    className={`h-full transition-all duration-200 ${curPower >= 0.80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  />
                  {/* Vạch 80% */}
                  <div className="absolute top-0 bottom-0 left-[80%] w-1 bg-red-600 z-10" title="Chuẩn 80%" />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <ClaySlider
                  label="Độ chênh lệch Effect Size (Cohen's d)"
                  sublabel="0.2 (Nhỏ) - 0.5 (Vừa) - 0.8 (Lớn)"
                  value={effectSizeD}
                  min={0.2}
                  max={1.0}
                  step={0.05}
                  color="purple"
                  onChange={setEffectSizeD}
                />
                <ClaySlider
                  label="Cỡ mẫu thử nghiệm n"
                  sublabel="Kéo n để tăng Lực kiểm định vượt ngưỡng 80%"
                  value={planN}
                  min={10}
                  max={120}
                  step={5}
                  color="emerald"
                  onChange={setPlanN}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
};
