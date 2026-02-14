"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Obstacles — Phase 7
 *
 * Mood-driven obstacle spawning:
 *   CALM    → few slow obstacles
 *   NEUTRAL → moderate spawn rate
 *   CHAOTIC → frequent unpredictable obstacles
 *
 * Obstacles spawn in front of camera, move toward player, disappear after passing.
 * No physics engine — pure math in useFrame.
 */

interface ObstaclesProps {
    mood: number;
}

const MAX_OBSTACLES = 30;

interface ObstacleData {
    active: boolean;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    scale: number;
    color: THREE.Color;
    lifetime: number;
}

export default function Obstacles({ mood }: ObstaclesProps) {
    const groupRef = useRef<THREE.Group>(null!);
    const spawnTimer = useRef(0);

    // Pre-allocate obstacle pool
    const pool = useMemo<ObstacleData[]>(() => {
        return Array.from({ length: MAX_OBSTACLES }, () => ({
            active: false,
            position: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            scale: 0.1,
            color: new THREE.Color("#ffffff"),
            lifetime: 0,
        }));
    }, []);

    // Shared geometry & material refs
    const geoRef = useRef<THREE.OctahedronGeometry>(null!);

    useFrame((_state, delta) => {
        if (!groupRef.current) return;

        // ── Spawn logic ──────────────────────────────────────
        // Spawn interval decreases with chaotic mood
        const spawnInterval =
            mood > 25
                ? THREE.MathUtils.mapLinear(mood, 25, 100, 1.2, 0.3)
                : mood < -25
                    ? THREE.MathUtils.mapLinear(mood, -100, -25, 4.0, 2.0)
                    : THREE.MathUtils.mapLinear(mood, -25, 25, 2.0, 1.2);

        spawnTimer.current += delta;

        if (spawnTimer.current >= spawnInterval) {
            spawnTimer.current = 0;

            // Find inactive slot
            const slot = pool.find((o) => !o.active);
            if (slot) {
                slot.active = true;
                slot.lifetime = 0;

                // Spawn in a ring in front of camera (z = -8...-12)
                const angle = Math.random() * Math.PI * 2;
                const radius = 2 + Math.random() * 3;
                slot.position.set(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    -(8 + Math.random() * 4)
                );

                // Move toward player (positive z)
                const speed =
                    mood > 25
                        ? 1.5 + Math.random() * 2
                        : mood < -25
                            ? 0.4 + Math.random() * 0.4
                            : 0.7 + Math.random() * 0.8;

                // Chaotic = unpredictable lateral drift
                const drift = mood > 25 ? (Math.random() - 0.5) * 1.5 : 0;
                slot.velocity.set(drift, (Math.random() - 0.5) * 0.3, speed);

                slot.scale = 0.08 + Math.random() * 0.15;

                // Color based on mood
                if (mood > 25) {
                    slot.color.set("#ff2200");
                } else if (mood < -25) {
                    slot.color.set("#2266ff");
                } else {
                    slot.color.set("#666666");
                }
            }
        }

        // ── Update obstacles ─────────────────────────────────
        const meshes = groupRef.current.children as THREE.Mesh[];
        for (let i = 0; i < MAX_OBSTACLES; i++) {
            const ob = pool[i];
            const mesh = meshes[i];
            if (!mesh) continue;

            if (ob.active) {
                ob.lifetime += delta;
                ob.position.add(
                    ob.velocity.clone().multiplyScalar(delta)
                );

                // Rotate for visual interest
                mesh.rotation.x += delta * 1.5;
                mesh.rotation.y += delta * 2;

                mesh.position.copy(ob.position);
                mesh.scale.setScalar(ob.scale);
                (mesh.material as THREE.MeshStandardMaterial).color.copy(ob.color);
                (mesh.material as THREE.MeshStandardMaterial).opacity =
                    ob.position.z < 3 ? 1 : Math.max(0, 1 - (ob.position.z - 3) * 0.5);
                mesh.visible = true;

                // Deactivate if passed player or too old
                if (ob.position.z > 5 || ob.lifetime > 12) {
                    ob.active = false;
                    mesh.visible = false;
                }
            } else {
                mesh.visible = false;
            }
        }
    });

    return (
        <group ref={groupRef}>
            {Array.from({ length: MAX_OBSTACLES }, (_, i) => (
                <mesh key={i} visible={false}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        wireframe
                        transparent
                        opacity={0.7}
                    />
                </mesh>
            ))}
        </group>
    );
}
