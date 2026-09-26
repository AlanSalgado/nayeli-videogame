import { useState, useEffect } from 'react'
import MainMenu from './components/MainMenu'
import PhaserGame from './components/PhaserGame'
import EndScreen from './components/EndScreen'
import EventBridge from './game/EventBridge'
import { GameRegistry } from './game/registry'

type Screen = 'menu' | 'game' | 'ending'

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')

  useEffect(() => {
    const onComplete = () => setScreen('ending')
    EventBridge.on('game:complete', onComplete)
    return () => { EventBridge.off('game:complete', onComplete) }
  }, [])

  const handlePlay = () => setScreen('game')

  const handleReplay = () => {
    GameRegistry.reset()
    setScreen('menu')
  }

  if (screen === 'game') return <PhaserGame />
  if (screen === 'ending') return <EndScreen onReplay={handleReplay} />
  return <MainMenu onPlay={handlePlay} />
}
