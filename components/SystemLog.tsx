"use client";

import React, { useEffect, useState, useRef } from "react";

/**
 * SystemLog — Phase 17 (AERIS Narrative Polish)
 * 
 * A technical log window in the corner that provides procedural 
 * context to the player's actions. Makes the game feel like a 
 * monitored simulation.
 */

interface LogEntry {
    id: number;
    text: string;
    type: "info" | "warn" | "success" | "critical";
    timestamp: string;
}

interface SystemLogProps {
    level: number;
    combo: number;
    isPowerMode: boolean;
    resonance: number;
}

export default function SystemLog({ level, combo, isPowerMode, resonance }: SystemLogProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const logId = useRef(0);
    const lastLevel = useRef(level);
    const lastPower = useRef(isPowerMode);

    const addLog = (text: string, type: LogEntry["type"] = "info") => {
        const id = logId.current++;
        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        setLogs(prev => [...prev.slice(-5), { id, text, type, timestamp }]);
    };

    // Initial log
    useEffect(() => {
        addLog("SYSTEM_BOOT: AERIS_INTERFACE_ONLINE", "success");
        addLog("SENSORY_LINK: ESTABLISHED", "info");
    }, []);

    // Level Log
    useEffect(() => {
        if (level > lastLevel.current) {
            addLog(`PHASE_SHIFT: LEVEL_${level}_CALIBRATED`, "success");
            addLog(`SYSTEM: INCREASING_INTERFACIAL_LOAD`, "warn");
            lastLevel.current = level;
        }
    }, [level]);

    // Power Mode Log
    useEffect(() => {
        if (isPowerMode && !lastPower.current) {
            addLog("CRITICAL: POWER_CORE_OVERLOAD", "critical");
            addLog("SENSORY_OUTPUT: MAXIMIZED", "critical");
        } else if (!isPowerMode && lastPower.current) {
            addLog("SYSTEM: COOLING_CYCLES_ENGAGED", "info");
        }
        lastPower.current = isPowerMode;
    }, [isPowerMode]);

    // Resonance Milestones
    useEffect(() => {
        if (Math.floor(resonance) % 25 === 0 && resonance > 0) {
            addLog(`SYNC: RESONANCE_AT_${Math.floor(resonance)}%`, "info");
        }
    }, [Math.floor(resonance / 25)]);

    return (
        <div style={containerStyle}>
            {logs.map((log) => (
                <div key={log.id} style={{
                    ...logItemStyle,
                    color: log.type === "critical" ? "#ff4444" :
                        log.type === "success" ? "#55ff55" :
                            log.type === "warn" ? "#ffcc00" : "#ffffff",
                    animation: "slideInLog 0.3s ease-out forwards"
                }}>
                    <span style={timeStyle}>[{log.timestamp}]</span>
                    <span style={typeStyle}>{log.type.toUpperCase()}:</span>
                    <span>{log.text}</span>
                </div>
            ))}

            <style jsx>{`
                @keyframes slideInLog {
                    from { transform: translateX(-20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 0.7; }
                }
                @keyframes flicker-log {
                    0% { opacity: 0.7; }
                    5% { opacity: 0.4; }
                    10% { opacity: 0.7; }
                    15% { opacity: 0.8; }
                    25% { opacity: 0.7; }
                    30% { opacity: 1; }
                    100% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "24px",
    left: "24px",
    zIndex: 100,
    width: "350px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    pointerEvents: "none",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: "9px",
};

const logItemStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    opacity: 0.7,
    textShadow: "0 0 5px currentColor",
    animation: "flicker-log 5s infinite",
};

const timeStyle: React.CSSProperties = {
    opacity: 0.5,
};

const typeStyle: React.CSSProperties = {
    fontWeight: 900,
    minWidth: "60px",
};
