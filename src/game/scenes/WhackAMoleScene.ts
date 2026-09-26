import Phaser from 'phaser'
import { GameRegistry } from '../registry'
import EventBridge from '../EventBridge'

export default class WhackAMoleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WhackAMoleScene' })
  }

  create() {
    const { width, height } = this.scale
    this.add.rectangle(width / 2, height / 2, width, height, 0x3a2a0e)
    this.add.text(width / 2, height / 2 - 40, '🔨 Golpea el topo', {
      fontSize: '36px', color: '#ffffff',
    }).setOrigin(0.5)

    const btn = this.add.text(width / 2, height / 2 + 60, '[ Completar ]', {
      fontSize: '22px', color: '#ff69b4', backgroundColor: '#333', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    btn.on('pointerup', () => {
      GameRegistry.complete('whackAMole')
      if (GameRegistry.isAllComplete()) EventBridge.emit('game:complete')
      this.scene.start('WorldScene')
    })
  }
}
