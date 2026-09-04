import React, { useState, useEffect, useRef } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, randomNormal } from '../../../utils/math';
import { Play, RotateCcw, Sparkles, Layers, Activity } from 'lucide-react';

export const DerivedConvolution: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'convolution' | 'correlation' | 'totalvar'>('convolution');

  // Tab 1: Convolution State
  const [zValue, setZValue] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [distType, setDistType] = useState<'uniform' | 'exponential'>('uniform');

  // Animation frame loop for convolution
  useEffect(() => {
    let animationId: number;
    if (isPlaying) {
      animationId = requestAnimationFrame(() => {
        setZValue((prev) => {
          if (prev >= 2.0) return 0.0;
          return prev + 0.01;
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
    // Generate 200 bivariate points with correlation rho
    const pts = [];
    if (showParabola) {
      // Uncorrelated but completely dependent: Y = X^2
      for (let i = 0; i < 200; i++) {
        const x = (Math.random() - 0.5) * 4;
        const noise = (Math.random() - 0.5) * 0.4;
        pts.push({ x, y: x * x + noise });
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

  // Var(E[X|Y]) depends on group distance squared, E[Var(X|Y)] is withinVar
  const betweenVar = (groupGap * groupGap) / 2;
  const totalVariance = betweenVar + withinVar;
  const betweenPct = Math.round((betweenVar / totalVariance) * 100);
  const withinPct = 100 - betweenPct;

  return (
    <div className="space-y-6">
      {/* Chapter Subtitle & Context Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border-2 border-orange-200 dark:border-orange-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            MAT1101 Bài 7.1 — Biến ngẫu nhiên dẫn xuất (Derived Distributions)
          </span>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-0.5">
            Tích chập (Convolution), Hiệp phương sai & Hệ số Tương quan
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Khám phá quy tắc tìm phân bố tổng <MathView math="Z = X + Y" />, trực quan hóa hiệp phương sai <MathView math="\text{cov}(X,Y)" /> và định lý phân rã phương sai Eve's Law.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('convolution')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'convolution'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Layers size={14} /> 1. Tích chập (Z = X + Y)
          </button>
          <button
            onClick={() => setActiveTab('correlation')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'correlation'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Activity size={14} /> 2. Tương quan & Trực giao
          </button>
          <button
            onClick={() => setActiveTab('totalvar')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'totalvar'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sparkles size={14} /> 3. Phân rã Phương sai
          </button>
        </div>
      </div>

      {/* TAB 1: CONVOLUTION ANIMATION */}
      {activeTab === 'convolution' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls & Math */}
          <div className="space-y-4">
            <ClayCard glowColor="orange">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
                🎬 Điều khiển Tích chập
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Tích chập <MathView math="f_Z(z) = \int f_X(x) f_Y(z-x) dx" /> mô tả việc <strong>lật ngược</strong> hàm <MathView math="f_Y" /> và <strong>trượt</strong> từ trái sang phải theo tham số <MathView math="z" />.
              </p>

              <ClaySlider
                label="Giá trị z (Vị trí trượt)"
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
                  variant="primary"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  icon={<Play size={14} />}
                >
                  {isPlaying ? 'Tạm dừng' : 'Chạy Animation'}
                </ClayButton>
                <ClayButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsPlaying(false);
                    setZValue(0);
                  }}
                  icon={<RotateCcw size={14} />}
                >
                  Reset
                </ClayButton>
              </div>

              <div className="mt-5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-2">
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  💡 Nhận xét từ Slide 15:
                </span>
                <p className="text-amber-800 dark:text-amber-300">
                  Nếu <MathView math="X, Y \sim \mathcal{U}[0, 1]" />, tích chập biến 2 hình chữ nhật thành <strong>phân bố hình tam giác</strong> (Triangular Distribution) trên <MathView math="[0, 2]" /> với đỉnh cao nhất tại <MathView math="z = 1" />.
                </p>
                <div className="pt-1 text-center font-mono font-bold text-orange-600 dark:text-orange-400">
                  <MathView math="f_Z(z) = \begin{cases} z & 0 \le z \le 1 \\ 2 - z & 1 < z \le 2 \end{cases}" />
                </div>
              </div>
            </ClayCard>
          </div>

          {/* Visualization Canvas */}
          <div className="lg:col-span-2">
            <ClayCard glowColor="orange" className="p-6">
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>Trực quan hóa Hoạt ảnh Quét tích chập</span>
                <span className="text-xs px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-mono font-bold">
                  z = {fmt(zValue, 2)}
                </span>
              </h4>

              <div className="relative w-full h-80 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4">
                {/* SVG Graph for Convolution */}
                <svg viewBox="0 0 500 240" className="w-full h-full">
                  {/* Grid Lines */}
                  <line x1="50" y1="200" x2="470" y2="200" stroke="#475569" strokeWidth="2" />
                  <line x1="50" y1="30" x2="50" y2="200" stroke="#475569" strokeWidth="2" />

                  {/* Ticks & Labels */}
                  <text x="50" y="218" fill="#94A3B8" fontSize="11" textAnchor="middle">0</text>
                  <text x="210" y="218" fill="#94A3B8" fontSize="11" textAnchor="middle">1</text>
                  <text x="370" y="218" fill="#94A3B8" fontSize="11" textAnchor="middle">2</text>
                  <text x="40" y="70" fill="#94A3B8" fontSize="11" textAnchor="end">1.0</text>

                  {/* Fixed Function f_X(x) ~ U[0, 1] */}
                  <rect
                    x="50"
                    y="70"
                    width="160"
                    height="130"
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <text x="130" y="60" fill="#60A5FA" fontSize="11" textAnchor="middle" fontWeight="bold">
                    f_X(x) cố định [0, 1]
                  </text>

                  {/* Sliding Function f_Y(z - x) ~ U[z-1, z] */}
                  {(() => {
                    const slideStart = 50 + (zValue - 1) * 160;
                    const slideWidth = 160;
                    return (
                      <g>
                        <rect
                          x={slideStart}
                          y="80"
                          width={slideWidth}
                          height="120"
                          fill="rgba(249, 115, 22, 0.25)"
                          stroke="#F97316"
                          strokeWidth="2"
                        />
                        <text
                          x={slideStart + slideWidth / 2}
                          y="105"
                          fill="#FB923C"
                          fontSize="11"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          f_Y(z - x) trượt
                        </text>
                      </g>
                    );
                  })()}

                  {/* Overlap area (The actual integral at z) */}
                  {(() => {
                    const overlapLeft = Math.max(50, 50 + (zValue - 1) * 160);
                    const overlapRight = Math.min(210, 50 + zValue * 160);
                    const overlapWidth = Math.max(0, overlapRight - overlapLeft);
                    return (
                      overlapWidth > 0 && (
                        <rect
                          x={overlapLeft}
                          y="80"
                          width={overlapWidth}
                          height="120"
                          fill="rgba(234, 179, 8, 0.6)"
                          stroke="#EAB308"
                          strokeWidth="1.5"
                        />
                      )
                    );
                  })()}

                  {/* Result curve f_Z(z) building up */}
                  <path
                    d={`M 50 200 
                       L ${50 + Math.min(zValue, 1) * 160} ${200 - Math.min(zValue, 1) * 130} 
                       ${zValue > 1 ? `L ${50 + zValue * 160} ${200 - Math.max(0, 2 - zValue) * 130}` : ''}`}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.5"
                  />
                  {/* Current peak point */}
                  <circle
                    cx={50 + zValue * 160}
                    cy={200 - (zValue <= 1 ? zValue : Math.max(0, 2 - zValue)) * 130}
                    r="5"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                </svg>

                {/* Bottom Legend */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-blue-400">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> f_X(x)
                    </span>
                    <span className="flex items-center gap-1 text-orange-400">
                      <span className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></span> f_Y(z-x)
                    </span>
                    <span className="flex items-center gap-1 text-yellow-400">
                      <span className="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></span> Miền tích
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Kết quả f_Z(z)
                    </span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">
                    f_Z({fmt(zValue, 2)}) = {fmt(zValue <= 1 ? zValue : Math.max(0, 2 - zValue), 2)}
                  </span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 2: CORRELATION SCATTER */}
      {activeTab === 'correlation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <ClayCard glowColor="amber">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
                ⚡ Hệ số Tương quan <MathView math="\rho(X, Y)" />
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Hệ số <MathView math="\rho \in [-1, 1]" /> đo lường mức độ liên hệ tuyến tính.
              </p>

              <ClaySlider
                label="Hệ số tương quan rho"
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

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowParabola(!showParabola)}
                  className={`w-full py-2.5 px-3 rounded-2xl text-xs font-heading font-bold transition-all ${
                    showParabola
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                  }`}
                >
                  {showParabola ? 'Đang bật: Trường hợp Parabol Y = X^2' : '⭐ Thử nghiệm: Không tương quan != Độc lập'}
                </button>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100">Ý nghĩa:</span>
                <p className="text-slate-600 dark:text-slate-300">
                  {showParabola ? (
                    <span>
                      Khi <MathView math="Y = X^2" /> với <MathView math="X" /> đối xứng quanh 0, <MathView math="\text{cov}(X, Y) = 0 \implies \rho = 0" />, nhưng <MathView math="Y" /> phụ thuộc hoàn toàn vào <MathView math="X" />!
                    </span>
                  ) : Math.abs(rho) > 0.8 ? (
                    'Tương quan tuyến tính cực mạnh: Đám mây điểm co dẹt thành một đường thẳng hẹp.'
                  ) : Math.abs(rho) < 0.2 ? (
                    'Không tương quan: Đám mây điểm hình tròn phân tán đều, biết X không giúp đoán Y.'
                  ) : (
                    'Tương quan mức độ vừa phải: Có xu hướng hình elip nghiêng.'
                  )}
                </p>
              </div>
            </ClayCard>
          </div>

          <div className="lg:col-span-2">
            <ClayCard glowColor="amber" className="p-6">
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>Đám mây Điểm Bivariate (250 Samples)</span>
                <span className="text-xs px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono font-bold">
                  {showParabola ? 'rho ≈ 0.00 (Phi tuyến)' : `rho = ${fmt(rho, 2)}`}
                </span>
              </h4>

              <div className="relative w-full h-80 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
                <svg viewBox="-3 -3 6 6" className="w-full h-full">
                  {/* Axes */}
                  <line x1="-3" y1="0" x2="3" y2="0" stroke="#475569" strokeWidth="0.04" />
                  <line x1="0" y1="-3" x2="0" y2="3" stroke="#475569" strokeWidth="0.04" />

                  {/* Regression Line */}
                  {!showParabola && (
                    <line
                      x1="-2.8"
                      y1={-2.8 * rho}
                      x2="2.8"
                      y2={2.8 * rho}
                      stroke="#F59E0B"
                      strokeWidth="0.06"
                      strokeDasharray="0.1 0.05"
                    />
                  )}

                  {/* Scatter Points */}
                  {scatterPoints.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={-pt.y}
                      r="0.06"
                      fill={showParabola ? '#C084FC' : '#FBBF24'}
                      opacity={0.8}
                    />
                  ))}
                </svg>
              </div>
            </ClayCard>
          </div>
        </div>
      )}

      {/* TAB 3: TOTAL VARIANCE DECOMPOSITION */}
      {activeTab === 'totalvar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <ClayCard glowColor="orange">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
                🧱 Luật Phương sai Toàn phần (Eve's Law)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                <MathView math="\text{Var}(X) = \text{Var}(E[X|Y]) + E[\text{Var}(X|Y)]" />
              </p>

              <ClaySlider
                label="Khoảng cách giữa các nhóm"
                sublabel="Var(E[X|Y])"
                value={groupGap}
                min={0.5}
                max={5}
                step={0.1}
                color="orange"
                onChange={setGroupGap}
              />

              <ClaySlider
                label="Độ phân tán nội bộ nhóm"
                sublabel="E[Var(X|Y)]"
                value={withinVar}
                min={0.5}
                max={5}
                step={0.1}
                color="blue"
                onChange={setWithinVar}
              />

              <div className="mt-4 p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-xs">
                <span className="font-bold text-orange-950 dark:text-orange-200">Bản chất phân rã:</span>
                <ul className="mt-1 list-disc list-inside space-y-1 text-orange-800 dark:text-orange-300">
                  <li><strong>Var(E[X|Y]):</strong> Phương sai do sự khác biệt giữa các nhóm (explained).</li>
                  <li><strong>E[Var(X|Y)]:</strong> Phương sai trung bình bên trong nội bộ từng nhóm (unexplained).</li>
                </ul>
              </div>
            </ClayCard>
          </div>

          <div className="lg:col-span-2">
            <ClayCard glowColor="orange" className="p-6 space-y-6">
              <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100">
                Thanh phân rã Tỷ lệ Phương sai Toàn phần
              </h4>

              {/* Stacked Bar */}
              <div className="space-y-2">
                <div className="w-full h-12 rounded-2xl overflow-hidden flex shadow-inner border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold text-white">
                  <div
                    style={{ width: `${betweenPct}%` }}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center transition-all duration-300"
                  >
                    {betweenPct > 12 && `Giữa các nhóm: ${betweenPct}%`}
                  </div>
                  <div
                    style={{ width: `${withinPct}%` }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center transition-all duration-300"
                  >
                    {withinPct > 12 && `Nội bộ nhóm: ${withinPct}%`}
                  </div>
                </div>

                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span className="text-orange-600 dark:text-orange-400">
                    Var(E[X|Y]) = {fmt(betweenVar, 2)} ({betweenPct}%)
                  </span>
                  <span className="text-blue-600 dark:text-blue-400">
                    E[Var(X|Y)] = {fmt(withinVar, 2)} ({withinPct}%)
                  </span>
                </div>
              </div>

              {/* Summary Stats Card */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Tổng Phương sai Var(X)
                  </span>
                  <p className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                    {fmt(totalVariance, 2)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    Tỷ lệ giải thích được
                  </span>
                  <p className="text-2xl font-black font-mono text-orange-600 dark:text-orange-400 mt-1">
                    {betweenPct}%
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
