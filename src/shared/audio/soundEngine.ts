/**
 * Web Audio API sound engine for DOC-W
 * No external dependencies — uses browser-native AudioContext
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15
): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Silent fail — sound is not critical
  }
}

/** Victory: ascending arpeggio (C-E-G-C) */
export function playWinSound(): void {
  getAudioContext(); // ensure context is ready
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, 'sine', 0.12), i * 80);
  });
}

/** Defeat: descending low tone */
export function playLoseSound(): void {
  playTone(300, 0.4, 'sawtooth', 0.08);
  setTimeout(() => playTone(200, 0.5, 'sawtooth', 0.08), 150);
}

/** Achievement unlock: high ping */
export function playAchievementSound(): void {
  getAudioContext(); // ensure context is ready
  [0, 1, 2].forEach((i) => {
    setTimeout(() => playTone(1200 + i * 300, 0.15, 'sine', 0.1), i * 60);
  });
}

/** Click / UI feedback: subtle blip */
export function playClickSound(): void {
  playTone(800, 0.05, 'sine', 0.05);
}

/** Streak milestone: celebratory chord */
export function playStreakSound(): void {
  getAudioContext();
  [523.25, 659.25, 783.99].forEach((freq) => {
    playTone(freq, 0.4, 'sine', 0.08);
  });
}
