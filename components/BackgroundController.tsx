"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/**
 * BackgroundController — Phase 3
 *
 * Smoothly transitions the scene background color based on mood:
 *   CALM    (mood < -25)  → deep navy   #0a1f44
 *   NEUTRAL (-25 … 25)    → dark grey   #111111
 *   CHAOTIC (mood > 25)   → dark red    #3a0000
 *
 * Uses Color.lerp each frame for smooth, organic transitions.
 */

interface BackgroundControllerProps {
    mood: number;
}

const CALM_BG = new THREE.Color("#0a1f44");
const NEUTRAL_BG = new THREE.Color("#111111");
const CHAOTIC_BG = new THREE.Color("#3a0000");

export default function BackgroundController({
    mood,
}: BackgroundControllerProps) {
    const { scene } = useThree();
    const currentColor = useRef(new THREE.Color("#111111"));

    // Ensure the scene has a Color background to start with
    if (!(scene.background instanceof THREE.Color)) {
        scene.background = new THREE.Color("#111111");
    }

    useFrame((_state, delta) => {
        // Determine target color based on mood
        let target: THREE.Color;

        if (mood < -25) {
            // CALM — blend from neutral towards calm based on intensity
            const t = THREE.MathUtils.mapLinear(mood, -25, -100, 0, 1);
            target = NEUTRAL_BG.clone().lerp(CALM_BG, THREE.MathUtils.clamp(t, 0, 1));
        } else if (mood > 25) {
            // CHAOTIC — blend from neutral towards chaotic based on intensity
            const t = THREE.MathUtils.mapLinear(mood, 25, 100, 0, 1);
            target = NEUTRAL_BG.clone().lerp(CHAOTIC_BG, THREE.MathUtils.clamp(t, 0, 1));
        } else {
            target = NEUTRAL_BG;
        }

        // Smooth interpolation — ~2 seconds to fully transition
        const lerpSpeed = delta * 1.5;
        currentColor.current.lerp(target, lerpSpeed);

        // Apply to scene
        (scene.background as THREE.Color).copy(currentColor.current);
    });

    return null;
}
