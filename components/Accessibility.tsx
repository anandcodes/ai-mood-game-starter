"use client";

import { useState, createContext, useContext, useCallback } from "react";

/**
 * Accessibility — Phase 21
 *
 * Provides toggles for:
 *   • Reduced motion mode
 *   • Color-safe palette
 *   • Audio off toggle
 *
 * Exposed via React Context.
 */

interface AccessibilitySettings {
    reducedMotion: boolean;
    colorSafe: boolean;
    audioOff: boolean;
    toggleReducedMotion: () => void;
    toggleColorSafe: () => void;
    toggleAudio: () => void;
}

const AccessibilityContext = createContext<AccessibilitySettings>({
    reducedMotion: false,
    colorSafe: false,
    audioOff: false,
    toggleReducedMotion: () => { },
    toggleColorSafe: () => { },
    toggleAudio: () => { },
});

export function useAccessibility() {
    return useContext(AccessibilityContext);
}

export function AccessibilityProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [reducedMotion, setReducedMotion] = useState(false);
    const [colorSafe, setColorSafe] = useState(false);
    const [audioOff, setAudioOff] = useState(false);

    const toggleReducedMotion = useCallback(
        () => setReducedMotion((v) => !v),
        []
    );
    const toggleColorSafe = useCallback(() => setColorSafe((v) => !v), []);
    const toggleAudio = useCallback(() => setAudioOff((v) => !v), []);

    return (
        <AccessibilityContext.Provider
            value={{
                reducedMotion,
                colorSafe,
                audioOff,
                toggleReducedMotion,
                toggleColorSafe,
                toggleAudio,
            }}
        >
            {children}
        </AccessibilityContext.Provider>
    );
}

/**
 * AccessibilityPanel — toggle UI overlay (bottom-left)
 */
export function AccessibilityPanel() {
    const { reducedMotion, colorSafe, audioOff, toggleReducedMotion, toggleColorSafe, toggleAudio } =
        useAccessibility();

    return (
        <div style={panelStyle}>
            <div style={{ fontSize: "9px", letterSpacing: "2px", opacity: 0.4, marginBottom: "8px" }}>
                ACCESSIBILITY
            </div>
            <Toggle label="Reduced Motion" active={reducedMotion} onToggle={toggleReducedMotion} />
            <Toggle label="Color Safe" active={colorSafe} onToggle={toggleColorSafe} />
            <Toggle label="Audio Off" active={audioOff} onToggle={toggleAudio} />
        </div>
    );
}

function Toggle({
    label,
    active,
    onToggle,
}: {
    label: string;
    active: boolean;
    onToggle: () => void;
}) {
    return (
        <button onClick={onToggle} style={toggleStyle}>
            <span
                style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    marginRight: "8px",
                    background: active ? "#4488ff" : "rgba(255,255,255,0.15)",
                    transition: "background 0.3s ease",
                }}
            />
            {label}
        </button>
    );
}

const panelStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "20px",
    left: "20px",
    zIndex: 100,
    padding: "12px 16px",
    background: "rgba(10,10,10,0.75)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#fff",
};

const toggleStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "6px 0",
    fontSize: "11px",
    color: "rgba(255,255,255,0.6)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
};
