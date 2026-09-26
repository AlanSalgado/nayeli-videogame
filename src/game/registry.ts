export type MiniGameKey =
  | 'trivia'
  | 'shellGame'
  | 'simonSays'
  | 'whackAMole'
  | 'rhythm'
  | 'obstacleRunner'

export const MINI_GAMES: MiniGameKey[] = [
  'trivia',
  'shellGame',
  'simonSays',
  'whackAMole',
  'rhythm',
  'obstacleRunner',
]

export const MINI_GAME_LABELS: Record<MiniGameKey, string> = {
  trivia: 'Trivia',
  shellGame: 'La bolita',
  simonSays: 'Simon Says',
  whackAMole: 'Golpea el topo',
  rhythm: 'Ritmo',
  obstacleRunner: 'Carrera',
}

export const SCENE_KEYS: Record<MiniGameKey, string> = {
  trivia: 'TriviaScene',
  shellGame: 'ShellGameScene',
  simonSays: 'SimonSaysScene',
  whackAMole: 'WhackAMoleScene',
  rhythm: 'RhythmScene',
  obstacleRunner: 'ObstacleRunnerScene',
}

const completedGames = new Set<MiniGameKey>()

export const GameRegistry = {
  complete(key: MiniGameKey) {
    completedGames.add(key)
  },
  isComplete(key: MiniGameKey) {
    return completedGames.has(key)
  },
  completedCount() {
    return completedGames.size
  },
  isAllComplete() {
    return completedGames.size === MINI_GAMES.length
  },
  reset() {
    completedGames.clear()
  },
}
