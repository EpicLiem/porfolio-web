import type { Chess, Square } from "chess.js";

export type Premove = { from: string; to: string; promotion?: string };

export function premoveTargets(game: Chess, from: string, side: "w" | "b"): string[] {
  if (!/^[a-h][1-8]$/.test(from)) return [];
  const piece = game.get(from as Square);
  if (!piece || piece.color !== side) return [];
  const file = from.charCodeAt(0) - 97;
  const rank = Number(from[1]);
  const targets: string[] = [];
  const rights = game.getCastlingRights(side);
  for (let x = 0; x < 8; x++) {
    for (let y = 1; y <= 8; y++) {
      const dx = Math.abs(x - file), dy = Math.abs(y - rank);
      if (!dx && !dy) continue;
      let possible = false;
      switch (piece.type) {
        case "p": {
          const forward = (y - rank) * (side === "w" ? 1 : -1);
          possible = (forward === 1 && dx <= 1) || (forward === 2 && dx === 0 && rank === (side === "w" ? 2 : 7));
          break;
        }
        case "n": possible = dx * dy === 2; break;
        case "b": possible = dx === dy; break;
        case "r": possible = dx === 0 || dy === 0; break;
        case "q": possible = dx === dy || dx === 0 || dy === 0; break;
        case "k":
          possible = dx <= 1 && dy <= 1;
          if (from === (side === "w" ? "e1" : "e8") && y === rank) {
            possible ||= (x === 6 && rights.k) || (x === 2 && rights.q);
          }
          break;
      }
      // Occupancy and check can change on the opponent's move; validate on execution.
      if (possible) targets.push(`${String.fromCharCode(97 + x)}${y}`);
    }
  }
  return targets;
}

export function legalPremove(game: Chess, premove: Premove | null): string | null {
  if (!premove) return null;
  const move = game.moves({ verbose: true }).find(move =>
    move.from === premove.from && move.to === premove.to && move.promotion === premove.promotion,
  );
  return move ? `${move.from}${move.to}${move.promotion ?? ""}` : null;
}
