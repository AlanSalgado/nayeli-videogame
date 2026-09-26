import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // Genera textura placeholder del personaje (cuadrado rosa 32x32)
    const gfx = this.make.graphics({ x: 0, y: 0 })
    gfx.fillStyle(0xff69b4) // rosa
    gfx.fillRect(0, 0, 32, 32)
    gfx.generateTexture('player', 32, 32)
    gfx.destroy()
  }

  create() {
    this.scene.start('IntroScene')
  }
}
