import Phaser from 'phaser'
import { createNayeliAnims, preloadNayeli } from '../characters/nayeli'
import { applyVillageTextureFilters, preloadVillageTilesets } from '../world/tilesets'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    preloadNayeli(this)
    preloadVillageTilesets(this)
  }

  create() {
    applyVillageTextureFilters(this)
    // Animations live in the global AnimationManager, so every scene can use them
    createNayeliAnims(this)
    this.scene.start('WorldScene')
  }
}
