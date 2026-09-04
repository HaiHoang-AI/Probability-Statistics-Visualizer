import React, { useState, useEffect } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, normalPdf, normalCdf } from '../../../utils/math';

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
    const lineDistance = 40;
    const needleLength = 30;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * 300;
      const y = Math.random() * 160;
      const angle = Math.random() * Math.PI;

      // Distance from center to nearest line
      const d = y % lineDistance;
      const distToLine = Math.min(d, lineDistance - d);
      const halfProjection = (needleLength / 2) * Math.sin(angle);
      const crosses = distToLine <= halfProjection;

      if (crosses) newCrosses++;
      newNeedles.push({ x, y, angle, crosses });
    }

    setTotalNeedles((t) => t + count);
    setCrossNeedles((c) => c + newCrosses);
    setNeedles((prev) => [...prev.slice(-150), ...newNeedles]);
  };

  const estimatedPi = crossNeedles > 0 ? (2 * 30 * totalNeedles) / (40 * crossNeedles) : 0;

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 5 & 6 — Biến ngẫu nhiên Liên tục
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Phân bố Chuẩn Gauss <MathView math="\mathcal{N}(\mu, \sigma^2)" /> & Kim Buffon
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSub('normal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              activeSub === 'normal'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Chuẩn Gauss
          </button>
          <button
            onClick={() => setActiveSub('buffon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              activeSub === 'buffon'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Cây kim Buffon
          </button>
        </div>
      </div>

      {activeSub === 'normal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ClayCard glowColor="blue">
            <h3 className="font-heading font-bold text-lg mb-3">Tham số Chuẩn N(μ, σ²)</h3>
            <ClaySlider
              label="Kỳ vọng mu"
              value={mu}
              min={-3}
              max={3}
              step={0.2}
              color="blue"
              onChange={setMu}
            />
            <ClaySlider
              label="Độ lệch chuẩn sigma"
              value={sigma}
              min={0.4}
              max={2.5}
              step={0.1}
              color="blue"
              onChange={setSigma}
            />
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <ClaySlider
                label="Cận dưới X1"
                value={rangeX1}
                min={-4}
                max={rangeX2 - 0.2}
                step={0.1}
                color="orange"
                onChange={setRangeX1}
              />
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

            <div className="mt-4 p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-xs font-mono">
              <div className="text-teal-800 dark:text-teal-200 font-bold text-sm">
                P({fmt(rangeX1, 1)} ≤ X ≤ {fmt(rangeX2, 1)}) = {fmt(pArea * 100, 2)}%
              </div>
              <div className="text-slate-500 font-sans mt-1">
                Quy tắc thực nghiệm: 1-sigma ≈ 68.26%, 2-sigma ≈ 95.44%, 3-sigma ≈ 99.74%.
              </div>
            </div>
          </ClayCard>

          <div className="lg:col-span-2">
            <ClayCard glowColor="blue" className="p-6">
              <h4 className="font-heading font-bold mb-4">
                Hàm Mật độ Xác suất (PDF) & Diện tích Tích phân
              </h4>

              <div className="w-full h-72 bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
                <svg viewBox="-5 0 10 1" className="w-full h-full">
                  <line x1="-5" y1="0.95" x2="5" y2="0.95" stroke="#475569" strokeWidth="0.01" />

                  {/* Shaded Area between rangeX1 and rangeX2 */}
                  <path
                    d={(() => {
                      const pts = [];
                      for (let x = rangeX1; x <= rangeX2; x += 0.05) {
                        pts.push(`${x},${0.95 - normalPdf(x, mu, sigma) * 0.9}`);
                      }
                      return `M ${rangeX1},0.95 L ${pts.join(' L ')} L ${rangeX2},0.95 Z`;
                    })()}
                    fill="rgba(59, 130, 246, 0.4)"
                  />

                  {/* Normal Curve */}
                  <path
                    d={Array.from({ length: 120 }, (_, i) => {
                      const x = -5 + (i / 120) * 10;
                      const y = 0.95 - normalPdf(x, mu, sigma) * 0.9;
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="0.025"
                  />
                </svg>

                <div className="flex justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span className="text-blue-400 font-bold">Vùng diện tích = {fmt(pArea * 100, 2)}%</span>
                  <span className="font-mono">
                    <MathView math="f(x) = \frac{1}{\sqrt{2\pi\sigma^2}}e^{-\frac{(x-\mu)^2}{2\sigma^2}}" />
                  </span>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      ) : (
        <ClayCard glowColor="blue" className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="font-heading font-bold text-lg">
                Thả Kim Buffon Ước lượng Số Pi (Monte Carlo)
              </h4>
              <p className="text-xs text-slate-500">
                Công thức lý thuyết: <MathView math="P = \frac{2\ell}{\pi d} \implies \pi \approx \frac{2\ell \cdot N_{tổng}}{d \cdot N_{cắt}}" />
              </p>
            </div>

            <div className="flex gap-2">
              <ClayButton variant="primary" size="sm" onClick={() => dropNeedles(50)}>
                + Thả 50 Cây kim
              </ClayButton>
              <ClayButton variant="outline" size="sm" onClick={() => dropNeedles(500)}>
                + Thả 500 Cây kim
              </ClayButton>
              <ClayButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setTotalNeedles(0);
                  setCrossNeedles(0);
                  setNeedles([]);
                }}
              >
                Đặt lại
              </ClayButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-64 bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden">
              <svg viewBox="0 0 300 160" className="w-full h-full">
                {/* Parallel lines at y = 40, 80, 120 */}
                <line x1="0" y1="40" x2="300" y2="40" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="300" y2="120" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Needles */}
                {needles.map((nd, idx) => {
                  const dx = (30 / 2) * Math.cos(nd.angle);
                  const dy = (30 / 2) * Math.sin(nd.angle);
                  return (
                    <line
                      key={idx}
                      x1={nd.x - dx}
                      y1={nd.y - dy}
                      x2={nd.x + dx}
                      y2={nd.y + dy}
                      stroke={nd.crosses ? '#EF4444' : '#10B981'}
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 flex flex-col justify-between text-center font-mono">
              <div>
                <span className="text-xs text-slate-500 font-sans block mb-1">
                  Ước lượng Số Pi Hiện tại:
                </span>
                <span className="text-4xl font-black text-teal-600 dark:text-teal-400">
                  {fmt(estimatedPi, 4)}
                </span>
                <span className="text-xs text-slate-400 font-sans block mt-1">
                  Giá trị thực: π ≈ 3.14159
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-3 border-t border-teal-200">
                <div>Tổng số kim: {totalNeedles}</div>
                <div className="text-red-500 font-bold">Cắt đường kẻ: {crossNeedles}</div>
              </div>
            </div>
          </div>
        </ClayCard>
      )}
    </div>
  );
};
