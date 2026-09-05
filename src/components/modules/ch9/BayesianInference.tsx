import React, { useState, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, betaPdf, normalPdf } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';

export const BayesianInference: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'beta-binomial' | 'sensor-fusion' | 'credible' | 'base-rate'>('beta-binomial');

  // Tab 1: Beta-Binomial State
  const [alphaPrior, setAlphaPrior] = useState<number>(2.0);
  const [betaPrior, setBetaPrior] = useState<number>(2.0);
  const [headsK, setHeadsK] = useState<number>(6);
  const [trialsN, setTrialsN] = useState<number>(10);

  const alphaPost = alphaPrior + headsK;
  const betaPost = betaPrior + (trialsN - headsK);

  const thetaMap = (alphaPost - 1) / (alphaPost + betaPost - 2);
  const thetaLms = alphaPost / (alphaPost + betaPost);
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

  // Tab 2: Gaussian Sensor Fusion
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
  const postVariance = 1 / totalPrec;
  const postStd = Math.sqrt(postVariance);
  const postMu = postVariance * (priorMu * prec0 + sensor1X * prec1 + sensor2X * prec2);

  // Tab 3: Credible Interval State
  const [credibleLevel, setCredibleLevel] = useState<number>(0.95);
  // Equal-tailed approximate bounds for Beta(a, b)
  const credA = alphaPost;
  const credB = betaPost;
  const credMean = credA / (credA + credB);
  const credVar = (credA * credB) / ((credA + credB) ** 2 * (credA + credB + 1));
  const credStd = Math.sqrt(credVar);
  const zVal = credibleLevel === 0.90 ? 1.645 : credibleLevel === 0.99 ? 2.576 : 1.96;
  const credLower = Math.max(0.01, credMean - zVal * credStd);
  const credUpper = Math.min(0.99, credMean + zVal * credStd);

  // Tab 4: Base Rate Fallacy State (Medical Testing)
  const [baseRateP, setBaseRateP] = useState<number>(0.005); // 0.5% prevalence
  const [sensitivity, setSensitivity] = useState<number>(0.98); // 98% true positive
  const [specificity, setSpecificity] = useState<number>(0.95); // 95% true negative

  // Bayes rule: P(Disease | Positive) = (P * Sens) / (P * Sens + (1-P) * (1-Spec))
  const pPosGivenDisease = sensitivity;
  const pPosGivenHealthy = 1 - specificity;
  const pTotalPos = baseRateP * pPosGivenDisease + (1 - baseRateP) * pPosGivenHealthy;
  const pDiseaseGivenPos = (baseRateP * pPosGivenDisease) / pTotalPos;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 9 — Suy luận thống kê Bayes
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Cập nhật Niềm tin Hậu nghiệm & Ước lượng MAP vs LMS
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('beta-binomial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'beta-binomial'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Cập nhật Beta-Binomial
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
            3. Khoảng Tin Cậy Bayes
          </button>
          <button
            onClick={() => setActiveTab('base-rate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'base-rate'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            4. Ảo giác Tỷ lệ Nền (Bệnh hiếm)
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: BETA-BINOMIAL
         ========================================================================= */}
      {activeTab === 'beta-binomial' && (
        <div className="space-y-6">
          <LabBriefing
            question="Khi ta tung một đồng xu không rõ độ cân bằng θ, làm thế nào để liên tục cập nhật niềm tin của ta về xác suất ra mặt ngửa θ mỗi khi có thêm dữ liệu thực tế?"
            formula="p(\theta | \text{data}) \propto p(\theta) \cdot p(\text{data} | \theta) \iff \text{Posterior} \propto \text{Prior} \times \text{Likelihood}"
            mathExplanation="Nếu niềm tin ban đầu (Prior) là Beta(α, β) và dữ liệu có k lần ngửa trong n lần tung, thì niềm tin mới (Posterior) là Beta(α + k, β + n - k)! Cực kỳ đơn giản: Chỉ việc cộng thêm số lần ngửa vào α và số lần sấp vào β."
            howToInteract={[
              "Bấm nút 'Tung đồng xu' (+1 lần hoặc +5 lần) để sinh dữ liệu thực tế.",
              "Xem đường cong Posterior màu xanh dương dần co hẹp và nhọn lên.",
              "So sánh 2 điểm ước lượng: Điểm Đỉnh cao nhất (MAP - Mode) và Điểm Trọng tâm (LMS - Mean)."
            ]}
            whatToObserve="Lúc đầu (n ít), đường Posterior chịu ảnh hưởng mạnh bởi Prior ban đầu. Nhưng khi n càng lớn (n > 20), dữ liệu thực tế (Likelihood) áp đảo hoàn toàn Prior, kéo đỉnh Posterior về đúng xác suất thực tế!"
            takeaway="Hai điểm ước lượng thi cử hay hỏi: MAP (Maximum A Posteriori) = Điểm cực đại của Posterior. LMS (Least Mean Squares) = Kỳ vọng của Posterior E[θ|data]!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={`Cập nhật Niềm tin: Beta(${alphaPost}, ${betaPost}) với k = ${headsK} ngửa / ${trialsN} lần tung`}
              formula={`\\theta_{MAP} = ${fmt(thetaMap, 3)} \\quad vs \\quad \\theta_{LMS} = ${fmt(thetaLms, 3)}`}
              badge={`Dữ liệu mẫu: ${fmt(sampleFreq * 100, 1)}% ngửa`}
              onReset={() => { setAlphaPrior(2.0); setBetaPrior(2.0); setHeadsK(6); setTrialsN(10); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[440px]">
              <div className="relative w-full max-w-3xl h-72 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                <svg viewBox="0 0 100 280" className="w-full h-full" preserveAspectRatio="none">
                  {/* Prior Curve (Gray) */}
                  <polyline
                    points={curvePoints.map((p) => `${p.x * 100},${280 - p.priorNorm}`).join(' ')}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.8"
                    strokeDasharray="3 3"
                  />

                  {/* Likelihood Curve (Amber) */}
                  <polyline
                    points={curvePoints.map((p) => `${p.x * 100},${280 - p.likeNorm}`).join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* Posterior Curve (Blue) */}
                  <polyline
                    points={curvePoints.map((p) => `${p.x * 100},${280 - p.postNorm}`).join(' ')}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3.5"
                  />

                  {/* Markers for MAP and LMS */}
                  <line x1={thetaMap * 100} y1="20" x2={thetaMap * 100} y2="280" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="2 2" />
                  <line x1={thetaLms * 100} y1="20" x2={thetaLms * 100} y2="280" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
                </svg>

                <div className="absolute top-3 right-4 text-xs font-mono bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-3 h-0.5 bg-slate-400 inline-block"></span> Tiên nghiệm Prior Beta({alphaPrior}, {betaPrior})
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <span className="w-3 h-0.5 bg-amber-500 inline-block"></span> Hàm hợp lý Likelihood ({headsK}H/{trialsN}T)
                  </div>
                  <div className="flex items-center gap-1.5 text-sky-600 font-bold">
                    <span className="w-3 h-1 bg-sky-600 inline-block"></span> Hậu nghiệm Posterior Beta({alphaPost}, {betaPost})
                  </div>
                  <div className="pt-1 text-[11px] text-rose-600 font-bold">
                    MAP = {fmt(thetaMap, 3)} | LMS = {fmt(thetaLms, 3)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex justify-center gap-3">
                  <ClayButton variant="primary" size="md" onClick={() => handleFlip(1)}>
                    🪙 Tung 1 lần
                  </ClayButton>
                  <ClayButton variant="secondary" size="md" onClick={() => handleFlip(5)}>
                    🪙 Tung 5 lần
                  </ClayButton>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ClaySlider
                    label="Tham số Tiên nghiệm α"
                    value={alphaPrior}
                    min={0.5}
                    max={10}
                    step={0.5}
                    color="blue"
                    onChange={setAlphaPrior}
                  />
                  <ClaySlider
                    label="Tham số Tiên nghiệm β"
                    value={betaPrior}
                    min={0.5}
                    max={10}
                    step={0.5}
                    color="purple"
                    onChange={setBetaPrior}
                  />
                </div>
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GAUSSIAN SENSOR FUSION
         ========================================================================= */}
      {activeTab === 'sensor-fusion' && (
        <div className="space-y-6">
          <LabBriefing
            question="Một robot tự hành đo khoảng cách tới chướng ngại vật bằng 2 cảm biến: Radar (chính xác vừa phải) và Lidar (rất chính xác). Làm sao để robot kết hợp cả 2 số đo để tìm vị trí ước lượng chính xác nhất?"
            formula="\frac{1}{\sigma_{\text{post}}^2} = \frac{1}{\sigma_{\text{prior}}^2} + \frac{1}{\sigma_1^2} + \frac{1}{\sigma_2^2}, \quad \mu_{\text{post}} = \sigma_{\text{post}}^2 \left( \frac{\mu_0}{\sigma_0^2} + \frac{x_1}{\sigma_1^2} + \frac{x_2}{\sigma_2^2} \right)"
            mathExplanation="Đây chính là bộ lọc Kalman 1 chiều! Độ chuẩn xác (Precision = 1/σ²) được CỘNG DỒN LẠI $\implies$ độ lệch chuẩn của ước lượng kết hợp luôn NHỎ HƠN độ lệch chuẩn của từng cảm biến đơn lẻ. Tâm hậu nghiệm bị kéo lệch mạnh về phía cảm biến nào có sai số nhỏ nhất!"
            howToInteract={[
              "Kéo vị trí đo x₁ của Cảm biến 1 và x₂ của Cảm biến 2.",
              "Giảm độ sai số σ₂ của Cảm biến 2 xuống mức rất nhỏ (ví dụ 0.5m).",
              "Nhìn quả chuông kết hợp Posterior màu tím co hẹp và nghiêng hẳn về bên nào."
            ]}
            whatToObserve="Đường chuông tím (Hậu nghiệm) luôn cao hơn và nhọn hơn (chính xác hơn) cả 2 quả chuông thành phần! Sai số của cảm biến nào càng nhỏ thì tiếng nói của nó càng có trọng số áp đảo."
            takeaway="Hợp nhất cảm biến Bayes: Càng có nhiều cảm biến (dù mỗi cảm biến có nhiễu), ước lượng kết hợp càng chuẩn xác hơn bất kỳ cảm biến nào đứng riêng lẻ!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Hợp Nhất Cảm Biến Gauss (Normal-Normal Conjugate Update)"
              formula={`\\mu_{\\text{post}} = ${fmt(postMu, 2)}m \\quad (\\sigma_{\\text{post}} = ${fmt(postStd, 2)}m)`}
              badge="Bộ lọc Kalman 1 chiều"
              onReset={() => { setSensor1X(3.0); setSensor1Sigma(1.5); setSensor2X(1.0); setSensor2Sigma(0.8); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="relative w-full max-w-3xl h-72 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                <svg viewBox="-5 0 10 1" className="w-full h-full" preserveAspectRatio="none">
                  {/* Trục hoành */}
                  <line x1="-5" y1="0.95" x2="5" y2="0.95" stroke="#94a3b8" strokeWidth="0.01" />

                  {/* Cảm biến 1 (Sky) */}
                  {(() => {
                    const pts = [];
                    for (let x = -5; x <= 5; x += 0.1) {
                      const y = 0.95 - normalPdf(x, sensor1X, sensor1Sigma) * 0.8;
                      pts.push(`${x},${y}`);
                    }
                    return <polyline points={pts.join(' ')} fill="none" stroke="#0284c7" strokeWidth="0.015" strokeDasharray="0.05 0.05" />;
                  })()}

                  {/* Cảm biến 2 (Emerald) */}
                  {(() => {
                    const pts = [];
                    for (let x = -5; x <= 5; x += 0.1) {
                      const y = 0.95 - normalPdf(x, sensor2X, sensor2Sigma) * 0.8;
                      pts.push(`${x},${y}`);
                    }
                    return <polyline points={pts.join(' ')} fill="none" stroke="#10b981" strokeWidth="0.015" strokeDasharray="0.05 0.05" />;
                  })()}

                  {/* Hậu nghiệm Kết hợp (Purple) */}
                  {(() => {
                    const pts = [];
                    for (let x = -5; x <= 5; x += 0.05) {
                      const y = 0.95 - normalPdf(x, postMu, postStd) * 0.8;
                      pts.push(`${x},${y}`);
                    }
                    return <polyline points={pts.join(' ')} fill="none" stroke="#7c3aed" strokeWidth="0.03" />;
                  })()}
                </svg>

                <div className="absolute top-3 left-4 text-xs font-mono bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 space-y-1">
                  <div className="text-sky-600 font-bold">Cảm biến 1: x₁ = {fmt(sensor1X, 1)}m (σ₁ = {fmt(sensor1Sigma, 1)}m)</div>
                  <div className="text-emerald-600 font-bold">Cảm biến 2: x₂ = {fmt(sensor2X, 1)}m (σ₂ = {fmt(sensor2Sigma, 1)}m)</div>
                  <div className="text-purple-600 font-extrabold text-sm border-t border-slate-200 dark:border-slate-700 pt-1">
                    Kết hợp: μ = {fmt(postMu, 2)}m (σ = {fmt(postStd, 2)}m)
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ClaySlider
                  label="Vị trí đo Cảm biến 1 (x₁)"
                  value={sensor1X}
                  min={-2}
                  max={4}
                  step={0.2}
                  color="blue"
                  onChange={setSensor1X}
                />
                <ClaySlider
                  label="Sai số Cảm biến 1 (σ₁)"
                  value={sensor1Sigma}
                  min={0.5}
                  max={3}
                  step={0.1}
                  color="blue"
                  onChange={setSensor1Sigma}
                />
                <ClaySlider
                  label="Vị trí đo Cảm biến 2 (x₂)"
                  value={sensor2X}
                  min={-2}
                  max={4}
                  step={0.2}
                  color="emerald"
                  onChange={setSensor2X}
                />
                <ClaySlider
                  label="Sai số Cảm biến 2 (σ₂)"
                  value={sensor2Sigma}
                  min={0.5}
                  max={3}
                  step={0.1}
                  color="emerald"
                  onChange={setSensor2Sigma}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BAYESIAN CREDIBLE INTERVAL
         ========================================================================= */}
      {activeTab === 'credible' && (
        <div className="space-y-6">
          <LabBriefing
            question="Khoảng Tin Cậy Bayes (Credible Interval) và Khoảng Tin Cậy Cổ Điển (Confidence Interval) khác nhau như thế nào về mặt triết học?"
            formula="P(L \le \theta \le U \mid \text{data}) = 1 - \alpha"
            mathExplanation="Trường phái Cổ điển coi tham số θ là HẰNG SỐ CỐ ĐỊNH, nên phát biểu 'xác suất để θ nằm trong khoảng là 95%' là SAI. Ngược lại, trường phái Bayes coi dữ liệu là cố định còn θ là BIẾN NGẪU NHIÊN tuân theo Posterior, do đó phát biểu 'xác suất θ nằm trong khoảng [L, U] đúng bằng 95%' là HOÀN TOÀN HỢP LỆ VÀ CHÍNH XÁC!"
            howToInteract={[
              "Chọn mức tin cậy: 90%, 95%, hoặc 99%.",
              "Quan sát vùng diện tích màu tím HPD (Highest Posterior Density) dưới đường cong Posterior.",
              "Đọc giá trị hai đầu mút [L, U] của khoảng tin cậy Bayes."
            ]}
            whatToObserve="Vùng tô màu tím chiếm đúng diện tích (1 - α) dưới hàm mật độ. Vùng này chứa các giá trị tham số θ có độ khả tín cao nhất trong mắt người quan sát!"
            takeaway="Khi bạn muốn khẳng định một khoảng chứa tham số với xác suất 95% theo nghĩa đen trực giác thông thường $\implies$ bạn đang dùng Khoảng tin cậy Bayes (Credible Interval)!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={`Khoảng Tin Cậy Bayes ${Math.round(credibleLevel * 100)}%: [${fmt(credLower, 3)}, ${fmt(credUpper, 3)}]`}
              formula={`P(${fmt(credLower, 3)} \\le \\theta \\le ${fmt(credUpper, 3)} \\mid \\text{data}) = ${Math.round(credibleLevel * 100)}\\%`}
              badge={`Posterior Beta(${alphaPost}, ${betaPost})`}
              onReset={() => setCredibleLevel(0.95)}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-3xl p-6 shadow-[3px_3px_0px_#0f172a] space-y-4">
                <div className="text-center">
                  <span className="text-xs font-heading font-black text-purple-600 uppercase tracking-wider">
                    Khoảng Tin Cậy Bayes (Highest Posterior Density - HPD)
                  </span>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white mt-1">
                    [{fmt(credLower, 3)} , {fmt(credUpper, 3)}]
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Độ rộng khoảng: Δ = {fmt(credUpper - credLower, 3)}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-slate-800 rounded-2xl border border-purple-200 dark:border-purple-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-purple-700 dark:text-purple-300">Ý nghĩa thực tế: </span>
                  Dựa trên niềm tin ban đầu và dữ liệu thu thập được ({headsK} lần ngửa / {trialsN} lần tung), ta tin chắc chắn tới <strong className="text-purple-600">{Math.round(credibleLevel * 100)}%</strong> rằng xác suất thực tế của đồng xu nằm gọn trong khoảng [{fmt(credLower, 3)}, {fmt(credUpper, 3)}].
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-md mx-auto flex justify-center gap-3">
                <ClayButton
                  variant={credibleLevel === 0.90 ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => setCredibleLevel(0.90)}
                >
                  90% Credible
                </ClayButton>
                <ClayButton
                  variant={credibleLevel === 0.95 ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => setCredibleLevel(0.95)}
                >
                  95% Credible
                </ClayButton>
                <ClayButton
                  variant={credibleLevel === 0.99 ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => setCredibleLevel(0.99)}
                >
                  99% Credible
                </ClayButton>
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 4: BASE RATE FALLACY
         ========================================================================= */}
      {activeTab === 'base-rate' && (
        <div className="space-y-6">
          <LabBriefing
            question="Một căn bệnh hiếm có tỷ lệ mắc chỉ 0.5% dân số. Một xét nghiệm y tế có độ chính xác lên tới 98% (độ nhạy) và chỉ nhầm 5% (dương tính giả). Nếu bạn đi xét nghiệm và nhận kết quả DƯƠNG TÍNH, xác suất thực sự bạn mắc bệnh là bao nhiêu?"
            formula="P(\text{Bệnh} \mid +) = \frac{P(\text{Bệnh}) \cdot P(+ \mid \text{Bệnh})}{P(\text{Bệnh})P(+ \mid \text{Bệnh}) + P(\text{Khỏe})P(+ \mid \text{Khỏe})}"
            mathExplanation="Trực giác con người luôn nghĩ mình có 98% nguy cơ mắc bệnh! Nhưng công thức Bayes chỉ ra rằng: Vì người khỏe đông gấp 200 lần người bệnh, nên 5% dương tính giả của số đông người khỏe sẽ áp đảo hoàn toàn số người bệnh thật!"
            howToInteract={[
              "Kéo slider 'Tỷ lệ mắc bệnh trong cộng đồng' từ 0.1% đến 3%.",
              "Kéo 'Độ nhạy của Test' và 'Độ đặc hiệu (Chính xác cho người khỏe)'.",
              "Nhìn xác suất mắc bệnh thực tế tính ra bên dưới."
            ]}
            whatToObserve="Khi bệnh hiếm (0.5%), dù test chính xác tới 98%, xác suất thực tế bạn bị bệnh khi có kết quả dương tính chỉ vỏn vẹn khoảng 8.9%! Đa số người nhận kết quả dương tính thực chất là DƯƠNG TÍNH GIẢ."
            takeaway="Đây là bài toán 'Kinh điển của Kinh điển' trong đề thi và y tế: Luôn nhớ nhân với tỷ lệ nền P(Disease). Bỏ quên tỷ lệ nền (Base Rate Fallacy) là sai lầm phổ biến nhất trong tư duy xác suất!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Khám Phá Ảo Giác Tỷ Lệ Nền: Nhận kết quả (+) có thực sự bị bệnh?"
              formula={`P(\\text{Bệnh} \\mid +) = ${fmt(pDiseaseGivenPos * 100, 1)}\\%`}
              badge={`Dương tính giả chiếm: ${fmt((1 - pDiseaseGivenPos) * 100, 1)}%`}
              onReset={() => { setBaseRateP(0.005); setSensitivity(0.98); setSpecificity(0.95); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-full max-w-2xl space-y-4">
                {/* Kết quả sốc */}
                <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400 dark:border-rose-800 rounded-3xl text-center space-y-1">
                  <span className="text-xs font-heading font-black text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                    Xác suất Thực sự Bị Bệnh khi nhận kết quả (+)
                  </span>
                  <div className="text-3xl sm:text-4xl font-heading font-black text-rose-600 dark:text-rose-400">
                    {fmt(pDiseaseGivenPos * 100, 1)}%
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Có tới <strong className="text-rose-600">{fmt((1 - pDiseaseGivenPos) * 100, 1)}%</strong> khả năng bạn hoàn toàn khỏe mạnh (Dương tính giả)!
                  </p>
                </div>

                {/* Minh họa 10,000 người */}
                <div className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-2xl space-y-2 text-xs font-mono">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Mô phỏng mẫu 10,000 người dân:
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span>Số người bệnh thật ({fmt(baseRateP * 100, 2)}%):</span>
                    <span className="font-bold text-rose-600">{Math.round(10000 * baseRateP)} người</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span>Người bệnh test (+) đúng ({fmt(sensitivity * 100, 0)}%):</span>
                    <span className="font-bold text-rose-600">{fmt(10000 * baseRateP * sensitivity, 1)} người</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span>Người khỏe test (+) nhầm ({fmt((1 - specificity) * 100, 0)}%):</span>
                    <span className="font-bold text-amber-600">{fmt(10000 * (1 - baseRateP) * (1 - specificity), 1)} người</span>
                  </div>
                  <div className="flex justify-between py-1 text-sky-600 font-bold">
                    <span>Tổng số ca (+) trong cộng đồng:</span>
                    <span>{fmt(10000 * pTotalPos, 1)} người</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <ClaySlider
                  label="Tỷ lệ mắc bệnh trong cộng đồng (P)"
                  sublabel="Bệnh càng hiếm, dương tính giả càng chiếm đa số"
                  value={baseRateP}
                  min={0.001}
                  max={0.03}
                  step={0.001}
                  color="rose"
                  onChange={setBaseRateP}
                />
                <ClaySlider
                  label="Độ nhạy của test (True Positive)"
                  sublabel="Xác suất test (+) khi người đó có bệnh thật"
                  value={sensitivity}
                  min={0.8}
                  max={0.99}
                  step={0.01}
                  color="blue"
                  onChange={setSensitivity}
                />
                <ClaySlider
                  label="Độ đặc hiệu của test (True Negative)"
                  sublabel="Xác suất test (-) khi người đó khỏe mạnh"
                  value={specificity}
                  min={0.8}
                  max={0.99}
                  step={0.01}
                  color="emerald"
                  onChange={setSpecificity}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
};
