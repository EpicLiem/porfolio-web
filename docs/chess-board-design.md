# Chessboard interaction revision

Direction: Chess.com's direct board interactions, adapted to the portfolio's coffee desktop. Energy 2, rhythm 2, motion 2. The board is the focal point; setup and move history sit in a quieter side panel. Existing desktop typography and rounding remain, with proportional coordinate lettering for quick scanning.

Reference behaviors: [click or drag movement](https://support.chess.com/en/articles/8557430-how-do-i-castle-on-chess-com), [right-drag analysis arrows](https://support.chess.com/en/articles/8568781-how-can-i-draw-arrows-on-the-board-like-streamers-do). No Chess.com assets or branding are used. The local classic pieces are Colin M. L. Burnett's GPL-2.0-or-later set, with source attribution and license in `public/chess/pieces/`.

Cream and roast squares keep the coffee identity while improving black-piece contrast. Gold square overlays identify selected and previous moves; muted dots indicate legal destinations and rings indicate captures. A red halo marks check. The bright clock identifies the active player; the low-clock color marks less than 20 seconds. Piece motion follows moves for 170 ms and is disabled by reduced-motion preference. Dragged pieces track the pointer directly. Captures come from actual move history.

The board retains click and keyboard play. Legal pointer drops route through the same promotion and game-state checks. Illegal drops return the piece. Promotion offers all four pieces over the board and restores focus when dismissed. Right-click toggles square marks, right-drag toggles arrows, and normal clicks or position changes clear them. All twelve trained time controls and local model inference remain unchanged.

Scope: desktop, per the user's separate mobile-site plan. No analysis engine is introduced.

## Verification and delivery gate

- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check`: passed. `npm run test:chess`: 15 passed.
- `node /tmp/check-chess-polish.cjs`: passed against production Chrome at desktop widths 1600, 1280, and 1024. Uses a deterministic worker stub to reach promotion: legal/illegal drag, click and keyboard moves, pointer/keyboard annotations and clearing, captures, promotion focus/Escape/knight choice, active clock, no horizontal overflow or page errors. Move-animation calls verified.
- `REDUCED=1 node /tmp/check-chess-polish.cjs`: same interactions passed, zero move animations under reduced motion.
- `node /tmp/check-chess-time-controls.cjs`: real model pair loaded, 15+10 human e4 received e5, 1+1 model opening as White passed. Reset, minimize/restore, clock/model context, keyboard isolation, and no page errors passed.
- Inspected `/tmp/chess-improved-setup.png` and `/tmp/chess-improved-game.png`; adjusted board height to keep player rows visible. Contrast checked for coordinate and clock colors; dark-square coordinates darkened to meet 4.5:1.

Antislop gate: hard gate passed for this scoped desktop revision; no invented content, dead controls, or new navigation. Purpose gate passed: square overlays convey moves/check, clock contrast conveys turn, and motion conveys piece travel. Liveliness passed: declared dials, board focal point, restrained gold accents, coffee palette and existing desktop type. Craftsmanship passed through the interactions above, actual inference, and screenshots. Mobile-site design remains outside this user-requested desktop scope.

Keyboard annotations: M toggles a square; A starts an arrow and A on the destination completes it; Escape clears. These keys stay inside the board and do not trigger desktop shortcuts.

## Premoves

One move can be queued while Liemfish thinks, by click, drag, or keyboard selection. A new queue replaces the previous one. Rust square overlays and the explicit queue label distinguish it from a completed move. Escape on the board, right-click, or Cancel premove clears it. Candidate destinations use piece geometry because the opponent may move a blocker or provide a capture; execution always checks full legality against the new position. Promotions require choosing a piece. Games ending, inference errors, and resets clear the queue. An unfinished promotion choice is dismissed if the opponent finishes first.

Execution costs at least 0.1 seconds, includes any additional elapsed time, then awards the configured increment only if the move succeeds. Move-duration history records that charge. A flagged clock cannot execute or receive increment.

## Sound

Short synthesized Web Audio cues accompany committed moves, captures, check, and game end. Move/capture cues use low descending triangle tones; check and end use quieter sine notes. No downloaded sound assets or additional dependencies. Check and game end take priority over ordinary move/capture cues. Queueing/selecting is silent; executing a premove sounds after the opponent move. Sound on/off uses a pressed-state button and a local-storage preference, with in-memory fallback when storage is blocked. Audio unlocks through a pointer or keyboard interaction, stops on mute/reset, and disposes when the chess window closes. Unsupported audio does not block play.

Sound verification: `npm run test:chess` 22 passed; lint, typecheck, production build, and diff checks passed. `node /tmp/check-chess-sound.cjs` verified nonzero real Web Audio signal through an analyser, distinct move/capture/check/end schedules, silent selection, mute, persistence across reload, a single end cue, context disposal, and no page errors. `node /tmp/check-premoves-sound.cjs` passed the premove regression scenarios plus silence while queued and two move cues for the AI reply and executed premove. Controlled worker replies make these sound checks deterministic; they do not assess model strength. The sound control follows the existing coffee button styling and keyboard focus treatment.

Verification: `npm run test:chess` passed 21 tests; lint, typecheck, build, and diff checks passed. `node /tmp/check-premoves.cjs` used a controlled worker to verify both colors, click/drag, replacement, all three cancel actions, illegal discard, conditional captures, underpromotion, model-input duration/clock values, reset with a stale response, and no page errors. `node /tmp/check-chess-polish.cjs` passed the existing board interaction regression checks. Inspected `/tmp/chess-premove.png` for queue highlights and controls. The existing design gate also passes for this addition: the new color encodes queued state, all controls are exercised, and no new assets or decorative motion are introduced.
