import React, { useState, useEffect } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, randomNormal, standardNormalInv, studentTPdf, normalPdf } from '../../../utils/math';

interface IntervalData {
  id: number;
  sampleMean: number;
  lower: number;
  upper: number;
  covers: boolean;
}

export const ClassicalEstimation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ci' | 'mle' | 'student'>('ci');

  // Tab 1: Confidence Interval Coverage State
  const [trueMu, setTrueMu] = useState<number>(50);
  const [trueSigma, setTrueSigma] = useState<number>(10);
  const [sampleSizeN, setSampleSizeN] = useState<number>(25);
  const [confLevel, setConfLevel] = useState<number>(0.95);
  const [intervals, setIntervals] = useState<IntervalData[]>([]);

  // Generate 100 simulated intervals
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

  // Tab 3: MLE Interactive Data points
  const [mlePoints, setMlePoints] = useState<number[]>([2, 4, 5, 7, 8]);
  const mleMean = mlePoints.length > 0 ? mlePoints.reduce((a, b) => a + b, 0) / mlePoints.length : 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-sky-500/10 border-2 border-blue-200 dark:border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            MAT1101 Bài 10.1 — Ước lượng Thống kê Cổ điển (Classical Estimation)
          </span>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-0.5">
            100 Khoảng Tin cậy (Confidence Intervals) & MLE
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Khắc phục ngộ nhận lớn nhất của sinh viên: Tham số <MathView math="\mu" /> đứng yên cố định, chỉ có các khoảng tin cậy ngẫu nhiên nhảy qua nhảy lại!
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('ci')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all ${
              activeTab === 'ci'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            1. 100 Khoảng tin cậy
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all ${
              activeTab === 'student'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            2. Phân bố Student t
          </button>
          <button
            onClick={() => setActiveTab('mle')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all ${
              activeTab === 'mle'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            3. Đường cong MLE
          </button>
        </div>
      </div>

      {/* TAB 1: 100 CONFIDENCE INTERVALS */}
      {activeTab === 'ci' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <ClayCard glowColor="blue">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-3">
                Thiết lập Tham số Mẫu
              </h3>

              <div className="space-y-3">
                <ClaySlider
                  label="Mức tin cậy (1 - alpha)"
                  value={confLevel * 100}
                  min={80}
                  max={99}
                  step={1}
                  color="blue"
                  formatValue={(v) => `${v}%`}
                  onChange={(v) => setConfLevel(v / 100)}
                />

                <ClaySlider
                  label="Cỡ mẫu n"
                  value={sampleSizeN}
                  min={5}
                  max={100}
                  step={5}
                  color="blue"
                  formatValue={(v) => `n = ${v}`}
                  onChange={setSampleSizeN}
                />

                <ClaySlider
                  label="Tham số thực mu"
                  value={trueMu}
                  min={30}
                  max={70}
                  step={1}
                  color="blue"
                  onChange={setTrueMu}
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <ClayButton
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={generateIntervals}
                >
                  Lấy mẫu lại 100 Bộ mới
                </ClayButton>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs space-y-2">
                <span className="font-bold text-blue-950 dark:text-blue-200">
                  Định nghĩa Tần suất (Frequentist):
                </span>
                <p className="text-blue-900 dark:text-blue-300">
                  "Khoảng tin cậy 95%" <strong>không</strong> có nghĩa là tham số <MathView math="\mu" /> có 95% xác suất nằm trong khoảng, mà có nghĩa: nếu ta lặp lại thí nghiệm 100 lần, thì trung bình có 95 khoảng bao trọn được <MathView math="\mu" /> cố định!
                </p>
              </div>
            </ClayCard>
          </div>

          {/* Visualization: 100 Intervals Stacked */}
          <div className="lg:col-span-2">
            <ClayCard glowColor="blue" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100">
                  100 Khoảng Tin cậy Xếp chồng Độc lập
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold font-mono">
                    Trúng: {coveredCount}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold font-mono">
                    Trượt: {100 - coveredCount}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-500 text-white font-bold font-mono shadow-sm">
                    {coveragePercent}%
                  </span>
                </div>
              </div>

              <div className="w-full h-88 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-3 flex flex-col justify-between">
                <svg viewBox="0 0 400 300" className="w-full h-full">
                  {/* Vertical line for true mu */}
                  <line x1="200" y1="5" x2="200" y2="295" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 2" />
                  <text x="200" y="12" fill="#FFFFFF" fontSize="9" textAnchor="middle" fontWeight="bold">
                    μ = {trueMu} (Cố định)
                  </text>

                  {/* 100 Intervals */}
                  {intervals.map((it, idx) => {
                    const y = 20 + idx * 2.7;
                    const x1 = 200 + (it.lower - trueMu) * 6;
                    const x2 = 200 + (it.upper - trueMu) * 6;
                    const strokeColor = it.covers ? '#10B981' : '#EF4444';

                    return (
                      <g key={it.id}>
                        <line x1={x1} y1={y} x2={x2} y2={y} stroke={strokeColor} strokeWidth="1.8" />
                        {!it.covers && (
                          <circle cx={(x1 + x2) / 2} cy={y} r="2" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.5" />
                        )}
                      </g>
                    );
                  })}
                </svg>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span className="text-emerald-400 font-semibold">● Màu xanh: Chứa tham số μ</span>
                  <span className="text-red-400 font-semibold">● Màu đỏ: Trượt khỏi tham số μ</span>
                  <span className="font-mono text-blue-300">
                    CI = <MathView math="\left[\bar{x} - z \frac{\sigma}{\sqrt{n}}, \bar{x} + z \frac{\sigma}{\sqrt{n}}\right]" />
                  </span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT T */}
      {activeTab === 'student' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <ClayCard glowColor="blue">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
                Phân bố Student t
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Khi chưa biết phương sai <MathView math="\sigma^2" /> và cỡ mẫu nhỏ, ta thay bằng phương sai mẫu hiệu chỉnh <MathView math="s_n" />. Thống kê tuân theo phân bố Student với <MathView math="\nu = n - 1" /> bậc tự do.
              </p>

              <ClaySlider
                label="Bậc tự do nu (Degrees of freedom)"
                value={degFreedom}
                min={1}
                max={40}
                step={1}
                color="blue"
                formatValue={(v) => `nu = ${v}`}
                onChange={setDegFreedom}
              />

              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Quy luật tiệm cận:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  - Khi <MathView math="\nu = 1, 2, 3" />: Đuôi phân bố Student rất <strong>dày</strong> (heavy tails), phản ánh sự không chắc chắn cao.
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  - Khi <MathView math="\nu \ge 30" />: Đường màu xanh lam trùng khít hoàn toàn với đường Gauss chuẩn tắc <MathView math="\mathcal{N}(0, 1)" />!
                </p>
              </div>
            </ClayCard>
          </div>

          <div className="lg:col-span-2">
            <ClayCard glowColor="blue" className="p-6">
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>So sánh Đường cong Student t(ν) vs Chuẩn tắc N(0, 1)</span>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold">
                  Bậc tự do ν = {degFreedom}
                </span>
              </h4>

              <div className="w-full h-80 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between">
                <svg viewBox="-4 0 8 0.5" className="w-full h-full">
                  <line x1="-4" y1="0.48" x2="4" y2="0.48" stroke="#475569" strokeWidth="0.005" />

                  {/* Standard Normal N(0, 1) Reference line */}
                  <path
                    d={Array.from({ length: 120 }, (_, i) => {
                      const x = -4 + (i / 120) * 8;
                      const y = 0.48 - normalPdf(x, 0, 1);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="0.015"
                    strokeDasharray="0.04 0.02"
                  />

                  {/* Student t(nu) Curve */}
                  <path
                    d={Array.from({ length: 120 }, (_, i) => {
                      const x = -4 + (i / 120) * 8;
                      const y = 0.48 - studentTPdf(x, degFreedom);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="#3B82F6"
                    strokeWidth="0.02"
                  />
                </svg>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                      <span className="w-3 h-1 bg-blue-500 rounded-sm"></span> Student t({degFreedom})
                    </span>
                    <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                      <span className="w-3 h-0.5 bg-orange-500 border-dashed"></span> Chuẩn tắc N(0, 1)
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    <MathView math="T_n = \frac{\sqrt{n}(\bar{X} - \mu)}{s_n} \sim t(n-1)" />
                  </span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 3: MLE CURVE */}
      {activeTab === 'mle' && (
        <ClayCard glowColor="blue" className="p-6">
          <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 mb-2">
            Đường cong Hàm Hợp lý Cực đại (MLE) & Điểm Đỉnh Tối ưu
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
            Dữ liệu mẫu quan sát: <MathView math="X = \{2, 4, 5, 7, 8\}" />. Hàm hợp lý cực đại đạt đỉnh chính xác tại trung bình mẫu <MathView math="\hat{\mu}_{MLE} = \bar{x} = 5.2" />!
          </p>

          <div className="w-full h-72 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between">
            <svg viewBox="0 0 500 200" className="w-full h-full">
              <line x1="30" y1="180" x2="470" y2="180" stroke="#475569" strokeWidth="2" />

              {/* Likelihood Curve */}
              {(() => {
                const pts = [];
                for (let mu = 1; mu <= 9; mu += 0.1) {
                  let logL = 0;
                  for (const x of mlePoints) {
                    logL += -0.5 * Math.pow(x - mu, 2);
                  }
                  const L = Math.exp(logL * 0.1);
                  const px = 30 + ((mu - 1) / 8) * 440;
                  const py = 180 - L * 150;
                  pts.push(`${px},${py}`);
                }
                return (
                  <polyline
                    points={pts.join(' ')}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="3.5"
                  />
                );
              })()}

              {/* Peak MLE marker */}
              <line
                x1={30 + ((mleMean - 1) / 8) * 440}
                y1="30"
                x2={30 + ((mleMean - 1) / 8) * 440}
                y2="180"
                stroke="#F97316"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <circle
                cx={30 + ((mleMean - 1) / 8) * 440}
                cy="30"
                r="5"
                fill="#F97316"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              <text
                x={30 + ((mleMean - 1) / 8) * 440}
                y="20"
                fill="#F97316"
                fontSize="11"
                textAnchor="middle"
                fontWeight="bold"
              >
                μ_MLE = {fmt(mleMean, 1)}
              </text>
            </svg>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span className="text-sky-400">Đường cong Log-Likelihood L(μ)</span>
              <span className="font-mono text-orange-400">
                <MathView math="\hat{\mu}_n = \frac{1}{n}\sum_{i=1}^n x_i" />
              </span>
            </div>
          </div>
        </ClayCard>
      )}
    </div>
  );
};
