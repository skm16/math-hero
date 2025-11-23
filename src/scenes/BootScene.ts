import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../core/config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(GAME_WIDTH / 2 - 160, GAME_HEIGHT / 2 - 25, 320, 50);

    const loadingText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 50,
      'Loading...',
      {
        font: '20px monospace',
        color: '#ffffff',
      }
    ).setOrigin(0.5, 0.5);

    const percentText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      '0%',
      {
        font: '18px monospace',
        color: '#ffffff',
      }
    ).setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      percentText.setText(`${Math.round(value * 100)}%`);
      progressBar.clear();
      progressBar.fillStyle(COLORS.primary, 1);
      progressBar.fillRect(
        GAME_WIDTH / 2 - 150,
        GAME_HEIGHT / 2 - 15,
        300 * value,
        30
      );
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // For now, we're using emojis instead of loading actual assets
    // In a production version, you'd load sprites, audio, etc. here
  }

  create(): void {
    // Hide the HTML loading element
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }

    // Check if this is the first time playing
    const hasPlayedBefore = localStorage.getItem('mathHero_hasPlayed');

    if (!hasPlayedBefore) {
      // Show intro scene on first play
      this.scene.start('TitleScene', { firstTime: true });
    } else {
      // Go directly to title scene
      this.scene.start('TitleScene', { firstTime: false });
    }
  }
}