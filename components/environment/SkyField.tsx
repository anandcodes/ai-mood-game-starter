"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SkyFieldProps {
    mood: number;
}

/**
 * SkyField — Phase 3
 * 
 * Large background sphere with gradient color.
 * Shifts slowly based on mood.
 * 
 * Calm -> Deep Blue / Purple
 * Neutral -> White / Gray / Cyan
 * Chaos -> Red / Orange / Black
 */
export default function SkyField({ mood }: SkyFieldProps) {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Slow rotation
        meshRef.current.rotation.y += delta * 0.005;

        // Color logic
        const mat = meshRef.current.material as THREE.MeshBasicMaterial;

        const isCalm = mood < -25;
        const isChaotic = mood > 25;

        let targetColor = new THREE.Color("#050510"); // Dark void base

        if (isCalm) targetColor.set("#001133"); // Deep blue
        else if (isChaotic) targetColor.set("#220000"); // Dark red
        else targetColor.set("#0a0a0a"); // Neutral dark

        // Subtle pulse?
        const time = state.clock.elapsedTime;
        const pulse = Math.sin(time * 0.2) * 0.1;
        targetColor.offsetHSL(0, 0, pulse);

        mat.color.lerp(targetColor, delta * 0.5);
    });

    return (
        <mesh ref={meshRef} scale={[50, 50, 50]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial
                color="#000000"
                side={THREE.BackSide}
                transparent
                opacity={0.8}
                depthWrite={false}
            />
        </mesh>
    );
}
