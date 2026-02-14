"use client";

import React, { useEffect, useState, useRef } from "react";
import { ScoreState } from "@/lib/scoreSystem";
import { ComboState } from "@/lib/comboSystem";
import { playPowerBurstSound } from "@/lib/sfxEngine";

/**
 * QuestOverlay 
 *
 * Procedurally generates missions that scale indefinitely.
 * Uses Delta tracking for score and resonance to prevent insta-completing.
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
    "score_gain",
    "combo_reach",
    "mood_high",
    "resonance_gain",
    "mood_low",
    "power_mode"
];

function generateQuest(level: number, currentScore: number, currentResonance: number): Quest {
    // 1-3 Tutorial
    if (level === 1) return { level, type: "score_gain", startValue: currentScore, target: 500, text: "Gain 500 Score" };
    if (level === 2) return { level, type: "combo_reach", startValue: 0, target: 5, text: "Hit a 5x Combo" };
    if (level === 3) return { level, type: "resonance_gain", startValue: currentResonance, target: 15, text: "Gain 15% Resonance" };

    // Infinite scaling logic
    // We use a pseudo-random selection based on level but with enough variety
    const typeIndex = (level * 7 + 13) % QUEST_TYPES.length;
    const type = QUEST_TYPES[typeIndex];

    // Every 5 levels is a "Boss" challenge
    const isBoss = level % 5 === 0;

    switch (type) {
        case "score_gain": {
            const baseGain = 1000;
            const target = Math.floor(baseGain * Math.pow(1.2, Math.floor(level / 2)));
            return { level, type, startValue: currentScore, target, text: `${isBoss ? "BOSS: " : ""}Gain ${target.toLocaleString()} Score` };
        }
        case "combo_reach": {
            const target = Math.min(50, 5 + Math.floor(level / 2));
            return { level, type, startValue: 0, target, text: `${isBoss ? "BOSS: " : ""}Hit a ${target}x Combo` };
        }
        case "mood_high": {
            const target = Math.min(90, 20 + (level * 3));
            return { level, type, startValue: 0, target, text: `${isBoss ? "HYPER BOSS: " : ""}Hype it up! (Mood > ${target})` };
        }
        case "mood_low": {
            const target = Math.max(-90, -20 - (level * 3));
            return { level, type, startValue: 0, target, text: `${isBoss ? "ZEN BOSS: " : ""}Stay Calm (Mood < ${target})` };
        }
        case "resonance_gain": {
            const target = Math.min(50, 10 + Math.floor(level / 2));
            return { level, type, startValue: currentResonance, target, text: `${isBoss ? "BOSS: " : ""}Gain ${target}% Resonance` };
        }
        case "power_mode":
            return { level, type, startValue: 0, target: 1, text: "Trigger POWER MODE Burst" };
        default:
            return { level, type: "score_gain", startValue: currentScore, target: 1000, text: "Gain 1000 Score" };
    }
}

export default function QuestOverlay({ scoreState, comboState, mood, resonance, onLevelUp }: QuestOverlayProps) {
    const [level, setLevel] = useState(1);
    const [quest, setQuest] = useState<Quest>(() => generateQuest(1, scoreState.currentScore, resonance));
    const [completedAnim, setCompletedAnim] = useState(false);

    // Initial check to ensure quest is set correctly if scoreState wasn't ready
    useEffect(() => {
        if (level === 1 && quest.startValue === 0 && scoreState.currentScore > 0) {
            setQuest(generateQuest(1, scoreState.currentScore, resonance));
        }
    }, [scoreState.currentScore]);

    // Check for completion
    useEffect(() => {
        if (completedAnim) return;

        let complete = false;
        switch (quest.type) {
            case "score_gain":
                if (scoreState.currentScore - quest.startValue >= quest.target) complete = true;
                break;
            case "combo_reach":
                if (comboState.currentCombo >= quest.target) complete = true;
                break;
            case "mood_high":
                if (mood >= quest.target) complete = true;
                break;
            case "mood_low":
                if (mood <= quest.target) complete = true;
                break;
            case "resonance_gain":
                if (resonance - quest.startValue >= quest.target) complete = true;
                break;
            case "power_mode":
                if (comboState.isPowerMode) complete = true;
                break;
        }

        if (complete) {
            setCompletedAnim(true);
            playPowerBurstSound();
            if (onLevelUp) onLevelUp();
        }
    }, [scoreState.currentScore, comboState.currentCombo, comboState.isPowerMode, mood, resonance, quest, completedAnim, onLevelUp]);

    // Handle Level Transition
    useEffect(() => {
        if (completedAnim) {
            const timer = setTimeout(() => {
                setLevel(prev => {
                    const next = prev + 1;
                    setQuest(generateQuest(next, scoreState.currentScore, resonance));
                    return next;
                });
                setCompletedAnim(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [completedAnim]); // Only trigger when animation starts

    return (
        <div style={containerStyle}>
            {/* Level Indicator */}
            <div style={levelStyle}>
                LEVEL {level}
            </div>

            {/* Quest Text */}
            <div style={{
                ...textStyle,
                color: completedAnim ? "#55ff55" : "#ffffff",
                transform: completedAnim ? "scale(1.2)" : "scale(1)",
                textShadow: completedAnim ? "0 0 20px #55ff55" : "0 2px 4px rgba(0,0,0,0.8)"
            }}>
                {completedAnim ? "LEVEL COMPLETED!" : quest.text}
            </div>

            {/* Target Progress Bar */}
            {!completedAnim && (quest.type === "score_gain" || quest.type === "combo_reach" || quest.type === "resonance_gain") && (
                <div style={progressContainerStyle}>
                    <div style={{
                        ...progressBarStyle,
                        width: `${Math.min(100, (
                            quest.type === "score_gain" ? (scoreState.currentScore - quest.startValue) / quest.target :
                                quest.type === "combo_reach" ? comboState.currentCombo / quest.target :
                                    (resonance - quest.startValue) / quest.target
                        ) * 100)}%`
                    }} />
                </div>
            )}

            {!completedAnim && (quest.type === "mood_high" || quest.type === "mood_low") && (
                <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}>
                    Current: {mood.toFixed(0)} <span style={{ opacity: 0.5 }}>/ Goal: {quest.target}</span>
                </div>
            )}
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
    zIndex: 80,
    pointerEvents: "none",
    fontFamily: "'Inter', sans-serif",
    width: "300px",
};

const levelStyle: React.CSSProperties = {
    fontSize: "12px",
    letterSpacing: "4px",
    opacity: 0.8,
    fontWeight: 800,
    marginBottom: "4px",
    color: "#ffcc00",
    textShadow: "0 0 10px rgba(255, 204, 0, 0.5)",
};

const textStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
};

const progressContainerStyle: React.CSSProperties = {
    marginTop: "8px",
    width: "100%",
    height: "4px",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: "2px",
    overflow: "hidden",
};

const progressBarStyle: React.CSSProperties = {
    height: "100%",
    backgroundColor: "#fff",
    transition: "width 0.3s ease-out",
    boxShadow: "0 0 8px #fff",
};
