import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { MathView } from '../../common/MathView';
import { fmt, binomialPmf, poissonPmf } from '../../../utils/math';

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
  let bars: Array<{ k: number; p: number }> = [];
  let mean = 0;
  let variance = 0;

  if (dist === 'binomial') {
    mean = binN * binP;
    variance = binN * binP * (1 - binP);
    for (let k = 0; k <= binN; k++) {
      bars.push({ k, p: binomialPmf(k, binN, binP) });
    }
  } else if (dist === 'poisson') {
    mean = poiLambda;
    variance = poiLambda;
    for (let k = 0; k <= 15; k++) {
      bars.push({ k, p: poissonPmf(k, poiLambda) });
    }
  } else {
    mean = 1 / geomP;
    variance = (1 - geomP) / (geomP * geomP);
    for (let k = 1; k <= 12; k++) {
      const prob = Math.pow(1 - geomP, k - 1) * geomP;
      bars.push({ k, p: prob });
    }
  }

  const maxP = Math.max(...bars.map((b) => b.p), 0.1);

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 3 & 4 — Biến ngẫu nhiên Rời rạc
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Hàm khối xác suất (PMF) & Kỳ vọng <MathView math="\mathbb{E}[X]" />
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setDist('binomial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              dist === 'binomial'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Nhị thức
          </button>
          <button
            onClick={() => setDist('poisson')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              dist === 'poisson'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Poisson
          </button>
          <button
            onClick={() => setDist('geometric')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all ${
              dist === 'geometric'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Hình học
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ClayCard glowColor="amber">
          <h3 className="font-heading font-bold text-lg mb-3">Tham số Phân bố</h3>

          {dist === 'binomial' && (
            <div className="space-y-3">
              <ClaySlider
                label="Số phép thử n"
                value={binN}
                min={1}
                max={25}
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

          <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs font-mono space-y-1">
            <div className="text-amber-900 dark:text-amber-200 font-bold">
              Kỳ vọng E[X] = {fmt(mean, 2)}
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Phương sai Var(X) = {fmt(variance, 2)}
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Độ lệch chuẩn sigma = {fmt(Math.sqrt(variance), 2)}
            </div>
          </div>
        </ClayCard>

        <div className="lg:col-span-2">
          <ClayCard glowColor="amber" className="p-6">
            <h4 className="font-heading font-bold mb-4">
              Biểu đồ Cột Hàm Khối Xác Suất PMF & Trọng tâm Kỳ vọng E[X]
            </h4>

            <div className="w-full h-72 bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
              <div className="w-full h-full flex items-end gap-1.5 px-4 pb-4">
                {bars.map((b) => (
                  <div key={b.k} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-sky-600 dark:bg-sky-500 rounded-t-sm"
                      style={{ height: `${(b.p / maxP) * 160}px` }}
                      title={`P(X = ${b.k}) = ${fmt(b.p, 4)}`}
                    />
                    <span className="text-[10px] font-mono text-slate-400">{b.k}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                <span>Vị trí E[X] = {fmt(mean, 2)} đóng vai trò là trọng tâm vật lý cân bằng khối lượng xác suất.</span>
              </div>
            </div>
          </ClayCard>
        </div>
      </div>
    </div>
  );
};
