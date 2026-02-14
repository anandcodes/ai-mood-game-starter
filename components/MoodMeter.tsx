"use client";

import { useMemo } from "react";

/**
 * MoodMeter — Phase 4
 *
 * HTML overlay showing:
 *   • Mood score (-100 … 100)
 *   • Mood state label (CALM / NEUTRAL / CHAOTIC)
 *   • Animated gradient bar
 *
 * Positioned top-right corner, floating over the 3D canvas.
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
    return "#aaaaaa";
}

function moodGlow(mood: number): string {
    if (mood < -25) return "0 0 20px rgba(51,153,255,0.4)";
    if (mood > 25) return "0 0 20px rgba(255,68,0,0.4)";
    return "0 0 10px rgba(170,170,170,0.15)";
}

export default function MoodMeter({ mood }: MoodMeterProps) {
    const label = moodLabel(mood);
    const color = moodColor(mood);
    const glow = moodGlow(mood);

    // Map -100…100 → 0…100 for the bar fill
    const fillPercent = useMemo(() => ((mood + 100) / 200) * 100, [mood]);

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <span style={{ fontSize: "10px", letterSpacing: "2px", opacity: 0.6 }}>
                    MOOD ENGINE
                </span>
            </div>

            {/* Score */}
            <div
                style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color: color,
                    textShadow: `0 0 15px ${color}`,
                    transition: "color 0.8s ease, text-shadow 0.8s ease",
                    lineHeight: 1,
                }}
            >
                {Math.round(mood)}
            </div>

            {/* State label */}
            <div
                style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "3px",
                    color: color,
                    opacity: 0.9,
                    marginTop: "2px",
                    transition: "color 0.8s ease",
                }}
            >
                {label}
            </div>

            {/* Bar track */}
            <div style={barTrackStyle}>
                {/* Bar fill */}
                <div
                    style={{
                        height: "100%",
                        width: `${fillPercent}%`,
                        borderRadius: "2px",
                        background: `linear-gradient(90deg, #3399ff, #aaaaaa 50%, #ff4400)`,
                        transition: "width 0.3s ease",
                        boxShadow: `0 0 8px ${color}`,
                    }}
                />
                {/* Center notch (neutral marker) */}
                <div
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "-1px",
                        bottom: "-1px",
                        width: "2px",
                        background: "rgba(255,255,255,0.3)",
                        transform: "translateX(-50%)",
                    }}
                />
            </div>

            {/* Range labels */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "8px",
                    opacity: 0.35,
                    marginTop: "3px",
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                <span>-100</span>
                <span>0</span>
                <span>+100</span>
            </div>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 100,
    padding: "16px 20px 12px",
    minWidth: "140px",
    background: "rgba(10, 10, 10, 0.75)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    color: "#fff",
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    userSelect: "none",
    pointerEvents: "none", // allow clicks to pass through to the game
};

const headerStyle: React.CSSProperties = {
    marginBottom: "6px",
    textTransform: "uppercase",
};

const barTrackStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "4px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "2px",
    marginTop: "10px",
    overflow: "visible",
};
