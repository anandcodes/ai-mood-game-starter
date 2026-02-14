/**
 * sessionPersonality — Phase 12
 *
 * Each session gets a unique random "personality" that subtly
 * affects the visual and behavioral parameters.
 *
 * Traits:
 *   sessionSeed         — random seed for deterministic variation
 *   dominantColor       — hue bias (0–1)
 *   particleBehaviorType — "orbital" | "swarm" | "cascade"
 *   chaosSensitivity    — 0.5–1.5 multiplier on chaotic reactions
 *   calmDepth           — how deep calm colors go
 *
 * Persisted in sessionStorage so refresh keeps the same personality.
 */

export interface SessionTraits {
    sessionSeed: number;
    dominantColor: number;          // hue 0–1
    particleBehaviorType: "orbital" | "swarm" | "cascade";
    chaosSensitivity: number;       // 0.5–1.5
    calmDepth: number;              // 0.3–1.0
}

const STORAGE_KEY = "sessionPersonality";
const BEHAVIOR_TYPES: SessionTraits["particleBehaviorType"][] = [
    "orbital",
    "swarm",
    "cascade",
];

function generateTraits(): SessionTraits {
    return {
        sessionSeed: Math.random(),
        dominantColor: Math.random(),
        particleBehaviorType:
            BEHAVIOR_TYPES[Math.floor(Math.random() * BEHAVIOR_TYPES.length)],
        chaosSensitivity: 0.5 + Math.random(),
        calmDepth: 0.3 + Math.random() * 0.7,
    };
}

let cachedTraits: SessionTraits | null = null;

export function getSessionTraits(): SessionTraits {
    if (cachedTraits) return cachedTraits;

    if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                cachedTraits = JSON.parse(stored) as SessionTraits;
                return cachedTraits;
            } catch {
                // Regenerate on parse failure
            }
        }
    }

    cachedTraits = generateTraits();

    if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cachedTraits));
    }

    return cachedTraits;
}

export function resetSessionPersonality(): SessionTraits {
    cachedTraits = generateTraits();
    if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cachedTraits));
    }
    return cachedTraits;
}
