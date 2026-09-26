import './MainMenu.css'

interface Props {
  onPlay: () => void
}

export default function MainMenu({ onPlay }: Props) {
  return (
    <div className="main-menu">
      <div className="main-menu__stars" aria-hidden="true">
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      <div className="main-menu__content">
        <p className="main-menu__subtitle">Un mundo hecho para ti</p>
        <h1 className="main-menu__title">Nayeli's Adventure</h1>
        <p className="main-menu__tagline">🎂 Feliz Cumpleaños 🎂</p>
        <button className="main-menu__btn" onClick={onPlay}>
          ¡Jugar!
        </button>
      </div>
    </div>
  )
}
