"use client";

import React, { useEffect, useRef, useState } from "react";
import { ScoreState } from "@/lib/scoreSystem";
import { ComboState } from "@/lib/comboSystem";

/**
 * ScoreOverlay — Phase B
 *
 * Displays Score, High Score, Current Combo, and Multiplier.
 * Allows floating text popups for "Juice".
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

    // Floating Text System
    const [popups, setPopups] = useState<{ id: number; text: string; x: number; y: number; color: string }[]>([]);
    const popupId = useRef(0);

    const addPopup = (text: string, color: string = "#fff", isCenter: boolean = false) => {
        const id = popupId.current++;
        // Position relative to window
        // Ensure window exists (client-side only check handled by useEffect caller)
        const winW = typeof window !== 'undefined' ? window.innerWidth : 1000;
        const winH = typeof window !== 'undefined' ? window.innerHeight : 800;

        const x = isCenter ? winW / 2 + (Math.random() - 0.5) * 100 : 120 + (Math.random() * 60);
        const y = isCenter ? winH / 2 + (Math.random() - 0.5) * 100 : 80 + (Math.random() * 40);

        setPopups(prev => [...prev, { id, text, x, y, color }]);
        setTimeout(() => {
            setPopups(prev => prev.filter(p => p.id !== id));
        }, 800);
    };

    // Score Update
    useEffect(() => {
        if (scoreState.currentScore !== prevScore) {
            const diff = scoreState.currentScore - prevScore;
            // Pop for gain
            if (diff > 0 && prevScore > 0) {
                const color = diff >= 100 ? "#ffcc00" : "#fff";
                addPopup(`+${diff}`, color, false);
            }

            setPrevScore(scoreState.currentScore);

            // Animate number
            let startTime: number;
            const start = visualScore;
            const end = scoreState.currentScore;
            const duration = 500;

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

    // Combo Feedback
    useEffect(() => {
        if (comboState.currentCombo > 0) {
            setComboPop(true);
            const t = setTimeout(() => setComboPop(false), 200);

            // Phrases
            if (comboState.currentCombo % 5 === 0) {
                const phrases = ["GOOD!", "SWEET!", "SUPER!", "WOW!", "UNREAL!", "GODLIKE!"];
                const idx = Math.min(Math.floor(comboState.currentCombo / 5) - 1, phrases.length - 1);
                if (idx >= 0) addPopup(phrases[idx], "#ff00ff", true);
            }
            return () => clearTimeout(t);
        }
    }, [comboState.currentCombo]);

    // Power Mode
    useEffect(() => {
        if (comboState.isPowerMode) {
            setFlash(true);
            const t = setTimeout(() => setFlash(false), 500);
            return () => clearTimeout(t);
        }
    }, [comboState.isPowerMode]);

    return (
        <>
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

            {/* Popups Layer */}
            {popups.map(p => (
                <div key={p.id} style={{
                    position: "fixed",
                    left: p.x,
                    top: p.y,
                    color: p.color,
                    fontSize: "24px",
                    fontWeight: 800,
                    pointerEvents: "none",
                    zIndex: 100,
                    // Simple inline animation simulation via CSS class or just CSS text
                    // Since inline styles can't keyframe easily without global style tag
                    animation: "floatUp 0.8s ease-out forwards",
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                }}>
                    {p.text}
                </div>
            ))}
            <style jsx global>{`
            @keyframes floatUp {
                0% { opacity: 1; transform: translateY(0) scale(1); }
                100% { opacity: 0; transform: translateY(-50px) scale(1.2); }
            }
        `}</style>
        </>
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
