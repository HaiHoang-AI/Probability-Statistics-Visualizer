import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt } from '../../../utils/math';

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

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-3xl bg-gradient-to-r from-lime-500/10 to-green-500/10 border-2 border-lime-200 dark:border-lime-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400">
            MAT1101 Bài 2 — Tính toán Xác suất Cơ bản & Nghịch lý
          </span>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-0.5">
            Xác suất có điều kiện, Monty Hall & Nghịch lý Test Y tế
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSub('monty')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all ${
              activeSub === 'monty' ? 'bg-green-600 text-white shadow-md' : 'bg-white/80 dark:bg-slate-800'
            }`}
          >
            Trò chơi Monty Hall
          </button>
          <button
            onClick={() => setActiveSub('medical')}
            className={`px-3 py-2 rounded-2xl text-xs font-heading font-bold transition-all ${
              activeSub === 'medical' ? 'bg-green-600 text-white shadow-md' : 'bg-white/80 dark:bg-slate-800'
            }`}
          >
            Dương tính Giả Y tế
          </button>
        </div>
      </div>

      {activeSub === 'monty' ? (
        <ClayCard glowColor="emerald" className="p-6">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h3 className="font-heading font-black text-xl mb-1">Nghịch lý 3 Cánh Cửa Monty Hall</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Có 1 chiếc xe hơi và 2 chú dê sau 3 cánh cửa. Liệu bạn có nên <strong>đổi cửa</strong> khi người dẫn chương trình mở ra 1 con dê?
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
            {[0, 1, 2].map((idx) => {
              const isChosen = chosenDoor === idx;
              const isRevealed = revealedDoor === idx;
              const isCar = carDoor === idx;

              let doorContent = 'Chưa mở';
              if (isRevealed) doorContent = 'Dê';
              if (gameStep === 'result') doorContent = isCar ? 'XE HƠI' : 'Dê';

              return (
                <div
                  key={idx}
                  onClick={() => handlePickDoor(idx)}
                  className={`
                    h-40 rounded-2xl border-4 flex flex-col items-center justify-center cursor-pointer transition-all p-3 text-center
                    ${isChosen ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40' : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'}
                    ${isRevealed ? 'opacity-60 bg-red-50 dark:bg-red-950/40 border-red-300' : ''}
                  `}
                >
                  <span className="text-xs font-bold font-mono uppercase text-slate-400 mb-1">Cửa {idx + 1}</span>
                  <span className="text-base font-bold my-2">{doorContent}</span>
                  {isChosen && <span className="text-[10px] font-bold text-orange-600">Đã chọn</span>}
                </div>
              );
            })}
          </div>

          {gameStep === 'reveal' && (
            <div className="text-center space-y-3 max-w-md mx-auto p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200">
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                MC đã mở Cửa {revealedDoor! + 1} là một con Dê! Bạn có muốn ĐỔI CỬA không?
              </p>
              <div className="flex gap-3 justify-center">
                <ClayButton variant="primary" size="sm" onClick={() => handleFinalChoice(true)}>
                  Đổi cửa (Khuyên dùng)
                </ClayButton>
                <ClayButton variant="outline" size="sm" onClick={() => handleFinalChoice(false)}>
                  Giữ nguyên
                </ClayButton>
              </div>
            </div>
          )}

          {gameStep === 'result' && (
            <div className="text-center space-y-2">
              <p className="font-heading font-bold text-sm text-slate-800 dark:text-slate-100">
                {chosenDoor === carDoor ? 'Chúc mừng bạn đã thắng Xe hơi!' : 'Rất tiếc, bạn nhận được chú Dê!'}
              </p>
              <ClayButton variant="secondary" size="sm" onClick={resetGame}>
                Chơi ván tiếp theo
              </ClayButton>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-8 text-xs font-mono font-bold">
            <span className="text-emerald-600">Đổi cửa thắng: {switchWins}</span>
            <span className="text-blue-600">Giữ cửa thắng: {stayWins}</span>
            <span className="text-slate-500">Tổng ván: {totalGames}</span>
          </div>
        </ClayCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ClayCard glowColor="emerald">
            <h3 className="font-heading font-bold text-lg mb-3">Thông số Xét nghiệm</h3>
            <ClaySlider
              label="Tỷ lệ mắc bệnh thực tế P(B)"
              value={prevalence * 100}
              min={0.01}
              max={1.0}
              step={0.01}
              color="rose"
              formatValue={(v) => `${fmt(v, 2)}%`}
              onChange={(v) => setPrevalence(v / 100)}
            />
            <ClaySlider
              label="Độ nhạy Sensitivity P(+|B)"
              value={sensitivity * 100}
              min={90}
              max={99.9}
              step={0.1}
              color="emerald"
              formatValue={(v) => `${fmt(v, 1)}%`}
              onChange={(v) => setSensitivity(v / 100)}
            />
            <ClaySlider
              label="Độ đặc hiệu Specificity P(-|B_c)"
              value={specificity * 100}
              min={90}
              max={99.9}
              step={0.1}
              color="blue"
              formatValue={(v) => `${fmt(v, 1)}%`}
              onChange={(v) => setSpecificity(v / 100)}
            />
          </ClayCard>

          <div className="lg:col-span-2">
            <ClayCard glowColor="emerald" className="p-6 flex flex-col justify-between">
              <div>
                <h4 className="font-heading font-bold text-lg mb-2">
                  Kết quả Suy luận Bayes: Khi Test Báo Dương Tính
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  Xác suất bạn <strong>thực sự mắc bệnh</strong> khi nhận kết quả (+) từ bệnh viện:
                </p>

                <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800 text-center font-mono">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block mb-1">
                    P(Mắc bệnh | Dương tính) = PPV
                  </span>
                  <span className="text-4xl font-black text-rose-600 dark:text-rose-400">
                    {fmt(ppv * 100, 2)}%
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <strong>Nghịch lý:</strong> Dù que thử chính xác tới 99%, nhưng vì bệnh hiếm (0.1%), trong 10,000 người sẽ có tới ~100 người khỏe mạnh bị test nhầm thành dương tính giả, trong khi chỉ có 1 người bệnh thật. Do đó kết quả dương tính chỉ có khả năng đúng vỏn vẹn <strong>{fmt(ppv * 100, 1)}%</strong>!
              </div>
            </ClayCard>
          </div>
        </div>
      )}
    </div>
  );
};
