import React, { useState, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, betaPdf, normalPdf } from '../../../utils/math';
import { Coins, Sparkles, Cpu, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

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
      // Normalized likelihood for visual comparison
      const rawLikelihood = Math.pow(x, headsK) * Math.pow(1 - x, trialsN - headsK);
      pts.push({ x, prior: priorVal, post: postVal, rawLikelihood });
    }

    const maxPost = Math.max(...pts.map((p) => p.post), 1);
    const maxPrior = Math.max(...pts.map((p) => p.prior), 1);
    const maxLike = Math.max(...pts.map((p) => p.rawLikelihood), 1e-8);

    return pts.map((p) => ({
      x: p.x,
      priorNorm: (p.prior / Math.max(maxPost, maxPrior)) * 160,
      postNorm: (p.post / maxPost) * 160,
      likeNorm: (p.rawLikelihood / maxLike) * 120,
    }));
  }, [alphaPrior, betaPrior, alphaPost, betaPost, headsK, trialsN]);

  // Flip coin helper
  const handleFlip = (count = 1) => {
    let newHeads = 0;
    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.7) newHeads++; // Coin with true p = 0.7
    }
    setHeadsK((k) => k + newHeads);
    setTrialsN((n) => n + count);

    if (count >= 10) {
      confetti({ particleCount: 20, spread: 50 });
    }
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
      <div className="p-4 rounded-3xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border-2 border-violet-200 dark:border-violet-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            MAT1101 Bài 9 — Suy luận thống kê theo trường phái Bayes (Bayesian Inference)
          </span>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-0.5">
            Cập nhật Niềm tin Hậu nghiệm & Ước lượng MAP vs LMS
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            "Hôm nay bạn tin điều gì phụ thuộc vào niềm tin hôm qua (Prior) cộng với dữ liệu quan sát hôm nay (Likelihood)."
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('beta-binomial')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'beta-binomial'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Coins size={14} /> 1. Mô hình Beta - Nhị thức
          </button>
          <button
            onClick={() => setActiveTab('sensor-fusion')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'sensor-fusion'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Cpu size={14} /> 2. Hợp nhất Cảm biến Gauss
          </button>
        </div>
      </div>

      {/* TAB 1: BETA-BINOMIAL */}
      {activeTab === 'beta-binomial' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <ClayCard glowColor="purple">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
                🪙 Niềm tin Ban đầu (Prior Beta)
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-3">
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

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">
                  Dữ liệu Quan sát (k lần Ngửa / n lần Tung)
                </h4>

                <div className="flex gap-2">
                  <ClayButton
                    variant="purple"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleFlip(1)}
                    icon={<Coins size={14} />}
                  >
                    Tung +1 lần
                  </ClayButton>
                  <ClayButton
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleFlip(10)}
                  >
                    Tung +10 lần
                  </ClayButton>
                  <ClayButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setHeadsK(0);
                      setTrialsN(0);
                    }}
                    icon={<RotateCcw size={14} />}
                  />
                </div>

                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-1 font-mono">
                  <div className="text-purple-700 dark:text-purple-300 font-bold">
                    Số lần ngửa: {headsK} / {trialsN} (Tần suất = {fmt(sampleFreq, 2)})
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Posterior: Beta({fmt(alphaPost, 1)}, {fmt(betaPost, 1)})
                  </div>
                  <div className="text-rose-600 dark:text-rose-400 font-bold">
                    Đỉnh MAP θ_hat = {fmt(thetaMap, 3)}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 font-bold">
                    Kỳ vọng LMS θ_hat = {fmt(thetaLms, 3)}
                  </div>
                </div>
              </div>
            </ClayCard>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-2">
            <ClayCard glowColor="purple" className="p-6">
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>So sánh Prior vs Likelihood vs Posterior Beta(α, β)</span>
                <span className="text-xs px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono font-bold">
                  {trialsN} Lần Quan Sát
                </span>
              </h4>

              <div className="w-full h-80 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between">
                <svg viewBox="0 0 500 200" className="w-full h-full">
                  {/* Axis */}
                  <line x1="30" y1="180" x2="470" y2="180" stroke="#475569" strokeWidth="2" />
                  <text x="30" y="195" fill="#94A3B8" fontSize="10" textAnchor="middle">0.0</text>
                  <text x="250" y="195" fill="#94A3B8" fontSize="10" textAnchor="middle">0.5</text>
                  <text x="470" y="195" fill="#94A3B8" fontSize="10" textAnchor="middle">1.0</text>

                  {/* Prior Curve (Dashed Sky Blue) */}
                  <polyline
                    points={curvePoints
                      .map((p) => `${30 + p.x * 440},${180 - p.priorNorm}`)
                      .join(' ')}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />

                  {/* Likelihood Curve (Orange) */}
                  <polyline
                    points={curvePoints
                      .map((p) => `${30 + p.x * 440},${180 - p.likeNorm}`)
                      .join(' ')}
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />

                  {/* Posterior Curve (Solid Purple Thick) */}
                  <polyline
                    points={curvePoints
                      .map((p) => `${30 + p.x * 440},${180 - p.postNorm}`)
                      .join(' ')}
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="3.5"
                  />

                  {/* MAP Marker (Red line) */}
                  {thetaMap >= 0 && thetaMap <= 1 && (
                    <g>
                      <line
                        x1={30 + thetaMap * 440}
                        y1="20"
                        x2={30 + thetaMap * 440}
                        y2="180"
                        stroke="#EF4444"
                        strokeWidth="2"
                      />
                      <circle cx={30 + thetaMap * 440} cy="20" r="4" fill="#EF4444" />
                      <text
                        x={30 + thetaMap * 440}
                        y="12"
                        fill="#EF4444"
                        fontSize="10"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        MAP
                      </text>
                    </g>
                  )}

                  {/* LMS Marker (Blue line) */}
                  {thetaLms >= 0 && thetaLms <= 1 && (
                    <g>
                      <line
                        x1={30 + thetaLms * 440}
                        y1="40"
                        x2={30 + thetaLms * 440}
                        y2="180"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        strokeDasharray="3 2"
                      />
                      <text
                        x={30 + thetaLms * 440}
                        y="35"
                        fill="#3B82F6"
                        fontSize="10"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        LMS
                      </text>
                    </g>
                  )}
                </svg>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sky-400">
                      <span className="w-3 h-0.5 bg-sky-400 border-dashed"></span> Prior
                    </span>
                    <span className="flex items-center gap-1 text-orange-400">
                      <span className="w-3 h-0.5 bg-orange-400 border-dashed"></span> Likelihood
                    </span>
                    <span className="flex items-center gap-1 text-purple-400 font-bold">
                      <span className="w-3 h-1 bg-purple-500 rounded-sm"></span> Posterior
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-mono text-[11px]">
                      MAP = {fmt(thetaMap, 2)}
                    </span>
                    <span className="text-blue-400 font-mono text-[11px]">
                      LMS = {fmt(thetaLms, 2)}
                    </span>
                  </div>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 2: SENSOR FUSION */}
      {activeTab === 'sensor-fusion' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <ClayCard glowColor="purple">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
                📡 Cấu hình Cảm biến
              </h3>

              <div className="space-y-3">
                <ClaySlider
                  label="Ước lượng gốc (Prior mu)"
                  value={priorMu}
                  min={-3}
                  max={3}
                  step={0.5}
                  color="purple"
                  onChange={setPriorMu}
                />
                <ClaySlider
                  label="Sai số Cảm biến 1 (sigma1)"
                  value={sensor1Sigma}
                  min={0.5}
                  max={3}
                  step={0.1}
                  color="orange"
                  onChange={setSensor1Sigma}
                />
                <ClaySlider
                  label="Sai số Cảm biến 2 (sigma2)"
                  value={sensor2Sigma}
                  min={0.3}
                  max={2}
                  step={0.1}
                  color="emerald"
                  onChange={setSensor2Sigma}
                />
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1 font-mono">
                <div className="text-indigo-900 dark:text-indigo-200 font-bold">
                  Hợp nhất Hậu nghiệm N(m, v):
                </div>
                <div className="text-indigo-700 dark:text-indigo-300">
                  Vị trí trung bình m = {fmt(postMu, 2)}
                </div>
                <div className="text-indigo-700 dark:text-indigo-300">
                  Độ lệch chuẩn sigma_post = {fmt(postStd, 2)}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
                  Phương sai hậu nghiệm <MathView math="v = 1/\sum (1/\sigma_i^2)" /> luôn <strong>nhỏ hơn</strong> mọi cảm biến riêng lẻ!
                </p>
              </div>
            </ClayCard>
          </div>

          <div className="lg:col-span-2">
            <ClayCard glowColor="purple" className="p-6">
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>Hình chuông Cảm biến riêng lẻ vs Chuông Hậu nghiệm Co hẹp</span>
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                  σ_post = {fmt(postStd, 2)}
                </span>
              </h4>

              <div className="w-full h-80 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between">
                <svg viewBox="-5 0 10 1" className="w-full h-full">
                  <line x1="-5" y1="0.95" x2="5" y2="0.95" stroke="#475569" strokeWidth="0.01" />

                  {/* Prior Bell Curve */}
                  <path
                    d={Array.from({ length: 100 }, (_, i) => {
                      const x = -5 + (i / 100) * 10;
                      const y = 0.95 - normalPdf(x, priorMu, priorSigma) * 0.8;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="0.02"
                    strokeDasharray="0.04 0.02"
                  />

                  {/* Sensor 1 Bell Curve */}
                  <path
                    d={Array.from({ length: 100 }, (_, i) => {
                      const x = -5 + (i / 100) * 10;
                      const y = 0.95 - normalPdf(x, sensor1X, sensor1Sigma) * 0.8;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="0.02"
                  />

                  {/* Sensor 2 Bell Curve */}
                  <path
                    d={Array.from({ length: 100 }, (_, i) => {
                      const x = -5 + (i / 100) * 10;
                      const y = 0.95 - normalPdf(x, sensor2X, sensor2Sigma) * 0.8;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="0.02"
                  />

                  {/* Posterior Bell Curve (Very Tall & Narrow!) */}
                  <path
                    d={Array.from({ length: 100 }, (_, i) => {
                      const x = -5 + (i / 100) * 10;
                      const y = 0.95 - Math.min(0.9, normalPdf(x, postMu, postStd) * 0.8);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="rgba(168, 85, 247, 0.25)"
                    stroke="#A855F7"
                    strokeWidth="0.035"
                  />
                </svg>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Prior</span>
                    <span className="text-orange-400">Cảm biến 1</span>
                    <span className="text-emerald-400">Cảm biến 2</span>
                    <span className="text-purple-400 font-bold">Hậu nghiệm Hợp nhất</span>
                  </div>
                  <span className="text-purple-300 font-mono">
                    Độ chính xác tăng: 1/v = {fmt(totalPrec, 2)}
                  </span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}
    </div>
  );
};
