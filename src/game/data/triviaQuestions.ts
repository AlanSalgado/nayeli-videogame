export interface TriviaQuestion {
  question: string
  options: string[]
  correct: number // índice de la respuesta correcta
}

// Preguntas placeholder — Alan debe personalizar estas con detalles reales de su relación
export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    question: '¿Dónde nos conocimos?',
    options: ['En la escuela', 'En una fiesta', 'Por internet', 'En el trabajo'],
    correct: 0,
  },
  {
    question: '¿Cuál es mi color favorito?',
    options: ['Azul', 'Verde', 'Rosa', 'Morado'],
    correct: 2,
  },
  {
    question: '¿Cuál fue nuestra primera película juntos?',
    options: ['Titanic', 'Toy Story', 'La La Land', 'El Rey León'],
    correct: 2,
  },
  {
    question: '¿Cuál es mi comida favorita?',
    options: ['Pizza', 'Tacos', 'Sushi', 'Hamburguesas'],
    correct: 1,
  },
  {
    question: '¿En qué mes es mi cumpleaños?',
    options: ['Enero', 'Marzo', 'Junio', 'Octubre'],
    correct: 1,
  },
  {
    question: '¿Cuál es mi canción favorita?',
    options: ['Perfect - Ed Sheeran', 'Amor eterno', 'La bamba', 'Bohemian Rhapsody'],
    correct: 0,
  },
]
