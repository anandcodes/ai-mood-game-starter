"use client";

import React, { useEffect, useState } from "react";

/**
 * ArtifactNotification — Phase 18 (Gamification)
 * 
 * Celebrates resonance milestones with 'Scientific Artifacts'.
 * Gives the player a sense of collection and narrative discovery.
 */

interface Artifact {
    threshold: number;
    name: string;
    desc: string;
    icon: string;
}

const ARTIFACTS: Artifact[] = [
    { threshold: 25, name: "NEURAL_LINK_V1", desc: "STABILIZED_INTERMETRIC_FEEDBACK", icon: "⌬" },
    { threshold: 50, name: "VOID_COMPASS", desc: "MAPPED_CHAOS_COORDINATES", icon: "⎔" },
    { threshold: 75, name: "QUANTUM_CORE", desc: "NON_LINEAR_SENSORY_BYPASS", icon: "⏣" },
    { threshold: 100, name: "AERIS_SOUL", desc: "FULL_RESONANCE_ESTABLISHED", icon: "✧" },
];

interface ArtifactNotificationProps {
    resonance: number;
}

export default function ArtifactNotification({ resonance }: ArtifactNotificationProps) {
    const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
    const [unlocked, setUnlocked] = useState<number[]>([]);

    useEffect(() => {
        const next = ARTIFACTS.find(a => resonance >= a.threshold && !unlocked.includes(a.threshold));
        if (next) {
            setActiveArtifact(next);
            setUnlocked(prev => [...prev, next.threshold]);

            // Auto hide after 5 seconds
            const t = setTimeout(() => setActiveArtifact(null), 5000);
            return () => clearTimeout(t);
        }
    }, [resonance, unlocked]);

    if (!activeArtifact) return null;

    return (
        <div style={containerStyle}>
            <div style={iconStyle}>{activeArtifact.icon}</div>
            <div style={textContainerStyle}>
                <div style={labelStyle}>ARTIFACT_ACQUIRED</div>
                <div style={nameStyle}>{activeArtifact.name}</div>
                <div style={descStyle}>{activeArtifact.desc}</div>
            </div>

            <style jsx>{`
                @keyframes slideUpArtifact {
                    0% { transform: translate(-50%, 40px); opacity: 0; }
                    10% { transform: translate(-50%, 0); opacity: 1; }
                    90% { transform: translate(-50%, 0); opacity: 1; }
                    100% { transform: translate(-50%, -20px); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

const containerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "120px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 200,
    background: "rgba(0,10,20,0.8)",
    backdropFilter: "blur(20px)",
    border: "1px solid #648cff",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    animation: "slideUpArtifact 5s ease-in-out forwards",
    pointerEvents: "none",
    minWidth: "300px",
    boxShadow: "0 0 30px rgba(100, 140, 255, 0.3)",
};

const iconStyle: React.CSSProperties = {
    fontSize: "40px",
    color: "#648cff",
    textShadow: "0 0 15px #648cff",
};

const textContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
};

const labelStyle: React.CSSProperties = {
    fontSize: "9px",
    letterSpacing: "4px",
    color: "#ffcc00",
    fontWeight: 900,
    marginBottom: "4px",
};

const nameStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "1px",
};

const descStyle: React.CSSProperties = {
    fontSize: "10px",
    opacity: 0.5,
    letterSpacing: "1px",
    marginTop: "2px",
    fontFamily: "monospace",
};
