"use client";

import { useMemo } from "react";
import { getSessionTraits } from "@/lib/sessionPersonality";
import { getUnlockCount } from "@/lib/unlockSystem";

/**
 * SessionSummary — Phase E (updated)
 *
 * End-of-session summary showing:
 *   • Calm vs chaos ratio
 *   • Dominant mood
 *   • Resonance achieved
 *   • Session personality type
 *   • Unlock count
 *   • "Session Type: ___" label
 */

interface SessionSummaryProps {
    moodHistory: number[];
    sessionDuration: number; // seconds
    resonance: number;
    score: number;
    highScore: number;
    maxCombo: number;
    powerBursts: number;
    onRestart: () => void;
}

function classifySession(
    calmRatio: number,
    avgMood: number,
    resonance: number,
    score: number
): { label: string; color: string } {
    if (score > 5000) return { label: "Legendary", color: "#ffcc00" };
    if (resonance >= 80) return { label: "Harmonizer", color: "#aa44ff" };
    if (resonance >= 60 && calmRatio > 0.5) return { label: "Serene", color: "#3399ff" };
    if (resonance >= 60) return { label: "Resonant", color: "#44aaff" };
    if (calmRatio > 0.65) return { label: "Tranquil", color: "#55bbff" };
    if (calmRatio > 0.45) return { label: "Balanced", color: "#88aacc" };
    if (avgMood > 30) return { label: "Turbulent", color: "#ff4400" };
    if (avgMood > 15) return { label: "Energetic", color: "#ff8844" };
    return { label: "Drifting", color: "#aaaaaa" };
}

export default function SessionSummary({
    moodHistory,
    sessionDuration,
    resonance,
    score,
    highScore,
    maxCombo,
    powerBursts,
    onRestart,
}: SessionSummaryProps) {
    const stats = useMemo(() => {
        const total = moodHistory.length || 1;
        const calm = moodHistory.filter((m) => m < -25).length;
        const chaotic = moodHistory.filter((m) => m > 25).length;
        const neutral = total - calm - chaotic;
        const avgMood = moodHistory.reduce((a, b) => a + b, 0) / total;
        const calmRatio = calm / total;
        const session = classifySession(calmRatio, avgMood, resonance, score);
        const traits = getSessionTraits();
        const unlocks = getUnlockCount();

        return {
            calm: Math.round(calmRatio * 100),
            neutral: Math.round((neutral / total) * 100),
            chaotic: Math.round((chaotic / total) * 100),
            resonance: Math.round(resonance),
            sessionLabel: session.label,
            sessionColor: session.color,
            duration: Math.round(sessionDuration),
            personality: traits.particleBehaviorType,
            unlocks,
        };
    }, [moodHistory, sessionDuration, resonance, score]);

    return (
        <div style={overlayStyle}>
            <div style={cardStyle}>
                {/* Title */}
                <p
                    style={{
                        fontSize: "11px",
                        letterSpacing: "3px",
                        opacity: 0.4,
                        margin: 0,
                    }}
                >
                    SESSION COMPLETE
                </p>

                <h1 style={{ ...titleStyle, color: stats.sessionColor }}>
                    {stats.sessionLabel}
                </h1>

                {/* Arcade Score Display */}
                <div style={{ margin: "20px 0", fontSize: "32px", fontWeight: 800, color: "#fff", textShadow: "0 0 20px rgba(255,255,255,0.3)" }}>
                    {score.toLocaleString()} PTS
                </div>

                {/* Arcade Stats Grid */}
                <div style={gridStyle}>
                    <StatBlock label="High Score" value={highScore.toLocaleString()} />
                    <StatBlock label="Best Combo" value={`x${maxCombo}`} />
                    <StatBlock label="Power Bursts" value={`${powerBursts}`} />
                    <StatBlock label="Duration" value={`${stats.duration}s`} />
                </div>

                {/* Existing Mood/Personality Stats (Secondary) */}
                <div style={{ marginTop: "24px", opacity: 0.7 }}>
                    <p style={{ fontSize: "10px", letterSpacing: "2px", opacity: 0.6, marginBottom: "8px" }}>
                        STYLE & MOOD
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", opacity: 0.8, marginBottom: "4px" }}>
                        <span>Resonance: {stats.resonance}</span>
                        <span>Unlocks: {stats.unlocks}/4</span>
                    </div>
                    <div style={barContainerStyle}>
                        <div
                            style={{
                                ...barSegment,
                                width: `${stats.calm}%`,
                                background: "#3399ff",
                            }}
                        />
                        <div
                            style={{
                                ...barSegment,
                                width: `${stats.neutral}%`,
                                background: "#666",
                            }}
                        />
                        <div
                            style={{
                                ...barSegment,
                                width: `${stats.chaotic}%`,
                                background: "#ff4400",
                            }}
                        />
                    </div>
                </div>

                {/* Personality */}
                <p style={{ fontSize: "11px", opacity: 0.3, marginTop: "20px" }}>
                    Personality:{" "}
                    <strong style={{ opacity: 0.7 }}>{stats.personality}</strong>
                </p>

                {/* Restart */}
                <button onClick={onRestart} style={buttonStyle}>
                    PLAY AGAIN
                </button>
            </div>
        </div>
    );
}

function StatBlock({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ textAlign: "center" }}>
            <div
                style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                {value}
            </div>
            <div
                style={{
                    fontSize: "9px",
                    letterSpacing: "2px",
                    opacity: 0.4,
                    marginTop: "4px",
                }}
            >
                {label.toUpperCase()}
            </div>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(20px)",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#fff",
};

const cardStyle: React.CSSProperties = {
    padding: "40px 48px",
    maxWidth: "420px",
    width: "90%",
    background: "rgba(20,20,30,0.8)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    textAlign: "center",
};

const titleStyle: React.CSSProperties = {
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: 800,
    margin: "12px 0 16px",
    letterSpacing: "0.02em",
};

const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: "16px",
    marginTop: "24px",
    padding: "16px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const barContainerStyle: React.CSSProperties = {
    display: "flex",
    height: "6px",
    borderRadius: "3px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.05)",
};

const barSegment: React.CSSProperties = {
    height: "100%",
    transition: "width 0.5s ease",
};

const buttonStyle: React.CSSProperties = {
    marginTop: "28px",
    padding: "14px 40px",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "3px",
    color: "#fff",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "60px",
    cursor: "pointer",
    transition: "all 0.3s ease",
};
