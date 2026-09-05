import React, { useState, useEffect } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, randomNormal, standardNormalInv, studentTPdf, normalPdf } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';

interface IntervalData {
  id: number;
  sampleMean: number;
  lower: number;
  upper: number;
  covers: boolean;
}

export const ClassicalEstimation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ci' | 'student' | 'mle'>('ci');

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
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 10.1 — Ước lượng Thống kê Cổ điển
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            100 Khoảng Tin cậy (CI) & MLE
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('ci')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              activeTab === 'ci'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. 100 Khoảng tin cậy
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              activeTab === 'student'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Phân bố Student t
          </button>
          <button
            onClick={() => setActiveTab('mle')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              activeTab === 'mle'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. Đường cong MLE
          </button>
        </div>
      </div>

      {/* TAB 1: 100 CONFIDENCE INTERVALS */}
      {activeTab === 'ci' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
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

                {/* 100 Intervals */}
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
                    <span className="w-4 h-1 bg-emerald-500 rounded-full"></span> Xanh lá: Chứa tham số μ
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                    <span className="w-4 h-1 bg-rose-500 rounded-full"></span> Đỏ: Trượt khỏi tham số μ
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-0.5 bg-sky-600 border-dashed"></span> Vạch chuẩn μ = {trueMu}
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  {coveragePercent}% mẫu bao phủ thành công
                </div>
              </div>
            </div>
          </ClayCard>

          {/* 2. BẢNG TÙY CHỌN ĐIỀU CHỈNH THÔNG SỐ Ở DƯỚI (BOTTOM DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Cột 1: Mức tin cậy & Cỡ mẫu */}
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  1. Mức Tin Cậy & Cỡ Mẫu
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Tăng cỡ mẫu n làm khoảng CI hẹp lại, tăng (1-α) làm CI rộng ra:
                </p>
              </div>

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
              </div>
            </ClayCard>

            {/* Cột 2: Tham số & Sinh lại */}
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  2. Tham Số Tổng Thể
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Độ phân tán σ của tổng thể:
                </p>
              </div>

              <ClaySlider
                label="Độ lệch chuẩn sigma"
                value={trueSigma}
                min={5}
                max={25}
                step={1}
                color="blue"
                formatValue={(v) => `σ = ${v}`}
                onChange={setTrueSigma}
              />

              <ClayButton
                variant="primary"
                size="sm"
                className="w-full"
                onClick={generateIntervals}
              >
                Lấy 100 Khoảng Mới
              </ClayButton>
            </ClayCard>

            {/* Cột 3: Định nghĩa Tần suất */}
            <ClayCard className="p-5 space-y-2.5 flex flex-col justify-between">
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                3. Ý Nghĩa Trường Phái Cổ Điển
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                "Khoảng tin cậy 95%" <strong>không</strong> có nghĩa là tham số μ có xác suất 95% rơi vào khoảng, mà là: nếu lặp lại thí nghiệm 100 lần, thì trung bình có 95 khoảng sẽ bao bọc được tham số cố định μ!
              </p>
              <div className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                Thực nghiệm: {coveredCount}/100 trúng
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT T */}
      {activeTab === 'student' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Phân Bố Student t(ν) vs Chuẩn Tắc N(0, 1)"
              formula="T_n = \frac{\sqrt{n}(\bar{X} - \mu)}{s_n} \sim t(\nu)"
              badge={`Bậc tự do ν = ${degFreedom}`}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[420px]">
              <svg viewBox="0 0 800 320" className="w-full h-auto select-none">
                {/* Horizontal axis */}
                <line x1="60" y1="280" x2="740" y2="280" stroke="#0F172A" strokeWidth="2.5" />

                {/* Ticks from -4 to 4 */}
                {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((t) => {
                  const px = 400 + t * 75;
                  return (
                    <g key={`t-axis-${t}`}>
                      <line x1={px} y1="280" x2={px} y2="286" stroke="#0F172A" strokeWidth="2" />
                      <text x={px} y="302" textAnchor="middle" className="text-xs font-mono font-bold fill-slate-600">
                        {t}
                      </text>
                    </g>
                  );
                })}

                {/* Standard Normal N(0, 1) Curve - Orange */}
                {(() => {
                  const pts = [];
                  for (let x = -4; x <= 4; x += 0.1) {
                    const yVal = normalPdf(x, 0, 1);
                    const px = 400 + x * 75;
                    const py = 280 - yVal * 520;
                    pts.push(`${px},${py}`);
                  }
                  return (
                    <polyline
                      points={pts.join(' ')}
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="2.5"
                      strokeDasharray="5 3"
                    />
                  );
                })()}

                {/* Student t Curve - Blue */}
                {(() => {
                  const pts = [];
                  for (let x = -4; x <= 4; x += 0.1) {
                    const yVal = studentTPdf(x, degFreedom);
                    const px = 400 + x * 75;
                    const py = 280 - yVal * 520;
                    pts.push(`${px},${py}`);
                  }
                  return (
                    <polyline
                      points={pts.join(' ')}
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  );
                })()}
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-1 bg-sky-600 rounded-full"></span> Student t({degFreedom})
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-orange-600 dark:text-orange-400">
                    <span className="w-5 h-0.5 bg-orange-500 border-dashed"></span> Chuẩn tắc N(0, 1)
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  Khi ν ≥ 30: Student t tiệm cận hoàn toàn về Gauss N(0, 1)
                </div>
              </div>
            </div>
          </ClayCard>

          {/* 2. BẢNG THÔNG SỐ Ở DƯỚI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  1. Bậc Tự Do (ν = n - 1)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Kéo ν để quan sát hiện tượng đuôi dày (heavy tails) thu hẹp lại:
                </p>
              </div>

              <ClaySlider
                label="Bậc tự do nu"
                value={degFreedom}
                min={1}
                max={40}
                step={1}
                color="blue"
                formatValue={(v) => `ν = ${v}`}
                onChange={setDegFreedom}
              />
            </ClayCard>

            <ClayCard className="p-5 space-y-2 flex flex-col justify-between">
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                2. Khám Phá Của Gosset
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                William Sealy Gosset tìm ra phân bố này khi làm việc tại nhà máy bia Guinness. Khi cỡ mẫu n nhỏ, việc ước lượng phương sai bằng sₙ đưa thêm sai số ngẫu nhiên vào mẫu số, khiến đuôi phân bố dày hơn Gauss.
              </p>
            </ClayCard>

            <ClayCard className="p-5 space-y-2 flex flex-col justify-between">
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                3. Quy Luật Tiệm Cận
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                - Khi ν = 1, 2, 3: Đuôi dày giúp phản ánh đúng rủi ro và xác suất ngoại lai cao trong mẫu nhỏ.<br/>
                - Khi ν ≥ 30: Đồ thị màu xanh tiệm cận trùng khít lên đường đứt nét màu cam N(0, 1).
              </p>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 3: MLE CURVE */}
      {activeTab === 'mle' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Đường Cong Hàm Hợp Lý Cực Đại (MLE) & Điểm Đỉnh Tối Ưu"
              formula="\hat{\mu}_{MLE} = \bar{x} = \frac{1}{n}\sum_{i=1}^n x_i"
              badge={`Đỉnh μ = ${fmt(mleMean, 1)}`}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[420px]">
              <svg viewBox="0 0 800 320" className="w-full h-auto select-none">
                <line x1="60" y1="280" x2="740" y2="280" stroke="#0F172A" strokeWidth="2.5" />

                {/* Ticks 1 to 9 */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((t) => {
                  const px = 60 + ((t - 1) / 8) * 680;
                  return (
                    <g key={`mle-axis-${t}`}>
                      <line x1={px} y1="280" x2={px} y2="286" stroke="#0F172A" strokeWidth="2" />
                      <text x={px} y="302" textAnchor="middle" className="text-xs font-mono font-bold fill-slate-600">
                        {t}
                      </text>
                    </g>
                  );
                })}

                {/* Likelihood Curve */}
                {(() => {
                  const pts = [];
                  for (let mu = 1; mu <= 9; mu += 0.05) {
                    let logL = 0;
                    for (const x of mlePoints) {
                      logL += -0.5 * Math.pow(x - mu, 2);
                    }
                    const L = Math.exp(logL * 0.1);
                    const px = 60 + ((mu - 1) / 8) * 680;
                    const py = 280 - L * 230;
                    pts.push(`${px},${py}`);
                  }
                  return (
                    <polyline
                      points={pts.join(' ')}
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  );
                })()}

                {/* Peak MLE marker */}
                {(() => {
                  const peakX = 60 + ((mleMean - 1) / 8) * 680;
                  return (
                    <g>
                      <line
                        x1={peakX}
                        y1="50"
                        x2={peakX}
                        y2="280"
                        stroke="#EA580C"
                        strokeWidth="2.5"
                        strokeDasharray="5 3"
                      />
                      <circle
                        cx={peakX}
                        cy="50"
                        r="7"
                        fill="#EA580C"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                      />
                      <text
                        x={peakX}
                        y="35"
                        fill="#EA580C"
                        fontSize="13"
                        textAnchor="middle"
                        fontWeight="black"
                        className="font-mono"
                      >
                        μ_MLE = {fmt(mleMean, 1)} (Đỉnh cực đại)
                      </text>
                    </g>
                  );
                })()}
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-1 bg-sky-600 rounded-full"></span> Đường cong Hàm Hợp Lý L(μ)
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-orange-600 dark:text-orange-400">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span> Điểm cực đại MLE
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  Dữ liệu quan sát X = &#123;2, 4, 5, 7, 8&#125;
                </div>
              </div>
            </div>
          </ClayCard>

          {/* 2. BẢNG THÔNG SỐ Ở DƯỚI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ClayCard className="p-5 space-y-2 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mẫu Dữ Liệu</span>
              <h4 className="font-heading font-black text-lg text-slate-900 dark:text-white">5 Điểm Quan Sát</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Các giá trị mẫu ngẫu nhiên độc lập: 2, 4, 5, 7, 8 thu được từ phân bố chuẩn.
              </p>
              <div className="text-xl font-black font-mono text-slate-900 dark:text-white pt-1">
                x̄ = 5.2
              </div>
            </ClayCard>

            <ClayCard className="p-5 space-y-2 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Nguyên Lý MLE</span>
              <h4 className="font-heading font-black text-lg text-sky-600 dark:text-sky-400">Đạo Hàm Log-L = 0</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Tìm tham số μ sao cho xác suất làm xuất hiện mẫu dữ liệu này là lớn nhất có thể.
              </p>
              <div className="text-xl font-black font-mono text-sky-600 dark:text-sky-400 pt-1">
                μ̂_MLE = 5.2
              </div>
            </ClayCard>

            <ClayCard className="p-5 space-y-2 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Kết Luận Toán Học</span>
              <h4 className="font-heading font-black text-lg text-orange-600 dark:text-orange-400">Đỉnh Cực Đại Trùng Trung Bình</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Đồ thị hàm hợp lý đạt đỉnh chuẩn xác tại trung bình số học của các điểm quan sát, chứng minh tính không chệch và hiệu quả của ước lượng MLE.
              </p>
            </ClayCard>
          </div>
        </div>
      )}
    </div>
  );
};
