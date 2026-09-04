import React, { useState, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt } from '../../../utils/math';
import { LineChart, Sparkles, RotateCcw, AlertCircle, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Point {
  id: number;
  x: number;
  y: number;
}

export const LinearRegression: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ols' | 'r2'>('ols');

  // Default points
  const [points, setPoints] = useState<Point[]>([
    { id: 1, x: 1.5, y: 2.2 },
    { id: 2, x: 2.5, y: 3.8 },
    { id: 3, x: 4.0, y: 4.5 },
    { id: 4, x: 5.5, y: 6.8 },
    { id: 5, x: 7.0, y: 7.2 },
    { id: 6, x: 8.5, y: 9.0 },
  ]);

  // Manual line parameters
  const [manualSlope, setManualSlope] = useState<number>(0.8);
  const [manualIntercept, setManualIntercept] = useState<number>(1.0);
  const [showSquares, setShowSquares] = useState<boolean>(true);

  // Compute Optimal OLS Parameters analytically
  const { optSlope, optIntercept, tss, rss, mss, rSquared, rmse, xMean, yMean } = useMemo(() => {
    const n = points.length;
    if (n < 2) {
      return { optSlope: 1, optIntercept: 0, tss: 0, rss: 0, mss: 0, rSquared: 0, rmse: 0, xMean: 0, yMean: 0 };
    }

    const xm = points.reduce((acc, p) => acc + p.x, 0) / n;
    const ym = points.reduce((acc, p) => acc + p.y, 0) / n;

    let num = 0;
    let den = 0;
    let totSS = 0;

    for (const p of points) {
      num += (p.x - xm) * (p.y - ym);
      den += (p.x - xm) * (p.x - xm);
      totSS += (p.y - ym) * (p.y - ym);
    }

    const b1 = den !== 0 ? num / den : 0;
    const b0 = ym - b1 * xm;

    // Calculate RSS based on current manual parameters
    let resSS = 0;
    for (const p of points) {
      const yHat = manualSlope * p.x + manualIntercept;
      resSS += Math.pow(p.y - yHat, 2);
    }

    const modSS = Math.max(0, totSS - resSS);
    const r2 = totSS > 0 ? Math.max(0, Math.min(1, 1 - resSS / totSS)) : 0;
    const rootMse = Math.sqrt(resSS / n);

    return {
      optSlope: b1,
      optIntercept: b0,
      tss: totSS,
      rss: resSS,
      mss: modSS,
      rSquared: r2,
      rmse: rootMse,
      xMean: xm,
      yMean: ym,
    };
  }, [points, manualSlope, manualIntercept]);

  // Fit line automatically
  const handleAutoFit = () => {
    setManualSlope(optSlope);
    setManualIntercept(optIntercept);
    confetti({ particleCount: 30, spread: 60 });
  };

  // Add Outlier
  const handleAddOutlier = () => {
    const newPt: Point = { id: Date.now(), x: 9.0, y: 1.0 };
    setPoints([...points, newPt]);
  };

  // Reset points
  const handleReset = () => {
    setPoints([
      { id: 1, x: 1.5, y: 2.2 },
      { id: 2, x: 2.5, y: 3.8 },
      { id: 3, x: 4.0, y: 4.5 },
      { id: 4, x: 5.5, y: 6.8 },
      { id: 5, x: 7.0, y: 7.2 },
      { id: 6, x: 8.5, y: 9.0 },
    ]);
    setManualSlope(0.8);
    setManualIntercept(1.0);
  };

  // SVG Coordinate mapping (X: 0..10 -> 40..460, Y: 0..10 -> 260..20)
  const mapX = (x: number) => 40 + (x / 10) * 420;
  const mapY = (y: number) => 260 - (y / 10) * 240;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-teal-500/10 border-2 border-blue-200 dark:border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            MAT1101 Bài 11 — Hồi quy Tuyến tính & Bình phương Tối thiểu (OLS)
          </span>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-0.5">
            Bình phương Phần dư (Residual Squares) & Phân rã <MathView math="R^2" />
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Phương pháp Bình phương Tối thiểu (Ordinary Least Squares - OLS) tìm đường thẳng làm <strong>cực tiểu hóa tổng diện tích các hình vuông phần dư</strong>!
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('ols')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ols'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <LineChart size={14} /> 1. OLS Fitter & Hình vuông
          </button>
          <button
            onClick={() => setActiveTab('r2')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'r2'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sparkles size={14} /> 2. Phân rã TSS = MSS + RSS
          </button>
        </div>
      </div>

      {/* TAB 1: OLS FITTER */}
      {activeTab === 'ols' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <ClayCard glowColor="blue">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
                🎛️ Xoay Thử Đường Thẳng
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Kéo 2 thanh trượt bên dưới để tự điều chỉnh đường thẳng sao cho tổng diện tích các ô vuông nhỏ nhất:
              </p>

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

              <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <ClayButton
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={handleAutoFit}
                  icon={<Sparkles size={14} />}
                >
                  Khớp Nghiệm Tối Ưu OLS
                </ClayButton>

                <div className="flex gap-2">
                  <ClayButton
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={handleAddOutlier}
                    icon={<AlertCircle size={14} className="text-amber-500" />}
                  >
                    + Điểm Ngoại Lai (Outlier)
                  </ClayButton>
                  <ClayButton
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    icon={<RotateCcw size={14} />}
                  />
                </div>
              </div>

              {/* Stats Panel */}
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1 font-mono">
                <div className="text-slate-500 dark:text-slate-400 font-sans font-bold">
                  Chỉ số Mô hình Hiện tại:
                </div>
                <div className="text-red-600 dark:text-red-400 font-bold">
                  Tổng diện tích phần dư (RSS): {fmt(rss, 2)}
                </div>
                <div className="text-blue-600 dark:text-blue-400 font-bold">
                  Hệ số xác định R²: {fmt(rSquared * 100, 1)}%
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Sai số chuẩn RMSE: {fmt(rmse, 2)}
                </div>
              </div>
            </ClayCard>
          </div>

          {/* Interactive Plot with Residual Squares */}
          <div className="lg:col-span-2">
            <ClayCard glowColor="blue" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100">
                  Mặt phẳng Dữ liệu & Các Hình vuông Phần dư
                </h4>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSquares}
                    onChange={(e) => setShowSquares(e.target.checked)}
                    className="rounded text-blue-500"
                  />
                  <span>Hiện hình vuông phần dư</span>
                </label>
              </div>

              <div className="w-full h-88 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between">
                <svg viewBox="0 0 500 280" className="w-full h-full">
                  {/* Grid Lines */}
                  <line x1="40" y1="260" x2="480" y2="260" stroke="#334155" strokeWidth="1.5" />
                  <line x1="40" y1="20" x2="40" y2="260" stroke="#334155" strokeWidth="1.5" />

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
                        stroke="#38BDF8"
                        strokeWidth="3"
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
                        {/* Square representing residual^2 */}
                        {showSquares && diffY > 2 && (
                          <rect
                            x={px}
                            y={Math.min(py, pyHat)}
                            width={diffY}
                            height={diffY}
                            fill="rgba(244, 63, 94, 0.2)"
                            stroke="#F43F5E"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                          />
                        )}

                        {/* Vertical line stem */}
                        <line
                          x1={px}
                          y1={py}
                          x2={px}
                          y2={pyHat}
                          stroke="#F43F5E"
                          strokeWidth="2"
                        />

                        {/* Data point dot */}
                        <circle
                          cx={px}
                          cy={py}
                          r="5"
                          fill="#FBBF24"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                          className="hover:r-7 cursor-pointer"
                        />
                      </g>
                    );
                  })}
                </svg>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span> Điểm dữ liệu
                    </span>
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <span className="w-4 h-0.5 bg-sky-400"></span> Đường hồi quy
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <span className="w-3 h-3 border border-rose-500 bg-rose-500/20"></span> Ô vuông RSS
                    </span>
                  </div>
                  <span className="text-slate-300 font-mono">
                    y = {fmt(manualSlope, 2)}x + {fmt(manualIntercept, 2)}
                  </span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 2: VARIANCE DECOMPOSITION */}
      {activeTab === 'r2' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <ClayCard glowColor="blue">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
                🧩 Phân rã Biến thiên: TSS = MSS + RSS
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                - <strong>TSS (Total Sum of Squares):</strong> Tổng biến thiên toàn phần so với đường cơ sở trung bình <MathView math="\bar{y}" />.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                - <strong>MSS (Model Sum of Squares):</strong> Phần biến thiên mà mô hình tuyến tính <em>giải thích được</em>.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                - <strong>RSS (Residual Sum of Squares):</strong> Phần sai số còn lại <em>chưa giải thích được</em>.
              </p>

              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-center font-mono">
                <span className="text-xs text-cyan-800 dark:text-cyan-300 font-bold block mb-1">
                  Hệ số Xác định R²
                </span>
                <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400">
                  {fmt(rSquared * 100, 1)}%
                </span>
              </div>
            </ClayCard>
          </div>

          <div className="lg:col-span-2">
            <ClayCard glowColor="blue" className="p-6 space-y-6">
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100">
                Thanh phân rã Tỷ lệ Phương sai Toàn phần TSS
              </h4>

              {/* Stacked Bar for R2 */}
              <div className="space-y-2">
                <div className="w-full h-12 rounded-2xl overflow-hidden flex shadow-inner border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold text-white">
                  <div
                    style={{ width: `${Math.round(rSquared * 100)}%` }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center transition-all duration-300"
                  >
                    {rSquared > 0.15 && `MSS: ${fmt(rSquared * 100, 1)}%`}
                  </div>
                  <div
                    style={{ width: `${Math.round((1 - rSquared) * 100)}%` }}
                    className="bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center transition-all duration-300"
                  >
                    {(1 - rSquared) > 0.15 && `RSS: ${fmt((1 - rSquared) * 100, 1)}%`}
                  </div>
                </div>

                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Phần giải thích được (MSS) = {fmt(mss, 2)}
                  </span>
                  <span className="text-rose-600 dark:text-rose-400">
                    Phần sai số dư (RSS) = {fmt(rss, 2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Tổng Biến thiên TSS
                  </span>
                  <p className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                    {fmt(tss, 2)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Công thức R²
                  </span>
                  <p className="text-sm font-mono text-blue-800 dark:text-blue-200 mt-2 font-bold">
                    <MathView math="R^2 = 1 - \frac{RSS}{TSS} = \frac{MSS}{TSS}" />
                  </p>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}
    </div>
  );
};
