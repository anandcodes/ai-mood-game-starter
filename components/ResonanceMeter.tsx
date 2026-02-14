"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ResonanceMeter — Phase B
 *
 * Visible progression system: a horizontal bar at top-center.
 *
 * Resonance (0–100) increases with:
 *   • consistent interaction
 *   • stable mood
 *   • environment sync
 *
 * Resonance decreases during:
 *   • long idle periods
 *   • erratic interaction
 */

interface ResonanceMeterProps {
    resonance: number; // 0–100
}

export default function ResonanceMeter({ resonance }: ResonanceMeterProps) {
    const [display, setDisplay] = useState(0);
    const animFrame = useRef(0);

    // Smooth animation
    useEffect(() => {
        const animate = () => {
            setDisplay((prev) => {
                const diff = resonance - prev;
                if (Math.abs(diff) < 0.1) return resonance;
                return prev + diff * 0.08;
            });
            animFrame.current = requestAnimationFrame(animate);
        };
        animFrame.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrame.current);
    }, [resonance]);

    const pct = Math.max(0, Math.min(100, display));

    // Color shifts based on resonance level
    const barColor =
        pct >= 80
            ? "linear-gradient(90deg, #44aaff, #aa44ff, #ff44aa)"
            : pct >= 60
                ? "linear-gradient(90deg, #3388ff, #8855ff)"
                : pct >= 40
                    ? "linear-gradient(90deg, #4488cc, #5577dd)"
                    : pct >= 20
                        ? "linear-gradient(90deg, #336699, #4466aa)"
                        : "linear-gradient(90deg, #334455, #445566)";

    // Glow at high resonance
    const glow =
        pct >= 60
            ? `0 0 ${8 + (pct - 60) * 0.5}px rgba(100,140,255,${0.3 + (pct - 60) * 0.01})`
            : "none";

    // Unlock indicators
    const unlockThresholds = [20, 40, 60, 80];

    return (
        <div style={containerStyle}>
            {/* Label */}
            <div style={labelStyle}>
                <span style={{ opacity: 0.4 }}>RESONANCE</span>
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                    {Math.round(pct)}
                </span>
            </div>

            {/* Bar track */}
            <div style={trackStyle}>
                {/* Filled bar */}
                <div
                    style={{
                        ...fillStyle,
                        width: `${pct}%`,
                        background: barColor,
                        boxShadow: glow,
                    }}
                />

                {/* Unlock markers */}
                {unlockThresholds.map((threshold) => (
                    <div
                        key={threshold}
                        style={{
                            ...markerStyle,
                            left: `${threshold}%`,
                            background:
                                pct >= threshold
                                    ? "rgba(100,180,255,0.9)"
                                    : "rgba(255,255,255,0.15)",
                            boxShadow:
                                pct >= threshold
                                    ? "0 0 6px rgba(100,180,255,0.5)"
                                    : "none",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 90,
    width: "min(320px, 60vw)",
    pointerEvents: "none",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#fff",
};

const labelStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "9px",
    letterSpacing: "2px",
    marginBottom: "4px",
};

const trackStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "4px",
    borderRadius: "2px",
    background: "rgba(255,255,255,0.06)",
    overflow: "visible",
};

const fillStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.3s ease",
};

const markerStyle: React.CSSProperties = {
    position: "absolute",
    top: "-2px",
    width: "4px",
    height: "8px",
    borderRadius: "2px",
    transform: "translateX(-50%)",
    transition: "all 0.5s ease",
};
