import type { PieceSymbol } from "chess.js";

export function ChessPiece({ type, color }: { type: PieceSymbol; color: "w" | "b" }) {
  return <span className={`chess-piece chess-piece-${color}`} aria-hidden="true" style={{ backgroundImage: `url(/chess/pieces/${color}${type.toUpperCase()}.svg)` }} />;
}
