import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ClayButton } from '../common/ClayButton';
import { ClaySlider } from '../common/ClaySlider';
import { ClayCard } from '../common/ClayCard';
import { MathView } from '../common/MathView';
import { fmt } from '../../utils/math';
import { playPegHit, playBinLanding, isAudioEnabled, setAudioEnabled } from '../../utils/audio';

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  row: number; // Current row of pegs it is interacting with
  choices: number[]; // Sequence of left (-1) or right (+1) choices
  targetX: number;
  targetY: number;
  targetBin: number;
  settled: boolean;
  color: string;
}

const BALL_COLORS = ['#0284C7', '#0D9488', '#E11D48', '#D97706', '#7C3AED', '#2563EB'];

export const GaltonBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation parameters
  const [numRows, setNumRows] = useState<number>(12); // Number of peg rows
  const [probRight, setProbRight] = useState<number>(0.5); // Probability of bouncing right
  const [dropSpeed, setDropSpeed] = useState<number>(5); // Balls per second in auto mode
  const [isAutoDropping, setIsAutoDropping] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(isAudioEnabled());
  const [showTheoreticalCurve, setShowTheoreticalCurve] = useState<boolean>(true);

  // Statistics
  const [binCounts, setBinCounts] = useState<number[]>(() => new Array(13).fill(0));
  const [totalBalls, setTotalBalls] = useState<number>(0);

  // Keep live mutable state in refs for 60fps canvas loop
  const ballsRef = useRef<Ball[]>([]);
  const binCountsRef = useRef<number[]>(new Array(numRows + 1).fill(0));
  const nextBallIdRef = useRef<number>(1);
  const isAutoRef = useRef<boolean>(false);
  isAutoRef.current = isAutoDropping;

  // Sync binCounts when numRows changes
  useEffect(() => {
    ballsRef.current = [];
    binCountsRef.current = new Array(numRows + 1).fill(0);
    setBinCounts(new Array(numRows + 1).fill(0));
    setTotalBalls(0);
  }, [numRows]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setAudioEnabled(next);
  };

  // Theoretical Mean and Variance: Binomial(numRows, probRight)
  const theoreticalMean = useMemo(() => numRows * probRight, [numRows, probRight]);
  const theoreticalVar = useMemo(() => numRows * probRight * (1 - probRight), [numRows, probRight]);

  // Empirical Mean and Variance
  const { empiricalMean, empiricalVar } = useMemo(() => {
    if (totalBalls === 0) return { empiricalMean: 0, empiricalVar: 0 };
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i <= numRows; i++) {
      const count = binCounts[i] || 0;
      sum += i * count;
      sumSq += i * i * count;
    }
    const mean = sum / totalBalls;
    const variance = totalBalls > 1 ? (sumSq - totalBalls * mean * mean) / (totalBalls - 1) : 0;
    return { empiricalMean: mean, empiricalVar: variance };
  }, [binCounts, totalBalls, numRows]);

  // Function to spawn a ball
  const spawnBall = useCallback(() => {
    const id = nextBallIdRef.current++;
    // Pre-calculate path using Bernoulli trials with probRight
    const choices: number[] = [];
    let rightSteps = 0;
    for (let r = 0; r < numRows; r++) {
      const goRight = Math.random() < probRight;
      choices.push(goRight ? 1 : -1);
      if (goRight) rightSteps++;
    }

    const color = BALL_COLORS[id % BALL_COLORS.length];

    ballsRef.current.push({
      id,
      x: 0, // Assigned in animation loop relative to canvas width
      y: 20,
      vx: 0,
      vy: 2.5,
      row: -1,
      choices,
      targetX: 0,
      targetY: 0,
      targetBin: rightSteps,
      settled: false,
      color,
    });
  }, [numRows, probRight]);

  // Spawn batch
  const spawnBatch = useCallback((count: number) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => spawnBall(), i * (1000 / (dropSpeed * 5)));
    }
  }, [spawnBall, dropSpeed]);

  // Reset simulation
  const handleReset = () => {
    setIsAutoDropping(false);
    ballsRef.current = [];
    binCountsRef.current = new Array(numRows + 1).fill(0);
    setBinCounts(new Array(numRows + 1).fill(0));
    setTotalBalls(0);
  };

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animId: number;
    let lastDropTime = 0;

    const render = (time: number) => {
      // Auto-spawn balls
      if (isAutoRef.current && time - lastDropTime > 1000 / dropSpeed) {
        spawnBall();
        lastDropTime = time;
      }

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.floor(rect.width);
      const height = Math.max(480, Math.floor(rect.height));

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');

      // Geometric constants
      const funnelY = 40;
      const startPegY = 70;
      const binTopY = height - 140;
      const binBottomY = height - 35;
      const centerX = width / 2;

      const pegSpacingY = (binTopY - startPegY) / (numRows + 0.5);
      const pegSpacingX = Math.min(width / (numRows + 2), pegSpacingY * 1.05);

      // 1. Draw Funnel Top
      ctx.beginPath();
      ctx.moveTo(centerX - 40, 10);
      ctx.lineTo(centerX - 10, funnelY);
      ctx.lineTo(centerX - 10, startPegY - 10);
      ctx.lineTo(centerX + 10, startPegY - 10);
      ctx.lineTo(centerX + 10, funnelY);
      ctx.lineTo(centerX + 40, 10);
      ctx.strokeStyle = isDark ? '#64748B' : '#94A3B8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 2. Draw Pegs
      const pegRadius = Math.max(2.5, Math.min(4.5, pegSpacingX * 0.15));
      ctx.fillStyle = isDark ? '#E2E8F0' : '#1E293B';

      for (let r = 0; r < numRows; r++) {
        const py = startPegY + r * pegSpacingY;
        const rowPegCount = r + 1;
        const rowStartX = centerX - ((rowPegCount - 1) * pegSpacingX) / 2;

        for (let p = 0; p < rowPegCount; p++) {
          const px = rowStartX + p * pegSpacingX;
          ctx.beginPath();
          ctx.arc(px, py, pegRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Draw Bins Separators & Labels
      const numBins = numRows + 1;
      const binWidth = pegSpacingX;
      const binsStartX = centerX - (numBins * binWidth) / 2;

      ctx.strokeStyle = isDark ? '#475569' : '#CBD5E1';
      ctx.lineWidth = 2;

      for (let b = 0; b <= numBins; b++) {
        const bx = binsStartX + b * binWidth;
        ctx.beginPath();
        ctx.moveTo(bx, binTopY);
        ctx.lineTo(bx, binBottomY);
        ctx.stroke();
      }

      // Bin base line
      ctx.beginPath();
      ctx.moveTo(binsStartX, binBottomY);
      ctx.lineTo(binsStartX + numBins * binWidth, binBottomY);
      ctx.stroke();

      // Bin labels & values
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      for (let b = 0; b < numBins; b++) {
        const bx = binsStartX + b * binWidth + binWidth / 2;
        ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
        ctx.fillText(`${b}`, bx, binBottomY + 16);
      }

      // 4. Draw Stacked Balls in Bins (Histogram Bars & Beads)
      const maxCount = Math.max(...binCountsRef.current, 1);
      const binHeightMax = binBottomY - binTopY - 10;

      for (let b = 0; b < numBins; b++) {
        const count = binCountsRef.current[b];
        if (count === 0) continue;

        const bx = binsStartX + b * binWidth + 2;
        const bw = binWidth - 4;
        const barHeight = (count / maxCount) * binHeightMax;
        const by = binBottomY - barHeight;

        // Gradient filled bar
        const grad = ctx.createLinearGradient(0, binBottomY, 0, by);
        grad.addColorStop(0, isDark ? 'rgba(2, 132, 199, 0.4)' : 'rgba(2, 132, 199, 0.25)');
        grad.addColorStop(1, isDark ? 'rgba(14, 165, 233, 0.8)' : 'rgba(2, 132, 199, 0.65)');
        ctx.fillStyle = grad;
        ctx.fillRect(bx, by, bw, barHeight);

        // Count on top of bar
        ctx.fillStyle = isDark ? '#38BDF8' : '#0284C7';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`${count}`, bx + bw / 2, by - 4);
      }

      // 5. Draw Theoretical Binomial / Normal Bell Curve Overlay
      if (showTheoreticalCurve && totalBalls > 0) {
        ctx.beginPath();
        ctx.strokeStyle = '#EF4444'; // Bright Red
        ctx.lineWidth = 2.5;

        // Binomial PMF scaled to max height
        let firstPoint = true;
        for (let b = 0; b < numBins; b++) {
          const bx = binsStartX + b * binWidth + binWidth / 2;
          // Normal approximation height
          const x = b;
          const mu = numRows * probRight;
          const sigma = Math.sqrt(Math.max(0.1, numRows * probRight * (1 - probRight)));
          const normPdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));

          // Normalization factor relative to maxCount
          const expectedMaxPdf = 1 / (sigma * Math.sqrt(2 * Math.PI));
          const curveHeight = (normPdf / expectedMaxPdf) * ((Math.max(1, maxCount) / maxCount) * binHeightMax * 0.95);
          const cy = binBottomY - curveHeight;

          if (firstPoint) {
            ctx.moveTo(bx, cy);
            firstPoint = false;
          } else {
            ctx.lineTo(bx, cy);
          }
        }
        ctx.stroke();

        // Legend for curve
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('Đường cong Chuẩn lý thuyết', width - 20, 30);
      }

      // 6. Update and Draw Falling Balls
      const ballRadius = Math.max(3, Math.min(6, pegSpacingX * 0.2));
      const remainingBalls: Ball[] = [];
      let updatedBinCounts = false;

      for (let i = 0; i < ballsRef.current.length; i++) {
        const b = ballsRef.current[i];

        if (b.settled) continue;

        // Position interpolation logic
        const currentTargetRow = b.row + 1;

        if (currentTargetRow < numRows) {
          const nextPegY = startPegY + currentTargetRow * pegSpacingY;

          // Calculate current target X
          let currentRightSteps = 0;
          for (let s = 0; s <= currentTargetRow; s++) {
            if (b.choices[s] === 1) currentRightSteps++;
          }
          const rowPegCount = currentTargetRow + 1;
          const rowStartX = centerX - ((rowPegCount - 1) * pegSpacingX) / 2;
          const pegX = rowStartX + currentRightSteps * pegSpacingX;

          // Move towards target
          const targetY = nextPegY;
          b.y += 3.8;

          // Smooth curved sway towards peg
          const progressInRow = (b.y - (startPegY + b.row * pegSpacingY)) / pegSpacingY;
          b.x += (pegX - b.x) * 0.18;

          if (b.y >= targetY) {
            b.row = currentTargetRow;
            // Play subtle wooden hit sound
            playPegHit(1.0 + (b.row / numRows) * 0.5);
          }

          remainingBalls.push(b);
        } else {
          // Ball is heading to bottom bin
          const targetBinX = binsStartX + b.targetBin * binWidth + binWidth / 2;
          b.y += 5.5;
          b.x += (targetBinX - b.x) * 0.25;

          if (b.y >= binBottomY - 10) {
            b.settled = true;
            binCountsRef.current[b.targetBin]++;
            updatedBinCounts = true;
            playBinLanding(b.targetBin, numBins);
          } else {
            remainingBalls.push(b);
          }
        }

        // Draw the falling ball with 3D radial shine
        ctx.beginPath();
        ctx.arc(b.x || centerX, b.y, ballRadius, 0, Math.PI * 2);
        const ballGrad = ctx.createRadialGradient(
          (b.x || centerX) - ballRadius * 0.3,
          b.y - ballRadius * 0.3,
          ballRadius * 0.2,
          b.x || centerX,
          b.y,
          ballRadius
        );
        ballGrad.addColorStop(0, '#FFFFFF');
        ballGrad.addColorStop(0.5, b.color);
        ballGrad.addColorStop(1, '#0F172A');
        ctx.fillStyle = ballGrad;
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ballsRef.current = remainingBalls;

      if (updatedBinCounts) {
        setBinCounts([...binCountsRef.current]);
        setTotalBalls((prev) => prev + 1);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [numRows, probRight, dropSpeed, spawnBall, showTheoreticalCurve, totalBalls]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* LEFT COLUMN: Controls & Statistical Metrics */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 shrink-0 order-2 lg:order-1">
        {/* Card 1: Interactive Controllers */}
        <ClayCard glowColor="blue" className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Điều khiển Mô phỏng
            </h4>
            {/* Audio Toggle Button */}
            <button
              onClick={toggleSound}
              className={`px-2.5 py-1 rounded-lg text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                soundOn
                  ? 'bg-amber-400 text-slate-950 shadow-[1.5px_1.5px_0px_#0f172a]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {soundOn ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <ClayButton
                variant="primary"
                onClick={() => spawnBall()}
                className="w-full text-xs py-2"
              >
                Thả 1 bi
              </ClayButton>
              <ClayButton
                variant="secondary"
                onClick={() => spawnBatch(20)}
                className="w-full text-xs py-2"
              >
                Thả 20 bi
              </ClayButton>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ClayButton
                variant={isAutoDropping ? 'danger' : 'primary'}
                onClick={() => setIsAutoDropping(!isAutoDropping)}
                className="w-full text-xs py-2"
              >
                {isAutoDropping ? 'Dừng tự động' : 'Tự động thả bi'}
              </ClayButton>
              <ClayButton
                variant="outline"
                onClick={handleReset}
                className="w-full text-xs py-2"
              >
                Xóa làm lại
              </ClayButton>
            </div>

            {/* Sliders */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <ClaySlider
                label="Số hàng chốt định mệnh (n)"
                min={6}
                max={16}
                step={1}
                value={numRows}
                onChange={setNumRows}
              />
              <ClaySlider
                label="Xác suất rẽ phải (p)"
                min={0.1}
                max={0.9}
                step={0.05}
                value={probRight}
                onChange={setProbRight}
              />
              <ClaySlider
                label="Tốc độ thả (bi/giây)"
                min={1}
                max={25}
                step={1}
                value={dropSpeed}
                onChange={setDropSpeed}
              />
            </div>

            {/* Checkbox toggle curve */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showTheoreticalCurve}
                onChange={(e) => setShowTheoreticalCurve(e.target.checked)}
                className="rounded border-slate-400 text-sky-600 focus:ring-sky-500"
              />
              <span>Hiện đường cong Chuẩn Gauss đối sánh</span>
            </label>
          </div>
        </ClayCard>

        {/* Card 2: Moments & Convergence Comparison */}
        <ClayCard glowColor="emerald" className="p-5">
          <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Hội tụ Thống kê Thực nghiệm
          </h4>
          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Tổng số bi tích lũy (N):</span>
              <span className="font-mono font-black text-sky-600 dark:text-sky-400 text-base">
                {totalBalls}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Kỳ vọng E[X] = n.p:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {fmt(theoreticalMean, 2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Trung bình mẫu X̄:</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                {fmt(empiricalMean, 3)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Phương sai Var(X) = n.p(1-p):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {fmt(theoreticalVar, 2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Phương sai mẫu S²:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {fmt(empiricalVar, 3)}
              </span>
            </div>
          </div>
        </ClayCard>

        {/* Card 3: Mathematical Principle */}
        <ClayCard className="p-5">
          <h4 className="font-heading font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">
            Bản chất Toán học
          </h4>
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
            <p>
              Mỗi chốt là 1 phép thử Bernoulli X_i thuộc (0, 1) với P(Phải) = p.
            </p>
            <p>
              Vị trí ô chứa cuối cùng là tổng của $n$ biến độc lập:
            </p>
            <div className="py-1 text-center bg-slate-50 dark:bg-slate-800/60 rounded-lg font-mono">
              <MathView math="S_n = \sum_{i=1}^n X_i \sim B(n, p) \xrightarrow{n \to \infty} \mathcal{N}(np, np(1-p))" />
            </div>
            <p>
              Khi số bi và số hàng tăng dần, hình chuông đối xứng tự nhiên xuất hiện dù từng viên bi chỉ rẽ ngẫu nhiên trái/phải!
            </p>
          </div>
        </ClayCard>
      </div>

      {/* RIGHT COLUMN: Interactive Galton Canvas Stage */}
      <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
        <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
          {/* Header of Stage */}
          <div className="px-5 py-3.5 border-b-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide">
                Mô phỏng Cơ học Vật lý
              </span>
              <h3 className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white">
                Bàn Galton (Quincunx) — Sự Trỗi Dậy của Phân Bố Chuẩn
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
                n = {numRows} chốt | p = {probRight.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Viewport Canvas */}
          <div ref={containerRef} className="w-full h-[520px] bg-slate-50 dark:bg-slate-950 relative">
            <canvas ref={canvasRef} className="block w-full h-full select-none touch-none" />
          </div>
        </ClayCard>
      </div>
    </div>
  );
};
