import { useEffect, useRef } from 'react'
import './EndScreen.css'

interface Props {
  onReplay: () => void
}

// Alan: personaliza el mensaje aquí
const BIRTHDAY_MESSAGE = `Hoy es tu día, Nayeli. 🎂

Cada mini-juego que completaste fue una pequeña aventura,
y esta es solo una de las muchas que viviremos juntos.

Gracias por ser la protagonista de mi historia.

Te quiero mucho. ❤️`

export default function EndScreen({ onReplay }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animación de corazones flotantes
    const container = containerRef.current
    if (!container) return

    const interval = setInterval(() => {
      const heart = document.createElement('span')
      heart.textContent = ['❤️', '💖', '🎂', '🌟', '🎉'][Math.floor(Math.random() * 5)]
      heart.className = 'floating-heart'
      heart.style.left = `${Math.random() * 100}%`
      heart.style.animationDuration = `${2 + Math.random() * 2}s`
      container.appendChild(heart)
      setTimeout(() => heart.remove(), 4000)
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="end-screen" ref={containerRef}>
      <div className="end-screen__content">
        <h1 className="end-screen__title">¡Feliz Cumpleaños, Nayeli! 🎂</h1>
        <div className="end-screen__stars">⭐ ⭐ ⭐ ⭐ ⭐ ⭐</div>
        <p className="end-screen__message">{BIRTHDAY_MESSAGE}</p>
        <button className="end-screen__btn" onClick={onReplay}>
          ¡Jugar de nuevo!
        </button>
      </div>
    </div>
  )
}
