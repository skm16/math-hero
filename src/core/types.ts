export type QuestionType = 'counting' | 'addition';

export interface ObjectGroup {
  emoji: string;
  count: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  promptText: string;
  objects: {
    groupA: ObjectGroup;
    groupB?: ObjectGroup; // Optional for counting questions
  };
  correctAnswer: number;
  choices: number[];
}

export interface Monster {
  id: string;
  sprite: Phaser.GameObjects.Sprite;
  lane: number;
  speed: number;
  health: number;
  type: 'giggle_ghost' | 'grumpy_growler' | 'pumpkin_puff';
}

export interface GameState {
  mode: QuestionType;
  score: number;
  hearts: number;
  streak: number;
  currentQuestion: Question | null;
  monsters: Monster[];
  isPaused: boolean;
  isHelpActive: boolean;
  helpUsedForCurrentQuestion: boolean;
  level: number;
  monstersDefeated: number;
}

export interface GameConfig {
  width: number;
  height: number;
  lanes: {
    count: number;
    yPositions: number[];
    startX: number;
    endX: number;
  };
  monsters: {
    baseSpeed: number;
    spawnDelay: number;
  };
  player: {
    maxHearts: number;
    startingHearts: number;
  };
  ui: {
    questionPanelHeight: number;
    buttonSize: number;
    fontSize: {
      question: number;
      button: number;
      hud: number;
      dialog: number;
    };
  };
}