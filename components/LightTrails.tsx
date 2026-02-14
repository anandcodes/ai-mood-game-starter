"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * LightTrails — Phase 18 (Enhanced Phase 4)
 *
 * Signature mechanic: light trails follow the mouse cursor in 3D space.
 * Enhanced with Arcade Combo logic:
 * - Combo >= 6: Brighter, wider trails
 * - Combo >= 10 (Power Mode): Gold, massive, high opacity
 */

interface LightTrailsProps {
    mood: number;
    combo: number;
}

const TRAIL_LENGTH = 120; // Increased length for smooth trails

export default function LightTrails({ mood, combo }: LightTrailsProps) {
    const pointsRef = useRef<THREE.Points>(null!);
    const { camera } = useThree();
    const mouse = useRef(new THREE.Vector2());

    // Initialize buffers once
    const [positions, colors] = useMemo(() => {
        return [
            new Float32Array(TRAIL_LENGTH * 3),
            new Float32Array(TRAIL_LENGTH * 3)
        ];
    }, []);

    // Mouse handler
    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Sprite texture
    const sprite = useMemo(() => {
        const s = 32;
        const canvas = document.createElement("canvas");
        canvas.width = s;
        canvas.height = s;
        const ctx = canvas.getContext("2d")!;
        const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.5, "rgba(255,255,255,0.4)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, s, s);
        return new THREE.CanvasTexture(canvas);
    }, []);

    useFrame(() => {
        if (!pointsRef.current) return;

        // Calculate 3D mouse position
        const vec = new THREE.Vector3(mouse.current.x, mouse.current.y, 0.5);
        vec.unproject(camera);
        const dir = vec.sub(camera.position).normalize();
        const distance = 3;
        const target = camera.position.clone().add(dir.multiplyScalar(distance));

        // Shift trail
        for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
            positions[i * 3] = positions[(i - 1) * 3];
            positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
            positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
        }
        positions[0] = target.x;
        positions[1] = target.y;
        positions[2] = target.z;

        // Colors & Size logic
        const isPower = combo >= 10;
        const isCombo = combo >= 6;

        let baseColor = new THREE.Color("#ffffff");
        if (mood > 25) baseColor.set("#ff4400");
        else if (mood < -25) baseColor.set("#2288ff");
        else baseColor.set("#aaaaff");

        if (isPower) baseColor.set("#ffcc00"); // Gold for power mode
        else if (isCombo) baseColor.offsetHSL(0.1, 0, 0.1); // Brighter

        for (let i = 0; i < TRAIL_LENGTH; i++) {
            const t = i / TRAIL_LENGTH;
            const color = baseColor.clone();

            // Tail fade
            const alpha = 1 - t;
            colors[i * 3] = color.r * alpha;
            colors[i * 3 + 1] = color.g * alpha;
            colors[i * 3 + 2] = color.b * alpha;
        }

        const geo = pointsRef.current.geometry;
        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;

        // Dynamic point size
        const material = pointsRef.current.material as THREE.PointsMaterial;
        // Base size 0.08
        material.size = isPower ? 0.25 : isCombo ? 0.15 : 0.08;
        material.opacity = isPower ? 1.0 : 0.7;
        // Also pulse size slightly if isPower
        if (isPower) {
            material.size += Math.sin(Date.now() * 0.01) * 0.05;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={TRAIL_LENGTH} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={TRAIL_LENGTH} array={colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                map={sprite}
                vertexColors
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
