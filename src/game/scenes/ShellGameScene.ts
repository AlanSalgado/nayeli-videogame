import Phaser from 'phaser'
import { GameRegistry } from '../registry'
import EventBridge from '../EventBridge'

type Phase = 'reveal' | 'shuffle' | 'choose' | 'result'

export default class ShellGameScene extends Phaser.Scene {
  private cups: Phaser.GameObjects.Rectangle[] = []
  private ball!: Phaser.GameObjects.Ellipse
  private ballIndex = 0
  private phase: Phase = 'reveal'
  private shuffles = 0
  private maxShuffles = 8
  private instructionText!: Phaser.GameObjects.Text
  private round = 1
  private wins = 0

  constructor() {
    super({ key: 'ShellGameScene' })
  }

  create() {
    const { width, height } = this.scale
    this.add.rectangle(width / 2, height / 2, width, height, 0x2e1a4e)
    this.add.text(width / 2, 40, '🐚 La bolita', {
      fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 75, `Ronda ${this.round} de 3`, {
      fontSize: '16px', color: '#cccccc',
    }).setOrigin(0.5)

    const CUP_Y = height / 2
    const CUP_XS = [width / 2 - 180, width / 2, width / 2 + 180]

    // Tazas
    this.cups = CUP_XS.map(x =>
      this.add.rectangle(x, CUP_Y, 90, 110, 0xcc6600)
        .setStrokeStyle(2, 0xffaa00)
    )

    // Bolita bajo la taza
    this.ballIndex = Phaser.Math.Between(0, 2)
    const ballX = CUP_XS[this.ballIndex]
    this.ball = this.add.ellipse(ballX, CUP_Y + 70, 30, 30, 0xffff00)

    this.instructionText = this.add.text(width / 2, height - 60, '', {
      fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, height - 30, `Victorias: ${this.wins}`, {
      fontSize: '14px', color: '#aaaaaa',
    }).setOrigin(0.5)

    // Fase reveal: mostrar bolita 1.5s, luego mezclar
    this.time.delayedCall(1500, () => {
      this.instructionText.setText('Observa...')
      this.hideBall()
      this.time.delayedCall(500, () => this.doShuffle())
    })
  }

  private hideBall() {
    this.ball.setAlpha(0)
  }

  private showBall() {
    const cup = this.cups[this.ballIndex]
    this.ball.setPosition(cup.x, cup.y + 70)
    this.ball.setAlpha(1)
  }

  private doShuffle() {
    if (this.shuffles >= this.maxShuffles) {
      this.phase = 'choose'
      this.instructionText.setText('¿Bajo cuál taza está la bolita?')
      this.cups.forEach((cup, i) => {
        cup.setInteractive({ useHandCursor: true })
        cup.on('pointerup', () => this.onChoose(i))
        cup.on('pointerover', () => cup.setFillStyle(0xff8800))
        cup.on('pointerout', () => cup.setFillStyle(0xcc6600))
      })
      return
    }

    // Elegir dos índices al azar para intercambiar
    let a = Phaser.Math.Between(0, 2)
    let b: number
    do { b = Phaser.Math.Between(0, 2) } while (b === a)

    const speed = Phaser.Math.Between(200, 400)
    const xA = this.cups[a].x
    const xB = this.cups[b].x

    this.tweens.add({
      targets: this.cups[a], x: xB,
      duration: speed, ease: 'Linear',
    })
    this.tweens.add({
      targets: this.cups[b], x: xA,
      duration: speed, ease: 'Linear',
      onComplete: () => {
        if (this.ballIndex === a) this.ballIndex = b
        else if (this.ballIndex === b) this.ballIndex = a
        this.shuffles++
        this.time.delayedCall(80, () => this.doShuffle())
      },
    })

    this.instructionText.setText('Sigue la bolita...')
  }

  private onChoose(index: number) {
    if (this.phase !== 'choose') return
    this.phase = 'result'
    this.cups.forEach(c => {
      c.removeInteractive()
      c.removeAllListeners()
    })

    this.showBall()
    const won = index === this.ballIndex

    // Levanta la taza elegida
    this.tweens.add({
      targets: this.cups[index], y: '-=80',
      duration: 400, ease: 'Back.Out',
    })

    if (won) {
      this.wins++
      this.instructionText.setText('¡Correcto! 🎉')
    } else {
      this.instructionText.setText('Era la otra... 😅')
    }

    this.time.delayedCall(1800, () => this.nextRoundOrEnd())
  }

  private nextRoundOrEnd() {
    if (this.round >= 3) {
      this.endGame()
    } else {
      this.round++
      this.scene.restart()
      // Phaser reinicia la escena limpia; guardamos wins/round en registry data
      // Usamos el registry de Phaser para persistir entre reinicios
      this.registry.set('shellRound', this.round)
      this.registry.set('shellWins', this.wins)
    }
  }

  private endGame() {
    const { width, height } = this.scale
    const won = this.wins >= 2

    this.add.rectangle(width / 2, height / 2, 400, 220, 0x000000, 0.88).setDepth(5)
    this.add.text(width / 2, height / 2 - 50,
      won ? '¡Bien hecho! 🎉' : '¡Buen intento! 😊',
      { fontSize: '26px', color: won ? '#aaffaa' : '#ffaaaa' }
    ).setOrigin(0.5).setDepth(6)
    this.add.text(width / 2, height / 2,
      `Acertaste ${this.wins} de 3`,
      { fontSize: '20px', color: '#ffffff' }
    ).setOrigin(0.5).setDepth(6)

    const btn = this.add.text(width / 2, height / 2 + 60, '[ Continuar ]', {
      fontSize: '20px', color: '#ff69b4', backgroundColor: '#333', padding: { x: 14, y: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(6)

    btn.on('pointerup', () => {
      this.registry.remove('shellRound')
      this.registry.remove('shellWins')
      GameRegistry.complete('shellGame')
      if (GameRegistry.isAllComplete()) EventBridge.emit('game:complete')
      this.scene.start('WorldScene')
    })
  }

  // Al reiniciar la escena, recuperamos round y wins del registry de Phaser
  init() {
    this.round = this.registry.get('shellRound') ?? 1
    this.wins = this.registry.get('shellWins') ?? 0
    this.shuffles = 0
    this.phase = 'reveal'
    this.maxShuffles = 8 + (this.round - 1) * 3
  }
}
