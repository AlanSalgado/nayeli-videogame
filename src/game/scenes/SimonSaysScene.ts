import Phaser from 'phaser'
import { GameRegistry } from '../registry'
import EventBridge from '../EventBridge'

const COLORS = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44]
const COLOR_NAMES = ['Rojo', 'Verde', 'Azul', 'Amarillo']
const COLORS_BRIGHT = [0xff8888, 0x88ff88, 0x8888ff, 0xffff88]
const BTN_POS = [
  { x: -90, y: -90 }, { x: 90, y: -90 },
  { x: -90, y: 90 },  { x: 90, y: 90 },
]

type Phase = 'showing' | 'input' | 'result'

export default class SimonSaysScene extends Phaser.Scene {
  private sequence: number[] = []
  private playerInput: number[] = []
  private phase: Phase = 'showing'
  private btns: Phaser.GameObjects.Rectangle[] = []
  private levelText!: Phaser.GameObjects.Text
  private instructionText!: Phaser.GameObjects.Text
  private cx = 0
  private cy = 0

  constructor() {
    super({ key: 'SimonSaysScene' })
  }

  create() {
    const { width, height } = this.scale
    this.cx = width / 2
    this.cy = height / 2 + 20
    this.sequence = []
    this.playerInput = []

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a3a1e)
    this.add.text(width / 2, 30, '🟩 Simon Says', {
      fontSize: '26px', color: '#ffffff',
    }).setOrigin(0.5)

    this.levelText = this.add.text(width / 2, 65, 'Nivel 1', {
      fontSize: '16px', color: '#aaaaaa',
    }).setOrigin(0.5)

    this.instructionText = this.add.text(width / 2, height - 50, 'Observa la secuencia...', {
      fontSize: '17px', color: '#ffffff',
    }).setOrigin(0.5)

    // 4 botones de colores
    this.btns = []
    for (let i = 0; i < 4; i++) {
      const pos = BTN_POS[i]
      const btn = this.add.rectangle(
        this.cx + pos.x, this.cy + pos.y, 140, 140, COLORS[i]
      ).setInteractive({ useHandCursor: true })
      btn.on('pointerup', () => this.onPress(i))
      this.btns.push(btn)
      this.add.text(this.cx + pos.x, this.cy + pos.y, COLOR_NAMES[i], {
        fontSize: '14px', color: '#ffffff', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5)
    }

    this.cameras.main.fadeIn(400, 0, 0, 0)
    this.time.delayedCall(600, () => this.nextRound())
  }

  private nextRound() {
    this.playerInput = []
    this.phase = 'showing'
    this.sequence.push(Phaser.Math.Between(0, 3))
    this.levelText.setText(`Nivel ${this.sequence.length}`)
    this.instructionText.setText('Observa la secuencia...')
    this.setButtonsEnabled(false)

    let delay = 600
    for (const idx of this.sequence) {
      this.time.delayedCall(delay, () => this.flashBtn(idx))
      delay += 700
    }
    this.time.delayedCall(delay + 200, () => {
      this.phase = 'input'
      this.setButtonsEnabled(true)
      this.instructionText.setText('¡Tu turno! Repite la secuencia')
    })
  }

  private flashBtn(index: number) {
    const btn = this.btns[index]
    btn.setFillStyle(COLORS_BRIGHT[index])
    this.time.delayedCall(350, () => btn.setFillStyle(COLORS[index]))
  }

  private setButtonsEnabled(enabled: boolean) {
    this.btns.forEach(b => {
      if (enabled) b.setInteractive({ useHandCursor: true })
      else b.disableInteractive()
    })
  }

  private onPress(index: number) {
    if (this.phase !== 'input') return
    this.flashBtn(index)
    this.playerInput.push(index)

    const pos = this.playerInput.length - 1
    if (this.playerInput[pos] !== this.sequence[pos]) {
      // Error
      this.phase = 'result'
      this.setButtonsEnabled(false)
      this.instructionText.setText('¡Error! 😅')
      this.time.delayedCall(1000, () => this.endGame(false))
      return
    }

    if (this.playerInput.length === this.sequence.length) {
      // Ronda correcta
      this.phase = 'showing'
      this.setButtonsEnabled(false)
      this.instructionText.setText('¡Correcto! ✓')

      if (this.sequence.length >= 6) {
        // Ganó al llegar a nivel 6
        this.time.delayedCall(800, () => this.endGame(true))
      } else {
        this.time.delayedCall(800, () => this.nextRound())
      }
    }
  }

  private endGame(won: boolean) {
    const { width, height } = this.scale

    this.add.rectangle(width / 2, height / 2, 420, 220, 0x000000, 0.9).setDepth(5)
    this.add.text(width / 2, height / 2 - 55,
      won ? '¡Lo lograste! 🎉' : '¡Buen intento! 😊',
      { fontSize: '26px', color: won ? '#aaffaa' : '#ffaaaa' }
    ).setOrigin(0.5).setDepth(6)
    this.add.text(width / 2, height / 2,
      `Llegaste al nivel ${this.sequence.length}`,
      { fontSize: '20px', color: '#ffffff' }
    ).setOrigin(0.5).setDepth(6)

    const btn = this.add.text(width / 2, height / 2 + 60, '[ Continuar ]', {
      fontSize: '20px', color: '#ff69b4', backgroundColor: '#333', padding: { x: 14, y: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(6)

    btn.on('pointerup', () => {
      GameRegistry.complete('simonSays')
      if (GameRegistry.isAllComplete()) EventBridge.emit('game:complete')
      this.scene.start('WorldScene')
    })
  }
}
