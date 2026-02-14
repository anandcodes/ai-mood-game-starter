/**
 * scoreSystem — Phase B
 *
 * Tracks score accumulation.
 *
 * Sources:
 * - Base points per interaction (10)
 * - Multiplier from Combo System
 * - Bonus events (Obstacle avoid, Power Burst)
 *
 * Designed to increase continuously during active play.
 */

export interface ScoreState {
    currentScore: number;
    highScore: number;
}

let state: ScoreState = {
    currentScore: 0,
    highScore: 0,
};

const BASE_POINTS = 10;
const POWER_BONUS = 50;

export function addInteractionScore(multiplier: number, isPowerMode: boolean, resonance: number = 0) {
    // Artifact Bonus: Each 25 resonance adds 0.5x to base score
    const artifactMultiplier = 1 + (Math.floor(resonance / 25) * 0.5);

    let points = BASE_POINTS * multiplier * artifactMultiplier;
    if (isPowerMode) points += POWER_BONUS;

    state.currentScore += points;
    if (state.currentScore > state.highScore) {
        state.highScore = state.currentScore;
    }
}

export function addBonusScore(points: number) {
    state.currentScore += points;
}

export function getScoreState(): ScoreState {
    return { ...state };
}

export function resetScoreSystem() {
    state.currentScore = 0;
    // Keep high score usually? Let's reset for session-based game logic as requested in "Session Summary" context usually implies session score.
    // Actually, standard arcade often keeps high score. Let's keep it in memory but reset current.
}
