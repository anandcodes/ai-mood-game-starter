"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/**
 * CameraController — Phase 2
 *
 * Drives the camera based on the current mood value:
 *   CALM    (mood < -25)  → slow, gentle floating orbit
 *   NEUTRAL (-25 … 25)    → mostly stable, very subtle drift
 *   CHAOTIC (mood > 25)   → rapid shake / tremor
 *
 * Sits inside the R3F <Canvas> and updates in useFrame — no extra render loop.
 */

interface CameraControllerProps {
    mood: number;
    isPowerMode?: boolean;
}

// Base camera position (the "home" the camera returns to)
const BASE = new THREE.Vector3(0, 0, 4);

export default function CameraController({ mood, isPowerMode = false }: CameraControllerProps) {
    const { camera } = useThree();

    // Smoothed offset so transitions aren't jarring
    const smoothOffset = useRef(new THREE.Vector3(0, 0, 0));
    const targetFov = useRef(75);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        let targetOffset: THREE.Vector3;

        // ── Visual mood logic ──
        if (mood < -25) {
            // CALM
            const floatSpeed = 0.3;
            const floatRadius = 0.35;
            targetOffset = new THREE.Vector3(
                Math.sin(time * floatSpeed) * floatRadius,
                Math.cos(time * floatSpeed * 0.7) * floatRadius * 0.6,
                Math.sin(time * floatSpeed * 0.5) * 0.15
            );
        } else if (mood > 25) {
            // CHAOTIC
            const intensity = THREE.MathUtils.mapLinear(Math.abs(mood), 25, 100, 0.02, 0.12);
            targetOffset = new THREE.Vector3(
                (Math.random() - 0.5) * intensity,
                (Math.random() - 0.5) * intensity,
                (Math.random() - 0.5) * intensity * 0.5
            );
        } else {
            // NEUTRAL
            const driftSpeed = 0.15;
            const driftRadius = 0.06;
            targetOffset = new THREE.Vector3(
                Math.sin(time * driftSpeed) * driftRadius,
                Math.cos(time * driftSpeed * 0.8) * driftRadius,
                0
            );
        }

        // ── Phase 6: Camera Depth & Parallax ──
        // Mouse parallax (Subtle)
        targetOffset.x += state.mouse.x * 0.1;
        targetOffset.y += state.mouse.y * 0.1;

        // Depth breathing (Z-axis oscillation)
        targetOffset.z += Math.sin(time * 0.5) * 0.1;

        // Smooth offset
        const lerpFactor = mood > 25 || isPowerMode ? 0.2 : 0.05;
        smoothOffset.current.lerp(targetOffset, lerpFactor);

        // Apply position
        camera.position.set(
            BASE.x + smoothOffset.current.x,
            BASE.y + smoothOffset.current.y,
            BASE.z + smoothOffset.current.z
        );

        // ── Dynamic FOV for Power Mode ──
        const desiredFov = isPowerMode ? 90 : 75;
        targetFov.current += (desiredFov - targetFov.current) * 0.1; // Smooth FOV transition

        if (camera instanceof THREE.PerspectiveCamera) {
            if (Math.abs(camera.fov - targetFov.current) > 0.1) {
                camera.fov = targetFov.current;
                camera.updateProjectionMatrix();
            }
        }

        // Always look at origin
        camera.lookAt(0, 0, 0);
    });

    // This component renders nothing visible — it only drives the camera
    return null;
}
