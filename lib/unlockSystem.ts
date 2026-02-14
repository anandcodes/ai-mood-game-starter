/**
 * unlockSystem — Phase C
 *
 * Session-based unlockable visuals triggered by resonance thresholds.
 *
 * Thresholds:
 *   Resonance 20 → new particle color palette
 *   Resonance 40 → particle size variation
 *   Resonance 60 → secondary particle layer
 *   Resonance 80 → glow intensity boost
 *
 * Unlocks apply only within the current session.
 * Persisted in sessionStorage so page refresh keeps unlocks.
 */

export interface UnlockState {
    particleColorPalette: boolean;  // Resonance 20
    particleSizeVariation: boolean; // Resonance 40
    secondaryParticles: boolean;    // Resonance 60
    glowBoost: boolean;             // Resonance 80
    highestResonance: number;       // peak resonance reached
}

const STORAGE_KEY = "unlockState";

let state: UnlockState = {
    particleColorPalette: false,
    particleSizeVariation: false,
    secondaryParticles: false,
    glowBoost: false,
    highestResonance: 0,
};

// ── Restore from session ─────────────────────────────────
function restore(): void {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            state = { ...state, ...JSON.parse(stored) };
        } catch {
            // ignore
        }
    }
}

function persist(): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Initialize on load
restore();

/**
 * Update unlocks based on current resonance.
 * Call this whenever resonance changes.
 * Returns the current unlock state.
 */
export function updateUnlocks(resonance: number): UnlockState {
    if (resonance > state.highestResonance) {
        state.highestResonance = resonance;
    }

    // Unlocks are permanent within the session (once unlocked, stay unlocked)
    if (resonance >= 20) state.particleColorPalette = true;
    if (resonance >= 40) state.particleSizeVariation = true;
    if (resonance >= 60) state.secondaryParticles = true;
    if (resonance >= 80) state.glowBoost = true;

    persist();
    return { ...state };
}

export function getUnlockState(): UnlockState {
    return { ...state };
}

/**
 * How many unlocks are active (0–4)
 */
export function getUnlockCount(): number {
    let count = 0;
    if (state.particleColorPalette) count++;
    if (state.particleSizeVariation) count++;
    if (state.secondaryParticles) count++;
    if (state.glowBoost) count++;
    return count;
}

export function resetUnlocks(): void {
    state = {
        particleColorPalette: false,
        particleSizeVariation: false,
        secondaryParticles: false,
        glowBoost: false,
        highestResonance: 0,
    };
    persist();
}
