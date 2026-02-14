"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * ComboExplosion — Phase 1
 * 
 * Visual reward for combo milestones (5, 10, 15).
 * Effect:
 * - Large particle burst (expanding sphere of points)
 * - Bloom flash (point light intensity spike)
 * - Quick camera zoom out (handled via camera prop or specialized effect?)
 *   > Actually, modifying camera directly here is tricky without access. 
 *   > We'll focus on the particle burst and light flash first.
 */

interface ComboExplosionProps {
    trigger: boolean;        // Trigger signal
    comboCount: number;      // Current combo count
    onComplete?: () => void; // Callback when effect finishes
}

export default function ComboExplosion({ trigger, comboCount, onComplete }: ComboExplosionProps) {
    const pointsRef = useRef<THREE.Points>(null!);
    const lightRef = useRef<THREE.PointLight>(null!);

    // Instance state
    const active = useRef(false);
    const startTime = useRef(0);
    const duration = 0.5; // seconds

    useEffect(() => {
        if (trigger) {
            active.current = true;
            startTime.current = Date.now();

            // Reset particles to center
            /*
              Ideally we'd re-emit particles, but for a simple effect we can 
              just reset their positions or scale. 
              Actually, let's just scale the group up rapidly.
            */
        }
    }, [trigger, comboCount]);

    useFrame((state, delta) => {
        if (!active.current) return;

        const elapsed = (Date.now() - startTime.current) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            active.current = false;
            if (onComplete) onComplete();
            // Hide
            if (pointsRef.current) pointsRef.current.visible = false;
            if (lightRef.current) lightRef.current.intensity = 0;
            return;
        }

        // easeOutExpo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        if (pointsRef.current) {
            pointsRef.current.visible = true;
            // Expand quickly
            const scale = 1 + ease * 8;
            pointsRef.current.scale.setScalar(scale);

            // Fade out
            const mat = pointsRef.current.material as THREE.PointsMaterial;
            mat.opacity = 1 - progress;
            mat.size = (1 - progress) * 0.2;

            // Color based on combo intensity
            if (comboCount >= 15) mat.color.set("#ff0044"); // Red/Pink
            else if (comboCount >= 10) mat.color.set("#ffaa00"); // Orange/Gold
            else mat.color.set("#00ffff"); // Cyan
        }

        if (lightRef.current) {
            // Flash intensity spike
            const flash = 1 - progress;
            lightRef.current.intensity = flash * 4;
            lightRef.current.color.set(
                comboCount >= 15 ? "#ff0044" :
                    comboCount >= 10 ? "#ffaa00" :
                        "#00ffff"
            );
        }
    });

    return (
        <>
            <points ref={pointsRef} visible={false}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <pointsMaterial
                    size={0.1}
                    transparent
                    opacity={0}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>
            <pointLight ref={lightRef} intensity={0} distance={10} decay={2} />
        </>
    );
}
