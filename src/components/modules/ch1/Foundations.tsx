import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { MathView } from '../../common/MathView';
import { fmt } from '../../../utils/math';
import { Layers, Grid } from 'lucide-react';

export const Foundations: React.FC = () => {
  const [activeSub, setActiveSub] = useState<'venn' | 'dice'>('venn');

  // Venn state
  const [probA, setProbA] = useState<number>(0.6);
  const [probB, setProbB] = useState<number>(0.5);
  const [probIntersect, setProbIntersect] = useState<number>(0.3);

  // Union
  const probUnion = Math.min(1, probA + probB - probIntersect);

  // Dice state: filter condition
  const [diceFilter, setDiceFilter] = useState<'all' | 'sum8' | 'doubles' | 'has6'>('all');

  const diceGrid = [];
  let countMatch = 0;
  for (let r = 1; r <= 6; r++) {
    for (let c = 1; c <= 6; c++) {
      let isMatch = false;
      if (diceFilter === 'all') isMatch = true;
      else if (diceFilter === 'sum8') isMatch = r + c >= 8;
      else if (diceFilter === 'doubles') isMatch = r === c;
      else if (diceFilter === 'has6') isMatch = r === 6 || c === 6;

      if (isMatch) countMatch++;
      diceGrid.push({ r, c, sum: r + c, isMatch });
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-500/10 to-slate-700/10 border-2 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            MAT1101 Bài 1 — Cơ sở Xác suất & Lý thuyết Tập hợp
          </span>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-0.5">
            Không gian Mẫu <MathView math="\Omega" />, Tiên đề Kolmogorov & Sơ đồ Venn
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSub('venn')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all ${
              activeSub === 'venn' ? 'bg-slate-800 text-white shadow-md' : 'bg-white/80 dark:bg-slate-800'
            }`}
          >
            Sơ đồ Venn
          </button>
          <button
            onClick={() => setActiveSub('dice')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all ${
              activeSub === 'dice' ? 'bg-slate-800 text-white shadow-md' : 'bg-white/80 dark:bg-slate-800'
            }`}
          >
            Ma trận 36 Ô Xúc xắc
          </button>
        </div>
      </div>

      {activeSub === 'venn' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ClayCard glowColor="amber">
            <h3 className="font-heading font-bold text-lg mb-3">Sơ đồ Venn Tương tác</h3>
            <ClaySlider
              label="P(A)"
              value={probA}
              min={0.1}
              max={0.9}
              step={0.05}
              color="orange"
              onChange={setProbA}
            />
            <ClaySlider
              label="P(B)"
              value={probB}
              min={0.1}
              max={0.9}
              step={0.05}
              color="blue"
              onChange={setProbB}
            />
            <ClaySlider
              label="P(A giao B)"
              value={probIntersect}
              min={0}
              max={Math.min(probA, probB)}
              step={0.05}
              color="emerald"
              onChange={setProbIntersect}
            />

            <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs font-mono space-y-1">
              <div>P(A U B) = {fmt(probUnion, 2)}</div>
              <div className="text-slate-500 font-sans">
                <MathView math="P(A \cup B) = P(A) + P(B) - P(A \cap B)" />
              </div>
            </div>
          </ClayCard>

          <div className="lg:col-span-2">
            <ClayCard glowColor="amber" className="p-6">
              <div className="w-full h-72 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center p-4">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  <rect x="20" y="20" width="360" height="160" fill="none" stroke="#64748B" strokeWidth="1.5" />
                  <text x="35" y="40" fill="#94A3B8" fontSize="12" fontWeight="bold">Ω</text>

                  {/* Circle A */}
                  <circle cx="160" cy="100" r={40 + probA * 40} fill="rgba(249, 115, 22, 0.3)" stroke="#F97316" strokeWidth="2" />
                  <text x="130" y="105" fill="#FB923C" fontSize="14" fontWeight="bold">A</text>

                  {/* Circle B */}
                  <circle cx="240" cy="100" r={40 + probB * 40} fill="rgba(59, 130, 246, 0.3)" stroke="#3B82F6" strokeWidth="2" />
                  <text x="270" y="105" fill="#60A5FA" fontSize="14" fontWeight="bold">B</text>
                </svg>
              </div>
            </ClayCard>
          </div>
        </div>
      ) : (
        <ClayCard glowColor="amber" className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h4 className="font-heading font-bold text-lg">
              Không gian mẫu 36 Kết quả Tung 2 Con xúc xắc (Slide 22)
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setDiceFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  diceFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Tất cả (36)
              </button>
              <button
                onClick={() => setDiceFilter('sum8')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  diceFilter === 'sum8' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Tổng ≥ 8
              </button>
              <button
                onClick={() => setDiceFilter('doubles')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  diceFilter === 'doubles' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Mặt đôi
              </button>
              <button
                onClick={() => setDiceFilter('has6')}
                className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  diceFilter === 'has6' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Có ít nhất mặt 6
              </button>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
            {diceGrid.map((cell, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center font-mono transition-all ${
                  cell.isMatch
                    ? 'bg-orange-500 text-white border-orange-400 font-bold scale-105 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-40'
                }`}
              >
                <span className="text-xs">({cell.r},{cell.c})</span>
                <span className="text-[10px] opacity-75">={cell.sum}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-4 text-xs font-bold text-orange-600 dark:text-orange-400 font-mono">
            Biến cố A: {countMatch} / 36 ô thỏa mãn (Xác suất P(A) = {fmt(countMatch / 36, 3)})
          </div>
        </ClayCard>
      )}
    </div>
  );
};
