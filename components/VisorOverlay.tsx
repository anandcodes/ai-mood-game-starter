"use client";

import React from "react";

/**
 * VisorOverlay — Phase 17 (AERIS Aesthetic)
 * 
 * Adds technical visual texture to the interface:
 *  • Scanlines (subtle)
 *  • Vignette
 *  • Digital Noise
 *  • Glitch Overlay for high intensity
 */

interface VisorOverlayProps {
    isPowerMode?: boolean;
}

export default function VisorOverlay({ isPowerMode }: VisorOverlayProps) {
    return (
        <div style={containerStyle}>
            {/* Scanlines */}
            <div style={scanlineStyle} />

            {/* Vignette */}
            <div style={vignetteStyle} />

            {/* Digital Noise */}
            <div style={noiseStyle} />

            {/* Glitch Overlay (Active only during Power Mode) */}
            {isPowerMode && <div style={glitchOverlayStyle} />}

            <style jsx>{`
                @keyframes noise-drift {
                    0% { transform: translate(0,0); }
                    10% { transform: translate(-5%,-5%); }
                    20% { transform: translate(-10%,5%); }
                    30% { transform: translate(5%,-10%); }
                    40% { transform: translate(-5%,15%); }
                    50% { transform: translate(-10%,5%); }
                    60% { transform: translate(15%,0); }
                    70% { transform: translate(0,10%); }
                    80% { transform: translate(-15%,10%); }
                    90% { transform: translate(10%,5%); }
                    100% { transform: translate(5%,0); }
                }
                @keyframes glitch-anim {
                    0% { transform: translate(0); clip-path: inset(10% 0 30% 0); opacity: 0.1; }
                    20% { transform: translate(-5px, 5px); clip-path: inset(50% 0 10% 0); opacity: 0.3; }
                    40% { transform: translate(5px, -5px); clip-path: inset(20% 0 50% 0); opacity: 0.2; }
                    60% { transform: translate(-5px, 2px); clip-path: inset(80% 0 5% 0); opacity: 0.4; }
                    80% { transform: translate(2px, -2px); clip-path: inset(5% 0 85% 0); opacity: 0.2; }
                    100% { transform: translate(0); clip-path: inset(40% 0 20% 0); opacity: 0.1; }
                }
            `}</style>
        </div>
    );
}

const containerStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    pointerEvents: "none",
    overflow: "hidden",
};

const scanlineStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%)",
    backgroundSize: "100% 4px",
    pointerEvents: "none",
    opacity: 0.2,
};

const vignetteStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.6) 100%)",
    pointerEvents: "none",
};

const noiseStyle: React.CSSProperties = {
    position: "absolute",
    inset: -100,
    backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
    opacity: 0.04,
    pointerEvents: "none",
    animation: "noise-drift 0.2s steps(2) infinite",
};

const glitchOverlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "rgba(100, 140, 255, 0.1)",
    mixBlendMode: "screen",
    animation: "glitch-anim 0.2s infinite alternate-reverse",
    pointerEvents: "none",
};
