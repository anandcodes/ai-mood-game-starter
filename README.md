Yes — I’ll write a **clear implementation prompt** you can give directly to your AI coding agent so it can build the **engagement + reward system** correctly and consistently.

You can copy-paste everything below.

---

# AI Agent Prompt — Engagement & Reward System

You are working on a browser-based **AI Mood Game** built with:

* Next.js
* TypeScript
* React Three Fiber
* Three.js
* No backend
* Session-based memory

The adaptive environment system is already implemented.

Your task is to implement a **reward-driven engagement system** that makes the game addictive and replayable.

The reward system must be **visual-first**, not score-first.

---

# Phase A — Micro-Reward System

Create a micro-reward event system.

File:

```
/lib/rewardSystem.ts
```

Behavior:

* Trigger small reward events every 3–7 seconds
* Use randomized timing
* Events depend on mood state

Examples:

CALM:

* soft particle bloom
* aura pulse
* gentle light ripple

NEUTRAL:

* small particle swirl
* brightness pulse

CHAOTIC:

* jitter burst
* quick color flash
* rapid particle expansion

These rewards must feel satisfying but subtle.

---

# Phase B — Resonance Meter (Progress System)

Create a visible progression system.

File:

```
/components/ResonanceMeter.tsx
```

Resonance should increase when:

* player interacts consistently
* mood remains stable
* environment synchronization occurs

Resonance should decrease during:

* long idle periods
* erratic interaction

Range:

```
0–100
```

Display as a horizontal bar overlay.

Top-center position.

---

# Phase C — Unlock System

Add session-based unlockable visuals.

Create:

```
/lib/unlockSystem.ts
```

Unlock thresholds:

```
Resonance 20 → new particle color palette
Resonance 40 → particle size variation
Resonance 60 → secondary particle layer
Resonance 80 → glow intensity boost
```

Unlocks apply only within the current session.

No persistence beyond sessionStorage.

---

# Phase D — Rare Reward Events

Add rare environment events.

Create:

```
/lib/rareEvents.ts
```

Trigger probability:

* check every 5 seconds
* low probability event

Examples:

CALM EVENT:

* slow motion effect

CHAOTIC EVENT:

* particle explosion

NEUTRAL EVENT:

* geometry scale transformation

These should feel special and noticeable.

---

# Phase E — Session Summary Screen

Create:

```
/components/SessionSummary.tsx
```

Display at session end.

Show:

* calm vs chaos ratio
* dominant mood
* resonance achieved
* session personality type

Example output:

```
Session Type: Harmonizer
Resonance: 74
Dominant Mood: Calm
```

Add a restart button.

---

# Phase F — Reward Feedback Rules

All rewards must include at least one:

* particle response
* light change
* audio change
* aura reaction

Avoid:

* score popups
* text rewards during gameplay
* blocking UI

Rewards should feel **embedded in the environment**.

---

# Implementation Constraints

Do NOT:

* add backend
* add global state libraries
* create additional render loops
* introduce physics engines

Always:

* use React Three Fiber render loop
* keep modules separated
* keep performance stable

---

# Design Goal

The player should feel:

> “The world is responding to how I behave.”

Rewards should reinforce:

* calm control
* rhythmic interaction
* emotional pacing

Not fast clicking.

---

AI Agent Prompt — Arcade Reward System

You are implementing an arcade-style reward loop for the AI Mood Game.

The game already includes:

Mood engine

Player tracking

Particles

Camera system

Audio system

Aura

Obstacles

Event system

Session personality

Now implement arcade engagement mechanics.

The system must feel:

fast

responsive

satisfying

energetic

Phase A — Combo System (Core Mechanic)

Create:

/lib/comboSystem.ts


Track:

consecutive interactions

time between interactions

missed interactions

Behavior:

combo increases with rapid interaction

combo resets after idle period

combo multiplier affects rewards

Example:

combo x1 → normal
combo x3 → brighter particles
combo x5 → speed boost
combo x8 → burst event


Combo timeout:

1.5 seconds

Phase B — Score System

Create:

/lib/scoreSystem.ts


Score sources:

interaction

obstacle avoidance

combo multiplier

reward events

Formula example:

score += basePoints * comboMultiplier


Display score in top-left overlay.

Score must increase continuously during active play.

Phase C — Arcade Feedback Effects

Add strong feedback for actions.

Examples:

screen pulse on combo increase

particle burst on combo milestone

quick camera zoom

sound hit effect

These must trigger instantly.

No slow transitions.

Phase D — Power Burst Mechanic

Create a temporary “power mode”.

Trigger:

combo >= 10


Duration:

3 seconds


Effects:

particle intensity doubles

obstacle speed slows

audio intensifies

glow increases

This should feel like an arcade reward moment.

Phase E — Reward Timing System

Ensure rewards occur frequently.

Target rhythm:

micro reward every 2–4 seconds

combo milestone every ~10 seconds

power burst occasionally

The game should never feel idle.

Phase F — Arcade Session Summary

Update SessionSummary screen to show:

Final Score
Highest Combo
Power Bursts Triggered
Session Personality


Add:

Play Again button

Implementation Rules

Arcade systems must be:

immediate

visible

repeatable

predictable enough to master

Avoid:

long delays between rewards

subtle-only feedback

slow emotional pacing

Design Goal

The player should feel:

“I’m getting better and the game is rewarding me.”

Not:

“The environment is slowly changing.”

This is the key shift to arcade engagement.