import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, CHARACTERS } from '../core/config';

export class TitleScene extends Phaser.Scene {
  private firstTime: boolean = false;

  constructor() {
    super({ key: 'TitleScene' });
  }

  init(data: { firstTime: boolean }): void {
    this.firstTime = data.firstTime || false;
  }

  create(): void {
    // Create gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      COLORS.background,
      COLORS.background,
      0x98D8E8,
      0x98D8E8,
      1
    );
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (this.firstTime) {
      this.showIntro();
    } else {
      this.showMainMenu();
    }
  }

  private showIntro(): void {
    // Owlbert introduction
    const owlbertText = this.add.text(
      GAME_WIDTH / 2,
      100,
      CHARACTERS.owlbert,
      { fontSize: '80px' }
    ).setOrigin(0.5);

    const introTexts = [
      "Hi there, Hero! The Math Kingdom needs your help!",
      "Silly Shadows are trying to sneak into the castle.",
      "Use your math powers to help Captain Count and Wizard Plus!"
    ];

    let currentText = 0;
    const dialogBox = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH * 0.8,
      150,
      COLORS.panel,
      0.95
    ).setStrokeStyle(4, COLORS.primary);

    const dialogText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      introTexts[0],
      {
        fontSize: '24px',
        color: '#333333',
        wordWrap: { width: GAME_WIDTH * 0.7 },
        align: 'center'
      }
    ).setOrigin(0.5);

    const nextButton = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 100,
      200,
      60,
      COLORS.primary
    ).setInteractive()
      .on('pointerover', () => nextButton.setFillStyle(COLORS.secondary))
      .on('pointerout', () => nextButton.setFillStyle(COLORS.primary));

    const buttonText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 100,
      'Next',
      {
        fontSize: '28px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    nextButton.on('pointerdown', () => {
      currentText++;
      if (currentText < introTexts.length) {
        dialogText.setText(introTexts[currentText]);
      } else {
        buttonText.setText("I'm ready!");
        nextButton.off('pointerdown');
        nextButton.on('pointerdown', () => {
          localStorage.setItem('mathHero_hasPlayed', 'true');
          this.showMainMenu();
          // Clean up intro elements
          owlbertText.destroy();
          dialogBox.destroy();
          dialogText.destroy();
          nextButton.destroy();
          buttonText.destroy();
        });
      }
    });
  }

  private showMainMenu(): void {
    // Title
    this.add.text(
      GAME_WIDTH / 2,
      150,
      'Math Heroes Adventure',
      {
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#333333',
        strokeThickness: 4
      }
    ).setOrigin(0.5);

    // Characters display
    const characters = [
      { emoji: CHARACTERS.captain_count, name: 'Captain Count', x: GAME_WIDTH * 0.25 },
      { emoji: CHARACTERS.wizard_plus, name: 'Wizard Plus', x: GAME_WIDTH * 0.5 },
      { emoji: CHARACTERS.castle, name: 'Math Castle', x: GAME_WIDTH * 0.75 }
    ];

    characters.forEach(char => {
      this.add.text(char.x, 300, char.emoji, { fontSize: '72px' })
        .setOrigin(0.5);
      this.add.text(char.x, 380, char.name, {
        fontSize: '18px',
        color: '#333333'
      }).setOrigin(0.5);
    });

    // Mode selection buttons
    this.createButton(
      GAME_WIDTH / 2 - 150,
      500,
      250,
      80,
      'Counting\n(1-5)',
      () => this.startGame('counting')
    );

    this.createButton(
      GAME_WIDTH / 2 + 150,
      500,
      250,
      80,
      'Addition\n(sums to 5)',
      () => this.startGame('addition')
    );

    // Add "locked" overlay if addition not unlocked yet
    const additionUnlocked = localStorage.getItem('mathHero_additionUnlocked');
    if (!additionUnlocked) {
      this.add.rectangle(
        GAME_WIDTH / 2 + 150,
        500,
        250,
        80,
        0x000000,
        0.5
      );
      this.add.text(
        GAME_WIDTH / 2 + 150,
        500,
        '🔒',
        { fontSize: '48px' }
      ).setOrigin(0.5);
    }
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Rectangle {
    const button = this.add.rectangle(x, y, width, height, COLORS.primary)
      .setInteractive()
      .on('pointerover', () => button.setFillStyle(COLORS.secondary))
      .on('pointerout', () => button.setFillStyle(COLORS.primary))
      .on('pointerdown', callback);

    this.add.text(x, y, text, {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    return button;
  }

  private startGame(mode: 'counting' | 'addition'): void {
    this.scene.start('GameScene', { mode });
  }
}