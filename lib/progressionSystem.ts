/**
 * progressionSystem — Phase 16
 *
 * Session arc: Arrival → Engagement → Intensity → Resolution
 *
 * Tracks sessionTime and interactionDensity to determine
 * which stage the player is in. The stage influences how
 * reactive the mood engine is.
 *
 * Early session  = calm bias
 * Middle         = normal reactivity
 * Later          = heightened intensity
 * End            = stabilization / cooldown
 */

export type SessionStage =
    | "arrival"
    | "engagement"
    | "intensity"
    | "resolution";

interface ProgressionState {
    sessionStartTime: number;
    totalInteractions: number;
    stage: SessionStage;
    stageProgress: number; // 0–1 within current stage
    sessionDuration: number; // seconds elapsed
    interactionDensity: number; // interactions per second (rolling avg)
}

// Stage durations in seconds
const STAGE_DURATIONS = {
    arrival: 30,       // First 30s — gentle intro
    engagement: 90,    // 30s–120s — normal play
    intensity: 120,    // 120s–240s — peak experience
    resolution: 60,    // 240s–300s — wind down
};

const TOTAL_SESSION = Object.values(STAGE_DURATIONS).reduce((a, b) => a + b, 0);

let state: ProgressionState = {
    sessionStartTime: Date.now(),
    totalInteractions: 0,
    stage: "arrival",
    stageProgress: 0,
    sessionDuration: 0,
    interactionDensity: 0,
};

// Rolling window for density calculation
const interactionWindow: number[] = [];
const WINDOW_SIZE = 50; // track last 50 interactions

export function tickProgression(interactions: number): ProgressionState {
    state.sessionDuration = (Date.now() - state.sessionStartTime) / 1000;
    state.totalInteractions += interactions;

    // Track interaction timestamps for density calc
    const now = Date.now();
    for (let i = 0; i < interactions; i++) {
        interactionWindow.push(now);
        if (interactionWindow.length > WINDOW_SIZE) {
            interactionWindow.shift();
        }
    }

    // Calculate density (interactions per second, 10s rolling window)
    if (interactionWindow.length >= 2) {
        const windowSpan =
            (interactionWindow[interactionWindow.length - 1] -
                interactionWindow[0]) /
            1000;
        state.interactionDensity =
            windowSpan > 0 ? interactionWindow.length / Math.max(windowSpan, 1) : 0;
    }

    // Determine stage
    const t = state.sessionDuration;
    const d = STAGE_DURATIONS;

    if (t < d.arrival) {
        state.stage = "arrival";
        state.stageProgress = t / d.arrival;
    } else if (t < d.arrival + d.engagement) {
        state.stage = "engagement";
        state.stageProgress = (t - d.arrival) / d.engagement;
    } else if (t < d.arrival + d.engagement + d.intensity) {
        state.stage = "intensity";
        state.stageProgress = (t - d.arrival - d.engagement) / d.intensity;
    } else {
        state.stage = "resolution";
        const resStart = d.arrival + d.engagement + d.intensity;
        state.stageProgress = Math.min(1, (t - resStart) / d.resolution);
    }

    return { ...state };
}

/**
 * Returns a multiplier to apply to mood reactivity based on current stage.
 *   arrival    → 0.5  (damped — gentle intro)
 *   engagement → 1.0  (normal)
 *   intensity  → 1.4  (heightened)
 *   resolution → 0.6  (cooling down)
 */
export function getReactivityMultiplier(): number {
    switch (state.stage) {
        case "arrival":
            return 0.5 + state.stageProgress * 0.3; // 0.5 → 0.8
        case "engagement":
            return 0.8 + state.stageProgress * 0.2; // 0.8 → 1.0
        case "intensity":
            return 1.0 + state.stageProgress * 0.4; // 1.0 → 1.4
        case "resolution":
            return 1.4 - state.stageProgress * 0.8; // 1.4 → 0.6
        default:
            return 1.0;
    }
}

export function getProgressionState(): ProgressionState {
    return { ...state };
}

export function resetProgression() {
    state = {
        sessionStartTime: Date.now(),
        totalInteractions: 0,
        stage: "arrival",
        stageProgress: 0,
        sessionDuration: 0,
        interactionDensity: 0,
    };
    interactionWindow.length = 0;
}
