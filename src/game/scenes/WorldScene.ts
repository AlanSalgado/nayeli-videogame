import Phaser from 'phaser'
import {
  MINI_GAMES,
  MINI_GAME_LABELS,
  SCENE_KEYS,
  type MiniGameKey,
  GameRegistry,
} from '../registry'
import { ALL_TILESETS, TILE_SIZE } from '../world/tilesets'
import { EMPTY, GRASS, MAP_H, MAP_SCALE, MAP_W, buildVillage } from '../world/villageMap'
import {
  NAYELI_KEY,
  directionFromInput,
  idleAnim,
  walkAnim,
  type Direction,
} from '../characters/nayeli'

const SPEED = 160
const PIXEL_FONT = "'Press Start 2P', monospace"
const COMPLETED_TINT = 0x777788

// Door trigger: the door tile plus a strip of the tile in front of it. The player's
// feet box is 28px wide inside a 32px doorway, so we also accept her pressing
// against the wall next to the door instead of requiring pixel-perfect alignment.
const DOOR_TRIGGER_EXTRA = 16
const DOOR_TRIGGER_MAX_OFFSET_Y = 10
const DOOR_TRIGGER_MAX_OFFSET_X = 14

export default class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>
  private hudText!: Phaser.GameObjects.Text
  private transitioning = false
  private facing: Direction = 'south'

  constructor() {
    super({ key: 'WorldScene' })
  }

  create() {
    this.transitioning = false

    const village = buildVillage()
    const tileScreenSize = TILE_SIZE * MAP_SCALE
    const worldW = MAP_W * tileScreenSize
    const worldH = MAP_H * tileScreenSize

    // Mundo grande con scroll
    this.physics.world.setBounds(0, 0, worldW, worldH)
    this.cameras.main.setBounds(0, 0, worldW, worldH)

    // Tilemap built from code data (see world/villageMap.ts)
    const map = this.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: MAP_W,
      height: MAP_H,
    })
    const tilesets = ALL_TILESETS
      .map(set => map.addTilesetImage(set.key, set.key, TILE_SIZE, TILE_SIZE, 0, 0, set.firstgid))
      .filter((set): set is Phaser.Tilemaps.Tileset => set !== null)

    const buildLayer = (name: string, data: number[][], depth: number) => {
      const layer = map.createBlankLayer(name, tilesets)!
      for (let y = 0; y < MAP_H; y++) {
        for (let x = 0; x < MAP_W; x++) {
          if (data[y][x] !== EMPTY) layer.putTileAt(data[y][x], x, y)
        }
      }
      return layer.setScale(MAP_SCALE).setDepth(depth)
    }

    buildLayer('ground', village.ground, 0)
    const objects = buildLayer('objects', village.objects, 2)
    buildLayer('above', village.above, 10) // tree canopies: drawn over the player

    // Invisible collision layer: any tile placed here blocks the player
    const blockers = map.createBlankLayer('blockers', tilesets)!
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (village.blocked[y][x]) blockers.putTileAt(GRASS, x, y)
      }
    }
    blockers.setScale(MAP_SCALE).setVisible(false).setCollision(GRASS)

    // Personaje
    this.facing = 'south'
    this.player = this.physics.add.sprite(
      (village.spawn.x + 0.5) * tileScreenSize,
      (village.spawn.y + 0.5) * tileScreenSize,
      NAYELI_KEY,
    )
    this.player.setCollideWorldBounds(true)
    this.player.setDepth(5)
    // 84px cell with padding: keep the hitbox small and at the feet, Pokémon-style
    this.player.body!.setSize(28, 16).setOffset(28, 62)
    this.player.play(idleAnim(this.facing))
    this.physics.add.collider(this.player, blockers)

    // Houses: label, completed look and door trigger
    for (const house of village.houses) {
      const isComplete = GameRegistry.isComplete(house.key)

      this.add.text(
        house.labelAnchor.x * tileScreenSize,
        house.labelAnchor.y * tileScreenSize - 6,
        MINI_GAME_LABELS[house.key],
        {
          fontFamily: PIXEL_FONT,
          fontSize: '10px',
          color: isComplete ? '#b8b8c4' : '#ffffff',
          stroke: '#000000',
          strokeThickness: 4,
        },
      ).setOrigin(0.5, 1).setDepth(12)

      if (isComplete) {
        for (const { x, y } of house.tiles) {
          const houseTile = objects.getTileAt(x, y)
          if (houseTile) houseTile.tint = COMPLETED_TINT
        }
        continue
      }

      const doorLeft = house.door.x * tileScreenSize
      const doorTop = house.door.y * tileScreenSize
      const doorCenterX = doorLeft + tileScreenSize / 2
      const doorBottom = doorTop + tileScreenSize
      const zoneH = tileScreenSize + DOOR_TRIGGER_EXTRA
      const zone = this.add.zone(doorCenterX, doorTop + zoneH / 2, tileScreenSize, zoneH)
      this.physics.add.existing(zone, true)

      this.physics.add.overlap(this.player, zone, () => {
        if (this.transitioning) return
        const feet = (this.player.body as Phaser.Physics.Arcade.Body).center
        if (
          feet.y <= doorBottom + DOOR_TRIGGER_MAX_OFFSET_Y &&
          Math.abs(feet.x - doorCenterX) <= DOOR_TRIGGER_MAX_OFFSET_X
        ) {
          this.enterMiniGame(house.key)
        }
      })
    }

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
      { fontFamily: PIXEL_FONT, fontSize: '10px', color: '#ffffff', stroke: '#000000', strokeThickness: 4 }
    ).setScrollFactor(0).setDepth(20)

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

    const dx = left ? -1 : right ? 1 : 0
    const dy = up ? -1 : down ? 1 : 0
    const dir = directionFromInput(dx, dy)
    if (dir) {
      this.facing = dir
      this.player.anims.play(walkAnim(dir), true)
    } else {
      this.player.anims.play(idleAnim(this.facing), true)
    }

    // Actualiza HUD
    this.hudText.setText(`Mini-juegos: ${GameRegistry.completedCount()} / ${MINI_GAMES.length}`)
  }
}
