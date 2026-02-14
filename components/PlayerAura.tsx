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
    isPowerMode?: boolean;
}

export default function PlayerAura({ mood, isPowerMode = false }: PlayerAuraProps) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

    // Smooth tracked values
    const smoothScale = useRef(1);
    const smoothOpacity = useRef(0.15);

    useFrame((state, delta) => {
        if (!meshRef.current || !materialRef.current) return;

        const time = state.clock.elapsedTime;

        // ── Target scale based on mood & power mode ──────────
        let targetScale: number;
        if (isPowerMode) {
            targetScale = 2.5; // Huge expansion
        } else if (mood > 25) {
            targetScale = THREE.MathUtils.mapLinear(mood, 25, 100, 1.2, 1.8);
        } else if (mood < -25) {
            targetScale = THREE.MathUtils.mapLinear(mood, -100, -25, 0.5, 0.8);
        } else {
            targetScale = THREE.MathUtils.mapLinear(mood, -25, 25, 0.8, 1.2);
        }

        // Pulse logic
        if (isPowerMode) {
            // Intense, fast pulse
            targetScale += Math.sin(time * 10) * 0.3;
        } else if (mood > 25) {
            const pulseSpeed = THREE.MathUtils.mapLinear(mood, 25, 100, 2, 6);
            const pulseAmp = THREE.MathUtils.mapLinear(mood, 25, 100, 0.05, 0.25);
            targetScale += Math.sin(time * pulseSpeed) * pulseAmp;
        }

        // Smooth scale
        // Faster interpolation for power mode
        const lerpSpeed = isPowerMode ? 5 : 3;
        smoothScale.current += (targetScale - smoothScale.current) * delta * lerpSpeed;
        meshRef.current.scale.setScalar(smoothScale.current);

        // ── Rotation — gentle spin — faster in power mode ────
        meshRef.current.rotation.y += delta * (isPowerMode ? 0.8 : 0.2);
        meshRef.current.rotation.z += delta * (isPowerMode ? 0.4 : 0.1);

        // ── Opacity ──────────────────────────────────────────
        let targetOpacity = 0.08;
        if (isPowerMode) targetOpacity = 0.4;
        else if (mood > 25) targetOpacity = THREE.MathUtils.mapLinear(mood, 25, 100, 0.12, 0.25);
        else if (mood < -25) targetOpacity = THREE.MathUtils.mapLinear(mood, -100, -25, 0.04, 0.08);

        smoothOpacity.current += (targetOpacity - smoothOpacity.current) * delta * 2;
        materialRef.current.opacity = smoothOpacity.current;

        // ── Color ────────────────────────────────────────────
        let targetColor = new THREE.Color("#8888ff");
        if (isPowerMode) targetColor.set("#ffcc00"); // Gold
        else if (mood > 25) targetColor.set("#ff3300");
        else if (mood < -25) targetColor.set("#2244ff");

        materialRef.current.color.lerp(targetColor, delta * 2);

        // ── Emissive glow intensity ──────────────────────────
        materialRef.current.emissive.lerp(targetColor, delta * 2);

        let targetEmissive = 0.2;
        if (isPowerMode) targetEmissive = 2.0; // Blinding glow
        else if (mood > 25) targetEmissive = THREE.MathUtils.mapLinear(mood, 25, 100, 0.3, 1.0);

        materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
            materialRef.current.emissiveIntensity,
            targetEmissive,
            delta * 2
        );
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
