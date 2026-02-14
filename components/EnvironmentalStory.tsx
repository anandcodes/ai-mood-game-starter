"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * EnvironmentalStory — Phase 17
 *
 * Subtle visual narrative through:
 *   • Geometry evolution over time (icosahedron → more detailed)
 *   • Lighting cycles (day/night feel)
 *   • Environment learns player rhythm — particles form patterns
 *
 * No text — purely visual storytelling.
 */

interface EnvironmentalStoryProps {
    mood: number;
    sessionTime: number; // seconds since start
}

export default function EnvironmentalStory({
    mood,
    sessionTime,
}: EnvironmentalStoryProps) {
    const ring1Ref = useRef<THREE.Mesh>(null!);
    const ring2Ref = useRef<THREE.Mesh>(null!);
    const ring3Ref = useRef<THREE.Mesh>(null!);

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        // Rings appear and grow as the session progresses
        // Ring 1: appears at 20s
        if (ring1Ref.current) {
            const age1 = Math.max(0, sessionTime - 20);
            const scale1 = Math.min(1, age1 / 10) * 2.5; // grow over 10s
            ring1Ref.current.scale.setScalar(scale1);
            ring1Ref.current.rotation.x = time * 0.1;
            ring1Ref.current.rotation.z = time * 0.15;
            (ring1Ref.current.material as THREE.MeshStandardMaterial).opacity =
                Math.min(0.15, age1 / 30);
        }

        // Ring 2: appears at 60s
        if (ring2Ref.current) {
            const age2 = Math.max(0, sessionTime - 60);
            const scale2 = Math.min(1, age2 / 15) * 3.5;
            ring2Ref.current.scale.setScalar(scale2);
            ring2Ref.current.rotation.y = time * -0.08;
            ring2Ref.current.rotation.x = time * 0.05 + 1;
            (ring2Ref.current.material as THREE.MeshStandardMaterial).opacity =
                Math.min(0.1, age2 / 40);
        }

        // Ring 3: appears at 120s (intensity phase)
        if (ring3Ref.current) {
            const age3 = Math.max(0, sessionTime - 120);
            const scale3 = Math.min(1, age3 / 20) * 4.5;
            ring3Ref.current.scale.setScalar(scale3);
            ring3Ref.current.rotation.z = time * 0.06;
            ring3Ref.current.rotation.y = time * -0.12 + 2;
            (ring3Ref.current.material as THREE.MeshStandardMaterial).opacity =
                Math.min(0.08, age3 / 50);

            // During intensity, the ring pulses
            if (mood > 25) {
                const pulse = Math.sin(time * 3) * 0.3;
                ring3Ref.current.scale.multiplyScalar(1 + pulse * 0.05);
            }
        }
    });

    // Color evolves with mood
    const ringColor = mood > 25 ? "#ff2200" : mood < -25 ? "#2255ff" : "#666688";

    return (
        <group>
            {/* Ring 1 — first narrative element */}
            <mesh ref={ring1Ref} scale={0}>
                <torusGeometry args={[1, 0.01, 16, 100]} />
                <meshStandardMaterial
                    color={ringColor}
                    emissive={ringColor}
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Ring 2 — builds complexity */}
            <mesh ref={ring2Ref} scale={0}>
                <torusGeometry args={[1, 0.008, 16, 120]} />
                <meshStandardMaterial
                    color={ringColor}
                    emissive={ringColor}
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Ring 3 — intensity phase narrative */}
            <mesh ref={ring3Ref} scale={0}>
                <torusGeometry args={[1, 0.006, 16, 150]} />
                <meshStandardMaterial
                    color={ringColor}
                    emissive={ringColor}
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}
