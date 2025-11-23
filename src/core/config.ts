import { GameConfig } from './types';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const gameConfig: GameConfig = {
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  lanes: {
    count: 3,
    // Top 60% of screen for lanes
    yPositions: [
      GAME_HEIGHT * 0.15,  // Lane 1
      GAME_HEIGHT * 0.3,   // Lane 2
      GAME_HEIGHT * 0.45,  // Lane 3
    ],
    startX: GAME_WIDTH - 50,
    endX: 100, // Castle position
  },
  monsters: {
    baseSpeed: 50, // pixels per second
    spawnDelay: 3000, // ms between spawns
  },
  player: {
    maxHearts: 3,
    startingHearts: 3,
  },
  ui: {
    questionPanelHeight: GAME_HEIGHT * 0.4, // Bottom 40%
    buttonSize: 120,
    fontSize: {
      question: 32,
      button: 48,
      hud: 24,
      dialog: 20,
    },
  },
};

// Visual object sets for questions
export const OBJECT_EMOJIS = {
  counting: ['🔵', '🔴', '🟢', '🟡', '⭐', '❤️', '🌟', '🎈', '🍎', '🍊'],
  addition: ['🧱', '🎯', '🎾', '⚽', '🏀', '🎨', '🎪', '🎭', '🎪', '🎯'],
};

// Colors and theme
export const COLORS = {
  primary: 0x4FC3F7,
  secondary: 0x81C784,
  danger: 0xE57373,
  warning: 0xFFB74D,
  success: 0x4CAF50,
  background: 0x87CEEB,
  panel: 0xFFFFFF,
  text: 0x333333,
  textLight: 0xFFFFFF,
};

// Character emojis for display
export const CHARACTERS = {
  captain_count: '🦸',
  wizard_plus: '🧙',
  fairy_minus: '🧚',
  owlbert: '🦉',
  castle: '🏰',
  monsters: {
    giggle_ghost: '👻',
    grumpy_growler: '😠',
    pumpkin_puff: '🎃',
  },
};

// Sound keys (for future implementation)
export const SOUNDS = {
  correct: 'correct',
  incorrect: 'incorrect',
  monsterHit: 'monster_hit',
  buttonClick: 'button_click',
  levelUp: 'level_up',
  gameOver: 'game_over',
};