"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ResonanceMeter — Phase 16 (AERIS Overhaul)
 *
 * Technical 'Sync Gauge' aesthetic.
 * Segmented progress with ethereal glows and digital status tags.
 */

interface ResonanceMeterProps {
    resonance: number;
}

export default function ResonanceMeter({ resonance }: ResonanceMeterProps) {
    const [display, setDisplay] = useState(0);
    const animFrame = useRef(0);

    useEffect(() => {
        const animate = () => {
            setDisplay((prev) => {
                const diff = resonance - prev;
                if (Math.abs(diff) < 0.05) return resonance;
                return prev + diff * 0.1;
            });
            animFrame.current = requestAnimationFrame(animate);
        };
        animFrame.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrame.current);
    }, [resonance]);

    const pct = Math.max(0, Math.min(100, display));

    // Aesthetic color: Deep Cyan -> Bright Blue
    const color = pct >= 80 ? "#00f3ff" : pct >= 40 ? "#648cff" : "#334466";

    return (
        <div style={containerStyle}>
            <div style={labelGridStyle}>
                <div style={badgeStyle}>CORE_SYNC</div>
                <div style={valueStyle}>{(pct / 100).toFixed(2)} [LNK]</div>
            </div>

            <div style={trackStyle}>
                {/* Segments for that technical feel */}
                <div style={segmentsContainerStyle}>
                    {[...Array(20)].map((_, i) => (
                        <div key={i} style={{
                            ...segmentStyle,
                            backgroundColor: (i / 19) * 100 <= pct ? color : "rgba(255,255,255,0.05)",
                            boxShadow: (i / 19) * 100 <= pct ? `0 0 10px ${color}` : "none",
                            transition: "background 0.3s ease, box-shadow 0.3s ease"
                        }} />
                    ))}
                </div>
            </div>

            <div style={footerStyle}>
                {pct >= 80 ? "PEAK_RESONANCE_ESTABLISHED" : "CALIBRATING_INTERMETRIC_SYNC"}
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
    zIndex: 100,
    width: "280px",
    pointerEvents: "none",
    fontFamily: "'Inter', sans-serif",
};

const labelGridStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "8px",
};

const badgeStyle: React.CSSProperties = {
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: "3px",
    color: "#fff",
    opacity: 0.3,
};

const valueStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "1px",
    opacity: 0.8,
    fontVariantNumeric: "tabular-nums",
};

const trackStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
};

const segmentsContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "3px",
    height: "10px",
};

const segmentStyle: React.CSSProperties = {
    flex: 1,
    height: "100%",
    borderRadius: "1px",
};

const footerStyle: React.CSSProperties = {
    marginTop: "8px",
    fontSize: "7px",
    letterSpacing: "1.5px",
    textAlign: "center",
    opacity: 0.2,
    textTransform: "uppercase",
};
