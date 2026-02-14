"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useAccessibility, AccessibilityPanel } from "@/components/Accessibility";
import { useArcadeGameLogic } from "@/lib/useArcadeGameLogic";
import { usePerformance } from "@/lib/usePerformance";
import { getIntensity } from "@/lib/intensityController";
import { useSuperReward } from "@/lib/superReward";
import { ComboState } from "@/lib/comboSystem";
import { ScoreState } from "@/lib/scoreSystem";

import BackgroundParticles from "@/components/particles/BackgroundParticles";
import MidParticles from "@/components/particles/MidParticles";
import EnergyParticles from "@/components/particles/EnergyParticles";
import EnergyRings from "@/components/rewards/EnergyRings";
import GridFloor from "@/components/environment/GridFloor";
import SkyField from "@/components/environment/SkyField";
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

// New Reward Components
import DynamicEnvironment from "@/components/DynamicEnvironment";
import ComboExplosion from "@/components/rewards/ComboExplosion";
import QuestOverlay from "@/components/QuestOverlay";
import ColorWave from "@/components/rewards/ColorWave";
import WarpEffect from "@/components/rewards/WarpEffect";
import VisorOverlay from "@/components/VisorOverlay";
import SystemLog from "@/components/SystemLog";
import ArtifactNotification from "@/components/ArtifactNotification";


interface SceneProps {
  mood: number;
  level: number;
  sessionTime: number;
  comboState: ComboState;
  scoreState: ScoreState;
  comboFlash: boolean;
  countMultiplier: number;
  reducedMotion: boolean;
  colorSafe: boolean;
  levelUpFlash: boolean;
}

function Scene({
  mood,
  level,
  sessionTime,
  comboState,
  scoreState,
  comboFlash,
  countMultiplier,
  reducedMotion,
  colorSafe,
  levelUpFlash,
}: SceneProps) {
  const lightRef = useRef<THREE.PointLight>(null!);

  // Phase 7: Intensity control
  const intensity = getIntensity(scoreState.currentScore);

  useFrame((state, delta) => {
    if (!lightRef.current) return;
    lightRef.current.intensity = (2 + Math.abs(mood) / 20) * intensity.lightBrightness;

    const color = new THREE.Color(
      mood > 25 ? "#ff0040" : mood < -25 ? "#3399ff" : "#ffffff"
    );
    lightRef.current.color = color;
  });

  return (
    <>
      <pointLight ref={lightRef} position={[2, 2, 2]} />

      {/* Phase 2: Dynamic Geometry replacing static mesh */}
      <DynamicEnvironment level={level} mood={mood} />

      {/* Phase 1: visual burst on combo milestone */}
      {!reducedMotion && <ComboExplosion trigger={comboFlash} comboCount={comboState.currentCombo} />}

      {/* Phase 3: color wave on combo milestone or power mode OR LEVEL UP */}
      <ColorWave
        trigger={(comboFlash || levelUpFlash || (comboState.isPowerMode && Math.random() < 0.02)) && !reducedMotion}
        color={levelUpFlash ? "#00ff00" : (comboState.isPowerMode ? "#ffcc00" : "#ffffff")}
        speed={levelUpFlash ? 3.0 : (comboState.isPowerMode ? 2.0 : 1.0)}
      />

      {/* ── VISUAL COMPONENTS ────────────────────────── */}
      <SkyField mood={mood} />
      <BackgroundParticles countMultiplier={countMultiplier * (reducedMotion ? 0.5 : 1)} />
      <MidParticles mood={mood} countMultiplier={countMultiplier * (reducedMotion ? 0.5 : 1)} />
      <EnergyParticles combo={comboState.currentCombo} isPowerMode={comboState.isPowerMode} countMultiplier={countMultiplier * (reducedMotion ? 0.5 : 1)} />
      {!reducedMotion && <WarpEffect combo={comboState.currentCombo} isPowerMode={comboState.isPowerMode} />}
      <EnergyRings combo={comboState.currentCombo} score={scoreState.currentScore} />
      <GridFloor mood={mood} combo={comboState.currentCombo} score={scoreState.currentScore} />
      {/* ───────────────────────────────────────────────── */}

      <CameraController mood={mood} isPowerMode={comboState.isPowerMode} reducedMotion={reducedMotion} />
      <BackgroundController mood={mood} />
      <Obstacles mood={mood} />
      <PlayerAura mood={mood} isPowerMode={comboState.isPowerMode} />
      <EnvironmentFX mood={mood} isPowerMode={comboState.isPowerMode} reducedMotion={reducedMotion} />
      <MoodEvents mood={mood} />
      <EnvironmentalStory mood={mood} sessionTime={sessionTime} />

      {/* Phase 4: Motion Trails (enhanced LightTrails) */}
      {!reducedMotion && <LightTrails mood={mood} combo={comboState.currentCombo} />}

      <RewardRenderer mood={mood} />
      <RareEventRenderer mood={mood} />
    </>
  );
}

interface GameCanvasProps {
  started?: boolean;
}

export default function GameCanvas({ started = false }: GameCanvasProps) {
  // Use custom hooks for logic and performance
  const logic = useArcadeGameLogic(started);
  const { particleCountMultiplier, enablePostProcessing, resolution } = usePerformance();
  const { reducedMotion, colorSafe, audioOff } = useAccessibility();
  const [levelUpFlash, setLevelUpFlash] = useState(false);

  // Trigger visual celebration globally when level increases
  useEffect(() => {
    if (logic.level > 1) {
      setLevelUpFlash(true);
      const t = setTimeout(() => setLevelUpFlash(false), 2000);
      return () => clearTimeout(t);
    }
  }, [logic.level]);

  return (
    <>
      <Canvas
        dpr={resolution} // Adaptive resolution for mobile
        camera={{ position: [0, 0, 4] }}
      >
        <fog attach="fog" args={["#000000", 5, 30]} /> {/* Added Fog for depth */}
        <ambientLight intensity={0.5} />
        <Scene
          mood={logic.mood}
          level={logic.level}
          sessionTime={logic.sessionTime}
          comboState={logic.comboState}
          scoreState={logic.scoreState}
          comboFlash={logic.comboFlash}
          countMultiplier={particleCountMultiplier}
          reducedMotion={reducedMotion}
          colorSafe={colorSafe}
          levelUpFlash={levelUpFlash}
        />
        {enablePostProcessing && !reducedMotion && (
          <PostProcessing
            mood={logic.mood}
            isPowerMode={logic.comboState.isPowerMode}
            combo={logic.comboState.currentCombo}
          />
        )}
      </Canvas>

      <MoodMeter mood={logic.mood} />
      {started && <ResonanceMeter resonance={logic.resonance} />}
      {started && <ScoreOverlay scoreState={logic.scoreState} comboState={logic.comboState} />}
      {started && <QuestOverlay
        level={logic.level}
        scoreState={logic.scoreState}
        comboState={logic.comboState}
        mood={logic.mood}
        resonance={logic.resonance}
        onLevelUp={logic.handleLevelUp}
      />}
      {started && <SystemLog
        level={logic.level}
        combo={logic.comboState.currentCombo}
        isPowerMode={logic.comboState.isPowerMode}
        resonance={logic.resonance}
      />}
      {started && <ArtifactNotification resonance={logic.resonance} />}
      {started && <AudioEngine mood={logic.mood} level={logic.level} muted={audioOff} />}
      {started && <AccessibilityPanel />}
      <VisorOverlay isPowerMode={logic.comboState.isPowerMode} />

      {logic.showSummary && (
        <SessionSummary
          moodHistory={logic.moodHistory.current}
          sessionDuration={(Date.now() - logic.sessionStart.current) / 1000}
          resonance={logic.resonance}
          score={logic.scoreState.currentScore}
          highScore={logic.scoreState.highScore}
          maxCombo={logic.comboState.maxCombo}
          powerBursts={logic.powerBursts.current}
          onRestart={logic.handleRestart}
        />
      )}
    </>
  );
}
