# nayeli-videogame — CLAUDE.md

## Qué es este proyecto

RPG de cumpleaños para la novia de Alan. Su nombre es **Nayeli**. Estilo Pokémon 2D top-down: la protagonista (Nayeli) recorre un mundo y completa 6 mini-juegos antes de llegar a una pantalla final de cumpleaños.

## Instrucciones de memoria

Cuando Alan pida guardar algo en memoria, siempre hacerlo en **tres lugares**:
1. **Engram** — via `mem_save`
2. **CLAUDE.md** — este archivo, en la raíz del proyecto
3. **memory/project_game_design.md** — en `C:\Users\alans\.claude\projects\c--personal-projects-nayeli-videogame\memory\`

## Reglas de commits

- Mensajes **en español**
- **Sin** línea `Co-Authored-By` — Alan no quiere que Claude aparezca en el registro

## Reglas de estilo

- **Nunca usar emojis/emoticones** (UI, textos del juego, código). Usar formas CSS o sprites pixel-art en su lugar.
- **Estilo visual 16-bit pixel art** (era SNES/GBA) en todo el juego. Perspectiva **top-down tipo Pokémon** (4 direcciones), no side-scroller; los juegos de acción citados son solo referencia estética. Inspiración: Super Mario, Contra, Metal Slug; Cuphead solo en jugabilidad/jefes (su arte dibujado a mano choca con el pixel art). Referencia: `src/components/MainMenu.css` — fuente Press Start 2P en múltiplos de 8px, colores en bandas duras sin blur, animaciones con `steps()`.

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

## Progreso del desarrollo

| Fase | Estado | Commit |
|---|---|---|
| 1 — Fundación (Phaser + mundo + movimiento) | ✅ Completada | `ab0c3e6` |
| 2 — Mundo con zonas, triggers, transiciones, HUD | ⏳ Pendiente | — |
| 3 — Mini-juegos: Golpea el topo + Shell game | ⏳ Pendiente | — |
| 4 — Mini-juegos: Trivia + Simon Says | ⏳ Pendiente | — |
| 5 — Mini-juegos: Obstáculos + Ritmo | ⏳ Pendiente | — |
| 6 — Historia y flujo narrativo | ⏳ Pendiente | — |
| 7 — Polish (audio, sprites, gamepad) | ⏳ Pendiente | — |

Plan completo: `C:\Users\alans\.claude\plans\bubbly-snuggling-rose.md`
