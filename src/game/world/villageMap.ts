import type { MiniGameKey } from '../registry'
import { DETAIL, FLOOR, HOUSE, NATURE, WATER, tile } from './tilesets'

// ---------------------------------------------------------------------------
// Map dimensions (in 16px tiles; the scene renders the layers at MAP_SCALE)
// ---------------------------------------------------------------------------
export const MAP_W = 50
export const MAP_H = 38
export const MAP_SCALE = 2

export const EMPTY = -1

// ---------------------------------------------------------------------------
// Tile indices (global ids, see tilesets.ts). (col, row) is the position
// inside the tileset image.
// ---------------------------------------------------------------------------

// TilesetFloor: grass
export const GRASS = tile(FLOOR, 0, 12)
export const GRASS_VARIANTS = [
  tile(FLOOR, 1, 12),
  tile(FLOOR, 2, 12),
  tile(FLOOR, 3, 12),
  tile(FLOOR, 4, 12),
  tile(FLOOR, 2, 11),
  tile(FLOOR, 3, 11),
]

// TilesetFloor: dirt path, 3x3 rounded blob at cols 0-2, rows 7-9
export const PATH_TL = tile(FLOOR, 0, 7)
export const PATH_T = tile(FLOOR, 1, 7)
export const PATH_TR = tile(FLOOR, 2, 7)
export const PATH_L = tile(FLOOR, 0, 8)
export const PATH_C = tile(FLOOR, 1, 8)
export const PATH_R = tile(FLOOR, 2, 8)
export const PATH_BL = tile(FLOOR, 0, 9)
export const PATH_B = tile(FLOOR, 1, 9)
export const PATH_BR = tile(FLOOR, 2, 9)

// TilesetWater: pond on grass, 3x3 blob at cols 0-2, rows 6-8
export const POND_TL = tile(WATER, 0, 6)
export const POND_T = tile(WATER, 1, 6)
export const POND_TR = tile(WATER, 2, 6)
export const POND_L = tile(WATER, 0, 7)
export const POND_C = tile(WATER, 1, 7)
export const POND_R = tile(WATER, 2, 7)
export const POND_BL = tile(WATER, 0, 8)
export const POND_B = tile(WATER, 1, 8)
export const POND_BR = tile(WATER, 2, 8)

// TilesetNature: 2x2 trees, top-left tile of each (canopy row, then base row)
export const TREE_ROUND = { col: 0, row: 0 }
export const TREE_PINE = { col: 2, row: 0 }

// TilesetNature: large 3x3 tree (canopy rows 18-19, trunk is the center tile of row 20)
export const BIG_TREE = { col: 3, row: 18 }

// TilesetNature: single-tile solid props
export const BUSHES = [
  tile(NATURE, 0, 10),
  tile(NATURE, 1, 10),
  tile(NATURE, 2, 10),
  tile(NATURE, 6, 10),
]
export const SMALL_ROCKS = [tile(NATURE, 17, 17), tile(NATURE, 18, 17), tile(NATURE, 19, 17)]
// TilesetNature: 2x2 gray boulder (top-left tile)
export const BOULDER = { col: 15, row: 14 }

// Walk-over decoration
export const FLOWERS = [
  tile(NATURE, 0, 11), // sunflower
  tile(NATURE, 1, 11), // big sunflower
  tile(NATURE, 3, 11), // red flower
  tile(NATURE, 6, 11), // white flower
  tile(DETAIL, 2, 0), // yellow flower
  tile(DETAIL, 5, 2), // mushrooms
]
export const TUFTS = [
  tile(NATURE, 3, 10),
  tile(NATURE, 4, 10),
  tile(NATURE, 5, 10),
  tile(NATURE, 7, 10),
  tile(DETAIL, 3, 2),
]

// TilesetHouse: every house is 3 tile rows tall; the door is the middle-column
// tile of the bottom row (dark arch)
export interface HouseStyle {
  col: number
  row: number
  width: number
}

export const HOUSE_CREAM: HouseStyle = { col: 4, row: 0, width: 4 }
export const HOUSE_SHOP: HouseStyle = { col: 16, row: 0, width: 3 }
export const HOUSE_RED: HouseStyle = { col: 12, row: 0, width: 4 }
export const HOUSE_CABIN: HouseStyle = { col: 26, row: 0, width: 3 }
export const HOUSE_STONE: HouseStyle = { col: 23, row: 0, width: 3 }
export const HOUSE_ORANGE: HouseStyle = { col: 0, row: 0, width: 4 }

const HOUSE_HEIGHT = 3
const HOUSE_DOOR_COL = 1

// Top-left tile of each house. Doors face south.
const HOUSE_PLACEMENTS: Record<MiniGameKey, { style: HouseStyle; x: number; y: number }> = {
  trivia:         { style: HOUSE_CREAM,  x: 8,  y: 6 },
  rhythm:         { style: HOUSE_STONE,  x: 24, y: 6 },
  shellGame:      { style: HOUSE_SHOP,   x: 40, y: 6 },
  simonSays:      { style: HOUSE_RED,    x: 8,  y: 26 },
  obstacleRunner: { style: HOUSE_ORANGE, x: 24, y: 26 },
  whackAMole:     { style: HOUSE_CABIN,  x: 40, y: 26 },
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------
export interface TilePos {
  x: number
  y: number
}

export interface HouseInstance {
  key: MiniGameKey
  /** Every tile of the house, door included (in objects layer coordinates) */
  tiles: TilePos[]
  door: TilePos
  /** Horizontal center and top edge of the house, in tiles */
  labelAnchor: { x: number; y: number }
}

export interface VillageData {
  ground: number[][]
  /** Below the player: houses, trunks, water, rocks, flowers */
  objects: number[][]
  /** Above the player: tree canopies */
  above: number[][]
  blocked: boolean[][]
  houses: HouseInstance[]
  spawn: TilePos
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------
type Rect = [x0: number, y0: number, x1: number, y1: number]

// Dirt areas (inclusive tile rectangles). Paths are 3 tiles wide.
const PATH_RECTS: Rect[] = [
  [22, 16, 28, 22], // central plaza
  [24, 9, 26, 16], // plaza to the top-center house
  [8, 9, 10, 20], // top-left house stub
  [40, 9, 42, 20], // top-right house stub
  [8, 18, 42, 20], // east-west road through the plaza
  [16, 18, 18, 31], // west connector to the southern road
  [32, 18, 34, 31], // east connector to the southern road
  [8, 29, 42, 31], // southern road, in front of the bottom houses
]

const SPAWN: TilePos = { x: 25, y: 19 }

// Positions use the top-left tile of the 2x2 / 3x3 sprite
const BIG_TREES: TilePos[] = [
  { x: 12, y: 10 },
  { x: 12, y: 22 },
  { x: 36, y: 10 },
  { x: 36, y: 22 },
]
const SMALL_TREES: TilePos[] = [
  { x: 19, y: 12 }, { x: 29, y: 12 }, { x: 19, y: 24 }, { x: 29, y: 24 },
  { x: 4, y: 12 }, { x: 4, y: 24 }, { x: 44, y: 12 }, { x: 44, y: 24 },
  { x: 4, y: 4 }, { x: 44, y: 4 }, { x: 4, y: 32 }, { x: 44, y: 32 },
  { x: 12, y: 33 }, { x: 16, y: 34 }, { x: 22, y: 33 }, { x: 28, y: 34 }, { x: 31, y: 33 },
  { x: 21, y: 3 }, { x: 31, y: 3 },
]
const PONDS: Array<{ x: number; y: number; w: number; h: number }> = [
  { x: 14, y: 3, w: 6, h: 4 },
  { x: 36, y: 33, w: 6, h: 3 },
]
const BOULDERS: TilePos[] = [{ x: 30, y: 4 }, { x: 5, y: 30 }]
const ROCKS: TilePos[] = [
  { x: 21, y: 7 }, { x: 33, y: 6 }, { x: 14, y: 33 }, { x: 20, y: 35 },
  { x: 44, y: 31 }, { x: 5, y: 20 }, { x: 46, y: 18 },
]

// Deterministic PRNG so the village looks the same on every run
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const makeGrid = <T>(fill: T) => Array.from({ length: MAP_H }, () => Array<T>(MAP_W).fill(fill))
const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < MAP_W && y < MAP_H

export function buildVillage(): VillageData {
  const rand = mulberry32(1402)
  const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)]

  const ground = makeGrid(GRASS)
  const objects = makeGrid(EMPTY)
  const above = makeGrid(EMPTY)
  const blocked = makeGrid(false)
  const dirt = makeGrid(false)
  const houses: HouseInstance[] = []

  const isFree = (x: number, y: number, w = 1, h = 1) => {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        if (!inBounds(i, j) || objects[j][i] !== EMPTY || above[j][i] !== EMPTY || dirt[j][i]) {
          return false
        }
      }
    }
    return true
  }

  const putObject = (x: number, y: number, gid: number, solid: boolean) => {
    objects[y][x] = gid
    blocked[y][x] = solid
  }

  // --- Ground: grass with a few detail variants ---------------------------
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (rand() < 0.22) ground[y][x] = pick(GRASS_VARIANTS)
    }
  }

  // --- Houses (placed first so paths can treat the doors as open ends) ------
  const doorCells = new Set<string>()
  for (const [key, def] of Object.entries(HOUSE_PLACEMENTS) as [MiniGameKey, typeof HOUSE_PLACEMENTS[MiniGameKey]][]) {
    const { style, x, y } = def
    const door: TilePos = { x: x + HOUSE_DOOR_COL, y: y + HOUSE_HEIGHT - 1 }
    const tiles: TilePos[] = []
    for (let r = 0; r < HOUSE_HEIGHT; r++) {
      for (let c = 0; c < style.width; c++) {
        const isDoor = x + c === door.x && y + r === door.y
        putObject(x + c, y + r, tile(HOUSE, style.col + c, style.row + r), !isDoor)
        tiles.push({ x: x + c, y: y + r })
      }
    }
    doorCells.add(`${door.x},${door.y}`)
    houses.push({ key, tiles, door, labelAnchor: { x: x + style.width / 2, y } })

    // Bushes flanking the house wall
    putObject(x - 1, y + HOUSE_HEIGHT - 1, BUSHES[0], true)
    putObject(x + style.width, y + HOUSE_HEIGHT - 1, BUSHES[1], true)
  }

  // --- Dirt paths with a simple 3x3 auto-tile -------------------------------
  for (const [x0, y0, x1, y1] of PATH_RECTS) {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) dirt[y][x] = true
    }
  }
  // Door tiles count as dirt for neighbour checks so the path opens into the door
  const isDirtLike = (x: number, y: number) =>
    inBounds(x, y) && (dirt[y][x] || doorCells.has(`${x},${y}`))

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (!dirt[y][x]) continue
      const n = isDirtLike(x, y - 1)
      const s = isDirtLike(x, y + 1)
      const w = isDirtLike(x - 1, y)
      const e = isDirtLike(x + 1, y)
      let gid = PATH_C
      if (!n && !w) gid = PATH_TL
      else if (!n && !e) gid = PATH_TR
      else if (!s && !w) gid = PATH_BL
      else if (!s && !e) gid = PATH_BR
      else if (!n) gid = PATH_T
      else if (!s) gid = PATH_B
      else if (!w) gid = PATH_L
      else if (!e) gid = PATH_R
      ground[y][x] = gid
    }
  }

  // --- Ponds ----------------------------------------------------------------
  for (const { x, y, w, h } of PONDS) {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const top = j === 0
        const bottom = j === h - 1
        const left = i === 0
        const right = i === w - 1
        let gid = POND_C
        if (top && left) gid = POND_TL
        else if (top && right) gid = POND_TR
        else if (bottom && left) gid = POND_BL
        else if (bottom && right) gid = POND_BR
        else if (top) gid = POND_T
        else if (bottom) gid = POND_B
        else if (left) gid = POND_L
        else if (right) gid = POND_R
        putObject(x + i, y + j, gid, true)
      }
    }
  }

  // --- Trees ----------------------------------------------------------------
  // 2x2 tree: canopy row goes above the player, base row is solid below her.
  const placeTree = (x: number, y: number, sprite: { col: number; row: number }, solidCanopy: boolean) => {
    for (let i = 0; i < 2; i++) {
      above[y][x + i] = tile(NATURE, sprite.col + i, sprite.row)
      blocked[y][x + i] = blocked[y][x + i] || solidCanopy
      putObject(x + i, y + 1, tile(NATURE, sprite.col + i, sprite.row + 1), true)
    }
  }

  // Border: solid ring two tiles thick, made of overlapping-free 2x2 trees
  const ringTree = (x: number, y: number) =>
    placeTree(x, y, rand() < 0.7 ? TREE_PINE : TREE_ROUND, true)
  for (let x = 0; x < MAP_W; x += 2) {
    ringTree(x, 0)
    ringTree(x, MAP_H - 2)
  }
  for (let y = 2; y < MAP_H - 2; y += 2) {
    ringTree(0, y)
    ringTree(MAP_W - 2, y)
  }

  // Second, sparse row of trees inside the border so the edge feels like a forest
  const sparse = (x: number, y: number) => {
    if (rand() < 0.55 && isFree(x, y, 2, 2)) {
      placeTree(x, y, rand() < 0.7 ? TREE_PINE : TREE_ROUND, false)
    }
  }
  for (let x = 3; x < MAP_W - 4; x += 4) {
    sparse(x, 2)
    sparse(x, MAP_H - 4)
  }
  for (let y = 5; y < MAP_H - 5; y += 4) {
    sparse(2, y)
    sparse(MAP_W - 4, y)
  }

  for (const { x, y } of SMALL_TREES) {
    if (isFree(x, y, 2, 2)) placeTree(x, y, rand() < 0.5 ? TREE_PINE : TREE_ROUND, false)
  }

  for (const { x, y } of BIG_TREES) {
    if (!isFree(x, y, 3, 3)) continue
    for (let j = 0; j < 2; j++) {
      for (let i = 0; i < 3; i++) {
        above[y + j][x + i] = tile(NATURE, BIG_TREE.col + i, BIG_TREE.row + j)
      }
    }
    putObject(x + 1, y + 2, tile(NATURE, BIG_TREE.col + 1, BIG_TREE.row + 2), true)
  }

  // --- Rocks ----------------------------------------------------------------
  for (const { x, y } of BOULDERS) {
    if (!isFree(x, y, 2, 2)) continue
    for (let j = 0; j < 2; j++) {
      for (let i = 0; i < 2; i++) {
        putObject(x + i, y + j, tile(NATURE, BOULDER.col + i, BOULDER.row + j), true)
      }
    }
  }
  for (const { x, y } of ROCKS) {
    if (isFree(x, y)) putObject(x, y, pick(SMALL_ROCKS), true)
  }

  // --- Walk-over decoration -------------------------------------------------
  for (let y = 2; y < MAP_H - 2; y++) {
    for (let x = 2; x < MAP_W - 2; x++) {
      if (!isFree(x, y) || blocked[y][x]) continue
      const roll = rand()
      if (roll < 0.03) putObject(x, y, pick(FLOWERS), false)
      else if (roll < 0.08) putObject(x, y, pick(TUFTS), false)
    }
  }

  return { ground, objects, above, blocked, houses, spawn: SPAWN }
}
