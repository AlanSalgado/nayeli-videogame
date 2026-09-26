import { useState } from 'react'
import PhaserGame from './components/PhaserGame'
import './App.css'

type Screen = 'menu' | 'game'

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')

  if (screen === 'game') {
    return <PhaserGame />
  }

  return (
    <div className="menu">
      <h1>🎂 Nayeli's Adventure</h1>
      <p>Un mundo especial te espera...</p>
      <button onClick={() => setScreen('game')}>Jugar</button>
    </div>
  )
}
