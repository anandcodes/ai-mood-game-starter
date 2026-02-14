/**
 * eventSystem — Phase 10
 *
 * Rare mood-triggered events:
 *   CALM    → slow-motion effect
 *   CHAOTIC → particle explosion, lighting storm, rapid color shift
 *   NEUTRAL → geometry transformation
 *
 * Trigger probability based on mood intensity.
 */

export type MoodEventType =
    | "slow_motion"
    | "particle_explosion"
    | "lightning_storm"
    | "color_shift"
    | "geometry_morph"
    | null;

export interface MoodEvent {
    type: MoodEventType;
    intensity: number;   // 0–1
    duration: number;     // seconds
    startTime: number;    // clock time when triggered
}

// ── State ────────────────────────────────────────────────
let activeEvent: MoodEvent | null = null;
let cooldown = 0;

const MIN_COOLDOWN = 5;    // seconds between events
const EVENT_DURATION = 2.5; // seconds each event lasts

// ── Probability tables ──────────────────────────────────
function rollEvent(mood: number, time: number): MoodEvent | null {
    if (cooldown > 0) return null;

    // Higher mood magnitude = higher chance
    const magnitude = Math.abs(mood);
    if (magnitude < 30) return null; // Only trigger when mood is strong

    // Base chance per tick (called ~10x/sec) → ~3% per second at mood 50
    const chance = ((magnitude - 30) / 70) * 0.003;
    if (Math.random() > chance) return null;

    let type: MoodEventType;
    const roll = Math.random();

    if (mood > 25) {
        // Chaotic events
        if (roll < 0.4) type = "particle_explosion";
        else if (roll < 0.7) type = "lightning_storm";
        else type = "color_shift";
    } else if (mood < -25) {
        // Calm events
        type = "slow_motion";
    } else {
        type = "geometry_morph";
    }

    const event: MoodEvent = {
        type,
        intensity: magnitude / 100,
        duration: EVENT_DURATION,
        startTime: time,
    };

    activeEvent = event;
    cooldown = MIN_COOLDOWN + EVENT_DURATION;

    return event;
}

export function tickEventSystem(
    mood: number,
    time: number,
    delta: number
): MoodEvent | null {
    // Decrease cooldown
    if (cooldown > 0) {
        cooldown -= delta;
    }

    // Check if active event expired
    if (activeEvent && time - activeEvent.startTime > activeEvent.duration) {
        activeEvent = null;
    }

    // Try to trigger new event
    if (!activeEvent) {
        rollEvent(mood, time);
    }

    return activeEvent;
}

export function getActiveEvent(): MoodEvent | null {
    return activeEvent;
}
