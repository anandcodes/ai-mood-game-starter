"use client";

import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * PostProcessing — Phase 13 (Enhanced Phase 4 Arcade)
 *
 * Visual polish & Arcade Juice:
 *   • Bloom — makes bright elements glow (intensified in power mode)
 *   • Vignette — darkened edges for cinematic focus
 *   • ChromaticAberration — glitch/distortion on high combo/chaos
 *   • Noise — subtle texture
 */

interface PostProcessingProps {
    mood: number;
    isPowerMode?: boolean;
    combo?: number;
}

export default function PostProcessing({ mood, isPowerMode = false, combo = 0 }: PostProcessingProps) {
    // ── Bloom Logic ──────────────────────────────────────────
    // Toned down bloom to prevent flashing
    const bloomIntensity = isPowerMode ? 1.0 : combo > 10 ? 0.6 : 0.3;
    const bloomThreshold = 0.4;

    const noiseOpacity = isPowerMode ? 0.05 : (mood > 40 ? 0.03 : 0.02);

    // ── Vignette Logic ───────────────────────────────────────
    const vignetteOffset = isPowerMode ? 0.1 : (mood > 25 ? 0.25 : 0.4);
    const vignetteDarkness = isPowerMode ? 0.8 : (mood > 25 ? 0.6 : 0.7);

    // ── Chromatic Aberration Logic ───────────────────────────
    // Active only during high combo or chaos
    let aberrationOffset = new THREE.Vector2(0, 0);
    if (isPowerMode) {
        aberrationOffset.set(0.003, 0.003); // Strong glitch
    } else if (combo > 8) {
        aberrationOffset.set(0.001, 0.001);
    } else if (mood > 50) {
        aberrationOffset.set(0.0015, 0.0015);
    }

    return (
        <EffectComposer>
            <Bloom
                intensity={bloomIntensity}
                luminanceThreshold={bloomThreshold}
                luminanceSmoothing={0.4}
                mipmapBlur
            />
            <ChromaticAberration
                offset={aberrationOffset} // shift red/blue channels
                radialModulation={false}
                modulationOffset={0}
            />
            {/* Noise removed for clarity */}
            <Vignette
                offset={vignetteOffset}
                darkness={vignetteDarkness}
            />
        </EffectComposer>
    );
}
