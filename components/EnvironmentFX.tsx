"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * EnvironmentFX — Phase 9
 *
 * Procedural environment variation over time:
 *   • Light flicker patterns
 *   • Environment scale breathing effect
 *   • Camera depth shifts
 *   • Ambient light intensity waves
 *
 * The world should feel organic, not static.
 */

interface EnvironmentFXProps {
    mood: number;
    isPowerMode?: boolean;
    reducedMotion?: boolean;
}

export default function EnvironmentFX({ mood, isPowerMode = false, reducedMotion = false }: EnvironmentFXProps) {
    const pointLightRef = useRef<THREE.PointLight>(null!);
    const pointLight2Ref = useRef<THREE.PointLight>(null!);
    const groupRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // ── Phase 8: Rhythmic Pulse (Audio-Sync Sim) ──────────
        // BPM based on mood
        let bpm = 100;
        if (isPowerMode) bpm = 180;
        else if (mood > 25) bpm = 140;
        else if (mood < -25) bpm = 60;

        const beatDuration = 60 / bpm;
        const beatProgress = (time % beatDuration) / beatDuration;

        // Softer pulse on the beat
        // Use a power function to make it sharp but not strobe: x^4 instead of x^10
        const pulse = reducedMotion ? 0 : Math.pow(Math.sin(beatProgress * Math.PI), 4);

        // ── Light flicker + Pulse ────────────────────────────
        if (pointLightRef.current) {
            // Organic flicker (Very subtle)
            const flicker = reducedMotion ? 0 : (
                Math.sin(time * 1.3) * 0.1 +
                Math.sin(time * 2.7) * 0.05
            );

            const baseIntensity = mood > 25 ? 1.2 : mood < -25 ? 0.4 : 0.8;

            // Add subtle pulse
            const pulseIntensity = isPowerMode ? 0.8 : 0.2;
            pointLightRef.current.intensity = baseIntensity + flicker * 0.5 + pulse * pulseIntensity;

            // Orbit
            const orbitSpeed = 0.2 + Math.abs(mood) * 0.003;
            pointLightRef.current.position.x = Math.sin(time * orbitSpeed) * 4;
            pointLightRef.current.position.y = Math.cos(time * orbitSpeed * 0.7) * 3;
            pointLightRef.current.position.z = Math.sin(time * orbitSpeed * 0.5) * 2;

            // Color shifts
            const hue = mood > 25
                ? 0.0 + Math.sin(time * 0.5) * 0.03   // red
                : mood < -25
                    ? 0.6 + Math.sin(time * 0.3) * 0.03  // blue
                    : 0.1 + Math.sin(time * 0.2) * 0.05; // orange-ish
            pointLightRef.current.color.setHSL(hue, 0.8, 0.5);
        }

        // ── Secondary light ──────────────────────────────────
        if (pointLight2Ref.current) {
            const wave = Math.sin(time * 0.8 + 1.5) * 0.2;
            pointLight2Ref.current.intensity = 0.3 + wave + pulse * 0.2;
        }

        // ── Environment breathing + Beat Thump ───────────────
        if (groupRef.current) {
            const breathSpeed = mood > 25 ? 1.2 : mood < -25 ? 0.3 : 0.6;
            const breathAmp = mood > 25 ? 0.04 : 0.02;
            const breath = 1 + Math.sin(time * breathSpeed) * breathAmp;

            // Thump on beat
            const thump = pulse * (isPowerMode ? 0.05 : 0.02);

            groupRef.current.scale.setScalar(breath + thump);
        }
    });

    return (
        <group ref={groupRef}>
            <pointLight
                ref={pointLightRef}
                position={[3, 2, 1]}
                intensity={0.8}
                distance={20}
                decay={2}
            />
            <pointLight
                ref={pointLight2Ref}
                position={[-3, -1, 4]}
                intensity={0.3}
                color="#4466aa"
                distance={20}
                decay={2}
            />
        </group>
    );
}
