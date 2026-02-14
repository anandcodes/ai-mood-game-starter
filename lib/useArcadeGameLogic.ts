import { useState, useRef, useEffect, useCallback } from "react";
import { updateMood, setMoodDirect } from "@/lib/moodEngine";
import { trackPlayer } from "@/lib/playerTracker";
import { getSessionTraits, resetSessionPersonality, SessionTraits } from "@/lib/sessionPersonality";
import { tickProgression, getReactivityMultiplier, resetProgression } from "@/lib/progressionSystem";
import { updateUnlocks, resetUnlocks } from "@/lib/unlockSystem";
import { resetRewardSystem } from "@/lib/rewardSystem";
import { resetRareEvents } from "@/lib/rareEvents";
import { registerInteraction, tickComboSystem, getComboState, resetComboSystem, ComboState } from "@/lib/comboSystem";
import { addInteractionScore, getScoreState, resetScoreSystem, ScoreState } from "@/lib/scoreSystem";
import { playClickSound, playComboSound, playPowerBurstSound } from "@/lib/sfxEngine";

export function useArcadeGameLogic(started: boolean) {
    const [mood, setMood] = useState(0);
    const [sessionTime, setSessionTime] = useState(0);
    const [resonance, setResonance] = useState(0);
    const [level, setLevel] = useState(1);
    const [showSummary, setShowSummary] = useState(false);

    // Arcade State
    const [scoreState, setScoreState] = useState<ScoreState>({ currentScore: 0, highScore: 0 });
    const [comboState, setComboState] = useState<ComboState>({ currentCombo: 0, maxCombo: 0, multiplier: 1, lastInteractionTime: 0, isPowerMode: false, powerModeEndTime: 0 });
    const powerBursts = useRef(0);

    const handleLevelUp = useCallback(() => {
        setLevel(prev => prev + 1);
    }, []);

    // Trigger logic
    const [comboFlash, setComboFlash] = useState(false);
    const prevCombo = useRef(0);

    const moodHistory = useRef<number[]>([]);
    const sessionStart = useRef(Date.now());
    const prevMood = useRef(0);
    const stableTicks = useRef(0);
    const idleTicks = useRef(0);
    const erraticTicks = useRef(0);

    // Initialize
    useEffect(() => {
        getSessionTraits();
        const saved = sessionStorage.getItem("moodScore");
        if (saved) {
            const val = Number(saved);
            setMoodDirect(val);
            setMood(val);
        }
    }, []);

    // Combo Monitor
    useEffect(() => {
        if (comboState.currentCombo > prevCombo.current) {
            if (comboState.currentCombo > 0 && comboState.currentCombo % 5 === 0) {
                setComboFlash(true);
                playComboSound(comboState.currentCombo);
                const t = setTimeout(() => setComboFlash(false), 500);
                return () => clearTimeout(t);
            }
        }
        prevCombo.current = comboState.currentCombo;
    }, [comboState.currentCombo]);

    // Main Loop
    useEffect(() => {
        if (!started) return;

        sessionStart.current = Date.now();
        resetProgression();
        resetRewardSystem();
        resetRareEvents();
        resetComboSystem();
        resetScoreSystem();
        powerBursts.current = 0;

        const traits = getSessionTraits();

        const interval = setInterval(() => {
            const metrics = trackPlayer();
            const now = Date.now();

            // Interactions
            if (metrics.clicks > 0) {
                for (let i = 0; i < metrics.clicks; i++) {
                    registerInteraction();
                    // Audio feedback with pitch based on combo
                    const currentState = getComboState();
                    playClickSound(0.5, currentState.currentCombo);
                }
            }

            const currentCombo = tickComboSystem();
            setComboState({ ...currentCombo });

            if (metrics.clicks > 0) {
                addInteractionScore(currentCombo.multiplier, currentCombo.isPowerMode);
                setScoreState(getScoreState());

                if (currentCombo.isPowerMode && currentCombo.powerModeEndTime > now + 2900) {
                    playPowerBurstSound();
                    powerBursts.current++;
                }
            }

            // Mood & Progression
            const progression = tickProgression(metrics.clicks + (metrics.movement > 0 ? 1 : 0));
            setSessionTime(progression.sessionDuration);
            const reactivity = getReactivityMultiplier();

            const adjustedMetrics = {
                clicks: metrics.clicks * traits.chaosSensitivity * reactivity,
                movement: metrics.movement * traits.chaosSensitivity * reactivity,
                idle: metrics.idle * (2 - traits.chaosSensitivity),
            };

            const newMood = updateMood(adjustedMetrics);
            setMood(newMood);
            moodHistory.current.push(newMood);
            sessionStorage.setItem("moodScore", newMood.toString());

            // Resonance
            const moodDiff = Math.abs(newMood - prevMood.current);
            prevMood.current = newMood;

            if (moodDiff < 3) stableTicks.current++;
            else stableTicks.current = Math.max(0, stableTicks.current - 2);

            if (moodDiff > 8) erraticTicks.current++;
            else erraticTicks.current = Math.max(0, erraticTicks.current - 1);

            if (metrics.idle > 2) idleTicks.current++;
            else idleTicks.current = Math.max(0, idleTicks.current - 2);

            const hasInteraction = metrics.clicks > 0 || metrics.movement > 0.5;

            setResonance((prev) => {
                let delta = 0;
                if (hasInteraction) delta += 0.15;
                if (stableTicks.current > 10) delta += 0.1;
                if (stableTicks.current > 30) delta += 0.15;
                if (idleTicks.current > 20) delta -= 0.3;
                if (erraticTicks.current > 5) delta -= 0.2;
                delta -= 0.02;

                const next = Math.max(0, Math.min(100, prev + delta));
                updateUnlocks(next);
                return next;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [started]);

    // Restart Handler
    const handleRestart = useCallback(() => {
        setShowSummary(false);
        setMood(0);
        setSessionTime(0);
        setResonance(0);
        setMoodDirect(0);
        resetProgression();
        resetSessionPersonality();
        resetRewardSystem();
        resetRareEvents();
        resetUnlocks();
        resetComboSystem();
        resetScoreSystem();
        setScoreState({ currentScore: 0, highScore: 0 });
        setComboState({ currentCombo: 0, maxCombo: 0, multiplier: 1, lastInteractionTime: 0, isPowerMode: false, powerModeEndTime: 0 });
        moodHistory.current = [];
        stableTicks.current = 0;
        idleTicks.current = 0;
        erraticTicks.current = 0;
        prevMood.current = 0;
        sessionStart.current = Date.now();
        sessionStorage.removeItem("moodScore");
    }, []);

    // Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowSummary(true);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    return {
        mood,
        sessionTime,
        resonance,
        level,
        handleLevelUp,
        showSummary,
        setShowSummary,
        scoreState,
        comboState,
        comboFlash,
        moodHistory,
        sessionStart,
        powerBursts,
        handleRestart
    };
}
