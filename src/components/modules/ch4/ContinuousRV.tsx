import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { MathView } from '../../common/MathView';
import {
  fmt,
  normalPdf,
  normalCdf,
  exponentialPdf,
} from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';

type ContinuousTab = 'uniform' | 'exponential' | 'normal' | 'standardization';

export const ContinuousRV: React.FC = () => {
  const [activeSub, setActiveSub] = useState<ContinuousTab>('uniform');

  // ==========================================
  // TAB 1: CONTINUOUS UNIFORM U(a, b)
  // ==========================================
  const [unifA, setUnifA] = useState<number>(-2.0);
  const [unifB, setUnifB] = useState<number>(4.0);
  const [unifX1, setUnifX1] = useState<number>(-0.5);
  const [unifX2, setUnifX2] = useState<number>(2.5);

  const safeUnifB = Math.max(unifA + 0.5, unifB);
  const unifLength = safeUnifB - unifA;
  const unifHeight = 1 / unifLength;
  const unifMean = (unifA + safeUnifB) / 2;
  const unifVariance = (unifLength * unifLength) / 12;
  const unifSigma = Math.sqrt(unifVariance);

  const safeX1 = Math.min(unifX1, unifX2);
  const safeX2 = Math.max(unifX1, unifX2);
  const overlapLow = Math.max(unifA, safeX1);
  const overlapHigh = Math.min(safeUnifB, safeX2);
  const unifArea = Math.max(0, overlapHigh - overlapLow) * unifHeight;

  const mapUnifX = (x: number) => 400 + x * 45;
  const mapUnifY = (y: number) => 330 - (y / Math.max(0.8, unifHeight * 1.35)) * 260;

  // ==========================================
  // TAB 2: EXPONENTIAL Exp(lambda)
  // ==========================================
  const [expLambda, setExpLambda] = useState<number>(1.0);
  const [expT, setExpT] = useState<number>(1.5);
  const [expMode, setExpMode] = useState<'survival' | 'memoryless'>('survival');
  const [expS, setExpS] = useState<number>(1.0);
  const [expDeltaT, setExpDeltaT] = useState<number>(1.0);

  const expMean = 1 / expLambda;
  const expVariance = 1 / (expLambda * expLambda);
  const expSigma = 1 / expLambda;
  const expHalfLife = Math.LN2 / expLambda;

  const expSurvProb = Math.exp(-expLambda * expT);
  const expCdfProb = 1 - expSurvProb;

  const probGreaterS = Math.exp(-expLambda * expS);
  const probGreaterST = Math.exp(-expLambda * (expS + expDeltaT));
  const condProbMemoryless = probGreaterS > 0 ? probGreaterST / probGreaterS : 0;
  const directProbT = Math.exp(-expLambda * expDeltaT);

  const expMaxY = Math.max(1.8, expLambda * 1.15);
  const mapExpX = (x: number) => 100 + x * 90;
  const mapExpY = (y: number) => 330 - (y / expMaxY) * 270;

  // ==========================================
  // TAB 3: NORMAL DISTRIBUTION N(mu, sigma^2)
  // ==========================================
  const [normMu, setNormMu] = useState<number>(0);
  const [normSigma, setNormSigma] = useState<number>(1.0);
  const [rangeX1, setRangeX1] = useState<number>(-1.0);
  const [rangeX2, setRangeX2] = useState<number>(1.0);

  const normPArea = Math.max(0, normalCdf(rangeX2, normMu, normSigma) - normalCdf(rangeX1, normMu, normSigma));
  const mapNormX = (x: number) => 400 + x * 65;
  const mapNormY = (y: number) => 330 - y * 560;

  // ==========================================
  // TAB 4: STANDARDIZATION & Z-SCORE
  // ==========================================
  const [stdMu, setStdMu] = useState<number>(2.0);
  const [stdSigma, setStdSigma] = useState<number>(1.5);
  const [stdX, setStdX] = useState<number>(4.25);

  const zScore = (stdX - stdMu) / stdSigma;
  const zProb = normalCdf(zScore, 0, 1);

  const mapStdTopX = (x: number) => 400 + (x - 2) * 50;
  const mapStdTopY = (y: number) => 170 - (y / Math.max(0.5, (1 / (stdSigma * Math.sqrt(2 * Math.PI))) * 1.2)) * 130;

  const mapStdBotX = (z: number) => 400 + z * 60;
  const mapStdBotY = (y: number) => 350 - (y / 0.45) * 120;

  return (
    <div className="space-y-6">
      {/* Chapter Subtitle & Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 5 & 6 — Biến ngẫu nhiên Liên tục
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Hàm mật độ (PDF), Phân bố Mũ & Phép Chuẩn hóa Z-score
          </h2>
        </div>

        {/* 4 Sub-Tabs Navigation (Standard Naming, Buffon Removed) */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'uniform', label: '1. Phân bố Đều (Uniform)' },
              { id: 'exponential', label: '2. Phân bố Mũ (Exponential)' },
              { id: 'normal', label: '3. Chuẩn Gauss (Normal)' },
              { id: 'standardization', label: '4. Chuẩn hóa & Z-score' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveSub(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
                activeSub === t.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: CONTINUOUS UNIFORM U(a, b) */}
      {activeSub === 'uniform' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="amber" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Tham số Phân bố Đều U(a, b)
                </h4>
                <div className="mb-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Khoảng điển hình:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUnifA(0);
                        setUnifB(1);
                        setUnifX1(0.2);
                        setUnifX2(0.8);
                      }}
                      className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      Chuẩn tắc U(0, 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUnifA(-2);
                        setUnifB(4);
                        setUnifX1(-0.5);
                        setUnifX2(2.5);
                      }}
                      className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      Khoảng [-2, 4]
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUnifA(-4);
                        setUnifB(4);
                        setUnifX1(-2);
                        setUnifX2(2);
                      }}
                      className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      Đối xứng [-4, 4]
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUnifA(0);
                        setUnifB(10);
                        setUnifX1(3);
                        setUnifX2(7);
                      }}
                      className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      Đợi xe buýt [0, 10]
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <ClaySlider
                    label="Cận dưới a"
                    value={unifA}
                    min={-5}
                    max={3}
                    step={0.5}
                    color="amber"
                    onChange={(val) => {
                      setUnifA(val);
                      if (unifB <= val) setUnifB(val + 0.5);
                    }}
                  />
                  <ClaySlider
                    label="Cận trên b"
                    value={unifB}
                    min={unifA + 0.5}
                    max={7}
                    step={0.5}
                    color="amber"
                    onChange={setUnifB}
                  />
                </div>
              </ClayCard>

              <ClayCard glowColor="orange" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Khoảng Tích phân [X₁, X₂]
                </h4>
                <div className="space-y-3">
                  <ClaySlider
                    label="Cận dưới x1"
                    value={unifX1}
                    min={-5}
                    max={unifX2 - 0.2}
                    step={0.2}
                    color="orange"
                    onChange={setUnifX1}
                  />
                  <ClaySlider
                    label="Cận trên x2"
                    value={unifX2}
                    min={unifX1 + 0.2}
                    max={7}
                    step={0.2}
                    color="orange"
                    onChange={setUnifX2}
                  />
                </div>
                <div className="mt-3 p-2.5 rounded-xl bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 text-xs text-orange-800 dark:text-orange-300 font-mono text-center font-bold">
                  P({fmt(unifX1, 1)} ≤ X ≤ {fmt(unifX2, 1)}) = {fmt(unifArea * 100, 2)}%
                </div>
              </ClayCard>

              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Đặc trưng Số Phân bố Đều
                </h4>
                <div className="space-y-2.5 text-sm sm:text-[15px]">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Độ cao mật độ f(x):</span>
                    <span className="font-mono font-black text-sky-600 dark:text-sky-400 text-base">
                      1/{fmt(unifLength, 1)} = {fmt(unifHeight, 3)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Kỳ vọng E[X]:</span>
                    <span className="font-mono font-black text-red-600 dark:text-red-400 text-base">
                      {fmt(unifMean, 2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Phương sai Var(X):</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {fmt(unifVariance, 3)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Độ lệch chuẩn σ:</span>
                    <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-base">
                      {fmt(unifSigma, 2)}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>

            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <DesmosStageHeader
                  title="Hàm Mật Độ Xác Suất (PDF) Phân Bố Đều Liên Tục U(a, b)"
                  formula={`f(x) = \\frac{1}{${fmt(unifLength, 1)}} = ${fmt(unifHeight, 3)}`}
                  badge={`P = ${fmt(unifArea * 100, 1)}%`}
                  onReset={() => {
                    setUnifA(-2.0);
                    setUnifB(4.0);
                    setUnifX1(-0.5);
                    setUnifX2(2.5);
                  }}
                />

                <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
                  <svg viewBox="0 0 800 380" className="w-full h-auto select-none">
                    <defs>
                      <marker id="arrow-unif-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                      </marker>
                      <marker id="arrow-unif-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                      </marker>
                    </defs>

                    <line x1="50" y1="330" x2="750" y2="330" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-unif-x)" />
                    <line x1="400" y1="360" x2="400" y2="30" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-unif-y)" />
                    <text x="760" y="334" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">x</text>
                    <text x="400" y="20" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">f(x)</text>

                    {/* Oy Fixed Unit Ticks */}
                    {[0.2, 0.4, 0.6, 0.8].map((val) => {
                      const py = mapUnifY(val);
                      return (
                        <g key={val}>
                          <line x1="50" y1={py} x2="750" y2={py} stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.2" />
                          <line x1="395" y1={py} x2="405" y2={py} stroke="#10B981" strokeWidth="1.5" />
                          <text x="390" y={py + 3.5} fill="#64748B" fontSize="10" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                            {val.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}

                    {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7].map((val) => (
                      <g key={val}>
                        <line x1={mapUnifX(val)} y1="326" x2={mapUnifX(val)} y2="334" stroke="#64748B" strokeWidth="1.5" />
                        <text x={mapUnifX(val)} y="350" fill="#64748B" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                          {val}
                        </text>
                      </g>
                    ))}

                    {(() => {
                      const ax = mapUnifX(unifA);
                      const bx = mapUnifX(safeUnifB);
                      const topY = mapUnifY(unifHeight);
                      const rectH = Math.max(0, 330 - topY);

                      return (
                        <g>
                          <rect
                            x={ax}
                            y={topY}
                            width={bx - ax}
                            height={rectH}
                            fill="rgba(2, 132, 199, 0.12)"
                            stroke="#0284C7"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                          />

                          {overlapHigh > overlapLow && (
                            <rect
                              x={mapUnifX(overlapLow)}
                              y={topY}
                              width={mapUnifX(overlapHigh) - mapUnifX(overlapLow)}
                              height={rectH}
                              fill="rgba(245, 158, 11, 0.45)"
                              stroke="#F59E0B"
                              strokeWidth="2"
                            />
                          )}

                          <line x1={ax} y1={topY} x2={bx} y2={topY} stroke="#0284C7" strokeWidth="3.5" />
                          <line x1={ax} y1={330} x2={ax} y2={topY} stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />
                          <line x1={bx} y1={330} x2={bx} y2={topY} stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />

                          <line x1="400" y1={topY} x2={ax} y2={topY} stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 2" />
                          <text x="390" y={topY - 4} fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                            h = {fmt(unifHeight, 3)}
                          </text>

                          <circle cx={ax} cy={topY} r="5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
                          <circle cx={bx} cy={topY} r="5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
                          <text x={ax} y="320" fill="#0284C7" fontSize="11" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                            a = {unifA}
                          </text>
                          <text x={bx} y="320" fill="#0284C7" fontSize="11" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                            b = {safeUnifB}
                          </text>
                        </g>
                      );
                    })()}

                    {(() => {
                      const meanX = mapUnifX(unifMean);
                      return (
                        <g>
                          <line x1={meanX} y1="70" x2={meanX} y2="330" stroke="#EF4444" strokeWidth="2" strokeDasharray="5 3" />
                          <polygon points={`${meanX - 8},342 ${meanX + 8},342 ${meanX},330`} fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
                          <text x={meanX} y="62" fill="#EF4444" fontSize="11" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                            E[X] = {fmt(unifMean, 2)}
                          </text>
                        </g>
                      );
                    })()}
                  </svg>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                        <span className="w-3 h-3 bg-sky-500/30 border border-sky-500 rounded-sm"></span> Tổng diện tích = (b-a) × h = 1.00 (100%)
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                        <span className="w-3 h-3 bg-amber-500/50 border border-amber-500 rounded-sm"></span> Diện tích tích phân: {fmt(unifArea * 100, 2)}%
                      </span>
                      <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
                        <span className="w-3.5 h-0.5 bg-red-500 border-dashed"></span> Trọng tâm đối xứng E[X] = {fmt(unifMean, 2)}
                      </span>
                    </div>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                      Độ lệch chuẩn σ = {fmt(unifSigma, 2)}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>
          </div>

          <LabBriefing
            title="Bản chất Phân bố Đều Liên tục U(a, b) & Nghịch lý Xác suất Điểm bằng 0"
            question="Tại sao với biến ngẫu nhiên liên tục, xác suất tại một điểm chính xác P(X = c) luôn luôn bằng 0, nhưng xác suất trên một khoảng [x1, x2] lại có giá trị dương?"
            formula="f(x) = \frac{1}{b - a}, \quad P(x_1 \le X \le x_2) = \int_{x_1}^{x_2} \frac{1}{b - a} dx = \frac{x_2 - x_1}{b - a}"
            mathExplanation="Phân bố Đều liên tục mô hình hóa tình huống một đại lượng có thể rơi vào bất kỳ vị trí nào trong khoảng [a, b] với mật độ đồng đều tuyệt đối. Vì khoảng [a, b] chứa vô số điểm không đếm được, xác suất để rơi trúng một con số thập phân vô hạn cụ thể là 0. Do đó, trong không gian liên tục, xác suất chỉ tồn tại dưới dạng DIỆN TÍCH tích phân của hàm mật độ trên một khoảng."
            howToInteract={[
              'Kéo slider Cận dưới a và Cận trên b để nới rộng hoặc thu hẹp khoảng xác định. Quan sát độ cao mật độ h = 1/(b-a) tự động thay đổi để bảo toàn diện tích tổng luôn bằng 1.',
              'Kéo các slider x1, x2 để chọn khoảng quan sát, vùng tích phân màu cam sẽ phản ánh diện tích hình chữ nhật tương ứng.',
              'Bấm các nút chọn nhanh để thử nghiệm các tình huống quen thuộc: Chờ xe buýt [0, 10], Chuẩn tắc U(0, 1).',
            ]}
            whatToObserve="Khi bạn thu hẹp khoảng [a, b], độ cao mật độ f(x) tăng vọt tương ứng, nhưng diện tích toàn bộ hình chữ nhật luôn là h × (b - a) = 1. Trọng tâm E[X] luôn nằm chính xác ở trung điểm (a + b) / 2."
            takeaway="Mật độ xác suất f(x) không phải là xác suất; nó là mật độ trên mỗi đơn vị chiều dài. Chỉ khi nhân f(x) với độ dài khoảng dx ta mới thu được xác suất thực sự P = f(x)dx."
          />
        </div>
      )}

      {/* TAB 2: EXPONENTIAL Exp(lambda) */}
      {activeSub === 'exponential' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Tham số Phân bố Mũ Exp(λ)
                </h4>
                <div className="space-y-3">
                  <ClaySlider
                    label="Tỷ lệ xảy ra biến cố lambda"
                    value={expLambda}
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    color="emerald"
                    formatValue={(v) => fmt(v, 1)}
                    onChange={setExpLambda}
                  />

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                      Chế độ quan sát:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setExpMode('survival')}
                        className={`px-2 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          expMode === 'survival'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Tích phân & Sống sót
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpMode('memoryless')}
                        className={`px-2 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          expMode === 'memoryless'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Tính Không Nhớ
                      </button>
                    </div>
                  </div>
                </div>
              </ClayCard>

              {expMode === 'survival' ? (
                <ClayCard glowColor="orange" className="p-5">
                  <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                    Xác suất Sống sót P(X &gt; t)
                  </h4>
                  <ClaySlider
                    label="Mốc thời gian t"
                    value={expT}
                    min={0.2}
                    max={5.0}
                    step={0.1}
                    color="orange"
                    formatValue={(v) => fmt(v, 1)}
                    onChange={setExpT}
                  />
                  <div className="mt-3 space-y-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 flex justify-between">
                      <span>Đã xảy ra P(X ≤ t):</span>
                      <strong>{fmt(expCdfProb * 100, 2)}%</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 flex justify-between">
                      <span>Còn sống sót P(X &gt; t):</span>
                      <strong>{fmt(expSurvProb * 100, 2)}%</strong>
                    </div>
                  </div>
                </ClayCard>
              ) : (
                <ClayCard glowColor="purple" className="p-5">
                  <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    Kiểm chứng Tính Không Nhớ
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Biết rằng đã đợi được <MathView math="s" /> phút, xác suất phải đợi thêm <MathView math="t" /> phút nữa:
                  </p>
                  <div className="space-y-3">
                    <ClaySlider
                      label="Thời gian đã đợi s"
                      value={expS}
                      min={0.2}
                      max={3.0}
                      step={0.2}
                      color="purple"
                      formatValue={(v) => fmt(v, 1)}
                      onChange={setExpS}
                    />
                    <ClaySlider
                      label="Thời gian đợi thêm t"
                      value={expDeltaT}
                      min={0.2}
                      max={3.0}
                      step={0.2}
                      color="purple"
                      formatValue={(v) => fmt(v, 1)}
                      onChange={setExpDeltaT}
                    />
                  </div>
                  <div className="mt-3 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs font-mono space-y-1.5">
                    <div className="flex justify-between text-purple-900 dark:text-purple-200">
                      <span>P(X &gt; s + t | X &gt; s):</span>
                      <strong className="text-sm text-purple-600 dark:text-purple-400">
                        {fmt(condProbMemoryless * 100, 2)}%
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>P(X &gt; t) ban đầu:</span>
                      <strong className="text-sm text-emerald-600 dark:text-emerald-400">
                        {fmt(directProbT * 100, 2)}%
                      </strong>
                    </div>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300 font-sans italic pt-1 border-t border-purple-200 dark:border-purple-800">
                      Hai xác suất bằng nhau tuyệt đối! Quá khứ đã chờ bao lâu không ảnh hưởng đến tương lai.
                    </p>
                  </div>
                </ClayCard>
              )}

              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Đặc trưng Số Phân bố Mũ
                </h4>
                <div className="space-y-2.5 text-sm sm:text-[15px]">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Kỳ vọng E[X] = 1/λ:</span>
                    <span className="font-mono font-black text-red-600 dark:text-red-400 text-base">
                      {fmt(expMean, 2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Độ lệch chuẩn σ = 1/λ:</span>
                    <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-base">
                      {fmt(expSigma, 2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Thời gian bán rã t₁/₂:</span>
                    <span className="font-mono font-bold text-teal-600 dark:text-teal-400 text-base">
                      {fmt(expHalfLife, 2)}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>

            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <DesmosStageHeader
                  title={
                    expMode === 'survival'
                      ? 'Hàm Mật Độ PDF Phân Bố Mũ & Xác Suất Đuôi Sống Sót P(X > t)'
                      : 'Trực Quan Hóa Tính Không Nhớ: P(X > s + t | X > s) = P(X > t)'
                  }
                  formula={`f(x) = ${fmt(expLambda, 1)} e^{-${fmt(expLambda, 1)}x}`}
                  badge={`E[X] = ${fmt(expMean, 2)}`}
                  onReset={() => {
                    setExpLambda(1.0);
                    setExpT(1.5);
                    setExpS(1.0);
                    setExpDeltaT(1.0);
                  }}
                />

                <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
                  <svg viewBox="0 0 800 380" className="w-full h-auto select-none">
                    <defs>
                      <marker id="arrow-exp-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                      </marker>
                      <marker id="arrow-exp-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                      </marker>
                    </defs>

                    <line x1="80" y1="330" x2="760" y2="330" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-exp-x)" />
                    <line x1="100" y1="350" x2="100" y2="30" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-exp-y)" />
                    <text x="770" y="334" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">x</text>
                    <text x="100" y="20" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">f(x)</text>

                    {/* Oy Fixed Unit Ticks */}
                    {[0.5, 1.0, 1.5, 2.0, 2.5].map((val) => {
                      const py = mapExpY(val);
                      return (
                        <g key={val}>
                          <line x1="100" y1={py} x2="760" y2={py} stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.2" />
                          <line x1="95" y1={py} x2="105" y2={py} stroke="#10B981" strokeWidth="1.5" />
                          <text x="90" y={py + 3.5} fill="#64748B" fontSize="10" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                            {val.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}

                    {[1, 2, 3, 4, 5, 6, 7].map((val) => (
                      <g key={val}>
                        <line x1={mapExpX(val)} y1="326" x2={mapExpX(val)} y2="334" stroke="#64748B" strokeWidth="1.5" />
                        <text x={mapExpX(val)} y="350" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                          {val}
                        </text>
                      </g>
                    ))}

                    {expMode === 'survival' ? (
                      <>
                        {(() => {
                          const pts = [];
                          const step = 0.05;
                          for (let x = 0; x <= expT + 0.001; x += step) {
                            pts.push(`${mapExpX(x)},${mapExpY(exponentialPdf(x, expLambda))}`);
                          }
                          return (
                            <path
                              d={`M ${mapExpX(0)},330 L ${pts.join(' L ')} L ${mapExpX(expT)},330 Z`}
                              fill="rgba(2, 132, 199, 0.35)"
                              stroke="#0284C7"
                              strokeWidth="1.5"
                            />
                          );
                        })()}

                        {(() => {
                          const pts = [];
                          const step = 0.05;
                          for (let x = expT; x <= 7.001; x += step) {
                            pts.push(`${mapExpX(x)},${mapExpY(exponentialPdf(x, expLambda))}`);
                          }
                          return (
                            <path
                              d={`M ${mapExpX(expT)},330 L ${pts.join(' L ')} L ${mapExpX(7)},330 Z`}
                              fill="rgba(16, 185, 129, 0.45)"
                              stroke="#10B981"
                              strokeWidth="1.5"
                            />
                          );
                        })()}

                        <line
                          x1={mapExpX(expT)}
                          y1="60"
                          x2={mapExpX(expT)}
                          y2="330"
                          stroke="#10B981"
                          strokeWidth="2.5"
                          strokeDasharray="4 3"
                        />
                        <circle cx={mapExpX(expT)} cy={mapExpY(exponentialPdf(expT, expLambda))} r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                        <text x={mapExpX(expT)} y="50" fill="#10B981" fontSize="11" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                          t = {fmt(expT, 1)} (P &gt; t: {fmt(expSurvProb * 100, 1)}%)
                        </text>
                      </>
                    ) : (
                      <>
                        {(() => {
                          const pts = [];
                          for (let x = expS; x <= 7.001; x += 0.05) {
                            pts.push(`${mapExpX(x)},${mapExpY(exponentialPdf(x, expLambda))}`);
                          }
                          return (
                            <path
                              d={`M ${mapExpX(expS)},330 L ${pts.join(' L ')} L ${mapExpX(7)},330 Z`}
                              fill="rgba(168, 85, 247, 0.25)"
                              stroke="#A855F7"
                              strokeWidth="1.5"
                            />
                          );
                        })()}

                        {(() => {
                          const pts = [];
                          const target = expS + expDeltaT;
                          for (let x = target; x <= 7.001; x += 0.05) {
                            pts.push(`${mapExpX(x)},${mapExpY(exponentialPdf(x, expLambda))}`);
                          }
                          return (
                            <path
                              d={`M ${mapExpX(target)},330 L ${pts.join(' L ')} L ${mapExpX(7)},330 Z`}
                              fill="rgba(168, 85, 247, 0.55)"
                              stroke="#7E22CE"
                              strokeWidth="2"
                            />
                          );
                        })()}

                        <line x1={mapExpX(expS)} y1="80" x2={mapExpX(expS)} y2="330" stroke="#A855F7" strokeWidth="2" strokeDasharray="4 2" />
                        <text x={mapExpX(expS)} y="72" fill="#A855F7" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                          s = {fmt(expS, 1)}
                        </text>

                        <line x1={mapExpX(expS + expDeltaT)} y1="60" x2={mapExpX(expS + expDeltaT)} y2="330" stroke="#7E22CE" strokeWidth="2.5" strokeDasharray="4 2" />
                        <text x={mapExpX(expS + expDeltaT)} y="52" fill="#7E22CE" fontSize="11" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                          s + t = {fmt(expS + expDeltaT, 1)}
                        </text>
                      </>
                    )}

                    <path
                      d={Array.from({ length: 140 }, (_, i) => {
                        const x = (i / 140) * 7;
                        const y = exponentialPdf(x, expLambda);
                        return `${i === 0 ? 'M' : 'L'} ${mapExpX(x)} ${mapExpY(y)}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#059669"
                      strokeWidth="3.5"
                    />

                    {(() => {
                      const mx = mapExpX(expMean);
                      if (expMean > 7) return null;
                      return (
                        <g>
                          <line x1={mx} y1="95" x2={mx} y2="330" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 3" />
                          <polygon points={`${mx - 8},342 ${mx + 8},342 ${mx},330`} fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
                          <text x={mx} y="90" fill="#EF4444" fontSize="11" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                            E[X] = {fmt(expMean, 2)}
                          </text>
                        </g>
                      );
                    })()}
                  </svg>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="w-3.5 h-1 bg-emerald-500 rounded-sm"></span> Đường mật độ f(x) = λ e^(-λx)
                      </span>
                      {expMode === 'survival' ? (
                        <>
                          <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                            <span className="w-3 h-3 bg-sky-500/30 border border-sky-500 rounded-sm"></span> Đã diễn ra P(X ≤ t): {fmt(expCdfProb * 100, 1)}%
                          </span>
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <span className="w-3 h-3 bg-emerald-500/50 border border-emerald-500 rounded-sm"></span> Sống sót P(X &gt; t): {fmt(expSurvProb * 100, 1)}%
                          </span>
                        </>
                      ) : (
                        <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
                          <span className="w-3 h-3 bg-purple-500/50 border border-purple-600 rounded-sm"></span> Tỷ lệ diện tích đuôi s+t trên s = {fmt(condProbMemoryless * 100, 1)}%
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                        <span className="w-3.5 h-0.5 bg-red-500 border-dashed"></span> Trọng tâm E[X] = 1/λ = {fmt(expMean, 2)}
                      </span>
                    </div>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                      σ = {fmt(expSigma, 2)}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>
          </div>

          <LabBriefing
            title="Bản chất Phân bố Mũ & Bí mật Tính Không Nhớ (Memoryless Property)"
            question="Nếu bạn đã đợi xe buýt 20 phút mà xe chưa tới, liệu xác suất bạn phải đợi thêm 10 phút nữa có nhỏ hơn một người vừa mới bước tới trạm hay không?"
            formula="P(X > s + t \mid X > s) = \frac{P(X > s + t)}{P(X > s)} = \frac{e^{-\lambda(s+t)}}{e^{-\lambda s}} = e^{-\lambda t} = P(X > t)"
            mathExplanation="Nếu thời gian chờ tuân theo phân bố Mũ, câu trả lời là: HOÀN TOÀN NHƯ NHAU! Phân bố Mũ là phân bố liên tục duy nhất sở hữu Tính Không Nhớ. Thiết bị hoạt động theo phân bố mũ không hề bị hao mòn theo thời gian: một bóng đèn đã sáng 1000 giờ vẫn có xác suất hỏng trong 1 giờ tới y hệt như một bóng đèn mới tinh vừa bóc hộp."
            howToInteract={[
              'Kéo slider lambda để thay đổi tần suất biến cố: lambda càng lớn thì biến cố diễn ra càng dồn dập, đường cong suy giảm càng dốc.',
              'Bật chế độ Tính Không Nhớ: thay đổi s (thời gian đã đợi) và t (thời gian đợi thêm). Quan sát kết quả xác suất có điều kiện luôn trùng khít 100% với P(X > t).',
              'Quan sát mối liên hệ: với phân bố mũ, kỳ vọng E[X] và độ lệch chuẩn sigma luôn bằng nhau chằn chặn và bằng đúng 1/lambda.',
            ]}
            whatToObserve="Đồ thị hàm mật độ f(x) luôn bắt đầu tại giá trị cực đại f(0) = lambda rồi suy giảm tiệm cận về 0 nhưng không bao giờ chạm hẳn vào trục hoành. Điểm trọng tâm E[X] = 1/lambda luôn nằm tại vị trí mà phần diện tích bên trái chiếm khoảng 63.2% tổng thể."
            takeaway="Phân bố Mũ mô tả thời gian chờ giữa các biến cố của một quá trình Poisson. Nó là mô hình chuẩn mực cho hiện tượng phân rã phóng xạ, thời gian phục vụ tại quầy giao dịch và tuổi thọ linh kiện điện tử không hao mòn cơ học."
          />
        </div>
      )}

      {/* TAB 3: NORMAL DISTRIBUTION N(mu, sigma^2) */}
      {activeSub === 'normal' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="blue" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Tham số Gauss N(μ, σ²)
                </h4>
                <ClaySlider
                  label="Kỳ vọng mu"
                  value={normMu}
                  min={-3}
                  max={3}
                  step={0.2}
                  color="blue"
                  onChange={setNormMu}
                />
                <div className="mt-2">
                  <ClaySlider
                    label="Độ lệch chuẩn sigma"
                    value={normSigma}
                    min={0.4}
                    max={2.5}
                    step={0.1}
                    color="blue"
                    onChange={setNormSigma}
                  />
                </div>
              </ClayCard>

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

              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Xác suất Tích phân
                </h4>
                <div className="space-y-2.5 text-sm sm:text-[15px]">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Diện tích tích phân:</span>
                    <span className="font-mono font-black text-sky-600 dark:text-sky-400 text-base sm:text-lg">
                      {fmt(normPArea * 100, 2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Điểm uốn (Inflection):</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                      {fmt(normMu - normSigma, 1)} và {fmt(normMu + normSigma, 1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Đỉnh mật độ cực đại:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                      {fmt(1 / (normSigma * Math.sqrt(2 * Math.PI)), 3)}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>

            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <DesmosStageHeader
                  title="Đồ thị Hàm Mật Độ PDF Chuẩn Gauss & Diện Tích Tích Phân"
                  formula={`P(${fmt(rangeX1, 1)} \\le X \\le ${fmt(rangeX2, 1)}) = ${fmt(normPArea * 100, 2)}\\%`}
                  badge={`μ = ${fmt(normMu, 1)}, σ = ${fmt(normSigma, 1)}`}
                  onReset={() => {
                    setNormMu(0);
                    setNormSigma(1.0);
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

                    <line x1="60" y1="330" x2="740" y2="330" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow-norm-x)" />
                    <line x1="400" y1="360" x2="400" y2="30" stroke="#10B981" strokeWidth="2.5" markerEnd="url(#arrow-norm-y)" />
                    <text x="750" y="334" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">x</text>
                    <text x="400" y="20" fill="#10B981" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">f(x)</text>

                    {/* Oy Fixed Unit Ticks */}
                    {[0.1, 0.2, 0.3, 0.4, 0.5].map((val) => {
                      const py = mapNormY(val);
                      return (
                        <g key={val}>
                          <line x1="60" y1={py} x2="740" y2={py} stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.2" />
                          <line x1="395" y1={py} x2="405" y2={py} stroke="#10B981" strokeWidth="1.5" />
                          <text x="390" y={py + 3.5} fill="#64748B" fontSize="10" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                            {val.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}

                    {[-4, -3, -2, -1, 1, 2, 3, 4].map((val) => (
                      <g key={val}>
                        <line x1={mapNormX(val)} y1="326" x2={mapNormX(val)} y2="334" stroke="#64748B" strokeWidth="1.5" />
                        <text x={mapNormX(val)} y="350" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                          {val}
                        </text>
                      </g>
                    ))}

                    {(() => {
                      const pts = [];
                      const step = 0.05;
                      for (let x = rangeX1; x <= rangeX2 + 0.001; x += step) {
                        pts.push(`${mapNormX(x)},${mapNormY(normalPdf(x, normMu, normSigma))}`);
                      }
                      return (
                        <g>
                          <path
                            d={`M ${mapNormX(rangeX1)},330 L ${pts.join(' L ')} L ${mapNormX(rangeX2)},330 Z`}
                            fill="rgba(2, 132, 199, 0.35)"
                            stroke="#0284C7"
                            strokeWidth="1.5"
                          />
                          <line
                            x1={mapNormX(rangeX1)}
                            y1="330"
                            x2={mapNormX(rangeX1)}
                            y2={mapNormY(normalPdf(rangeX1, normMu, normSigma))}
                            stroke="#0284C7"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                          />
                          <line
                            x1={mapNormX(rangeX2)}
                            y1="330"
                            x2={mapNormX(rangeX2)}
                            y2={mapNormY(normalPdf(rangeX2, normMu, normSigma))}
                            stroke="#0284C7"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                          />
                        </g>
                      );
                    })()}

                    <path
                      d={Array.from({ length: 160 }, (_, i) => {
                        const x = -5 + (i / 160) * 10;
                        const y = normalPdf(x, normMu, normSigma);
                        return `${i === 0 ? 'M' : 'L'} ${mapNormX(x)} ${mapNormY(y)}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="3.5"
                    />

                    <line
                      x1={mapNormX(normMu)}
                      y1="50"
                      x2={mapNormX(normMu)}
                      y2="330"
                      stroke="#EF4444"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <circle cx={mapNormX(normMu)} cy={mapNormY(normalPdf(normMu, normMu, normSigma))} r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                    <text x={mapNormX(normMu)} y="42" fill="#EF4444" fontSize="12" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                      μ = {fmt(normMu, 1)}
                    </text>
                  </svg>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                        <span className="w-3 h-3 bg-sky-500 rounded-sm"></span> Diện tích P({fmt(rangeX1, 1)} ≤ X ≤ {fmt(rangeX2, 1)}) = {fmt(normPArea * 100, 2)}%
                      </span>
                      <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
                        <span className="w-3.5 h-0.5 bg-red-500 border-dashed"></span> Đỉnh đối xứng μ = {fmt(normMu, 1)}
                      </span>
                    </div>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold text-xs">
                      Quy tắc: 1σ ≈ 68.27% | 2σ ≈ 95.45% | 3σ ≈ 99.73%
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>
          </div>

          <LabBriefing
            title="Bản chất Phân bố Chuẩn Gauss & Quy Tắc Thực Nghiệm 68-95-99.7"
            question="Tại sao đường cong hình chuông Gauss lại xuất hiện khắp mọi nơi trong tự nhiên, từ chiều cao con người đến điểm thi cử?"
            formula="f(x) = \frac{1}{\sigma \sqrt{2\pi}} e^{-\frac{(x - \mu)^2}{2\sigma^2}}, \quad \mu = \mathbb{E}[X], \quad \sigma^2 = \text{Var}(X)"
            mathExplanation="Theo Định lý Giới hạn Trung tâm, khi cộng dồn một số lượng lớn các yếu tố ngẫu nhiên độc lập, tổng hoặc trung bình của chúng sẽ tự động hội tụ về phân bố Chuẩn. Đồ thị có hình quả chuông đối xứng tuyệt đối qua kỳ vọng mu, và đạt điểm uốn tại đúng mu - sigma và mu + sigma."
            howToInteract={[
              'Kéo slider mu để tịnh tiến toàn bộ quả chuông sang trái/phải dọc theo trục x mà không làm thay đổi hình dáng.',
              'Kéo slider sigma: khi sigma nhỏ, quả chuông nhọn hoắt và cao vút; khi sigma lớn, quả chuông bè thấp và trải rộng.',
              'Thử đặt khoảng [X1, X2] = [mu - sigma, mu + sigma] để kiểm chứng diện tích tích phân xấp xỉ đúng 68.27%.',
            ]}
            whatToObserve="Dù mu và sigma có thay đổi thế nào thì phần diện tích trong dải mu ± 1sigma luôn bằng đúng 68.27%, dải mu ± 2sigma luôn bằng 95.45%, và dải mu ± 3sigma chiếm tới 99.73%. Đây chính là Quy tắc Thực nghiệm 3-Sigma kinh điển."
            takeaway="Phân bố Gauss được định nghĩa trọn vẹn chỉ bởi 2 tham số: mu (vị trí tâm) và sigma (độ co giãn). Mọi phép tính trên phân bố Gauss đều có thể quy về phân bố chuẩn tắc N(0, 1) thông qua phép chuẩn hóa Z-score."
          />
        </div>
      )}

      {/* TAB 4: STANDARDIZATION & Z-SCORE */}
      {activeSub === 'standardization' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="purple" className="p-5">
                <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Biến ngẫu nhiên gốc X ~ N(μ, σ²)
                </h4>

                <div className="mb-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Tình huống thực tế:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setStdMu(0);
                        setStdSigma(1.0);
                        setStdX(1.96);
                      }}
                      className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      Mốc 97.5% (z = +1.96)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStdMu(2.0);
                        setStdSigma(1.5);
                        setStdX(5.0);
                      }}
                      className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      Lệch chuẩn +2.0σ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStdMu(3.0);
                        setStdSigma(2.0);
                        setStdX(0.0);
                      }}
                      className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      Lệch dưới -1.5σ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStdMu(0);
                        setStdSigma(1.0);
                        setStdX(3.0);
                      }}
                      className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      Ngoại lai Outlier (|z|≥3)
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <ClaySlider
                    label="Kỳ vọng mu"
                    value={stdMu}
                    min={-3}
                    max={4}
                    step={0.5}
                    color="purple"
                    formatValue={(v) => fmt(v, 1)}
                    onChange={setStdMu}
                  />
                  <ClaySlider
                    label="Độ lệch chuẩn sigma"
                    value={stdSigma}
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    color="purple"
                    formatValue={(v) => fmt(v, 1)}
                    onChange={setStdSigma}
                  />
                  <ClaySlider
                    label="Giá trị quan sát x"
                    value={stdX}
                    min={-4}
                    max={8}
                    step={0.1}
                    color="orange"
                    formatValue={(v) => fmt(v, 2)}
                    onChange={setStdX}
                  />
                </div>
              </ClayCard>

              <ClayCard glowColor="blue" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Công thức Chuẩn hóa & Z-Score
                </h4>
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-slate-800 border border-purple-200 dark:border-slate-700 text-center font-mono font-bold text-purple-800 dark:text-purple-300 text-sm sm:text-base mb-3">
                  <MathView math="Z = \frac{X - \mu}{\sigma} \sim \mathcal{N}(0, 1)" />
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">1. Dời tâm (x - μ):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {fmt(stdX, 2)} - {fmt(stdMu, 1)} = {fmt(stdX - stdMu, 2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">2. Co giãn (÷ σ):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {fmt(stdX - stdMu, 2)} ÷ {fmt(stdSigma, 1)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-sky-50 dark:bg-slate-800/80 px-2 rounded-lg text-sky-800 dark:text-sky-300 font-bold">
                    <span>Kết quả Z-score:</span>
                    <span className="text-sm font-black">{fmt(zScore, 2)}</span>
                  </div>
                </div>
              </ClayCard>

              <ClayCard glowColor="emerald" className="p-5">
                <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Ý nghĩa Vị trí Z-score
                </h4>
                <div className="space-y-2.5 text-sm sm:text-[15px]">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Xác suất P(X ≤ x) = Φ(z):</span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                      {fmt(zProb * 100, 2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Phần trăm vượt trội:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      Top {fmt((1 - zProb) * 100, 2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Đánh giá độ hiếm:</span>
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded-full font-bold ${
                        Math.abs(zScore) < 1
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : Math.abs(zScore) < 2
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          : Math.abs(zScore) < 3
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {Math.abs(zScore) < 1
                        ? 'Rất phổ biến (±1σ)'
                        : Math.abs(zScore) < 2
                        ? 'Khá điển hình (±2σ)'
                        : Math.abs(zScore) < 3
                        ? 'Hiếm gặp (±3σ)'
                        : 'Ngoại lai Cực hiếm (>3σ)'}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>

            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              <ClayCard className="p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <DesmosStageHeader
                  title="Đồ Thị So Sánh Song Song: Phân Bố Gốc X vs Chuẩn Tắc Z ~ N(0, 1)"
                  formula={`Z = \\frac{${fmt(stdX, 2)} - ${fmt(stdMu, 1)}}{${fmt(stdSigma, 1)}} = ${fmt(zScore, 2)}`}
                  badge={`P(X \\le x) = P(Z \\le z) = ${fmt(zProb * 100, 1)}%`}
                  onReset={() => {
                    setStdMu(2.0);
                    setStdSigma(1.5);
                    setStdX(4.25);
                  }}
                />

                <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[490px]">
                  <svg viewBox="0 0 800 390" className="w-full h-auto select-none">
                    <defs>
                      <marker id="arrow-std-x" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
                        <path d="M0,0 L0,5 L7,2.5 z" fill="#EF4444" />
                      </marker>
                      <marker id="arrow-std-y" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
                        <path d="M0,0 L0,5 L7,2.5 z" fill="#10B981" />
                      </marker>
                    </defs>

                    {/* TOP CHART: X ~ N(stdMu, stdSigma^2) */}
                    <g>
                      <text x="60" y="24" fill="#6366F1" fontSize="12" fontWeight="black" fontFamily="sans-serif">
                        1. Phân bố ban đầu: X ~ N(μ = {fmt(stdMu, 1)}, σ² = {fmt(stdSigma * stdSigma, 2)})
                      </text>

                      <line x1="50" y1="170" x2="750" y2="170" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrow-std-x)" />
                      <text x="760" y="174" fill="#EF4444" fontSize="11" fontWeight="bold" fontFamily="monospace">x</text>

                      {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((val) => (
                        <g key={'top-' + val}>
                          <line x1={mapStdTopX(val)} y1="167" x2={mapStdTopX(val)} y2="173" stroke="#94A3B8" strokeWidth="1" />
                          <text x={mapStdTopX(val)} y="184" fill="#64748B" fontSize="9" textAnchor="middle" fontFamily="monospace">
                            {val}
                          </text>
                        </g>
                      ))}

                      {(() => {
                        const minVal = stdMu - 4 * stdSigma;
                        const boundX = Math.min(stdX, stdMu + 4 * stdSigma);
                        const pts = [];
                        for (let x = minVal; x <= boundX + 0.001; x += 0.1) {
                          pts.push(`${mapStdTopX(x)},${mapStdTopY(normalPdf(x, stdMu, stdSigma))}`);
                        }
                        return (
                          <path
                            d={`M ${mapStdTopX(minVal)},170 L ${pts.join(' L ')} L ${mapStdTopX(boundX)},170 Z`}
                            fill="rgba(99, 102, 241, 0.35)"
                            stroke="#6366F1"
                            strokeWidth="1.5"
                          />
                        );
                      })()}

                      <path
                        d={Array.from({ length: 120 }, (_, i) => {
                          const x = stdMu - 4 * stdSigma + (i / 120) * (8 * stdSigma);
                          const y = normalPdf(x, stdMu, stdSigma);
                          return `${i === 0 ? 'M' : 'L'} ${mapStdTopX(x)} ${mapStdTopY(y)}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="2.5"
                      />

                      <line x1={mapStdTopX(stdMu)} y1="35" x2={mapStdTopX(stdMu)} y2="170" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
                      <text x={mapStdTopX(stdMu)} y="30" fill="#EF4444" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        μ = {fmt(stdMu, 1)}
                      </text>

                      <line x1={mapStdTopX(stdX)} y1="45" x2={mapStdTopX(stdX)} y2="170" stroke="#F59E0B" strokeWidth="2.5" />
                      <circle cx={mapStdTopX(stdX)} cy={mapStdTopY(normalPdf(stdX, stdMu, stdSigma))} r="4.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                      <text x={mapStdTopX(stdX)} y="40" fill="#F59E0B" fontSize="10" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                        x = {fmt(stdX, 2)}
                      </text>
                    </g>

                    {/* MIDDLE DIVIDER */}
                    <g>
                      <line x1="100" y1="195" x2="700" y2="195" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="6 4" className="dark:stroke-slate-700" />
                      <rect x="270" y="186" width="260" height="18" rx="9" fill="#0284C7" />
                      <text x="400" y="199" fill="#FFFFFF" fontSize="10" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                        ↓ Chuẩn hóa: Z = (X - {fmt(stdMu, 1)}) / {fmt(stdSigma, 1)} = {fmt(zScore, 2)} ↓
                      </text>
                    </g>

                    {/* BOTTOM CHART: Z ~ N(0, 1) */}
                    <g>
                      <text x="60" y="222" fill="#0284C7" fontSize="12" fontWeight="black" fontFamily="sans-serif">
                        2. Phân bố chuẩn tắc: Z ~ N(0, 1) [Bảo toàn nguyên vẹn xác suất tích phân]
                      </text>

                      <line x1="50" y1="350" x2="750" y2="350" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrow-std-x)" />
                      <text x="760" y="354" fill="#EF4444" fontSize="11" fontWeight="bold" fontFamily="monospace">z</text>

                      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((val) => (
                        <g key={'bot-' + val}>
                          <line x1={mapStdBotX(val)} y1="347" x2={mapStdBotX(val)} y2="353" stroke="#94A3B8" strokeWidth="1" />
                          <text x={mapStdBotX(val)} y="366" fill="#64748B" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                            {val}
                          </text>
                        </g>
                      ))}

                      {(() => {
                        const minZ = -4;
                        const boundZ = Math.min(zScore, 4);
                        const pts = [];
                        for (let z = minZ; z <= boundZ + 0.001; z += 0.1) {
                          pts.push(`${mapStdBotX(z)},${mapStdBotY(normalPdf(z, 0, 1))}`);
                        }
                        return (
                          <path
                            d={`M ${mapStdBotX(minZ)},350 L ${pts.join(' L ')} L ${mapStdBotX(boundZ)},350 Z`}
                            fill="rgba(2, 132, 199, 0.45)"
                            stroke="#0284C7"
                            strokeWidth="1.5"
                          />
                        );
                      })()}

                      <path
                        d={Array.from({ length: 120 }, (_, i) => {
                          const z = -4 + (i / 120) * 8;
                          const y = normalPdf(z, 0, 1);
                          return `${i === 0 ? 'M' : 'L'} ${mapStdBotX(z)} ${mapStdBotY(y)}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="2.5"
                      />

                      <line x1={mapStdBotX(0)} y1="230" x2={mapStdBotX(0)} y2="350" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
                      <text x={mapStdBotX(0)} y="226" fill="#EF4444" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        z = 0
                      </text>

                      <line x1={mapStdBotX(zScore)} y1="235" x2={mapStdBotX(zScore)} y2="350" stroke="#F59E0B" strokeWidth="2.5" />
                      <circle cx={mapStdBotX(zScore)} cy={mapStdBotY(normalPdf(zScore, 0, 1))} r="4.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                      <text x={mapStdBotX(zScore)} y="230" fill="#F59E0B" fontSize="10" fontWeight="black" textAnchor="middle" fontFamily="monospace">
                        z = {fmt(zScore, 2)}
                      </text>
                    </g>
                  </svg>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                        <span className="w-3 h-3 bg-indigo-500/40 rounded-sm"></span> Diện tích P(X ≤ {fmt(stdX, 1)}) = {fmt(zProb * 100, 2)}%
                      </span>
                      <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                        <span className="w-3 h-3 bg-sky-500/50 rounded-sm"></span> Diện tích chuẩn tắc P(Z ≤ {fmt(zScore, 2)}) = {fmt(zProb * 100, 2)}%
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <span className="w-3.5 h-0.5 bg-amber-500"></span> Vạch quan sát x & điểm Z tương ứng
                      </span>
                    </div>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                      Phi(z) = {fmt(zProb, 4)}
                    </span>
                  </div>
                </div>
              </ClayCard>
            </div>
          </div>

          <LabBriefing
            title="Bản chất Phép Chuẩn Hóa (Standardization) & Ý Nghĩa Z-Score"
            question="Tại sao mọi phân bố Chuẩn N(μ, σ²) bất kỳ đều có thể quy về một phân bố chuẩn tắc N(0, 1) duy nhất, và Z-score có vai trò gì trong thế giới thực?"
            formula="Z = \frac{X - \mu}{\sigma} \sim \mathcal{N}(0, 1), \quad P(X \le x) = P\left(Z \le \frac{x - \mu}{\sigma}\right) = \Phi(z)"
            mathExplanation="Phép chuẩn hóa gồm 2 thao tác hình học thuần túy: Dời gốc tọa độ (trừ mu đưa tâm phân bố về 0) và co giãn tỷ lệ (chia cho sigma chuẩn hóa độ rộng về 1 đơn vị chuẩn). Qua phép biến đổi tuyến tính Z = (X - mu)/sigma, toàn bộ diện tích tích phân dưới đường cong được bảo toàn nguyên vẹn."
            howToInteract={[
              'Kéo slider x, mu, sigma để quan sát đồng thời cả hai đồ thị: đồ thị trên là phân bố gốc X, đồ thị dưới là phân bố chuẩn tắc Z.',
              'Để ý vùng tô màu tím ở trên và vùng màu xanh dương ở dưới luôn luôn bằng nhau chằn chặn về tỷ lệ phần trăm (Diện tích bảo toàn).',
              'Bấm các nút chọn nhanh để xem ví dụ kinh điển: mốc giới hạn z = +1.96 (tương ứng đuôi 2.5% bên phải), hoặc tình huống ngoại lai z > 3.',
            ]}
            whatToObserve="Giá trị Z-score chính là thước đo khoảng cách theo đơn vị độ lệch chuẩn: z = +2.0 nghĩa là điểm số này cao hơn trung bình đúng 2 lần độ lệch chuẩn; z = -1.5 nghĩa là thấp hơn trung bình 1.5 lần độ lệch chuẩn."
            takeaway="Z-score là công cụ chuẩn hóa tối thượng trong khoa học dữ liệu giúp xóa bỏ sự chênh lệch về đơn vị đo lường và thang điểm giữa các đặc trưng."
          />
        </div>
      )}
    </div>
  );
};
