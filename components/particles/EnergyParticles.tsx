"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 100;

interface EnergyParticlesProps {
    combo: number;
    isPowerMode?: boolean;
    countMultiplier?: number;
}

/**
 * EnergyParticles — Phase 1
 * Fast neon particles that appear during combos.
 */
export default function EnergyParticles({ combo, isPowerMode = false, countMultiplier = 1 }: EnergyParticlesProps) {
    const meshRef = useRef<THREE.Points>(null!);
    const materialRef = useRef<THREE.PointsMaterial>(null!);

    const totalCount = Math.floor(PARTICLE_COUNT * countMultiplier);

    const particles = useMemo(() => {
        const positions = new Float32Array(totalCount * 3);
        const velocities = new Float32Array(totalCount * 3);

        for (let i = 0; i < totalCount; i++) {
            // Scattered distribution instead of center cluster
            positions[i * 3] = (Math.random() - 0.5) * 20; // x: -10 to 10
            positions[i * 3 + 1] = (Math.random() - 0.5) * 12; // y: -6 to 6
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z: -5 to 5

            // Gentle drift instead of explosion
            velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
        }
        return { positions, velocities };
    }, [totalCount]);

    const sprite = useMemo(() => {
        const s = 64;
        const c = document.createElement("canvas");
        c.width = s; c.height = s;
        const ctx = c.getContext("2d")!;
        const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.2, "rgba(255,200,0,0.8)");
        g.addColorStop(1, "rgba(255,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, s, s);
        return new THREE.CanvasTexture(c);
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current || !materialRef.current) return;
        const geo = meshRef.current.geometry;
        const pos = (geo.getAttribute("position") as THREE.BufferAttribute).array as Float32Array;
        const { velocities } = particles;

        // Visibility logic
        const isActive = combo > 0 || isPowerMode;
        // Even lower opacity for scattered sprinkles
        const targetOpacity = isPowerMode ? 0.8 : isActive ? Math.min(0.5, combo * 0.05) : 0;

        // Slower fade for less jarring entry
        const mat = materialRef.current;
        mat.opacity += (targetOpacity - mat.opacity) * delta * 2;

        if (mat.opacity < 0.01) {
            meshRef.current.visible = false;
            return;
        }
        meshRef.current.visible = true;

        const speed = isPowerMode ? 2.0 : 0.5;
        const time = state.clock.elapsedTime;

        for (let i = 0; i < totalCount; i++) {
            const i3 = i * 3;

            // Gentle drift
            pos[i3] += velocities[i3] * delta * 60 * speed;
            pos[i3 + 1] += velocities[i3 + 1] * delta * 60 * speed;
            pos[i3 + 2] += velocities[i3 + 2] * delta * 60 * speed;

            // Twinkle effect (using z-pos as phase)
            // Just modulate size via 'size' attribute? 
            // The material size is global. We simulate twinkle by jittering position slightly or ignoring it (simple is better).
            // Actually, let's just create a breathing motion
            pos[i3 + 1] += Math.sin(time * 2 + pos[i3] * 0.5) * 0.002;

            // Wrap around screen boundaries for continuous field
            if (pos[i3] > 10) pos[i3] = -10;
            if (pos[i3] < -10) pos[i3] = 10;
            if (pos[i3 + 1] > 6) pos[i3 + 1] = -6;
            if (pos[i3 + 1] < -6) pos[i3 + 1] = 6;
        }
        geo.attributes.position.needsUpdate = true;

        // Color update
        if (isPowerMode) {
            mat.color.setHex(0xffcc00); // Gold
        } else {
            mat.color.setHex(0xffaa00); // Orange
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={totalCount} array={particles.positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                ref={materialRef}
                size={0.08}
                map={sprite}
                transparent
                opacity={0}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                color="#00ffff"
            />
        </points>
    );
}
