/**
 * Lightweight zero-dependency Web Audio API toy synthesizer for tactile kid-friendly sound effects.
 * Safely no-ops if audio is muted or blocked by browser autoplay policy.
 */

let audioCtx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

export function isSoundEnabled() {
  return enabled;
}

function getContext(): AudioContext | null {
  if (!enabled || typeof window === 'undefined') return null;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) {
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'triangle',
  volume = 0.12,
  delay = 0,
  endFreq?: number
) {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

/** Crisp tactile switch click-ding when toggling a 0/1 bit block */
export function playSwitch(isOn: boolean) {
  if (isOn) {
    playTone(440, 0.09, 'triangle', 0.13, 0, 660);
    playTone(880, 0.12, 'sine', 0.08, 0.03);
  } else {
    playTone(520, 0.09, 'triangle', 0.11, 0, 310);
  }
}

/** Rising wooden-marimba hop sound as Pi-Bot jumps across isometric tiles */
export function playHop(stepNum = 1) {
  const pentatonic = [392, 440, 523.25, 587.33, 659.25, 783.99];
  const base = pentatonic[(Math.max(1, stepNum) - 1) % pentatonic.length];
  playTone(base * 0.85, 0.11, 'triangle', 0.13, 0, base * 1.12);
}

/** Playful cartoon thud-boing when Pi-Bot bumps into the obstacle wall */
export function playBonk() {
  playTone(210, 0.18, 'sawtooth', 0.1, 0, 82);
  playTone(150, 0.24, 'triangle', 0.14, 0.05, 65);
}

/** Soft rising pop when pushing a block onto the stack */
export function playPush() {
  playTone(340, 0.12, 'sine', 0.12, 0, 580);
  playTone(680, 0.09, 'triangle', 0.07, 0.05);
}

/** Soft falling whoosh-pop when popping a block off the stack */
export function playPop() {
  playTone(590, 0.13, 'sine', 0.12, 0, 330);
}

/** Playful gentle bump when tapping a blocked bottom item in the stack */
export function playBlocked() {
  playTone(190, 0.09, 'triangle', 0.1, 0, 150);
  playTone(170, 0.09, 'triangle', 0.09, 0.09, 130);
}

/** Subtle paper tick when stepping between lesson pages */
export function playStep() {
  playTone(520, 0.05, 'sine', 0.05, 0, 620);
}

/** Cheerful 2-note chime when answering a "先猜一猜" quiz correctly */
export function playQuizCorrect() {
  playTone(523.25, 0.12, 'triangle', 0.13, 0);
  playTone(659.25, 0.12, 'triangle', 0.13, 0.08);
  playTone(783.99, 0.22, 'sine', 0.13, 0.16);
}

/** Gentle encouraging "hmm" boop for a wrong guess */
export function playQuizTryAgain() {
  playTone(330, 0.12, 'sine', 0.09, 0, 290);
}

/** Joyful 4-note major arpeggio when completing a challenge or unlocking a badge */
export function playVictory() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, idx) => {
    playTone(n, idx === notes.length - 1 ? 0.36 : 0.14, 'triangle', 0.14, idx * 0.085);
  });
}
