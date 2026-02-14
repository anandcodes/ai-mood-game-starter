"use client";

import React, { useEffect, useState, useRef } from "react";
import { ScoreState } from "@/lib/scoreSystem";
import { ComboState } from "@/lib/comboSystem";
import { playPowerBurstSound } from "@/lib/sfxEngine";

/**
 * QuestOverlay — Phase 16 (AERIS Overhaul)
 *
 * Technical 'Directive' interface.
 * Aesthetic: Industrial framing, high-contrast mission text, 
 * and a technical progress bar.
 */

interface QuestOverlayProps {
    scoreState: ScoreState;
    comboState: ComboState;
    mood: number;
    resonance: number;
    onLevelUp?: () => void;
}

type QuestType = "score_gain" | "combo_reach" | "mood_high" | "mood_low" | "power_mode" | "resonance_gain";

interface Quest {
    level: number;
    text: string;
    type: QuestType;
    target: number;
    startValue: number;
}

const QUEST_TYPES: QuestType[] = [
    "score_gain", "combo_reach", "mood_high", "resonance_gain", "mood_low", "power_mode"
];

function generateQuest(level: number, currentScore: number, currentResonance: number): Quest {
    if (level === 1) return { level, type: "score_gain", startValue: currentScore, target: 500, text: "GAIN_SCORE [+500]" };
    if (level === 2) return { level, type: "combo_reach", startValue: 0, target: 5, text: "STREAK_TARGET [x5]" };
    if (level === 3) return { level, type: "resonance_gain", startValue: currentResonance, target: 15, text: "SYNC_BOOST [+15%]" };

    const typeIndex = (level * 7 + 13) % QUEST_TYPES.length;
    const type = QUEST_TYPES[typeIndex];
    const isBoss = level % 5 === 0;

    switch (type) {
        case "score_gain": {
            const target = Math.floor(1000 * Math.pow(1.2, Math.floor(level / 2)));
            return { level, type, startValue: currentScore, target, text: `${isBoss ? "CRITICAL_" : ""}GAIN_SCORE [+${target.toLocaleString()}]` };
        }
        case "combo_reach": {
            const target = Math.min(50, 5 + Math.floor(level / 2));
            return { level, type, startValue: 0, target, text: `${isBoss ? "ULTRA_" : ""}STREAK_TARGET [x${target}]` };
        }
        case "mood_high": {
            const target = Math.min(90, 20 + (level * 3));
            return { level, type, startValue: 0, target, text: `${isBoss ? "CHAOS_LOOP" : "HYPE_REACH"} [M > ${target}]` };
        }
        case "mood_low": {
            const target = Math.max(-90, -20 - (level * 3));
            return { level, type, startValue: 0, target, text: `${isBoss ? "VOID_CALM" : "ZEN_TARGET"} [M < ${target}]` };
        }
        case "resonance_gain": {
            const target = Math.min(50, 10 + Math.floor(level / 2));
            return { level, type, startValue: currentResonance, target, text: `${isBoss ? "SYSTEM_SYNC" : "LINK_GAIN"} [+${target}%]` };
        }
        default:
            return { level, type: "power_mode", startValue: 0, target: 1, text: "TRIGGER_POWER_BURST" };
    }
}

export default function QuestOverlay({ scoreState, comboState, mood, resonance, onLevelUp }: QuestOverlayProps) {
    const [level, setLevel] = useState(1);
    const [quest, setQuest] = useState<Quest>(() => generateQuest(1, scoreState.currentScore, resonance));
    const [completedAnim, setCompletedAnim] = useState(false);

    useEffect(() => {
        if (level === 1 && quest.startValue === 0 && scoreState.currentScore > 0) {
            setQuest(generateQuest(1, scoreState.currentScore, resonance));
        }
    }, [scoreState.currentScore, resonance]);

    useEffect(() => {
        if (completedAnim) return;
        let complete = false;
        switch (quest.type) {
            case "score_gain": if (scoreState.currentScore - quest.startValue >= quest.target) complete = true; break;
            case "combo_reach": if (comboState.currentCombo >= quest.target) complete = true; break;
            case "mood_high": if (mood >= quest.target) complete = true; break;
            case "mood_low": if (mood <= quest.target) complete = true; break;
            case "resonance_gain": if (resonance - quest.startValue >= quest.target) complete = true; break;
            case "power_mode": if (comboState.isPowerMode) complete = true; break;
        }
        if (complete) {
            setCompletedAnim(true);
            playPowerBurstSound();
            if (onLevelUp) onLevelUp();
        }
    }, [scoreState.currentScore, comboState, mood, resonance, quest, completedAnim, onLevelUp]);

    useEffect(() => {
        if (completedAnim) {
            const timer = setTimeout(() => {
                setLevel(prev => {
                    const next = prev + 1;
                    setQuest(generateQuest(next, scoreState.currentScore, resonance));
                    return next;
                });
                setCompletedAnim(false);
            }, 1800);
            return () => clearTimeout(timer);
        }
    }, [completedAnim, scoreState.currentScore, resonance]);

    // Progress calculation
    const progress = quest.type === "score_gain" ? (scoreState.currentScore - quest.startValue) / quest.target :
        quest.type === "combo_reach" ? comboState.currentCombo / quest.target :
            quest.type === "resonance_gain" ? (resonance - quest.startValue) / quest.target : 0;
    const progressPct = Math.min(100, progress * 100);

    return (
        <div style={containerStyle}>
            <div style={directiveContainerStyle}>
                <div style={labelStyle}>DIRECTIVE_LVL_{level.toString().padStart(3, '0')}</div>
                <div style={{
                    ...missionTextStyle,
                    color: completedAnim ? "#55ff55" : "#fff",
                    textShadow: completedAnim ? "0 0 15px #55ff55" : "none"
                }}>
                    {completedAnim ? "LINK_CALIBRATED" : quest.text}
                </div>

                {!completedAnim && quest.type.includes("gain") || quest.type.includes("reach") ? (
                    <div style={trackStyle}>
                        <div style={{ ...fillStyle, width: `${progressPct}%` }} />
                    </div>
                ) : !completedAnim && (
                    <div style={statusPulseStyle}>ESTABLISHING_LINK...</div>
                )}
            </div>

            <style jsx>{`
                @keyframes pulse-status {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
    pointerEvents: "none",
    fontFamily: "'Inter', monospace",
};

const directiveContainerStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(15px)",
    padding: "16px 32px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "340px",
};

const labelStyle: React.CSSProperties = {
    fontSize: "9px",
    letterSpacing: "4px",
    fontWeight: 900,
    color: "#ffcc00",
    marginBottom: "8px",
};

const missionTextStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 900,
    letterSpacing: "1px",
    textAlign: "center",
    transition: "all 0.4s ease",
};

const trackStyle: React.CSSProperties = {
    marginTop: "16px",
    width: "100%",
    height: "2px",
    background: "rgba(255,255,255,0.05)",
};

const fillStyle: React.CSSProperties = {
    height: "100%",
    background: "#fff",
    boxShadow: "0 0 10px #fff",
    transition: "width 0.4s ease",
};

const statusPulseStyle: React.CSSProperties = {
    marginTop: "12px",
    fontSize: "8px",
    letterSpacing: "2px",
    animation: "pulse-status 1.5s infinite",
    opacity: 0.4,
};
