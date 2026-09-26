import Phaser from 'phaser'
import BootScene from './scenes/BootScene'
import IntroScene from './scenes/IntroScene'
import WorldScene from './scenes/WorldScene'
import TriviaScene from './scenes/TriviaScene'
import ShellGameScene from './scenes/ShellGameScene'
import SimonSaysScene from './scenes/SimonSaysScene'
import WhackAMoleScene from './scenes/WhackAMoleScene'
import RhythmScene from './scenes/RhythmScene'
import ObstacleRunnerScene from './scenes/ObstacleRunnerScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-container',
  backgroundColor: '#4a7c59',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    IntroScene,
    WorldScene,
    TriviaScene,
    ShellGameScene,
    SimonSaysScene,
    WhackAMoleScene,
    RhythmScene,
    ObstacleRunnerScene,
  ],
}

export default config
