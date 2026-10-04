import { useMemo, useState } from 'react'
import './MainMenu.css'

interface Props {
  onPlay: () => void
}

export default function MainMenu({ onPlay }: Props) {
  const [starting, setStarting] = useState(false)

  const handlePlay = () => {
    if (starting) return
    // animationend never fires without motion, so skip the iris entirely
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onPlay()
      return
    }
    setStarting(true)
  }

  // Memoized so stars don't jump around on re-render
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 65}%`,
        animationDelay: `${Math.random() * 3}s`,
        big: Math.random() > 0.8,
      })),
    [],
  )

  return (
    <div className={`main-menu${starting ? ' main-menu--starting' : ''}`}>
      <div className="main-menu__stars" aria-hidden="true">
        {stars.map((s, i) => (
          <span
            key={i}
            className={`star${s.big ? ' star--big' : ''}`}
            style={{ left: s.left, top: s.top, animationDelay: s.animationDelay }}
          />
        ))}
      </div>
      <div className="main-menu__moon" aria-hidden="true" />
      <div className="main-menu__ground" aria-hidden="true" />

      <div className="main-menu__content">
        <p className="main-menu__subtitle">Un mundo hecho para ti</p>
        <h1 className="main-menu__title">
          <span>Nayeli's</span>
          <span>Adventure</span>
        </h1>

        <div className="main-menu__box">
          <button className="main-menu__btn" onClick={handlePlay} disabled={starting} autoFocus>
            Jugar
          </button>
        </div>

        <p className="main-menu__press">Presiona Enter</p>
      </div>

      {starting && (
        <div className="main-menu__iris" aria-hidden="true" onAnimationEnd={onPlay} />
      )}
    </div>
  )
}
