
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { updateMood, setMoodDirect } from "@/lib/moodEngine";
import { trackPlayer } from "@/lib/playerTracker";
import { getSessionTraits, resetSessionPersonality } from "@/lib/sessionPersonality";
import { tickProgression, getReactivityMultiplier, resetProgression } from "@/lib/progressionSystem";
import { updateUnlocks, resetUnlocks } from "@/lib/unlockSystem";
import { resetRewardSystem } from "@/lib/rewardSystem";
import { resetRareEvents } from "@/lib/rareEvents";
import { registerInteraction, tickComboSystem, getComboState, resetComboSystem } from "@/lib/comboSystem";
import { addInteractionScore, getScoreState, resetScoreSystem } from "@/lib/scoreSystem";
import { playClickSound, playComboSound, playPowerBurstSound } from "@/lib/sfxEngine";

import ParticleField from "@/components/ParticleField";
import CameraController from "@/components/CameraController";
import BackgroundController from "@/components/BackgroundController";
import MoodMeter from "@/components/MoodMeter";
import AudioEngine from "@/components/AudioEngine";
import Obstacles from "@/components/Obstacles";
import PlayerAura from "@/components/PlayerAura";
import EnvironmentFX from "@/components/EnvironmentFX";
import MoodEvents from "@/components/MoodEvents";
import PostProcessing from "@/components/PostProcessing";
import EnvironmentalStory from "@/components/EnvironmentalStory";
import LightTrails from "@/components/LightTrails";
import SessionSummary from "@/components/SessionSummary";
import ResonanceMeter from "@/components/ResonanceMeter";
import RewardRenderer from "@/components/RewardRenderer";
import RareEventRenderer from "@/components/RareEventRenderer";
import ScoreOverlay from "@/components/ScoreOverlay";
import { AccessibilityPanel } from "@/components/Accessibility";

interface SceneProps {
  mood: number;
  sessionTime: number;
}

function Scene({ mood, sessionTime }: SceneProps) {
  const lightRef = useRef<THREE.PointLight>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (!meshRef.current || !lightRef.current) return;

    meshRef.current.rotation.y += delta * (1 + mood / 50);
    meshRef.current.rotation.x += delta * 0.3;

    lightRef.current.intensity = 2 + Math.abs(mood) / 20;

    const color = new THREE.Color(
      mood > 25 ? "#ff0040" : mood < -25 ? "#3399ff" : "#ffffff"
    );

    lightRef.current.color = color;
  });

  return (
    <>
      <pointLight ref={lightRef} position={[2, 2, 2]} />
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={"white"} wireframe />
      </mesh>
      <ParticleField mood={mood} />
      <CameraController mood={mood} />
      <BackgroundController mood={mood} />
      <Obstacles mood={mood} />
      <PlayerAura mood={mood} />
      <EnvironmentFX mood={mood} />
      <MoodEvents mood={mood} />
      <EnvironmentalStory mood={mood} sessionTime={sessionTime} />
      <LightTrails mood={mood} />
      {/* Phase A — Micro-reward visual effects */}
      <RewardRenderer mood={mood} />
      {/* Phase D — Rare reward visual effects */}
      <RareEventRenderer mood={mood} />
    </>
  );
}

interface GameCanvasProps {
  started?: boolean;
}

export default function GameCanvas({ started = false }: GameCanvasProps) {
  const [mood, setMood] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [resonance, setResonance] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // Arcade State
  const [scoreState, setScoreState] = useState({ currentScore: 0, highScore: 0 });
  const [comboState, setComboState] = useState({ currentCombo: 0, maxCombo: 0, multiplier: 1, lastInteractionTime: 0, isPowerMode: false, powerModeEndTime: 0 });
  const powerBursts = useRef(0);

  const moodHistory = useRef<number[]>([]);
  const sessionStart = useRef(Date.now());

  // Resonance tracking refs
  const prevMood = useRef(0);
  const stableTicks = useRef(0);
  const idleTicks = useRef(0);
  const erraticTicks = useRef(0);

  // Initialize session personality on mount
  useEffect(() => {
    getSessionTraits();
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("moodScore");
    if (saved) {
      const val = Number(saved);
      setMoodDirect(val);
      setMood(val);
    }
  }, []);

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

      // ── Arcade Logic ──
      // Register interactions
      if (metrics.clicks > 0) {
        // Register each click
        for (let i = 0; i < metrics.clicks; i++) {
          const increased = registerInteraction();
          // Sound feedback
          playClickSound();
        }
      }

      // Tick systems
      const currentCombo = tickComboSystem();
      setComboState({ ...currentCombo }); // Force update UI

      // Play combo sounds on milestones (basic logic, could be refined to only trigger on increase)
      // Actually tracking "increased" in registerInteraction is better, but here we poll.
      // Let's rely on basic feedback for now.

      // Update Score
      if (metrics.clicks > 0) {
        addInteractionScore(currentCombo.multiplier, currentCombo.isPowerMode);
        setScoreState(getScoreState());

        // Check power mode trigger (first frame)
        if (currentCombo.isPowerMode && currentCombo.powerModeEndTime > now + 2900) {
          // Just triggered (approx)
          playPowerBurstSound();
          powerBursts.current++;
        }
      }

      // Track totals for session summary
      // (clicks tracked via score/combo now)

      // Phase 16 — Emotional Progression
      const progression = tickProgression(
        metrics.clicks + (metrics.movement > 0 ? 1 : 0)
      );
      setSessionTime(progression.sessionDuration);
      const reactivity = getReactivityMultiplier();

      // Phase 15 — Emotional Feedback Loop + Phase 16 reactivity
      const adjustedMetrics = {
        clicks: metrics.clicks * traits.chaosSensitivity * reactivity,
        movement: metrics.movement * traits.chaosSensitivity * reactivity,
        idle: metrics.idle * (2 - traits.chaosSensitivity),
      };

      const newMood = updateMood(adjustedMetrics);
      setMood(newMood);
      moodHistory.current.push(newMood);
      sessionStorage.setItem("moodScore", newMood.toString());

      // ── Phase B: Resonance calculation ──────────────────
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

  // Show summary after 60s? Or just a button? The README implies valid session loop. 
  // Let's add a manual "End Session" button or key for now? 
  // Or maybe just let it run. The summary screen is usually triggered by game end.
  // There is no explicit "End Game" condition in README other than "Resolution" phase. 
  // I will auto-show summary after 5 minutes (Resolution end) or add a hidden trigger?
  // Let's trigger on 'Escape' key for demo purposes.

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSummary(true);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

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

  return (
    <>
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <Scene mood={mood} sessionTime={sessionTime} />
        <PostProcessing mood={mood} />
      </Canvas>
      <MoodMeter mood={mood} />
      {started && <ResonanceMeter resonance={resonance} />}
      {started && <ScoreOverlay scoreState={scoreState} comboState={comboState} />}
      {started && <AudioEngine mood={mood} />}
      {started && <AccessibilityPanel />}
      {showSummary && (
        <SessionSummary
          moodHistory={moodHistory.current}
          sessionDuration={(Date.now() - sessionStart.current) / 1000}
          resonance={resonance}
          score={scoreState.currentScore}
          highScore={scoreState.highScore}
          maxCombo={comboState.maxCombo}
          powerBursts={powerBursts.current}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
