import Phaser from 'phaser'
import { GameRegistry } from '../registry'
import EventBridge from '../EventBridge'

const HOLES = [
  { x: 200, y: 200 }, { x: 400, y: 200 }, { x: 600, y: 200 },
  { x: 200, y: 350 }, { x: 400, y: 350 }, { x: 600, y: 350 },
  { x: 200, y: 500 }, { x: 400, y: 500 }, { x: 600, y: 500 },
]
const GAME_DURATION = 30000
const MOLE_VISIBLE_MS = 900

export default class WhackAMoleScene extends Phaser.Scene {
  private score = 0
  private scoreText!: Phaser.GameObjects.Text
  private timerText!: Phaser.GameObjects.Text
  private moles: Phaser.GameObjects.Rectangle[] = []
  private activeMole = -1
  private moleTimer!: Phaser.Time.TimerEvent
  private gameTimer!: Phaser.Time.TimerEvent
  private remaining = GAME_DURATION / 1000
  private ended = false

  constructor() {
    super({ key: 'WhackAMoleScene' })
  }

  create() {
    const { width, height } = this.scale
    this.score = 0
    this.ended = false
    this.remaining = GAME_DURATION / 1000

    this.add.rectangle(width / 2, height / 2, width, height, 0x3a2a0e)
    this.add.text(width / 2, 40, '🔨 Golpea el topo', {
      fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5)

    // Hoyos y topos
    this.moles = []
    for (const hole of HOLES) {
      // Hoyo (círculo oscuro)
      const holeGfx = this.add.graphics()
      holeGfx.fillStyle(0x1a0e00)
      holeGfx.fillEllipse(hole.x, hole.y, 80, 40)

      // Topo (rectángulo marrón, oculto)
      const mole = this.add.rectangle(hole.x, hole.y - 20, 50, 50, 0x8b4513)
        .setInteractive({ useHandCursor: true })
        .setVisible(false)
      mole.on('pointerup', () => this.hitMole())
      this.moles.push(mole)
    }

    this.scoreText = this.add.text(20, 80, 'Puntos: 0', {
      fontSize: '20px', color: '#ffff00',
    })
    this.timerText = this.add.text(width - 20, 80, `Tiempo: ${this.remaining}s`, {
      fontSize: '20px', color: '#ff8888',
    }).setOrigin(1, 0)

    // Instrucción
    this.add.text(width / 2, height - 30, 'Haz click en los topos', {
      fontSize: '15px', color: '#aaaaaa',
    }).setOrigin(0.5)

    // Timers
    this.moleTimer = this.time.addEvent({
      delay: MOLE_VISIBLE_MS,
      callback: this.showRandomMole,
      callbackScope: this,
      loop: true,
    })
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.tickTimer,
      callbackScope: this,
      loop: true,
    })
  }

  private showRandomMole() {
    if (this.ended) return
    if (this.activeMole >= 0) this.moles[this.activeMole].setVisible(false)
    this.activeMole = Phaser.Math.Between(0, this.moles.length - 1)
    this.moles[this.activeMole].setVisible(true)
  }

  private hitMole() {
    if (this.ended) return
    if (this.activeMole >= 0) {
      this.moles[this.activeMole].setVisible(false)
      this.activeMole = -1
    }
    this.score++
    this.scoreText.setText(`Puntos: ${this.score}`)
  }

  private tickTimer() {
    if (this.ended) return
    this.remaining--
    this.timerText.setText(`Tiempo: ${this.remaining}s`)
    if (this.remaining <= 0) this.endGame()
  }

  private endGame() {
    this.ended = true
    this.moleTimer.remove()
    this.gameTimer.remove()
    if (this.activeMole >= 0) this.moles[this.activeMole].setVisible(false)

    const { width, height } = this.scale
    const won = this.score >= 5

    this.add.rectangle(width / 2, height / 2, 400, 200, 0x000000, 0.85).setDepth(5)
    this.add.text(width / 2, height / 2 - 40,
      won ? '¡Excelente! 🎉' : 'Buen intento 😊',
      { fontSize: '28px', color: won ? '#aaffaa' : '#ffaaaa' }
    ).setOrigin(0.5).setDepth(6)
    this.add.text(width / 2, height / 2, `Puntos: ${this.score}`, {
      fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(6)

    const btn = this.add.text(width / 2, height / 2 + 50, '[ Continuar ]', {
      fontSize: '20px', color: '#ff69b4', backgroundColor: '#333', padding: { x: 14, y: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(6)

    btn.on('pointerup', () => {
      GameRegistry.complete('whackAMole')
      if (GameRegistry.isAllComplete()) EventBridge.emit('game:complete')
      this.scene.start('WorldScene')
    })
  }
}
