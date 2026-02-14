"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * PlayerAura — Phase 8
 *
 * A glowing energy field around the player (center of scene):
 *   - Grows with activity (high mood)
 *   - Shrinks with idle time (low mood)
 *   - Pulses during chaotic state
 *   - Ripple / distortion via vertex displacement
 */

interface PlayerAuraProps {
    mood: number;
}

export default function PlayerAura({ mood }: PlayerAuraProps) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

    // Smooth tracked values
    const smoothScale = useRef(1);
    const smoothOpacity = useRef(0.15);

    useFrame((state, delta) => {
        if (!meshRef.current || !materialRef.current) return;

        const time = state.clock.elapsedTime;

        // ── Target scale based on mood ───────────────────────
        // CALM → small (0.6), NEUTRAL → medium (1.0), CHAOTIC → large (1.8)
        let targetScale: number;
        if (mood > 25) {
            targetScale = THREE.MathUtils.mapLinear(mood, 25, 100, 1.2, 1.8);
        } else if (mood < -25) {
            targetScale = THREE.MathUtils.mapLinear(mood, -100, -25, 0.5, 0.8);
        } else {
            targetScale = THREE.MathUtils.mapLinear(mood, -25, 25, 0.8, 1.2);
        }

        // Chaotic pulse
        if (mood > 25) {
            const pulseSpeed = THREE.MathUtils.mapLinear(mood, 25, 100, 2, 6);
            const pulseAmp = THREE.MathUtils.mapLinear(mood, 25, 100, 0.05, 0.25);
            targetScale += Math.sin(time * pulseSpeed) * pulseAmp;
        }

        // Smooth scale
        smoothScale.current += (targetScale - smoothScale.current) * delta * 3;
        meshRef.current.scale.setScalar(smoothScale.current);

        // ── Rotation — gentle spin ───────────────────────────
        meshRef.current.rotation.y += delta * 0.2;
        meshRef.current.rotation.z += delta * 0.1;

        // ── Opacity ──────────────────────────────────────────
        const targetOpacity =
            mood > 25
                ? THREE.MathUtils.mapLinear(mood, 25, 100, 0.12, 0.25)
                : mood < -25
                    ? THREE.MathUtils.mapLinear(mood, -100, -25, 0.04, 0.08)
                    : 0.08;

        smoothOpacity.current +=
            (targetOpacity - smoothOpacity.current) * delta * 2;
        materialRef.current.opacity = smoothOpacity.current;

        // ── Color ────────────────────────────────────────────
        const targetColor =
            mood > 25
                ? new THREE.Color("#ff3300")
                : mood < -25
                    ? new THREE.Color("#2244ff")
                    : new THREE.Color("#8888ff");

        materialRef.current.color.lerp(targetColor, delta * 2);

        // ── Emissive glow intensity ──────────────────────────
        materialRef.current.emissive.lerp(targetColor, delta * 2);
        materialRef.current.emissiveIntensity =
            mood > 25
                ? THREE.MathUtils.mapLinear(mood, 25, 100, 0.3, 1.0)
                : 0.2;
    });

    return (
        <mesh ref={meshRef}>
            <icosahedronGeometry args={[1.5, 3]} />
            <meshStandardMaterial
                ref={materialRef}
                color="#8888ff"
                emissive="#8888ff"
                emissiveIntensity={0.2}
                transparent
                opacity={0.08}
                wireframe
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
}
