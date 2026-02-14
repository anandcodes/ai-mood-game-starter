"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { tickRareEvents, getRareEventProgress } from "@/lib/rareEvents";

/**
 * RareEventRenderer — Phase D (visual component)
 *
 * Renders rare reward events:
 *   slow_motion         → time stretch effect (scene scale pulse + blur light)
 *   particle_explosion  → dramatic burst ring + flash
 *   geometry_transform  → main mesh scale wave
 */

interface RareEventRendererProps {
    mood: number;
}

export default function RareEventRenderer({ mood }: RareEventRendererProps) {
    const flashRef = useRef<THREE.PointLight>(null!);
    const ringRef = useRef<THREE.Mesh>(null!);
    const waveRef = useRef<THREE.Mesh>(null!);

    useFrame((state, delta) => {
        const event = tickRareEvents(mood);
        const progress = getRareEventProgress();

        // ── Slow motion: deep glow wave ──────────────────────
        if (waveRef.current) {
            const mat = waveRef.current.material as THREE.MeshBasicMaterial;
            if (event?.type === "slow_motion") {
                waveRef.current.visible = true;
                // Breathing scale
                const breath = Math.sin(progress * Math.PI) * event.intensity;
                waveRef.current.scale.setScalar(2 + breath * 2);
                mat.opacity = breath * 0.12;
                mat.color.set("#3366ff");
                waveRef.current.rotation.y += delta * 0.2;
            } else {
                mat.opacity *= 0.85;
                if (mat.opacity < 0.001) waveRef.current.visible = false;
            }
        }

        // ── Particle explosion: expanding ring + flash ───────
        if (ringRef.current) {
            const mat = ringRef.current.material as THREE.MeshBasicMaterial;
            if (event?.type === "particle_explosion") {
                ringRef.current.visible = true;
                const expand = progress * 6;
                ringRef.current.scale.setScalar(expand);
                mat.opacity = (1 - progress) * 0.5 * event.intensity;
                mat.color.set("#ff4400");
                ringRef.current.rotation.x = state.clock.elapsedTime;
            } else {
                mat.opacity *= 0.85;
                if (mat.opacity < 0.001) ringRef.current.visible = false;
            }
        }

        // ── Flash light (all rare events get a flash) ────────
        if (flashRef.current) {
            if (event) {
                const bell = Math.sin(progress * Math.PI);
                flashRef.current.intensity = bell * event.intensity * 8;

                if (event.type === "slow_motion") {
                    flashRef.current.color.set("#4488ff");
                } else if (event.type === "particle_explosion") {
                    flashRef.current.color.set("#ff6622");
                } else {
                    flashRef.current.color.set("#aaddff");
                }
            } else {
                flashRef.current.intensity *= 0.85;
            }
        }
    });

    return (
        <>
            {/* Flash for all rare events */}
            <pointLight
                ref={flashRef}
                position={[0, 0, 0]}
                intensity={0}
                distance={20}
                decay={1}
            />

            {/* Explosion ring */}
            <mesh ref={ringRef} visible={false}>
                <torusGeometry args={[1, 0.03, 8, 48]} />
                <meshBasicMaterial
                    color="#ff4400"
                    transparent
                    opacity={0}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Slow motion wave sphere */}
            <mesh ref={waveRef} visible={false}>
                <icosahedronGeometry args={[1, 2]} />
                <meshBasicMaterial
                    color="#3366ff"
                    transparent
                    opacity={0}
                    wireframe
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </>
    );
}
