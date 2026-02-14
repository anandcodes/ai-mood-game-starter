"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
    tickRewardSystem,
    getRewardProgress,
    MicroReward,
} from "@/lib/rewardSystem";

/**
 * RewardRenderer — Phase A (visual component)
 *
 * Renders micro-reward events in the 3D scene.
 * Each reward type has a distinct visual:
 *   particle_bloom     → expanding ring of light
 *   aura_pulse         → central glow pulse
 *   light_ripple       → orbiting light flash
 *   particle_swirl     → rotating particle ring
 *   brightness_pulse   → ambient light flash
 *   jitter_burst       → rapid shake on aura mesh
 *   color_flash        → quick color shift on scene light
 *   particle_expansion → scale burst on particles
 *
 * All rewards follow Phase F rules: embedded in environment,
 * no score popups, no text, no blocking UI.
 */

interface RewardRendererProps {
    mood: number;
}

export default function RewardRenderer({ mood }: RewardRendererProps) {
    const ringRef = useRef<THREE.Mesh>(null!);
    const glowRef = useRef<THREE.PointLight>(null!);
    const pulseRef = useRef<THREE.Mesh>(null!);

    // Smooth state
    const ringScale = useRef(0);
    const ringOpacity = useRef(0);
    const glowIntensity = useRef(0);

    useFrame((state) => {
        const reward = tickRewardSystem(mood);
        const progress = getRewardProgress();

        // ── Ring (particle_bloom, particle_swirl, particle_expansion) ──
        if (ringRef.current) {
            const mat = ringRef.current.material as THREE.MeshBasicMaterial;

            if (
                reward &&
                (reward.type === "particle_bloom" ||
                    reward.type === "particle_swirl" ||
                    reward.type === "particle_expansion")
            ) {
                // Ease out: grow quickly, fade slowly
                const ease = 1 - Math.pow(1 - progress, 3);
                const targetScale =
                    reward.type === "particle_expansion"
                        ? 2.0 + ease * 4
                        : 1.0 + ease * 3;

                ringScale.current += (targetScale - ringScale.current) * 0.15;
                ringOpacity.current = (1 - progress) * 0.3 * reward.intensity;

                ringRef.current.scale.setScalar(ringScale.current);
                mat.opacity = ringOpacity.current;
                ringRef.current.visible = true;

                // Swirl rotation
                if (reward.type === "particle_swirl") {
                    ringRef.current.rotation.z +=
                        0.05 * reward.intensity * (1 - progress);
                }

                // Color by mood
                mat.color.set(
                    mood > 25 ? "#ff4400" : mood < -25 ? "#4488ff" : "#aabbff"
                );
            } else {
                ringScale.current *= 0.9;
                ringOpacity.current *= 0.9;
                if (ringOpacity.current < 0.001) {
                    ringRef.current.visible = false;
                }
                ringRef.current.scale.setScalar(ringScale.current);
                mat.opacity = ringOpacity.current;
            }
        }

        // ── Glow light (aura_pulse, light_ripple, brightness_pulse, color_flash) ──
        if (glowRef.current) {
            if (
                reward &&
                (reward.type === "aura_pulse" ||
                    reward.type === "light_ripple" ||
                    reward.type === "brightness_pulse" ||
                    reward.type === "color_flash")
            ) {
                // Bell curve intensity: peak in middle
                const bell = Math.sin(progress * Math.PI);
                const targetIntensity = bell * reward.intensity;

                if (reward.type === "color_flash") {
                    // Rapid hue cycling
                    const hue = (state.clock.elapsedTime * 5) % 1;
                    glowRef.current.color.setHSL(hue, 0.8, 0.5);
                    glowIntensity.current = targetIntensity * 6;
                } else if (reward.type === "brightness_pulse") {
                    glowRef.current.color.set("#ffffff");
                    glowIntensity.current = targetIntensity * 4;
                } else if (reward.type === "light_ripple") {
                    // Orbit during ripple
                    const angle = state.clock.elapsedTime * 8;
                    glowRef.current.position.x = Math.cos(angle) * 2;
                    glowRef.current.position.y = Math.sin(angle) * 2;
                    glowRef.current.color.set(
                        mood < -25 ? "#6699ff" : "#ffaa44"
                    );
                    glowIntensity.current = targetIntensity * 5;
                } else {
                    // aura_pulse
                    glowRef.current.position.set(0, 0, 0);
                    glowRef.current.color.set(
                        mood < -25 ? "#4466ff" : mood > 25 ? "#ff3300" : "#8888ff"
                    );
                    glowIntensity.current = targetIntensity * 3;
                }
            } else {
                glowIntensity.current *= 0.9;
                glowRef.current.position.set(0, 0, 0);
            }
            glowRef.current.intensity = glowIntensity.current;
        }

        // ── Pulse sphere (jitter_burst) ──
        if (pulseRef.current) {
            const mat = pulseRef.current.material as THREE.MeshBasicMaterial;

            if (reward && reward.type === "jitter_burst") {
                pulseRef.current.visible = true;
                // Random jitter position
                const jitter = (1 - progress) * reward.intensity;
                pulseRef.current.position.set(
                    (Math.random() - 0.5) * jitter * 0.5,
                    (Math.random() - 0.5) * jitter * 0.5,
                    (Math.random() - 0.5) * jitter * 0.5
                );
                pulseRef.current.scale.setScalar(0.3 + jitter * 0.5);
                mat.opacity = (1 - progress) * 0.4;
                mat.color.set("#ff6600");
            } else {
                mat.opacity *= 0.85;
                if (mat.opacity < 0.001) pulseRef.current.visible = false;
            }
        }
    });

    return (
        <>
            {/* Expanding ring for bloom/swirl/expansion rewards */}
            <mesh ref={ringRef} visible={false} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1, 0.015, 8, 64]} />
                <meshBasicMaterial
                    color="#4488ff"
                    transparent
                    opacity={0}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Point light for glow/pulse/flash/ripple rewards */}
            <pointLight
                ref={glowRef}
                position={[0, 0, 0]}
                intensity={0}
                distance={12}
                decay={2}
            />

            {/* Jitter burst sphere */}
            <mesh ref={pulseRef} visible={false}>
                <icosahedronGeometry args={[0.3, 2]} />
                <meshBasicMaterial
                    color="#ff6600"
                    transparent
                    opacity={0}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    wireframe
                />
            </mesh>
        </>
    );
}
