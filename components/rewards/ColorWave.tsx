"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

interface ColorWaveProps {
    trigger: boolean;
    color: string;
    speed?: number; // default 1.0
    onComplete?: () => void;
}

export default function ColorWave({ trigger, color, speed = 1.0, onComplete }: ColorWaveProps) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [active, setActive] = useState(false);
    const startTime = useRef(0);
    const DURATION = 1.5 / speed;

    useEffect(() => {
        if (trigger) {
            setActive(true);
            startTime.current = Date.now();
            if (meshRef.current) {
                meshRef.current.scale.setScalar(0.1);
                meshRef.current.visible = true;
                (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.8;
                (meshRef.current.material as THREE.MeshBasicMaterial).color.set(color);
            }
        }
    }, [trigger, color, speed]);

    useFrame(() => {
        if (!active || !meshRef.current) return;

        const elapsed = (Date.now() - startTime.current) / 1000;
        const progress = Math.min(elapsed / DURATION, 1);

        if (progress >= 1) {
            setActive(false);
            meshRef.current.visible = false;
            if (onComplete) onComplete();
            return;
        }

        // Expand outward
        const scale = 0.1 + progress * 15; // huge wave
        meshRef.current.scale.setScalar(scale);

        // Fade out
        const mat = meshRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = (1 - progress) * 0.6;

        // Rotate slightly for dynamism
        meshRef.current.rotation.z += 0.05 * speed;
    });

    return (
        <mesh ref={meshRef} visible={false}>
            <torusGeometry args={[1, 0.2, 16, 100]} /> {/* Donut wave */}
            <meshBasicMaterial
                transparent
                opacity={0}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
    );
}
