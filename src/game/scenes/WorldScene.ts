import Phaser from 'phaser'
import {
  MINI_GAMES,
  MINI_GAME_LABELS,
  SCENE_KEYS,
  type MiniGameKey,
  GameRegistry,
} from '../registry'

const SPEED = 160
const WORLD_W = 1600
const WORLD_H = 1200

// Posición y color de cada zona en el mundo
const ZONE_DEFS: Record<MiniGameKey, { x: number; y: number; color: number }> = {
  trivia:          { x: 300,  y: 200,  color: 0x3a5f8a },
  shellGame:       { x: 1300, y: 200,  color: 0x8a3a5f },
  simonSays:       { x: 300,  y: 1000, color: 0x3a8a3a },
  whackAMole:      { x: 1300, y: 1000, color: 0x8a6a3a },
  rhythm:          { x: 800,  y: 200,  color: 0x5a3a8a },
  obstacleRunner:  { x: 800,  y: 1000, color: 0x3a7a8a },
}

export default class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>
  private hudText!: Phaser.GameObjects.Text
  private zones: Phaser.Physics.Arcade.StaticGroup | null = null
  private zoneKeys: MiniGameKey[] = []
  private transitioning = false

  constructor() {
    super({ key: 'WorldScene' })
  }

  create() {
    // Mundo grande con scroll
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H)
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H)

    // Fondo verde
    this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x4a7c59)

    // Cuadrícula
    const grid = this.add.graphics()
    grid.lineStyle(1, 0x3a6a49, 0.3)
    for (let x = 0; x <= WORLD_W; x += 32) {
      grid.moveTo(x, 0); grid.lineTo(x, WORLD_H)
    }
    for (let y = 0; y <= WORLD_H; y += 32) {
      grid.moveTo(0, y); grid.lineTo(WORLD_W, y)
    }
    grid.strokePath()

    // Zonas de mini-juegos
    this.zones = this.physics.add.staticGroup()
    this.zoneKeys = []

    for (const key of MINI_GAMES) {
      const def = ZONE_DEFS[key]
      const isComplete = GameRegistry.isComplete(key)
      const color = isComplete ? 0x888888 : def.color

      // Edificio visual
      const building = this.add.rectangle(def.x, def.y, 120, 120, color)
        .setStrokeStyle(3, 0xffffff, isComplete ? 0.4 : 0.9)

      // Checkmark si ya se completó
      if (isComplete) {
        this.add.text(def.x, def.y - 10, '✓', { fontSize: '32px', color: '#aaffaa' }).setOrigin(0.5)
      }

      // Label
      this.add.text(def.x, def.y + 72, MINI_GAME_LABELS[key], {
        fontSize: '13px', color: '#ffffff', stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5)

      // Zona trigger (física estática invisible, más pequeña que el edificio)
      if (!isComplete) {
        const trigger = this.physics.add.staticImage(def.x, def.y, '__DEFAULT')
          .setDisplaySize(120, 120)
          .setAlpha(0)
        ;(trigger as unknown as { miniGameKey: MiniGameKey }).miniGameKey = key
        this.zones.add(trigger)
        this.zoneKeys.push(key)
      }

      building.setDepth(0)
    }

    // Personaje
    this.player = this.physics.add.sprite(WORLD_W / 2, WORLD_H / 2, 'player')
    this.player.setCollideWorldBounds(true)
    this.player.setDepth(1)

    // Cámara sigue al jugador
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

    // Controles
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    // HUD fijo en cámara
    this.hudText = this.add.text(12, 12,
      `Mini-juegos: ${GameRegistry.completedCount()} / ${MINI_GAMES.length}`,
      { fontSize: '16px', color: '#ffffff', stroke: '#000000', strokeThickness: 3 }
    ).setScrollFactor(0).setDepth(10)

    // Colisión con zonas
    this.physics.add.overlap(
      this.player,
      this.zones,
      (_player, trigger) => {
        const key = (trigger as unknown as { miniGameKey: MiniGameKey }).miniGameKey
        if (key && !this.transitioning) this.enterMiniGame(key)
      }
    )

    // Fade in al volver de un mini-juego
    this.cameras.main.fadeIn(400, 0, 0, 0)
  }

  private enterMiniGame(key: MiniGameKey) {
    this.transitioning = true
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENE_KEYS[key])
    })
  }

  update() {
    if (this.transitioning) return

    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0)

    const left  = this.cursors.left.isDown  || this.wasd.left.isDown
    const right = this.cursors.right.isDown || this.wasd.right.isDown
    const up    = this.cursors.up.isDown    || this.wasd.up.isDown
    const down  = this.cursors.down.isDown  || this.wasd.down.isDown

    if (left)  body.setVelocityX(-SPEED)
    else if (right) body.setVelocityX(SPEED)
    if (up)    body.setVelocityY(-SPEED)
    else if (down) body.setVelocityY(SPEED)

    if ((left || right) && (up || down)) {
      body.velocity.normalize().scale(SPEED)
    }

    // Actualiza HUD
    this.hudText.setText(`Mini-juegos: ${GameRegistry.completedCount()} / ${MINI_GAMES.length}`)
  }
}
