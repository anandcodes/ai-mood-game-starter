"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * AudioEngine — Phase 5 (fixed)
 *
 * Procedural ambient audio driven by mood using the Web Audio API.
 * No external audio files — everything is generated with oscillators.
 *
 *   CALM    (mood < -25)  → lower volume, deep low-frequency drone, slow modulation
 *   NEUTRAL (-25 … 25)    → medium volume, mid tone, gentle pulse
 *   CHAOTIC (mood > 25)   → higher volume, higher pitch, rapid modulation
 *
 * Audio initializes immediately on mount (component only mounts after user
 * has already clicked "ENTER EXPERIENCE", satisfying browser autoplay policy).
 */

interface AudioEngineProps {
    mood: number;
}

interface AudioNodes {
    ctx: AudioContext;
    osc: OscillatorNode;
    oscGain: GainNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
    osc2: OscillatorNode;
    osc2Gain: GainNode;
    master: GainNode;
}

export default function AudioEngine({ mood }: AudioEngineProps) {
    const nodesRef = useRef<AudioNodes | null>(null);
    const initAttempted = useRef(false);

    // ── Build the audio graph ──────────────────────────────
    const initAudio = useCallback(async () => {
        if (nodesRef.current || initAttempted.current) return;
        initAttempted.current = true;

        try {
            const ctx = new AudioContext();

            // Resume if browser suspended it
            if (ctx.state === "suspended") {
                await ctx.resume();
            }

            // Master gain (overall volume)
            const master = ctx.createGain();
            master.gain.value = 0.15; // start at audible level
            master.connect(ctx.destination);

            // ─── Primary drone oscillator ───
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = 80;

            const oscGain = ctx.createGain();
            oscGain.gain.value = 0.5;
            osc.connect(oscGain);
            oscGain.connect(master);

            // ─── Second harmonic (adds texture) ───
            const osc2 = ctx.createOscillator();
            osc2.type = "triangle";
            osc2.frequency.value = 160;

            const osc2Gain = ctx.createGain();
            osc2Gain.gain.value = 0.2;
            osc2.connect(osc2Gain);
            osc2Gain.connect(master);

            // ─── LFO → tremolo on master ───
            const lfo = ctx.createOscillator();
            lfo.type = "sine";
            lfo.frequency.value = 0.3;

            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 0.08;
            lfo.connect(lfoGain);
            lfoGain.connect(master.gain);

            // Start everything
            osc.start();
            osc2.start();
            lfo.start();

            nodesRef.current = {
                ctx,
                osc,
                oscGain,
                osc2,
                osc2Gain,
                lfo,
                lfoGain,
                master,
            };

            console.log("[AudioEngine] initialized, ctx state:", ctx.state);
        } catch (err) {
            console.warn("[AudioEngine] Failed to initialize:", err);
            initAttempted.current = false; // allow retry
        }
    }, []);

    // ── Initialize immediately on mount ────────────────────
    // This component only renders after user clicks "ENTER EXPERIENCE"
    // which satisfies the browser's user-gesture requirement.
    useEffect(() => {
        initAudio();

        // Also try on next click in case first attempt was blocked
        const retryOnClick = () => {
            if (!nodesRef.current) {
                initAttempted.current = false;
                initAudio();
            } else if (nodesRef.current.ctx.state === "suspended") {
                nodesRef.current.ctx.resume();
            }
        };

        window.addEventListener("click", retryOnClick);
        window.addEventListener("keydown", retryOnClick);

        return () => {
            window.removeEventListener("click", retryOnClick);
            window.removeEventListener("keydown", retryOnClick);
        };
    }, [initAudio]);

    // ── Update audio parameters based on mood ─────────────
    useEffect(() => {
        const nodes = nodesRef.current;
        if (!nodes) return;

        const { ctx, osc, osc2, lfo, lfoGain, master } = nodes;

        // Make sure context is running
        if (ctx.state === "suspended") {
            ctx.resume();
        }

        const t = ctx.currentTime;
        const ramp = 0.4; // 400ms smooth ramp

        // ── Frequency ──
        let baseFreq: number;
        if (mood < -25) {
            baseFreq = mapRange(mood, -100, -25, 55, 80);
        } else if (mood > 25) {
            baseFreq = mapRange(mood, 25, 100, 120, 220);
        } else {
            baseFreq = mapRange(mood, -25, 25, 80, 120);
        }

        osc.frequency.linearRampToValueAtTime(baseFreq, t + ramp);
        osc2.frequency.linearRampToValueAtTime(baseFreq * 2.01, t + ramp);

        // ── LFO speed ──
        const lfoFreq = mood > 25
            ? mapRange(mood, 25, 100, 1.0, 3.5)
            : mood < -25
                ? mapRange(mood, -100, -25, 0.2, 0.5)
                : mapRange(mood, -25, 25, 0.5, 1.0);

        lfo.frequency.linearRampToValueAtTime(lfoFreq, t + ramp);

        // ── LFO depth ──
        const lfoDepth = mood > 25
            ? mapRange(mood, 25, 100, 0.08, 0.2)
            : mood < -25
                ? mapRange(mood, -100, -25, 0.04, 0.08)
                : 0.08;

        lfoGain.gain.linearRampToValueAtTime(lfoDepth, t + ramp);

        // ── Master volume (increased for audibility) ──
        const vol = mood > 25
            ? mapRange(mood, 25, 100, 0.25, 0.45)
            : mood < -25
                ? mapRange(mood, -100, -25, 0.10, 0.20)
                : mapRange(mood, -25, 25, 0.20, 0.25);

        master.gain.linearRampToValueAtTime(vol, t + ramp);
    }, [mood]);

    // ── Cleanup on unmount ─────────────────────────────────
    useEffect(() => {
        return () => {
            const nodes = nodesRef.current;
            if (nodes) {
                try {
                    nodes.osc.stop();
                    nodes.osc2.stop();
                    nodes.lfo.stop();
                    nodes.ctx.close();
                } catch {
                    // ignore errors during cleanup
                }
                nodesRef.current = null;
                initAttempted.current = false;
            }
        };
    }, []);

    return null;
}

// ── Utility ──────────────────────────────────────────────
function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    const t = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
    return outMin + t * (outMax - outMin);
}
