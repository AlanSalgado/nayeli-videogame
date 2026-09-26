import Phaser from 'phaser'

const SPEED = 160

export default class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: {
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
  }

  constructor() {
    super({ key: 'WorldScene' })
  }

  create() {
    const { width, height } = this.scale

    // Fondo verde
    this.add.rectangle(width / 2, height / 2, width, height, 0x4a7c59)

    // Cuadrícula decorativa
    const grid = this.add.graphics()
    grid.lineStyle(1, 0x3a6a49, 0.4)
    for (let x = 0; x <= width; x += 32) {
      grid.moveTo(x, 0)
      grid.lineTo(x, height)
    }
    for (let y = 0; y <= height; y += 32) {
      grid.moveTo(0, y)
      grid.lineTo(width, y)
    }
    grid.strokePath()

    // Personaje
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player')
    this.player.setCollideWorldBounds(true)

    // Controles
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
  }

  update() {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0)

    const left = this.cursors.left.isDown || this.wasd.left.isDown
    const right = this.cursors.right.isDown || this.wasd.right.isDown
    const up = this.cursors.up.isDown || this.wasd.up.isDown
    const down = this.cursors.down.isDown || this.wasd.down.isDown

    if (left) body.setVelocityX(-SPEED)
    else if (right) body.setVelocityX(SPEED)

    if (up) body.setVelocityY(-SPEED)
    else if (down) body.setVelocityY(SPEED)

    // Normaliza velocidad diagonal
    if ((left || right) && (up || down)) {
      body.velocity.normalize().scale(SPEED)
    }
  }
}
