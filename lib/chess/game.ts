import { Chess } from "chess.js";

export function replayGame(moves: string[]) {
  const game = new Chess();
  const historyFens = [game.fen()];
  for (const uci of moves) {
    game.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    historyFens.push(game.fen());
  }
  return { game, historyFens: historyFens.slice(-8) };
}

export function gameResult(game: Chess): string | null {
  if (game.isCheckmate()) return `${game.turn() === "w" ? "Black" : "White"} wins by checkmate.`;
  if (game.isStalemate()) return "Draw by stalemate.";
  if (game.isThreefoldRepetition()) return "Draw by threefold repetition.";
  if (game.isInsufficientMaterial()) return "Draw by insufficient material.";
  if (game.isDrawByFiftyMoves()) return "Draw by the fifty-move rule.";
  return null;
}

export function timeoutResult(game: Chess, flagged: "w" | "b") {
  const winner = flagged === "w" ? "b" : "w";
  const pieces = game.board().flat().filter(piece => piece?.color === winner);
  if (pieces.length === 1 || game.isInsufficientMaterial()) return "Draw on time: insufficient mating material.";
  return `${winner === "w" ? "White" : "Black"} wins on time.`;
}
