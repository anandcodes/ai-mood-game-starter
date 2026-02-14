
type PlayerMetrics = {
  clicks: number;
  movement: number;
  idle: number;
};

// ── Mood Memory System (Phase 6) ─────────────────────────
// targetMood reacts instantly to player input.
// currentMood smoothly interpolates toward targetMood with inertia.

let targetMood = 0;
let currentMood = 0;
let momentum = 0;

// Tuning knobs
const MOMENTUM_FACTOR = 0.15;   // how much recent direction carries forward
const DECAY_RATE = 0.03;        // passive drift back toward 0 each tick
const SMOOTH_UP = 0.08;         // lerp speed when mood is rising (toward chaotic)
const SMOOTH_DOWN = 0.04;       // lerp speed when mood is falling (toward calm — slower)

export function updateMood(metrics: PlayerMetrics): number {
  // ── 1. Compute raw impulse from player behavior ──
  const impulse =
    metrics.clicks * 0.4 +
    metrics.movement * 0.2 -
    metrics.idle * 0.3;

  // ── 2. Apply momentum (emotional inertia) ──
  momentum = momentum * 0.85 + impulse * MOMENTUM_FACTOR;
  targetMood += impulse + momentum;

  // ── 3. Passive decay — pull target toward 0 over time ──
  //    Chaotic fades faster than calm builds
  if (targetMood > 0) {
    targetMood -= DECAY_RATE * (1 + targetMood * 0.01);
  } else if (targetMood < 0) {
    targetMood += DECAY_RATE * (1 + Math.abs(targetMood) * 0.005);
  }

  // ── 4. Clamp target ──
  targetMood = Math.max(-100, Math.min(100, targetMood));

  // ── 5. Smooth interpolation from current toward target ──
  //    Rising (toward chaotic) is faster; falling (toward calm) is slower
  const lerpSpeed = currentMood < targetMood ? SMOOTH_UP : SMOOTH_DOWN;
  currentMood += (targetMood - currentMood) * lerpSpeed;

  // Clamp current
  currentMood = Math.max(-100, Math.min(100, currentMood));

  return currentMood;
}

// Expose for session restore
export function setMoodDirect(value: number) {
  targetMood = value;
  currentMood = value;
  momentum = 0;
}

export function getCurrentMood(): number {
  return currentMood;
}

export function getTargetMood(): number {
  return targetMood;
}

