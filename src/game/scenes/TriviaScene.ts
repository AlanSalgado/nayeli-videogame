import Phaser from 'phaser'
import { TRIVIA_QUESTIONS, type TriviaQuestion } from '../data/triviaQuestions'
import { GameRegistry } from '../registry'
import EventBridge from '../EventBridge'

export default class TriviaScene extends Phaser.Scene {
  private questions: TriviaQuestion[] = []
  private current = 0
  private correct = 0
  private questionText!: Phaser.GameObjects.Text
  private progressText!: Phaser.GameObjects.Text
  private optionBtns: Phaser.GameObjects.Text[] = []
  private feedbackText!: Phaser.GameObjects.Text
  private waiting = false

  constructor() {
    super({ key: 'TriviaScene' })
  }

  create() {
    const { width, height } = this.scale
    this.current = 0
    this.correct = 0
    this.waiting = false

    // Mezclar preguntas
    this.questions = Phaser.Utils.Array.Shuffle([...TRIVIA_QUESTIONS]).slice(0, 5)

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a4e)
    this.add.text(width / 2, 30, '🎯 Trivia', {
      fontSize: '26px', color: '#ffffff',
    }).setOrigin(0.5)

    this.progressText = this.add.text(width / 2, 65, '', {
      fontSize: '15px', color: '#aaaaaa',
    }).setOrigin(0.5)

    this.questionText = this.add.text(width / 2, 140, '', {
      fontSize: '20px', color: '#ffffff', wordWrap: { width: width - 80 }, align: 'center',
    }).setOrigin(0.5)

    this.optionBtns = []
    const btnY = [240, 310, 380, 450]
    for (let i = 0; i < 4; i++) {
      const btn = this.add.text(width / 2, btnY[i], '', {
        fontSize: '17px', color: '#ffffff',
        backgroundColor: '#2a2a6e', padding: { x: 20, y: 10 },
        wordWrap: { width: width - 120 }, align: 'center',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      btn.on('pointerover', () => { if (!this.waiting) btn.setBackgroundColor('#3a3aaa') })
      btn.on('pointerout', () => { if (!this.waiting) btn.setBackgroundColor('#2a2a6e') })
      btn.on('pointerup', () => this.answer(i))
      this.optionBtns.push(btn)
    }

    this.feedbackText = this.add.text(width / 2, height - 50, '', {
      fontSize: '18px', color: '#aaffaa',
    }).setOrigin(0.5)

    this.showQuestion()
    this.cameras.main.fadeIn(400, 0, 0, 0)
  }

  private showQuestion() {
    const q = this.questions[this.current]
    this.progressText.setText(`Pregunta ${this.current + 1} de ${this.questions.length}`)
    this.questionText.setText(q.question)
    this.feedbackText.setText('')
    this.waiting = false
    const shuffled = Phaser.Utils.Array.Shuffle(
      q.options.map((text, i) => ({ text, isCorrect: i === q.correct }))
    )
    shuffled.forEach((opt, i) => {
      this.optionBtns[i].setText(opt.text)
        .setData('isCorrect', opt.isCorrect)
        .setBackgroundColor('#2a2a6e')
        .setAlpha(1)
    })
  }

  private answer(index: number) {
    if (this.waiting) return
    this.waiting = true
    const btn = this.optionBtns[index]
    const isCorrect = btn.getData('isCorrect') as boolean

    if (isCorrect) {
      this.correct++
      btn.setBackgroundColor('#2a6e2a')
      this.feedbackText.setText('¡Correcto! ✓').setColor('#aaffaa')
    } else {
      btn.setBackgroundColor('#6e2a2a')
      this.feedbackText.setText('Incorrecto ✗').setColor('#ffaaaa')
      // Marca la correcta en verde
      this.optionBtns.forEach(b => {
        if (b.getData('isCorrect')) b.setBackgroundColor('#2a6e2a')
      })
    }

    this.time.delayedCall(1200, () => {
      this.current++
      if (this.current >= this.questions.length) this.endGame()
      else this.showQuestion()
    })
  }

  private endGame() {
    const { width, height } = this.scale
    const won = this.correct >= Math.ceil(this.questions.length / 2)

    this.add.rectangle(width / 2, height / 2, 420, 220, 0x000000, 0.9).setDepth(5)
    this.add.text(width / 2, height / 2 - 55,
      won ? '¡Excelente! 🎉' : '¡Buen intento! 😊',
      { fontSize: '26px', color: won ? '#aaffaa' : '#ffaaaa' }
    ).setOrigin(0.5).setDepth(6)
    this.add.text(width / 2, height / 2,
      `${this.correct} de ${this.questions.length} correctas`,
      { fontSize: '20px', color: '#ffffff' }
    ).setOrigin(0.5).setDepth(6)

    const btn = this.add.text(width / 2, height / 2 + 60, '[ Continuar ]', {
      fontSize: '20px', color: '#ff69b4', backgroundColor: '#333', padding: { x: 14, y: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(6)

    btn.on('pointerup', () => {
      GameRegistry.complete('trivia')
      if (GameRegistry.isAllComplete()) EventBridge.emit('game:complete')
      this.scene.start('WorldScene')
    })
  }
}
