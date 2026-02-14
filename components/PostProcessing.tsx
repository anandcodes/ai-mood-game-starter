"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * PostProcessing — Phase 13
 *
 * Subtle visual polish:
 *   • Bloom — makes bright elements glow
 *   • Vignette — darkened edges for cinematic focus
 *
 * Effects intensity responds to mood:
 *   CALM    → subtle bloom, deep vignette
 *   CHAOTIC → strong bloom, lighter vignette
 */

interface PostProcessingProps {
    mood: number;
}

export default function PostProcessing({ mood }: PostProcessingProps) {
    // Bloom parameters scale with mood
    const bloomIntensity =
        mood > 25
            ? THREE.MathUtils.mapLinear(mood, 25, 100, 0.6, 1.5)
            : mood < -25
                ? THREE.MathUtils.mapLinear(mood, -100, -25, 0.2, 0.4)
                : 0.4;

    const bloomThreshold =
        mood > 25 ? 0.6 : mood < -25 ? 0.9 : 0.8;

    // Vignette
    const vignetteOffset =
        mood > 25 ? 0.25 : mood < -25 ? 0.4 : 0.3;

    const vignetteDarkness =
        mood > 25 ? 0.5 : mood < -25 ? 0.8 : 0.6;

    return (
        <EffectComposer>
            <Bloom
                intensity={bloomIntensity}
                luminanceThreshold={bloomThreshold}
                luminanceSmoothing={0.4}
                mipmapBlur
            />
            <Vignette
                offset={vignetteOffset}
                darkness={vignetteDarkness}
            />
        </EffectComposer>
    );
}
