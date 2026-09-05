import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';

export const BasicProbability: React.FC = () => {
  const [activeSub, setActiveSub] = useState<'monty' | 'medical'>('monty');

  // Monty Hall Interactive State
  const [carDoor, setCarDoor] = useState<number>(() => Math.floor(Math.random() * 3));
  const [chosenDoor, setChosenDoor] = useState<number | null>(null);
  const [revealedDoor, setRevealedDoor] = useState<number | null>(null);
  const [gameStep, setGameStep] = useState<'pick' | 'reveal' | 'result'>('pick');
  const [switchWins, setSwitchWins] = useState<number>(0);
  const [stayWins, setStayWins] = useState<number>(0);
  const [totalGames, setTotalGames] = useState<number>(0);

  const handlePickDoor = (doorIndex: number) => {
    if (gameStep !== 'pick') return;
    setChosenDoor(doorIndex);

    // Host reveals a goat door
    const available = [0, 1, 2].filter((d) => d !== doorIndex && d !== carDoor);
    const hostChoice = available[Math.floor(Math.random() * available.length)];
    setRevealedDoor(hostChoice);
    setGameStep('reveal');
  };

  const handleFinalChoice = (isSwitch: boolean) => {
    if (chosenDoor === null || revealedDoor === null) return;
    const finalDoor = isSwitch ? [0, 1, 2].find((d) => d !== chosenDoor && d !== revealedDoor)! : chosenDoor;
    const isWin = finalDoor === carDoor;

    if (isSwitch && isWin) setSwitchWins((w) => w + 1);
    if (!isSwitch && isWin) setStayWins((w) => w + 1);
    setTotalGames((g) => g + 1);
    setChosenDoor(finalDoor);
    setGameStep('result');
  };

  const resetGame = () => {
    setCarDoor(Math.floor(Math.random() * 3));
    setChosenDoor(null);
    setRevealedDoor(null);
    setGameStep('pick');
  };

  // Medical Test State
  const [prevalence, setPrevalence] = useState<number>(0.001); // 0.1%
  const [sensitivity, setSensitivity] = useState<number>(0.99); // 99%
  const [specificity, setSpecificity] = useState<number>(0.99); // 99%

  // Bayes rule for Medical Test: P(Disease | Positive)
  const pPosGivenDisease = sensitivity;
  const pPosGivenHealthy = 1 - specificity;
  const pDisease = prevalence;
  const pHealthy = 1 - prevalence;
  const pTotalPositive = pDisease * pPosGivenDisease + pHealthy * pPosGivenHealthy;
  const ppv = (pDisease * pPosGivenDisease) / pTotalPositive;

  // 10,000 population numbers
  const popTotal = 10000;
  const popSick = Math.round(popTotal * prevalence);
  const popHealthy = popTotal - popSick;
  const truePos = Math.round(popSick * sensitivity);
  const falsePos = Math.round(popHealthy * (1 - specificity));

  return (
    <div className="space-y-6">
      {/* Chapter Subtitle & Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 2 — Tính toán Xác suất Cơ bản
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Xác suất có điều kiện & Nghịch lý Monty Hall
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSub('monty')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeSub === 'monty'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Nghịch lý Monty Hall
          </button>
          <button
            onClick={() => setActiveSub('medical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeSub === 'medical'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Dương tính Giả Y tế
          </button>
        </div>
      </div>

      {activeSub === 'monty' ? (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
              <ClayCard glowColor="amber" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Quy tắc Trò chơi
              </h4>
              <ol className="text-sm sm:text-[15px] space-y-2 list-decimal list-inside text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                <li>Bạn chọn 1 cánh cửa bất kỳ trong số 3 cánh cửa.</li>
                <li>MC biết rõ xe ở đâu, luôn mở 1 trong 2 cánh cửa còn lại có <strong>con Dê</strong>.</li>
                <li>Bạn được quyền chọn: <strong>Đổi cửa</strong> hay <strong>Giữ nguyên</strong>.</li>
              </ol>
            </ClayCard>

            {/* Card 2: Giải thích Bayes */}
            <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Bản chất Toán học Bayes
              </h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                Lúc đầu, xác suất bạn chọn trúng Xe chỉ là <MathView math="P(\text{Trúng}) = 1/3" />, xác suất Xe nằm ở 2 cửa kia là <MathView math="2/3" />. Khi MC loại bỏ 1 con Dê, toàn bộ <MathView math="2/3" /> xác suất dồn hết vào cánh cửa còn lại!
              </p>
            </ClayCard>

            {/* Card 3: Thống kê & So sánh */}
            <ClayCard glowColor="emerald" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                So sánh Chiến lược
              </h4>
              <div className="space-y-2.5 text-sm sm:text-[15px]">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Lý thuyết Đổi cửa:</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm sm:text-base">66.67% (2/3)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Lý thuyết Giữ cửa:</span>
                  <span className="font-mono font-bold text-slate-500 text-sm sm:text-base">33.33% (1/3)</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Lợi thế khi Đổi cửa:</span>
                  <span className="font-mono font-black text-sky-600 dark:text-sky-400 text-base sm:text-lg">Gấp 2 lần</span>
                </div>
              </div>
            </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA (DESMOS 3D VIEWPORT) */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Mô phỏng Trực quan Nghịch lý 3 Cánh Cửa Monty Hall"
              formula="P(\text{Win}|\text{Switch}) = \frac{2}{3} \approx 66.7\% \quad vs \quad P(\text{Win}|\text{Stay}) = \frac{1}{3} \approx 33.3\%"
              badge={`Tổng: ${totalGames} ván`}
              onReset={resetGame}
            />

            <div className="desmos-viewport w-full p-6 sm:p-8 flex flex-col justify-between min-h-[460px]">
              <div className="text-center max-w-xl mx-auto mb-4">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  {gameStep === 'pick' && 'Bước 1: Chọn 1 trong 3 cánh cửa bên dưới'}
                  {gameStep === 'reveal' && 'Bước 2: MC mở 1 con dê! Bạn có muốn ĐỔI CỬA không?'}
                  {gameStep === 'result' && (chosenDoor === carDoor ? 'Chúc mừng bạn đã trúng XE HƠI!' : 'Rất tiếc! Bạn nhận được một chú DÊ!')}
                </span>
              </div>

              {/* The 3 Cartoon Doors Centered Large */}
              <div className="grid grid-cols-3 gap-5 max-w-2xl mx-auto w-full mb-6">
                {[0, 1, 2].map((idx) => {
                  const isChosen = chosenDoor === idx;
                  const isRevealed = revealedDoor === idx;
                  const isCar = carDoor === idx;

                  let doorContent = 'Chưa mở';
                  let contentColor = 'text-slate-400';
                  if (isRevealed) {
                    doorContent = 'DÊ 🐐';
                    contentColor = 'text-amber-600';
                  }
                  if (gameStep === 'result') {
                    doorContent = isCar ? 'XE HƠI 🚗' : 'DÊ 🐐';
                    contentColor = isCar ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400';
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => handlePickDoor(idx)}
                      className={`
                        h-52 rounded-3xl border-4 flex flex-col items-center justify-between p-4 cursor-pointer transition-all duration-200 select-none
                        ${isChosen
                          ? 'border-sky-500 bg-sky-50 dark:bg-slate-800 scale-105 shadow-[4px_4px_0px_#0284c7]'
                          : 'border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-[4px_4px_0px_#0f172a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#0f172a]'}
                        ${isRevealed ? 'opacity-70 bg-red-50 dark:bg-red-950/30 border-red-400' : ''}
                      `}
                    >
                      <div className="w-full flex justify-between items-center text-xs font-mono font-bold text-slate-500">
                        <span>CỬA {idx + 1}</span>
                        {isChosen && <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500 text-white">ĐÃ CHỌN</span>}
                      </div>

                      <div className={`text-xl sm:text-2xl font-black font-heading my-auto text-center ${contentColor}`}>
                        {doorContent}
                      </div>

                      <div className="w-full text-center">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {gameStep === 'pick' ? 'Nhấn để chọn' : isRevealed ? 'Đã hé lộ' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reveal Phase Actions */}
              {gameStep === 'reveal' && (
                <div className="text-center max-w-md mx-auto p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-slate-900 dark:border-amber-700 shadow-[4px_4px_0px_#0f172a] space-y-3">
                  <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                    MC Monty Hall vừa hé lộ một con Dê ở Cửa {revealedDoor! + 1}! Bạn có muốn ĐỔI CỬA không?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <ClayButton variant="primary" size="sm" onClick={() => handleFinalChoice(true)}>
                      Đổi cửa (Khuyên dùng - 66.7%)
                    </ClayButton>
                    <ClayButton variant="outline" size="sm" onClick={() => handleFinalChoice(false)}>
                      Giữ nguyên (33.3%)
                    </ClayButton>
                  </div>
                </div>
              )}

              {gameStep === 'result' && (
                <div className="text-center">
                  <ClayButton variant="secondary" size="sm" onClick={resetGame}>
                    Chơi ván tiếp theo
                  </ClayButton>
                </div>
              )}

              {/* Bottom Live Win-Rate Bar inside Stage */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">
                  Đổi cửa thắng: {switchWins} ván ({totalGames > 0 ? fmt((switchWins / totalGames) * 100, 1) : '0.0'}%)
                </span>
                <span className="text-sky-600 dark:text-sky-400">
                  Giữ cửa thắng: {stayWins} ván ({totalGames > 0 ? fmt((stayWins / totalGames) * 100, 1) : '0.0'}%)
                </span>
                <span className="text-slate-500">
                  Tổng đã chơi: {totalGames} ván
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
              <ClayCard glowColor="rose" className="p-5">
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Thông số Y tế
              </h4>
              <ClaySlider
                label="Tỷ lệ mắc bệnh nền P(D)"
                value={prevalence * 100}
                min={0.01}
                max={1.0}
                step={0.01}
                color="rose"
                formatValue={(v) => `${fmt(v, 2)}%`}
                onChange={(v) => setPrevalence(v / 100)}
              />
              <div className="mt-2">
                <ClaySlider
                  label="Độ nhạy Sensitivity P(+|D)"
                  value={sensitivity * 100}
                  min={90}
                  max={99.9}
                  step={0.1}
                  color="emerald"
                  formatValue={(v) => `${fmt(v, 1)}%`}
                  onChange={(v) => setSensitivity(v / 100)}
                />
              </div>
              <div className="mt-2">
                <ClaySlider
                  label="Độ đặc hiệu Specificity P(-|Dᶜ)"
                  value={specificity * 100}
                  min={90}
                  max={99.9}
                  step={0.1}
                  color="blue"
                  formatValue={(v) => `${fmt(v, 1)}%`}
                  onChange={(v) => setSpecificity(v / 100)}
                />
              </div>
            </ClayCard>

            {/* Card 2: Công thức Bayes */}
            <ClayCard glowColor="blue" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Công thức Bayes Thay số
              </h4>
              <div className="space-y-2.5 text-sm sm:text-base font-mono text-slate-700 dark:text-slate-200 font-semibold">
                <div>P(D) = {fmt(prevalence, 4)}</div>
                <div>P(+|D) = {fmt(sensitivity, 3)}</div>
                <div>P(+|Dᶜ) = 1 - {fmt(specificity, 3)} = {fmt(1 - specificity, 3)}</div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-sky-600 dark:text-sky-400 font-bold text-base sm:text-lg">
                  P(+) = {fmt(pTotalPositive, 5)}
                </div>
              </div>
            </ClayCard>

            {/* Card 3: Nghịch lý Trực quan */}
            <ClayCard glowColor="emerald" className="p-5">
              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Bản chất Nghịch lý
              </h4>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                Khi một căn bệnh rất hiếm, số người khỏe mạnh chiếm đại đa số (9,990 người). Dù que thử sai sót rất ít (1%), 1% của nhóm khỏe mạnh ({falsePos} người) vẫn <strong>lớn gấp nhiều lần</strong> tổng số người thực sự mắc bệnh ({popSick} người). Do đó, cần test khẳng định lần 2!
              </p>
            </ClayCard>
            </div>

            {/* RIGHT COLUMN: GRAPH STAGE */}
            <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
              {/* 1. MÀN HÌNH ĐỒ THỊ TO Ở CHÍNH GIỮA (DESMOS 3D VIEWPORT) */}
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Phân tích Luồng Dân số 10,000 Người & Nghịch lý Dương tính Giả"
              formula="P(\text{Bệnh}|+) = \frac{P(+|\text{Bệnh})P(\text{Bệnh})}{P(+)}"
              badge={`PPV = ${fmt(ppv * 100, 2)}%`}
              onReset={() => {
                setPrevalence(0.001);
                setSensitivity(0.99);
                setSpecificity(0.99);
              }}
            />

            <div className="desmos-viewport w-full p-6 flex flex-col justify-between min-h-[460px]">
              {/* Visual Population Flow comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
                {/* Truly Sick Group */}
                <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-red-700 dark:text-red-300">
                      Nhóm Mắc Bệnh Thật (Prevalence {fmt(prevalence * 100, 2)}%)
                    </span>
                    <span className="font-mono font-bold text-sm text-red-600">{popSick} người</span>
                  </div>
                  <div className="w-full bg-red-200 dark:bg-red-900/50 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-red-900 dark:text-red-200">
                      <span>Test (+) Thật (True Positive):</span>
                      <span className="font-mono">{truePos} người</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Bỏ sót (-) Giả:</span>
                      <span className="font-mono">{popSick - truePos} người</span>
                    </div>
                  </div>
                </div>

                {/* Truly Healthy Group */}
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
                      Nhóm Khỏe Mạnh Thật ({fmt((1 - prevalence) * 100, 2)}%)
                    </span>
                    <span className="font-mono font-bold text-sm text-emerald-600">{popHealthy} người</span>
                  </div>
                  <div className="w-full bg-emerald-200 dark:bg-emerald-900/50 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>Test (-) Thật (Đặc hiệu 99%):</span>
                      <span className="font-mono">{popHealthy - falsePos} người</span>
                    </div>
                    <div className="flex justify-between font-bold text-rose-700 dark:text-rose-300">
                      <span>Test (+) Nhầm (False Positive 1%):</span>
                      <span className="font-mono">{falsePos} người!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Central Bayes Result Box */}
              <div className="p-6 rounded-3xl bg-amber-50 dark:bg-slate-900/90 border-2 border-slate-900 dark:border-amber-700 shadow-[4px_4px_0px_#0f172a] text-center">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Xác suất Thực sự Mắc Bệnh khi nhận kết quả Dương Tính (+) [PPV]:
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-rose-600 dark:text-rose-400 my-1">
                  {fmt(ppv * 100, 2)}%
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  PPV = {truePos} người bệnh thật / ({truePos} bệnh thật + {falsePos} người khỏe bị test nhầm) = {fmt(ppv * 100, 2)}%
                </span>
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

