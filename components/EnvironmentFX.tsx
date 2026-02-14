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
}

export default function EnvironmentFX({ mood }: EnvironmentFXProps) {
    const pointLightRef = useRef<THREE.PointLight>(null!);
    const pointLight2Ref = useRef<THREE.PointLight>(null!);
    const groupRef = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // ── Light flicker ────────────────────────────────────
        if (pointLightRef.current) {
            // Organic flicker using layered sine waves
            const flicker =
                Math.sin(time * 1.3) * 0.3 +
                Math.sin(time * 2.7) * 0.15 +
                Math.sin(time * 5.1) * 0.05;

            const baseIntensity = mood > 25 ? 1.5 : mood < -25 ? 0.4 : 0.8;
            pointLightRef.current.intensity = baseIntensity + flicker * 0.5;

            // Orbit slowly
            const orbitSpeed = 0.2 + Math.abs(mood) * 0.003;
            pointLightRef.current.position.x = Math.sin(time * orbitSpeed) * 4;
            pointLightRef.current.position.y = Math.cos(time * orbitSpeed * 0.7) * 3;
            pointLightRef.current.position.z = Math.sin(time * orbitSpeed * 0.5) * 2;

            // Color shifts
            const hue = mood > 25
                ? 0.0 + Math.sin(time * 0.5) * 0.03   // red range
                : mood < -25
                    ? 0.6 + Math.sin(time * 0.3) * 0.03  // blue range
                    : 0.15 + Math.sin(time * 0.2) * 0.05; // warm neutral
            pointLightRef.current.color.setHSL(hue, 0.6, 0.5);
        }

        // ── Secondary ambient light ──────────────────────────
        if (pointLight2Ref.current) {
            const wave = Math.sin(time * 0.8 + 1.5) * 0.2;
            pointLight2Ref.current.intensity = 0.3 + wave;
            pointLight2Ref.current.position.x = Math.cos(time * 0.15) * 5;
            pointLight2Ref.current.position.z = Math.sin(time * 0.15) * 5;
        }

        // ── Environment breathing (scale pulse) ──────────────
        if (groupRef.current) {
            const breathSpeed = mood > 25 ? 1.2 : mood < -25 ? 0.3 : 0.6;
            const breathAmp = mood > 25 ? 0.04 : 0.02;
            const breath = 1 + Math.sin(time * breathSpeed) * breathAmp;
            groupRef.current.scale.setScalar(breath);
        }
    });

    return (
        <group ref={groupRef}>
            {/* Roaming flicker light */}
            <pointLight
                ref={pointLightRef}
                position={[3, 2, 1]}
                intensity={0.8}
                distance={15}
                decay={2}
            />
            {/* Soft secondary fill */}
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
