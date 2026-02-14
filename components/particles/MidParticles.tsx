"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 120; // Reduced density for clarity

interface MidParticlesProps {
    mood: number;
    countMultiplier?: number;
}

export default function MidParticles({ mood, countMultiplier = 1 }: MidParticlesProps) {
    const meshRef = useRef<THREE.Points>(null!);
    const totalCount = Math.floor(PARTICLE_COUNT * countMultiplier);

    // Per-particle state
    const particleData = useMemo(() => {
        const positions = new Float32Array(totalCount * 3);
        const colors = new Float32Array(totalCount * 3);
        const velocities = new Float32Array(totalCount * 3);
        const offsets = new Float32Array(totalCount);

        for (let i = 0; i < totalCount; i++) {
            const r = 2 + Math.random() * 4; // Mid range: 2 to 6
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
            velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
            offsets[i] = Math.random() * Math.PI * 2;
        }
        return { positions, colors, velocities, offsets };
    }, [totalCount]);

    // Sprite texture
    const sprite = useMemo(() => {
        const s = 64;
        const c = document.createElement("canvas");
        c.width = s; c.height = s;
        const ctx = c.getContext("2d")!;
        const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.5, "rgba(255,255,255,0.4)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, s, s);
        return new THREE.CanvasTexture(c);
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const geo = meshRef.current.geometry;
        const pos = (geo.getAttribute("position") as THREE.BufferAttribute).array as Float32Array;
        const col = (geo.getAttribute("color") as THREE.BufferAttribute).array as Float32Array;
        const { velocities, offsets } = particleData;
        const time = state.clock.elapsedTime;

        // Mood Logic
        const isCalm = mood < -25;
        const isChaotic = mood > 25;

        let tR = 1, tG = 1, tB = 1;
        if (isCalm) { tR = 0.2; tG = 0.6; tB = 1.0; } // Blue
        else if (isChaotic) { tR = 1.0; tG = 0.2; tB = 0.0; } // Red
        else { tR = 0.8; tG = 0.8; tB = 1.0; } // White/Blueish

        const speedMul = isCalm ? 0.3 : isChaotic ? 2.0 : 1.0;
        const jitter = isChaotic ? 0.05 : 0;

        for (let i = 0; i < totalCount; i++) {
            const i3 = i * 3;
            const offset = offsets[i];

            // Orbital + Organic motion
            const angle = time * 0.2 * speedMul + offset;
            const wobble = Math.sin(time * 0.5 + offset) * 0.03 * speedMul;

            velocities[i3] += (-pos[i3 + 1] * 0.001 + wobble) * delta * 60;
            velocities[i3 + 1] += (pos[i3] * 0.001 + wobble) * delta * 60;
            velocities[i3 + 2] += Math.sin(angle) * 0.001 * delta * 60;

            if (jitter > 0) {
                velocities[i3] += (Math.random() - 0.5) * jitter;
                velocities[i3 + 1] += (Math.random() - 0.5) * jitter;
                velocities[i3 + 2] += (Math.random() - 0.5) * jitter;
            }

            // Damping & Soft boundary
            const damp = isCalm ? 0.96 : 0.98;
            velocities[i3] *= damp; velocities[i3 + 1] *= damp; velocities[i3 + 2] *= damp;

            pos[i3] += velocities[i3] * delta * 60;
            pos[i3 + 1] += velocities[i3 + 1] * delta * 60;
            pos[i3 + 2] += velocities[i3 + 2] * delta * 60;

            const dist = Math.sqrt(pos[i3] ** 2 + pos[i3 + 1] ** 2 + pos[i3 + 2] ** 2);
            if (dist > 6 || dist < 2) {
                const pull = dist > 6 ? -0.02 : 0.02;
                pos[i3] += (pos[i3] / dist) * pull;
                pos[i3 + 1] += (pos[i3 + 1] / dist) * pull;
                pos[i3 + 2] += (pos[i3 + 2] / dist) * pull;
            }

            // Color lerp
            col[i3] += (tR - col[i3]) * delta * 2;
            col[i3 + 1] += (tG - col[i3 + 1]) * delta * 2;
            col[i3 + 2] += (tB - col[i3 + 2]) * delta * 2;
        }

        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={totalCount} array={particleData.positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={totalCount} array={particleData.colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                size={0.12}
                map={sprite}
                vertexColors
                transparent
                opacity={0.8}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
