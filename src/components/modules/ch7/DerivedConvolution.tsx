import React, { useState, useEffect } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, randomNormal } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';

export const DerivedConvolution: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'convolution' | 'correlation' | 'totalvar'>('convolution');

  // Tab 1: Convolution State
  const [zValue, setZValue] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Animation frame loop for convolution
  useEffect(() => {
    let animationId: number;
    if (isPlaying) {
      animationId = requestAnimationFrame(() => {
        setZValue((prev) => {
          if (prev >= 2.0) return 0.0;
          return Math.min(2.0, prev + 0.01);
        });
      });
    }
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, zValue]);

  // Tab 2: Correlation State
  const [rho, setRho] = useState<number>(0.75);
  const [scatterPoints, setScatterPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [showParabola, setShowParabola] = useState<boolean>(false);

  useEffect(() => {
    const pts = [];
    if (showParabola) {
      for (let i = 0; i < 220; i++) {
        const x = (Math.random() - 0.5) * 4;
        const noise = (Math.random() - 0.5) * 0.4;
        pts.push({ x, y: x * x * 0.5 - 1.5 + noise });
      }
    } else {
      for (let i = 0; i < 250; i++) {
        const z1 = randomNormal(0, 1);
        const z2 = randomNormal(0, 1);
        const x = z1;
        const y = rho * z1 + Math.sqrt(Math.max(0, 1 - rho * rho)) * z2;
        pts.push({ x, y });
      }
    }
    setScatterPoints(pts);
  }, [rho, showParabola]);

  // Tab 3: Total Variance Decomposition State
  const [groupGap, setGroupGap] = useState<number>(3.0);
  const [withinVar, setWithinVar] = useState<number>(1.0);

  const betweenVar = (groupGap * groupGap) / 2;
  const totalVariance = betweenVar + withinVar;
  const betweenPct = Math.round((betweenVar / totalVariance) * 100);
  const withinPct = 100 - betweenPct;

  // Helpers for SVG projection in Tab 2
  const mapX = (x: number) => 400 + x * 95;
  const mapY = (y: number) => 210 - y * 65;

  return (
    <div className="space-y-6">
      {/* Chapter Subtitle & Context Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 7.1 — Biến ngẫu nhiên dẫn xuất
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Tích chập (Convolution), Hiệp phương sai & Hệ số Tương quan
          </h2>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('convolution')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'convolution'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Tích chập (Z = X + Y)
          </button>
          <button
            onClick={() => setActiveTab('correlation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'correlation'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Tương quan & Trực giao
          </button>
          <button
            onClick={() => setActiveTab('totalvar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'totalvar'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. Phân rã Phương sai (Eve)
          </button>
        </div>
      </div>

      {/* TAB 1: CONVOLUTION ANIMATION */}
      {activeTab === 'convolution' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA (DESMOS 3D VIEWPORT) */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Mô phỏng Quét Tích chập & Diện tích Giao tích phân"
              formula="f_Z(z) = \int_{-\infty}^{\infty} f_X(x) f_Y(z-x) dx"
              badge={`z = ${fmt(zValue, 2)}`}
              onReset={() => {
                setIsPlaying(false);
                setZValue(1.0);
              }}
              extraActions={
                <ClayButton
                  variant="primary"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="py-1 px-3 text-xs"
                >
                  {isPlaying ? 'Tạm dừng' : 'Chạy Quét Animation'}
                </ClayButton>
              }
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 380" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-conv-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-conv-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Desmos Cartesian Grid Reference */}
                <line x1="80" y1="300" x2="740" y2="300" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-conv-x)" />
                <line x1="120" y1="330" x2="120" y2="40" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-conv-y)" />
                <text x="750" y="304" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">x, z</text>
                <text x="120" y="30" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">f(·)</text>

                {/* Grid ticks */}
                {[0, 0.5, 1.0, 1.5, 2.0, 2.5].map((val) => {
                  const px = 120 + val * 240;
                  return (
                    <g key={val}>
                      <line x1={px} y1="296" x2={px} y2="304" stroke="#64748B" strokeWidth="1.5" />
                      <text x={px} y="322" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                        {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}
                {[0.5, 1.0].map((val) => {
                  const py = 300 - val * 180;
                  return (
                    <g key={val}>
                      <line x1="116" y1={py} x2="124" y2={py} stroke="#64748B" strokeWidth="1.5" />
                      <text x="108" y={py + 4} fill="#64748B" fontSize="11" textAnchor="end" fontWeight="bold" fontFamily="monospace">
                        {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* 1. Fixed Base Function f_X(x) ~ U[0, 1] */}
                <rect
                  x="120"
                  y="120"
                  width="240"
                  height="180"
                  fill="rgba(2, 132, 199, 0.15)"
                  stroke="#0284C7"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
                <text x="240" y="105" fill="#0284C7" fontSize="12" textAnchor="middle" fontWeight="bold">
                  f_X(x) cố định [0, 1]
                </text>

                {/* 2. Sliding Function f_Y(z - x) ~ U[z-1, z] */}
                {(() => {
                  const slideStart = 120 + (zValue - 1) * 240;
                  const slideWidth = 240;
                  return (
                    <g>
                      <rect
                        x={slideStart}
                        y="135"
                        width={slideWidth}
                        height="165"
                        fill="rgba(249, 115, 22, 0.22)"
                        stroke="#F97316"
                        strokeWidth="2.5"
                      />
                      <text
                        x={slideStart + slideWidth / 2}
                        y="165"
                        fill="#F97316"
                        fontSize="12"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        f_Y(z - x) trượt
                      </text>
                    </g>
                  );
                })()}

                {/* 3. Overlap area (The actual integral value f_Z(z)) */}
                {(() => {
                  const overlapLeft = Math.max(120, 120 + (zValue - 1) * 240);
                  const overlapRight = Math.min(360, 120 + zValue * 240);
                  const overlapWidth = Math.max(0, overlapRight - overlapLeft);
                  return (
                    overlapWidth > 0 && (
                      <g>
                        <rect
                          x={overlapLeft}
                          y="135"
                          width={overlapWidth}
                          height="165"
                          fill="rgba(234, 179, 8, 0.65)"
                          stroke="#EAB308"
                          strokeWidth="2"
                        />
                        <text
                          x={overlapLeft + overlapWidth / 2}
                          y="225"
                          fill="#78350F"
                          className="dark:fill-amber-100"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Miền Tích
                        </text>
                      </g>
                    )
                  );
                })()}

                {/* 4. Resulting curve f_Z(z) building up across [0, 2] */}
                <path
                  d={`M 120 300 
                     L ${120 + Math.min(zValue, 1) * 240} ${300 - Math.min(zValue, 1) * 180} 
                     ${zValue > 1 ? `L ${120 + zValue * 240} ${300 - Math.max(0, 2 - zValue) * 180}` : ''}`}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Current peak point */}
                {(() => {
                  const curY = zValue <= 1 ? zValue : Math.max(0, 2 - zValue);
                  const cx = 120 + zValue * 240;
                  const cy = 300 - curY * 180;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r="7" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
                      <line x1={cx} y1={cy} x2={cx} y2="300" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
                      <text x={cx} y={cy - 12} fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        f_Z = {curY.toFixed(2)}
                      </text>
                    </g>
                  );
                })()}
              </svg>

              {/* Bottom Stage Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                    <span className="w-3 h-3 bg-sky-500 rounded-sm"></span> f_X(x) cố định [0, 1]
                  </span>
                  <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                    <span className="w-3 h-3 bg-orange-500 rounded-sm"></span> f_Y(z-x) trượt
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <span className="w-3 h-3 bg-amber-500 rounded-sm"></span> Miền tích diện tích
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="w-3.5 h-1 bg-emerald-500 rounded-full"></span> Kết quả f_Z(z) hình tam giác
                  </span>
                </div>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  f_Z({fmt(zValue, 2)}) = {fmt(zValue <= 1 ? zValue : Math.max(0, 2 - zValue), 2)}
                </span>
              </div>
            </div>
          </ClayCard>

          {/* 2. BẢNG TÙY CHỌN ĐIỀU CHỈNH THÔNG SỐ Ở DƯỚI (BOTTOM CONTROL DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Vị trí quét z */}
            <ClayCard glowColor="orange" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Vị trí quét trượt z
              </h4>
              <ClaySlider
                label="Giá trị z"
                value={zValue}
                min={0}
                max={2}
                step={0.02}
                formatValue={(v) => fmt(v, 2)}
                color="orange"
                onChange={(v) => {
                  setIsPlaying(false);
                  setZValue(v);
                }}
              />
              <div className="mt-4 flex gap-2">
                <ClayButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsPlaying(false);
                    setZValue(0);
                  }}
                  className="w-full text-xs"
                >
                  Về z = 0
                </ClayButton>
                <ClayButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsPlaying(false);
                    setZValue(1.0);
                  }}
                  className="w-full text-xs"
                >
                  Đỉnh z = 1.0
                </ClayButton>
              </div>
            </ClayCard>

            {/* Card 2: Bản chất Toán học (Slide 15) */}
            <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Công thức Giải tích (Slide 15)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                Khi <MathView math="X, Y \sim \mathcal{U}[0, 1]" />, tích chập biến 2 khối hình chữ nhật thành <strong>phân bố hình tam giác</strong>:
              </p>
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 text-xs text-center font-mono font-bold text-sky-700 dark:text-sky-300">
                <MathView math="f_Z(z) = \begin{cases} z & 0 \le z \le 1 \\ 2 - z & 1 < z \le 2 \end{cases}" />
              </div>
            </ClayCard>

            {/* Card 3: Trạng thái Tích phân */}
            <ClayCard glowColor="emerald" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Trạng thái Giao diện Tích phân
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Pha chuyển động:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {zValue <= 0
                      ? 'Chưa tiếp xúc'
                      : zValue <= 1
                      ? 'Đang tiến vào (Diện tích tăng)'
                      : zValue < 2
                      ? 'Đang rời khỏi (Diện tích giảm)'
                      : 'Đã tách rời hoàn toàn'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Độ dài giao miền:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {fmt(zValue <= 1 ? zValue : Math.max(0, 2 - zValue), 2)} đv
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Mật độ f_Z(z):</span>
                  <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    {fmt(zValue <= 1 ? zValue : Math.max(0, 2 - zValue), 2)}
                  </span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 2: CORRELATION SCATTER */}
      {activeTab === 'correlation' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA (DESMOS 3D VIEWPORT) */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Mặt phẳng Phân tán Nhị biến & Hệ số Tương quan Pearson"
              formula="\rho(X, Y) = \frac{\text{Cov}(X, Y)}{\sigma_X \sigma_Y}"
              badge={showParabola ? 'rho = 0.00 (Phi tuyến)' : `rho = ${fmt(rho, 2)}`}
              onReset={() => {
                setShowParabola(false);
                setRho(0.75);
              }}
              extraActions={
                <button
                  onClick={() => setShowParabola(!showParabola)}
                  className={`px-3 py-1 text-xs font-heading font-bold rounded-lg border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                    showParabola
                      ? 'bg-purple-600 text-white shadow-[2px_2px_0px_#0f172a]'
                      : 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300'
                  }`}
                >
                  {showParabola ? 'Đang bật: Parabol Y=X²' : 'Thử: Không tương quan ≠ Độc lập'}
                </button>
              }
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 420" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-corr-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-corr-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Desmos Cartesian Axes (Centered at 400, 210) */}
                <line x1="40" y1="210" x2="760" y2="210" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-corr-x)" />
                <line x1="400" y1="390" x2="400" y2="30" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-corr-y)" />
                <text x="770" y="214" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">X</text>
                <text x="400" y="20" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Y</text>

                {/* Axis Ticks */}
                {[-3, -2, -1, 1, 2, 3].map((val) => (
                  <g key={val}>
                    <line x1={mapX(val)} y1="206" x2={mapX(val)} y2="214" stroke="#64748B" strokeWidth="1.5" />
                    <text x={mapX(val)} y="230" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                ))}
                {[-2, -1, 1, 2].map((val) => (
                  <g key={val}>
                    <line x1="396" y1={mapY(val)} x2="404" y2={mapY(val)} stroke="#64748B" strokeWidth="1.5" />
                    <text x="388" y={mapY(val) + 4} fill="#64748B" fontSize="11" textAnchor="end" fontWeight="bold" fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                ))}

                {/* Linear Regression Trend line */}
                {!showParabola && (
                  <line
                    x1={mapX(-3.5)}
                    y1={mapY(-3.5 * rho)}
                    x2={mapX(3.5)}
                    y2={mapY(3.5 * rho)}
                    stroke="#0284C7"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                  />
                )}

                {/* Scatter Points */}
                {scatterPoints.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={mapX(pt.x)}
                    cy={mapY(pt.y)}
                    r="4"
                    fill={showParabola ? '#A855F7' : '#F59E0B'}
                    stroke={showParabola ? '#6B21A8' : '#B45309'}
                    strokeWidth="1"
                    opacity="0.85"
                  />
                ))}
              </svg>

              {/* Bottom Stage Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 250 Điểm Dữ liệu (X, Y)
                  </span>
                  {!showParabola && (
                    <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                      <span className="w-4 h-0.5 bg-sky-500 border-dashed"></span> Đường xu hướng Y = ρ·X
                    </span>
                  )}
                  {showParabola && (
                    <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Mô hình Phi tuyến Parabol
                    </span>
                  )}
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  {showParabola ? 'Cov(X, Y) = 0 (Không tương quan)' : `Hệ số tương quan ρ = ${fmt(rho, 2)}`}
                </span>
              </div>
            </div>
          </ClayCard>

          {/* 2. BẢNG TÙY CHỌN ĐIỀU CHỈNH THÔNG SỐ Ở DƯỚI (BOTTOM CONTROL DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Slider rho */}
            <ClayCard glowColor="amber" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Điều chỉnh Hệ số Tương quan
              </h4>
              <ClaySlider
                label="Hệ số Pearson rho"
                value={rho}
                min={-1}
                max={1}
                step={0.05}
                color="amber"
                formatValue={(v) => fmt(v, 2)}
                onChange={(v) => {
                  setShowParabola(false);
                  setRho(v);
                }}
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => { setShowParabola(false); setRho(-0.9); }}
                  className="flex-1 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  ρ = -0.9
                </button>
                <button
                  onClick={() => { setShowParabola(false); setRho(0); }}
                  className="flex-1 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  ρ = 0.0
                </button>
                <button
                  onClick={() => { setShowParabola(false); setRho(0.9); }}
                  className="flex-1 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  ρ = +0.9
                </button>
              </div>
            </ClayCard>

            {/* Card 2: Bản chất Không tương quan vs Độc lập */}
            <ClayCard glowColor="purple" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Không tương quan ≠ Độc lập
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {showParabola ? (
                  <span>
                    Khi <MathView math="Y = X^2" />, do tính đối xứng quanh 0, <MathView math="\text{Cov}(X, Y) = 0 \implies \rho = 0" />. Hai biến <strong>không tương quan tuyến tính</strong>, nhưng phụ thuộc hoàn toàn!
                  </span>
                ) : Math.abs(rho) > 0.75 ? (
                  'Tương quan tuyến tính rất mạnh: Đám mây điểm co cụm thành một dải hẹp quanh đường hồi quy.'
                ) : Math.abs(rho) < 0.25 ? (
                  'Tương quan gần 0: Đám mây phân tán đều tròn, biết X không giúp ích dự đoán Y bằng phương pháp tuyến tính.'
                ) : (
                  'Tương quan vừa phải: Đám mây có hình dạng elip nghiêng rõ nét.'
                )}
              </p>
            </ClayCard>

            {/* Card 3: Thống kê Mẫu */}
            <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Chỉ số Bivariate
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Số điểm quan sát:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">250 mẫu</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Phương sai giải thích:</span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                    {showParabola ? '0.0%' : `${fmt(rho * rho * 100, 1)}%`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Hệ số góc hồi quy:</span>
                  <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                    {showParabola ? '0.00' : fmt(rho, 2)}
                  </span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 3: TOTAL VARIANCE DECOMPOSITION */}
      {activeTab === 'totalvar' && (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA (DESMOS 3D VIEWPORT) */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Trực quan Luật Phân rã Phương sai Toàn phần (Eve's Law)"
              formula="\text{Var}(X) = \text{Var}(\mathbb{E}[X|Y]) + \mathbb{E}[\text{Var}(X|Y)]"
              badge={`Tổng Var = ${fmt(totalVariance, 2)}`}
              onReset={() => {
                setGroupGap(3.0);
                setWithinVar(1.0);
              }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-eve-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                </defs>

                {/* Desmos Cartesian Axis */}
                <line x1="60" y1="280" x2="740" y2="280" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-eve-x)" />
                <text x="750" y="284" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">X</text>

                {/* Draw 3 Groups representing Y = 1, 2, 3 */}
                {[-1, 0, 1].map((grpIdx) => {
                  const centerMu = 400 + grpIdx * groupGap * 35;
                  const sigmaW = Math.sqrt(withinVar) * 22;
                  const pts = [];
                  for (let dx = -60; dx <= 60; dx += 4) {
                    const x = centerMu + dx;
                    const y = 280 - Math.exp(-(dx * dx) / (2 * sigmaW * sigmaW)) * 140;
                    pts.push(`${x},${y}`);
                  }

                  const grpColor = grpIdx === -1 ? '#0284C7' : grpIdx === 0 ? '#10B981' : '#F59E0B';
                  return (
                    <g key={grpIdx}>
                      {/* Bell curve area */}
                      <path
                        d={`M ${centerMu - 60},280 L ${pts.join(' L ')} L ${centerMu + 60},280 Z`}
                        fill={grpColor}
                        opacity="0.25"
                      />
                      <path d={`M ${pts.join(' L ')}`} fill="none" stroke={grpColor} strokeWidth="3" />

                      {/* Mean marker for this group E[X|Y=y] */}
                      <line x1={centerMu} y1="120" x2={centerMu} y2="280" stroke={grpColor} strokeWidth="2" strokeDasharray="3 3" />
                      <circle cx={centerMu} cy="280" r="5" fill={grpColor} stroke="#FFFFFF" strokeWidth="1.5" />
                      <text x={centerMu} y="110" fill={grpColor} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        E[X|Y={grpIdx + 2}]
                      </text>
                    </g>
                  );
                })}

                {/* Overall mean line E[X] */}
                <line x1="400" y1="70" x2="400" y2="280" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="6 3" />
                <circle cx="400" cy="280" r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                <text x="400" y="60" fill="#EF4444" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  Kỳ vọng chung E[X]
                </text>
              </svg>

              {/* Bottom Visual Stacked Bar inside Stage */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="w-full h-10 rounded-xl overflow-hidden flex shadow-inner border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold text-white">
                  <div
                    style={{ width: `${betweenPct}%` }}
                    className="bg-sky-600 flex items-center justify-center transition-all duration-300"
                  >
                    {betweenPct > 15 && `Var(E[X|Y]) Giữa các nhóm: ${betweenPct}%`}
                  </div>
                  <div
                    style={{ width: `${withinPct}%` }}
                    className="bg-slate-700 flex items-center justify-center transition-all duration-300"
                  >
                    {withinPct > 15 && `E[Var(X|Y)] Nội bộ: ${withinPct}%`}
                  </div>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span className="text-sky-600 dark:text-sky-400 font-bold">
                    Var(E[X|Y]) = {fmt(betweenVar, 2)} ({betweenPct}%)
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    E[Var(X|Y)] = {fmt(withinVar, 2)} ({withinPct}%)
                  </span>
                </div>
              </div>
            </div>
          </ClayCard>

          {/* 2. BẢNG TÙY CHỌN ĐIỀU CHỈNH THÔNG SỐ Ở DƯỚI (BOTTOM CONTROL DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Sliders */}
            <ClayCard glowColor="orange" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Điều chỉnh Thành phần
              </h4>
              <ClaySlider
                label="Khoảng cách giữa các nhóm"
                sublabel="Tăng Var(E[X|Y])"
                value={groupGap}
                min={0.5}
                max={5}
                step={0.1}
                color="orange"
                onChange={setGroupGap}
              />
              <div className="mt-3">
                <ClaySlider
                  label="Độ phân tán nội bộ nhóm"
                  sublabel="Tăng E[Var(X|Y)]"
                  value={withinVar}
                  min={0.5}
                  max={5}
                  step={0.1}
                  color="blue"
                  onChange={setWithinVar}
                />
              </div>
            </ClayCard>

            {/* Card 2: Ý nghĩa Lý thuyết */}
            <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Ý nghĩa Định lý Eve
              </h4>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-sky-600">• Var(E[X|Y]):</span>
                  <span>Phương sai giải thích được nhờ biến điều kiện Y (khoảng cách giữa các tâm nhóm).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-500">• E[Var(X|Y)]:</span>
                  <span>Phương sai không giải thích được, do nhiễu nội bộ từng nhóm.</span>
                </li>
              </ul>
            </ClayCard>

            {/* Card 3: Thống kê Tổng hợp */}
            <ClayCard glowColor="emerald" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Tổng Phương sai Var(X)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Tổng Var(X):</span>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-white text-base">
                    {fmt(totalVariance, 2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Tỷ lệ giải thích:</span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                    {betweenPct}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Tỷ lệ chưa giải thích:</span>
                  <span className="font-mono font-bold text-slate-500">
                    {withinPct}%
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
