import React, { useRef, useEffect, useState, useMemo } from 'react';
import { fmt } from '../../utils/math';

interface DensityHeatmapProps {
  rho: number; // Correlation coefficient [-0.95, 0.95]
  width?: number;
  height?: number;
}

export const DensityHeatmap: React.FC<DensityHeatmapProps> = ({
  rho,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverData, setHoverData] = useState<{ x: number; y: number; density: number } | null>(null);

  // Pre-generate 256-step color LUT (Look-Up Table) for thermal color mapping
  const colorLUT = useMemo(() => {
    const lut: Array<[number, number, number]> = [];
    for (let i = 0; i < 256; i++) {
      const t = i / 255;
      // Palette: Navy -> Cyan -> Green -> Yellow -> Orange -> Crimson Red
      let r = 0, g = 0, b = 0;
      if (t < 0.2) {
        // Deep navy to cyan
        const f = t / 0.2;
        r = Math.floor(15 * (1 - f) + 6 * f);
        g = Math.floor(23 * (1 - f) + 182 * f);
        b = Math.floor(42 * (1 - f) + 212 * f);
      } else if (t < 0.45) {
        // Cyan to Emerald
        const f = (t - 0.2) / 0.25;
        r = Math.floor(6 * (1 - f) + 16 * f);
        g = Math.floor(182 * (1 - f) + 185 * f);
        b = Math.floor(212 * (1 - f) + 129 * f);
      } else if (t < 0.7) {
        // Emerald to Yellow/Amber
        const f = (t - 0.45) / 0.25;
        r = Math.floor(16 * (1 - f) + 245 * f);
        g = Math.floor(185 * (1 - f) + 158 * f);
        b = Math.floor(129 * (1 - f) + 11 * f);
      } else {
        // Amber to Intense Crimson
        const f = (t - 0.7) / 0.3;
        r = Math.floor(245 * (1 - f) + 225 * f);
        g = Math.floor(158 * (1 - f) + 29 * f);
        b = Math.floor(11 * (1 - f) + 72 * f);
      }
      lut.push([r, g, b]);
    }
    return lut;
  }, []);

  // Compute 2D Gaussian density function
  const calcDensity = (x: number, y: number, r: number) => {
    const clampedR = Math.max(-0.98, Math.min(0.98, r));
    const denom = 2 * Math.PI * Math.sqrt(1 - clampedR * clampedR);
    const exponent = -(x * x - 2 * clampedR * x * y + y * y) / (2 * (1 - clampedR * clampedR));
    return (1 / denom) * Math.exp(exponent);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(rect.width);
    const h = Math.max(380, Math.floor(rect.height));

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Compute grid at moderate resolution for 60fps performance
    const gridRes = 140; // 140x140 calculation grid
    const offCanvas = document.createElement('canvas');
    offCanvas.width = gridRes;
    offCanvas.height = gridRes;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) {
      ctx.restore();
      return;
    }

    const imgData = offCtx.createImageData(gridRes, gridRes);
    const data = imgData.data;

    const range = 3.2; // Domain [-3.2, 3.2] in X and Y
    const maxDensity = calcDensity(0, 0, rho);

    for (let py = 0; py < gridRes; py++) {
      const y = range - (py / (gridRes - 1)) * 2 * range;
      for (let px = 0; px < gridRes; px++) {
        const x = -range + (px / (gridRes - 1)) * 2 * range;
        const dens = calcDensity(x, y, rho);
        const norm = Math.min(1.0, Math.max(0, dens / maxDensity));
        const lutIdx = Math.floor(norm * 255);
        const [cr, cg, cb] = colorLUT[lutIdx] || [0, 0, 0];

        const pIdx = (py * gridRes + px) * 4;
        data[pIdx] = cr;
        data[pIdx + 1] = cg;
        data[pIdx + 2] = cb;
        data[pIdx + 3] = Math.floor(35 + norm * 220); // semi-transparent at low density
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // Draw smoothed heatmap to main canvas
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(offCanvas, 0, 0, w, h);

    const isDark = document.documentElement.classList.contains('dark');

    // Draw Coordinate Axes Over Heatmap
    const originX = w / 2;
    const originY = h / 2;

    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(15, 23, 42, 0.4)';
    ctx.lineWidth = 1.5;

    // Ox
    ctx.beginPath();
    ctx.moveTo(30, originY);
    ctx.lineTo(w - 30, originY);
    ctx.stroke();

    // Oy
    ctx.beginPath();
    ctx.moveTo(originX, 30);
    ctx.lineTo(originX, h - 30);
    ctx.stroke();

    // Axes Arrows & Labels
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
    ctx.fillText('X', w - 24, originY + 4);
    ctx.fillText('Y', originX - 4, 22);

    // Draw Elliptical Contour Lines of Constant Mahalanobis Distance
    // x^2 - 2*rho*x*y + y^2 = c^2 * (1 - rho^2)
    const contours = [1.0, 2.0];
    contours.forEach((c) => {
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      // Parameterized ellipse
      const numSteps = 120;
      for (let i = 0; i <= numSteps; i++) {
        const theta = (i / numSteps) * 2 * Math.PI;
        // Transform standard circle using Cholesky factor of Sigma:
        // [x] = [1,           0      ] [cos(theta)] * c
        // [y]   [rho, sqrt(1-rho^2)] [sin(theta)]
        const u = Math.cos(theta) * c;
        const v = Math.sin(theta) * c;
        const elX = u;
        const elY = rho * u + Math.sqrt(Math.max(0, 1 - rho * rho)) * v;

        const screenX = originX + (elX / range) * (w / 2 - 40);
        const screenY = originY - (elY / range) * (h / 2 - 40);

        if (i === 0) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw Heatmap Colorbar Legend on Top Right
    const barW = 12;
    const barH = 120;
    const barX = w - 35;
    const barY = 40;

    const grad = ctx.createLinearGradient(0, barY + barH, 0, barY);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.3, '#0D9488');
    grad.addColorStop(0.7, '#F59E0B');
    grad.addColorStop(1, '#E11D48');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = isDark ? '#64748B' : '#94A3B8';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = isDark ? '#E2E8F0' : '#1E293B';
    ctx.textAlign = 'right';
    ctx.fillText('Cao', barX - 4, barY + 8);
    ctx.fillText('Thấp', barX - 4, barY + barH);

    ctx.restore();
  }, [rho, colorLUT]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const range = 3.2;
    const x = -range + (px / rect.width) * 2 * range;
    const y = range - (py / rect.height) * 2 * range;
    const density = calcDensity(x, y, rho);

    setHoverData({ x, y, density });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="w-full h-[400px] relative rounded-2xl overflow-hidden border-2 border-slate-900 dark:border-slate-700 bg-slate-950"
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="block w-full h-full cursor-crosshair"
        />

        {hoverData && (
          <div className="absolute top-3 left-3 bg-slate-900/90 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs font-mono shadow-lg pointer-events-none backdrop-blur-sm">
            <div>(X, Y) = ({hoverData.x.toFixed(2)}, {hoverData.y.toFixed(2)})</div>
            <div className="text-amber-400 font-bold">f(X,Y) = {hoverData.density.toFixed(4)}</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Đường nét đứt trắng: Elip đẳng xác suất (Contour $1\sigma$ và $2\sigma$)</span>
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
          Đỉnh cực đại tại (0, 0): {fmt(calcDensity(0, 0, rho), 4)}
        </span>
      </div>
    </div>
  );
};
