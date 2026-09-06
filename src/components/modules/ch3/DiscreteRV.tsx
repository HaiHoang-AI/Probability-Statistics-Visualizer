import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, binomialPmf, poissonPmf } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';

type DiscreteDistType = 'bernoulli' | 'uniform' | 'binomial' | 'geometric' | 'poisson';

export const DiscreteRV: React.FC = () => {
  const [dist, setDist] = useState<DiscreteDistType>('bernoulli');

  // Bernoulli state
  const [bernP, setBernP] = useState<number>(0.6);
  const [bernTrials, setBernTrials] = useState<{ total: number; n0: number; n1: number }>({
    total: 0,
    n0: 0,
    n1: 0,
  });
  const [lastBernFlip, setLastBernFlip] = useState<number | null>(null);

  // Uniform state
  const [unifA, setUnifA] = useState<number>(1);
  const [unifB, setUnifB] = useState<number>(6);
  const [unifTrials, setUnifTrials] = useState<{ total: number; counts: Record<number, number> }>({
    total: 0,
    counts: {},
  });
  const [lastUnifRoll, setLastUnifRoll] = useState<number | null>(null);

  // Binomial state
  const [binN, setBinN] = useState<number>(10);
  const [binP, setBinP] = useState<number>(0.5);

  // Poisson state
  const [poiLambda, setPoiLambda] = useState<number>(4.0);

  // Geometric state
  const [geomP, setGeomP] = useState<number>(0.3);

  // Bernoulli simulation helpers
  const runBernoulliTrials = (count: number) => {
    let add0 = 0;
    let add1 = 0;
    let last = 0;
    for (let i = 0; i < count; i++) {
      const outcome = Math.random() < bernP ? 1 : 0;
      if (outcome === 1) add1++;
      else add0++;
      last = outcome;
    }
    setLastBernFlip(last);
    setBernTrials((prev) => ({
      total: prev.total + count,
      n0: prev.n0 + add0,
      n1: prev.n1 + add1,
    }));
  };

  const resetBernoulli = () => {
    setBernTrials({ total: 0, n0: 0, n1: 0 });
    setLastBernFlip(null);
  };

  // Uniform simulation helpers
  const runUniformTrials = (count: number) => {
    const range = unifB - unifA + 1;
    if (range <= 0) return;
    const addCounts: Record<number, number> = {};
    let last = unifA;
    for (let i = 0; i < count; i++) {
      const val = unifA + Math.floor(Math.random() * range);
      addCounts[val] = (addCounts[val] || 0) + 1;
      last = val;
    }
    setLastUnifRoll(last);
    setUnifTrials((prev) => {
      const newCounts = { ...prev.counts };
      for (const k in addCounts) {
        newCounts[k] = (newCounts[k] || 0) + addCounts[k];
      }
      return {
        total: prev.total + count,
        counts: newCounts,
      };
    });
  };

  const resetUniform = () => {
    setUnifTrials({ total: 0, counts: {} });
    setLastUnifRoll(null);
  };

  // Compute PMF points & statistics
  const bars: Array<{ k: number; p: number; empCount?: number; empP?: number }> = [];
  let mean = 0;
  let variance = 0;
  let pmfFormula = '';
  let interpretation = '';
  let empiricalMean: number | null = null;

  if (dist === 'bernoulli') {
    mean = bernP;
    variance = bernP * (1 - bernP);
    pmfFormula = `P(X=k) = (${fmt(bernP, 2)})^k (1 - ${fmt(bernP, 2)})^{1-k}, \\quad k \\in \\{0, 1\\}`;
    interpretation = `Phân bố Bernoulli mô tả một phép thử nhị phân: X = 1 (Thành công, p = ${fmt(bernP, 2)}) và X = 0 (Thất bại, q = ${fmt(1 - bernP, 2)}).`;

    const emp0 = bernTrials.total > 0 ? bernTrials.n0 / bernTrials.total : undefined;
    const emp1 = bernTrials.total > 0 ? bernTrials.n1 / bernTrials.total : undefined;
    if (bernTrials.total > 0) {
      empiricalMean = bernTrials.n1 / bernTrials.total;
    }

    bars.push({ k: 0, p: 1 - bernP, empCount: bernTrials.n0, empP: emp0 });
    bars.push({ k: 1, p: bernP, empCount: bernTrials.n1, empP: emp1 });
  } else if (dist === 'uniform') {
    const safeB = Math.max(unifA + 1, unifB);
    const N = safeB - unifA + 1;
    mean = (unifA + safeB) / 2;
    variance = (N * N - 1) / 12;
    pmfFormula = `P(X=k) = \\frac{1}{${N}} = ${fmt(1 / N, 3)}, \\quad k \\in \\{${unifA}, \\dots, ${safeB}\\}`;
    interpretation = `Phân bố Đều rời rạc gán xác suất bằng nhau tuyệt đối 1/${N} cho mỗi giá trị nguyên từ ${unifA} đến ${safeB}.`;

    let sumEmp = 0;
    for (let k = unifA; k <= safeB; k++) {
      const cnt = unifTrials.counts[k] || 0;
      const emp = unifTrials.total > 0 ? cnt / unifTrials.total : undefined;
      if (unifTrials.total > 0) sumEmp += k * cnt;
      bars.push({ k, p: 1 / N, empCount: cnt, empP: emp });
    }
    if (unifTrials.total > 0) {
      empiricalMean = sumEmp / unifTrials.total;
    }
  } else if (dist === 'binomial') {
    mean = binN * binP;
    variance = binN * binP * (1 - binP);
    pmfFormula = `P(X=k) = \\binom{${binN}}{k} (${fmt(binP, 2)})^k (1 - ${fmt(binP, 2)})^{${binN}-k}`;
    interpretation = `Phân bố Nhị thức đếm tổng số lần thành công trong ${binN} phép thử Bernoulli độc lập có cùng xác suất p = ${fmt(binP, 2)}.`;
    for (let k = 0; k <= binN; k++) {
      bars.push({ k, p: binomialPmf(k, binN, binP) });
    }
  } else if (dist === 'poisson') {
    mean = poiLambda;
    variance = poiLambda;
    pmfFormula = `P(X=k) = \\frac{${poiLambda}^k e^{-${poiLambda}}}{k!}`;
    interpretation = `Phân bố Poisson mô hình hóa số biến cố xảy ra trong một khoảng thời gian hoặc không gian cố định với tần suất trung bình λ = ${poiLambda}.`;
    const maxK = Math.max(15, Math.ceil(poiLambda + 4 * Math.sqrt(poiLambda)));
    for (let k = 0; k <= maxK; k++) {
      bars.push({ k, p: poissonPmf(k, poiLambda) });
    }
  } else {
    mean = 1 / geomP;
    variance = (1 - geomP) / (geomP * geomP);
    pmfFormula = `P(X=k) = (1 - ${fmt(geomP, 2)})^{k-1} (${fmt(geomP, 2)})`;
    interpretation = `Phân bố Hình học đếm số phép thử cần thực hiện cho đến khi xuất hiện lần thành công đầu tiên (với xác suất p = ${fmt(geomP, 2)}).`;
    for (let k = 1; k <= 12; k++) {
      const prob = Math.pow(1 - geomP, k - 1) * geomP;
      bars.push({ k, p: prob });
    }
  }

  const maxP = Math.max(
    ...bars.map((b) => Math.max(b.p, b.empP ?? 0)),
    0.05
  );
  const sigma = Math.sqrt(variance);

  // SVG coordinate transformation
  const numBars = bars.length;
  const leftX = 100;
  const rightX = 740;
  const usableWidth = rightX - leftX;
  const barSlotWidth = usableWidth / Math.max(numBars, 1);
  const barWidth = Math.min(barSlotWidth * 0.7, 50);

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
            Hàm khối xác suất (PMF) & Trọng tâm Kỳ vọng <MathView math="\\mathbb{E}[X]" />
          </h2>
        </div>

        {/* 5 Distribution Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'bernoulli', label: '1. Bernoulli' },
              { id: 'uniform', label: '2. Đều Rời rạc' },
              { id: 'binomial', label: '3. Nhị thức' },
              { id: 'geometric', label: '4. Hình học' },
              { id: 'poisson', label: '5. Poisson' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setDist(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                dist === t.id
                  ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
          {/* Card 1: Điều khiển tham số */}
          <ClayCard glowColor="amber" className="p-5">
            <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              {dist === 'bernoulli' && 'Tham số Bernoulli (p)'}
              {dist === 'uniform' && 'Tham số Phân bố Đều U{a, b}'}
              {dist === 'binomial' && 'Tham số Nhị thức B(n, p)'}
              {dist === 'poisson' && 'Tham số Poisson (λ)'}
              {dist === 'geometric' && 'Tham số Hình học Geom(p)'}
            </h4>

            {dist === 'bernoulli' && (
              <div className="space-y-4">
                <ClaySlider
                  label="Xác suất thành công p"
                  value={bernP}
                  min={0.01}
                  max={0.99}
                  step={0.01}
                  color="emerald"
                  formatValue={(v) => fmt(v, 2)}
                  onChange={(val) => {
                    setBernP(val);
                    resetBernoulli();
                  }}
                />

                {/* Bernoulli Trials Box */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Mô phỏng Thử nghiệm Tung lật
                    </span>
                    {lastBernFlip !== null && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold font-mono ${
                          lastBernFlip === 1
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        Vừa ra: X = {lastBernFlip} ({lastBernFlip === 1 ? 'Thành công' : 'Thất bại'})
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    <ClayButton variant="primary" size="sm" onClick={() => runBernoulliTrials(1)}>
                      +1 lần
                    </ClayButton>
                    <ClayButton variant="secondary" size="sm" onClick={() => runBernoulliTrials(10)}>
                      +10 lần
                    </ClayButton>
                    <ClayButton variant="outline" size="sm" onClick={() => runBernoulliTrials(100)}>
                      +100 lần
                    </ClayButton>
                  </div>
                  {bernTrials.total > 0 && (
                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Đã thử: <strong className="text-slate-800 dark:text-slate-200">{bernTrials.total}</strong> lần
                      </span>
                      <button
                        onClick={resetBernoulli}
                        className="text-xs text-rose-500 hover:text-rose-600 font-bold underline cursor-pointer"
                      >
                        Đặt lại đếm
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {dist === 'uniform' && (
              <div className="space-y-4">
                {/* Quick Presets */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                    Tình huống mô hình thực tế:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setUnifA(1);
                        setUnifB(6);
                        resetUniform();
                      }}
                      className="px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      🎲 Xúc xắc 6 mặt (1-6)
                    </button>
                    <button
                      onClick={() => {
                        setUnifA(1);
                        setUnifB(12);
                        resetUniform();
                      }}
                      className="px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      🎲 Xúc xắc 12 mặt (D12)
                    </button>
                    <button
                      onClick={() => {
                        setUnifA(1);
                        setUnifB(10);
                        resetUniform();
                      }}
                      className="px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      🎟️ Bốc thăm 10 số (1-10)
                    </button>
                    <button
                      onClick={() => {
                        setUnifA(0);
                        setUnifB(1);
                        resetUniform();
                      }}
                      className="px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      🪙 Đồng xu nhị phân {'{0, 1}'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ClaySlider
                    label="Cận dưới a"
                    value={unifA}
                    min={0}
                    max={5}
                    step={1}
                    color="amber"
                    onChange={(val) => {
                      setUnifA(val);
                      if (unifB <= val) setUnifB(val + 1);
                      resetUniform();
                    }}
                  />
                  <ClaySlider
                    label="Cận trên b"
                    value={unifB}
                    min={unifA + 1}
                    max={12}
                    step={1}
                    color="amber"
                    onChange={(val) => {
                      setUnifB(val);
                      resetUniform();
                    }}
                  />
                </div>

                {/* Uniform Roll Simulation */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Mô phỏng Gieo ngẫu nhiên
                    </span>
                    {lastUnifRoll !== null && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold font-mono bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                        Vừa gieo ra: {lastUnifRoll}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    <ClayButton variant="primary" size="sm" onClick={() => runUniformTrials(1)}>
                      +1 lần
                    </ClayButton>
                    <ClayButton variant="secondary" size="sm" onClick={() => runUniformTrials(20)}>
                      +20 lần
                    </ClayButton>
                    <ClayButton variant="outline" size="sm" onClick={() => runUniformTrials(100)}>
                      +100 lần
                    </ClayButton>
                  </div>
                  {unifTrials.total > 0 && (
                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Tổng gieo: <strong className="text-slate-800 dark:text-slate-200">{unifTrials.total}</strong> lần
                      </span>
                      <button
                        onClick={resetUniform}
                        className="text-xs text-rose-500 hover:text-rose-600 font-bold underline cursor-pointer"
                      >
                        Đặt lại đếm
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

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
              Công thức Khối Xác suất PMF
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 font-medium">
              {interpretation}
            </p>
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-center font-mono font-bold text-sky-700 dark:text-sky-300 text-sm sm:text-base overflow-x-auto">
              <MathView math={pmfFormula} />
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Điều kiện chuẩn hóa:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                <MathView math="\\sum_k P(X = k) = 1" />
              </span>
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
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Độ lệch chuẩn sigma:</span>
                <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-base sm:text-lg">
                  {fmt(sigma, 2)}
                </span>
              </div>
              {empiricalMean !== null && (
                <div className="flex justify-between items-center py-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-2 rounded-lg">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                    Trung bình thực nghiệm:
                  </span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                    {fmt(empiricalMean, 3)}
                  </span>
                </div>
              )}
            </div>
          </ClayCard>
        </div>

        {/* RIGHT COLUMN: GRAPH STAGE */}
        <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={
                dist === 'bernoulli'
                  ? 'Mô hình Phân bố Bernoulli & Tần suất Thực nghiệm'
                  : dist === 'uniform'
                  ? 'Hàm Khối Xác Suất Phân bố Đều Rời Rạc U{a, b}'
                  : dist === 'binomial'
                  ? 'Hàm Khối Xác Suất Phân bố Nhị thức B(n, p)'
                  : dist === 'poisson'
                  ? 'Hàm Khối Xác Suất Phân bố Poisson(λ)'
                  : 'Hàm Khối Xác Suất Phân bố Hình học Geom(p)'
              }
              formula={`\\mathbb{E}[X] = ${fmt(mean, 2)}`}
              badge={`Var(X) = ${fmt(variance, 2)}`}
              onReset={() => {
                if (dist === 'bernoulli') {
                  setBernP(0.6);
                  resetBernoulli();
                } else if (dist === 'uniform') {
                  setUnifA(1);
                  setUnifB(6);
                  resetUniform();
                } else if (dist === 'binomial') {
                  setBinN(10);
                  setBinP(0.5);
                } else if (dist === 'poisson') {
                  setPoiLambda(4.0);
                } else {
                  setGeomP(0.3);
                }
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
                <line
                  x1="60"
                  y1="330"
                  x2="760"
                  y2="330"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-pmf-x)"
                />
                <line
                  x1="80"
                  y1="350"
                  x2="80"
                  y2="30"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-pmf-y)"
                />
                <text x="770" y="334" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">
                  k
                </text>
                <text
                  x="80"
                  y="20"
                  fill="#10B981"
                  fontSize="13"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  P(X=k)
                </text>

                {/* PMF Bars */}
                {bars.map((b) => {
                  const cx = mapKtoX(b.k);
                  const topY = mapPtoY(b.p);
                  const h = Math.max(0, 330 - topY);

                  const hasEmp = b.empP !== undefined;
                  const empTopY = hasEmp ? mapPtoY(b.empP!) : 330;
                  const empH = Math.max(0, 330 - empTopY);

                  return (
                    <g key={b.k}>
                      {/* Theoretical PMF Bar */}
                      <rect
                        x={hasEmp ? cx - barWidth : cx - barWidth / 2}
                        y={topY}
                        width={hasEmp ? barWidth * 0.9 : barWidth}
                        height={h}
                        rx="4"
                        fill="#0284C7"
                        stroke="#0F172A"
                        strokeWidth="1.5"
                        className="hover:fill-sky-400 transition-colors"
                      />

                      {/* Theoretical Value Label */}
                      {b.p > maxP * 0.05 && (
                        <text
                          x={hasEmp ? cx - barWidth * 0.55 : cx}
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

                      {/* Empirical Simulation Bar (if simulated) */}
                      {hasEmp && (
                        <>
                          <rect
                            x={cx + barWidth * 0.1}
                            y={empTopY}
                            width={barWidth * 0.9}
                            height={empH}
                            rx="4"
                            fill="#10B981"
                            stroke="#0F172A"
                            strokeWidth="1.5"
                            className="hover:fill-emerald-400 transition-colors"
                          />
                          <text
                            x={cx + barWidth * 0.55}
                            y={empTopY - 6}
                            fill="#10B981"
                            className="dark:fill-emerald-400"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            {fmt(b.empP!, 3)}
                          </text>
                        </>
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

                      {/* Outcome count under k if empirical */}
                      {hasEmp && (
                        <text
                          x={cx}
                          y="363"
                          fill="#10B981"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          n={b.empCount}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* 1-Sigma Band [E[X]-sigma, E[X]+sigma] */}
                {(() => {
                  const minBound = bars[0]?.k ?? 0;
                  const maxBound = bars[bars.length - 1]?.k ?? 15;
                  const xLeft = mapKtoX(Math.max(minBound, mean - sigma));
                  const xRight = mapKtoX(Math.min(maxBound, mean + sigma));
                  return (
                    <g>
                      <line x1={xLeft} y1="50" x2={xRight} y2="50" stroke="#F59E0B" strokeWidth="2.5" />
                      <line x1={xLeft} y1="44" x2={xLeft} y2="56" stroke="#F59E0B" strokeWidth="2" />
                      <line x1={xRight} y1="44" x2={xRight} y2="56" stroke="#F59E0B" strokeWidth="2" />
                      <text
                        x={(xLeft + xRight) / 2}
                        y="42"
                        fill="#F59E0B"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
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
                      <line
                        x1={meanX}
                        y1="65"
                        x2={meanX}
                        y2="330"
                        stroke="#EF4444"
                        strokeWidth="2.5"
                        strokeDasharray="5 3"
                      />
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
                    <span className="w-3 h-3 bg-sky-500 rounded-sm"></span> Cột xác suất lý thuyết P(X = k)
                  </span>
                  {(dist === 'bernoulli' || dist === 'uniform') && (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Tần suất thực nghiệm
                    </span>
                  )}
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
        </div>
      </div>

      {/* FULL-WIDTH LAB BRIEFING AT BOTTOM */}
      <LabBriefing
        title="Bản chất Hàm Khối Xác Suất (PMF) & Trọng Tâm Kỳ Vọng E[X]"
        question="Hàm khối xác suất (PMF) cho ta biết điều gì, và tại sao kỳ vọng E[X] lại đóng vai trò như trọng tâm vật lý của một chiếc bập bênh?"
        formula="p_X(k) = P(X = k), \\quad \\sum_k p_X(k) = 1, \\quad \\mathbb{E}[X] = \\sum_k k \\cdot p_X(k)"
        mathExplanation="Biến ngẫu nhiên rời rạc là biến chỉ nhận các giá trị đếm được. Hàm khối xác suất (PMF) phân bổ tổng khối lượng xác suất bằng 1 lên từng giá trị cụ thể k. Công thức tính kỳ vọng E[X] chính là công thức tính tọa độ trọng tâm (Center of Mass) của một thanh cứng khi gắn các quả nặng có khối lượng p_X(k) tại tọa độ k. Nếu đặt một điểm tựa tam giác (Fulcrum) ngay tại vị trí E[X], hệ thống các cột xác suất sẽ đạt trạng thái cân bằng lực đòn bẩy hoàn hảo."
        howToInteract={[
          "Chuyển đổi linh hoạt giữa 5 phân bố kinh điển trên thanh tab: Bernoulli, Đều rời rạc, Nhị thức, Hình học, Poisson.",
          "Ở phân bố Bernoulli và Đều: hãy bấm các nút '+1 lần', '+10 lần', '+100 lần' để chạy mô phỏng thực nghiệm và quan sát cột màu xanh lá cây tiệm cận cột lý thuyết xanh dương theo Luật số lớn.",
          "Kéo thanh trượt tham số (p, a, b, n, λ) và quan sát điểm tựa tam giác đỏ E[X] tự động di chuyển đến vị trí cân bằng mới.",
          "Quan sát dải cam ±1σ để nhận biết mức độ phân tán tập trung hay lan rộng của biến ngẫu nhiên xung quanh kỳ vọng.",
        ]}
        whatToObserve="Ở phân bố Bernoulli, giá trị E[X] = p luôn nằm giữa 0 và 1 dù biến ngẫu nhiên chỉ nhận giá trị 0 hoặc 1 (Kỳ vọng không nhất thiết phải là một giá trị mà X có thể nhận). Ở phân bố đều U{a, b}, tất cả các cột có độ cao bằng nhau chằn chặn 1/N và E[X] nằm ngay chính giữa (a+b)/2. Khi tăng số lần thử nghiệm lên hàng trăm lần, tần suất thực tế sẽ ngày càng khớp sát với xác suất lý thuyết."
        takeaway="Phân bố Bernoulli là nguyên tử nền tảng: tổng n biến Bernoulli độc lập tạo ra phân bố Nhị thức. Phân bố Đều mô hình hóa sự bất định hoàn hảo không thiên vị. Kỳ vọng E[X] là trọng tâm cân bằng, còn phương sai Var(X) là mômen quán tính đo độ tỏa rộng quanh tâm."
      />
    </div>
  );
};
