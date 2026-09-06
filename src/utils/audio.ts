// Web Audio API Sonification Utility
// Provides sound feedback for probability simulations without external libraries

let audioCtx: AudioContext | null = null;
let soundEnabled: boolean = false;

// Try reading initial preference
try {
  const saved = localStorage.getItem('xstk_sound_enabled');
  soundEnabled = saved === 'true';
} catch {
  soundEnabled = false;
}

export function isAudioEnabled(): boolean {
  return soundEnabled;
}

export function setAudioEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  try {
    localStorage.setItem('xstk_sound_enabled', enabled ? 'true' : 'false');
  } catch {
    // Ignore localStorage errors
  }
  if (enabled && !audioCtx) {
    initAudioContext();
  }
}

function initAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a simple sine tone with attack and decay to prevent audible clicks.
 */
export function playTone(freq: number, durationMs = 60, volume = 0.15, type: OscillatorType = 'sine'): void {
  if (!soundEnabled) return;
  const ctx = initAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(50, Math.min(freq, 4000)), now);

    // Envelope
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.min(volume, 0.5), now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.02);
  } catch {
    // Gracefully handle audio errors
  }
}

/**
 * Short wooden peg hit sound for Galton Board
 */
export function playPegHit(pitchFactor = 1.0): void {
  if (!soundEnabled) return;
  const baseFreq = 800 * pitchFactor;
  playTone(baseFreq + (Math.random() - 0.5) * 100, 25, 0.08, 'triangle');
}

/**
 * Bin landing sound (subtle lower thud)
 */
export function playBinLanding(binIdx = 0, totalBins = 10): void {
  if (!soundEnabled) return;
  const freq = 220 + (binIdx / Math.max(1, totalBins)) * 330;
  playTone(freq, 40, 0.12, 'sine');
}

/**
 * Particle drop chime
 */
export function playParticleChime(value: number, min: number, max: number): void {
  if (!soundEnabled) return;
  const norm = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0.5;
  const freq = 300 + norm * 900; // 300Hz to 1200Hz
  playTone(freq, 35, 0.1, 'sine');
}

/**
 * Maps numeric value to audible frequency scale (pentatonic-like feel)
 */
export function dataToFrequency(value: number, min: number, max: number): number {
  const norm = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0.5;
  return 220 + norm * 880; // A3 (220Hz) to A5 (1100Hz)
}
