import React, { useState, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';

interface Point {
  id: number;
  x: number;
  y: number;
}

export const LinearRegression: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ols' | 'r2' | 'leverage' | 'residuals'>('ols');
  const [showSquares, setShowSquares] = useState<boolean>(true);

  // Initial data points for Tab 1 & 2
  const [points, setPoints] = useState<Point[]>([
    { id: 1, x: 1.0, y: 1.8 },
    { id: 2, x: 2.5, y: 3.8 },
    { id: 3, x: 4.0, y: 4.5 },
    { id: 4, x: 5.5, y: 6.8 },
    { id: 5, x: 7.0, y: 7.2 },
    { id: 6, x: 8.5, y: 9.0 },
  ]);

  const [manualSlope, setManualSlope] = useState<number>(0.8);
  const [manualIntercept, setManualIntercept] = useState<number>(1.0);

  // Tab 3: Outliers & Leverage State
  const [outlierX, setOutlierX] = useState<number>(8.5);
  const [outlierY, setOutlierY] = useState<number>(2.0);

  // Tab 4: Residual Diagnostics State
  const [diagPattern, setDiagPattern] = useState<'homoscedastic' | 'nonlinear' | 'heteroscedastic'>('homoscedastic');

  // Calculate Optimal OLS using closed-form formula
  const olsParams = useMemo(() => {
    const n = points.length;
    if (n === 0) return { slope: 0, intercept: 0, meanX: 0, meanY: 0 };
    const meanX = points.reduce((acc, p) => acc + p.x, 0) / n;
    const meanY = points.reduce((acc, p) => acc + p.y, 0) / n;

    let num = 0;
    let den = 0;
    for (const p of points) {
      num += (p.x - meanX) * (p.y - meanY);
      den += (p.x - meanX) ** 2;
    }

    const slope = den !== 0 ? num / den : 0;
    const intercept = meanY - slope * meanX;
    return { slope, intercept, meanX, meanY };
  }, [points]);

  // Calculate RSS, TSS, MSS, R2
  const { rss, tss, mss, rSquared, rmse } = useMemo(() => {
    const n = points.length;
    if (n === 0) return { rss: 0, tss: 0, mss: 0, rSquared: 0, rmse: 0 };

    const meanY = points.reduce((acc, p) => acc + p.y, 0) / n;
    let currentRss = 0;
    let currentTss = 0;

    for (const p of points) {
      const yHat = manualSlope * p.x + manualIntercept;
      currentRss += (p.y - yHat) ** 2;
      currentTss += (p.y - meanY) ** 2;
    }

    const currentMss = Math.max(0, currentTss - currentRss);
    const r2 = currentTss > 0 ? Math.max(0, 1 - currentRss / currentTss) : 0;
    const currentRmse = Math.sqrt(currentRss / n);

    return {
      rss: currentRss,
      tss: currentTss,
      mss: currentMss,
      rSquared: r2,
      rmse: currentRmse,
    };
  }, [points, manualSlope, manualIntercept]);

  const handleAutoFit = () => {
    setManualSlope(olsParams.slope);
    setManualIntercept(olsParams.intercept);
  };

  const handleAddOutlier = () => {
    const newId = points.length > 0 ? Math.max(...points.map((p) => p.id)) + 1 : 1;
    setPoints([...points, { id: newId, x: 8.5, y: 1.5 }]);
  };

  const handleReset = () => {
    setPoints([
      { id: 1, x: 1.0, y: 1.8 },
      { id: 2, x: 2.5, y: 3.8 },
      { id: 3, x: 4.0, y: 4.5 },
      { id: 4, x: 5.5, y: 6.8 },
      { id: 5, x: 7.0, y: 7.2 },
      { id: 6, x: 8.5, y: 9.0 },
    ]);
    setManualSlope(0.8);
    setManualIntercept(1.0);
  };

  // Map mathematical coordinates [0, 10] to SVG [80, 740] x [360, 50]
  const mapX = (x: number) => 80 + (x / 10) * 660;
  const mapY = (y: number) => 360 - (y / 10) * 310;

  // Leverage calculation for Tab 3
  const leveragePoints = useMemo(() => {
    const basePts = [
      { id: 1, x: 2.0, y: 2.2 },
      { id: 2, x: 3.0, y: 3.5 },
      { id: 3, x: 4.0, y: 4.1 },
      { id: 4, x: 5.0, y: 5.2 },
      { id: 5, x: 6.0, y: 6.0 },
      { id: 6, x: outlierX, y: outlierY },
    ];
    const n = basePts.length;
    const mx = basePts.reduce((a, b) => a + b.x, 0) / n;
    const my = basePts.reduce((a, b) => a + b.y, 0) / n;
    let num = 0, den = 0;
    for (const p of basePts) {
      num += (p.x - mx) * (p.y - my);
      den += (p.x - mx) ** 2;
    }
    const sl = den !== 0 ? num / den : 0;
    const ic = my - sl * mx;

    // Baseline fit without outlier (points 1-5)
    const base5 = basePts.slice(0, 5);
    const mx5 = base5.reduce((a, b) => a + b.x, 0) / 5;
    const my5 = base5.reduce((a, b) => a + b.y, 0) / 5;
    let num5 = 0, den5 = 0;
    for (const p of base5) {
      num5 += (p.x - mx5) * (p.y - my5);
      den5 += (p.x - mx5) ** 2;
    }
    const sl5 = den5 !== 0 ? num5 / den5 : 0;
    const ic5 = my5 - sl5 * mx5;

    // Cook's distance approximation
    const distFromMean = (outlierX - mx) ** 2 / (den || 1);
    const res = outlierY - (sl * outlierX + ic);
    const cookD = (res ** 2 * distFromMean) / (2 * 1.0);

    return { pts: basePts, slope: sl, intercept: ic, baseSlope: sl5, baseIntercept: ic5, cookD, mx, my };
  }, [outlierX, outlierY]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 11 — Hồi quy Tuyến tính (Linear Regression)
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Bình phương Cực tiểu OLS, Hệ số R² & Bắt bệnh Phần dư
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('ols')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'ols'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Mô hình OLS & Hình vuông Sai số
          </button>
          <button
            onClick={() => setActiveTab('r2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'r2'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Phân rã TSS = MSS + RSS (R²)
          </button>
          <button
            onClick={() => setActiveTab('leverage')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'leverage'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. Ngoại Lai & Đòn Bẩy (Cook's D)
          </button>
          <button
            onClick={() => setActiveTab('residuals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'residuals'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            4. Bắt Bệnh Đồ Thị Phần Dư
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OLS RESIDUAL SQUARES
         ========================================================================= */}
      {activeTab === 'ols' && (
        <div className="space-y-6">
          <LabBriefing
            question="Tại sao phương pháp này lại có tên là 'Bình phương Cực tiểu Thông thường' (Ordinary Least Squares - OLS)? Các hình vuông màu xanh/đỏ trên đồ thị biểu diễn đại lượng vật lý gì?"
            formula="\min_{\beta_0, \beta_1} \sum_{i=1}^n e_i^2 = \min_{\beta_0, \beta_1} \sum_{i=1}^n (y_i - (\beta_0 + \beta_1 x_i))^2"
            mathExplanation="Sai số phần dư e_i là khoảng cách DỌC từ điểm dữ liệu thực tế đến đường thẳng dự báo. Khi ta vẽ hình vuông có cạnh bằng e_i, tổng diện tích của tất cả các hình vuông này chính là RSS! Đường OLS tối ưu là đường thẳng duy nhất làm cho TỔNG DIỆN TÍCH CÁC HÌNH VUÔNG ĐẠT CỰC TIỂU!"
            howToInteract={[
              "Kéo slider 'Hệ số góc (Slope β₁)' và 'Hệ số chặn (Intercept β₀)' để xoay và tịnh tiến đường thẳng.",
              "Quan sát các hình vuông màu đỏ co giãn kích thước theo thời gian thực.",
              "Bấm nút '🎯 Khớp Nghiệm Tối Ưu OLS' để xem đường thẳng tự động khóa vào vị trí cực tiểu hóa RSS."
            ]}
            whatToObserve="Khi bạn xoay đường thẳng trượt xa khỏi đám mây điểm, các hình vuông phình to khổng lồ (RSS tăng vọt). Chỉ khi khớp đúng nghiệm OLS, tổng diện tích mới co về mức nhỏ nhất có thể!"
            takeaway="OLS chỉ cực tiểu hóa sai số theo phương DỌC (trục Y), chứ không phải khoảng cách vuông góc hình học tới đường thẳng!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Mặt phẳng Toạ độ Desmos & Bình phương Phần dư OLS"
              formula={`y = ${fmt(manualSlope, 2)}x + ${fmt(manualIntercept, 2)}`}
              badge={`RSS = ${fmt(rss, 2)}`}
              onReset={handleReset}
              extraActions={
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-heading font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={showSquares}
                      onChange={(e) => setShowSquares(e.target.checked)}
                      className="rounded text-sky-600 accent-sky-600"
                    />
                    <span>Hiện ô vuông RSS</span>
                  </label>
                  <ClayButton variant="primary" size="sm" onClick={handleAutoFit}>
                    🎯 Khớp OLS Tối Ưu
                  </ClayButton>
                </div>
              }
            />

            {/* FULL DESMOS VIEWPORT DIRECTLY ON GRID */}
            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 420" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-ols-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-ols-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Mathematical Grid lines & tick numbers */}
                {[0, 2, 4, 6, 8, 10].map((v) => (
                  <g key={`grid-ols-x-${v}`}>
                    <line
                      x1={mapX(v)}
                      y1={mapY(0)}
                      x2={mapX(v)}
                      y2={mapY(10)}
                      stroke="rgba(148, 163, 184, 0.25)"
                      strokeWidth="1"
                    />
                    <text
                      x={mapX(v)}
                      y={mapY(0) + 18}
                      textAnchor="middle"
                      className="text-[11px] font-mono font-bold fill-slate-500 dark:fill-slate-400"
                    >
                      {v}
                    </text>
                  </g>
                ))}

                {[0, 2, 4, 6, 8, 10].map((v) => (
                  <g key={`grid-ols-y-${v}`}>
                    <line
                      x1={mapX(0)}
                      y1={mapY(v)}
                      x2={mapX(10)}
                      y2={mapY(v)}
                      stroke="rgba(148, 163, 184, 0.25)"
                      strokeWidth="1"
                    />
                    <text
                      x={mapX(0) - 12}
                      y={mapY(v) + 4}
                      textAnchor="end"
                      className="text-[11px] font-mono font-bold fill-slate-500 dark:fill-slate-400"
                    >
                      {v}
                    </text>
                  </g>
                ))}

                {/* Desmos 3D Red X Axis */}
                <line
                  x1={mapX(0)}
                  y1={mapY(0)}
                  x2={mapX(10) + 20}
                  y2={mapY(0)}
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-ols-x)"
                />
                <text x={mapX(10) + 30} y={mapY(0) + 5} className="text-xs font-mono font-black fill-red-500">
                  X
                </text>

                {/* Desmos 3D Green Y Axis */}
                <line
                  x1={mapX(0)}
                  y1={mapY(0)}
                  x2={mapX(0)}
                  y2={mapY(10) - 20}
                  stroke="#10B981"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-ols-y)"
                />
                <text x={mapX(0) - 5} y={mapY(10) - 28} className="text-xs font-mono font-black fill-emerald-500">
                  Y
                </text>

                {/* Optimal OLS reference line (dashed light slate) */}
                <line
                  x1={mapX(0)}
                  y1={mapY(olsParams.intercept)}
                  x2={mapX(10)}
                  y2={mapY(olsParams.slope * 10 + olsParams.intercept)}
                  stroke="#94A3B8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />

                {/* Interactive Regression Line: y = manualSlope * x + manualIntercept */}
                <line
                  x1={mapX(0)}
                  y1={mapY(manualIntercept)}
                  x2={mapX(10)}
                  y2={mapY(manualSlope * 10 + manualIntercept)}
                  stroke="#0284C7"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Residual Squares and Vertical Stems */}
                {points.map((p) => {
                  const yHat = manualSlope * p.x + manualIntercept;
                  const px = mapX(p.x);
                  const py = mapY(p.y);
                  const pyHat = mapY(yHat);
                  const diffY = Math.abs(py - pyHat);

                  return (
                    <g key={`point-ols-${p.id}`}>
                      {/* Geometric square representing residual^2 */}
                      {showSquares && diffY > 2 && (
                        <rect
                          x={px}
                          y={Math.min(py, pyHat)}
                          width={diffY}
                          height={diffY}
                          fill="rgba(239, 68, 68, 0.22)"
                          stroke="#EF4444"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          rx="2"
                        />
                      )}

                      {/* Vertical line stem */}
                      <line
                        x1={px}
                        y1={py}
                        x2={px}
                        y2={pyHat}
                        stroke="#EF4444"
                        strokeWidth="2.5"
                      />

                      {/* Data point dot */}
                      <circle
                        cx={px}
                        cy={py}
                        r="6.5"
                        fill="#F59E0B"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        className="cursor-pointer transition-all hover:r-8"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                    <span className="w-3 h-3 bg-amber-500 rounded-full border border-white"></span> Điểm dữ liệu (x, y)
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-1 bg-sky-600 rounded-full"></span> Đường OLS ŷ = β₁x + β₀
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-500">
                    <span className="w-5 h-0.5 border-t-2 border-dashed border-slate-400"></span> Nghiệm tối ưu OLS
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                    <span className="w-3.5 h-3.5 border-2 border-dashed border-rose-500 bg-rose-500/20 rounded-xs"></span> Ô vuông RSS (eᵢ²)
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  {points.length} Điểm mẫu | R² = {fmt(rSquared * 100, 1)}%
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Cột 1: Sliders xoay đường thẳng */}
                <ClayCard className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-1">
                      1. Xoay Thử Đường Thẳng
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      Điều chỉnh hệ số góc và hệ số chặn:
                    </p>
                  </div>
                  <div className="space-y-3">
                    <ClaySlider
                      label="Hệ số góc (Slope β₁)"
                      value={manualSlope}
                      min={-0.5}
                      max={2.0}
                      step={0.05}
                      color="blue"
                      formatValue={(v) => fmt(v, 2)}
                      onChange={setManualSlope}
                    />
                    <ClaySlider
                      label="Hệ số chặn (Intercept β₀)"
                      value={manualIntercept}
                      min={-2}
                      max={5}
                      step={0.1}
                      color="purple"
                      formatValue={(v) => fmt(v, 1)}
                      onChange={setManualIntercept}
                    />
                  </div>
                </ClayCard>

                {/* Cột 2: Thao tác & Tối ưu hóa */}
                <ClayCard className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-1">
                      2. Thao Tác Mô Phỏng
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      Thử nghiệm độ nhạy OLS với điểm ngoại lai:
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    <ClayButton
                      variant="primary"
                      size="md"
                      className="w-full"
                      onClick={handleAutoFit}
                    >
                      🎯 Khớp Nghiệm Tối Ưu OLS
                    </ClayButton>
                    <div className="grid grid-cols-2 gap-2">
                      <ClayButton
                        variant="outline"
                        size="sm"
                        onClick={handleAddOutlier}
                      >
                        + Ngoại lai
                      </ClayButton>
                      <ClayButton
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                      >
                        Đặt lại
                      </ClayButton>
                    </div>
                  </div>
                </ClayCard>

                {/* Cột 3: Chỉ số đo lường thực nghiệm */}
                <ClayCard className="p-4 space-y-2.5 flex flex-col justify-between">
                  <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    3. Chỉ Số Kiểm Chứng OLS
                  </h3>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex justify-between items-center">
                      <span className="font-bold text-rose-800 dark:text-rose-300">Tổng RSS (Phần dư):</span>
                      <span className="text-base font-black text-rose-600 dark:text-rose-400">{fmt(rss, 2)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex justify-between items-center">
                      <span className="font-bold text-sky-800 dark:text-sky-300">Hệ số xác định R²:</span>
                      <span className="text-base font-black text-sky-600 dark:text-sky-400">{fmt(rSquared * 100, 1)}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Sai số RMSE:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{fmt(rmse, 2)}</span>
                    </div>
                  </div>
                </ClayCard>
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 2: R-SQUARED & ANOVA DECOMPOSITION
         ========================================================================= */}
      {activeTab === 'r2' && (
        <div className="space-y-6">
          <LabBriefing
            question="Hệ số xác định R² (R-squared) đo lường điều gì? Tại sao người ta nói 'R² = 85% nghĩa là mô hình giải thích được 85% sự biến thiên của Y'?"
            formula="TSS = MSS + RSS \implies R^2 = \frac{MSS}{TSS} = 1 - \frac{RSS}{TSS} \in [0, 1]"
            mathExplanation="TSS là tổng độ phân tán của Y quanh trung bình mẫu ȳ. Khi kẻ đường hồi quy OLS, một phần biến thiên được đường thẳng giải thích (MSS = Model Sum of Squares), phần còn lại là sai số ngẫu nhiên không giải thích được (RSS = Residual Sum of Squares)."
            howToInteract={[
              "Bấm nút '🎯 Tự động Fit OLS' để đưa mô hình về trạng thái tối ưu.",
              "Kéo lệch hệ số góc β₁ và hệ số chặn β₀ ở thanh điều khiển để xem R² tụt dốc.",
              "Nhìn hình học phân rã vector dọc trên đồ thị và thanh tỷ lệ TSS bên dưới."
            ]}
            whatToObserve="Khi đường thẳng khớp hoàn hảo qua các điểm, RSS = 0 $\implies$ R² = 1.0 (100%). Khi đường thẳng nằm ngang ở trung bình ȳ, R² = 0!"
            takeaway="R² luôn nằm trong đoạn [0, 1] đối với mô hình OLS có hệ số chặn: Càng gần 1, mô hình càng giải thích tốt biến phụ thuộc Y!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Phân Rã Biến Thiên Toàn Phần: TSS = MSS + RSS"
              formula="R^2 = 1 - \frac{RSS}{TSS} = \frac{MSS}{TSS}"
              badge={`R² = ${fmt(rSquared * 100, 1)}%`}
              extraActions={
                <ClayButton variant="primary" size="sm" onClick={handleAutoFit}>
                  🎯 Khớp OLS Tối Ưu
                </ClayButton>
              }
            />

            {/* FULL DESMOS VIEWPORT DIRECTLY ON GRID */}
            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              {/* ANOVA Geometry SVG */}
              <svg viewBox="0 0 800 300" className="w-full h-auto select-none">
                {/* Horizontal line for sample mean ȳ */}
                <line
                  x1={mapX(0)}
                  y1={mapY(olsParams.meanY)}
                  x2={mapX(10)}
                  y2={mapY(olsParams.meanY)}
                  stroke="#94A3B8"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                <text
                  x={mapX(10) + 10}
                  y={mapY(olsParams.meanY) + 4}
                  className="text-xs font-mono font-bold fill-slate-500"
                >
                  ȳ = {fmt(olsParams.meanY, 2)}
                </text>

                {/* Regression Line */}
                <line
                  x1={mapX(0)}
                  y1={mapY(manualIntercept)}
                  x2={mapX(10)}
                  y2={mapY(manualSlope * 10 + manualIntercept)}
                  stroke="#0284C7"
                  strokeWidth="3"
                />

                {/* Stems for each point */}
                {points.map((p) => {
                  const yHat = manualSlope * p.x + manualIntercept;
                  const px = mapX(p.x);
                  const py = mapY(p.y);
                  const pyHat = mapY(yHat);
                  const pyMean = mapY(olsParams.meanY);

                  return (
                    <g key={`decomp-${p.id}`}>
                      {/* MSS stem: from yMean to yHat (Sky) */}
                      <line
                        x1={px - 3}
                        y1={pyMean}
                        x2={px - 3}
                        y2={pyHat}
                        stroke="#0284C7"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* RSS stem: from yHat to py (Rose) */}
                      <line
                        x1={px + 3}
                        y1={pyHat}
                        x2={px + 3}
                        y2={py}
                        stroke="#EF4444"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* Point dot */}
                      <circle cx={px} cy={py} r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
                    </g>
                  );
                })}

                {/* Explanatory callout for Point 4 */}
                {(() => {
                  const p4 = points[3] || points[0];
                  const yHat4 = manualSlope * p4.x + manualIntercept;
                  const px = mapX(p4.x);
                  const pyHat = mapY(yHat4);
                  return (
                    <g transform={`translate(${px + 15}, ${pyHat - 20})`}>
                      <rect x="0" y="0" width="160" height="42" rx="6" fill="#0F172A" opacity="0.85" />
                      <text x="8" y="16" fill="#38BDF8" fontSize="10" fontWeight="bold" className="font-mono">
                        Xanh: MSS (ŷᵢ - ȳ)
                      </text>
                      <text x="8" y="32" fill="#F87171" fontSize="10" fontWeight="bold" className="font-mono">
                        Đỏ: RSS (yᵢ - ŷᵢ)
                      </text>
                    </g>
                  );
                })()}
              </svg>

              {/* Large Stacked Bar for TSS = MSS + RSS */}
              <div className="space-y-3 max-w-4xl mx-auto w-full pt-2">
                <div className="flex justify-between items-end text-xs sm:text-sm font-heading font-black">
                  <span className="text-sky-600 dark:text-sky-400">
                    Phần Giải Thích Được (MSS): {fmt(mss, 2)} ({fmt(rSquared * 100, 1)}%)
                  </span>
                  <span className="text-rose-600 dark:text-rose-400">
                    Phần Sai Số Dư (RSS): {fmt(rss, 2)} ({fmt((1 - rSquared) * 100, 1)}%)
                  </span>
                </div>

                <div className="w-full h-12 rounded-2xl overflow-hidden flex border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_#0f172a] font-mono text-xs sm:text-sm font-black text-white">
                  <div
                    style={{ width: `${Math.max(6, Math.round(rSquared * 100))}%` }}
                    className="bg-sky-600 flex items-center justify-center transition-all duration-300 px-2"
                  >
                    MSS: {fmt(rSquared * 100, 1)}%
                  </div>
                  <div
                    style={{ width: `${Math.max(6, Math.round((1 - rSquared) * 100))}%` }}
                    className="bg-rose-500 flex items-center justify-center transition-all duration-300 px-2"
                  >
                    RSS: {fmt((1 - rSquared) * 100, 1)}%
                  </div>
                </div>

                <div className="flex justify-between text-[11px] font-mono font-bold text-slate-500">
                  <span>0%</span>
                  <span>Tổng Biến Thiên TSS = {fmt(tss, 2)} (100%)</span>
                  <span>100%</span>
                </div>
              </div>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs mt-2">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-1 bg-sky-600 rounded-full"></span> MSS (Mô hình giải thích)
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                    <span className="w-5 h-1 bg-rose-500 rounded-full"></span> RSS (Phần dư ngẫu nhiên)
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-500">
                    <span className="w-5 h-0.5 border-t-2 border-dashed border-slate-400"></span> Trung bình ȳ
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  R² = MSS / TSS = {fmt(rSquared, 4)}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <ClayCard className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-1">
                      1. Tinh Chỉnh Đường Hồi Quy
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">Kéo để thấy sự co giãn giữa MSS và RSS:</p>
                  </div>
                  <div className="space-y-3">
                    <ClaySlider
                      label="Hệ số góc β₁"
                      value={manualSlope}
                      min={-0.5}
                      max={2.0}
                      step={0.05}
                      color="blue"
                      formatValue={(v) => fmt(v, 2)}
                      onChange={setManualSlope}
                    />
                    <ClaySlider
                      label="Hệ số chặn β₀"
                      value={manualIntercept}
                      min={-2}
                      max={5}
                      step={0.1}
                      color="purple"
                      formatValue={(v) => fmt(v, 1)}
                      onChange={setManualIntercept}
                    />
                  </div>
                </ClayCard>

                <ClayCard className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-1">
                      2. Thao Tác OLS
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">Đưa R² về giá trị cực đại có thể đạt:</p>
                  </div>
                  <ClayButton variant="primary" size="md" className="w-full" onClick={handleAutoFit}>
                    🎯 Khớp OLS Tối Ưu (Max R²)
                  </ClayButton>
                </ClayCard>

                <ClayCard className="p-4 space-y-2.5 flex flex-col justify-between">
                  <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    3. Bảng ANOVA Tổng Hợp
                  </h3>
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span>Tổng TSS:</span>
                      <span className="font-bold">{fmt(tss, 2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800 text-sky-600">
                      <span>Mô hình MSS:</span>
                      <span className="font-bold">{fmt(mss, 2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800 text-rose-600">
                      <span>Phần dư RSS:</span>
                      <span className="font-bold">{fmt(rss, 2)}</span>
                    </div>
                  </div>
                </ClayCard>
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 3: OUTLIERS & HIGH LEVERAGE
         ========================================================================= */}
      {activeTab === 'leverage' && (
        <div className="space-y-6">
          <LabBriefing
            question="Một điểm ngoại lai (Outlier) có sức mạnh bẻ cong đường hồi quy đến mức nào? Khoảng cách Cook's Distance đo lường 'đòn bẩy' của điểm dị biệt ra sao?"
            formula="D_i = \frac{\sum_{j=1}^n (\hat{y}_j - \hat{y}_{j(i)})^2}{2 s^2} \approx \frac{e_i^2}{2 s^2} \cdot \frac{h_{ii}}{(1 - h_{ii})^2}"
            mathExplanation="Điểm ngoại lai có 2 loại: Outlier theo trục Y (phần dư lớn) và Leverage theo trục X (nằm xa trung bình x̄). Khi một điểm VỪA nằm xa x̄ (cánh tay đòn dài) VỪA lệch khỏi đường hồi quy, nó sẽ như một chiếc cờ lê khổng lồ bẻ gãy hoàn toàn chiều dốc của OLS!"
            howToInteract={[
              "Kéo slider 'Hoành độ X (Cánh tay đòn)' từ 3.5 đến 9.5.",
              "Kéo slider 'Tung độ Y của điểm ngoại lai' lên hoặc xuống.",
              "Quan sát đường thẳng màu đỏ bị kéo gập xuống và chỉ số Cook's D nhảy vọt qua ngưỡng 0.5!"
            ]}
            whatToObserve="Khi x = 4.0 (ở giữa đám mây), dù bạn kéo y rất cao hay thấp, đường hồi quy hầu như không đổi độ dốc. Nhưng khi bạn kéo x ra mép xa (x = 9.0) và hạ thấp y, đường thẳng lập tức bị xoay gập từ đồng biến thành nghịch biến!"
            takeaway="Bài học đắt giá trong khoa học dữ liệu: Phải luôn kiểm tra các điểm High Leverage (Khoảng cách Cook D > 0.5) trước khi đưa ra kết luận hồi quy!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={`Khảo Sát Đòn Bẩy & Điểm Ngoại Lai: Cook's D = ${fmt(leveragePoints.cookD, 2)}`}
              formula={`\\hat{y} = ${fmt(leveragePoints.slope, 2)}x + ${fmt(leveragePoints.intercept, 2)}`}
              badge={leveragePoints.cookD > 0.5 ? 'NGUY HIỂM: BẺ GÃY MÔ HÌNH (D > 0.5)' : 'ẢNH HƯỞNG NHẸ (D ≤ 0.5)'}
              onReset={() => { setOutlierX(8.5); setOutlierY(2.0); }}
            />

            {/* FULL DESMOS VIEWPORT DIRECTLY ON GRID */}
            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 380" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-lev-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-lev-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Coordinate mapping for Tab 3: X in [0, 10], Y in [0, 8] */}
                {(() => {
                  const toX = (x: number) => 80 + (x / 10) * 660;
                  const toY = (y: number) => 330 - (y / 8) * 270;

                  return (
                    <>
                      {/* Grid lines and tick numbers */}
                      {[0, 2, 4, 6, 8, 10].map((v) => (
                        <g key={`lev-x-${v}`}>
                          <line
                            x1={toX(v)}
                            y1={toY(0)}
                            x2={toX(v)}
                            y2={toY(8)}
                            stroke="rgba(148, 163, 184, 0.25)"
                            strokeWidth="1"
                          />
                          <text
                            x={toX(v)}
                            y={toY(0) + 18}
                            textAnchor="middle"
                            className="text-[11px] font-mono font-bold fill-slate-500 dark:fill-slate-400"
                          >
                            {v}
                          </text>
                        </g>
                      ))}

                      {[0, 2, 4, 6, 8].map((v) => (
                        <g key={`lev-y-${v}`}>
                          <line
                            x1={toX(0)}
                            y1={toY(v)}
                            x2={toX(10)}
                            y2={toY(v)}
                            stroke="rgba(148, 163, 184, 0.25)"
                            strokeWidth="1"
                          />
                          <text
                            x={toX(0) - 12}
                            y={toY(v) + 4}
                            textAnchor="end"
                            className="text-[11px] font-mono font-bold fill-slate-500 dark:fill-slate-400"
                          >
                            {v}
                          </text>
                        </g>
                      ))}

                      {/* Red X Axis */}
                      <line
                        x1={toX(0)}
                        y1={toY(0)}
                        x2={toX(10) + 20}
                        y2={toY(0)}
                        stroke="#EF4444"
                        strokeWidth="2.5"
                        markerEnd="url(#arrow-lev-x)"
                      />
                      <text x={toX(10) + 30} y={toY(0) + 5} className="text-xs font-mono font-black fill-red-500">
                        X
                      </text>

                      {/* Green Y Axis */}
                      <line
                        x1={toX(0)}
                        y1={toY(0)}
                        x2={toX(0)}
                        y2={toY(8) - 15}
                        stroke="#10B981"
                        strokeWidth="2.5"
                        markerEnd="url(#arrow-lev-y)"
                      />
                      <text x={toX(0) - 5} y={toY(8) - 22} className="text-xs font-mono font-black fill-emerald-500">
                        Y
                      </text>

                      {/* Baseline OLS (without outlier) dashed line */}
                      <line
                        x1={toX(0)}
                        y1={toY(leveragePoints.baseIntercept)}
                        x2={toX(10)}
                        y2={toY(leveragePoints.baseSlope * 10 + leveragePoints.baseIntercept)}
                        stroke="#94A3B8"
                        strokeWidth="2.5"
                        strokeDasharray="6 4"
                      />

                      {/* Actual OLS line (with outlier) */}
                      <line
                        x1={toX(0)}
                        y1={toY(leveragePoints.intercept)}
                        x2={toX(10)}
                        y2={toY(leveragePoints.slope * 10 + leveragePoints.intercept)}
                        stroke={leveragePoints.cookD > 0.5 ? '#E11D48' : '#0284C7'}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Fulcrum centroid marker (mx, my) */}
                      <circle cx={toX(leveragePoints.mx)} cy={toY(leveragePoints.my)} r="7" fill="none" stroke="#64748B" strokeWidth="2" strokeDasharray="2 2" />
                      <text x={toX(leveragePoints.mx)} y={toY(leveragePoints.my) - 12} fontSize="10" textAnchor="middle" fill="#64748B" className="font-mono font-bold">
                        Tâm (x̄, ȳ)
                      </text>

                      {/* Base Points (1 to 5) */}
                      {leveragePoints.pts.slice(0, 5).map((p) => (
                        <circle key={`bp-${p.id}`} cx={toX(p.x)} cy={toY(p.y)} r="6" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
                      ))}

                      {/* Interactive Outlier Point */}
                      <circle
                        cx={toX(outlierX)}
                        cy={toY(outlierY)}
                        r="14"
                        fill="none"
                        stroke={leveragePoints.cookD > 0.5 ? '#E11D48' : '#F59E0B'}
                        strokeWidth="2"
                        opacity="0.6"
                      />
                      <circle
                        cx={toX(outlierX)}
                        cy={toY(outlierY)}
                        r="8"
                        fill={leveragePoints.cookD > 0.5 ? '#E11D48' : '#F59E0B'}
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                      />

                      {/* Outlier coordinates badge */}
                      <g transform={`translate(${toX(outlierX)}, ${toY(outlierY) - 22})`}>
                        <rect x="-65" y="-12" width="130" height="20" rx="5" fill="#0F172A" opacity="0.9" />
                        <text x="0" y="2" textAnchor="middle" fill="#FECDD3" fontSize="10" fontWeight="bold" className="font-mono">
                          ({fmt(outlierX, 1)}, {fmt(outlierY, 1)}) | D={fmt(leveragePoints.cookD, 2)}
                        </text>
                      </g>
                    </>
                  );
                })()}
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-3 h-3 bg-sky-600 rounded-full"></span> 5 Điểm gốc
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                    <span className="w-3.5 h-3.5 bg-rose-600 rounded-full border border-white"></span> Điểm ngoại lai (Outlier)
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-500">
                    <span className="w-5 h-0.5 border-t-2 border-dashed border-slate-400"></span> OLS ban đầu (không có ngoại lai)
                  </span>
                  <span className={`flex items-center gap-1.5 font-bold ${leveragePoints.cookD > 0.5 ? 'text-rose-600' : 'text-sky-600'}`}>
                    <span className={`w-5 h-1 rounded-full ${leveragePoints.cookD > 0.5 ? 'bg-rose-600' : 'bg-sky-600'}`}></span> OLS hiện tại
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  Cook's D = {fmt(leveragePoints.cookD, 2)} {leveragePoints.cookD > 0.5 ? '(Nguy hiểm)' : '(An toàn)'}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <ClayCard className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-1">
                      1. Hoành Độ X (Cánh Tay Đòn)
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">X càng xa x̄ ≈ 4.0, đòn bẩy càng lớn:</p>
                  </div>
                  <ClaySlider
                    label="Hoành độ X của điểm ngoại lai"
                    value={outlierX}
                    min={3.5}
                    max={9.5}
                    step={0.2}
                    color="rose"
                    formatValue={(v) => `X = ${fmt(v, 1)}`}
                    onChange={setOutlierX}
                  />
                </ClayCard>

                <ClayCard className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-1">
                      2. Tung Độ Y (Sai Số Ngoại Lai)
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">Kéo lệch khỏi đường xu thế:</p>
                  </div>
                  <ClaySlider
                    label="Tung độ Y của điểm ngoại lai"
                    value={outlierY}
                    min={0.5}
                    max={8.0}
                    step={0.2}
                    color="purple"
                    formatValue={(v) => `Y = ${fmt(v, 1)}`}
                    onChange={setOutlierY}
                  />
                </ClayCard>

                <ClayCard className="p-4 space-y-2.5 flex flex-col justify-between">
                  <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    3. Đánh Giá Khoảng Cách Cook
                  </h3>
                  <div className={`p-3 rounded-xl border-2 ${
                    leveragePoints.cookD > 0.5 ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-800 dark:text-rose-200' : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-200'
                  }`}>
                    <div className="font-heading font-black text-sm">
                      {leveragePoints.cookD > 0.5 ? '⚠️ BẺ GÃY MÔ HÌNH (D > 0.5)' : '✅ ẢNH HƯỞNG NHẸ (D ≤ 0.5)'}
                    </div>
                    <div className="text-xs font-mono mt-1">
                      D = {fmt(leveragePoints.cookD, 2)}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Khi D &gt; 0.5 (hoặc &gt; 4/n), điểm ngoại lai có tính hủy diệt, làm sai lệch toàn bộ ước lượng tham số!
                  </p>
                </ClayCard>
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 4: RESIDUAL DIAGNOSTICS
         ========================================================================= */}
      {activeTab === 'residuals' && (
        <div className="space-y-6">
          <LabBriefing
            question="Làm sao để biết mô hình hồi quy tuyến tính của ta có đạt chuẩn hay đã vi phạm các giả thiết Gauss-Markov? Đồ thị phần dư (Residual Plot) tiết lộ những căn bệnh gì của dữ liệu?"
            formula="e_i = y_i - \hat{y}_i \quad \text{vẽ theo } \hat{y}_i"
            mathExplanation="Nếu mô hình tốt, các điểm phần dư e_i phải phân tán hoàn toàn NGẪU NHIÊN trong một dải ngang đồng đều quanh trục 0 (đồng phương sai Homoscedasticity). Nếu phần dư uốn hình chữ U (thiếu biến bậc 2) hoặc xòe hình loa kèn (phương sai thay đổi Heteroscedasticity), mô hình đã bị bệnh!"
            howToInteract={[
              "Chọn 1 trong 3 trạng thái: Chuẩn tắc (Tốt), Phi tuyến (Chữ U), hoặc Loa kèn (Heteroscedasticity).",
              "Nhìn đồ thị phần dư e_i ở bên dưới để học cách 'bắt bệnh'."
            ]}
            whatToObserve="Ở mô hình Loa kèn: Càng về bên phải, các chấm phần dư càng xòe rộng ra. Điều này làm cho khoảng tin cậy và kiểm định t-test không còn đáng tin cậy nữa!"
            takeaway="Kỹ năng làm bài thi và phân tích thực tế: Không bao giờ tin tưởng mù quáng vào R² cao mà phải luôn vẽ đồ thị phần dư để kiểm tra giả thiết đồng phương sai!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Bắt Bệnh Mô Hình Qua Đồ Thị Phần Dư (Residual Diagnostics Plot)"
              formula="e_i = y_i - \hat{y}_i"
              badge={diagPattern === 'homoscedastic' ? 'MÔ HÌNH CHUẨN TẮC (TỐT)' : diagPattern === 'nonlinear' ? 'BỆNH: QUAN HỆ PHI TUYẾN' : 'BỆNH: PHƯƠNG SAI THAY ĐỔI'}
              onReset={() => setDiagPattern('homoscedastic')}
            />

            {/* FULL DESMOS VIEWPORT DIRECTLY ON GRID */}
            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-res-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-res-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Central zero baseline e = 0 at y = 180 */}
                <line x1="70" y1="180" x2="740" y2="180" stroke="#0284C7" strokeWidth="2.5" strokeDasharray="6 4" />

                {/* Vertical Axis at x = 70 */}
                <line x1="70" y1="330" x2="70" y2="30" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-res-y)" />
                <text x="60" y="24" className="text-xs font-mono font-black fill-emerald-500">
                  Phần dư e
                </text>

                {/* Horizontal Axis arrow */}
                <line x1="70" y1="180" x2="750" y2="180" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrow-res-x)" />
                <text x="760" y="184" className="text-xs font-mono font-black fill-red-500">
                  ŷ
                </text>

                {/* Ticks on vertical axis */}
                {[-60, -30, 0, 30, 60].map((v) => (
                  <g key={`res-tick-${v}`}>
                    <line x1="65" y1={180 - v * 1.8} x2="75" y2={180 - v * 1.8} stroke="#94A3B8" strokeWidth="1" />
                    <text x="58" y={184 - v * 1.8} textAnchor="end" className="text-[10px] font-mono font-bold fill-slate-500">
                      {v}
                    </text>
                  </g>
                ))}

                {/* Envelope Boundary Curves based on pattern */}
                {diagPattern === 'homoscedastic' && (
                  <>
                    <line x1="80" y1="90" x2="730" y2="90" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
                    <line x1="80" y1="270" x2="730" y2="270" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
                    <text x="735" y="94" fontSize="10" fill="#10B981" className="font-mono">+2s (Đồng đều)</text>
                    <text x="735" y="274" fontSize="10" fill="#10B981" className="font-mono">-2s</text>
                  </>
                )}

                {diagPattern === 'nonlinear' && (
                  <path
                    d={Array.from({ length: 60 }, (_, i) => {
                      const t = i / 59;
                      const x = 90 + t * 640;
                      const norm = (t - 0.5) * 2;
                      const y = 180 - (norm * norm - 0.5) * 110;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                  />
                )}

                {diagPattern === 'heteroscedastic' && (
                  <>
                    {/* Top expanding envelope */}
                    <line x1="90" y1="170" x2="730" y2="60" stroke="#E11D48" strokeWidth="2" strokeDasharray="4 4" />
                    {/* Bottom expanding envelope */}
                    <line x1="90" y1="190" x2="730" y2="300" stroke="#E11D48" strokeWidth="2" strokeDasharray="4 4" />
                    <text x="735" y="65" fontSize="10" fill="#E11D48" className="font-mono">Loa kèn xòe rộng</text>
                  </>
                )}

                {/* 35 Synthetic Scatter Points for current pattern */}
                {(() => {
                  const pts: { x: number; y: number; err: number }[] = [];
                  // Deterministic pseudo-random sequence for stability
                  for (let i = 1; i <= 32; i++) {
                    const t = i / 33;
                    const x = 90 + t * 640;
                    let err = Math.sin(i * 12.345) * 35;

                    if (diagPattern === 'nonlinear') {
                      const norm = (t - 0.5) * 2;
                      err = (norm * norm - 0.45) * 65 + Math.sin(i * 8.76) * 15;
                    } else if (diagPattern === 'heteroscedastic') {
                      const spread = 8 + t * 65;
                      err = Math.sin(i * 9.87) * spread;
                    }
                    pts.push({ x, y: 180 - err * 1.8, err });
                  }

                  return pts.map((p, idx) => (
                    <g key={`res-pt-${idx}`}>
                      {/* Vertical drop stem to zero */}
                      <line x1={p.x} y1="180" x2={p.x} y2={p.y} stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1.5" />
                      {/* Point circle */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="5"
                        fill={
                          diagPattern === 'homoscedastic'
                            ? '#10B981'
                            : diagPattern === 'nonlinear'
                            ? '#F59E0B'
                            : '#E11D48'
                        }
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                    </g>
                  ));
                })()}
              </svg>

              {/* HUD Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-0.5 border-t-2 border-dashed border-sky-600"></span> Trục cân bằng e = 0
                  </span>
                  <span className={`flex items-center gap-1.5 font-bold ${
                    diagPattern === 'homoscedastic' ? 'text-emerald-600' : diagPattern === 'nonlinear' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    <span className="w-3 h-3 rounded-full border border-white" style={{
                      backgroundColor: diagPattern === 'homoscedastic' ? '#10B981' : diagPattern === 'nonlinear' ? '#F59E0B' : '#E11D48'
                    }}></span> Điểm phần dư (ŷᵢ, eᵢ)
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kiểm định White / Breusch-Pagan: {diagPattern === 'homoscedastic' ? 'p = 0.42 (Đạt chuẩn)' : diagPattern === 'nonlinear' ? 'p = 0.002 (Bác bỏ)' : 'p < 0.001 (Vi phạm nghiêm trọng)'}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <ClayCard className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white mb-1">
                      1. Chọn Dạng Phân Tán Phần Dư
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">Thử nghiệm 3 tình huống thực tế:</p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setDiagPattern('homoscedastic')}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-heading font-bold border-2 transition-all text-left flex justify-between items-center cursor-pointer ${
                        diagPattern === 'homoscedastic'
                          ? 'bg-emerald-600 text-white border-slate-900 shadow-[2px_2px_0px_#0f172a]'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <span>1. Chuẩn Tắc (Đồng phương sai)</span>
                      <span>✅</span>
                    </button>
                    <button
                      onClick={() => setDiagPattern('nonlinear')}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-heading font-bold border-2 transition-all text-left flex justify-between items-center cursor-pointer ${
                        diagPattern === 'nonlinear'
                          ? 'bg-amber-600 text-white border-slate-900 shadow-[2px_2px_0px_#0f172a]'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <span>2. Phi Tuyến (U-shape Parabola)</span>
                      <span>⚠️</span>
                    </button>
                    <button
                      onClick={() => setDiagPattern('heteroscedastic')}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-heading font-bold border-2 transition-all text-left flex justify-between items-center cursor-pointer ${
                        diagPattern === 'heteroscedastic'
                          ? 'bg-rose-600 text-white border-slate-900 shadow-[2px_2px_0px_#0f172a]'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <span>3. Loa Kèn (Heteroscedasticity)</span>
                      <span>🚨</span>
                    </button>
                  </div>
                </ClayCard>

                <ClayCard className="p-4 space-y-2.5 flex flex-col justify-between">
                  <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    2. Chẩn Đoán & Ý Nghĩa
                  </h3>
                  <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                    {diagPattern === 'homoscedastic' && (
                      <p>
                        Các điểm phân bố ngẫu nhiên như <strong>đám mây sao chổi</strong> trong dải song song. Giả thiết Gauss-Markov thỏa mãn. Các ước lượng OLS là BLUE (Best Linear Unbiased Estimator).
                      </p>
                    )}
                    {diagPattern === 'nonlinear' && (
                      <p>
                        Phần dư tạo đường cong hình chữ U rõ nét. Mô hình tuyến tính bậc 1 đã <strong>bỏ sót quan hệ bậc 2</strong> ($x^2$).
                      </p>
                    )}
                    {diagPattern === 'heteroscedastic' && (
                      <p>
                        Phương sai phần dư phình to khi ŷ tăng (hình phễu loa kèn). Sai số chuẩn SE bị sai lệch $\implies$ kiểm định t-test và khoảng tin cậy không còn chuẩn xác.
                      </p>
                    )}
                  </div>
                </ClayCard>

                <ClayCard className="p-4 space-y-2.5 flex flex-col justify-between">
                  <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    3. Đơn Thuốc Chữa Bệnh
                  </h3>
                  <div className="text-xs space-y-2">
                    {diagPattern === 'homoscedastic' && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300">
                        Mô hình rất khỏe mạnh! Có thể tự tin dùng để dự báo và kiểm định giả thuyết.
                      </div>
                    )}
                    {diagPattern === 'nonlinear' && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300">
                        Thêm biến bậc hai $x^2$ hoặc dùng hồi quy đa thức (Polynomial Regression).
                      </div>
                    )}
                    {diagPattern === 'heteroscedastic' && (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-300">
                        Biến đổi logarit $\ln(Y)$ hoặc sử dụng phương pháp Bình phương Tối thiểu Tổng quát (WLS / Robust SE).
                      </div>
                    )}
                  </div>
                </ClayCard>
              </div>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
};
