import Phaser from 'phaser'
import { GameRegistry } from '../registry'
import EventBridge from '../EventBridge'

const GROUND_Y_RATIO = 0.78
const PLAYER_X = 120
const JUMP_VEL = -520
const BASE_SPEED = 280
const SPEED_INCREMENT = 12
const OBSTACLE_INTERVAL_BASE = 1800
const DISTANCE_TO_WIN = 3000

export default class ObstacleRunnerScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private obstacles!: Phaser.Physics.Arcade.Group
  private ground!: Phaser.GameObjects.Rectangle
  private distanceText!: Phaser.GameObjects.Text
  private speedText!: Phaser.GameObjects.Text
  private spaceKey!: Phaser.Input.Keyboard.Key
  private upKey!: Phaser.Input.Keyboard.Key
  private distance = 0
  private speed = BASE_SPEED
  private obstacleTimer!: Phaser.Time.TimerEvent
  private ended = false
  private groundY = 0

  constructor() {
    super({ key: 'ObstacleRunnerScene' })
  }

  create() {
    const { width, height } = this.scale
    this.distance = 0
    this.speed = BASE_SPEED
    this.ended = false
    this.groundY = height * GROUND_Y_RATIO

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a2a3a)

    // Suelo
    this.ground = this.add.rectangle(width / 2, this.groundY + 16, width, 32, 0x336699)
    this.physics.add.existing(this.ground, true)

    // Título
    this.add.text(width / 2, 25, '🏃 Carrera de obstáculos', {
      fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5)
    this.add.text(width / 2, 58, 'Presiona ESPACIO o ↑ para saltar', {
      fontSize: '14px', color: '#aaaaaa',
    }).setOrigin(0.5)

    // Personaje
    const gfx = this.make.graphics({ x: 0, y: 0 })
    gfx.fillStyle(0xff69b4)
    gfx.fillRect(0, 0, 32, 40)
    gfx.generateTexture('runner', 32, 40)
    gfx.destroy()

    this.player = this.physics.add.sprite(PLAYER_X, this.groundY - 20, 'runner')
    this.player.setCollideWorldBounds(true)
    this.physics.add.collider(this.player, this.ground as unknown as Phaser.GameObjects.GameObject)

    // Obstáculos
    this.obstacles = this.physics.add.group()
    this.physics.add.collider(this.obstacles, this.ground as unknown as Phaser.GameObjects.GameObject)
    this.physics.add.overlap(this.player, this.obstacles, () => this.endGame(false))

    // Controles
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP)

    // HUD
    this.distanceText = this.add.text(20, 90, 'Distancia: 0m', {
      fontSize: '16px', color: '#ffffff',
    })
    this.speedText = this.add.text(width - 20, 90, '', {
      fontSize: '14px', color: '#88ccff',
    }).setOrigin(1, 0)

    // Timer de obstáculos
    this.scheduleObstacle()
  }

  private scheduleObstacle() {
    const interval = Math.max(700, OBSTACLE_INTERVAL_BASE - this.distance * 0.3)
    this.obstacleTimer = this.time.delayedCall(interval, () => {
      if (!this.ended) {
        this.spawnObstacle()
        this.scheduleObstacle()
      }
    })
  }

  private spawnObstacle() {
    const { width } = this.scale
    const h = Phaser.Math.Between(30, 55)
    const obs = this.add.rectangle(width + 30, this.groundY - h / 2, 28, h, 0xff4444)
    this.physics.add.existing(obs)
    const body = (obs as unknown as { body: Phaser.Physics.Arcade.Body }).body
    body.setVelocityX(-this.speed)
    body.setAllowGravity(false)
    this.obstacles.add(obs)
  }

  update(_time: number, delta: number) {
    if (this.ended) return

    const onGround = (this.player.body as Phaser.Physics.Arcade.Body).blocked.down
    if ((this.spaceKey.isDown || this.upKey.isDown) && onGround) {
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocityY(JUMP_VEL)
    }

    // Incrementar distancia y velocidad
    this.distance += (this.speed / 1000) * delta
    this.speed = BASE_SPEED + Math.floor(this.distance / 200) * SPEED_INCREMENT

    // Actualizar velocidad de obstáculos existentes
    this.obstacles.getChildren().forEach(obj => {
      const body = (obj as unknown as { body: Phaser.Physics.Arcade.Body }).body
      if (body) body.setVelocityX(-this.speed)
    })

    // Eliminar obstáculos fuera de pantalla
    this.obstacles.getChildren().forEach(obj => {
      const rect = obj as Phaser.GameObjects.Rectangle
      if (rect.x < -50) rect.destroy()
    })

    this.distanceText.setText(`Distancia: ${Math.floor(this.distance)}m`)
    this.speedText.setText(`Velocidad: ${Math.floor(this.speed / 10)} km/h`)

    if (this.distance >= DISTANCE_TO_WIN) this.endGame(true)
  }

  private endGame(won: boolean) {
    this.ended = true
    this.obstacleTimer?.remove()
    this.obstacles.getChildren().forEach(o => (o as Phaser.GameObjects.GameObject).destroy())

    const { width, height } = this.scale
    this.add.rectangle(width / 2, height / 2, 420, 220, 0x000000, 0.9).setDepth(5)
    this.add.text(width / 2, height / 2 - 55,
      won ? '¡Meta alcanzada! 🏁' : '¡Buen intento! 😊',
      { fontSize: '26px', color: won ? '#aaffaa' : '#ffaaaa' }
    ).setOrigin(0.5).setDepth(6)
    this.add.text(width / 2, height / 2,
      `Distancia recorrida: ${Math.floor(this.distance)}m`,
      { fontSize: '18px', color: '#ffffff' }
    ).setOrigin(0.5).setDepth(6)

    const btn = this.add.text(width / 2, height / 2 + 60, '[ Continuar ]', {
      fontSize: '20px', color: '#ff69b4', backgroundColor: '#333', padding: { x: 14, y: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(6)

    btn.on('pointerup', () => {
      GameRegistry.complete('obstacleRunner')
      if (GameRegistry.isAllComplete()) EventBridge.emit('game:complete')
      this.scene.start('WorldScene')
    })
  }
}
