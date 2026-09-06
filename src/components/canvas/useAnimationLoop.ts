import { useRef, useEffect, useCallback, useState } from 'react';

interface AnimationLoopOptions {
  autoStart?: boolean;
  fps?: number; // Optional FPS throttling, default uncapped (typically 60fps)
}

export function useAnimationLoop(
  callback: (time: number, deltaTime: number) => void,
  options: AnimationLoopOptions = {}
) {
  const { autoStart = true, fps } = options;
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const minInterval = fps ? 1000 / fps : 0;

  const loop = useCallback((currentTime: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = currentTime;
    const deltaTime = currentTime - lastTimeRef.current;

    if (!fps || deltaTime >= minInterval) {
      lastTimeRef.current = currentTime - (fps ? (deltaTime % minInterval) : 0);
      callbackRef.current(currentTime, deltaTime);
    }

    animFrameIdRef.current = requestAnimationFrame(loop);
  }, [fps, minInterval]);

  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      lastTimeRef.current = 0;
    }
  }, [isRunning]);

  const stop = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    }
  }, [isRunning]);

  const toggle = useCallback(() => {
    if (isRunning) stop();
    else start();
  }, [isRunning, start, stop]);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = 0;
      animFrameIdRef.current = requestAnimationFrame(loop);
    } else if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    return () => {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isRunning, loop]);

  return { isRunning, start, stop, toggle };
}
