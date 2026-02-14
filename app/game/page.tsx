"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const GameCanvas = dynamic(() => import("@/components/GameCanvas"), { ssr: false });
import IntroScreen from "@/components/IntroScreen";
import { AccessibilityProvider } from "@/components/Accessibility";

export default function GamePage() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <AccessibilityProvider>
      <main style={{ width: "100vw", height: "100vh", background: "#000" }}>
        <GameCanvas started={gameStarted} />
        {!gameStarted && (
          <IntroScreen onStart={() => setGameStarted(true)} />
        )}
      </main>
    </AccessibilityProvider>
  );
}
