import Phaser from 'phaser'

// Texto de introducción — Alan puede personalizar estos mensajes
const LINES = [
  'Érase una vez...',
  'Una chica especial llamada Nayeli.',
  'En su cumpleaños, el mundo entero\nse llenó de aventuras para ella.',
  'Seis desafíos la esperan.',
  'Cada uno, una prueba de su ingenio\ny su sonrisa.',
  '¿Estás lista, Nayeli?',
  '¡Feliz cumpleaños! 🎂',
]

export default class IntroScene extends Phaser.Scene {
  private lineIndex = 0
  private lineText!: Phaser.GameObjects.Text
  private skipHint!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'IntroScene' })
  }

  create() {
    const { width, height } = this.scale
    this.lineIndex = 0

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a)

    // Estrellas decorativas
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8)
      this.add.circle(x, y, 1.5, 0xffffff, alpha)
    }

    this.lineText = this.add.text(width / 2, height / 2, '', {
      fontSize: '26px', color: '#ffffff',
      align: 'center', wordWrap: { width: width - 120 },
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0)

    this.skipHint = this.add.text(width - 20, height - 25, 'Click o ENTER para continuar', {
      fontSize: '13px', color: '#555555',
    }).setOrigin(1, 1)

    this.input.on('pointerup', () => this.advance())
    this.input.keyboard!.on('keydown-ENTER', () => this.advance())
    this.input.keyboard!.on('keydown-SPACE', () => this.advance())

    this.cameras.main.fadeIn(800, 0, 0, 0)
    this.showLine()
  }

  private showLine() {
    this.tweens.killTweensOf(this.lineText)
    this.lineText.setText(LINES[this.lineIndex]).setAlpha(0)
    this.tweens.add({
      targets: this.lineText, alpha: 1,
      duration: 800, ease: 'Sine.In',
    })
  }

  private advance() {
    this.lineIndex++
    if (this.lineIndex >= LINES.length) {
      this.input.off('pointerup')
      this.input.keyboard!.off('keydown-ENTER')
      this.input.keyboard!.off('keydown-SPACE')
      this.cameras.main.fadeOut(600, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WorldScene')
      })
    } else {
      this.tweens.add({
        targets: this.lineText, alpha: 0, duration: 300,
        onComplete: () => this.showLine(),
      })
    }
  }
}
