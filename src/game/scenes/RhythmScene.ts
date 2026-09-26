import Phaser from 'phaser'
import { GameRegistry } from '../registry'
import EventBridge from '../EventBridge'

// Cada nota: { dir: 0=left 1=up 2=down 3=right, beat: tiempo en ms desde inicio }
const CHART: Array<{ dir: number; beat: number }> = [
  { dir: 0, beat: 1000 }, { dir: 1, beat: 1500 },
  { dir: 2, beat: 2000 }, { dir: 3, beat: 2500 },
  { dir: 0, beat: 3000 }, { dir: 3, beat: 3500 },
  { dir: 1, beat: 4000 }, { dir: 2, beat: 4500 },
  { dir: 0, beat: 5000 }, { dir: 1, beat: 5000 },
  { dir: 2, beat: 5500 }, { dir: 3, beat: 6000 },
  { dir: 1, beat: 6500 }, { dir: 0, beat: 7000 },
  { dir: 3, beat: 7500 }, { dir: 2, beat: 8000 },
  { dir: 0, beat: 8500 }, { dir: 1, beat: 9000 },
  { dir: 2, beat: 9500 }, { dir: 3, beat: 10000 },
  { dir: 1, beat: 10500 }, { dir: 0, beat: 11000 },
  { dir: 3, beat: 11500 }, { dir: 2, beat: 12000 },
]

const DIR_KEYS = [
  Phaser.Input.Keyboard.KeyCodes.LEFT,
  Phaser.Input.Keyboard.KeyCodes.UP,
  Phaser.Input.Keyboard.KeyCodes.DOWN,
  Phaser.Input.Keyboard.KeyCodes.RIGHT,
]
const DIR_LABELS = ['←', '↑', '↓', '→']
const DIR_COLORS = [0xff4444, 0x44ff44, 0xff8800, 0x4488ff]
const DIR_X = [160, 280, 400, 520]
const HIT_Y = 480
const SPAWN_Y = -30
const NOTE_SPEED = 280   // px/s
const HIT_WINDOW = 90    // ms de tolerancia

export default class RhythmScene extends Phaser.Scene {
  private keys: Phaser.Input.Keyboard.Key[] = []
  private notes: Array<{
    rect: Phaser.GameObjects.Rectangle
    dir: number
    beat: number
    hit: boolean
  }> = []
  private score = 0
  private combo = 0
  private maxCombo = 0
  private scoreText!: Phaser.GameObjects.Text
  private comboText!: Phaser.GameObjects.Text
  private feedbackText!: Phaser.GameObjects.Text
  private elapsed = 0
  private ended = false
  private chartIndex = 0
  private readonly totalNotes = CHART.length

  constructor() {
    super({ key: 'RhythmScene' })
  }

  create() {
    const { width, height } = this.scale
    this.score = 0
    this.combo = 0
    this.maxCombo = 0
    this.elapsed = 0
    this.ended = false
    this.chartIndex = 0
    this.notes = []

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a3a)
    this.add.text(width / 2, 25, '🎵 Ritmo', {
      fontSize: '26px', color: '#ffffff',
    }).setOrigin(0.5)

    // Línea de hit
    this.add.rectangle(width / 2, HIT_Y, width, 4, 0xffffff, 0.3)

    // Targets (zonas de hit)
    for (let i = 0; i < 4; i++) {
      this.add.rectangle(DIR_X[i], HIT_Y, 54, 54, DIR_COLORS[i], 0.25)
        .setStrokeStyle(2, DIR_COLORS[i], 0.7)
      this.add.text(DIR_X[i], HIT_Y, DIR_LABELS[i], {
        fontSize: '26px', color: '#ffffff',
      }).setOrigin(0.5)
    }

    // Teclas
    this.keys = DIR_KEYS.map(k => this.input.keyboard!.addKey(k))

    // HUD
    this.scoreText = this.add.text(20, 60, 'Puntos: 0', {
      fontSize: '17px', color: '#ffffff',
    })
    this.comboText = this.add.text(width - 20, 60, '', {
      fontSize: '17px', color: '#ffff88',
    }).setOrigin(1, 0)
    this.feedbackText = this.add.text(width / 2, HIT_Y - 60, '', {
      fontSize: '22px', color: '#ffff00',
    }).setOrigin(0.5)

    this.add.text(width / 2, height - 25, `← ↑ ↓ → para golpear las notas`, {
      fontSize: '13px', color: '#888888',
    }).setOrigin(0.5)

    this.cameras.main.fadeIn(400, 0, 0, 0)
  }

  update(_time: number, delta: number) {
    if (this.ended) return
    this.elapsed += delta

    // Spawn notas según el chart
    while (
      this.chartIndex < CHART.length &&
      this.elapsed >= CHART[this.chartIndex].beat - (HIT_Y - SPAWN_Y) / NOTE_SPEED * 1000
    ) {
      const note = CHART[this.chartIndex]
      const rect = this.add.rectangle(DIR_X[note.dir], SPAWN_Y, 50, 50, DIR_COLORS[note.dir])
        .setStrokeStyle(2, 0xffffff, 0.6)
      this.notes.push({ rect, dir: note.dir, beat: note.beat, hit: false })
      this.chartIndex++
    }

    // Mover notas
    for (const note of this.notes) {
      if (!note.hit) note.rect.y += NOTE_SPEED * (delta / 1000)
    }

    // Detectar teclas presionadas
    for (let i = 0; i < 4; i++) {
      if (Phaser.Input.Keyboard.JustDown(this.keys[i])) {
        this.tryHit(i)
      }
    }

    // Notas que pasaron la línea sin ser golpeadas → miss
    for (const note of this.notes) {
      if (!note.hit && note.rect.y > HIT_Y + HIT_WINDOW * NOTE_SPEED / 1000) {
        note.hit = true
        note.rect.destroy()
        this.combo = 0
        this.showFeedback('Miss', '#ff4444')
      }
    }

    // Limpiar notas destruidas
    this.notes = this.notes.filter(n => !n.hit || n.rect.active)

    // Fin cuando se procesaron todas las notas y ya no quedan activas
    if (this.chartIndex >= CHART.length && this.notes.filter(n => !n.hit).length === 0) {
      this.time.delayedCall(600, () => this.endGame())
    }
  }

  private findClosestNote(dir: number): { note: typeof this.notes[0]; diff: number } | null {
    let best: typeof this.notes[0] | null = null
    let bestDiff = Infinity
    for (const note of this.notes) {
      if (note.hit || note.dir !== dir) continue
      const diff = Math.abs(this.elapsed - note.beat)
      if (diff < bestDiff) { bestDiff = diff; best = note }
    }
    return best ? { note: best, diff: bestDiff } : null
  }

  private tryHit(dir: number) {
    const result = this.findClosestNote(dir)
    if (!result || result.diff > HIT_WINDOW * 2) return

    const { note, diff } = result
    note.hit = true
    note.rect.destroy()
    this.combo++
    if (this.combo > this.maxCombo) this.maxCombo = this.combo

    const perfect = diff <= HIT_WINDOW
    this.score += (perfect ? 100 : 50) * Math.min(this.combo, 4)
    this.scoreText.setText(`Puntos: ${this.score}`)
    this.comboText.setText(this.combo > 1 ? `x${this.combo} combo!` : '')
    this.showFeedback(perfect ? 'Perfect! ✓' : 'Good', perfect ? '#aaffaa' : '#ffff88')
  }

  private showFeedback(text: string, color: string) {
    this.feedbackText.setText(text).setColor(color)
    this.tweens.killTweensOf(this.feedbackText)
    this.feedbackText.setAlpha(1)
    this.tweens.add({ targets: this.feedbackText, alpha: 0, duration: 500, delay: 300 })
  }

  private endGame() {
    if (this.ended) return
    this.ended = true

    const { width, height } = this.scale
    const pct = Math.round((this.score / (this.totalNotes * 100)) * 100)
    const won = pct >= 40

    this.add.rectangle(width / 2, height / 2, 420, 240, 0x000000, 0.92).setDepth(5)
    this.add.text(width / 2, height / 2 - 70,
      won ? '¡Increíble! 🎵' : '¡Buen ritmo! 😊',
      { fontSize: '26px', color: won ? '#aaffaa' : '#ffaaaa' }
    ).setOrigin(0.5).setDepth(6)
    this.add.text(width / 2, height / 2 - 25,
      `Puntos: ${this.score}`,
      { fontSize: '20px', color: '#ffffff' }
    ).setOrigin(0.5).setDepth(6)
    this.add.text(width / 2, height / 2 + 10,
      `Combo máximo: x${this.maxCombo}`,
      { fontSize: '16px', color: '#ffff88' }
    ).setOrigin(0.5).setDepth(6)

    const btn = this.add.text(width / 2, height / 2 + 70, '[ Continuar ]', {
      fontSize: '20px', color: '#ff69b4', backgroundColor: '#333', padding: { x: 14, y: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(6)

    btn.on('pointerup', () => {
      GameRegistry.complete('rhythm')
      if (GameRegistry.isAllComplete()) EventBridge.emit('game:complete')
      this.scene.start('WorldScene')
    })
  }
}
