"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GridFloorProps {
    mood: number;
    combo: number;
    score: number;
}

/**
 * GridFloor — Phase 2
 * 
 * A pulsing neon grid floor that adds spatial grounding.
 * Positioned below the scene.
 * 
 * - Mood drives color (Blue -> Pink -> Red)
 * - Combo drives pulse speed/intensity
 * - Score drives brightness
 * - Simulates terrain waves via vertex shader or simple manual displacement?
 *   > Manual displacement for simplicity without writing GLSL strings.
 */
export default function GridFloor({ mood, combo, score }: GridFloorProps) {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const time = state.clock.elapsedTime;

        // Wave distortion
        const geo = meshRef.current.geometry;
        const pos = geo.getAttribute("position");
        const pa = pos.array as Float32Array;

        // We need original positions to not drift away
        // Usually we store original positions in a separate buffer.
        // For simplicity, let's just use `sin(x + z + time)` based on index?
        // Wait, modifying buffer directly without resetting accumulates error or drift if not careful.
        // Better strategy: Calculate from (x, y_base, z).
        // The plane is generated on XZ plane? default Plane is XY. rotated to XZ.

        // Let's assume we rotate -PI/2 on X.

        // Color Logic
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        const isCalm = mood < -25;
        const isChaotic = mood > 25;

        const targetColor = isCalm ? new THREE.Color("#0044ff") :
            isChaotic ? new THREE.Color("#ff0044") :
                new THREE.Color("#cc00ff"); // Purple by default

        // Pulse logic
        const pulseSpeed = combo > 0 ? 5 + combo * 0.5 : 2;
        const pulse = (Math.sin(time * pulseSpeed) * 0.5 + 0.5) * (combo > 0 ? 1 : 0.2); // Intensify with combo

        // Score brightness boost
        const scoreBoost = Math.min(score / 5000, 1.0); // Cap at 5000

        mat.emissive.lerp(targetColor, delta * 2);
        mat.emissiveIntensity = 0.5 + pulse * 2.0 + scoreBoost * 2.0;
        mat.color.lerp(targetColor, delta * 2);

        // Infinite scroll effect at higher combos
        const scrollSpeed = 2 + Math.max(0, (combo - 5) * 2);
        if (combo > 5) {
            // Reset periodically to seamless loop (grid cell size approx 1.5)
            meshRef.current.position.z = (time * scrollSpeed) % 1.5;
        } else {
            meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, 0, delta);
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
            <planeGeometry args={[60, 60, 40, 40]} />
            <meshStandardMaterial
                color="#000000"
                emissive="#4400ff"
                emissiveIntensity={0.5}
                wireframe
                transparent
                opacity={0.15}
            />
        </mesh>
    );
}
