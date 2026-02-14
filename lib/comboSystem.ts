/**
 * comboSystem — Phase A
 *
 * Tracks consecutive interactions to build a combo multiplier.
 *
 * Behavior:
 * - Increases with rapid interaction
 * - Resets after 1.5s idle period
 * - Multiplier triggers visual/audio feedback
 */

export interface ComboState {
    currentCombo: number;
    maxCombo: number;
    multiplier: number;
    lastInteractionTime: number;
    isPowerMode: boolean; // Triggered at combo >= 10
    powerModeEndTime: number;
}

let state: ComboState = {
    currentCombo: 0,
    maxCombo: 0,
    multiplier: 1,
    lastInteractionTime: 0,
    isPowerMode: false,
    powerModeEndTime: 0,
};

const COMBO_TIMEOUT = 2500; // 2.5s (more forgiving on mobile)
const POWER_MODE_DURATION = 3000; // 3s
const POWER_THRESHOLD = 10;

/**
 * Register an interaction (click/move).
 * Returns true if combo increased.
 */
export function registerInteraction(): boolean {
    const now = Date.now();
    let increased = false;

    // Check if timeout passed (unless in power mode, maybe? No, standard arcade rules usually reset)
    // Actually, if in power mode, usually you want to extend it or keep combo going. 
    // For simplicity, strict timeout.

    if (now - state.lastInteractionTime > COMBO_TIMEOUT && state.currentCombo > 0) {
        // Reset combo if too slow
        resetCombo();
    }

    state.lastInteractionTime = now;
    state.currentCombo++;

    if (state.currentCombo > state.maxCombo) {
        state.maxCombo = state.currentCombo;
    }

    // Multiplier logic
    // x1 (1-2), x2 (3-4), x3 (5-7), x4 (8-9), x5 (10+)
    if (state.currentCombo >= 10) state.multiplier = 5;
    else if (state.currentCombo >= 8) state.multiplier = 4;
    else if (state.currentCombo >= 5) state.multiplier = 3;
    else if (state.currentCombo >= 3) state.multiplier = 2;
    else state.multiplier = 1;

    // Power Burst Trigger
    if (state.currentCombo >= POWER_THRESHOLD && !state.isPowerMode) {
        state.isPowerMode = true;
        state.powerModeEndTime = now + POWER_MODE_DURATION;
    } else if (state.isPowerMode) {
        // Extend power mode on interaction? 
        // README says "Duration: 3 seconds". Let's keep it fixed duration for now to match "Burst" feel.
        // Or maybe refresh. Let's stick to fixed duration to encourage "bursts".
    }

    increased = true;
    return increased;
}

export function tickComboSystem(): ComboState {
    const now = Date.now();

    // Check timeout
    if (state.currentCombo > 0 && now - state.lastInteractionTime > COMBO_TIMEOUT) {
        resetCombo();
    }

    // Check power mode expiry
    if (state.isPowerMode && now > state.powerModeEndTime) {
        state.isPowerMode = false;
    }

    return { ...state };
}

function resetCombo() {
    state.currentCombo = 0;
    state.multiplier = 1;
    // Don't reset maxCombo or powerMode here necessarily, 
    // but if combo drops, usually power mode ends or is independent. 
    // Let's let Power Mode run its course even if user stops clicking, as a reward.
}

export function getComboState(): ComboState {
    return { ...state };
}

export function resetComboSystem() {
    state = {
        currentCombo: 0,
        maxCombo: 0,
        multiplier: 1,
        lastInteractionTime: 0,
        isPowerMode: false,
        powerModeEndTime: 0,
    };
}
