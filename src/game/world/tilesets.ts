import Phaser from 'phaser'

export const TILE_SIZE = 16
const TILESET_PATH = 'assets/tilesets/ninja-adventure/'

export interface TilesetDef {
  /** Texture key and tilemap tileset name */
  key: string
  file: string
  /** Number of full tile columns / rows in the image */
  columns: number
  rows: number
  /** Global tile id of the first tile; ranges must not overlap between tilesets */
  firstgid: number
}

function defineTileset(
  key: string,
  file: string,
  imageWidth: number,
  imageHeight: number,
  firstgid: number,
): TilesetDef {
  return {
    key,
    file,
    columns: Math.floor(imageWidth / TILE_SIZE),
    // TilesetFloor is 417px tall: the trailing partial row is ignored
    rows: Math.floor(imageHeight / TILE_SIZE),
    firstgid,
  }
}

// Ninja Adventure tilesets (CC0), 16x16 tiles
export const FLOOR = defineTileset('ts-floor', 'TilesetFloor.png', 352, 417, 1)
export const NATURE = defineTileset('ts-nature', 'TilesetNature.png', 384, 336, 1001)
export const HOUSE = defineTileset('ts-house', 'TilesetHouse.png', 528, 368, 2001)
export const WATER = defineTileset('ts-water', 'TilesetWater.png', 448, 272, 3001)
export const DETAIL = defineTileset('ts-detail', 'TilesetFloorDetail.png', 256, 80, 4001)

export const ALL_TILESETS: TilesetDef[] = [FLOOR, NATURE, HOUSE, WATER, DETAIL]

/** Global tile id for the tile at (col, row) of a tileset */
export const tile = (set: TilesetDef, col: number, row: number) =>
  set.firstgid + row * set.columns + col

export function preloadVillageTilesets(scene: Phaser.Scene) {
  for (const set of ALL_TILESETS) {
    scene.load.image(set.key, TILESET_PATH + set.file)
  }
}

export function applyVillageTextureFilters(scene: Phaser.Scene) {
  // Nearest-neighbor keeps pixel art crisp without forcing pixelArt on the whole game
  for (const set of ALL_TILESETS) {
    scene.textures.get(set.key).setFilter(Phaser.Textures.FilterMode.NEAREST)
  }
}
