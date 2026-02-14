"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getEnvironmentStage, getGeometryProps } from "@/lib/geometryEvolution";
import { lerpToThemeColor } from "@/lib/visualTheme";

interface DynamicEnvironmentProps {
    level: number;
    mood: number;
}

export default function DynamicEnvironment({ level, mood }: DynamicEnvironmentProps) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const satellitesRef = useRef<THREE.Group>(null!);

    const stage = getEnvironmentStage(level);
    const geoProps = getGeometryProps(stage);

    // Pre-calculate satellite positions for Level 5+
    const satelliteCount = Math.min(8, Math.floor(level / 3));
    const satelliteIndices = useMemo(() => [...Array(satelliteCount)], [satelliteCount]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const time = state.clock.elapsedTime;

        // Rotation based on mood and level
        const rotSpeed = (0.3 + mood / 100) + (level * 0.05);
        meshRef.current.rotation.y += delta * rotSpeed;
        meshRef.current.rotation.z += delta * 0.1;

        // Anomaly stage shaking
        if (stage === "anomaly") {
            meshRef.current.position.x = Math.sin(time * 20) * 0.05;
            meshRef.current.position.y = Math.cos(time * 25) * 0.05;
        } else {
            meshRef.current.position.set(0, 0, 0);
        }

        // Pulse logic
        const pulse = 1 + Math.sin(time * (1 + level * 0.1)) * (0.05 + level * 0.005);
        meshRef.current.scale.setScalar(pulse);

        // Satellites rotation
        if (satellitesRef.current) {
            satellitesRef.current.rotation.y += delta * 0.5;
            satellitesRef.current.rotation.x += delta * 0.2;
        }

        // Material color updates
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        lerpToThemeColor(material.color, mood, false, "primary", delta);

        // Emissive bloom for high levels
        if (level > 5) {
            material.emissive.copy(material.color);
            material.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.2;
        } else {
            material.emissiveIntensity = 0;
        }
    });

    return (
        <group>
            <mesh ref={meshRef}>
                {geoProps.type === "Icosahedron" && <icosahedronGeometry args={geoProps.args as [number, number]} />}
                {geoProps.type === "Octahedron" && <octahedronGeometry args={geoProps.args as [number, number]} />}
                {geoProps.type === "Dodecahedron" && <dodecahedronGeometry args={geoProps.args as [number, number]} />}
                {geoProps.type === "TorusKnot" && <torusKnotGeometry args={geoProps.args as [number, number, number, number]} />}

                <meshStandardMaterial
                    wireframe={geoProps.wireframe}
                    transparent
                    opacity={0.8}
                    roughness={0.1}
                    metalness={0.8}
                />
            </mesh>

            {/* Orbiting Satellites for higher levels */}
            <group ref={satellitesRef}>
                {satelliteIndices.map((_, i) => (
                    <mesh key={i} position={[
                        Math.cos((i / satelliteCount) * Math.PI * 2) * 2.5,
                        Math.sin((i / satelliteCount) * Math.PI * 2) * 0.5,
                        Math.sin((i / satelliteCount) * Math.PI * 2) * 2.5
                    ]}>
                        <boxGeometry args={[0.15, 0.15, 0.15]} />
                        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}
