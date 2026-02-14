"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RingProps {
    color: string;
    speed: number;
    onComplete: () => void;
}

function Ring({ color, speed, onComplete }: RingProps) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null!);
    const scaleRef = useRef(0);
    const opacityRef = useRef(1);

    useFrame((state, delta) => {
        if (!meshRef.current || !materialRef.current) return;

        scaleRef.current += delta * speed;
        opacityRef.current -= delta * 1.5; // Fade out speed

        meshRef.current.scale.setScalar(scaleRef.current);
        materialRef.current.opacity = opacityRef.current;

        if (opacityRef.current <= 0) {
            onComplete();
        }
    });

    return (
        <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1, 0.05, 16, 100]} />
            <meshBasicMaterial
                ref={materialRef}
                color={color}
                transparent
                opacity={1}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

interface EnergyRingsProps {
    combo: number;
    score: number;
}

export default function EnergyRings({ combo, score }: EnergyRingsProps) {
    const [rings, setRings] = useState<{ id: number; color: string; speed: number }[]>([]);
    const prevCombo = useRef(combo);
    const prevScore = useRef(score);

    const spawnRing = (isMajor: boolean) => {
        const color = isMajor ? "#ff00ff" : "#00ffff";
        // Check random for non-major
        const finalColor = !isMajor && Math.random() > 0.5 ? "#ffff00" : color;

        setRings(prev => [
            ...prev,
            { id: Date.now() + Math.random(), color: finalColor, speed: isMajor ? 5 : 8 }
        ]);
    };

    useEffect(() => {
        if (combo > prevCombo.current) {
            spawnRing(false);
        }
        prevCombo.current = combo;

        if (Math.floor(score / 100) > Math.floor(prevScore.current / 100)) {
            spawnRing(true);
        }
        prevScore.current = score;
    }, [combo, score]);

    const removeRing = (id: number) => {
        setRings(prev => prev.filter(r => r.id !== id));
    };

    return (
        <group>
            {rings.map(ring => (
                <Ring
                    key={ring.id}
                    color={ring.color}
                    speed={ring.speed}
                    onComplete={() => removeRing(ring.id)}
                />
            ))}
        </group>
    );
}
