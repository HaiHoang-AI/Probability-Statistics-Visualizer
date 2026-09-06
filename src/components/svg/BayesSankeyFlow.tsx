import React from 'react';
import { fmt } from '../../utils/math';

interface BayesSankeyFlowProps {
  prevalence: number; // P(D) in [0.001, 0.2]
  sensitivity: number; // P(+|D) in [0.5, 0.99]
  falsePositiveRate: number; // P(+|~D) in [0.01, 0.3]
}

export const BayesSankeyFlow: React.FC<BayesSankeyFlowProps> = ({
  prevalence,
  sensitivity,
  falsePositiveRate,
}) => {
  // Probabilities calculation
  const pD = prevalence;
  const pNotD = 1 - prevalence;

  const pTP = pD * sensitivity; // True positive
  const pFN = pD * (1 - sensitivity); // False negative
  const pFP = pNotD * falsePositiveRate; // False positive
  const pTN = pNotD * (1 - falsePositiveRate); // True negative

  const pPos = pTP + pFP; // Total positive evidence P(+)
  const posterior = pPos > 0 ? pTP / pPos : 0; // P(D|+)

  // SVG Geometry Dimensions
  const svgWidth = 860;
  const svgHeight = 420;

  const col1X = 50; // Prior column
  const col2X = 320; // Disease partition
  const col3X = 590; // Test result partition
  const col4X = 810; // Final Posterior Evidence

  const topY = 40;
  const usableH = 340;

  // Heights in Col 1 (Total Population = 100%)
  const priorH = usableH;
  const priorY = topY;

  // Heights in Col 2
  // Visual amplification factor for small prevalence so it remains clearly visible
  // We compute visual height using non-linear boost for tiny fractions while keeping labels mathematically exact!
  const visualScale = (val: number) => {
    // Square root compression so 0.001 (0.1%) doesn't collapse to 0.3px
    return Math.max(8, Math.pow(val, 0.55) * usableH * 0.7);
  };

  const hD = Math.max(14, Math.min(usableH * 0.45, visualScale(pD)));
  const hNotD = usableH - hD - 20;

  const yD = topY;
  const yNotD = topY + hD + 20;

  // Heights in Col 3 (Test Results)
  const hTP = Math.max(8, hD * sensitivity);
  const hFN = Math.max(4, hD * (1 - sensitivity));
  const yTP = yD;
  const yFN = yD + hTP + 6;

  const hFP = Math.max(12, hNotD * falsePositiveRate);
  const hTN = Math.max(16, hNotD * (1 - falsePositiveRate));
  const yFP = yNotD;
  const yTN = yNotD + hFP + 10;

  // Heights in Col 4 (Evidence Pool: Positive Test Cases)
  const poolH = hTP + hFP + 10;
  const poolY = (usableH - poolH) / 2 + topY;
  const poolTP_H = (hTP / (hTP + hFP)) * poolH;
  const poolFP_H = poolH - poolTP_H;

  // Cubic Bézier Ribbon generator
  const createRibbon = (
    x0: number,
    y0: number,
    h0: number,
    x1: number,
    y1: number,
    h1: number
  ) => {
    const midX = (x0 + x1) / 2;
    return `
      M ${x0} ${y0}
      C ${midX} ${y0}, ${midX} ${y1}, ${x1} ${y1}
      L ${x1} ${y1 + h1}
      C ${midX} ${y1 + h1}, ${midX} ${y0 + h0}, ${x0} ${y0 + h0}
      Z
    `;
  };

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full min-w-[700px] h-auto select-none font-sans">
          <defs>
            {/* Gradients */}
            <linearGradient id="flow-d-tp" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="flow-d-fn" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F87171" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="flow-notd-fp" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="flow-notd-tn" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="flow-tp-pool" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#B91C1C" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="flow-fp-pool" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Flow Ribbons from Col 1 to Col 2 */}
          <path
            d={createRibbon(col1X + 24, priorY, (pD / 1.0) * priorH, col2X, yD, hD)}
            fill="url(#flow-d-tp)"
            className="transition-all duration-300"
          />
          <path
            d={createRibbon(col1X + 24, priorY + (pD / 1.0) * priorH, priorH - (pD / 1.0) * priorH, col2X, yNotD, hNotD)}
            fill="url(#flow-notd-tn)"
            className="transition-all duration-300"
          />

          {/* Flow Ribbons from Col 2 to Col 3 */}
          {/* Disease -> TP */}
          <path
            d={createRibbon(col2X + 24, yD, hTP, col3X, yTP, hTP)}
            fill="url(#flow-d-tp)"
            className="transition-all duration-300"
          />
          {/* Disease -> FN */}
          <path
            d={createRibbon(col2X + 24, yD + hTP, hFN, col3X, yFN, hFN)}
            fill="url(#flow-d-fn)"
            className="transition-all duration-300"
          />
          {/* Healthy -> FP */}
          <path
            d={createRibbon(col2X + 24, yNotD, hFP, col3X, yFP, hFP)}
            fill="url(#flow-notd-fp)"
            className="transition-all duration-300"
          />
          {/* Healthy -> TN */}
          <path
            d={createRibbon(col2X + 24, yNotD + hFP, hTN, col3X, yTN, hTN)}
            fill="url(#flow-notd-tn)"
            className="transition-all duration-300"
          />

          {/* Convergence Flows into Col 4 (Evidence Pool of Positive Tests) */}
          {/* TP into pool */}
          <path
            d={createRibbon(col3X + 24, yTP, hTP, col4X, poolY, poolTP_H)}
            fill="url(#flow-tp-pool)"
            className="transition-all duration-300"
          />
          {/* FP into pool */}
          <path
            d={createRibbon(col3X + 24, yFP, hFP, col4X, poolY + poolTP_H, poolFP_H)}
            fill="url(#flow-fp-pool)"
            className="transition-all duration-300"
          />

          {/* Stage Node Blocks (Vertical Pillars) */}
          {/* Col 1: Total Population */}
          <rect x={col1X} y={priorY} width="24" height={priorH} rx="6" fill="#64748B" stroke="#0F172A" strokeWidth="2" />
          <text x={col1X + 12} y={topY - 14} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#64748B">
            Dân số 100%
          </text>

          {/* Col 2: Prior Partition */}
          {/* D+ */}
          <rect x={col2X} y={yD} width="24" height={hD} rx="6" fill="#EF4444" stroke="#0F172A" strokeWidth="2" />
          <text x={col2X + 12} y={yD - 12} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#EF4444">
            Bệnh P(D) = {(pD * 100).toFixed(2)}%
          </text>

          {/* D- */}
          <rect x={col2X} y={yNotD} width="24" height={hNotD} rx="6" fill="#0EA5E9" stroke="#0F172A" strokeWidth="2" />
          <text x={col2X + 12} y={yNotD + hNotD + 18} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0EA5E9">
            Khỏe mạnh {(pNotD * 100).toFixed(1)}%
          </text>

          {/* Col 3: Likelihood Partitions */}
          {/* TP */}
          <rect x={col3X} y={yTP} width="24" height={hTP} rx="4" fill="#DC2626" stroke="#0F172A" strokeWidth="1.5" />
          <text x={col3X + 32} y={yTP + hTP / 2 + 4} fontSize="10" fontWeight="bold" fill="#DC2626">
            Dương tính thật TP: {(pTP * 100).toFixed(2)}%
          </text>

          {/* FN */}
          <rect x={col3X} y={yFN} width="24" height={hFN} rx="4" fill="#F87171" stroke="#0F172A" strokeWidth="1.5" />
          <text x={col3X + 32} y={yFN + hFN / 2 + 4} fontSize="10" fill="#94A3B8">
            Âm tính giả FN: {(pFN * 100).toFixed(2)}%
          </text>

          {/* FP */}
          <rect x={col3X} y={yFP} width="24" height={hFP} rx="4" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.5" />
          <text x={col3X + 32} y={yFP + hFP / 2 + 4} fontSize="10" fontWeight="bold" fill="#D97706">
            Dương tính giả FP: {(pFP * 100).toFixed(2)}%
          </text>

          {/* TN */}
          <rect x={col3X} y={yTN} width="24" height={hTN} rx="4" fill="#10B981" stroke="#0F172A" strokeWidth="1.5" />
          <text x={col3X + 32} y={yTN + hTN / 2 + 4} fontSize="10" fill="#10B981">
            Âm tính thật TN: {(pTN * 100).toFixed(1)}%
          </text>

          {/* Col 4: Evidence Pool P(+) & Posterior */}
          <rect x={col4X} y={poolY} width="24" height={poolTP_H} rx="4" fill="#DC2626" stroke="#0F172A" strokeWidth="2" />
          <rect x={col4X} y={poolY + poolTP_H} width="24" height={poolFP_H} rx="4" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />

          {/* Final Callout Bubble */}
          <g transform={`translate(${col4X - 110}, ${poolY + poolH + 25})`}>
            <rect x="0" y="0" width="150" height="42" rx="10" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
            <text x="75" y="16" textAnchor="middle" fontSize="10" fill="#94A3B8">
              P(Bệnh | Dương tính)
            </text>
            <text x="75" y="32" textAnchor="middle" fontSize="13" fontWeight="black" fill="#38BDF8" fontFamily="monospace">
              {(posterior * 100).toFixed(1)}%
            </text>
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
          <div className="font-bold text-red-800 dark:text-red-300">Dương tính Thật (TP)</div>
          <div className="text-red-600 dark:text-red-400 font-mono text-sm font-black">
            P(D ∩ +) = {(pTP * 100).toFixed(3)}%
          </div>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
          <div className="font-bold text-amber-800 dark:text-amber-300">Dương tính Giả (FP)</div>
          <div className="text-amber-600 dark:text-amber-400 font-mono text-sm font-black">
            P(¬D ∩ +) = {(pFP * 100).toFixed(3)}%
          </div>
        </div>
        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900">
          <div className="font-bold text-sky-800 dark:text-sky-300">Xác suất Hậu nghiệm P(D|+)</div>
          <div className="text-sky-600 dark:text-sky-400 font-mono text-base font-black">
            {fmt(posterior * 100, 2)}%
          </div>
        </div>
      </div>
    </div>
  );
};
