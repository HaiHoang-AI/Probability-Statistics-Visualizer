import React, { useState, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, betaPdf, normalPdf } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';

export const BayesianInference: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'beta-binomial' | 'sensor-fusion'>('beta-binomial');

  // Tab 1: Beta-Binomial State
  const [alphaPrior, setAlphaPrior] = useState<number>(2.0);
  const [betaPrior, setBetaPrior] = useState<number>(2.0);
  const [headsK, setHeadsK] = useState<number>(6);
  const [trialsN, setTrialsN] = useState<number>(10);

  // Posterior Beta parameters
  const alphaPost = alphaPrior + headsK;
  const betaPost = betaPrior + (trialsN - headsK);

  // Point Estimates: MAP vs LMS
  const thetaMap = (alphaPost - 1) / (alphaPost + betaPost - 2);
  const thetaLms = alphaPost / (alphaPost + betaPost);
  const sampleFreq = trialsN > 0 ? headsK / trialsN : 0.5;

  // Compute curve coordinates
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

  // Fusion posterior calculation
  const prec0 = 1 / (priorSigma * priorSigma);
  const prec1 = 1 / (sensor1Sigma * sensor1Sigma);
  const prec2 = 1 / (sensor2Sigma * sensor2Sigma);
  const totalPrec = prec0 + prec1 + prec2;
  const postVariance = 1 / totalPrec;
  const postStd = Math.sqrt(postVariance);
  const postMu = postVariance * (priorMu * prec0 + sensor1X * prec1 + sensor2X * prec2);

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
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              activeTab === 'beta-binomial'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Mô hình Beta - Nhị thức
          </button>
          <button
            onClick={() => setActiveTab('sensor-fusion')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              activeTab === 'sensor-fusion'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Hợp nhất Cảm biến Gauss
          </button>
        </div>
      </div>

      {/* TAB 1: BETA-BINOMIAL */}
      {activeTab === 'beta-binomial' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA */}
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
                      strokeWidth="2.2"
                    />
                    <circle cx={60 + thetaMap * 680} cy="40" r="5" fill="#EF4444" />
                    <text
                      x={60 + thetaMap * 680}
                      y="26"
                      fill="#EF4444"
                      fontSize="12"
                      textAnchor="middle"
                      fontWeight="black"
                      className="font-mono"
                    >
                      MAP = {fmt(thetaMap, 3)}
                    </text>
                  </g>
                )}

                {/* LMS Marker (Cyan line) */}
                {thetaLms >= 0 && thetaLms <= 1 && (
                  <g>
                    <line
                      x1={60 + thetaLms * 680}
                      y1="70"
                      x2={60 + thetaLms * 680}
                      y2="310"
                      stroke="#06B6D4"
                      strokeWidth="2.2"
                      strokeDasharray="4 2"
                    />
                    <circle cx={60 + thetaLms * 680} cy="70" r="5" fill="#06B6D4" />
                    <text
                      x={60 + thetaLms * 680}
                      y="58"
                      fill="#06B6D4"
                      fontSize="12"
                      textAnchor="middle"
                      fontWeight="black"
                      className="font-mono"
                    >
                      LMS = {fmt(thetaLms, 3)}
                    </text>
                  </g>
                )}
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="w-5 h-0.5 bg-indigo-500 border-dashed"></span> Prior Beta({fmt(alphaPrior, 1)}, {fmt(betaPrior, 1)})
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                    <span className="w-5 h-0.5 bg-amber-500 border-dashed"></span> Likelihood L(θ)
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

          {/* 2. BẢNG TÙY CHỌN ĐIỀU CHỈNH THÔNG SỐ Ở DƯỚI (BOTTOM DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Cột 1: Niềm tin Tiên nghiệm */}
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  1. Niềm Tin Tiên Nghiệm (Prior)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Điều chỉnh tham số giả định ban đầu α, β:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <ClaySlider
                  label="alpha"
                  value={alphaPrior}
                  min={1}
                  max={10}
                  step={0.5}
                  color="purple"
                  onChange={setAlphaPrior}
                />
                <ClaySlider
                  label="beta"
                  value={betaPrior}
                  min={1}
                  max={10}
                  step={0.5}
                  color="purple"
                  onChange={setBetaPrior}
                />
              </div>
            </ClayCard>

            {/* Cột 2: Quan sát thực nghiệm */}
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  2. Thử Nghiệm Tung Đồng Xu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Thu thập thêm bằng chứng dữ liệu để cập nhật:
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <ClayButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleFlip(1)}
                >
                  +1 Lần
                </ClayButton>
                <ClayButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleFlip(10)}
                >
                  +10 Lần
                </ClayButton>
                <ClayButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHeadsK(0);
                    setTrialsN(0);
                  }}
                >
                  Đặt lại
                </ClayButton>
              </div>
            </ClayCard>

            {/* Cột 3: Ước lượng Điểm MAP vs LMS */}
            <ClayCard className="p-5 space-y-2.5 flex flex-col justify-between">
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                3. Ước Lượng Điểm Bayes
              </h3>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex justify-between items-center">
                  <span className="font-bold text-rose-800 dark:text-rose-300">Đỉnh MAP (Mode):</span>
                  <span className="text-base font-black text-rose-600">{fmt(thetaMap, 3)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-800 flex justify-between items-center">
                  <span className="font-bold text-cyan-800 dark:text-cyan-300">Kỳ vọng LMS (Mean):</span>
                  <span className="text-base font-black text-cyan-600">{fmt(thetaLms, 3)}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Khi dữ liệu n tăng lớn, ảnh hưởng của Prior mờ dần và Posterior co cụm chặt chẽ quanh tần suất mẫu k/n.
              </p>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 2: SENSOR FUSION */}
      {activeTab === 'sensor-fusion' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA */}
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

          {/* 2. BẢNG THÔNG SỐ Ở DƯỚI (BOTTOM DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                  min={0.3}
                  max={2}
                  step={0.1}
                  color="emerald"
                  onChange={setSensor2Sigma}
                />
              </div>
            </ClayCard>

            <ClayCard className="p-5 space-y-2.5 flex flex-col justify-between">
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                3. Hiệu Quả Hợp Nhất
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Độ chính xác hậu nghiệm bằng tổng các độ chính xác (Precision = 1/σ²). Do đó, phương sai hậu nghiệm <strong>luôn nhỏ hơn</strong> phương sai của bất kỳ cảm biến nào đứng riêng lẻ!
              </p>
              <div className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 pt-1">
                Precision: {fmt(totalPrec, 2)} &gt; Max({fmt(prec1, 2)}, {fmt(prec2, 2)})
              </div>
            </ClayCard>
          </div>
        </div>
      )}
    </div>
  );
};
