import * as THREE from "three";

/**
 * Visual Theme — Cohesive Design System
 * 
 * Centralizes color palettes for different game states.
 * Ensures consistent aesthetic across particles, environment, and UI.
 */
export const THEME = {
    calm: {
        primary: "#3399ff",   // Bright Blue
        secondary: "#004488", // Deep Blue
        accent: "#88ccff",    // Cyan-ish
        background: "#000510",
        emissive: "#002244",
    },
    neutral: {
        primary: "#ffffff",   // White
        secondary: "#888888", // Grey
        accent: "#cccccc",    // Silver
        background: "#050505",
        emissive: "#111111",
    },
    chaotic: {
        primary: "#ff4400",   // Orange/Red
        secondary: "#882200", // Dark Red
        accent: "#ff8844",    // Bright Orange
        background: "#150500",
        emissive: "#330000",
    },
    power: {
        primary: "#ffcc00",   // Gold
        secondary: "#ff00ff", // Magenta
        accent: "#00ffff",    // Cyan
        background: "#100010",
        emissive: "#440044",
    }
};

// Reuse generic Color instances to avoid garbage collection
const c1 = new THREE.Color();
const c2 = new THREE.Color();

/**
 * interpolates between themes based on mood
 */
export function getThemeColor(mood: number, type: keyof typeof THEME["neutral"] = "primary"): string {
    if (mood > 25) return THEME.chaotic[type];
    if (mood < -25) return THEME.calm[type];
    return THEME.neutral[type];
}

/**
 * Lerps a target THREE.Color instance towards the current mood state
 */
export function lerpToThemeColor(
    current: THREE.Color,
    mood: number,
    isPowerMode: boolean,
    type: keyof typeof THEME["neutral"],
    delta: number,
    speed: number = 2
) {
    let targetHex;

    if (isPowerMode) {
        targetHex = THEME.power[type];
    } else if (mood > 25) {
        targetHex = THEME.chaotic[type];
    } else if (mood < -25) {
        targetHex = THEME.calm[type];
    } else {
        targetHex = THEME.neutral[type];
    }

    c1.set(targetHex);
    current.lerp(c1, delta * speed);
}
