"use client";

import { useState, useEffect } from "react";

/**
 * IntroScreen — Phase 15 (Engagement Polish)
 *
 * Immersive entrance for the game:
 *   • Ethereal shifting background
 *   • Floating high-end typography
 *   • Interactive "pulse" button
 */

interface IntroScreenProps {
    onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
    const [visible, setVisible] = useState(true);
    const [fadeIn, setFadeIn] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setFadeIn(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleStart = () => {
        setFadeOut(true);
        setTimeout(() => {
            setVisible(false);
            onStart();
        }, 1000);
    };

    if (!visible) return null;

    return (
        <div
            style={{
                ...overlayStyle,
                opacity: fadeOut ? 0 : fadeIn ? 1 : 0,
                transition: "opacity 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
        >
            {/* Animated Gradient Background */}
            <div style={bgStyle}>
                <div style={movingGlow1Style} />
                <div style={movingGlow2Style} />
            </div>

            {/* Content Overflow Mask */}
            <div style={contentStyle}>
                <div style={badgeStyle}>SESSION START</div>

                <h1 style={titleStyle}>
                    AERIS
                    <br />
                    <span style={titleAccentStyle}>CORE</span>
                </h1>

                <p style={taglineStyle}>
                    Calibrate your sensory interface.
                </p>

                <div style={buttonWrapperStyle}>
                    <button onClick={handleStart} style={startButtonStyle}>
                        <span style={buttonTextStyle}>INITIALIZE</span>
                        <div style={buttonAuraStyle} />
                    </button>
                    <div style={statusDotStyle} />
                </div>

                <div style={hintGridStyle}>
                    <div style={hintItemStyle}>
                        <strong>CLICK</strong>
                        <span>TO IMPACT</span>
                    </div>
                    <div style={dividerStyle} />
                    <div style={hintItemStyle}>
                        <strong>STILLNESS</strong>
                        <span>TO CALM</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float-ethereal {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    33% { transform: translateY(-30px) translateX(20px); }
                    66% { transform: translateY(10px) translateX(-10px); }
                }
                @keyframes orbit {
                    from { transform: rotate(0deg) translateX(50px) rotate(0deg); }
                    to { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
                }
                @keyframes pulse-btn {
                    0% { box-shadow: 0 0 0 0 rgba(100, 140, 255, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(100, 140, 255, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(100, 140, 255, 0); }
                }
                button:hover .buttonAura {
                    opacity: 1;
                    transform: scale(1.5);
                }
            `}</style>
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
    background: "#000",
};

const bgStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    background: "#05070a",
};

const movingGlow1Style: React.CSSProperties = {
    position: "absolute",
    top: "20%",
    left: "20%",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(40,80,255,0.08) 0%, transparent 70%)",
    animation: "float-ethereal 15s infinite alternate ease-in-out",
};

const movingGlow2Style: React.CSSProperties = {
    position: "absolute",
    bottom: "10%",
    right: "15%",
    width: "700px",
    height: "700px",
    background: "radial-gradient(circle, rgba(255,50,120,0.05) 0%, transparent 70%)",
    animation: "float-ethereal 18s infinite alternate-reverse ease-in-out",
};

const contentStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 10,
    textAlign: "center",
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
};

const badgeStyle: React.CSSProperties = {
    fontSize: "10px",
    letterSpacing: "5px",
    color: "#648cff",
    marginBottom: "20px",
    fontWeight: 900,
    opacity: 0.8,
};

const titleStyle: React.CSSProperties = {
    fontSize: "clamp(4rem, 12vw, 7rem)",
    fontWeight: 900,
    letterSpacing: "-0.02em",
    lineHeight: 0.9,
    margin: 0,
    textShadow: "0 0 40px rgba(100,140,255,0.2)",
};

const titleAccentStyle: React.CSSProperties = {
    fontSize: "1rem",
    letterSpacing: "20px",
    marginLeft: "20px",
    opacity: 0.3,
    fontWeight: 300,
    verticalAlign: "middle",
};

const taglineStyle: React.CSSProperties = {
    fontSize: "14px",
    opacity: 0.4,
    marginTop: "24px",
    fontWeight: 400,
    letterSpacing: "4px",
    textTransform: "uppercase",
};

const buttonWrapperStyle: React.CSSProperties = {
    position: "relative",
    marginTop: "60px",
};

const startButtonStyle: React.CSSProperties = {
    padding: "20px 60px",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "6px",
    color: "#fff",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "4px",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s ease",
    animation: "pulse-btn 2s infinite",
};

const buttonTextStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 2,
};

const buttonAuraStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "rgba(100, 140, 255, 0.1)",
    opacity: 0,
    transition: "all 0.4s ease",
};

const statusDotStyle: React.CSSProperties = {
    position: "absolute",
    top: "-10px",
    right: "-10px",
    width: "6px",
    height: "6px",
    background: "#648cff",
    borderRadius: "50%",
    boxShadow: "0 0 10px #648cff",
};

const hintGridStyle: React.CSSProperties = {
    marginTop: "80px",
    display: "flex",
    gap: "40px",
    alignItems: "center",
};

const hintItemStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
};

const dividerStyle: React.CSSProperties = {
    width: "1px",
    height: "20px",
    background: "rgba(255,255,255,0.2)",
};
