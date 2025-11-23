import Phaser from 'phaser';
import {
  COLORS,
  GAME_WIDTH,
  GAME_HEIGHT,
  CHARACTERS,
  gameConfig
} from '../core/config';
import {
  GameState,
  Monster,
  QuestionType
} from '../core/types';
import { generateQuestion } from '../core/questionGenerator';

export class GameScene extends Phaser.Scene {
  private gameState: GameState;
  private hudContainer!: Phaser.GameObjects.Container;
  private questionContainer!: Phaser.GameObjects.Container;
  private helpOverlay!: Phaser.GameObjects.Container;
  private heartSprites: Phaser.GameObjects.Text[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private monsterGroup!: Phaser.GameObjects.Group;
  private owlbertDialog!: Phaser.GameObjects.Container;
  private answerButtons: Phaser.GameObjects.Container[] = [];
  private objectDisplay: Phaser.GameObjects.Text[] = [];
  private spawnTimer?: Phaser.Time.TimerEvent;
  private helpButton!: Phaser.GameObjects.Container;
  private questionText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });

    this.gameState = {
      mode: 'counting',
      score: 0,
      hearts: gameConfig.player.startingHearts,
      streak: 0,
      currentQuestion: null,
      monsters: [],
      isPaused: false,
      isHelpActive: false,
      helpUsedForCurrentQuestion: false,
      level: 1,
      monstersDefeated: 0,
    };
  }

  init(data: { mode: QuestionType; level?: number; score?: number }): void {
    this.gameState.mode = data.mode || 'counting';
    this.gameState.hearts = gameConfig.player.startingHearts;
    this.gameState.score = data.score || 0;
    this.gameState.streak = 0;
    this.gameState.level = data.level || 1;
    this.gameState.monstersDefeated = 0;
    this.gameState.monsters = [];
    this.gameState.isPaused = false;
    this.gameState.isHelpActive = false;
    this.gameState.currentQuestion = null;
    this.gameState.helpUsedForCurrentQuestion = false;
  }

  create(): void {
    // Create background
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      COLORS.background,
      COLORS.background,
      0x98D8E8,
      0x98D8E8,
      1
    );
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw castle
    this.drawCastle();

    // Draw lanes
    this.drawLanes();

    // Create monster group
    this.monsterGroup = this.add.group();

    // Create HUD
    this.createHUD();

    // Create question panel
    this.createQuestionPanel();

    // Create help overlay (initially hidden)
    this.createHelpOverlay();

    // Create Owlbert dialog (initially hidden)
    this.createOwlbertDialog();

    // Start spawning monsters
    this.startMonsterSpawning();

    // Generate first question
    this.generateNewQuestion();
  }

  update(_time: number, delta: number): void {
    if (this.gameState.isPaused || this.gameState.isHelpActive) {
      return;
    }

    // Update monsters
    this.gameState.monsters.forEach((monster, index) => {
      if (monster.sprite.active) {
        monster.sprite.x -= (monster.speed * delta) / 1000;

        // Check if monster reached castle
        if (monster.sprite.x <= gameConfig.lanes.endX) {
          this.monsterReachedCastle(monster, index);
        }
      }
    });
  }

  private drawCastle(): void {
    // Simple castle representation
    this.add.text(
      gameConfig.lanes.endX,
      GAME_HEIGHT * 0.3,
      CHARACTERS.castle,
      { fontSize: '120px' }
    ).setOrigin(0.5);

    // Add simple castle base
    this.add.rectangle(
      gameConfig.lanes.endX,
      GAME_HEIGHT * 0.45,
      100,
      200,
      0x8B7355,
      0.8
    );
  }

  private drawLanes(): void {
    // Draw lane lines
    const laneGraphics = this.add.graphics();
    laneGraphics.lineStyle(2, 0xffffff, 0.3);

    gameConfig.lanes.yPositions.forEach(y => {
      laneGraphics.moveTo(gameConfig.lanes.endX + 50, y);
      laneGraphics.lineTo(gameConfig.lanes.startX, y);
      laneGraphics.strokePath();
    });
  }

  private createHUD(): void {
    this.hudContainer = this.add.container(0, 0);
    this.heartSprites = []; // Clear old references on scene restart

    // Hearts
    for (let i = 0; i < gameConfig.player.maxHearts; i++) {
      const heart = this.add.text(
        50 + i * 40,
        30,
        '❤️',
        { fontSize: '32px' }
      );
      this.heartSprites.push(heart);
      this.hudContainer.add(heart);
    }

    // Score
    this.scoreText = this.add.text(
      GAME_WIDTH - 200,
      30,
      'Score: 0',
      {
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#333333',
        strokeThickness: 2
      }
    );
    this.hudContainer.add(this.scoreText);

    // Streak
    this.streakText = this.add.text(
      GAME_WIDTH - 200,
      60,
      'Streak: 0',
      {
        fontSize: '20px',
        color: '#ffffff',
        stroke: '#333333',
        strokeThickness: 2
      }
    );
    this.hudContainer.add(this.streakText);

    // Level
    this.levelText = this.add.text(
      GAME_WIDTH / 2,
      30,
      `Level ${this.gameState.level}`,
      {
        fontSize: '28px',
        color: '#ffffff',
        stroke: '#333333',
        strokeThickness: 3,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    this.hudContainer.add(this.levelText);
  }

  private createQuestionPanel(): void {
    const panelY = GAME_HEIGHT - gameConfig.ui.questionPanelHeight;
    this.answerButtons = []; // Clear old references on scene restart
    this.objectDisplay = []; // Clear old references on scene restart

    // Create panel background
    const panelBg = this.add.rectangle(
      GAME_WIDTH / 2,
      panelY + gameConfig.ui.questionPanelHeight / 2,
      GAME_WIDTH,
      gameConfig.ui.questionPanelHeight,
      COLORS.panel,
      0.95
    );

    this.questionContainer = this.add.container(0, panelY);
    this.questionContainer.add(panelBg);

    // Question text area
    this.questionText = this.add.text(
      GAME_WIDTH / 2,
      50,
      '',
      {
        fontSize: '32px',
        color: '#333333',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    this.questionContainer.add(this.questionText);

    // Object display area (for visual counting)
    const objectArea = this.add.container(GAME_WIDTH / 2, 120);
    this.questionContainer.add(objectArea);

    // Answer buttons area
    const buttonY = 220;
    for (let i = 0; i < 3; i++) {
      const buttonX = GAME_WIDTH / 2 + (i - 1) * 150;
      const button = this.createAnswerButton(buttonX, buttonY, i);
      this.answerButtons.push(button);
      this.questionContainer.add(button);
    }

    // Help button
    this.helpButton = this.createHelpButton();
    this.questionContainer.add(this.helpButton);
  }

  private createAnswerButton(x: number, y: number, index: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 120, 120, COLORS.primary)
      .setInteractive()
      .on('pointerover', () => !this.gameState.isHelpActive && bg.setFillStyle(COLORS.secondary))
      .on('pointerout', () => bg.setFillStyle(COLORS.primary));

    const text = this.add.text(0, 0, '', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setData('index', index);
    container.setVisible(false);

    return container;
  }

  private createHelpButton(): Phaser.GameObjects.Container {
    const container = this.add.container(GAME_WIDTH / 2, 320);

    const bg = this.add.rectangle(0, 0, 200, 60, COLORS.warning)
      .setInteractive()
      .on('pointerover', () => !this.gameState.isHelpActive && bg.setFillStyle(COLORS.secondary))
      .on('pointerout', () => bg.setFillStyle(COLORS.warning))
      .on('pointerdown', () => this.activateHelp());

    const text = this.add.text(0, 0, 'Help me count', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, text]);
    return container;
  }

  private createHelpOverlay(): void {
    this.helpOverlay = this.add.container(0, 0);
    this.helpOverlay.setVisible(false);

    // Semi-transparent background
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.7
    );
    this.helpOverlay.add(overlay);

    // Help content area
    const helpPanel = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH * 0.8,
      GAME_HEIGHT * 0.6,
      COLORS.panel,
      0.95
    ).setStrokeStyle(4, COLORS.primary);
    this.helpOverlay.add(helpPanel);

    // Help text
    const helpText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 150,
      "Let's count together!",
      {
        fontSize: '32px',
        color: '#333333',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    this.helpOverlay.add(helpText);

    // Object display for help
    const helpObjectArea = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.helpOverlay.add(helpObjectArea);

    // Continue button
    const continueBtn = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 150,
      200,
      60,
      COLORS.success
    ).setInteractive()
      .on('pointerdown', () => this.deactivateHelp());

    const continueText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 150,
      'Continue',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    this.helpOverlay.add([continueBtn, continueText]);
  }

  private createOwlbertDialog(): void {
    this.owlbertDialog = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 400);
    this.owlbertDialog.setVisible(false);

    const dialogBg = this.add.rectangle(0, 0, 400, 100, COLORS.panel, 0.95)
      .setStrokeStyle(3, COLORS.primary);

    const owlbert = this.add.text(-170, 0, CHARACTERS.owlbert, { fontSize: '40px' })
      .setOrigin(0.5);

    const dialogText = this.add.text(20, 0, '', {
      fontSize: '18px',
      color: '#333333',
      wordWrap: { width: 300 }
    }).setOrigin(0.5);

    this.owlbertDialog.add([dialogBg, owlbert, dialogText]);
  }

  private showOwlbertMessage(message: string, duration: number = 2000): void {
    const text = this.owlbertDialog.getAt(2) as Phaser.GameObjects.Text;
    text.setText(message);
    this.owlbertDialog.setVisible(true);

    this.time.delayedCall(duration, () => {
      this.owlbertDialog.setVisible(false);
    });
  }

  private startMonsterSpawning(): void {
    this.spawnTimer = this.time.addEvent({
      delay: gameConfig.monsters.spawnDelay,
      callback: () => this.spawnMonster(),
      callbackScope: this,
      loop: true
    });

    // Spawn first monster immediately
    this.spawnMonster();
  }

  private spawnMonster(): void {
    if (this.gameState.monsters.length >= 3) return; // Max 3 monsters at once

    const lane = Phaser.Math.Between(0, 2);
    const monsterTypes: Array<Monster['type']> = ['giggle_ghost', 'grumpy_growler', 'pumpkin_puff'];
    const type = Phaser.Utils.Array.GetRandom(monsterTypes);

    const sprite = this.add.text(
      gameConfig.lanes.startX,
      gameConfig.lanes.yPositions[lane],
      CHARACTERS.monsters[type],
      { fontSize: '48px' }
    ).setOrigin(0.5);

    const monster: Monster = {
      id: `monster_${Date.now()}`,
      sprite,
      lane,
      speed: gameConfig.monsters.baseSpeed,
      health: 1,
      type
    };

    this.gameState.monsters.push(monster);
    this.monsterGroup.add(sprite);
  }

  private generateNewQuestion(): void {
    const difficulty = Math.floor(this.gameState.level / 5) + 1;
    this.gameState.currentQuestion = generateQuestion(this.gameState.mode, difficulty);
    this.gameState.helpUsedForCurrentQuestion = false;
    this.displayQuestion();
  }

  private displayQuestion(): void {
    if (!this.gameState.currentQuestion) return;

    const question = this.gameState.currentQuestion;

    // Update question text
    this.questionText.setText(question.promptText);

    // Display objects
    const objectArea = this.questionContainer.getAt(2) as Phaser.GameObjects.Container;
    objectArea.removeAll(true);
    this.objectDisplay = [];

    const totalCount = question.objects.groupA.count + (question.objects.groupB?.count || 0);
    const startX = -(totalCount * 30) / 2;

    // Display group A
    for (let i = 0; i < question.objects.groupA.count; i++) {
      const obj = this.add.text(
        startX + i * 35,
        0,
        question.objects.groupA.emoji,
        { fontSize: '36px' }
      ).setOrigin(0.5);
      objectArea.add(obj);
      this.objectDisplay.push(obj);
    }

    // Display group B (if addition)
    if (question.objects.groupB) {
      // Add visual separator
      const plus = this.add.text(
        startX + question.objects.groupA.count * 35,
        0,
        '+',
        { fontSize: '36px', color: '#333333' }
      ).setOrigin(0.5);
      objectArea.add(plus);

      for (let i = 0; i < question.objects.groupB.count; i++) {
        const obj = this.add.text(
          startX + (question.objects.groupA.count + 1 + i) * 35,
          0,
          question.objects.groupB.emoji,
          { fontSize: '36px' }
        ).setOrigin(0.5);
        objectArea.add(obj);
        this.objectDisplay.push(obj);
      }
    }

    // Update answer buttons
    question.choices.forEach((choice, index) => {
      if (index < this.answerButtons.length) {
        const button = this.answerButtons[index];
        button.setVisible(true);
        const text = button.getAt(1) as Phaser.GameObjects.Text;
        text.setText(choice.toString());

        const bg = button.getAt(0) as Phaser.GameObjects.Rectangle;
        bg.removeAllListeners('pointerdown');
        bg.on('pointerdown', () => this.checkAnswer(choice));
      }
    });

    // Update help button text
    const helpText = this.helpButton.getAt(1) as Phaser.GameObjects.Text;
    helpText.setText(question.type === 'counting' ? 'Help me count' : 'Help me add');
  }

  private checkAnswer(answer: number): void {
    if (!this.gameState.currentQuestion || this.gameState.isHelpActive) return;

    if (answer === this.gameState.currentQuestion.correctAnswer) {
      this.handleCorrectAnswer();
    } else {
      this.handleIncorrectAnswer();
    }
  }

  private handleCorrectAnswer(): void {
    // Update score and streak
    this.gameState.score += 10;
    this.gameState.streak++;
    this.updateHUD();

    // Show success message
    this.showOwlbertMessage('Great job! That\'s correct!');

    // Destroy nearest monster
    if (this.gameState.monsters.length > 0) {
      const monster = this.gameState.monsters[0];
      this.destroyMonster(monster, 0);
    }

    // Generate new question
    this.time.delayedCall(1500, () => {
      this.generateNewQuestion();
    });
  }

  private handleIncorrectAnswer(): void {
    // Reset streak
    this.gameState.streak = 0;
    this.updateHUD();

    // Show encouragement
    this.showOwlbertMessage('Nice try! Let\'s count together.');

    // Pulse help button
    const helpButton = this.questionContainer.getAt(6) as Phaser.GameObjects.Container;
    this.tweens.add({
      targets: helpButton,
      scale: 1.2,
      duration: 300,
      yoyo: true,
      repeat: 2
    });
  }

  private activateHelp(): void {
    if (this.gameState.isHelpActive || !this.gameState.currentQuestion) return;

    this.gameState.isHelpActive = true;
    this.gameState.isPaused = true;
    this.helpOverlay.setVisible(true);

    // Animate counting
    this.animateHelpCounting();
  }

  private animateHelpCounting(): void {
    if (!this.gameState.currentQuestion) return;

    const question = this.gameState.currentQuestion;
    const helpObjectArea = this.helpOverlay.getAt(3) as Phaser.GameObjects.Container;
    helpObjectArea.removeAll(true);

    const totalCount = question.objects.groupA.count + (question.objects.groupB?.count || 0);
    const objects: Phaser.GameObjects.Text[] = [];
    const numbers: Phaser.GameObjects.Text[] = [];

    // Create objects for help display
    const startX = -(totalCount * 50) / 2;

    // Group A objects
    for (let i = 0; i < question.objects.groupA.count; i++) {
      const obj = this.add.text(
        startX + i * 55,
        0,
        question.objects.groupA.emoji,
        { fontSize: '48px' }
      ).setOrigin(0.5).setAlpha(0.3);
      helpObjectArea.add(obj);
      objects.push(obj);

      const num = this.add.text(
        startX + i * 55,
        -40,
        '',
        { fontSize: '32px', color: '#333333', fontStyle: 'bold' }
      ).setOrigin(0.5);
      helpObjectArea.add(num);
      numbers.push(num);
    }

    // Group B objects (if addition)
    if (question.objects.groupB) {
      for (let i = 0; i < question.objects.groupB.count; i++) {
        const obj = this.add.text(
          startX + (question.objects.groupA.count + i) * 55,
          0,
          question.objects.groupB.emoji,
          { fontSize: '48px' }
        ).setOrigin(0.5).setAlpha(0.3);
        helpObjectArea.add(obj);
        objects.push(obj);

        const num = this.add.text(
          startX + (question.objects.groupA.count + i) * 55,
          -40,
          '',
          { fontSize: '32px', color: '#333333', fontStyle: 'bold' }
        ).setOrigin(0.5);
        helpObjectArea.add(num);
        numbers.push(num);
      }
    }

    // Animate counting
    let currentIndex = 0;
    this.time.addEvent({
      delay: 600,
      callback: () => {
        if (currentIndex < objects.length) {
          objects[currentIndex].setAlpha(1);
          objects[currentIndex].setScale(1.3);
          numbers[currentIndex].setText((currentIndex + 1).toString());

          this.tweens.add({
            targets: objects[currentIndex],
            scale: 1,
            duration: 200
          });

          currentIndex++;
        }
      },
      repeat: objects.length - 1
    });
  }

  private deactivateHelp(): void {
    this.gameState.isHelpActive = false;
    this.gameState.isPaused = false;
    this.helpOverlay.setVisible(false);
    this.gameState.helpUsedForCurrentQuestion = true;
  }

  private destroyMonster(monster: Monster, index: number): void {
    // Create destruction effect
    this.tweens.add({
      targets: monster.sprite,
      scale: 0,
      rotation: Math.PI * 2,
      duration: 500,
      onComplete: () => {
        monster.sprite.destroy();
      }
    });

    // Remove from array
    this.gameState.monsters.splice(index, 1);
    this.gameState.monstersDefeated++;

    // Check for level complete
    if (this.gameState.monstersDefeated >= 10) {
      this.levelComplete();
    }
  }

  private monsterReachedCastle(monster: Monster, index: number): void {
    // Monster reached castle - lose a heart
    this.gameState.hearts--;
    this.updateHUD();

    // Destroy monster
    monster.sprite.destroy();
    this.gameState.monsters.splice(index, 1);

    // Check game over
    if (this.gameState.hearts <= 0) {
      this.gameOver();
    } else {
      this.showOwlbertMessage('Oh no! A shadow got through!');
    }
  }

  private updateHUD(): void {
    // Update hearts display
    this.heartSprites.forEach((heart, index) => {
      heart.setAlpha(index < this.gameState.hearts ? 1 : 0.3);
    });

    // Update score
    this.scoreText.setText(`Score: ${this.gameState.score}`);

    // Update streak
    this.streakText.setText(`Streak: ${this.gameState.streak}`);

    // Update level
    this.levelText.setText(`Level ${this.gameState.level}`);
  }

  private levelComplete(): void {
    this.gameState.isPaused = true;

    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }

    // Unlock addition mode if counting mode completed
    if (this.gameState.mode === 'counting' && this.gameState.level >= 1) {
      localStorage.setItem('mathHero_additionUnlocked', 'true');
    }

    // Show level complete message
    const completeText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 50,
      `Level ${this.gameState.level} Complete!`,
      {
        fontSize: '64px',
        color: '#ffffff',
        stroke: '#333333',
        strokeThickness: 4
      }
    ).setOrigin(0.5);

    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 50,
      `Score: ${this.gameState.score}`,
      {
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#333333',
        strokeThickness: 3
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: completeText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Increment level and reset monsters defeated counter
    this.gameState.level++;
    this.gameState.monstersDefeated = 0;

    this.time.delayedCall(3000, () => {
      // Restart the game scene with updated state
      this.scene.restart({
        mode: this.gameState.mode,
        level: this.gameState.level,
        score: this.gameState.score
      });
    });
  }

  private gameOver(): void {
    this.gameState.isPaused = true;

    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }

    // Show game over message
    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      'Great effort, Hero!',
      {
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#333333',
        strokeThickness: 4
      }
    ).setOrigin(0.5);

    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 80,
      `Score: ${this.gameState.score}\nMonsters Stopped: ${this.gameState.monstersDefeated}`,
      {
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#333333',
        strokeThickness: 2,
        align: 'center'
      }
    ).setOrigin(0.5);

    this.time.delayedCall(4000, () => {
      this.scene.start('TitleScene');
    });
  }
}