"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { tickEventSystem, MoodEvent } from "@/lib/eventSystem";

/**
 * MoodEvents — Phase 10 (visual renderer)
 *
 * Renders rare mood-triggered events in the 3D scene:
 *   • slow_motion       → time scale slowdown effect (stretch scene)
 *   • particle_explosion → burst of bright particles outward
 *   • lightning_storm    → rapid flash lights
 *   • color_shift        → rapid hue cycling on ambient light
 *   • geometry_morph     → main object scale pulse
 */

interface MoodEventsProps {
    mood: number;
}

export default function MoodEvents({ mood }: MoodEventsProps) {
    const flashLightRef = useRef<THREE.PointLight>(null!);
    const burstGroupRef = useRef<THREE.Group>(null!);
    const { scene } = useThree();

    // Burst particles (pre-allocated)
    const burstPositions = useRef<Float32Array>(new Float32Array(60 * 3));
    const burstVelocities = useRef<Float32Array>(new Float32Array(60 * 3));
    const burstActive = useRef(false);

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        // Tick the event system
        const event = tickEventSystem(mood, time, delta);

        // ── Lightning storm flash ────────────────────────────
        if (flashLightRef.current) {
            if (event?.type === "lightning_storm") {
                const progress = (time - event.startTime) / event.duration;
                // Rapid flashing
                const flash =
                    Math.sin(time * 30) > 0.3
                        ? 8 * event.intensity * (1 - progress)
                        : 0;
                flashLightRef.current.intensity = flash;
                flashLightRef.current.color.setHSL(0.1, 0.3, 0.9);
            } else if (event?.type === "color_shift") {
                const progress = (time - event.startTime) / event.duration;
                // Rapid hue cycle
                const hue = (time * 2) % 1;
                flashLightRef.current.color.setHSL(hue, 0.8, 0.5);
                flashLightRef.current.intensity = 3 * (1 - progress);
            } else {
                flashLightRef.current.intensity = Math.max(
                    0,
                    flashLightRef.current.intensity - delta * 5
                );
            }
        }

        // ── Particle explosion burst ─────────────────────────
        if (burstGroupRef.current) {
            const points = burstGroupRef.current.children[0] as THREE.Points;
            if (points) {
                if (
                    event?.type === "particle_explosion" &&
                    !burstActive.current
                ) {
                    // Initialize burst
                    burstActive.current = true;
                    const pos = burstPositions.current;
                    const vel = burstVelocities.current;
                    for (let i = 0; i < 60; i++) {
                        const i3 = i * 3;
                        pos[i3] = 0;
                        pos[i3 + 1] = 0;
                        pos[i3 + 2] = 0;
                        const theta = Math.random() * Math.PI * 2;
                        const phi = Math.acos(2 * Math.random() - 1);
                        const speed = 3 + Math.random() * 5;
                        vel[i3] = Math.sin(phi) * Math.cos(theta) * speed;
                        vel[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
                        vel[i3 + 2] = Math.cos(phi) * speed;
                    }
                }

                if (burstActive.current) {
                    const pos = burstPositions.current;
                    const vel = burstVelocities.current;
                    let anyVisible = false;

                    for (let i = 0; i < 60; i++) {
                        const i3 = i * 3;
                        pos[i3] += vel[i3] * delta;
                        pos[i3 + 1] += vel[i3 + 1] * delta;
                        pos[i3 + 2] += vel[i3 + 2] * delta;
                        // Damping
                        vel[i3] *= 0.97;
                        vel[i3 + 1] *= 0.97;
                        vel[i3 + 2] *= 0.97;
                        const dist = Math.sqrt(
                            pos[i3] ** 2 + pos[i3 + 1] ** 2 + pos[i3 + 2] ** 2
                        );
                        if (dist < 15) anyVisible = true;
                    }

                    const attr = points.geometry.getAttribute(
                        "position"
                    ) as THREE.BufferAttribute;
                    attr.needsUpdate = true;
                    points.visible = true;

                    if (!anyVisible || !event || event.type !== "particle_explosion") {
                        burstActive.current = false;
                        points.visible = false;
                    }
                } else {
                    points.visible = false;
                }
            }
        }
    });

    return (
        <>
            {/* Flash light for lightning/color events */}
            <pointLight
                ref={flashLightRef}
                position={[0, 0, 0]}
                intensity={0}
                distance={30}
                decay={1}
            />

            {/* Burst particles */}
            <group ref={burstGroupRef}>
                <points visible={false}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={60}
                            array={burstPositions.current}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <pointsMaterial
                        size={0.15}
                        color="#ffaa00"
                        transparent
                        opacity={0.9}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                    />
                </points>
            </group>
        </>
    );
}
