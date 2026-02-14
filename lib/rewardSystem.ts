/**
 * rewardSystem — Phase A
 *
 * Micro-reward event system that triggers small visual rewards
 * every 3–7 seconds based on mood state.
 *
 * Rewards are visual-first, not score-first.
 * Each reward includes at least one: particle response, light change,
 * audio change, or aura reaction (per Phase F rules).
 */

export type RewardType =
    // CALM rewards
    | "particle_bloom"
    | "aura_pulse"
    | "light_ripple"
    // NEUTRAL rewards
    | "particle_swirl"
    | "brightness_pulse"
    // CHAOTIC rewards
    | "jitter_burst"
    | "color_flash"
    | "particle_expansion";

export interface MicroReward {
    type: RewardType;
    intensity: number;     // 0–1
    startTime: number;     // Date.now()
    duration: number;      // ms
}

// ── State ────────────────────────────────────────────────
let activeReward: MicroReward | null = null;
let nextRewardTime = Date.now() + randomInterval();
let lastMood = 0;

// Random interval between 3–7 seconds
function randomInterval(): number {
    return 3000 + Math.random() * 4000;
}

// Pick a reward type based on mood
function pickRewardType(mood: number): RewardType {
    if (mood < -25) {
        // CALM rewards
        const pool: RewardType[] = ["particle_bloom", "aura_pulse", "light_ripple"];
        return pool[Math.floor(Math.random() * pool.length)];
    } else if (mood > 25) {
        // CHAOTIC rewards
        const pool: RewardType[] = ["jitter_burst", "color_flash", "particle_expansion"];
        return pool[Math.floor(Math.random() * pool.length)];
    } else {
        // NEUTRAL rewards
        const pool: RewardType[] = ["particle_swirl", "brightness_pulse"];
        return pool[Math.floor(Math.random() * pool.length)];
    }
}

// Reward durations by type (ms)
const REWARD_DURATIONS: Record<RewardType, number> = {
    particle_bloom: 1500,
    aura_pulse: 1200,
    light_ripple: 1000,
    particle_swirl: 1400,
    brightness_pulse: 800,
    jitter_burst: 600,
    color_flash: 500,
    particle_expansion: 1000,
};

/**
 * Tick the reward system. Call this every frame or at regular intervals.
 * Returns the currently active reward (or null).
 */
export function tickRewardSystem(mood: number): MicroReward | null {
    const now = Date.now();
    lastMood = mood;

    // Check if active reward expired
    if (activeReward && now > activeReward.startTime + activeReward.duration) {
        activeReward = null;
    }

    // Check if it's time for a new reward
    if (!activeReward && now >= nextRewardTime) {
        const type = pickRewardType(mood);
        activeReward = {
            type,
            intensity: 0.5 + Math.random() * 0.5, // 0.5–1.0
            startTime: now,
            duration: REWARD_DURATIONS[type],
        };
        nextRewardTime = now + randomInterval();
    }

    return activeReward;
}

/**
 * Get the progress (0–1) of the current reward.
 * 0 = just started, 1 = about to expire.
 */
export function getRewardProgress(): number {
    if (!activeReward) return 0;
    const elapsed = Date.now() - activeReward.startTime;
    return Math.min(1, elapsed / activeReward.duration);
}

export function getActiveReward(): MicroReward | null {
    return activeReward;
}

export function resetRewardSystem(): void {
    activeReward = null;
    nextRewardTime = Date.now() + randomInterval();
}
