"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * LightTrails — Phase 18
 *
 * Signature mechanic: light trails follow the mouse cursor in 3D space.
 * The trail persists briefly, creating a painting-in-light effect.
 *
 * CALM    → long fading trails, blue
 * NEUTRAL → medium trails, white
 * CHAOTIC → short bright trails, red/orange
 */

interface LightTrailsProps {
    mood: number;
}

const TRAIL_LENGTH = 80;

export default function LightTrails({ mood }: LightTrailsProps) {
    const pointsRef = useRef<THREE.Points>(null!);
    const { camera, size } = useThree();

    const trailData = useMemo(() => {
        const positions = new Float32Array(TRAIL_LENGTH * 3);
        const colors = new Float32Array(TRAIL_LENGTH * 3);
        const sizes = new Float32Array(TRAIL_LENGTH);

        // Initialize all at origin
        for (let i = 0; i < TRAIL_LENGTH; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 1;
            colors[i * 3 + 2] = 1;
            sizes[i] = 0;
        }

        return { positions, colors, sizes };
    }, []);

    // Track mouse position in normalized device coordinates
    const mouse3D = useRef(new THREE.Vector3(0, 0, 0));
    const mouseNDC = useRef({ x: 0, y: 0 });

    // Mouse listener
    useMemo(() => {
        if (typeof window === "undefined") return;
        const handler = (e: MouseEvent) => {
            mouseNDC.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener("mousemove", handler);
        return () => window.removeEventListener("mousemove", handler);
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

        // Project mouse to 3D (on a plane z = 2 from camera)
        const vec = new THREE.Vector3(mouseNDC.current.x, mouseNDC.current.y, 0.5);
        vec.unproject(camera);
        const dir = vec.sub(camera.position).normalize();
        const distance = 3; // how far from camera
        mouse3D.current = camera.position.clone().add(dir.multiplyScalar(distance));

        const pos = trailData.positions;
        const col = trailData.colors;

        // Shift trail positions down (oldest at end)
        for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
            const i3 = i * 3;
            const prev = (i - 1) * 3;
            pos[i3] = pos[prev];
            pos[i3 + 1] = pos[prev + 1];
            pos[i3 + 2] = pos[prev + 2];
        }

        // Set head to current mouse position
        pos[0] = mouse3D.current.x;
        pos[1] = mouse3D.current.y;
        pos[2] = mouse3D.current.z;

        // Update colors and sizes based on position in trail
        const targetColor =
            mood > 25
                ? new THREE.Color("#ff4400")
                : mood < -25
                    ? new THREE.Color("#2288ff")
                    : new THREE.Color("#aaaaff");

        for (let i = 0; i < TRAIL_LENGTH; i++) {
            const i3 = i * 3;
            const t = i / TRAIL_LENGTH; // 0 = head, 1 = tail

            // Color fades toward dimmer version at tail
            col[i3] = targetColor.r * (1 - t * 0.7);
            col[i3 + 1] = targetColor.g * (1 - t * 0.7);
            col[i3 + 2] = targetColor.b * (1 - t * 0.7);

            // Size decreases along trail
            trailData.sizes[i] = (1 - t) * 0.08;
        }

        const geo = pointsRef.current.geometry;
        (geo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
        (geo.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={TRAIL_LENGTH}
                    array={trailData.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={TRAIL_LENGTH}
                    array={trailData.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                map={sprite}
                vertexColors
                transparent
                opacity={0.7}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    );
}
