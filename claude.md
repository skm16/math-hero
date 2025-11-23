Here’s a self-contained doc you can hand straight to Claude Code (or drop into a README).

---

# Math Heroes Adventure – Design & Dev Spec

## 0. High-Level Summary

**Working title:** `Math Heroes Adventure`
**Audience:** Kindergarten (ages 4–6)
**Core idea:** A 2D lane-defense game where a child uses **counting** and **simple addition** to power up heroes and stop cute “Silly Shadow” monsters before they reach the Math Castle.

**Primary goals:**

- Teach **counting to 10** and **addition within 5 (later 10)** using strong visual supports.
- Provide a **gentle, kid-friendly gameplay loop** with no real “failure,” just “try again.”
- Run **smoothly in the browser** on low-powered devices, with **offline support**.

**Chosen tech stack:**

- **Phaser 3** (2D game framework)
- **TypeScript**
- **Bundler:** Vite (or similar, e.g., Parcel)
- **PWA:** Service worker + web manifest for offline, installable app

---

## 1. Learning Design

### 1.1 Core Math Skills

Initial release focuses on:

1. **Counting (0–10)**

   - Count objects (dots, apples, bricks, etc.).
   - Match the count to a digit (0–10).

2. **Addition (within 5, then within 10)**

   - Problems like `1 + 2`, `2 + 3`, `4 + 1`.
   - Strong **visual grouping**: 2 objects + 3 objects clearly separated, then combined.

No subtraction, no comparisons in v1 — those can be future worlds.

### 1.2 Visual Support Principles

- Each question shows **concrete objects** (dots, bricks, apples, shells…).
- During help mode:

  - Objects highlight **one by one** with numbers (`1, 2, 3…`) above them.
  - A “finger” or highlight effect models one-to-one counting.
  - For addition, the two groups are visually distinct (e.g., outline or position).

---

## 2. Game Concept & Story

### 2.1 Theme

The child is a **Math Hero** defending the **Math Kingdom** from cute, non-scary **Silly Shadows** moving left toward the castle through **three horizontal lanes**.

**Tone:** bright, silly, encouraging. No scary content.

### 2.2 Characters

**Heroes (bottom area / narrative focus)**

1. **Captain Count (🦸)**

   - Lane 1 hero.
   - Specialty: counting objects.
   - Sample voice line: “I’ll count with you! Ready… 1, 2, 3!”

2. **Wizard Plus (🧙)**

   - Lane 2 hero.
   - Specialty: addition.
   - Voice line: “Plus means we put things together!”

3. **Fairy Minus (🧚)**

   - Reserved for future subtraction expansion (not needed in v1 logic).

**Monsters (top lanes)**

- **Silly Shadows** – silly, harmless enemies.

  - Types: “Giggle Ghosts” (👻), “Grumpy Growlers” (😠), “Pumpkin Puffs” (🎃).
  - Mechanically identical in v1 (just skins / later difficulty).

**Guide / Narrator**

- **Owlbert the Wise (🦉)**

  - Appears in speech bubbles and UI overlays.
  - Explains rules, gives hints, praises the child.
  - Very short, simple sentences.

---

## 3. Game Flow & Storyboards

### 3.1 Game Loop (Per Question / Monster)

One monster at a time per lane, but we don’t need complicated pathfinding – just linear movement.

**Loop:**

1. **Monster Spawns**

   - A Silly Shadow appears at the right end of a lane and begins moving left at a constant slow speed.

2. **Question Appears (Bottom Panel)**

   - Large, clear math prompt + visual objects.
   - 2–3 big tappable answer buttons.

3. **Player Answers**

   - On button tap, check correctness.

4. **On Correct:**

   - Corresponding hero (or any hero) fires a projectile (⭐) at the monster.
   - Monster plays hit animation and disappears.
   - Score increases, streak increases.
   - Owlbert gives a short praise line.
   - Possibly increment power-up meters (rainbow/star).

5. **On Incorrect:**

   - Monster moves a step closer to the castle (or time continues to tick).
   - Hearts may decrement if monster reaches base.
   - Owlbert says something gentle:

     - “Nice try. Let’s count together!”

   - Suggest using **Help** if not already used.

6. **Next Monster**

   - After a short delay, spawn next monster and new question.
   - After N monsters defeated, show mini “Level Up”/result screen.

---

### 3.2 Help System (“Help Me Count” / “Help Me Add”)

A core requirement is a **help button** providing guided strategies:

- Button lives in the bottom question area.
- Two labels:

  - For counting questions: **“Help me count”**
  - For addition questions: **“Help me add”**

- Always visible; pulses if:

  - Player is idle for X seconds, or
  - Player answered incorrectly at least once.

**When clicked:**

- **Pause** monster movement and input on answer buttons.
- Enter a “help overlay” state where we:

  - For counting:

    - Highlight each object one by one.
    - Show `1, 2, 3, …` above them.
    - Owlbert text: “Let’s count slowly together. Touch each one – 1… 2… 3…”

  - For addition (“count all” strategy):

    - Highlight first group and count: “1… 2…”
    - Then second group and continue: “3… 4… 5…”
    - Owlbert: “We keep counting. Don’t start at 1 again.”

- Then re-enable answer buttons on the same question.

**Important:**
Help does _not_ give the answer directly; it walks through the counting.

---

### 3.3 Example Scripts (Text Copy)

#### Opening Intro (First Run Only)

**Scene:** Full screen overlay with characters and castle.

- Owlbert:
  “Hi there, Hero! The Math Kingdom needs your help!”
- Owlbert:
  “Silly Shadows are trying to sneak into the castle.”
- Owlbert:
  “Use your math powers to help your friends: Captain Count and Wizard Plus!”
- Big button: **“I’m ready!”** → transitions to GameScene.

#### Counting Question (No Help)

**Prompt:**
How many blue dots?

- Owlbert: “How many blue dots do you see?”
- Objects: 🔵🔵🔵🔵
- Answer buttons: [3] [4] [5]

On correct:

- Owlbert: “Yes! There are **4** dots. Great counting!”

On incorrect:

- Owlbert: “Nice try. Let’s count them together. You can tap ‘Help me count’ if you want.”

#### Counting Help Script

- Owlbert: “Let’s count together.”
- Highlight each dot in order; display 1, 2, 3, 4 above them.
- Tip text (small): “Tip: Point with your finger and say the numbers out loud.”
- After animation:

  - Owlbert: “How many dots did we count? Choose the number.”

#### Addition Question (No Help)

**Prompt:**
2 + 3 = ?

- Owlbert: “2 bricks plus 3 bricks. How many in all?”
- Objects: 🧱🧱 + 🧱🧱🧱
- Answer buttons: [4] [5] [6]

On correct:

- Owlbert: “Nice job! 2 plus 3 makes 5!”

On incorrect:

- Owlbert: “Good try. Let’s use ‘Help me add’ to see all the bricks.”

#### Addition Help Script – Count All

- Owlbert: “First, we count the bricks in the first group.”

  - Highlight first group: “1… 2.”

- Owlbert: “Now we _keep_ counting the next group.”

  - Highlight second group: “3… 4… 5.”

- Tip text: “Tip: Start at the first group and keep counting. Don’t start at 1 again.”
- Owlbert: “We ended on **5**. How many bricks in all?”

#### Level Up / World Clear

- Owlbert: “Wow! You stopped all the shadows!”
- “You are a **Counting Hero!**”
- Buttons:

  - “Play again”
  - “Try adding” (later to unlock addition mode)

#### Game Over (Soft)

When hearts reach 0:

- Owlbert: “You tried so hard, Hero! Every time you play, your math gets stronger.”
- Show stats: monsters stopped, correct answers, best streak.
- Buttons:

  - “Try again”
  - “Back to main menu”

---

## 4. Difficulty & Progression

For v1, keep progression simple:

- **Mode 1 – Counting Practice**

  - Numbers of objects: 1–5 initially, gradually 1–10 as performance improves.
  - Maybe track a simple “stars” or “badge” metric to unlock addition.

- **Mode 2 – Addition Practice**

  - Start with sums ≤ 5.
  - Optionally extend to sums ≤ 10 as a second tier.

A `progression` module can:

- Keep track of:

  - `mode` (`"counting"` or `"addition"`)
  - `currentDifficulty` (levels)
  - `performance` (recent accuracy, streaks)

- Decide which `QuestionConfig` to generate next.

---

## 5. Tech Stack & Architecture

### 5.1 Tech Stack

- **Language:** TypeScript
- **Game Engine:** Phaser 3
- **Bundler:** Vite
- **Build Target:** Web (desktop + tablet); optimized for tablet usage.
- **Offline:** PWA (service worker + manifest; cache core assets and bundled JS).

### 5.2 Project Structure (Proposed)

```text
math-heroes-adventure/
  package.json
  tsconfig.json
  vite.config.ts

  public/
    index.html
    manifest.webmanifest
    icons/              # PWA icons
    assets/             # Static assets if needed

  src/
    main.ts             # Phaser game config + boot scene start

    core/
      config.ts         # Game constants (dimensions, speeds, etc.)
      types.ts          # Shared TS types
      questionGenerator.ts
      progression.ts    # Unlocking rules / difficulty
      storage.ts        # localStorage for simple persistence

    scenes/
      BootScene.ts
      TitleScene.ts
      ModeSelectScene.ts    # Choose Counting vs Addition
      GameScene.ts          # Main gameplay (lanes, monsters, questions)
      HelpOverlay.ts        # Either separate scene/layer or UI element
      ResultsScene.ts       # Level/round summary

    ui/
      Hud.ts                # Hearts, score, streak
      OwlbertDialog.ts      # Reusable speech bubble system
      Buttons.ts            # Standard button factory (large, kid-friendly)
```

---

## 6. Core Systems (Implementation Notes for Claude Code)

### 6.1 Game Config (core/config.ts)

- Virtual resolution (scaled by Phaser):

  - Example: 1280x720 or 1024x576.

- Zones:

  - **Top** ~60% height: lanes, monsters, castle.
  - **Bottom** ~40% height: question panel + answers + help button.

- Lanes:

  - 3 evenly spaced horizontal lanes.
  - Each lane has a Y coordinate for monster path.

### 6.2 Question Data Structure (core/types.ts)

```ts
export type QuestionType = "counting" | "addition";

export interface Question {
  id: string;
  type: QuestionType;
  promptText: string; // e.g., "How many dots?"
  objects: {
    // For counting, one group; for addition, two groups
    groupA: { emoji: string; count: number };
    groupB?: { emoji: string; count: number }; // Optional unless addition
  };
  correctAnswer: number;
  choices: number[]; // 2–3 answer options
}
```

### 6.3 Question Generator (core/questionGenerator.ts)

- Functions:

```ts
function generateCountingQuestion(maxCount: number): Question;
function generateAdditionQuestion(maxSum: number): Question;
```

- Behavior:

  - Counting: random count from 1..maxCount, random emoji set, generate nearby distractor answers.
  - Addition: pick `a` and `b` such that `a+b <= maxSum`, ensure distinct choices.

### 6.4 GameScene Layout

- On `create()`:

  - Draw / place:

    - Background (World theme; for v1 a single theme is fine).
    - Castle on left.
    - 3 lanes (visual or implicit).
    - Heroes near bottom left or just as decorative avatars.

  - Setup HUD (hearts, score, streak).
  - Setup question panel:

    - Question text field.
    - Object display area.
    - 2–3 big answer buttons.
    - Help button (“Help me count”/“Help me add”).

- Loop for each monster:

  1. Call `spawnMonster()` in a random lane.
  2. Call `setQuestion(currentMode)` and render question.
  3. Listen for answer button clicks:

     - Check correctness.
     - Trigger `handleCorrect()` or `handleIncorrect()`.

  4. If hearts > 0 and monstersRemaining > 0 → repeat.
  5. Else → go to ResultsScene.

### 6.5 Help System Implementation

Options:

1. **Overlay container within GameScene**:

   - A semi-transparent rectangle over question panel.
   - Animated highlight of objects.
   - Temporarily disable answer buttons.
   - After animation ends, remove overlay and re-enable answers.

2. **Separate Phaser Scene (HelpOverlay) rendered above GameScene**:

   - GameScene paused.
   - HelpOverlay runs the animation, then resumes GameScene.

**Key state:**

```ts
let helpUsedForCurrentQuestion = false;
let isHelpActive = false;
```

- Only one help per question by default (or allow multiple, but same logic).
- Help mode is triggered by:

  - Pressing help button explicitly.
  - Optional: auto-trigger after 2 wrong attempts.

### 6.6 Persistence (core/storage.ts)

- Use `localStorage` to store:

  - Last mode played.
  - Highest “badge” achieved (e.g., `counting_easy_cleared`, `addition_easy_cleared`).
  - Simple stats (total monsters defeated, total correct answers).

Not critical for v1, but easy to implement.

---

## 7. PWA Requirements

Claude Code should:

- Add `manifest.webmanifest` with:

  - `name`, `short_name`, `start_url`, `display: "standalone"`.
  - Icons in various sizes.

- Add a **service worker**:

  - Pre-cache core assets and JS bundles on first load.
  - Serve from cache when offline.
  - Simple strategy: “cache first, network fallback” for core files.

- Ensure:

  - `index.html` references the manifest.
  - HTTPS requirement assumed for installability.

---

## 8. Acceptance Criteria

The game is “MVP done” when:

1. **Gameplay**

   - Player can play a full session of:

     - Counting mode (0–5 or 0–10)
     - Addition mode (sum ≤ 5)

   - Monsters move toward castle in 3 lanes.
   - Correct answers destroy monsters; incorrect answers move them closer and eventually cost hearts.

2. **Help System**

   - “Help me count” visually steps through objects with incremental highlighting.
   - “Help me add” visually counts both groups in sequence.
   - During help:

     - Monsters pause.
     - Answer buttons are disabled.

   - After help:

     - Player answers the same question again.

3. **UX / UI**

   - All UI elements are large, tappable, and readable on a tablet.
   - Text uses very short sentences suitable for non-readers + reading parents.

4. **Tech**

   - Built with Phaser 3 + TypeScript.
   - Bundled with Vite (or comparable).
   - PWA: installable on a device, and playable offline after initial load.

5. **Performance**

   - Smooth anims and no crashes on low-end tablet (single monster at a time is fine).
   - No heavy React/DOM rerenders inside the main game loop.
