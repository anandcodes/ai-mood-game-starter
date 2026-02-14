"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 80;

/**
 * BackgroundParticles — Phase 1
 * Slow drifting particles in the distance.
 * Subtle glow, wide spacing.
 */
interface BackgroundParticlesProps {
    countMultiplier?: number;
}

export default function BackgroundParticles({ countMultiplier = 1 }: BackgroundParticlesProps) {
    const meshRef = useRef<THREE.Points>(null!);
    const totalCount = Math.floor(PARTICLE_COUNT * countMultiplier);

    const particles = useMemo(() => {
        const positions = new Float32Array(totalCount * 3);
        const speeds = new Float32Array(totalCount);

        for (let i = 0; i < totalCount; i++) {
            // Spread wide: radius 8 to 20
            const r = 8 + Math.random() * 12;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            speeds[i] = 0.02 + Math.random() * 0.05;
        }
        return { positions, speeds };
    }, [totalCount]);

    const sprite = useMemo(() => {
        const s = 64;
        const c = document.createElement("canvas");
        c.width = s; c.height = s;
        const ctx = c.getContext("2d")!;
        const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        g.addColorStop(0, "rgba(255,255,255,0.8)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, s, s);
        return new THREE.CanvasTexture(c);
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        // Rotate entire field slowly
        meshRef.current.rotation.y += delta * 0.02;
        meshRef.current.rotation.x += delta * 0.01;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={totalCount} array={particles.positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                map={sprite}
                transparent
                opacity={0.3}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                color="#88aaff"
            />
        </points>
    );
}
