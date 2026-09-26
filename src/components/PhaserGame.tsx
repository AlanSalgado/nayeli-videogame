import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import config from '../game/config'

export default function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    gameRef.current = new Phaser.Game(config)

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return <div id="phaser-container" />
}
