import React, { useState, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, betaPdf, normalPdf } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';
import { BayesSankeyFlow } from '../../svg/BayesSankeyFlow';

export const BayesianInference: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'beta-binomial' | 'sensor-fusion' | 'credible' | 'baserate'>('beta-binomial');
  const [baseRateViewMode, setBaseRateViewMode] = useState<'sankey' | 'mosaic'>('sankey');

  // Tab 1: Beta-Binomial State (Original Lab)
  const [headsK, setHeadsK] = useState<number>(7);
  const [trialsN, setTrialsN] = useState<number>(10);
  const [alphaPrior, setAlphaPrior] = useState<number>(2.0);
  const [betaPrior, setBetaPrior] = useState<number>(2.0);

  const alphaPost = alphaPrior + headsK;
  const betaPost = betaPrior + (trialsN - headsK);
  const thetaMap = alphaPost + betaPost > 2 ? (alphaPost - 1) / (alphaPost + betaPost - 2) : 0.5;
  const postMean = alphaPost / (alphaPost + betaPost);
  const sampleFreq = trialsN > 0 ? headsK / trialsN : 0.5;

  const curvePoints = useMemo(() => {
    const pts = [];
    for (let x = 0.01; x <= 0.99; x += 0.01) {
      const priorVal = betaPdf(x, alphaPrior, betaPrior);
      const postVal = betaPdf(x, alphaPost, betaPost);
      const rawLikelihood = Math.pow(x, headsK) * Math.pow(1 - x, trialsN - headsK);
      pts.push({ x, prior: priorVal, post: postVal, rawLikelihood });
    }

    const maxPost = Math.max(...pts.map((p) => p.post), 1);
    const maxPrior = Math.max(...pts.map((p) => p.prior), 1);
    const maxLike = Math.max(...pts.map((p) => p.rawLikelihood), 1e-8);

    return pts.map((p) => ({
      x: p.x,
      priorNorm: (p.prior / Math.max(maxPost, maxPrior)) * 260,
      postNorm: (p.post / maxPost) * 260,
      likeNorm: (p.rawLikelihood / maxLike) * 200,
    }));
  }, [alphaPrior, betaPrior, alphaPost, betaPost, headsK, trialsN]);

  const handleFlip = (count = 1) => {
    let newHeads = 0;
    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.7) newHeads++;
    }
    setHeadsK((k) => k + newHeads);
    setTrialsN((n) => n + count);
  };

  // Tab 2: Gaussian Sensor Fusion (Original Lab Restored)
  const [priorMu, setPriorMu] = useState<number>(0);
  const [priorSigma, setPriorSigma] = useState<number>(2.0);
  const [sensor1X, setSensor1X] = useState<number>(3.0);
  const [sensor1Sigma, setSensor1Sigma] = useState<number>(1.5);
  const [sensor2X, setSensor2X] = useState<number>(1.0);
  const [sensor2Sigma, setSensor2Sigma] = useState<number>(0.8);

  const prec0 = 1 / (priorSigma * priorSigma);
  const prec1 = 1 / (sensor1Sigma * sensor1Sigma);
  const prec2 = 1 / (sensor2Sigma * sensor2Sigma);
  const totalPrec = prec0 + prec1 + prec2;
  const postStd = Math.sqrt(1 / totalPrec);
  const postMu = (priorMu * prec0 + sensor1X * prec1 + sensor2X * prec2) / totalPrec;

  // Tab 3: Credible Interval HPD
  const [credLevel, setCredLevel] = useState<number>(0.95);

  // Tab 4: Base Rate Fallacy State
  const [prevalencePer10k, setPrevalencePer10k] = useState<number>(10);
  const [sensitivityPct, setSensitivityPct] = useState<number>(99);
  const [specificityPct, setSpecificityPct] = useState<number>(95);

  const totalPop = 10000;
  const sick = prevalencePer10k;
  const healthy = totalPop - sick;
  const truePos = Math.round(sick * (sensitivityPct / 100));
  const falsePos = Math.round(healthy * ((100 - specificityPct) / 100));
  const totalPos = truePos + falsePos;
  const bayesPpv = totalPos > 0 ? (truePos / totalPos) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            MAT1101 Bài 9 — Suy luận thống kê Bayes
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Cập nhật Niềm tin Bayes, Hợp nhất Cảm biến & Nghịch lý Tỷ lệ nền
          </h2>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('beta-binomial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'beta-binomial'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Mô hình Beta - Nhị thức
          </button>
          <button
            onClick={() => setActiveTab('sensor-fusion')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'sensor-fusion'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Hợp nhất Cảm biến Gauss
          </button>
          <button
            onClick={() => setActiveTab('credible')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'credible'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. Khoảng Tin cậy Bayes (Credible)
          </button>
          <button
            onClick={() => setActiveTab('baserate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'baserate'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            4. Ảo giác Tỷ lệ nền (Base Rate)
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: BETA-BINOMIAL (ORIGINAL LAB - DIRECTLY ON DESMOS GRID)
         ========================================================================= */}
      {activeTab === 'beta-binomial' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  1. Niềm Tin Tiên Nghiệm (Prior)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Điều chỉnh niềm tin ban đầu của bạn về xác suất ngửa θ:
                </p>
              </div>

              <div className="space-y-3">
                <ClaySlider
                  label="Alpha Tiên nghiệm (Số ngửa giả định)"
                  value={alphaPrior}
                  min={1}
                  max={10}
                  step={0.5}
                  color="purple"
                  onChange={setAlphaPrior}
                />
                <ClaySlider
                  label="Beta Tiên nghiệm (Số sấp giả định)"
                  value={betaPrior}
                  min={1}
                  max={10}
                  step={0.5}
                  color="purple"
                  onChange={setBetaPrior}
                />
              </div>
            </ClayCard>

            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  2. Thu Thập Dữ Liệu Mới
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Tung đồng xu để cập nhật thêm bằng chứng thực tế (Likelihood):
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <ClayButton variant="primary" size="md" onClick={() => handleFlip(1)} className="flex-1">
                    Tung 1 Lần
                  </ClayButton>
                  <ClayButton variant="secondary" size="md" onClick={() => handleFlip(10)} className="flex-1">
                    Tung 10 Lần
                  </ClayButton>
                </div>
                <div className="flex gap-2">
                  <ClayButton variant="outline" size="sm" onClick={() => handleFlip(50)} className="flex-1">
                    Tung 50 Lần
                  </ClayButton>
                  <ClayButton
                    variant="outline"
                    size="sm"
                    onClick={() => { setHeadsK(0); setTrialsN(0); }}
                    className="flex-1"
                  >
                    Xóa Dữ Liệu
                  </ClayButton>
                </div>
              </div>
            </ClayCard>

            <ClayCard className="p-5 space-y-2 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  3. Ước Lượng Hậu Nghiệm (MAP)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Điểm có xác suất hậu nghiệm lớn nhất:
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Ước lượng MAP:</span>
                  <span className="font-bold text-rose-600">{fmt(thetaMap, 3)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Kỳ vọng Hậu nghiệm E[θ|D]:</span>
                  <span className="font-bold text-sky-600">{fmt(postMean, 3)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Tổng mẫu thực tế:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{trialsN} lần</span>
                </div>
              </div>
            </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="So Sánh Prior vs Likelihood vs Posterior Beta(α, β)"
              formula="\text{Posterior} \propto \theta^k (1-\theta)^{n-k} \times \theta^{\alpha-1} (1-\theta)^{\beta-1}"
              badge={`Quan sát: ${headsK}/${trialsN} Ngửa`}
              onReset={() => {
                setHeadsK(0);
                setTrialsN(0);
                setAlphaPrior(2);
                setBetaPrior(2);
              }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                {/* Horizontal axis line */}
                <line x1="60" y1="310" x2="740" y2="310" stroke="#0F172A" strokeWidth="2.5" />

                {/* Ticks 0.0 to 1.0 */}
                {[0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((t) => {
                  const px = 60 + t * 680;
                  return (
                    <g key={`beta-tick-${t}`}>
                      <line x1={px} y1="310" x2={px} y2="316" stroke="#0F172A" strokeWidth="1.5" />
                      <text x={px} y="332" textAnchor="middle" className="text-xs font-mono font-bold fill-slate-600">
                        {t.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Prior Curve (Dashed Purple) */}
                <polyline
                  points={curvePoints.map((p) => `${60 + p.x * 680},${310 - p.priorNorm}`).join(' ')}
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                />

                {/* Likelihood Curve (Orange) */}
                <polyline
                  points={curvePoints.map((p) => `${60 + p.x * 680},${310 - p.likeNorm}`).join(' ')}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />

                {/* Posterior Curve (Thick Ocean Blue) */}
                <polyline
                  points={curvePoints.map((p) => `${60 + p.x * 680},${310 - p.postNorm}`).join(' ')}
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* MAP Marker (Red line) */}
                {thetaMap >= 0 && thetaMap <= 1 && (
                  <g>
                    <line
                      x1={60 + thetaMap * 680}
                      y1="40"
                      x2={60 + thetaMap * 680}
                      y2="310"
                      stroke="#EF4444"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <circle cx={60 + thetaMap * 680} cy="40" r="5" fill="#EF4444" />
                    <text
                      x={60 + thetaMap * 680}
                      y="30"
                      fill="#EF4444"
                      fontSize="11"
                      textAnchor="middle"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      MAP = {fmt(thetaMap, 2)}
                    </text>
                  </g>
                )}
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                    <span className="w-5 h-0.5 bg-purple-500 border-dashed"></span> Prior Beta({fmt(alphaPrior, 1)}, {fmt(betaPrior, 1)})
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                    <span className="w-5 h-0.5 bg-amber-500 border-dashed"></span> Likelihood
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-1 bg-sky-600 rounded-full"></span> Posterior Beta({fmt(alphaPost, 1)}, {fmt(betaPost, 1)})
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tần suất thực nghiệm k/n = {fmt(sampleFreq, 3)}
                </div>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Làm sao ta có thể kết hợp niềm tin ban đầu của chuyên gia (Prior) với dữ liệu quan sát thực nghiệm mới thu thập (Likelihood) để liên tục cập nhật xác suất thành công $\theta$ một cách khoa học?"
            formula="P(\theta \mid \text{data}) = \frac{P(\text{data} \mid \theta) P(\theta)}{P(\text{data})} \propto \theta^{\alpha + k - 1} (1 - \theta)^{\beta + (n-k) - 1}"
            mathExplanation="Khi chọn Prior là phân phối liên hợp $\text{Beta}(\alpha, \beta)$ và dữ liệu là Nhị thức ($k$ lần ngửa trong $n$ lần tung), phân phối Hậu nghiệm Posterior vẫn là một hàm Beta với các tham số đơn giản là cộng dồn: $\alpha_{\text{mới}} = \alpha + k$ và $\beta_{\text{mới}} = \beta + (n - k)$!"
            howToInteract={[
              "Bấm nút 'Tung 1 đồng xu' hoặc 'Tung 10 đồng xu' để thu thập thêm dữ liệu.",
              "Kéo slider Prior $\alpha$ và $\beta$ để thay đổi niềm tin chủ quan ban đầu.",
              "Xem đường cong Posterior màu xanh dương co hẹp và dịch chuyển đỉnh MAP về phía tần suất thực nghiệm $k/n$."
            ]}
            whatToObserve="Khi số lần tung $n$ còn ít, Posterior bị giằng co giữa Prior và Likelihood. Nhưng khi $n$ rất lớn (ví dụ $n > 50$), dữ liệu áp đảo hoàn toàn, gạt bỏ Prior ban đầu và ép đỉnh nhọn đúng tại $\theta$ thật!"
            takeaway="Điểm cực trị MAP (Maximum A Posteriori): $\theta_{\text{MAP}} = \frac{\alpha + k - 1}{\alpha + \beta + n - 2}$. Khi $\alpha = \beta = 1$ (Prior phẳng), MAP trùng khít hoàn hảo với nghiệm MLE tần suất!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 2: HỢP NHẤT CẢM BIẾN GAUSS (ORIGINAL LAB RESTORED - DIRECTLY ON DESMOS GRID)
         ========================================================================= */}
      {activeTab === 'sensor-fusion' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  1. Cảm Biến 1
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Giá trị đọc và sai số đo của cảm biến 1:
                </p>
              </div>

              <div className="space-y-3">
                <ClaySlider
                  label="Vị trí đọc x1"
                  value={sensor1X}
                  min={-3}
                  max={4}
                  step={0.5}
                  color="orange"
                  onChange={setSensor1X}
                />
                <ClaySlider
                  label="Sai số sigma1"
                  value={sensor1Sigma}
                  min={0.5}
                  max={3}
                  step={0.1}
                  color="orange"
                  onChange={setSensor1Sigma}
                />
              </div>
            </ClayCard>

            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  2. Cảm Biến 2
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Giá trị đọc và sai số đo của cảm biến 2:
                </p>
              </div>

              <div className="space-y-3">
                <ClaySlider
                  label="Vị trí đọc x2"
                  value={sensor2X}
                  min={-3}
                  max={4}
                  step={0.5}
                  color="emerald"
                  onChange={setSensor2X}
                />
                <ClaySlider
                  label="Sai số sigma2"
                  value={sensor2Sigma}
                  min={0.5}
                  max={3}
                  step={0.1}
                  color="emerald"
                  onChange={setSensor2Sigma}
                />
              </div>
            </ClayCard>

            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  3. Niềm Tin Tiên Nghiệm (Prior)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Dự đoán trước đó về vị trí vật thể:
                </p>
              </div>

              <div className="space-y-3">
                <ClaySlider
                  label="Tâm tiên nghiệm mu0"
                  value={priorMu}
                  min={-3}
                  max={3}
                  step={0.5}
                  color="purple"
                  onChange={setPriorMu}
                />
                <ClaySlider
                  label="Độ bất định sigma0"
                  value={priorSigma}
                  min={0.5}
                  max={4}
                  step={0.2}
                  color="purple"
                  onChange={setPriorSigma}
                />
              </div>
            </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Hợp Nhất Đa Cảm Biến Gauss (Gaussian Sensor Fusion)"
              formula="\frac{1}{\sigma_{\text{post}}^2} = \frac{1}{\sigma_0^2} + \frac{1}{\sigma_1^2} + \frac{1}{\sigma_2^2}"
              badge={`μ_post = ${fmt(postMu, 2)} | σ_post = ${fmt(postStd, 2)}`}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="-5 0 10 1.2" className="w-full h-auto select-none">
                <line x1="-5" y1="1.15" x2="5" y2="1.15" stroke="#0F172A" strokeWidth="0.015" />

                {/* Prior Gauss (Purple dashed) */}
                <path
                  d={Array.from({ length: 100 }, (_, i) => {
                    const x = -5 + (i / 100) * 10;
                    const y = 1.15 - normalPdf(x, priorMu, priorSigma);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="0.02"
                  strokeDasharray="0.05 0.03"
                />

                {/* Sensor 1 Gauss (Orange dashed) */}
                <path
                  d={Array.from({ length: 100 }, (_, i) => {
                    const x = -5 + (i / 100) * 10;
                    const y = 1.15 - normalPdf(x, sensor1X, sensor1Sigma);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="0.02"
                  strokeDasharray="0.05 0.03"
                />

                {/* Sensor 2 Gauss (Emerald dashed) */}
                <path
                  d={Array.from({ length: 100 }, (_, i) => {
                    const x = -5 + (i / 100) * 10;
                    const y = 1.15 - normalPdf(x, sensor2X, sensor2Sigma);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="0.02"
                  strokeDasharray="0.05 0.03"
                />

                {/* Fused Posterior (Thick Ocean Blue) */}
                <path
                  d={Array.from({ length: 140 }, (_, i) => {
                    const x = -5 + (i / 140) * 10;
                    const y = 1.15 - normalPdf(x, postMu, postStd);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="rgba(2, 132, 199, 0.2)"
                  stroke="#0284C7"
                  strokeWidth="0.035"
                  strokeLinecap="round"
                />

                {/* Peak marker for fused estimate */}
                <line
                  x1={postMu}
                  y1="0.1"
                  x2={postMu}
                  y2="1.15"
                  stroke="#0284C7"
                  strokeWidth="0.02"
                  strokeDasharray="0.04 0.02"
                />
                <circle cx={postMu} cy="0.1" r="0.04" fill="#0284C7" />
                <text
                  x={postMu}
                  y="0.06"
                  fill="#0284C7"
                  fontSize="0.13"
                  textAnchor="middle"
                  fontWeight="black"
                  className="font-mono"
                >
                  μ_post = {fmt(postMu, 2)}
                </text>
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="w-5 h-0.5 bg-indigo-500 border-dashed"></span> Prior
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-orange-600 dark:text-orange-400">
                    <span className="w-5 h-0.5 bg-orange-500 border-dashed"></span> Cảm biến 1
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-5 h-0.5 bg-emerald-500 border-dashed"></span> Cảm biến 2
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-1 bg-sky-600 rounded-full"></span> Hợp nhất Hậu nghiệm (Fused)
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                  Độ lệch chuẩn: σ_post = {fmt(postStd, 3)}
                </div>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Một robot xe tự hành nhận tín hiệu GPS (sai số lớn) và cảm biến Lidar (sai số nhỏ). Làm thế nào nguyên lý Bayes kết hợp hai cảm biến này với vị trí dự đoán trước đó để đưa ra vị trí chính xác hơn bất kỳ cảm biến đơn lẻ nào?"
            formula="\frac{1}{\sigma_{\text{post}}^2} = \frac{1}{\sigma_0^2} + \frac{1}{\sigma_1^2} + \frac{1}{\sigma_2^2}, \quad \mu_{\text{post}} = \sigma_{\text{post}}^2 \left(\frac{\mu_0}{\sigma_0^2} + \frac{x_1}{\sigma_1^2} + \frac{x_2}{\sigma_2^2}\right)"
            mathExplanation="Độ chính xác (Precision = $1/\sigma^2$) của phân phối Gauss cộng dồn lại theo nguyên lý Bayes! Cảm biến nào có độ lệch chuẩn nhỏ (đáng tin cậy) sẽ nhận được trọng số cực lớn trong giá trị trung bình kết hợp."
            howToInteract={[
              "Kéo slider 'Vị trí đọc $x_1, x_2$' để thay đổi số đo của từng cảm biến.",
              "Kéo slider 'Sai số $\sigma_1, \sigma_2$' để mô phỏng cảm biến xịn hay dỏm.",
              "Nhìn quả chuông kết hợp màu xanh dương: Độ lệch chuẩn $\sigma_{\text{post}}$ LUÔN LUÔN NHỎ HƠN độ lệch chuẩn của từng cảm biến đơn lẻ!"
            ]}
            whatToObserve="Quả chuông kết hợp (Fused) luôn cao hơn và nhọn hơn tất cả các cảm biến thành phần. Dù cả 2 cảm biến đều có sai số, kết hợp chúng lại giúp robot định vị cực kỳ chuẩn xác!"
            takeaway="Đây chính là bước Cập nhật Đo lường (Measurement Update) cốt lõi của Bộ lọc Kalman (Kalman Filter) dùng trong tên lửa và xe tự hành Tesla!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 3: KHOẢNG TIN CẬY BAYES (CREDIBLE INTERVAL) - TRÊN Ô GRID TRỰC TIẾP
         ========================================================================= */}
      {activeTab === 'credible' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="blue" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Mức Độ Tin Cậy HPD
                </h4>
                <ClaySlider
                  label="Mức độ tin cậy HPD (1 - α)"
                  value={credLevel}
                  min={0.8}
                  max={0.99}
                  step={0.01}
                  color="blue"
                  formatValue={(v) => `${fmt(v * 100, 0)}%`}
                  onChange={setCredLevel}
                />
                <div className="mt-3 flex gap-2">
                  {[0.8, 0.9, 0.95, 0.99].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setCredLevel(lvl)}
                      className="flex-1 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                    >
                      {Math.round(lvl * 100)}%
                    </button>
                  ))}
                </div>
              </ClayCard>

              <ClayCard glowColor="purple" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Ý Nghĩa Khoảng Tin Cậy Bayes
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  Trong trường phái Bayes, tham số theta là <strong>biến ngẫu nhiên</strong>. Ta có thể phát biểu trực tiếp:
                </p>
                <div className="mt-2.5 p-2 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 font-bold text-sky-700 dark:text-sky-300 text-xs text-center">
                  <MathView math="P(L \le \theta \le U \mid \text{Data}) = 1 - \alpha" />
                </div>
              </ClayCard>

              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Thông Tin Vùng Tin Cậy
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Mức tin cậy:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{fmt(credLevel * 100, 0)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Phân bố hậu nghiệm:</span>
                    <span className="font-mono font-bold text-sky-600">Beta({fmt(alphaPost, 1)}, {fmt(betaPost, 1)})</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Kỳ vọng E[theta|Data]:</span>
                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {fmt(postMean, 3)}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Khoảng Tin Cậy Hậu Nghiệm Mật Độ Cao (HPD Credible Interval)"
              formula={`P(L \\le \\theta \\le U \\mid \\text{Data}) = ${fmt(credLevel * 100, 0)}\\%`}
              badge={`Mức tin cậy: ${fmt(credLevel * 100, 0)}%`}
              onReset={() => setCredLevel(0.95)}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                <line x1="60" y1="310" x2="740" y2="310" stroke="#0F172A" strokeWidth="2.5" />
                {[0.0, 0.2, 0.4, 0.6, 0.8, 1.0].map((t) => (
                  <g key={`cred-t-${t}`}>
                    <line x1={60 + t * 680} y1="310" x2={60 + t * 680} y2="316" stroke="#0F172A" strokeWidth="1.5" />
                    <text x={60 + t * 680} y="332" textAnchor="middle" className="text-xs font-mono font-bold fill-slate-600">
                      {t.toFixed(1)}
                    </text>
                  </g>
                ))}

                {/* Shaded Credible Region */}
                {(() => {
                  const tail = (1 - credLevel) / 2;
                  const L = Math.max(0.05, postMean - 1.96 * Math.sqrt((alphaPost * betaPost) / ((alphaPost + betaPost) ** 2 * (alphaPost + betaPost + 1))));
                  const U = Math.min(0.95, postMean + 1.96 * Math.sqrt((alphaPost * betaPost) / ((alphaPost + betaPost) ** 2 * (alphaPost + betaPost + 1))));
                  const pxL = 60 + L * 680;
                  const pxU = 60 + U * 680;

                  const regionPts = curvePoints
                    .filter((p) => p.x >= L && p.x <= U)
                    .map((p) => `${60 + p.x * 680},${310 - p.postNorm}`);

                  return (
                    <g>
                      {regionPts.length > 0 && (
                        <polygon
                          points={`${pxL},310 ${regionPts.join(' ')} ${pxU},310`}
                          fill="rgba(2, 132, 199, 0.35)"
                        />
                      )}
                      <line x1={pxL} y1="60" x2={pxL} y2="310" stroke="#0284C7" strokeWidth="2" strokeDasharray="4 2" />
                      <line x1={pxU} y1="60" x2={pxU} y2="310" stroke="#0284C7" strokeWidth="2" strokeDasharray="4 2" />
                      <text x={pxL} y="50" fill="#0284C7" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        L = {fmt(L, 2)}
                      </text>
                      <text x={pxU} y="50" fill="#0284C7" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        U = {fmt(U, 2)}
                      </text>
                    </g>
                  );
                })()}

                {/* Posterior Curve */}
                <polyline
                  points={curvePoints.map((p) => `${60 + p.x * 680},${310 - p.postNorm}`).join(' ')}
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="3.5"
                />
              </svg>

              {/* Bottom Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                  <span className="w-3 h-3 bg-sky-500 rounded-sm"></span> Vùng tin cậy Bayes {fmt(credLevel * 100, 0)}%
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  <MathView math={`\\theta \\in [L, U] \\text{ với xác suất đúng bằng } ${fmt(credLevel * 100, 0)}\\%`} />
                </span>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Khoảng tin cậy Bayes (Credible Interval) khác gì về mặt bản chất so với Khoảng tin cậy Tần suất (Confidence Interval)? Tại sao Bayes cho phép ta nói thẳng: 'Xác suất tham số nằm trong khoảng này là 95%'?"
            formula="P(L \le \theta \le U \mid \text{data}) = \int_L^U P(\theta \mid \text{data}) \, d\theta = 1 - \alpha"
            mathExplanation="Trong trường phái Bayes, tham số $\theta$ là một biến ngẫu nhiên có hàm phân phối xác suất Posterior! Do đó, ta hoàn toàn có thể tính tích phân diện tích trực tiếp dưới đường cong Posterior để thu được khoảng tin cậy có mật độ cao nhất (HPD - Highest Posterior Density)."
            howToInteract={[
              "Kéo slider 'Mức độ tin cậy' (ví dụ 80%, 90%, 95%, 99%).",
              "Quan sát hai vạch biên $L$ và $U$ cùng vùng diện tích tích phân màu xanh dương co giãn trực tiếp trên đường cong Posterior.",
              "Xem giá trị cận dưới $L$ và cận trên $U$ thay đổi theo thời gian thực."
            ]}
            whatToObserve="Vùng Credible Interval luôn tự động bao phủ vùng mật độ cao nhất quanh đỉnh MAP. Khi tăng mức tin cậy từ 90% lên 99%, khoảng phải nới rộng ra hai bên để ôm trọn 99% diện tích xác suất."
            takeaway="Phân biệt sống còn: Tần suất coi tham số cố định, khoảng là ngẫu nhiên. Bayes coi tham số là ngẫu nhiên, cho phép phát biểu xác suất trực tiếp trên tham số!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 4: ẢO GIÁC TỶ LỆ NỀN (BASE RATE FALLACY) - TRÊN Ô GRID TRỰC TIẾP
         ========================================================================= */}
      {activeTab === 'baserate' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="blue" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Thông Số Y Tế Dân Số
                </h4>
                <div className="space-y-3">
                  <ClaySlider
                    label="Tỷ lệ bệnh (Base Rate)"
                    sublabel="Số ca / 10,000 dân"
                    value={prevalencePer10k}
                    min={1}
                    max={100}
                    step={1}
                    color="blue"
                    onChange={setPrevalencePer10k}
                  />
                  <ClaySlider
                    label="Độ nhạy (Sensitivity)"
                    sublabel="P(+|Bệnh)"
                    value={sensitivityPct}
                    min={90}
                    max={100}
                    step={1}
                    color="emerald"
                    formatValue={(v) => `${v}%`}
                    onChange={setSensitivityPct}
                  />
                  <ClaySlider
                    label="Độ đặc hiệu (Specificity)"
                    sublabel="P(-|Khỏe)"
                    value={specificityPct}
                    min={85}
                    max={99}
                    step={1}
                    color="purple"
                    formatValue={(v) => `${v}%`}
                    onChange={setSpecificityPct}
                  />
                </div>
              </ClayCard>

              <ClayCard glowColor="amber" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Ảo Giác Tỷ Lệ Nền
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  Khi bệnh hiếm, nhóm khỏe mạnh chiếm đa số tuyệt đối. 1-2% sai sót trên nhóm khỏe sẽ lấn át hoàn toàn số người bệnh thật.
                </p>
                <div className="mt-2.5 p-2 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 font-bold text-sky-700 dark:text-sky-300 text-xs text-center">
                  <MathView math="P(D|+) = \frac{P(+|D)P(D)}{P(+|D)P(D) + P(+|D^c)P(D^c)}" />
                </div>
              </ClayCard>

              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Phân Tích Dân Số (10,000)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Mắc bệnh thật:</span>
                    <span className="font-mono font-bold text-rose-600">{prevalencePer10k} người</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Khỏe mạnh:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{10000 - prevalencePer10k} người</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Dương tính thật TP:</span>
                    <span className="font-mono font-bold text-emerald-600">{Math.round(prevalencePer10k * (sensitivityPct / 100))}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Dương tính giả FP:</span>
                    <span className="font-mono font-bold text-amber-600">{Math.round((10000 - prevalencePer10k) * (1 - specificityPct / 100))}</span>
                  </div>
                </div>
              </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Phân Tích 10,000 Người & Ảo Giác Tỷ Lệ Nền (Base Rate Fallacy)"
              formula="P(\text{Bệnh} \mid +) = \frac{\text{Dương tính thật}}{\text{Dương tính thật} + \text{Dương tính giả}}"
              badge={`Xác suất mắc thật P(Bệnh|+) = ${fmt(bayesPpv, 1)}%`}
              onReset={() => { setPrevalencePer10k(10); setSensitivityPct(99); setSpecificityPct(95); }}
            />

            {/* View Switcher: Sankey Flow vs Mosaic Grid */}
            <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Góc nhìn:</span>
              <button
                onClick={() => setBaseRateViewMode('sankey')}
                className={`px-3 py-1 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                  baseRateViewMode === 'sankey'
                    ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Dòng Chảy Phân Nhánh (Sankey Flow)
              </button>
              <button
                onClick={() => setBaseRateViewMode('mosaic')}
                className={`px-3 py-1 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                  baseRateViewMode === 'mosaic'
                    ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_#0f172a]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Bản Đồ Khối Dân Số (Mosaic Grid)
              </button>
            </div>

            {baseRateViewMode === 'sankey' ? (
              <div className="p-4 sm:p-6">
                <BayesSankeyFlow
                  prevalence={prevalencePer10k / 10000}
                  sensitivity={sensitivityPct / 100}
                  falsePositiveRate={(100 - specificityPct) / 100}
                />
              </div>
            ) : (
            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              {/* Mosaic Probability Chart directly on the Desmos Grid */}
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                {/* Total population box: 10,000 people */}
                <rect x="80" y="50" width="640" height="240" fill="rgba(241, 245, 249, 0.6)" stroke="#0F172A" strokeWidth="2" />

                {/* Left slice: Sick population (Width proportional to prevalence) */}
                {(() => {
                  const sickW = Math.max(12, (sick / totalPop) * 640);
                  const healthyW = 640 - sickW;

                  // In sick column: True Positive vs False Negative
                  const truePosH = (sensitivityPct / 100) * 240;
                  const falseNegH = 240 - truePosH;

                  // In healthy column: False Positive vs True Negative
                  const falsePosH = ((100 - specificityPct) / 100) * 240;
                  const trueNegH = 240 - falsePosH;

                  return (
                    <g>
                      {/* True Positive (Green) */}
                      <rect x="80" y="50" width={sickW} height={truePosH} fill="#10B981" stroke="#047857" strokeWidth="1.5" />
                      {/* False Negative (Grey) */}
                      <rect x="80" y={50 + truePosH} width={sickW} height={falseNegH} fill="#94A3B8" opacity="0.5" />

                      {/* False Positive (Rose) */}
                      <rect x={80 + sickW} y="50" width={healthyW} height={falsePosH} fill="#F43F5E" stroke="#BE123C" strokeWidth="1.5" />
                      {/* True Negative (Clean Slate) */}
                      <rect x={80 + sickW} y={50 + falsePosH} width={healthyW} height={trueNegH} fill="rgba(203, 213, 225, 0.4)" />

                      {/* Labels and Count Callouts */}
                      <text x={80 + sickW / 2} y="35" fill="#047857" fontSize="12" fontWeight="bold" textAnchor="middle">
                        Người Mắc ({sick})
                      </text>
                      <text x={80 + sickW + healthyW / 2} y="35" fill="#475569" fontSize="12" fontWeight="bold" textAnchor="middle">
                        Người Khỏe Mạnh ({healthy})
                      </text>

                      {/* Callout box for True Pos */}
                      <text x="85" y={50 + truePosH / 2 + 4} fill="#FFFFFF" fontSize="10" fontWeight="black">
                        (+) Thật: {truePos}
                      </text>

                      {/* Callout box for False Pos */}
                      <text x={80 + sickW + 15} y={50 + falsePosH / 2 + 5} fill="#FFFFFF" fontSize="12" fontWeight="black">
                        DƯƠNG TÍNH GIẢ: {falsePos} CA BÁO NHẦM!
                      </text>
                    </g>
                  );
                })()}
              </svg>

              {/* Bottom Stage Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Dương tính thật: {truePos} ca
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                    <span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Dương tính giả: {falsePos} ca
                  </span>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  Tỷ lệ thật trong các ca (+): {truePos} / ({truePos} + {falsePos}) = {fmt(bayesPpv, 1)}%
                </span>
              </div>
            </div>
            )}
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Một xét nghiệm y tế chẩn đoán có độ chính xác lên tới 99% (độ nhạy 99%, độ đặc hiệu 95%). Một người nhận kết quả DƯƠNG TÍNH (+). Tại sao xác suất người đó thực sự mắc bệnh lại chỉ có khoảng 16%, thậm chí dưới 10%?"
            formula="P(\text{Bệnh} \mid +) = \frac{P(+ \mid \text{Bệnh}) P(\text{Bệnh})}{P(+ \mid \text{Bệnh})P(\text{Bệnh}) + P(+ \mid \text{Khỏe})P(\text{Khỏe})}"
            mathExplanation="Khi một căn bệnh rất hiếm (tỷ lệ nền Base Rate chỉ 1/1000 người), số người khỏe mạnh trong cộng đồng áp đảo tuyệt đối (999 người). Dù tỷ lệ báo động nhầm (dương tính giả) chỉ là 5%, nhưng 5% của 999 người khỏe vẫn ra tới ~50 ca dương tính giả, đè bẹp hoàn toàn 1 ca dương tính thật duy nhất!"
            howToInteract={[
              "Kéo slider 'Tỷ lệ mắc bệnh trong cộng đồng' từ 1 đến 100 ca trên 10,000 dân.",
              "Kéo slider 'Độ nhạy (Sensitivity)' và 'Độ đặc hiệu (Specificity)' của bộ kit test.",
              "Nhìn biểu đồ diện tích ma trận 10,000 người để so sánh số ca Dương tính Thật (xanh) vs Dương tính Giả (đỏ)."
            ]}
            whatToObserve="Kéo tỷ lệ nền xuống 5 ca/10,000 dân: Khối màu đỏ (dương tính giả) phình to gấp 10 lần khối màu xanh (dương tính thật)! Dẫn tới giá trị dự đoán dương tính PPV rơi xuống dưới 10%!"
            takeaway="Bẫy kinh điển: Không bao giờ được đánh đồng độ chính xác của xét nghiệm $P(+\mid\text{Bệnh})$ với xác suất mắc bệnh khi có kết quả $P(\text{Bệnh}\mid+)$! Tỷ lệ nền là yếu tố quyết định!"
          />
        </div>
      )}
    </div>
  );
};
