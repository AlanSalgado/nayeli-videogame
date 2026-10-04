import Phaser from 'phaser'

/*
 * Nayeli sprite generated with PixelLab (see public/assets/characters/nayeli/nayeli.json).
 * Sheet layout: 8 columns of 84x84 cells.
 *  - Row 0: idle pose for each direction (one frame per column)
 *  - Rows 1-9: 6-frame walk cycle per direction. PixelLab labels rows 5 and 6 both
 *    as "north", but row 5 actually faces the camera; row 6 is the real back view.
 */

export const NAYELI_KEY = 'nayeli'
const CELL_SIZE = 84
const COLUMNS = 8
const WALK_FRAMES = 6
const WALK_FRAME_RATE = 10

export type Direction =
  | 'south' | 'south-east' | 'east' | 'north-east'
  | 'north' | 'north-west' | 'west' | 'south-west'

// idleFrame: column in row 0. walkRow: row holding the walk cycle.
const DIRECTIONS: Record<Direction, { idleFrame: number; walkRow: number }> = {
  'south':      { idleFrame: 0, walkRow: 1 },
  'south-east': { idleFrame: 1, walkRow: 2 },
  'east':       { idleFrame: 2, walkRow: 3 },
  'north-east': { idleFrame: 3, walkRow: 4 },
  'north':      { idleFrame: 4, walkRow: 6 },
  'north-west': { idleFrame: 5, walkRow: 7 },
  'west':       { idleFrame: 6, walkRow: 8 },
  'south-west': { idleFrame: 7, walkRow: 9 },
}

export const idleAnim = (dir: Direction) => `${NAYELI_KEY}-idle-${dir}`
export const walkAnim = (dir: Direction) => `${NAYELI_KEY}-walk-${dir}`

export function preloadNayeli(scene: Phaser.Scene) {
  scene.load.spritesheet(NAYELI_KEY, 'assets/characters/nayeli/nayeli.png', {
    frameWidth: CELL_SIZE,
    frameHeight: CELL_SIZE,
  })
}

export function createNayeliAnims(scene: Phaser.Scene) {
  // Nearest-neighbor keeps pixel art crisp without forcing pixelArt on the whole game
  scene.textures.get(NAYELI_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)

  for (const [dir, { idleFrame, walkRow }] of Object.entries(DIRECTIONS) as [Direction, typeof DIRECTIONS[Direction]][]) {
    if (!scene.anims.exists(idleAnim(dir))) {
      scene.anims.create({
        key: idleAnim(dir),
        frames: [{ key: NAYELI_KEY, frame: idleFrame }],
      })
    }

    if (!scene.anims.exists(walkAnim(dir))) {
      const start = walkRow * COLUMNS
      scene.anims.create({
        key: walkAnim(dir),
        frames: scene.anims.generateFrameNumbers(NAYELI_KEY, { start, end: start + WALK_FRAMES - 1 }),
        frameRate: WALK_FRAME_RATE,
        repeat: -1,
      })
    }
  }
}

/** Maps input axes (-1, 0, 1) to one of the 8 sprite directions. */
export function directionFromInput(dx: number, dy: number): Direction | null {
  if (dx === 0 && dy === 0) return null
  const vertical = dy < 0 ? 'north' : dy > 0 ? 'south' : ''
  const horizontal = dx < 0 ? 'west' : dx > 0 ? 'east' : ''
  return (vertical && horizontal ? `${vertical}-${horizontal}` : vertical || horizontal) as Direction
}
