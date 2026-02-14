"use client";

import { useMemo } from "react";

/**
 * MoodMeter — Phase 16 (AERIS Overhaul)
 *
 * Immersive sensory meter:
 *   • Sense-Link terminology
 *   • Segmented vertical-feel indicator
 *   • Dynamic state colors with heavy blooming
 */

interface MoodMeterProps {
    mood: number;
}

function moodLabel(mood: number): string {
    if (mood < -25) return "CALM";
    if (mood > 25) return "CHAOTIC";
    return "NEUTRAL";
}

function moodColor(mood: number): string {
    if (mood < -25) return "#3399ff";
    if (mood > 25) return "#ff4400";
    return "#ffffff";
}

export default function MoodMeter({ mood }: MoodMeterProps) {
    const label = moodLabel(mood);
    const color = moodColor(mood);

    // Map -100…100 → 0…100 for the visual bar
    const fillPercent = useMemo(() => ((mood + 100) / 200) * 100, [mood]);

    return (
        <div style={containerStyle}>
            {/* Glossy Overlay Badge */}
            <div style={badgeStyle}>
                SENSOR LINK // {label}
            </div>

            <div style={mainValueContainerStyle}>
                <span style={{
                    ...valueStyle,
                    color: color,
                    textShadow: `0 0 20px ${color}88`
                }}>
                    {Math.round(mood)}
                </span>
                <div style={unitStyle}>Hz</div>
            </div>

            {/* Segmented Progress Tracker */}
            <div style={trackStyle}>
                <div style={{
                    ...fillStyle,
                    width: `${fillPercent}%`,
                    background: color,
                    boxShadow: `0 0 15px ${color}`
                }} />

                {/* Visual Segments/Marks */}
                <div style={segmentsOverlayStyle}>
                    {[...Array(10)].map((_, i) => (
                        <div key={i} style={segmentLineStyle} />
                    ))}
                </div>

                {/* Center Pulse Point */}
                <div style={centerMarkerStyle} />
            </div>

            <div style={footerLabelStyle}>
                REACTIVE SENSORY INTERFACE
            </div>

            <style jsx>{`
                @keyframes pulse-slow {
                    0% { opacity: 0.3; }
                    100% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: "16px",
    right: "16px",
    zIndex: 100,
    padding: "20px",
    width: "180px",
    background: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "2px", // Industrial sharp look
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
    pointerEvents: "none",
};

const badgeStyle: React.CSSProperties = {
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: "3px",
    color: "#fff",
    opacity: 0.4,
    marginBottom: "12px",
};

const mainValueContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    marginBottom: "16px",
};

const valueStyle: React.CSSProperties = {
    fontSize: "38px",
    fontWeight: 900,
    fontVariantNumeric: "tabular-nums",
    lineHeight: 1,
    transition: "all 0.6s ease",
};

const unitStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 700,
    opacity: 0.3,
};

const trackStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "6px",
    background: "rgba(255,255,255,0.05)",
    overflow: "hidden",
};

const fillStyle: React.CSSProperties = {
    height: "100%",
    transition: "width 0.4s cubic-bezier(0.1, 0, 0.1, 1), background 0.8s ease",
};

const segmentsOverlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    justifyContent: "space-between",
    padding: "0 2px",
};

const segmentLineStyle: React.CSSProperties = {
    width: "1px",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
};

const centerMarkerStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: "2px",
    background: "rgba(255,255,255,0.3)",
    transform: "translateX(-50%)",
};

const footerLabelStyle: React.CSSProperties = {
    marginTop: "12px",
    fontSize: "8px",
    letterSpacing: "2px",
    opacity: 0.2,
    textAlign: "right",
};
