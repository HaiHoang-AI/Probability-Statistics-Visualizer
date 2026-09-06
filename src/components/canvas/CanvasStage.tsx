import React, { useRef, useEffect } from 'react';

interface CanvasStageProps {
  onDraw?: (ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => void;
  className?: string;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  ariaLabel?: string;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  onDraw,
  className = '',
  canvasRef: externalRef,
  ariaLabel = 'Interactive visualization canvas',
}) => {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCanvasRef = externalRef || internalRef;

  useEffect(() => {
    const canvas = activeCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      if (width === 0 || height === 0) return;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        if (onDraw) {
          onDraw(ctx, width, height, dpr);
        }
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeCanvasRef, onDraw]);

  return (
    <div ref={containerRef} className={`relative w-full h-full min-h-[360px] ${className}`}>
      <canvas
        ref={activeCanvasRef}
        className="block w-full h-full select-none touch-none"
        aria-label={ariaLabel}
      />
    </div>
  );
};
