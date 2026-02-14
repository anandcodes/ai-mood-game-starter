"use client";

import React, { useEffect, useRef, useState } from "react";
import { ScoreState } from "@/lib/scoreSystem";
import { ComboState } from "@/lib/comboSystem";

/**
 * ScoreOverlay — Phase 16 (AERIS Overhaul)
 *
 * Displays Score, HI-Score, and Multiplier in a 'Session Data' module.
 * Aesthetic: Technical, clean, with glowing data points.
 */

interface ScoreOverlayProps {
    scoreState: ScoreState;
    comboState: ComboState;
}

export default function ScoreOverlay({ scoreState, comboState }: ScoreOverlayProps) {
    const [visualScore, setVisualScore] = useState(0);
    const [prevScore, setPrevScore] = useState(0);
    const [comboPop, setComboPop] = useState(false);

    const [popups, setPopups] = useState<{ id: number; text: string; x: number; y: number; color: string }[]>([]);
    const popupId = useRef(0);

    const addPopup = (text: string, color: string = "#fff", isCenter: boolean = false) => {
        const id = popupId.current++;
        const winW = typeof window !== 'undefined' ? window.innerWidth : 1000;
        const winH = typeof window !== 'undefined' ? window.innerHeight : 800;

        const x = isCenter ? winW / 2 + (Math.random() - 0.5) * 100 : 140 + (Math.random() * 40);
        const y = isCenter ? winH / 2 + (Math.random() - 0.5) * 100 : 40 + (Math.random() * 20);

        setPopups(prev => [...prev, { id, text, x, y, color }]);
        setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 800);
    };

    useEffect(() => {
        if (scoreState.currentScore !== prevScore) {
            const diff = scoreState.currentScore - prevScore;
            if (diff > 0 && prevScore > 0) {
                const color = diff >= 500 ? "#ffcc00" : "#ffffff";
                addPopup(`+${diff}`, color, false);
            }
            setPrevScore(scoreState.currentScore);

            let startTime: number;
            const start = visualScore;
            const end = scoreState.currentScore;
            const animate = (time: number) => {
                if (!startTime) startTime = time;
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / 400, 1);
                const ease = 1 - Math.pow(1 - progress, 4);
                setVisualScore(Math.floor(start + (end - start) * ease));
                if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        }
    }, [scoreState.currentScore]);

    useEffect(() => {
        if (comboState.currentCombo > 0) {
            setComboPop(true);
            const t = setTimeout(() => setComboPop(false), 150);
            if (comboState.currentCombo % 10 === 0) {
                addPopup("COMBO BURST!", "#ffcc00", true);
            }
            return () => clearTimeout(t);
        }
    }, [comboState.currentCombo]);

    return (
        <>
            <div style={containerStyle}>
                {/* Score Module */}
                <div style={moduleStyle}>
                    <div style={topRowStyle}>
                        <div style={labelStyle}>SESSION_DATA_SCORE</div>
                        {scoreState.highScore > 0 && (
                            <div style={hiScoreStyle}>HI://{scoreState.highScore.toLocaleString()}</div>
                        )}
                    </div>
                    <div style={mainValueStyle}>
                        {visualScore.toLocaleString()}
                        <span style={unitStyle}>pts</span>
                    </div>
                </div>

                {/* Combo Module */}
                {comboState.currentCombo > 1 && (
                    <div style={{
                        ...comboModuleStyle,
                        transform: comboPop ? "translateY(5px) scale(1.05)" : "translateY(0) scale(1)",
                        borderLeft: comboState.isPowerMode ? "2px solid #ffcc00" : "2px solid #fff"
                    }}>
                        <div style={comboMetaStyle}>
                            <span style={{ color: comboState.isPowerMode ? "#ffcc00" : "#648cff" }}>
                                {comboState.isPowerMode ? "POWER_MULT" : "MULTIPLIER"}
                            </span>
                            <span>x{comboState.multiplier}</span>
                        </div>
                        <div style={{
                            fontSize: "28px",
                            fontWeight: 900,
                            color: comboState.isPowerMode ? "#ffcc00" : "#fff",
                            textShadow: comboState.isPowerMode ? "0 0 15px #ffcc00" : "none"
                        }}>
                            {comboState.currentCombo}
                            <span style={{ fontSize: "12px", opacity: 0.4, marginLeft: "8px" }}>STREAK</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Juice Popups */}
            {popups.map(p => (
                <div key={p.id} style={{
                    position: "fixed",
                    left: p.x,
                    top: p.y,
                    color: p.color,
                    fontSize: "20px",
                    fontWeight: 900,
                    pointerEvents: "none",
                    zIndex: 200,
                    animation: "floatUpFade 0.8s ease-out forwards",
                    textShadow: "0 4px 8px rgba(0,0,0,0.8)"
                }}>
                    {p.text}
                </div>
            ))}

            <style jsx global>{`
                @keyframes floatUpFade {
                    0% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-40px) scale(1.3); }
                }
            `}</style>
        </>
    );
}

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: "16px",
    left: "16px",
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    fontFamily: "'Inter', sans-serif",
    pointerEvents: "none",
};

const moduleStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "16px",
    width: "220px",
};

const topRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
};

const labelStyle: React.CSSProperties = {
    fontSize: "8px",
    letterSpacing: "2px",
    fontWeight: 900,
    opacity: 0.3,
};

const hiScoreStyle: React.CSSProperties = {
    fontSize: "9px",
    color: "#ffcc00",
    fontWeight: 700,
    opacity: 0.8,
};

const mainValueStyle: React.CSSProperties = {
    fontSize: "32px",
    fontWeight: 900,
    lineHeight: 1,
    color: "#fff",
    fontVariantNumeric: "tabular-nums",
};

const unitStyle: React.CSSProperties = {
    fontSize: "12px",
    marginLeft: "4px",
    opacity: 0.2,
};

const comboModuleStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(15px)",
    padding: "12px 16px",
    width: "220px",
    transition: "all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
};

const comboMetaStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: "1px",
    marginBottom: "4px",
};
