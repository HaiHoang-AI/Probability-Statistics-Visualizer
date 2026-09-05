import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { MathView } from '../../common/MathView';
import { fmt } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';

export const Foundations: React.FC = () => {
  const [activeSub, setActiveSub] = useState<'venn' | 'dice'>('venn');

  // Venn state
  const [probA, setProbA] = useState<number>(0.6);
  const [probB, setProbB] = useState<number>(0.5);
  const [probIntersect, setProbIntersect] = useState<number>(0.3);

  // Union & partition values
  const actualIntersect = Math.min(probIntersect, Math.min(probA, probB));
  const probUnion = Math.min(1, probA + probB - actualIntersect);
  const onlyA = Math.max(0, probA - actualIntersect);
  const onlyB = Math.max(0, probB - actualIntersect);
  const outside = Math.max(0, 1 - probUnion);

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
      {/* Chapter Subtitle & Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 1 — Cơ sở Xác suất
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Không gian Mẫu <MathView math="\Omega" /> & Sơ đồ Venn
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSub('venn')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeSub === 'venn'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Sơ đồ Venn (A ∪ B)
          </button>
          <button
            onClick={() => setActiveSub('dice')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeSub === 'dice'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Ma trận 36 Ô Xúc xắc
          </button>
        </div>
      </div>

      {activeSub === 'venn' ? (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="amber" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Xác suất Từng Biến cố
              </h4>
              <ClaySlider
                label="P(A)"
                value={probA}
                min={0.1}
                max={0.9}
                step={0.05}
                color="orange"
                onChange={setProbA}
              />
              <div className="mt-3">
                <ClaySlider
                  label="P(B)"
                  value={probB}
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  color="blue"
                  onChange={setProbB}
                />
              </div>
              <div className="mt-3">
                <ClaySlider
                  label="P(A giao B)"
                  value={actualIntersect}
                  min={0}
                  max={Math.min(probA, probB)}
                  step={0.05}
                  color="emerald"
                  onChange={setProbIntersect}
                />
              </div>
            </ClayCard>

            {/* Card 2: Tiên đề & Công thức */}
            <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Tiên đề Kolmogorov & Công thức Cộng
              </h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed mb-3 font-medium">
                Quy tắc bao hàm - loại trừ (Inclusion-Exclusion Principle):
              </p>
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-center font-mono font-bold text-sky-700 dark:text-sky-300 text-sm sm:text-base">
                <MathView math="P(A \cup B) = P(A) + P(B) - P(A \cap B)" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                Nếu <MathView math="A \cap B = \emptyset" /> (2 biến cố xung khắc rời nhau), thì <MathView math="P(A \cup B) = P(A) + P(B)" />.
              </p>
            </ClayCard>

            {/* Card 3: Phân rã 4 miền rời rạc */}
            <ClayCard glowColor="emerald" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                4 Phân vùng Độc lập trong Ω
              </h4>
              <div className="space-y-2.5 text-sm sm:text-[15px]">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">Chỉ riêng A:</span>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">{fmt(onlyA, 2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Giao A ∩ B:</span>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">{fmt(actualIntersect, 2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-sky-600 dark:text-sky-400 font-semibold">Chỉ riêng B:</span>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">{fmt(onlyB, 2)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Bên ngoài (A ∪ B)ᶜ:</span>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">{fmt(outside, 2)}</span>
                </div>
              </div>
            </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Sơ đồ Venn Biến cố & Không gian Mẫu Toàn phần"
              formula="P(A \cup B) = P(A) + P(B) - P(A \cap B)"
              badge={`P(A ∪ B) = ${fmt(probUnion, 2)}`}
              onReset={() => {
                setProbA(0.6);
                setProbB(0.5);
                setProbIntersect(0.3);
              }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 360" className="w-full h-auto select-none">
                {/* Outer Sample Space Box Omega */}
                <rect
                  x="40"
                  y="30"
                  width="720"
                  height="300"
                  rx="20"
                  fill="rgba(15, 23, 42, 0.03)"
                  stroke="#475569"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
                <text x="65" y="65" fill="#475569" className="dark:fill-slate-400" fontSize="22" fontWeight="black" fontFamily="monospace">
                  Ω
                </text>
                <text x="90" y="62" fill="#64748B" fontSize="12" fontWeight="bold">
                  (Không gian mẫu: P(Ω) = 1)
                </text>

                {/* Circle A */}
                {(() => {
                  const rA = 70 + probA * 85;
                  const cxA = 320;
                  const cyA = 180;
                  return (
                    <g>
                      <circle
                        cx={cxA}
                        cy={cyA}
                        r={rA}
                        fill="rgba(245, 158, 11, 0.22)"
                        stroke="#F59E0B"
                        strokeWidth="3.5"
                      />
                      <text x={cxA - rA * 0.45} y={cyA} fill="#B45309" className="dark:fill-amber-300" fontSize="20" fontWeight="black">
                        A
                      </text>
                      <text x={cxA - rA * 0.45} y={cyA + 20} fill="#B45309" className="dark:fill-amber-400" fontSize="12" fontWeight="bold" fontFamily="monospace">
                        P(A)={fmt(probA, 2)}
                      </text>
                    </g>
                  );
                })()}

                {/* Circle B */}
                {(() => {
                  const rB = 70 + probB * 85;
                  const cxB = 480;
                  const cyB = 180;
                  return (
                    <g>
                      <circle
                        cx={cxB}
                        cy={cyB}
                        r={rB}
                        fill="rgba(2, 132, 199, 0.22)"
                        stroke="#0284C7"
                        strokeWidth="3.5"
                      />
                      <text x={cxB + rB * 0.45} y={cyB} fill="#0369A1" className="dark:fill-sky-300" fontSize="20" fontWeight="black" textAnchor="middle">
                        B
                      </text>
                      <text x={cxB + rB * 0.45} y={cyB + 20} fill="#0369A1" className="dark:fill-sky-400" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        P(B)={fmt(probB, 2)}
                      </text>
                    </g>
                  );
                })()}

                {/* Intersection Center Label */}
                {actualIntersect > 0 && (
                  <g>
                    <text x="400" y="175" fill="#047857" className="dark:fill-emerald-300" fontSize="14" fontWeight="bold" textAnchor="middle">
                      A ∩ B
                    </text>
                    <text x="400" y="195" fill="#047857" className="dark:fill-emerald-400" fontSize="13" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                      {fmt(actualIntersect, 2)}
                    </text>
                  </g>
                )}

                {/* Outside Ω complement label */}
                <text x="730" y="310" fill="#64748B" fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                  P((A ∪ B)ᶜ) = {fmt(outside, 2)}
                </text>
              </svg>

              {/* Bottom Stage Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span> Chỉ A: P(A \ B) = {fmt(onlyA, 2)}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Giao A ∩ B: {fmt(actualIntersect, 2)}
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                    <span className="w-3 h-3 rounded-full bg-sky-500"></span> Chỉ B: P(B \ A) = {fmt(onlyB, 2)}
                  </span>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  P(A ∪ B) = {fmt(onlyA, 2)} + {fmt(actualIntersect, 2)} + {fmt(onlyB, 2)} = {fmt(probUnion, 2)}
                </span>
              </div>
            </div>
          </ClayCard>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="amber" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Biến cố Đang lọc
              </h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed mb-3 font-medium">
                {diceFilter === 'all' && 'Không gian mẫu đầy đủ gồm 36 cặp kết quả đồng khả năng (Equally likely outcomes).'}
                {diceFilter === 'sum8' && 'Tổng điểm 2 xúc xắc ≥ 8: Gồm các cặp tổng bằng 8, 9, 10, 11, 12.'}
                {diceFilter === 'doubles' && 'Mặt đôi: Hai con xúc xắc xuất hiện số chấm bằng nhau: (1,1), (2,2), ..., (6,6).'}
                {diceFilter === 'has6' && 'Có ít nhất một con xúc xắc đổ ra mặt 6 chấm.'}
              </p>
            </ClayCard>

            {/* Card 2: Định nghĩa Cổ điển */}
            <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Định nghĩa Cổ điển Laplace
              </h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed mb-2 font-medium">
                Khi mọi biến cố sơ cấp có khả năng xuất hiện như nhau:
              </p>
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-center font-mono font-bold text-sky-700 dark:text-sky-300 text-sm sm:text-base">
                <MathView math="P(E) = \frac{\text{Số kết quả thuận lợi}}{\text{Tổng số kết quả sơ cấp}} = \frac{|E|}{|\Omega|}" />
              </div>
            </ClayCard>

            {/* Card 3: Thống kê Trực thời */}
            <ClayCard glowColor="emerald" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Kết quả Tính toán
              </h4>
              <div className="space-y-2.5 text-sm sm:text-[15px]">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Số phần tử thuận lợi |E|:</span>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">{countMatch} / 36</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Xác suất P(E):</span>
                  <span className="font-mono font-black text-sky-600 dark:text-sky-400 text-base sm:text-lg">
                    {fmt(countMatch / 36, 4)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Tỷ lệ phần trăm:</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base sm:text-lg">
                    {fmt((countMatch / 36) * 100, 1)}%
                  </span>
                </div>
              </div>
            </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Không gian Mẫu Rời rạc: Tung 2 Con Xúc xắc (36 Biến cố Sơ cấp)"
              formula="P(E) = \frac{|E|}{|\Omega|} = \frac{|E|}{36}"
              badge={`${countMatch} / 36 ô (${fmt(countMatch / 36, 3)})`}
              onReset={() => setDiceFilter('all')}
              extraActions={
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => setDiceFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-heading font-bold border border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                      diceFilter === 'all' ? 'bg-sky-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Tất cả (36)
                  </button>
                  <button
                    onClick={() => setDiceFilter('sum8')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-heading font-bold border border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                      diceFilter === 'sum8' ? 'bg-sky-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Tổng ≥ 8
                  </button>
                  <button
                    onClick={() => setDiceFilter('doubles')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-heading font-bold border border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                      diceFilter === 'doubles' ? 'bg-sky-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Mặt đôi
                  </button>
                  <button
                    onClick={() => setDiceFilter('has6')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-heading font-bold border border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                      diceFilter === 'has6' ? 'bg-sky-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Có mặt 6
                  </button>
                </div>
              }
            />

            <div className="desmos-viewport w-full p-6 flex flex-col items-center justify-center min-h-[460px]">
              <div className="grid grid-cols-6 gap-2.5 max-w-lg w-full">
                {diceGrid.map((cell, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center font-mono transition-all duration-200 ${
                      cell.isMatch
                        ? 'bg-sky-500 text-white border-slate-900 dark:border-white font-black scale-105 shadow-[3px_3px_0px_#0f172a] dark:shadow-[3px_3px_0px_#0284c7]'
                        : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-40 hover:opacity-75'
                    }`}
                  >
                    <span className="text-xs">({cell.r},{cell.c})</span>
                    <span className="text-[10px] opacity-80 mt-0.5">={cell.sum}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Result text inside stage */}
              <div className="mt-5 text-center text-sm font-bold text-sky-600 dark:text-sky-400 font-mono">
                Số ô thỏa mãn: {countMatch} / 36 ô ➔ Xác suất cổ điển P(E) = {fmt(countMatch / 36, 4)} ({fmt((countMatch / 36) * 100, 1)}%)
              </div>
            </div>
          </ClayCard>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

