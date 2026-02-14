/**
 * sfxEngine — Phase C
 *
 * Synthesizes transient arcade sound effects without external files.
 * Provides immediate feedback for:
 * - Click/Hit: Short high pluck
 * - Combo Milestone: Ascending arpeggio
 * - Power Mode: Sustained resonance or sweep
 * - Score: Tiny blip
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

// Ensure context is initialized
function ensureContext() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.3; // Default volume
        masterGain.connect(audioCtx.destination);
    } else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

export function playClickSound(intensity = 0.5) {
    ensureContext();
    if (!audioCtx || !masterGain) return;

    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400 + Math.random() * 200, audioCtx.currentTime); // 400-600Hz
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

    env.gain.setValueAtTime(intensity, audioCtx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    osc.connect(env);
    env.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}

export function playComboSound(comboCount: number) {
    ensureContext();
    if (!audioCtx || !masterGain) return;

    // Ascending pitch based on combo
    const freq = 300 + Math.min(comboCount, 20) * 50;

    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Power chords for high combo?
    if (comboCount >= 10) {
        osc.type = 'sawtooth';
        env.gain.setValueAtTime(0.4, audioCtx.currentTime);
        env.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 0.1);
        env.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    } else {
        env.gain.setValueAtTime(0.3, audioCtx.currentTime);
        env.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    }

    osc.connect(env);
    env.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
}

export function playPowerBurstSound() {
    ensureContext();
    if (!audioCtx || !masterGain) return;

    // Huge sweep
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.4); // Rise up
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 2.0); // Crash down

    env.gain.setValueAtTime(0.5, audioCtx.currentTime);
    env.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.2);
    env.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2.0);

    osc.connect(env);
    env.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 2.1);
}
