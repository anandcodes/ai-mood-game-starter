"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getEnvironmentStage, getGeometryProps } from "@/lib/geometryEvolution";
import { lerpToThemeColor } from "@/lib/visualTheme"; // 1. Import lerpToThemeColor

interface DynamicEnvironmentProps {
    score: number;
    mood: number;
}

export default function DynamicEnvironment({ score, mood }: DynamicEnvironmentProps) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const stage = getEnvironmentStage(score);
    const geoProps = getGeometryProps(stage);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Rotation based on mood
        meshRef.current.rotation.y += delta * (0.5 + mood / 50);
        meshRef.current.rotation.x += delta * 0.2;

        // Pulse on high score / complex stage
        if (stage === "complex" || stage === "fractal") {
            const scaleBase = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
            meshRef.current.scale.setScalar(scaleBase);
        }

        // 3. Use lerpToThemeColor for material color and emissive
        const material = meshRef.current.material as THREE.MeshStandardMaterial;

        // Primary color follows theme
        lerpToThemeColor(material.color, mood, false, "primary", delta);

        // Emissive depends on stage (custom logic)
        const targetEmissive = stage === "complex" ? "#ff0088" : "#000000";
        // Manual lerp for custom emissive logic
        material.emissive.lerp(new THREE.Color(targetEmissive), delta * 2);

        // Intensity
        const targetIntensity = stage === "complex" ? 0.5 : 0;
        material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, targetIntensity, delta * 2);
    });

    return (
        <mesh ref={meshRef}>
            {/* Dynamic Geometry rendering */}
            {/* 2. Define proper tuple types for args */}
            {geoProps.type === "Icosahedron" && <icosahedronGeometry args={geoProps.args as [number, number]} />}
            {geoProps.type === "Octahedron" && <octahedronGeometry args={geoProps.args as [number, number]} />}
            {geoProps.type === "Dodecahedron" && <dodecahedronGeometry args={geoProps.args as [number, number]} />}
            {geoProps.type === "TorusKnot" && <torusKnotGeometry args={geoProps.args as [number, number, number, number]} />}

            {/* 4. Remove hardcoded color logic - now handled in useFrame */}
            <meshStandardMaterial
                wireframe
            />
        </mesh>
    );
}
