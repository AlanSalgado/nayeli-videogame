# nayeli-videogame — CLAUDE.md

## Qué es este proyecto

RPG de cumpleaños para la novia de Alan. Su nombre es **Nayeli**. Estilo Pokémon 2D top-down: la protagonista (Nayeli) recorre un mundo y completa 6 mini-juegos antes de llegar a una pantalla final de cumpleaños.

## Instrucciones de memoria

Cuando Alan pida guardar algo en memoria, siempre hacerlo en **tres lugares**:
1. **Engram** — via `mem_save`
2. **CLAUDE.md** — este archivo, en la raíz del proyecto
3. **memory/project_game_design.md** — en `C:\Users\alans\.claude\projects\c--personal-projects-nayeli-videogame\memory\`

## Tech stack

- React 19 + TypeScript + Vite 8
- Phaser 4 (motor de juego)

## Flujo del juego

```
Pantalla de inicio → Mundo explorable → Mini-juegos (1–6) → Pantalla final de cumpleaños
```

## Mini-juegos (orden tentativo)

| # | Mini-juego | Mecánica | Control |
|---|---|---|---|
| 1 | Trivia de la relación | Click en respuesta correcta | Mouse |
| 2 | Shell game (la bolita) | Seguir la bolita | Mouse |
| 3 | Simon Says (colores) | Memorizar y repetir secuencia | Mouse |
| 4 | Golpea el topo | Click rápido | Mouse |
| 5 | Ritmo con flechas | Guitar Hero style (←↑↓→), sincronizable con canción | Teclado |
| 6 | Carrera de obstáculos | Chrome dino style, saltar obstáculos | Space / ↑ |

## Arquitectura

- Cada mini-juego es una **Phaser Scene** separada
- React maneja menús, pantalla de inicio y pantalla final
- Sprites: placeholders/assets gratuitos de itch.io por ahora; sprites personalizados después

## Controles

- **Primario:** teclado + mouse
- **Secundario (futuro):** control Bluetooth — Phaser 4 tiene soporte nativo via Gamepad API

## Comandos

```bash
npm run dev      # Desarrollo con hot-reload (localhost:5173)
npm run build    # Build de producción
npm run preview  # Previsualizar build
```
