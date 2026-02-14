"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 200;

/**
 * Mood ranges:
 *   -100 … -25  → CALM   (slow, blue, wide spacing)
 *    -25 …  25  → NEUTRAL (balanced, white)
 *     25 … 100  → CHAOTIC (fast, red/orange, jitter)
 */

// ── helpers ──────────────────────────────────────────────
function moodState(mood: number): "calm" | "neutral" | "chaotic" {
    if (mood < -25) return "calm";
    if (mood > 25) return "chaotic";
    return "neutral";
}

const CALM_COLOR = new THREE.Color("#3399ff");
const NEUTRAL_COLOR = new THREE.Color("#ffffff");
const CHAOTIC_COLOR = new THREE.Color("#ff4400");

function targetColor(state: "calm" | "neutral" | "chaotic"): THREE.Color {
    if (state === "calm") return CALM_COLOR;
    if (state === "chaotic") return CHAOTIC_COLOR;
    return NEUTRAL_COLOR;
}

// ── component ────────────────────────────────────────────
interface ParticleFieldProps {
    mood: number;
}

export default function ParticleField({ mood }: ParticleFieldProps) {
    const meshRef = useRef<THREE.Points>(null!);

    // Store per-particle data that persists across frames
    const particleData = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const velocities = new Float32Array(PARTICLE_COUNT * 3);
        const offsets = new Float32Array(PARTICLE_COUNT); // phase offset for organic motion

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;

            // Spread particles in a sphere around origin
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 1.5 + Math.random() * 3; // radius 1.5 – 4.5

            positions[i3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = r * Math.cos(phi);

            // Start white
            colors[i3] = 1;
            colors[i3 + 1] = 1;
            colors[i3 + 2] = 1;

            // Random slow initial velocity
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

            offsets[i] = Math.random() * Math.PI * 2;
        }

        return { positions, colors, velocities, offsets };
    }, []);

    // Create a circular sprite texture via canvas (runs once)
    const sprite = useMemo(() => {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const gradient = ctx.createRadialGradient(
            size / 2,
            size / 2,
            0,
            size / 2,
            size / 2,
            size / 2
        );
        gradient.addColorStop(0, "rgba(255,255,255,1)");
        gradient.addColorStop(0.4, "rgba(255,255,255,0.6)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        const tex = new THREE.CanvasTexture(canvas);
        return tex;
    }, []);

    // ── per-frame animation ────────────────────────────────
    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const geo = meshRef.current.geometry;
        const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
        const colAttr = geo.getAttribute("color") as THREE.BufferAttribute;
        const pos = posAttr.array as Float32Array;
        const col = colAttr.array as Float32Array;
        const { velocities, offsets } = particleData;

        const mState = moodState(mood);
        const tColor = targetColor(mState);

        // Speed & jitter multipliers per mood
        const speedMul = mState === "calm" ? 0.3 : mState === "chaotic" ? 2.5 : 1;
        const jitter = mState === "chaotic" ? 0.06 : 0;
        const time = state.clock.elapsedTime;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            const offset = offsets[i];

            // Organic orbital motion
            const angle = time * 0.15 * speedMul + offset;
            const wobble = Math.sin(time * 0.4 + offset) * 0.02 * speedMul;

            // Update velocity with gentle orbital pull + wobble
            velocities[i3] += (-pos[i3 + 1] * 0.001 + wobble) * speedMul * delta * 60;
            velocities[i3 + 1] += (pos[i3] * 0.001 + wobble) * speedMul * delta * 60;
            velocities[i3 + 2] +=
                Math.sin(angle) * 0.001 * speedMul * delta * 60;

            // Chaotic jitter
            if (jitter > 0) {
                velocities[i3] += (Math.random() - 0.5) * jitter;
                velocities[i3 + 1] += (Math.random() - 0.5) * jitter;
                velocities[i3 + 2] += (Math.random() - 0.5) * jitter;
            }

            // Damping (stronger when calm)
            const damp = mState === "calm" ? 0.96 : mState === "chaotic" ? 0.995 : 0.98;
            velocities[i3] *= damp;
            velocities[i3 + 1] *= damp;
            velocities[i3 + 2] *= damp;

            // Apply velocity
            pos[i3] += velocities[i3] * delta * 60;
            pos[i3 + 1] += velocities[i3 + 1] * delta * 60;
            pos[i3 + 2] += velocities[i3 + 2] * delta * 60;

            // Soft boundary — pull back towards a shell between r=1 and r=5
            const dist = Math.sqrt(
                pos[i3] ** 2 + pos[i3 + 1] ** 2 + pos[i3 + 2] ** 2
            );
            if (dist > 5 || dist < 1) {
                const pull = dist > 5 ? -0.02 : 0.02;
                pos[i3] += (pos[i3] / dist) * pull;
                pos[i3 + 1] += (pos[i3 + 1] / dist) * pull;
                pos[i3 + 2] += (pos[i3 + 2] / dist) * pull;
            }

            // Smoothly interpolate color towards target
            const lerpSpeed = delta * 2;
            col[i3] = THREE.MathUtils.lerp(col[i3], tColor.r, lerpSpeed);
            col[i3 + 1] = THREE.MathUtils.lerp(col[i3 + 1], tColor.g, lerpSpeed);
            col[i3 + 2] = THREE.MathUtils.lerp(col[i3 + 2], tColor.b, lerpSpeed);
        }

        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={PARTICLE_COUNT}
                    array={particleData.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={PARTICLE_COUNT}
                    array={particleData.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.12}
                map={sprite}
                vertexColors
                transparent
                opacity={0.85}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    );
}
