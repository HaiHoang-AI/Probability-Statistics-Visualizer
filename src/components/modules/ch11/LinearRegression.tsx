import React, { useState, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';

interface Point {
  id: number;
  x: number;
  y: number;
}

export const LinearRegression: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ols' | 'r2'>('ols');
  const [showSquares, setShowSquares] = useState<boolean>(true);

  // Initial data points
  const [points, setPoints] = useState<Point[]>([
    { id: 1, x: 1.0, y: 1.8 },
    { id: 2, x: 2.5, y: 3.8 },
    { id: 3, x: 4.0, y: 4.5 },
    { id: 4, x: 5.5, y: 6.8 },
    { id: 5, x: 7.0, y: 7.2 },
    { id: 6, x: 8.5, y: 9.0 },
  ]);

  // Sliders for interactive line: y = slope * x + intercept
  const [manualSlope, setManualSlope] = useState<number>(0.8);
  const [manualIntercept, setManualIntercept] = useState<number>(1.0);

  // Calculate Optimal OLS using closed-form formula
  const olsParams = useMemo(() => {
    const n = points.length;
    if (n === 0) return { slope: 0, intercept: 0 };
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

  // Desmos SVG Coordinate mapping (ViewBox 800 x 420, X: 0..10 -> 80..760, Y: 0..10 -> 360..40)
  const mapX = (x: number) => 80 + (x / 10) * 660;
  const mapY = (y: number) => 360 - (y / 10) * 310;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 11 — Hồi quy Tuyến tính & OLS
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Bình phương Phần dư (Residual Squares) & Phân rã <MathView math="R^2" />
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('ols')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              activeTab === 'ols'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. OLS Fitter & Hình vuông
          </button>
          <button
            onClick={() => setActiveTab('r2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              activeTab === 'r2'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Phân rã TSS = MSS + RSS
          </button>
        </div>
      </div>

      {/* TAB 1: OLS FITTER */}
      {activeTab === 'ols' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA (DESMOS 3D VIEWPORT) */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Mặt phẳng Toạ độ Desmos & Bình phương Phần dư"
              formula={`y = ${fmt(manualSlope, 2)}x + ${fmt(manualIntercept, 2)}`}
              badge={`RSS = ${fmt(rss, 2)}`}
              onReset={handleReset}
              extraActions={
                <label className="flex items-center gap-1.5 text-xs font-heading font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={showSquares}
                    onChange={(e) => setShowSquares(e.target.checked)}
                    className="rounded text-sky-600 accent-sky-600"
                  />
                  <span>Hiện ô vuông RSS</span>
                </label>
              }
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 420" className="w-full h-auto select-none">
                <defs>
                  {/* Desmos 3D Arrow markers */}
                  <marker id="arrow-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Mathematical Grid lines & tick numbers */}
                {[0, 2, 4, 6, 8, 10].map((v) => (
                  <g key={`grid-x-${v}`}>
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
                  <g key={`grid-y-${v}`}>
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
                  markerEnd="url(#arrow-x)"
                />
                <text
                  x={mapX(10) + 30}
                  y={mapY(0) + 5}
                  className="text-xs font-mono font-black fill-red-500"
                >
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
                  markerEnd="url(#arrow-y)"
                />
                <text
                  x={mapX(0) - 5}
                  y={mapY(10) - 28}
                  className="text-xs font-mono font-black fill-emerald-500"
                >
                  Y
                </text>

                {/* Regression Line: y = manualSlope * x + manualIntercept */}
                {(() => {
                  const x1 = 0;
                  const y1 = manualIntercept;
                  const x2 = 10;
                  const y2 = manualSlope * 10 + manualIntercept;
                  return (
                    <line
                      x1={mapX(x1)}
                      y1={mapY(y1)}
                      x2={mapX(x2)}
                      y2={mapY(y2)}
                      stroke="#0284C7"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  );
                })()}

                {/* Residual Squares and Vertical Stems */}
                {points.map((p) => {
                  const yHat = manualSlope * p.x + manualIntercept;
                  const px = mapX(p.x);
                  const py = mapY(p.y);
                  const pyHat = mapY(yHat);
                  const diffY = Math.abs(py - pyHat);

                  return (
                    <g key={p.id}>
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
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs mt-2">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                    <span className="w-3 h-3 bg-amber-500 rounded-full border border-white"></span> Điểm dữ liệu (x, y)
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                    <span className="w-5 h-1 bg-sky-600 rounded-full"></span> Đường OLS ŷ = θ₁x + θ₀
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
          </ClayCard>

          {/* 2. BẢNG TÙY CHỌN ĐIỀU CHỈNH THÔNG SỐ Ở DƯỚI (BOTTOM CONTROL DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Cột 1: Sliders xoay đường thẳng */}
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  1. Xoay Thử Đường Thẳng
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Điều chỉnh 2 thanh trượt để cực tiểu hóa tổng diện tích các ô vuông:
                </p>
              </div>

              <div className="space-y-3">
                <ClaySlider
                  label="Hệ số góc (Slope θ₁)"
                  value={manualSlope}
                  min={-0.5}
                  max={2.0}
                  step={0.05}
                  color="blue"
                  formatValue={(v) => fmt(v, 2)}
                  onChange={setManualSlope}
                />

                <ClaySlider
                  label="Hệ số chặn (Intercept θ₀)"
                  value={manualIntercept}
                  min={-2}
                  max={5}
                  step={0.1}
                  color="blue"
                  formatValue={(v) => fmt(v, 1)}
                  onChange={setManualIntercept}
                />
              </div>
            </ClayCard>

            {/* Cột 2: Thao tác & Tối ưu hóa */}
            <ClayCard className="p-5 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white mb-1">
                  2. Thao Tác Mô Phỏng
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Thử nghiệm độ nhạy của OLS đối với điểm ngoại lai (Outlier):
                </p>
              </div>

              <div className="space-y-2.5">
                <ClayButton
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={handleAutoFit}
                >
                  Khớp Nghiệm Tối Ưu OLS
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
            <ClayCard className="p-5 space-y-2.5 flex flex-col justify-between">
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
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
      )}

      {/* TAB 2: VARIANCE DECOMPOSITION */}
      {activeTab === 'r2' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Phân Rã Biến Thiên Toàn Phần: TSS = MSS + RSS"
              formula="R^2 = 1 - \frac{RSS}{TSS} = \frac{MSS}{TSS}"
              badge={`R² = ${fmt(rSquared * 100, 1)}%`}
            />

            <div className="desmos-viewport w-full p-6 sm:p-10 flex flex-col justify-center min-h-[380px] space-y-6">
              <div className="space-y-3 max-w-4xl mx-auto w-full">
                <div className="flex justify-between items-end text-sm font-heading font-black">
                  <span className="text-sky-600 dark:text-sky-400">
                    Phần Giải Thích Được (MSS): {fmt(mss, 2)} ({fmt(rSquared * 100, 1)}%)
                  </span>
                  <span className="text-rose-600 dark:text-rose-400">
                    Phần Sai Số Dư (RSS): {fmt(rss, 2)} ({fmt((1 - rSquared) * 100, 1)}%)
                  </span>
                </div>

                {/* Large Stacked Bar */}
                <div className="w-full h-16 rounded-2xl overflow-hidden flex border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0px_#0f172a] font-mono text-sm font-black text-white">
                  <div
                    style={{ width: `${Math.max(5, Math.round(rSquared * 100))}%` }}
                    className="bg-sky-600 flex items-center justify-center transition-all duration-300 px-2"
                  >
                    MSS: {fmt(rSquared * 100, 1)}%
                  </div>
                  <div
                    style={{ width: `${Math.max(5, Math.round((1 - rSquared) * 100))}%` }}
                    className="bg-rose-500 flex items-center justify-center transition-all duration-300 px-2"
                  >
                    RSS: {fmt((1 - rSquared) * 100, 1)}%
                  </div>
                </div>

                <div className="flex justify-between text-xs font-mono font-bold text-slate-500">
                  <span>0%</span>
                  <span>Tổng Biến Thiên TSS = {fmt(tss, 2)} (100%)</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </ClayCard>

          {/* 2. BẢNG THÔNG SỐ Ở DƯỚI (BOTTOM DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ClayCard className="p-5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng Biến Thiên</span>
              <h4 className="font-heading font-black text-lg text-slate-900 dark:text-white">TSS (Total SS)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Tổng bình phương độ lệch của từng quan sát so với giá trị trung bình mẫu <MathView math="\bar{y}" />.
              </p>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white pt-1">
                {fmt(tss, 2)}
              </div>
            </ClayCard>

            <ClayCard className="p-5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Mô Hình Tuyến Tính</span>
              <h4 className="font-heading font-black text-lg text-sky-600 dark:text-sky-400">MSS (Model SS)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Lượng biến thiên của dữ liệu mà đường thẳng hồi quy OLS đã nắm bắt và giải thích thành công.
              </p>
              <div className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400 pt-1">
                {fmt(mss, 2)}
              </div>
            </ClayCard>

            <ClayCard className="p-5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Sai Số Chưa Giải Thích</span>
              <h4 className="font-heading font-black text-lg text-rose-600 dark:text-rose-400">RSS (Residual SS)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Tổng diện tích các ô vuông phần dư còn lại mà mô hình chưa giải thích được.
              </p>
              <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 pt-1">
                {fmt(rss, 2)}
              </div>
            </ClayCard>
          </div>
        </div>
      )}
    </div>
  );
};
