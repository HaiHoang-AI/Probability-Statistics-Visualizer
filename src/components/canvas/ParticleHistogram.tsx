import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ClayButton } from '../common/ClayButton';
import { ClaySlider } from '../common/ClaySlider';
import { fmt } from '../../utils/math';
import { playParticleChime, isAudioEnabled, setAudioEnabled } from '../../utils/audio';

interface Particle {
  id: number;
  k: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  settled: boolean;
  color: string;
}

interface ParticleHistogramProps {
  dist: 'bernoulli' | 'uniform' | 'binomial' | 'geometric' | 'poisson';
  bars: Array<{ k: number; p: number }>;
  oxTicks: number[];
  yTicks: number[];
  yMax: number;
  axisOyX: number;
  axisOxY: number;
  mapKtoX: (k: number) => number;
  mapPtoY: (p: number) => number;
  barWidth: number;
  theoreticalMean: number;
  theoreticalVar: number;
}

const PARTICLE_PALETTE = ['#0284C7', '#0D9488', '#E11D48', '#D97706', '#7C3AED', '#2563EB', '#059669'];

export const ParticleHistogram: React.FC<ParticleHistogramProps> = ({
  dist,
  bars,
  oxTicks,
  yTicks,
  yMax,
  axisOyX,
  axisOxY,
  mapKtoX,
  mapPtoY,
  barWidth,
  theoreticalMean,
  theoreticalVar,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [particleSpeed, setParticleSpeed] = useState<number>(15); // Particles per second
  const [isRaining, setIsRaining] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(isAudioEnabled());

  // Statistics
  const [totalDropped, setTotalDropped] = useState<number>(0);
  const [countsMap, setCountsMap] = useState<{ [k: number]: number }>({});

  const particlesRef = useRef<Particle[]>([]);
  const countsRef = useRef<{ [k: number]: number }>({});
  const nextIdRef = useRef<number>(1);
  const isRainingRef = useRef<boolean>(false);
  isRainingRef.current = isRaining;

  // Reset when distribution or bars change
  useEffect(() => {
    particlesRef.current = [];
    countsRef.current = {};
    setCountsMap({});
    setTotalDropped(0);
  }, [dist, bars]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setAudioEnabled(next);
  };

  // Empirical stats
  const { empMean, empVar } = useMemo(() => {
    if (totalDropped === 0) return { empMean: 0, empVar: 0 };
    let sum = 0;
    let sumSq = 0;
    Object.entries(countsMap).forEach(([kStr, count]) => {
      const k = parseFloat(kStr);
      sum += k * count;
      sumSq += k * k * count;
    });
    const mean = sum / totalDropped;
    const variance = totalDropped > 1 ? (sumSq - totalDropped * mean * mean) / (totalDropped - 1) : 0;
    return { empMean: mean, empVar: variance };
  }, [countsMap, totalDropped]);

  // Sample a value k according to theoretical PMF
  const sampleK = useCallback((): number => {
    const totalP = bars.reduce((s, b) => s + b.p, 0);
    if (totalP <= 0) return bars[0]?.k ?? 0;
    const r = Math.random() * totalP;
    let cumulative = 0;
    for (const item of bars) {
      cumulative += item.p;
      if (r <= cumulative) return item.k;
    }
    return bars[bars.length - 1]?.k ?? 0;
  }, [bars]);

  // Spawn single particle
  const spawnParticle = useCallback(() => {
    const k = sampleK();
    const id = nextIdRef.current++;
    const targetX = mapKtoX(k);

    const color = PARTICLE_PALETTE[id % PARTICLE_PALETTE.length];

    particlesRef.current.push({
      id,
      k,
      x: 100 + Math.random() * 600,
      y: 20,
      vx: 0,
      vy: 2.0 + Math.random() * 1.5,
      targetX,
      targetY: axisOxY - 4,
      settled: false,
      color,
    });
  }, [sampleK, mapKtoX, axisOxY]);

  // Spawn multiple
  const spawnMultiple = useCallback((count: number) => {
    if (count > 100) {
      // Instant bulk batch calculation for massive counts
      const visualCount = 20;
      const instantCount = count - visualCount;

      const newCounts = { ...countsRef.current };
      for (let i = 0; i < instantCount; i++) {
        const k = sampleK();
        newCounts[k] = (newCounts[k] || 0) + 1;
      }
      countsRef.current = newCounts;
      let tot = 0;
      for (const k in newCounts) tot += newCounts[k];
      setCountsMap({ ...newCounts });
      setTotalDropped(tot);

      // Spawn visual burst for remaining particles
      for (let i = 0; i < visualCount; i++) {
        setTimeout(() => spawnParticle(), i * 25);
      }
    } else {
      for (let i = 0; i < count; i++) {
        setTimeout(() => spawnParticle(), i * (1000 / (particleSpeed * 3)));
      }
    }
  }, [sampleK, spawnParticle, particleSpeed]);

  const handleReset = () => {
    setIsRaining(false);
    particlesRef.current = [];
    countsRef.current = {};
    setCountsMap({});
    setTotalDropped(0);
  };

  // Main 60fps Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animId: number;
    let lastDrop = 0;

    const render = (time: number) => {
      // Rain continuous particles
      if (isRainingRef.current && time - lastDrop > 1000 / particleSpeed) {
        spawnParticle();
        lastDrop = time;
      }

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      // Coordinate space is 800 x 380 to match DiscreteRV SVG viewBox!
      const baseWidth = 800;
      const baseHeight = 380;

      const scale = rect.width / baseWidth;
      const viewHeight = Math.max(380, baseHeight * scale);

      if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(viewHeight * dpr)) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(viewHeight * dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${viewHeight}px`;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr * scale, dpr * scale);
      ctx.clearRect(0, 0, baseWidth, baseHeight);

      const isDark = document.documentElement.classList.contains('dark');

      // 1. Draw Grid & Axes
      // Ox axis
      ctx.beginPath();
      ctx.moveTo(axisOyX - 20, axisOxY);
      ctx.lineTo(760, axisOxY);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Oy axis
      ctx.beginPath();
      ctx.moveTo(axisOyX, 350);
      ctx.lineTo(axisOyX, 30);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Axis labels
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#EF4444';
      ctx.fillText('k', 770, 334);
      ctx.fillStyle = '#10B981';
      ctx.textAlign = 'center';
      ctx.fillText('P(X=k)', axisOyX, 20);

      // Oy Ticks & Horizontal Dash Lines
      ctx.textAlign = 'right';
      ctx.font = 'bold 10px monospace';
      yTicks.forEach((val) => {
        const py = mapPtoY(val);
        // Dash line
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = isDark ? '#334155' : '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.moveTo(axisOyX, py);
        ctx.lineTo(745, py);
        ctx.stroke();
        ctx.setLineDash([]);

        // Tick mark
        ctx.beginPath();
        ctx.moveTo(axisOyX - 4, py);
        ctx.lineTo(axisOyX + 4, py);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Number
        ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
        ctx.fillText(val.toFixed(1), axisOyX - 8, py + 3.5);
      });

      // Oy Origin 0.0
      ctx.fillText('0.0', axisOyX - 8, 333.5);

      // Ox Ticks and Numbers
      ctx.textAlign = 'center';
      oxTicks.forEach((kVal) => {
        const cx = mapKtoX(kVal);
        ctx.beginPath();
        ctx.moveTo(cx, 326);
        ctx.lineTo(cx, 334);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
        ctx.fillText(`${kVal}`, cx, 350);
      });

      // 2. Draw Ghost / Outline of Theoretical PMF Bars
      bars.forEach((item) => {
        const cx = mapKtoX(item.k);
        const topY = mapPtoY(item.p);
        const barH = axisOxY - topY;

        ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(cx - barWidth / 2, topY, barWidth, barH);
        ctx.setLineDash([]);

        // Probability theoretical label
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = isDark ? '#38BDF8' : '#0284C7';
        ctx.fillText(item.p.toFixed(3), cx, topY - 5);
      });

      // 3. Draw Stacked Empirical Particles (The histogram built from real drops)
      const currentCounts = countsRef.current;
      let total = 0;
      for (const k in currentCounts) {
        total += currentCounts[k];
      }

      bars.forEach((item) => {
        const count = currentCounts[item.k] || 0;
        if (count === 0) return;

        const cx = mapKtoX(item.k);
        // Empirical frequency
        const empFreq = total > 0 ? count / total : 0;
        const empY = mapPtoY(empFreq);
        const empH = axisOxY - empY;

        // Solid filled empirical bar
        const grad = ctx.createLinearGradient(0, axisOxY, 0, empY);
        grad.addColorStop(0, isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)');
        grad.addColorStop(1, isDark ? 'rgba(16, 185, 129, 0.85)' : 'rgba(16, 185, 129, 0.7)');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - barWidth / 2 + 1, empY, barWidth - 2, empH);

        // Empirical count label inside bar
        ctx.fillStyle = isDark ? '#A7F3D0' : '#065F46';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`N=${count}`, cx, Math.min(axisOxY - 8, empY + 12));
      });

      // 4. Update and Draw In-Flight Particles
      const activeParticles: Particle[] = [];
      let settledThisFrame = 0;

      const pList = particlesRef.current;
      for (let i = 0; i < pList.length; i++) {
        const p = pList[i];
        if (p.settled) continue;

        // Accelerate downwards
        p.vy += 0.35;
        p.y += p.vy;

        // Steer horizontally towards target column
        p.x += (p.targetX - p.x) * 0.15;

        // Dynamic landing: landing at top of current column or baseline
        const countAtK = currentCounts[p.k] || 0;
        const empFreq = total > 0 ? countAtK / total : 0;
        const currentTopY = mapPtoY(empFreq);
        const landingY = Math.max(70, currentTopY - 3);

        if (p.y >= landingY) {
          p.settled = true;
          countsRef.current[p.k] = (countsRef.current[p.k] || 0) + 1;
          settledThisFrame++;
          // Play subtle tone
          playParticleChime(p.k, oxTicks[0], oxTicks[oxTicks.length - 1]);
        } else {
          activeParticles.push(p);
        }

        // Draw particle bead
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      particlesRef.current = activeParticles;

      if (settledThisFrame > 0) {
        const updated = { ...countsRef.current };
        let tot = 0;
        for (const k in updated) tot += updated[k];
        setCountsMap(updated);
        setTotalDropped(tot);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [
    bars,
    oxTicks,
    yTicks,
    yMax,
    axisOyX,
    axisOxY,
    mapKtoX,
    mapPtoY,
    barWidth,
    particleSpeed,
    spawnParticle,
  ]);

  return (
    <div className="space-y-4">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <ClayButton
            variant="primary"
            onClick={() => spawnParticle()}
            className="text-xs py-1.5 px-3"
          >
            Thả 1 hạt
          </ClayButton>
          <ClayButton
            variant="secondary"
            onClick={() => spawnMultiple(20)}
            className="text-xs py-1.5 px-3"
          >
            Thả 20 hạt
          </ClayButton>
          <ClayButton
            variant="secondary"
            onClick={() => spawnMultiple(100)}
            className="text-xs py-1.5 px-3"
          >
            Thả 100 hạt
          </ClayButton>
          <ClayButton
            variant="secondary"
            onClick={() => spawnMultiple(500)}
            className="text-xs py-1.5 px-3"
          >
            Thả 500 hạt
          </ClayButton>
          <ClayButton
            variant={isRaining ? 'danger' : 'primary'}
            onClick={() => setIsRaining(!isRaining)}
            className="text-xs py-1.5 px-3"
          >
            {isRaining ? 'Dừng mưa hạt' : 'Mưa hạt liên tục'}
          </ClayButton>
          <ClayButton
            variant="outline"
            onClick={handleReset}
            className="text-xs py-1.5 px-3"
          >
            Xóa hạt
          </ClayButton>
        </div>

        <div className="flex items-center gap-4">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`px-3 py-1 rounded-xl text-xs font-heading font-bold border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer ${
              soundOn
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white dark:bg-slate-700 text-slate-500'
            }`}
          >
            {soundOn ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}
          </button>

          <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-300">
            Tổng hạt: {totalDropped}
          </span>
        </div>
      </div>

      {/* Speed Slider */}
      <div className="max-w-md">
        <ClaySlider
          label="Tốc độ mưa hạt (hạt/giây)"
          min={5}
          max={60}
          step={5}
          value={particleSpeed}
          onChange={setParticleSpeed}
        />
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden relative"
      >
        <canvas ref={canvasRef} className="block w-full h-auto select-none touch-none" />
      </div>

      {/* Real-time convergence comparison card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="text-[11px] text-slate-500 font-bold">Kỳ vọng Lý thuyết E[X]</div>
          <div className="font-mono font-black text-slate-900 dark:text-white text-sm">
            {fmt(theoreticalMean, 3)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Trung bình Mẫu X̄</div>
          <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
            {fmt(empMean, 3)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 font-bold">Phương sai Lý thuyết Var(X)</div>
          <div className="font-mono font-black text-slate-900 dark:text-white text-sm">
            {fmt(theoreticalVar, 3)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Phương sai Mẫu S²</div>
          <div className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
            {fmt(empVar, 3)}
          </div>
        </div>
      </div>
    </div>
  );
};
