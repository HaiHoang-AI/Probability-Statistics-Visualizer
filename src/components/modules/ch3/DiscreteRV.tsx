import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { MathView } from '../../common/MathView';
import { fmt, binomialPmf, poissonPmf } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';

export const DiscreteRV: React.FC = () => {
  const [dist, setDist] = useState<'binomial' | 'poisson' | 'geometric'>('binomial');

  // Binomial state
  const [binN, setBinN] = useState<number>(10);
  const [binP, setBinP] = useState<number>(0.5);

  // Poisson state
  const [poiLambda, setPoiLambda] = useState<number>(4.0);

  // Geometric state
  const [geomP, setGeomP] = useState<number>(0.3);

  // Compute PMF points
  const bars: Array<{ k: number; p: number }> = [];
  let mean = 0;
  let variance = 0;
  let pmfFormula = '';

  if (dist === 'binomial') {
    mean = binN * binP;
    variance = binN * binP * (1 - binP);
    pmfFormula = `P(X=k) = \\binom{${binN}}{k} (${fmt(binP, 2)})^k (1 - ${fmt(binP, 2)})^{${binN}-k}`;
    for (let k = 0; k <= binN; k++) {
      bars.push({ k, p: binomialPmf(k, binN, binP) });
    }
  } else if (dist === 'poisson') {
    mean = poiLambda;
    variance = poiLambda;
    pmfFormula = `P(X=k) = \\frac{${poiLambda}^k e^{-${poiLambda}}}{k!}`;
    for (let k = 0; k <= 15; k++) {
      bars.push({ k, p: poissonPmf(k, poiLambda) });
    }
  } else {
    mean = 1 / geomP;
    variance = (1 - geomP) / (geomP * geomP);
    pmfFormula = `P(X=k) = (1 - ${fmt(geomP, 2)})^{k-1} (${fmt(geomP, 2)})`;
    for (let k = 1; k <= 12; k++) {
      const prob = Math.pow(1 - geomP, k - 1) * geomP;
      bars.push({ k, p: prob });
    }
  }

  const maxP = Math.max(...bars.map((b) => b.p), 0.05);
  const sigma = Math.sqrt(variance);

  // SVG coordinate transformation
  const numBars = bars.length;
  const leftX = 100;
  const rightX = 740;
  const usableWidth = rightX - leftX;
  const barSlotWidth = usableWidth / Math.max(numBars, 1);
  const barWidth = Math.min(barSlotWidth * 0.75, 45);

  const mapKtoX = (k: number) => {
    const minK = bars[0]?.k ?? 0;
    const maxK = bars[bars.length - 1]?.k ?? 1;
    if (maxK === minK) return leftX + usableWidth / 2;
    return leftX + ((k - minK) / (maxK - minK)) * (usableWidth - barWidth) + barWidth / 2;
  };

  const mapPtoY = (p: number) => 330 - (p / (maxP * 1.15)) * 260;

  return (
    <div className="space-y-6">
      {/* Chapter Subtitle & Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 3 & 4 — Biến ngẫu nhiên Rời rạc
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Hàm khối xác suất (PMF) & Trọng tâm Kỳ vọng <MathView math="\mathbb{E}[X]" />
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setDist('binomial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              dist === 'binomial'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Nhị thức Binomial
          </button>
          <button
            onClick={() => setDist('poisson')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              dist === 'poisson'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Poisson
          </button>
          <button
            onClick={() => setDist('geometric')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              dist === 'geometric'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Hình học Geometric
          </button>
        </div>
      </div>

      {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA (DESMOS 3D VIEWPORT) */}
      <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
        <DesmosStageHeader
          title="Hàm Khối Xác Suất PMF & Trọng Tâm Vật Lý Kỳ Vọng E[X]"
          formula={`\\mathbb{E}[X] = ${fmt(mean, 2)}`}
          badge={`Var(X) = ${fmt(variance, 2)}`}
          onReset={() => {
            setDist('binomial');
            setBinN(10);
            setBinP(0.5);
          }}
        />

        <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
          <svg viewBox="0 0 800 380" className="w-full h-auto select-none">
            <defs>
              <marker id="arrow-pmf-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
              </marker>
              <marker id="arrow-pmf-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
              </marker>
            </defs>

            {/* Desmos Cartesian Axes */}
            <line x1="60" y1="330" x2="760" y2="330" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-pmf-x)" />
            <line x1="80" y1="350" x2="80" y2="30" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-pmf-y)" />
            <text x="770" y="334" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">k</text>
            <text x="80" y="20" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">P(X=k)</text>

            {/* PMF Bars */}
            {bars.map((b) => {
              const cx = mapKtoX(b.k);
              const topY = mapPtoY(b.p);
              const h = Math.max(0, 330 - topY);

              return (
                <g key={b.k}>
                  {/* Bar */}
                  <rect
                    x={cx - barWidth / 2}
                    y={topY}
                    width={barWidth}
                    height={h}
                    rx="4"
                    fill="#0284C7"
                    stroke="#0F172A"
                    strokeWidth="1.5"
                    className="hover:fill-sky-400 transition-colors"
                  />
                  {/* Probability value label if significant */}
                  {b.p > maxP * 0.08 && (
                    <text
                      x={cx}
                      y={topY - 6}
                      fill="#0284C7"
                      className="dark:fill-sky-400"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {fmt(b.p, 3)}
                    </text>
                  )}
                  {/* k label on x-axis */}
                  <text
                    x={cx}
                    y="348"
                    fill="#64748B"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {b.k}
                  </text>
                </g>
              );
            })}

            {/* 1-Sigma Band [E[X]-sigma, E[X]+sigma] */}
            {(() => {
              const xLeft = mapKtoX(Math.max(bars[0]?.k ?? 0, mean - sigma));
              const xRight = mapKtoX(Math.min(bars[bars.length - 1]?.k ?? 15, mean + sigma));
              return (
                <g>
                  <line x1={xLeft} y1="50" x2={xRight} y2="50" stroke="#F59E0B" strokeWidth="2.5" />
                  <line x1={xLeft} y1="44" x2={xLeft} y2="56" stroke="#F59E0B" strokeWidth="2" />
                  <line x1={xRight} y1="44" x2={xRight} y2="56" stroke="#F59E0B" strokeWidth="2" />
                  <text x={(xLeft + xRight) / 2} y="42" fill="#F59E0B" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    Dải ±1σ = [{fmt(mean - sigma, 1)}, {fmt(mean + sigma, 1)}]
                  </text>
                </g>
              );
            })()}

            {/* Mean E[X] Fulcrum (Trọng tâm) Indicator */}
            {(() => {
              const meanX = mapKtoX(mean);
              return (
                <g>
                  <line x1={meanX} y1="65" x2={meanX} y2="330" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="5 3" />
                  {/* Fulcrum Triangle */}
                  <polygon
                    points={`${meanX - 8},342 ${meanX + 8},342 ${meanX},330`}
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <text
                    x={meanX}
                    y="80"
                    fill="#EF4444"
                    fontSize="12"
                    fontWeight="black"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    E[X] = {fmt(mean, 2)}
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Bottom Stage Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                <span className="w-3 h-3 bg-sky-500 rounded-sm"></span> Cột xác suất P(X = k)
              </span>
              <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
                <span className="w-3.5 h-0.5 bg-red-500 border-dashed"></span> Trọng tâm vật lý E[X] = {fmt(mean, 2)}
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span className="w-3.5 h-0.5 bg-amber-500"></span> Dải độ lệch chuẩn ±1σ
              </span>
            </div>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
              Độ lệch chuẩn σ = {fmt(sigma, 2)}
            </span>
          </div>
        </div>
      </ClayCard>

      {/* 2. BẢNG TÙY CHỌN ĐIỀU CHỈNH THÔNG SỐ Ở DƯỚI (BOTTOM CONTROL DOCK) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Sliders */}
        <ClayCard glowColor="amber" className="p-5">
          <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Điều chỉnh Tham số
          </h4>

          {dist === 'binomial' && (
            <div className="space-y-3">
              <ClaySlider
                label="Số phép thử n"
                value={binN}
                min={1}
                max={20}
                step={1}
                color="orange"
                onChange={setBinN}
              />
              <ClaySlider
                label="Xác suất thành công p"
                value={binP}
                min={0.05}
                max={0.95}
                step={0.05}
                color="orange"
                formatValue={(v) => fmt(v, 2)}
                onChange={setBinP}
              />
            </div>
          )}

          {dist === 'poisson' && (
            <ClaySlider
              label="Tần suất trung bình lambda"
              value={poiLambda}
              min={0.5}
              max={10}
              step={0.5}
              color="amber"
              onChange={setPoiLambda}
            />
          )}

          {dist === 'geometric' && (
            <ClaySlider
              label="Xác suất thành công p"
              value={geomP}
              min={0.1}
              max={0.9}
              step={0.05}
              color="emerald"
              formatValue={(v) => fmt(v, 2)}
              onChange={setGeomP}
            />
          )}
        </ClayCard>

        {/* Card 2: Công thức Toán học */}
        <ClayCard glowColor="blue" className="p-5">
          <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Công thức Khối Xác suất
          </h4>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 mb-2 font-medium">
            Hàm PMF gán khối lượng xác suất cụ thể cho từng giá trị <MathView math="k" />:
          </p>
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-center font-mono font-bold text-sky-700 dark:text-sky-300 text-sm sm:text-base">
            <MathView math={pmfFormula} />
          </div>
        </ClayCard>

        {/* Card 3: Thống kê Moment */}
        <ClayCard glowColor="emerald" className="p-5">
          <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Đặc trưng Số của Phân bố
          </h4>
          <div className="space-y-2.5 text-sm sm:text-[15px]">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Kỳ vọng E[X]:</span>
              <span className="font-mono font-black text-red-600 dark:text-red-400 text-base sm:text-lg">
                {fmt(mean, 2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Phương sai Var(X):</span>
              <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                {fmt(variance, 2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Độ lệch chuẩn sigma:</span>
              <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-base sm:text-lg">
                {fmt(sigma, 2)}
              </span>
            </div>
          </div>
        </ClayCard>
      </div>
    </div>
  );
};

