"use client";

import { useState, useEffect } from "react";

/**
 * IntroScreen — Phase 14
 *
 * Title screen with:
 *   • Fade-in intro
 *   • Title + tagline
 *   • Start interaction (click to begin)
 *   • Restart session button
 */

interface IntroScreenProps {
    onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
    const [visible, setVisible] = useState(true);
    const [fadeIn, setFadeIn] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Trigger fade in after mount
        const timer = setTimeout(() => setFadeIn(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleStart = () => {
        setFadeOut(true);
        setTimeout(() => {
            setVisible(false);
            onStart();
        }, 800);
    };

    if (!visible) return null;

    return (
        <div
            style={{
                ...overlayStyle,
                opacity: fadeOut ? 0 : fadeIn ? 1 : 0,
                transition: "opacity 0.8s ease",
            }}
        >
            {/* Gradient background */}
            <div style={bgStyle} />

            {/* Content */}
            <div style={contentStyle}>
                {/* Glow accent */}
                <div style={glowStyle} />

                <h1 style={titleStyle}>
                    AI MOOD
                    <br />
                    <span style={titleAccentStyle}>GAME</span>
                </h1>

                <p style={taglineStyle}>
                    A living environment that reacts to you.
                </p>

                <button onClick={handleStart} style={startButtonStyle}>
                    <span style={{ position: "relative", zIndex: 1 }}>
                        ENTER EXPERIENCE
                    </span>
                </button>

                <p style={hintStyle}>
                    Move your mouse and click to affect the mood.<br />
                    Stay still to find calm.
                </p>
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
    cursor: "pointer",
};

const bgStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background:
        "radial-gradient(ellipse at 50% 40%, #0d1b3e 0%, #060a14 60%, #000000 100%)",
};

const contentStyle: React.CSSProperties = {
    position: "relative",
    textAlign: "center",
    color: "#fff",
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    zIndex: 1,
};

const glowStyle: React.CSSProperties = {
    position: "absolute",
    top: "-60px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background:
        "radial-gradient(circle, rgba(100,140,255,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
};

const titleStyle: React.CSSProperties = {
    fontSize: "clamp(3rem, 8vw, 6rem)",
    fontWeight: 800,
    letterSpacing: "0.05em",
    lineHeight: 1,
    margin: 0,
    textShadow: "0 0 40px rgba(100,140,255,0.3)",
};

const titleAccentStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #6699ff, #ff4488)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontSize: "clamp(3.5rem, 9vw, 7rem)",
};

const taglineStyle: React.CSSProperties = {
    fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
    opacity: 0.5,
    marginTop: "16px",
    fontWeight: 300,
    letterSpacing: "0.1em",
};

const startButtonStyle: React.CSSProperties = {
    marginTop: "48px",
    padding: "16px 48px",
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "3px",
    color: "#fff",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "60px",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.4s ease",
    backdropFilter: "blur(10px)",
};

const hintStyle: React.CSSProperties = {
    marginTop: "32px",
    fontSize: "12px",
    opacity: 0.3,
    lineHeight: 1.8,
    letterSpacing: "0.05em",
};
