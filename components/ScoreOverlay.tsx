"use client";

import { useEffect, useRef, useState } from "react";
import { ScoreState } from "@/lib/scoreSystem";
import { ComboState } from "@/lib/comboSystem";

/**
 * ScoreOverlay — Phase B
 *
 * Displays Score, High Score, Current Combo, and Multiplier.
 * Uses lerp animation for Score counting.
 * Combo shakes/pulses on milestones.
 */

interface ScoreOverlayProps {
    scoreState: ScoreState;
    comboState: ComboState;
}

export default function ScoreOverlay({ scoreState, comboState }: ScoreOverlayProps) {
    const [visualScore, setVisualScore] = useState(0);
    const [prevScore, setPrevScore] = useState(0);
    const [flash, setFlash] = useState(false);
    const [comboPop, setComboPop] = useState(false);

    useEffect(() => {
        // Score update animation
        if (scoreState.currentScore !== prevScore) {
            setPrevScore(scoreState.currentScore);
            let startTime: number;
            const start = visualScore;
            const end = scoreState.currentScore;
            const duration = 500; // ms

            const animate = (time: number) => {
                if (!startTime) startTime = time;
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic

                setVisualScore(Math.floor(start + (end - start) * ease));

                if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        }
    }, [scoreState.currentScore]);

    // Combo feedback
    useEffect(() => {
        if (comboState.currentCombo > 0) {
            setComboPop(true);
            const t = setTimeout(() => setComboPop(false), 200);
            return () => clearTimeout(t);
        }
    }, [comboState.currentCombo]);

    // Power Mode feedback
    useEffect(() => {
        if (comboState.isPowerMode) {
            setFlash(true);
            const t = setTimeout(() => setFlash(false), 500); // long flash
            return () => clearTimeout(t);
        }
    }, [comboState.isPowerMode]);

    return (
        <div style={containerStyle}>
            {/* Score */}
            <div style={scoreBoxStyle}>
                <div style={labelStyle}>SCORE</div>
                <div style={valueStyle}>{visualScore.toLocaleString()}</div>
            </div>

            {/* High Score */}
            {scoreState.highScore > 0 && (
                <div style={{ ...labelStyle, fontSize: "9px", marginTop: "4px" }}>
                    HI: {scoreState.highScore.toLocaleString()}
                </div>
            )}

            {/* Combo Multiplier */}
            {comboState.currentCombo > 1 && (
                <div style={{
                    ...comboStyle,
                    transform: comboPop ? "scale(1.4) rotate(-5deg)" : "scale(1) rotate(0deg)",
                    color: comboState.isPowerMode ? "#ffcc00" : "#fff",
                    textShadow: comboState.isPowerMode ? "0 0 10px #ffcc00" : "none"
                }}>
                    x{comboState.multiplier} <span style={{ fontSize: "14px" }}>COMBO</span>
                    <div style={{ fontSize: "32px", fontWeight: 800 }}>{comboState.currentCombo}</div>
                </div>
            )}

            {/* Power Mode Banner */}
            {comboState.isPowerMode && (
                <div style={powerBannerStyle}>
                    POWER MODE
                </div>
            )}
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: "16px",
    left: "24px",
    zIndex: 90,
    fontFamily: "'Inter', sans-serif",
    color: "#fff",
    pointerEvents: "none",
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
};

const scoreBoxStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
};

const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    letterSpacing: "2px",
    opacity: 0.6,
    fontWeight: 600,
};

const valueStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    lineHeight: 1,
};

const comboStyle: React.CSSProperties = {
    marginTop: "16px",
    fontSize: "18px",
    fontWeight: 900,
    transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    transformOrigin: "left center",
};

const powerBannerStyle: React.CSSProperties = {
    marginTop: "8px",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "3px",
    color: "#ffcc00",
    animation: "pulse 0.5s infinite alternate",
};
