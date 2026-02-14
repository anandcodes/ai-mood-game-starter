/**
 * rareEvents — Phase D
 *
 * Rare environment events checked every 5 seconds.
 * Low probability, high impact.
 *
 * CALM EVENT:    slow motion effect (scales down animation speed)
 * CHAOTIC EVENT: particle explosion (dramatic burst)
 * NEUTRAL EVENT: geometry scale transformation
 *
 * These should feel special and noticeable — the player knows
 * "something just happened."
 */

export type RareEventType =
    | "slow_motion"
    | "particle_explosion"
    | "geometry_transform";

export interface RareEvent {
    type: RareEventType;
    intensity: number;   // 0–1
    startTime: number;   // Date.now()
    duration: number;    // ms
}

// ── State ────────────────────────────────────────────────
let activeRareEvent: RareEvent | null = null;
let lastCheckTime = Date.now();
const CHECK_INTERVAL = 5000; // 5 seconds

// Base probability per check (increases with mood magnitude)
const BASE_PROBABILITY = 0.08; // 8% base chance every 5s

const EVENT_DURATIONS: Record<RareEventType, number> = {
    slow_motion: 3000,
    particle_explosion: 2000,
    geometry_transform: 2500,
};

/**
 * Tick the rare event system. Call frequently (e.g. every 100ms).
 */
export function tickRareEvents(mood: number): RareEvent | null {
    const now = Date.now();

    // Check if active event expired
    if (activeRareEvent && now > activeRareEvent.startTime + activeRareEvent.duration) {
        activeRareEvent = null;
    }

    // Only check every 5 seconds
    if (now - lastCheckTime < CHECK_INTERVAL) {
        return activeRareEvent;
    }
    lastCheckTime = now;

    // Don't trigger if one is already active
    if (activeRareEvent) return activeRareEvent;

    // Probability scales with mood magnitude
    const magnitude = Math.abs(mood);
    const probability = BASE_PROBABILITY + (magnitude / 100) * 0.07; // up to 15%

    if (Math.random() > probability) return null;

    // Pick event type based on mood
    let type: RareEventType;
    if (mood < -25) {
        type = "slow_motion";
    } else if (mood > 25) {
        type = "particle_explosion";
    } else {
        type = "geometry_transform";
    }

    activeRareEvent = {
        type,
        intensity: 0.6 + Math.random() * 0.4,
        startTime: now,
        duration: EVENT_DURATIONS[type],
    };

    return activeRareEvent;
}

/**
 * Get progress of current rare event (0–1).
 */
export function getRareEventProgress(): number {
    if (!activeRareEvent) return 0;
    const elapsed = Date.now() - activeRareEvent.startTime;
    return Math.min(1, elapsed / activeRareEvent.duration);
}

export function getActiveRareEvent(): RareEvent | null {
    return activeRareEvent;
}

export function resetRareEvents(): void {
    activeRareEvent = null;
    lastCheckTime = Date.now();
}
