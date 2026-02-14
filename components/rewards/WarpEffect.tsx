import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WarpEffectProps {
    combo: number;
    isPowerMode: boolean;
}

export default function WarpEffect({ combo, isPowerMode }: WarpEffectProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const count = 100;

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                x: (Math.random() - 0.5) * 50,
                y: (Math.random() - 0.5) * 50,
                z: -10 - Math.random() * 50,
                speed: 1 + Math.random() * 2,
                scale: 0.1 + Math.random() * 0.5
            });
        }
        return temp;
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Only visible if combo is high
        const active = combo > 10 || isPowerMode;
        if (!active) {
            meshRef.current.visible = false;
            return;
        }
        meshRef.current.visible = true;

        const speedMult = isPowerMode ? 4 : (combo - 10) * 0.2;

        particles.forEach((p, i) => {
            p.z += p.speed * speedMult * delta * 20;
            if (p.z > 5) p.z = -60; // Reset to far back

            dummy.position.set(p.x, p.y, p.z);
            dummy.rotation.x = Math.PI / 2; // Orient along Z
            dummy.scale.set(0.05, 0.05, p.scale * (1 + speedMult * 0.5)); // Stretch length
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;

        // Color
        const mat = meshRef.current.material as THREE.MeshBasicMaterial;
        mat.color.set(isPowerMode ? "#ffcc00" : combo > 20 ? "#ff0088" : "#00ffff");
        mat.opacity = Math.min(0.5, (combo - 10) * 0.05);
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} visible={false}>
            <cylinderGeometry args={[1, 1, 10, 8]} />
            <meshBasicMaterial transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </instancedMesh>
    );
}
