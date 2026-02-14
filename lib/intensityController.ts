/**
 * intensityController — Phase 7
 *
 * Maps score to environment intensity multipliers.
 * The world becomes richer as score increases.
 * 
 * Controls:
 * - Particle density (via multiplier prop)
 * - Glow intensity
 * - Light brightness
 * - Speed
 */

export interface IntensityState {
    particleDensity: number; // 1.0 - 2.0
    glowIntensity: number;   // 1.0 - 1.5
    lightBrightness: number; // 1.0 - 1.8
    motionSpeed: number;     // 1.0 - 1.4
}

export function getIntensity(score: number): IntensityState {
    const t = Math.min(score / 5000, 1); // Max out at 5000 points

    return {
        particleDensity: 1.0 + t * 1.0,
        glowIntensity: 1.0 + t * 0.5,
        lightBrightness: 1.0 + t * 0.8,
        motionSpeed: 1.0 + t * 0.4,
    };
}
