import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, randomNormal } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';
import { DensityHeatmap } from '../../canvas/DensityHeatmap';

const Surface3D = lazy(() => import('../../three/Surface3D'));

export const DerivedConvolution: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'convolution' | 'correlation' | 'totalvar' | 'transform' | 'extremes'>('convolution');

  // Tab 1: Convolution State (Original Lab)
  const [zValue, setZValue] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

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

  // Tab 2: Correlation State (Original Lab)
  const [rho, setRho] = useState<number>(0.75);
  const [scatterPoints, setScatterPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [showParabola, setShowParabola] = useState<boolean>(false);
  const [corrViewMode, setCorrViewMode] = useState<'scatter' | 'heatmap' | '3d'>('scatter');

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

  // Tab 3: Total Variance Decomposition State (Original Lab)
  const [groupGap, setGroupGap] = useState<number>(3.0);
  const [withinVar, setWithinVar] = useState<number>(1.0);

  const betweenVar = (groupGap * groupGap) / 2;
  const totalVariance = betweenVar + withinVar;
  const betweenPct = Math.round((betweenVar / totalVariance) * 100);
  const withinPct = 100 - betweenPct;

  // Helpers for SVG projection in Tab 2
  const mapX = (x: number) => 400 + x * 95;
  const mapY = (y: number) => 210 - y * 65;

  // Tab 4: Transformation Y = g(X) State
  const [transformType, setTransformType] = useState<'square' | 'linear' | 'exp'>('square');
  const [xSlider, setXSlider] = useState<number>(1.0);

  // Tab 5: Extremes Min / Max State
  const [extremeType, setExtremeType] = useState<'max' | 'min'>('max');
  const [compN, setCompN] = useState<number>(3);

  return (
    <div className="space-y-6">
      {/* Chapter Subtitle & Context Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 7.1 — Biến ngẫu nhiên dẫn xuất
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Tích chập (Convolution), Tương quan & Biến đổi Hàm mật độ
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
          <button
            onClick={() => setActiveTab('transform')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'transform'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            4. Đổi biến Y = g(X)
          </button>
          <button
            onClick={() => setActiveTab('extremes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'extremes'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            5. Biến Cực trị Max/Min
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: TÍCH CHẬP CONVOLUTION (Z = X + Y) - RESTORED ORIGINAL FULL GRID LAB
         ========================================================================= */}
      {activeTab === 'convolution' && (
        <div className="space-y-6">

          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA (DESMOS 3D VIEWPORT TRÊN Ô GRID) */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
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
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Công thức Giải tích (Slide 15)
              </h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 mb-2 font-medium">
                Khi <MathView math="X, Y \sim \mathcal{U}[0, 1]" />, tích chập biến 2 khối hình chữ nhật thành <strong>phân bố hình tam giác</strong>:
              </p>
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 text-sm sm:text-base text-center font-mono font-bold text-sky-700 dark:text-sky-300">
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
                  <span className="text-slate-500">Mật độ <MathView math="f_Z(z)" />:</span>
                  <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    {fmt(zValue <= 1 ? zValue : Math.max(0, 2 - zValue), 2)}
                  </span>
                </div>
              </div>
            </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
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
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-sky-500 rounded-sm"></span>
                    <span><MathView math="f_X(x)" /> cố định [0, 1]</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-orange-500 rounded-sm"></span>
                    <span><MathView math="f_Y(z-x)" /> trượt</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <span className="w-3 h-3 bg-amber-500 rounded-sm"></span> Miền tích diện tích
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-1 bg-emerald-500 rounded-full"></span>
                    <span>Kết quả <MathView math="f_Z(z)" /> hình tam giác</span>
                  </span>
                </div>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  f_Z({fmt(zValue, 2)}) = {fmt(zValue <= 1 ? zValue : Math.max(0, 2 - zValue), 2)}
                </span>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Nếu ta có 2 biến ngẫu nhiên độc lập $X$ và $Y$ (ví dụ thời gian chờ ở 2 chặng xe bus), làm thế nào để tìm hàm phân phối xác suất của tổng thời gian $Z = X + Y$?"
            formula="f_Z(z) = (f_X * f_Y)(z) = \int_{-\infty}^{\infty} f_X(x) f_Y(z - x) \, dx"
            mathExplanation="Tích chập là phép toán 'lật ngược' hàm $f_Y$, sau đó trượt nó qua $f_X$ một khoảng $z$. Giá trị mật độ $f_Z(z)$ tại mỗi điểm chính là diện tích phần giao nhau giữa hai hàm tại vị trí trượt đó."
            howToInteract={[
              "Bấm nút 'Chạy Quét Animation' hoặc kéo thanh trượt 'Giá trị z' từ 0.0 đến 2.0.",
              "Quan sát khối màu cam $f_Y(z-x)$ trượt ngang qua khối màu xanh $f_X(x)$.",
              "Nhìn diện tích phần giao nhau màu vàng (Miền Tích) thay đổi theo $z$.",
              "Nhìn đường cong màu xanh lá $f_Z(z)$ vẽ dần hình tam giác cân khi $z$ chạy từ 0 đến 2."
            ]}
            whatToObserve="Khi $z = 1.0$ (ở chính giữa), khối trượt trùng khít hoàn toàn với khối cố định, diện tích giao đạt cực đại 1.0. Đồ thị mật độ kết quả chuyển hóa từ 2 hình phẳng thành 1 hình tam giác cân hoàn hảo!"
            takeaway="Tổng của 2 biến phân phối Đều (Uniform) độc lập KHÔNG CÒN LÀ hình chữ nhật nữa, mà biến thành phân phối Tam giác (Triangular). Đây là bước mở đầu trực quan của Định lý Giới hạn Trung tâm (CLT)!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 2: TƯƠNG QUAN & TRỰC GIAO (ORIGINAL LAB)
         ========================================================================= */}
      {activeTab === 'correlation' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
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
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Không tương quan ≠ Độc lập
              </h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                {showParabola ? (
                  <span>
                    Khi <MathView math="Y = X^2" />, do tính đối xứng quanh 0, <MathView math="\text{Cov}(X, Y) = 0 \implies \rho = 0" />. Hai biến <strong>không tương quan tuyến tính</strong>, nhưng phụ thuộc hoàn toàn!
                  </span>
                ) : Math.abs(rho) > 0.75 ? (
                  'Tương quan tuyến tính rất mạnh: Đám mây điểm co cụm thành một dải hẹp quanh đường hồi quy.'
                ) : Math.abs(rho) < 0.25 ? (
                  'Tương quan gần 0: Đám mây phân tán đều tròn, biết X không giúp ích dự đoán Y bằng phương pháp tuyến tính.'
                ) : (
                  'Tương quan tuyến tính mức độ vừa phải.'
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

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Đám Mây Điểm Bivariate & Hệ Số Pearson ρ"
              formula="\rho = \frac{\text{Cov}(X, Y)}{\sigma_X \sigma_Y} \in [-1, 1]"
              badge={showParabola ? 'Mô hình Parabol: Y = X²' : `Hệ số tương quan ρ = ${fmt(rho, 2)}`}
              onReset={() => {
                setShowParabola(false);
                setRho(0.75);
              }}
              extraActions={
                <ClayButton
                  variant={showParabola ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setShowParabola(!showParabola)}
                  className="py-1 px-3 text-xs"
                >
                  {showParabola ? 'Về Tuyến Tính' : 'Bẫy Phi Tuyến: Y = X²'}
                </ClayButton>
              }
            />

            {/* View Switcher: Scatter vs 2D Density Heatmap vs 3D Surface */}
            <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Góc nhìn:</span>
              <button
                onClick={() => setCorrViewMode('scatter')}
                className={`px-3 py-1 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                  corrViewMode === 'scatter'
                    ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Đám Mây Điểm (Scatter)
              </button>
              <button
                onClick={() => setCorrViewMode('heatmap')}
                className={`px-3 py-1 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                  corrViewMode === 'heatmap'
                    ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_#0f172a]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Bản đồ Mật độ Nhiệt 2D (Heatmap)
              </button>
              <button
                onClick={() => setCorrViewMode('3d')}
                className={`px-3 py-1 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                  corrViewMode === '3d'
                    ? 'bg-purple-600 text-white shadow-[2px_2px_0px_#0f172a]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Mặt Cong 3D Không Gian (Three.js)
              </button>
            </div>

            {corrViewMode === '3d' ? (
              <div className="p-4 sm:p-6">
                <Suspense
                  fallback={
                    <div className="h-[460px] flex items-center justify-center font-heading font-bold text-slate-500">
                      Đang tải mô hình không gian 3D WebGL...
                    </div>
                  }
                >
                  <Surface3D rho={showParabola ? 0 : rho} />
                </Suspense>
              </div>
            ) : corrViewMode === 'heatmap' ? (
              <div className="p-4 sm:p-6">
                <DensityHeatmap rho={showParabola ? 0 : rho} />
              </div>
            ) : (
            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 380" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-corr-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-corr-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Desmos Cartesian Axes */}
                <line x1="80" y1="210" x2="720" y2="210" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrow-corr-x)" />
                <line x1="400" y1="360" x2="400" y2="30" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-corr-y)" />
                <text x="730" y="214" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">X</text>
                <text x="400" y="22" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Y</text>

                {/* Grid ticks */}
                {[-3, -2, -1, 1, 2, 3].map((val) => (
                  <g key={`x-${val}`}>
                    <line x1={mapX(val)} y1="206" x2={mapX(val)} y2="214" stroke="#64748B" strokeWidth="1.5" />
                    <text x={mapX(val)} y="230" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                ))}
                {[-2, -1, 1, 2].map((val) => (
                  <g key={`y-${val}`}>
                    <line x1="396" y1={mapY(val)} x2="404" y2={mapY(val)} stroke="#64748B" strokeWidth="1.5" />
                    <text x="388" y={mapY(val) + 4} fill="#64748B" fontSize="11" textAnchor="end" fontWeight="bold" fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                ))}

                {/* Trend line if linear */}
                {!showParabola && (
                  <line
                    x1={mapX(-3)}
                    y1={mapY(-3 * rho)}
                    x2={mapX(3)}
                    y2={mapY(3 * rho)}
                    stroke="#0284C7"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                )}

                {/* Parabola curve if non-linear trap */}
                {showParabola && (
                  <path
                    d={`M ${mapX(-2.2)} ${mapY(2.2 * 2.2 * 0.5 - 1.5)} Q ${mapX(0)} ${mapY(-1.5)} ${mapX(2.2)} ${mapY(2.2 * 2.2 * 0.5 - 1.5)}`}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="3.5"
                  />
                )}

                {/* Scatter Points */}
                {scatterPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={mapX(pt.x)}
                    cy={mapY(pt.y)}
                    r="3.5"
                    fill={showParabola ? '#8B5CF6' : '#F59E0B'}
                    opacity="0.75"
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
            )}
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Hai biến có hệ số tương quan tuyến tính $\rho = 0$ thì có chắc chắn độc lập với nhau không? Làm thế nào để phân biệt giữa 'không tương quan' và 'độc lập hoàn toàn'?"
            formula="\rho(X, Y) = \frac{\text{Cov}(X, Y)}{\sigma_X \sigma_Y}, \quad \text{Cov}(X, Y) = \mathbb{E}[(X - \mu_X)(Y - \mu_Y)]"
            mathExplanation="Hệ số tương quan Pearson $\rho$ chỉ đo lường mức độ liên hệ TUYẾN TÍNH (đường thẳng). Nếu quan hệ giữa $X$ và $Y$ là đường cong đối xứng (như parabol $Y = X^2$), thì $\text{Cov}(X,Y) = 0$ dù $Y$ hoàn toàn bị quyết định bởi $X$!"
            howToInteract={[
              "Kéo thanh trượt 'Hệ số tương quan $\rho$' từ -1.0 đến +1.0 để xem đám mây 250 điểm dữ liệu co cụm lại.",
              "Bấm nút 'Mô hình Phi tuyến Parabol ($Y = X^2$)' để kích hoạt bẫy kinh điển.",
              "Quan sát đám mây điểm uốn cong thành hình chữ U hoàn hảo nhưng hệ số tương quan vẫn bằng 0.00!"
            ]}
            whatToObserve="Khi $\rho = \pm 1$, tất cả các điểm nằm khít trên một đường thẳng. Khi bấm Parabol, biết $X$ ta lập tức tính được $Y$ chính xác 100%, vậy mà $\rho$ vẫn bằng 0!"
            takeaway="Độc lập $\implies$ Không tương quan ($\rho = 0$). Nhưng chiều ngược lại: Không tương quan ($\rho = 0$) CHƯA CHẮC độc lập (trừ trường hợp phân phối Chuẩn nhiều chiều Bivariate Normal)!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 3: PHÂN RÃ PHƯƠNG SAI TOÀN PHẦN EVE (ORIGINAL LAB)
         ========================================================================= */}
      {activeTab === 'totalvar' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
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

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
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
                      <circle cx={centerMu} cy={280} r="5" fill={grpColor} stroke="#FFFFFF" strokeWidth="1.5" />
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
            </div>
          </div>

          <LabBriefing
            question="Nếu ta biết thông tin về một biến phụ $Y$ (ví dụ biết sinh viên thuộc khoa nào), làm thế nào thông tin đó giúp phân rã và giải thích sự biến thiên của biến chính $X$ (điểm thi)?"
            formula="\text{Var}(X) = \text{Var}(\mathbb{E}[X|Y]) + \mathbb{E}[\text{Var}(X|Y)]"
            mathExplanation="Tổng phương sai $\text{Var}(X)$ luôn tách làm 2 phần: (1) Phương sai giữa các nhóm $\text{Var}(\mathbb{E}[X|Y])$ do các tâm nhóm cách xa nhau (phần giải thích được nhờ $Y$), và (2) Phương sai nội bộ từng nhóm $\mathbb{E}[\text{Var}(X|Y)]$ do nhiễu ngẫu nhiên."
            howToInteract={[
              "Kéo slider 'Khoảng cách giữa các nhóm': Quan sát 3 quả chuông tách xa nhau ra.",
              "Kéo slider 'Độ phân tán nội bộ nhóm': Quan sát các quả chuông phình to hay xẹp lại.",
              "Nhìn thanh xếp chồng phía dưới: Tỷ lệ phần trăm giữa phương sai giải thích được (xanh) và chưa giải thích được (xám)."
            ]}
            whatToObserve="Khi khoảng cách giữa các nhóm rất lớn so với độ lệch nội bộ, phần trăm giải thích được vọt lên trên 80-90%! Đây chính là nền tảng toán học của mô hình ANOVA và Hồi quy sau này."
            takeaway="Mẹo thi cử: Nhớ quy tắc Eve's Law: EVVE — 'E of Var plus Var of E' (Kỳ vọng của phương sai cộng Phương sai của kỳ vọng)!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 4: ĐỔI BIẾN HÀM MẬT ĐỘ Y = g(X) - TRÊN Ô GRID TRỰC TIẾP
         ========================================================================= */}
      {activeTab === 'transform' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              {/* Card 1: Chọn hàm & Slider x */}
            <ClayCard glowColor="purple" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Hàm chuyển đổi $Y = g(X)$
              </h4>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setTransformType('square')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border-2 border-slate-900 dark:border-slate-700 cursor-pointer ${
                    transformType === 'square' ? 'bg-purple-600 text-white shadow-[2px_2px_0px_#0f172a]' : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  $Y = X^2$
                </button>
                <button
                  onClick={() => setTransformType('linear')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border-2 border-slate-900 dark:border-slate-700 cursor-pointer ${
                    transformType === 'linear' ? 'bg-purple-600 text-white shadow-[2px_2px_0px_#0f172a]' : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  $Y = 2X+1$
                </button>
                <button
                  onClick={() => setTransformType('exp')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border-2 border-slate-900 dark:border-slate-700 cursor-pointer ${
                    transformType === 'exp' ? 'bg-purple-600 text-white shadow-[2px_2px_0px_#0f172a]' : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  $Y = e^X$
                </button>
              </div>

              <ClaySlider
                label="Điểm khảo sát x"
                sublabel="Quan sát độ co giãn không gian"
                value={xSlider}
                min={0.2}
                max={2.0}
                step={0.05}
                color="purple"
                formatValue={(v) => fmt(v, 2)}
                onChange={setXSlider}
              />
            </ClayCard>

            {/* Card 2: Bản chất Jacobian */}
            <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Ý nghĩa Hệ số Co giãn
              </h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                Độ dốc <MathView math="|g'(x)|" /> chính là hệ số kéo giãn độ dài vi phân: <MathView math="dy = |g'(x)| dx" />.
                Chỗ nào đồ thị uốn cong dốc đứng, không gian y bị kéo rộng ra khiến mật độ xác suất <MathView math="f_Y(y)" /> bị loãng và hạ thấp!
              </p>
            </ClayCard>

            {/* Card 3: Bảng giá trị tức thời */}
            <ClayCard glowColor="emerald" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Giá trị tại điểm x = {fmt(xSlider, 2)}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Giá trị $y = g(x)$:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {fmt(transformType === 'square' ? xSlider ** 2 : transformType === 'linear' ? 2 * xSlider + 1 : Math.exp(xSlider), 2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Độ dốc $|g'(x)|$:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {fmt(transformType === 'square' ? 2 * xSlider : transformType === 'linear' ? 2 : Math.exp(xSlider), 2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Mật độ <MathView math="f_Y(y)" />:</span>
                  <span className="font-mono font-extrabold text-sky-600 dark:text-sky-400 text-sm">
                    {fmt(
                      0.5 /
                        Math.max(
                          0.01,
                          transformType === 'square'
                            ? 2 * xSlider
                            : transformType === 'linear'
                            ? 2
                            : Math.exp(xSlider)
                        ),
                      3
                    )}
                  </span>
                </div>
              </div>
            </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={`Đổi biến Hàm Mật độ: Y = ${transformType === 'square' ? 'X²' : transformType === 'linear' ? '2X + 1' : 'e^X'}`}
              formula="f_Y(y) = \frac{f_X(x)}{|g'(x)|}"
              badge={`x = ${fmt(xSlider, 2)}`}
              onReset={() => { setTransformType('square'); setXSlider(1.0); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              {/* Full Desmos Grid SVG with dual coordinate frames directly on the grid paper */}
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-tr-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-tr-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Left System: Transformation y = g(x) */}
                <g>
                  {/* Axes */}
                  <line x1="60" y1="280" x2="380" y2="280" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrow-tr-x)" />
                  <line x1="100" y1="310" x2="100" y2="50" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-tr-y)" />
                  <text x="385" y="284" fill="#EF4444" fontSize="12" fontWeight="bold" fontFamily="monospace">x</text>
                  <text x="100" y="40" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">y = g(x)</text>
                  <text x="240" y="40" fill="#64748B" fontSize="12" fontWeight="bold" textAnchor="middle">
                    1. Hàm chuyển đổi y = g(x)
                  </text>

                  {/* Curve y = g(x) */}
                  {(() => {
                    const pts = [];
                    for (let x = 0.1; x <= 2.2; x += 0.05) {
                      let y = 0;
                      if (transformType === 'square') y = x * x;
                      else if (transformType === 'linear') y = 2 * x + 1;
                      else y = Math.exp(x) * 0.6;
                      const px = 100 + x * 120;
                      const py = 280 - y * 45;
                      pts.push(`${px},${py}`);
                    }
                    return (
                      <path d={`M ${pts.join(' L ')}`} fill="none" stroke="#8B5CF6" strokeWidth="3.5" />
                    );
                  })()}

                  {/* Current Point and Tangent */}
                  {(() => {
                    let yVal = 0, slope = 0;
                    if (transformType === 'square') {
                      yVal = xSlider * xSlider;
                      slope = 2 * xSlider;
                    } else if (transformType === 'linear') {
                      yVal = 2 * xSlider + 1;
                      slope = 2;
                    } else {
                      yVal = Math.exp(xSlider) * 0.6;
                      slope = yVal;
                    }
                    const px = 100 + xSlider * 120;
                    const py = 280 - yVal * 45;

                    return (
                      <g>
                        <line x1={px} y1="280" x2={px} y2={py} stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" />
                        <line x1="100" y1={py} x2={px} y2={py} stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" />
                        <circle cx={px} cy={py} r="6" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="2" />
                        <text x={px + 8} y={py - 8} fill="#8B5CF6" fontSize="11" fontWeight="bold" fontFamily="monospace">
                          ({fmt(xSlider, 1)}, {fmt(yVal, 1)})
                        </text>
                        {/* Tangent snippet */}
                        <line
                          x1={px - 40}
                          y1={py + 40 * (slope * 45 / 120)}
                          x2={px + 40}
                          y2={py - 40 * (slope * 45 / 120)}
                          stroke="#F59E0B"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                      </g>
                    );
                  })()}
                </g>

                {/* Center Divider line */}
                <line x1="410" y1="50" x2="410" y2="310" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" />

                {/* Right System: Probability Density f_Y(y) */}
                <g>
                  <line x1="440" y1="280" x2="750" y2="280" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrow-tr-x)" />
                  <line x1="470" y1="310" x2="470" y2="50" stroke="#10B981" strokeWidth="2" markerEnd="url(#arrow-tr-y)" />
                  <text x="755" y="284" fill="#EF4444" fontSize="12" fontWeight="bold" fontFamily="monospace">y</text>
                  <text x="470" y="40" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">f_Y(y)</text>
                  <text x="600" y="40" fill="#64748B" fontSize="12" fontWeight="bold" textAnchor="middle">
                    2. Mật độ xác suất f_Y(y) sau đổi biến
                  </text>

                  {/* Curve f_Y(y) */}
                  {(() => {
                    const pts = [];
                    const yStart = transformType === 'linear' ? 1.2 : 0.2;
                    const yEnd = transformType === 'linear' ? 5.0 : 4.5;
                    for (let y = yStart; y <= yEnd; y += 0.1) {
                      let density = 0;
                      if (transformType === 'square') {
                        // X ~ U(0, 2), f_X = 0.5. Y = X^2 => f_Y = 0.5 / (2 * sqrt(y))
                        density = 0.5 / (2 * Math.sqrt(Math.max(0.01, y)));
                      } else if (transformType === 'linear') {
                        // Y = 2X+1 => f_Y = 0.5 / 2 = 0.25
                        density = 0.25;
                      } else {
                        // Y = e^X => f_Y = 0.5 / y
                        density = 0.5 / Math.max(0.1, y);
                      }
                      const px = 470 + (y / yEnd) * 260;
                      const py = 280 - Math.min(200, density * 180);
                      pts.push(`${px},${py}`);
                    }
                    return (
                      <g>
                        <path
                          d={`M ${470 + (yStart / yEnd) * 260},280 L ${pts.join(' L ')} L ${470 + 260},280 Z`}
                          fill="rgba(2, 132, 199, 0.18)"
                        />
                        <path d={`M ${pts.join(' L ')}`} fill="none" stroke="#0284C7" strokeWidth="3.5" />
                      </g>
                    );
                  })()}

                  {/* Highlight current density point */}
                  {(() => {
                    let yVal = 0, density = 0;
                    if (transformType === 'square') {
                      yVal = xSlider * xSlider;
                      density = 0.5 / (2 * Math.sqrt(Math.max(0.01, yVal)));
                    } else if (transformType === 'linear') {
                      yVal = 2 * xSlider + 1;
                      density = 0.25;
                    } else {
                      yVal = Math.exp(xSlider) * 0.6;
                      density = 0.5 / Math.max(0.1, yVal);
                    }
                    const yEnd = transformType === 'linear' ? 5.0 : 4.5;
                    const px = 470 + (Math.min(yEnd, yVal) / yEnd) * 260;
                    const py = 280 - Math.min(200, density * 180);
                    return (
                      <g>
                        <circle cx={px} cy={py} r="6" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
                        <line x1={px} y1="280" x2={px} y2={py} stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3" />
                        <text x={px} y={py - 10} fill="#0284C7" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                          f_Y = {fmt(density, 2)}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              </svg>

              {/* Bottom Stage Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
                    <span className="w-3 h-0.5 bg-purple-500"></span> Hàm biến đổi y = g(x)
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                    <span className="w-3 h-0.5 bg-amber-500 border-dashed"></span> Độ dốc tiếp tuyến |g'(x)|
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                    <span className="w-3 h-3 bg-sky-500 rounded-sm"></span>
                    <span>Mật độ kết quả <MathView math="f_Y(y)" /></span>
                  </span>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  Bảo toàn diện tích: <MathView math="f_Y(y)\,dy = f_X(x)\,dx" />
                </span>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Nếu $X$ có hàm mật độ $f_X(x)$ và $Y = g(X)$ (như $Y = X^2$), tại sao ta không thể chỉ đơn giản thay $x$ vào $f_X(g(x))$, mà bắt buộc phải chia cho đạo hàm $|g'(x)|$?"
            formula="f_Y(y) = f_X(x) \cdot \left| \frac{dx}{dy} \right| = \frac{f_X(g^{-1}(y))}{|g'(g^{-1}(y))|}"
            mathExplanation="Xác suất là DIỆN TÍCH. Khi hàm $g$ biến đổi không gian, một đoạn nhỏ $dx$ bị kéo giãn hoặc nén lại thành $dy = |g'(x)|dx$. Để tổng diện tích xác suất bảo toàn $P(X \in dx) = P(Y \in dy)$, mật độ chiều cao $f_Y$ bắt buộc phải tỷ lệ nghịch với độ giãn nở $|g'(x)|$!"
            howToInteract={[
              "Chọn một trong 3 dạng hàm biến đổi: $Y = X^2$ (Parabol), $Y = 2X+1$ (Tuyến tính), hoặc $Y = e^X$ (Hàm mũ).",
              "Kéo slider 'Điểm khảo sát $x$' để quan sát tiếp tuyến và độ dốc $|g'(x)|$.",
              "Quan sát đồ thị bên phải: Chú ý giá trị mật độ $f_Y(y)$ tương ứng."
            ]}
            whatToObserve="Khi hàm $g$ dốc đứng ($|g'(x)|$ lớn), một đoạn $x$ hẹp bị kéo giãn thành đoạn $y$ rất rộng, làm cho mật độ $f_Y(y)$ bị dàn mỏng xẹp xuống. Ngược lại, chỗ nào $g$ phẳng, mật độ vọt lên rất cao!"
            takeaway="Quy tắc thi cử: Luôn nhớ nhân thêm trị tuyệt đối đạo hàm nghịch đảo $|dx/dy|$ (Jacobian 1 chiều), không bao giờ được quên mẫu số $|g'(x)|$!"
          />
        </div>
      )}

      {/* =========================================================================
          TAB 5: BIẾN CỰC TRỊ MAX & MIN - TRÊN Ô GRID TRỰC TIẾP
         ========================================================================= */}
      {activeTab === 'extremes' && (
        <div className="space-y-6">

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              {/* Card 1: Chế độ & Số linh kiện n */}
            <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Cấu hình Hệ thống
              </h4>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setExtremeType('max')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border-2 border-slate-900 dark:border-slate-700 cursor-pointer ${
                    extremeType === 'max' ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a]' : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  Hệ Song Song (Max)
                </button>
                <button
                  onClick={() => setExtremeType('min')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border-2 border-slate-900 dark:border-slate-700 cursor-pointer ${
                    extremeType === 'min' ? 'bg-emerald-600 text-white shadow-[2px_2px_0px_#0f172a]' : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  Hệ Nối Tiếp (Min)
                </button>
              </div>

              <ClaySlider
                label="Số lượng linh kiện n"
                value={compN}
                min={1}
                max={15}
                step={1}
                color={extremeType === 'max' ? 'blue' : 'emerald'}
                onChange={setCompN}
              />
            </ClayCard>

            {/* Card 2: Quy luật Độ tin cậy */}
            {/* Card 2: Bản chất Toán học */}
            <ClayCard glowColor="emerald" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Quy luật Phân phối Cực trị
              </h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                {extremeType === 'max' ? (
                  <span>
                    Trong hệ song song dự phòng, hệ thống chỉ tắt khi linh kiện cuối cùng hỏng. Khi <MathView math="n \to \infty" />, tuổi thọ trung bình tiệm cận cực đại 10: <MathView math="\mathbb{E}[W] = \frac{n}{n+1} \times 10" />.
                  </span>
                ) : (
                  <span>
                    Trong hệ nối tiếp, chỉ cần 1 linh kiện hỏng là toàn bộ hệ thống sập ngay. Khi <MathView math="n" /> càng lớn, tuổi thọ trung bình lao dốc nhanh về 0: <MathView math="\mathbb{E}[V] = \frac{1}{n+1} \times 10" />.
                  </span>
                )}
              </p>
            </ClayCard>

            {/* Card 3: Thống kê Tuổi thọ */}
            <ClayCard glowColor="amber" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Chỉ số Tuổi thọ Hệ thống
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Số linh kiện n:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{compN} linh kiện</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Tuổi thọ trung bình:</span>
                  <span className="font-mono font-extrabold text-sky-600 dark:text-sky-400 text-sm">
                    {extremeType === 'max' ? fmt((10 * compN) / (compN + 1), 2) : fmt(10 / (compN + 1), 2)} năm
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Trung vị (Median 50%):</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {extremeType === 'max'
                      ? fmt(10 * Math.pow(0.5, 1 / compN), 2)
                      : fmt(10 * (1 - Math.pow(0.5, 1 / compN)), 2)}{' '}
                    năm
                  </span>
                </div>
              </div>
            </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={`Mô phỏng Phân phối Cực trị: ${extremeType === 'max' ? 'Hệ Song Song W = max(X₁..Xₙ)' : 'Hệ Nối Tiếp V = min(X₁..Xₙ)'}`}
              formula={extremeType === 'max' ? `F_{\\max}(w) = [F(w)]^{${compN}}` : `F_{\\min}(v) = 1 - [1 - F(v)]^{${compN}}`}
              badge={`n = ${compN} linh kiện`}
              onReset={() => { setCompN(3); setExtremeType('max'); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-ext-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-ext-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Desmos Cartesian Axes spanning the full grid */}
                <line x1="80" y1="290" x2="740" y2="290" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-ext-x)" />
                <line x1="120" y1="320" x2="120" y2="40" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-ext-y)" />
                <text x="750" y="294" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">Thời gian t</text>
                <text x="120" y="30" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">f(t)</text>

                {/* Ticks 0 to 10 */}
                {[0, 2, 4, 6, 8, 10].map((tVal) => {
                  const px = 120 + (tVal / 10) * 600;
                  return (
                    <g key={`ext-tick-${tVal}`}>
                      <line x1={px} y1="286" x2={px} y2="294" stroke="#64748B" strokeWidth="1.5" />
                      <text x={px} y="312" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                        {tVal}
                      </text>
                    </g>
                  );
                })}

                {/* Baseline individual component density X_i ~ U(0, 10), f_X(t) = 0.1 */}
                <line x1="120" y1={290 - 0.1 * 350} x2="720" y2={290 - 0.1 * 350} stroke="#94A3B8" strokeWidth="2" strokeDasharray="5 3" />
                <text x="725" y={290 - 0.1 * 350 + 4} fill="#94A3B8" fontSize="11" fontWeight="bold">
                  Linh kiện đơn f_X(t) = 0.1
                </text>

                {/* Extreme density curve f(t) */}
                {(() => {
                  const pts = [];
                  for (let t = 0; t <= 10; t += 0.1) {
                    const u = t / 10;
                    let pdf = 0;
                    if (extremeType === 'max') {
                      pdf = (compN / 10) * Math.pow(u, compN - 1);
                    } else {
                      pdf = (compN / 10) * Math.pow(1 - u, compN - 1);
                    }
                    const px = 120 + u * 600;
                    const py = 290 - Math.min(240, pdf * 350);
                    pts.push(`${px},${py}`);
                  }

                  const fillColor = extremeType === 'max' ? 'rgba(2, 132, 199, 0.25)' : 'rgba(16, 185, 129, 0.25)';
                  const strokeColor = extremeType === 'max' ? '#0284C7' : '#10B981';

                  return (
                    <g>
                      <path d={`M 120,290 L ${pts.join(' L ')} L 720,290 Z`} fill={fillColor} />
                      <path d={`M ${pts.join(' L ')}`} fill="none" stroke={strokeColor} strokeWidth="3.5" />
                    </g>
                  );
                })()}
              </svg>

              {/* Bottom Stage Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                    <span className="w-3 h-0.5 bg-slate-400 border-dashed"></span> Linh kiện đơn lẻ X_i ~ U(0, 10)
                  </span>
                  <span className={`flex items-center gap-1.5 font-bold ${extremeType === 'max' ? 'text-sky-600' : 'text-emerald-600'}`}>
                    <span className={`w-3.5 h-1.5 rounded-sm ${extremeType === 'max' ? 'bg-sky-500' : 'bg-emerald-500'}`}></span>
                    {extremeType === 'max' ? 'Tuổi thọ Max (Hệ song song)' : 'Tuổi thọ Min (Hệ nối tiếp)'}
                  </span>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  Kỳ vọng: {extremeType === 'max' ? `E[Max] = ${fmt((10 * compN) / (compN + 1), 2)}` : `E[Min] = ${fmt(10 / (compN + 1), 2)}`}
                </span>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>

          <LabBriefing
            question="Một hệ thống máy tính gồm $n$ linh kiện độc lập. Hệ thống chỉ chạy được nếu TẤT CẢ linh kiện cùng chạy (hệ nối tiếp - $\min$), hoặc chỉ cần ÍT NHẤT 1 linh kiện chạy (hệ song song dự phòng - $\max$). Tuổi thọ của hệ thống thay đổi thế nào khi ta tăng số linh kiện $n$?"
            formula="F_{\max}(w) = [F_X(w)]^n, \quad F_{\min}(v) = 1 - [1 - F_X(v)]^n"
            mathExplanation="Để $\max < w$ thì TẤT CẢ $n$ linh kiện phải cùng $< w$ (xác suất nhân $n$ lần: $[F(w)]^n$). Ngược lại, để $\min > v$ thì TẤT CẢ $n$ linh kiện phải cùng sống sót qua thời điểm $v$ (xác suất $[1 - F(v)]^n$)."
            howToInteract={[
              "Chuyển đổi giữa chế độ 'Hệ Song Song (Max)' và 'Hệ Nối Tiếp (Min)'.",
              "Kéo slider số linh kiện $n$ từ 1 đến 15.",
              "Xem đường cong hàm mật độ $f(t)$ di chuyển dạt sang phải (Max) hay co cụm sang trái (Min)."
            ]}
            whatToObserve="Khi tăng $n$ trong hệ song song (Max), đường cong bị đẩy mạnh về bên phải (tuổi thọ trung bình tăng vọt nhờ có linh kiện dự phòng). Còn hệ nối tiếp (Min) chỉ cần 1 linh kiện chết là sập cả hệ thống, nên đồ thị co rúm về sát 0!"
            takeaway="Quy tắc thi cử: Bài toán 'Linh kiện hỏng đầu tiên' $\implies$ tìm phân phối của $\min$. Bài toán 'Thời điểm linh kiện cuối cùng ngừng hoạt động' $\implies$ tìm phân phối của $\max$!"
          />
        </div>
      )}
    </div>
  );
};
