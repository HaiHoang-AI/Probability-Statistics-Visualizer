import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, normalPdf, normalCdf } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';

export const ContinuousRV: React.FC = () => {
  const [activeSub, setActiveSub] = useState<'normal' | 'buffon'>('normal');

  // Normal distribution state
  const [mu, setMu] = useState<number>(0);
  const [sigma, setSigma] = useState<number>(1.0);
  const [rangeX1, setRangeX1] = useState<number>(-1.0);
  const [rangeX2, setRangeX2] = useState<number>(1.0);

  // Area under normal curve between rangeX1 and rangeX2
  const pArea = Math.max(0, normalCdf(rangeX2, mu, sigma) - normalCdf(rangeX1, mu, sigma));

  // Buffon's Needle State
  const [totalNeedles, setTotalNeedles] = useState<number>(0);
  const [crossNeedles, setCrossNeedles] = useState<number>(0);
  const [needles, setNeedles] = useState<Array<{ x: number; y: number; angle: number; crosses: boolean }>>([]);

  const dropNeedles = (count = 50) => {
    const newNeedles: Array<{ x: number; y: number; angle: number; crosses: boolean }> = [];
    let newCrosses = 0;
    const lineDistance = 50;
    const needleLength = 35;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * 700 + 50;
      const y = Math.random() * 260 + 30;
      const angle = Math.random() * Math.PI;

      // Distance from center to nearest line (lines at y = 50, 100, 150, 200, 250)
      const d = y % lineDistance;
      const distToLine = Math.min(d, lineDistance - d);
      const halfProjection = (needleLength / 2) * Math.sin(angle);
      const crosses = distToLine <= halfProjection;

      if (crosses) newCrosses++;
      newNeedles.push({ x, y, angle, crosses });
    }

    setTotalNeedles((t) => t + count);
    setCrossNeedles((c) => c + newCrosses);
    setNeedles((prev) => [...prev.slice(-250), ...newNeedles]);
  };

  const estimatedPi = crossNeedles > 0 ? (2 * 35 * totalNeedles) / (50 * crossNeedles) : 0;
  const piError = estimatedPi > 0 ? Math.abs(estimatedPi - Math.PI) : 0;

  // SVG coordinates for Normal Distribution
  const mapNormX = (x: number) => 400 + x * 65;
  const mapNormY = (y: number) => 330 - y * 560;

  return (
    <div className="space-y-6">
      {/* Chapter Subtitle & Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 5 & 6 — Biến ngẫu nhiên Liên tục
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Phân bố Chuẩn Gauss <MathView math="\mathcal{N}(\mu, \sigma^2)" /> & Cây Kim Buffon
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSub('normal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeSub === 'normal'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Phân bố Chuẩn Gauss
          </button>
          <button
            onClick={() => setActiveSub('buffon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeSub === 'buffon'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Cây kim Buffon (Monte Carlo)
          </button>
        </div>
      </div>

      {activeSub === 'normal' ? (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA (DESMOS 3D VIEWPORT) */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Đồ thị Hàm Mật Độ PDF Chuẩn Gauss & Diện Tích Tích Phân"
              formula={`P(${fmt(rangeX1, 1)} \\le X \\le ${fmt(rangeX2, 1)}) = ${fmt(pArea * 100, 2)}\\%`}
              badge={`μ = ${fmt(mu, 1)}, σ = ${fmt(sigma, 1)}`}
              onReset={() => {
                setMu(0);
                setSigma(1.0);
                setRangeX1(-1.0);
                setRangeX2(1.0);
              }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 380" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-norm-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-norm-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Desmos Cartesian Axes */}
                <line x1="60" y1="330" x2="740" y2="330" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-norm-x)" />
                <line x1="400" y1="360" x2="400" y2="30" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-norm-y)" />
                <text x="750" y="334" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">x</text>
                <text x="400" y="20" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">f(x)</text>

                {/* X-axis Ticks */}
                {[-4, -3, -2, -1, 1, 2, 3, 4].map((val) => (
                  <g key={val}>
                    <line x1={mapNormX(val)} y1="326" x2={mapNormX(val)} y2="334" stroke="#64748B" strokeWidth="1.5" />
                    <text x={mapNormX(val)} y="350" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                ))}

                {/* Shaded Area between rangeX1 and rangeX2 */}
                {(() => {
                  const pts = [];
                  const step = 0.05;
                  for (let x = rangeX1; x <= rangeX2 + 0.001; x += step) {
                    pts.push(`${mapNormX(x)},${mapNormY(normalPdf(x, mu, sigma))}`);
                  }
                  return (
                    <g>
                      <path
                        d={`M ${mapNormX(rangeX1)},330 L ${pts.join(' L ')} L ${mapNormX(rangeX2)},330 Z`}
                        fill="rgba(2, 132, 199, 0.35)"
                        stroke="#0284C7"
                        strokeWidth="1.5"
                      />
                      {/* Bounding Lines */}
                      <line
                        x1={mapNormX(rangeX1)}
                        y1="330"
                        x2={mapNormX(rangeX1)}
                        y2={mapNormY(normalPdf(rangeX1, mu, sigma))}
                        stroke="#0284C7"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                      <line
                        x1={mapNormX(rangeX2)}
                        y1="330"
                        x2={mapNormX(rangeX2)}
                        y2={mapNormY(normalPdf(rangeX2, mu, sigma))}
                        stroke="#0284C7"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    </g>
                  );
                })()}

                {/* Full Normal Curve */}
                <path
                  d={Array.from({ length: 160 }, (_, i) => {
                    const x = -5 + (i / 160) * 10;
                    const y = normalPdf(x, mu, sigma);
                    return `${i === 0 ? 'M' : 'L'} ${mapNormX(x)} ${mapNormY(y)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="3.5"
                />

                {/* Mean line mu */}
                <line
                  x1={mapNormX(mu)}
                  y1="50"
                  x2={mapNormX(mu)}
                  y2="330"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <circle cx={mapNormX(mu)} cy={mapNormY(normalPdf(mu, mu, sigma))} r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                <text x={mapNormX(mu)} y="42" fill="#EF4444" fontSize="12" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                  μ = {fmt(mu, 1)}
                </text>
              </svg>

              {/* Bottom Stage Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                    <span className="w-3 h-3 bg-sky-500 rounded-sm"></span> Diện tích P({fmt(rangeX1, 1)} ≤ X ≤ {fmt(rangeX2, 1)}) = {fmt(pArea * 100, 2)}%
                  </span>
                  <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
                    <span className="w-3.5 h-0.5 bg-red-500 border-dashed"></span> Đỉnh đối xứng μ = {fmt(mu, 1)}
                  </span>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold text-xs">
                  Quy tắc: 1σ ≈ 68.27% | 2σ ≈ 95.45% | 3σ ≈ 99.73%
                </span>
              </div>
            </div>
          </ClayCard>

          {/* 2. BẢNG TÙY CHỌN ĐIỀU CHỈNH THÔNG SỐ Ở DƯỚI (BOTTOM CONTROL DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Tham số phân bố */}
            <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Tham số Gauss N(μ, σ²)
              </h4>
              <ClaySlider
                label="Kỳ vọng mu"
                value={mu}
                min={-3}
                max={3}
                step={0.2}
                color="blue"
                onChange={setMu}
              />
              <div className="mt-2">
                <ClaySlider
                  label="Độ lệch chuẩn sigma"
                  value={sigma}
                  min={0.4}
                  max={2.5}
                  step={0.1}
                  color="blue"
                  onChange={setSigma}
                />
              </div>
            </ClayCard>

            {/* Card 2: Khoảng tích phân */}
            <ClayCard glowColor="orange" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Khoảng Tích phân [X₁, X₂]
              </h4>
              <ClaySlider
                label="Cận dưới X1"
                value={rangeX1}
                min={-4}
                max={rangeX2 - 0.2}
                step={0.1}
                color="orange"
                onChange={setRangeX1}
              />
              <div className="mt-2">
                <ClaySlider
                  label="Cận trên X2"
                  value={rangeX2}
                  min={rangeX1 + 0.2}
                  max={4}
                  step={0.1}
                  color="orange"
                  onChange={setRangeX2}
                />
              </div>
            </ClayCard>

            {/* Card 3: Thống kê & Công thức */}
            <ClayCard glowColor="emerald" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Xác suất Tích phân
              </h4>
              <div className="space-y-2.5 text-sm sm:text-[15px]">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Diện tích tích phân:</span>
                  <span className="font-mono font-black text-sky-600 dark:text-sky-400 text-base sm:text-lg">
                    {fmt(pArea * 100, 2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Điểm uốn (Inflection):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                    {fmt(mu - sigma, 1)} và {fmt(mu + sigma, 1)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Đỉnh mật độ cực đại:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                    {fmt(1 / (sigma * Math.sqrt(2 * Math.PI)), 3)}
                  </span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA (DESMOS 3D VIEWPORT) */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Mô phỏng Thả Cây kim Buffon & Ước lượng Monte Carlo số Pi"
              formula="\pi \approx \frac{2\ell \cdot N_{\text{tổng}}}{d \cdot N_{\text{cắt}}}"
              badge={`π ≈ ${fmt(estimatedPi, 4)}`}
              onReset={() => {
                setTotalNeedles(0);
                setCrossNeedles(0);
                setNeedles([]);
              }}
              extraActions={
                <div className="flex gap-2">
                  <ClayButton variant="primary" size="sm" onClick={() => dropNeedles(50)} className="py-1 px-3 text-xs">
                    + Thả 50 Kim
                  </ClayButton>
                  <ClayButton variant="outline" size="sm" onClick={() => dropNeedles(500)} className="py-1 px-3 text-xs">
                    + Thả 500 Kim
                  </ClayButton>
                </div>
              }
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 320" className="w-full h-auto select-none">
                {/* Parallel lines at distance d = 50 */}
                {[50, 100, 150, 200, 250].map((yVal) => (
                  <g key={yVal}>
                    <line x1="30" y1={yVal} x2="770" y2={yVal} stroke="#64748B" strokeWidth="2" strokeDasharray="5 3" />
                    <text x="15" y={yVal + 4} fill="#64748B" fontSize="10" fontFamily="monospace">d</text>
                  </g>
                ))}

                {/* Needles */}
                {needles.map((nd, idx) => {
                  const dx = (35 / 2) * Math.cos(nd.angle);
                  const dy = (35 / 2) * Math.sin(nd.angle);
                  return (
                    <g key={idx}>
                      <line
                        x1={nd.x - dx}
                        y1={nd.y - dy}
                        x2={nd.x + dx}
                        y2={nd.y + dy}
                        stroke={nd.crosses ? '#EF4444' : '#10B981'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* Red dot at crossing */}
                      {nd.crosses && (
                        <circle cx={nd.x} cy={nd.y} r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Bottom Stage Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="w-3 h-0.5 bg-emerald-500"></span> Kim không cắt: {totalNeedles - crossNeedles}
                  </span>
                  <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
                    <span className="w-3 h-0.5 bg-red-500"></span> Kim cắt vạch ngang: {crossNeedles}
                  </span>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  Tổng kim: {totalNeedles} | Tỷ lệ cắt: {totalNeedles > 0 ? fmt((crossNeedles / totalNeedles) * 100, 2) : 0}%
                </span>
              </div>
            </div>
          </ClayCard>

          {/* 2. BẢNG TÙY CHỌN ĐIỀU CHỈNH THÔNG SỐ Ở DƯỚI (BOTTOM CONTROL DOCK) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Thao tác */}
            <ClayCard glowColor="emerald" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Thao tác Mô phỏng
              </h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 mb-4 leading-relaxed font-normal">
                Thả ngẫu nhiên các cây kim dài <MathView math="\ell = 35" /> lên mặt phẳng có các đường kẻ song song cách nhau <MathView math="d = 50" />.
              </p>
              <div className="flex gap-2">
                <ClayButton variant="primary" size="sm" onClick={() => dropNeedles(100)} className="w-full text-xs sm:text-sm">
                  + 100 Kim
                </ClayButton>
                <ClayButton variant="secondary" size="sm" onClick={() => dropNeedles(1000)} className="w-full text-xs sm:text-sm">
                  + 1,000 Kim
                </ClayButton>
              </div>
            </ClayCard>

            {/* Card 2: Công thức Hình học Buffon */}
            <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Công thức Tích phân Buffon (1777)
              </h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 mb-2 font-medium">
                Xác suất cây kim cắt đường kẻ:
              </p>
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-center font-mono font-bold text-sky-700 dark:text-sky-300 text-sm sm:text-base">
                <MathView math="P = \frac{2\ell}{\pi d} \implies \pi = \frac{2\ell}{d \cdot P}" />
              </div>
            </ClayCard>

            {/* Card 3: Kết quả Ước lượng Pi */}
            <ClayCard glowColor="rose" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Ước lượng Số Pi
              </h4>
              <div className="space-y-2.5 text-sm sm:text-[15px]">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Giá trị Monte Carlo:</span>
                  <span className="font-mono font-black text-teal-600 dark:text-teal-400 text-base sm:text-lg">
                    {fmt(estimatedPi, 4)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Số Pi thực tế:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">3.14159...</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Sai số tuyệt đối:</span>
                  <span className="font-mono font-bold text-rose-500 text-sm sm:text-base">
                    {fmt(piError, 4)}
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

