"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Chess, type PieceSymbol, type Square } from "chess.js";
import { ChessPiece as Piece } from "./chess-piece";
import { premoveTargets, type Premove } from "@/lib/chess/premove";
import "./chess-board.css";
import "./board-interactions.css";

export type ChessBoardProps = {
  fen: string;
  orientation: "w" | "b";
  selected: string | null;
  legalTargets: string[];
  lastMove?: { from: string; to: string } | null;
  disabled: boolean;
  onSquare: (square: string) => void;
  onMove?: (from: string, to: string) => void;
  premoving?: boolean;
  premove?: Premove | null;
  onCancelPremove?: () => void;
};

const pieceNames: Record<PieceSymbol, string> = {
  p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king",
};

export function ChessBoard({ fen, orientation, selected, legalTargets, lastMove, disabled, onSquare, onMove, premoving = false, premove, onCancelPremove }: ChessBoardProps) {
  const game = useMemo(() => new Chess(fen), [fen]);
  const instructionsId = useId();
  const arrowId = useId().replaceAll(":", "");
  const board = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ from: Square; fen: string; id: number; x: number; y: number; annotation: boolean; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const skipAnimation = useRef<string | null>(null);
  const previousFen = useRef(fen);
  const [drag, setDrag] = useState<{ from: Square; fen: string; x: number; y: number; over: Square | null } | null>(null);
  const [markings, setMarkings] = useState<{ fen: string; arrows: { from: Square; to: Square }[]; squares: Square[] }>({ fen, arrows: [], squares: [] });
  const [drawing, setDrawing] = useState<{ from: Square; to: Square; fen: string } | null>(null);
  const [arrowStart, setArrowStart] = useState<{ from: Square; fen: string } | null>(null);
  const [focusedSquare, setFocusedSquare] = useState("e2");
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});
  const files = orientation === "w" ? "abcdefgh" : "hgfedcba";
  const ranks = orientation === "w" ? "87654321" : "12345678";

  const activeDrag = drag?.fen === fen && !disabled ? drag : null;
  const marks = markings.fen === fen ? markings : { arrows: [] as { from: Square; to: Square }[], squares: [] as Square[] };
  const visibleDrawing = drawing?.fen === fen ? drawing : null;

  function squareAt(x: number, y: number): Square | null {
    const bounds = board.current?.getBoundingClientRect();
    if (!bounds || x < bounds.left || y < bounds.top || x >= bounds.right || y >= bounds.bottom) return null;
    return `${files[Math.floor((x - bounds.left) / bounds.width * 8)]}${ranks[Math.floor((y - bounds.top) / bounds.height * 8)]}` as Square;
  }

  function point(square: string) {
    return { x: files.indexOf(square[0]) * 100 + 50, y: ranks.indexOf(square[1]) * 100 + 50 };
  }

  function toggleMark(from: Square, to: Square) {
    setMarkings(previous => {
      const old = previous.fen === fen ? previous : { arrows: [] as { from: Square; to: Square }[], squares: [] as Square[] };
      if (from === to) return { fen, arrows: old.arrows, squares: old.squares.includes(to) ? old.squares.filter(square => square !== to) : [...old.squares, to] };
      const exists = old.arrows.some(arrow => arrow.from === from && arrow.to === to);
      return { fen, squares: old.squares, arrows: exists ? old.arrows.filter(arrow => arrow.from !== from || arrow.to !== to) : [...old.arrows, { from, to }] };
    });
  }

  function pointerDown(event: PointerEvent<HTMLButtonElement>, square: Square) {
    if (event.button !== 0 && event.button !== 2) return;
    suppressClick.current = false;
    if (event.button === 2) onCancelPremove?.();
    setArrowStart(null);
    if (event.button === 0) {
      setMarkings({ fen, arrows: [], squares: [] });
      const piece = game.get(square);
      if (disabled || !onMove || piece?.color !== (premoving ? orientation : game.turn())) return;
    }
    event.stopPropagation();
    if (event.button === 2) event.preventDefault();
    gesture.current = { from: square, fen, id: event.pointerId, x: event.clientX, y: event.clientY, annotation: event.button === 2, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId || current.fen !== fen) return;
    const over = squareAt(event.clientX, event.clientY);
    if (current.annotation) { setDrawing(over ? { from: current.from, to: over, fen } : null); return; }
    if (disabled) return;
    if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 5) return;
    if (!current.moved) {
      current.moved = true;
      if (selected !== current.from) onSquare(current.from);
    }
    const bounds = board.current!.getBoundingClientRect();
    setDrag({ from: current.from, fen, x: (event.clientX - bounds.left) / bounds.width * 100, y: (event.clientY - bounds.top) / bounds.height * 100, over });
  }

  function pointerUp(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    gesture.current = null;
    setDrag(null); setDrawing(null);
    suppressClick.current = current.moved || current.annotation;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (current.fen !== fen) return;
    const to = squareAt(event.clientX, event.clientY);
    if (!to) return;
    if (current.annotation) {
      toggleMark(current.from, to);
    } else if (current.moved && !disabled && (premoving ? premoveTargets(game, current.from, orientation).includes(to) : game.moves({ square: current.from, verbose: true }).some(move => move.to === to))) {
      skipAnimation.current = `${current.from}${to}`;
      onMove?.(current.from, to);
    }
  }

  function cancelPointer() {
    const current = gesture.current;
    if (current) suppressClick.current = true;
    gesture.current = null;
    const element = current ? buttons.current[current.from] : null;
    if (current && element?.hasPointerCapture(current.id)) element.releasePointerCapture(current.id);
    setDrag(null); setDrawing(null);
  }

  const lastFrom = lastMove?.from;
  const lastTo = lastMove?.to;
  useLayoutEffect(() => {
    const changed = previousFen.current !== fen;
    previousFen.current = fen;
    if (!changed || (!lastFrom || !lastTo)) return;
    const skip = skipAnimation.current === `${lastFrom}${lastTo}`;
    skipAnimation.current = null;
    if (skip || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const movements = [{ from: lastFrom, to: lastTo }];
    const piece = game.get(lastTo as Square);
    if (piece?.type === "k" && Math.abs(lastFrom.charCodeAt(0) - lastTo.charCodeAt(0)) === 2) {
      const rank = lastTo[1];
      movements.push(lastTo[0] === "g" ? { from: `h${rank}`, to: `f${rank}` } : { from: `a${rank}`, to: `d${rank}` });
    }
    const animations = movements.flatMap(move => {
      const target = buttons.current[move.to]?.querySelector(".chess-piece");
      if (!target) return [];
      const squareSize = buttons.current[move.to]!.getBoundingClientRect().width;
      const dx = (files.indexOf(move.from[0]) - files.indexOf(move.to[0])) * squareSize;
      const dy = (ranks.indexOf(move.from[1]) - ranks.indexOf(move.to[1])) * squareSize;
      return [target.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], { duration: 170, easing: "cubic-bezier(.2,.7,.3,1)" })];
    });
    return () => animations.forEach(animation => animation.cancel());
  }, [fen, game, lastFrom, lastTo, files, ranks]);

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, row: number, column: number) {
    const key = event.key.toLowerCase();
    if (key === "m" || key === "a" || event.key === "Escape") {
      event.preventDefault(); event.stopPropagation();
      if (event.repeat) return;
      const square = `${files[column]}${ranks[row]}` as Square;
      if (event.key === "Escape") {
        onCancelPremove?.();
        cancelPointer();
        setArrowStart(null);
        setMarkings({ fen, arrows: [], squares: [] });
      } else if (key === "m") {
        toggleMark(square, square);
      } else if (arrowStart?.fen === fen) {
        toggleMark(arrowStart.from, square);
        setArrowStart(null);
      } else {
        setArrowStart({ from: square, fen });
      }
      return;
    }
    const offsets: Record<string, [number, number]> = {
      ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
    };
    if (event.key === "Enter" || event.key === " ") event.stopPropagation();
    const offset = offsets[event.key];
    if (!offset && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    event.stopPropagation();
    const nextRow = offset ? Math.max(0, Math.min(7, row + offset[0])) : row;
    const nextColumn = offset ? Math.max(0, Math.min(7, column + offset[1])) : event.key === "Home" ? 0 : 7;
    const square = `${files[nextColumn]}${ranks[nextRow]}`;
    setFocusedSquare(square);
    buttons.current[square]?.focus();
  }

  return (
    <div className="chess-board-wrap">
      <p id={instructionsId} className="chess-board-instructions">Click or drag a piece to move. Arrow keys move between squares; Enter or Space selects. Right-drag draws arrows; right-click marks a square. M toggles a square mark. Press A at an arrow’s source, then A at its destination. Escape cancels drawing and clears markings. A normal click also clears markings.</p>
      <p className="chess-board-instructions" role="status">{arrowStart?.fen === fen ? `Arrow starts at ${arrowStart.from}. Navigate to a destination and press A, or Escape to cancel.` : ""}</p>
      <div ref={board} className={`chess-board${activeDrag ? " is-dragging" : ""}`} onContextMenu={event => event.preventDefault()} role="grid" aria-label={`Chessboard, ${orientation === "w" ? "white" : "black"} at the bottom`} aria-describedby={instructionsId}>
        {[...ranks].map((rank, row) => (
          <div className="chess-board-row" role="row" key={rank}>
            {[...files].map((file, column) => {
              const square = `${file}${rank}` as Square;
              const piece = game.get(square);
              const target = legalTargets.includes(square);
              const inCheck = piece?.type === "k" && piece.color === game.turn() && game.isCheck();
              const isSelected = selected === square;
              const isLastMove = lastMove?.from === square || lastMove?.to === square;
              const isPremove = premove?.from === square || premove?.to === square;
              const dark = (file.charCodeAt(0) - 97 + Number(rank)) % 2 === 1;
              const label = `${square}, ${piece ? `${piece.color === "w" ? "white" : "black"} ${pieceNames[piece.type]}` : "empty"}${target ? premoving ? ", premove destination" : ", legal destination" : ""}${isLastMove ? ", last move" : ""}${inCheck ? ", in check" : ""}${marks.squares.includes(square) ? ", marked" : ""}${isPremove ? ", queued premove" : ""}`;
              return (
                <div role="gridcell" className="chess-board-cell" key={square}>
                  <button
                    type="button"
                    ref={(element) => { buttons.current[square] = element; }}
                    className={`chess-square ${dark ? "chess-square-dark" : "chess-square-light"}${isSelected ? " is-selected" : ""}${isLastMove ? " is-last-move" : ""}${target ? " is-legal-target" : ""}${inCheck ? " is-in-check" : ""}${activeDrag?.from === square ? " is-drag-source" : ""}${activeDrag?.over === square ? " is-drop-hover" : ""}${marks.squares.includes(square) ? " is-marked" : ""}${isPremove ? " is-premove" : ""}`}
                    aria-label={label}
                    aria-pressed={isSelected}
                    aria-disabled={disabled}
                    tabIndex={focusedSquare === square ? 0 : -1}
                    onFocus={() => setFocusedSquare(square)}
                    onKeyDown={(event) => handleKey(event, row, column)}
                    onPointerDown={event => pointerDown(event, square)}
                    onPointerMove={pointerMove}
                    onPointerUp={pointerUp}
                    onPointerCancel={cancelPointer}
                    onLostPointerCapture={cancelPointer}
                    onClick={event => {
                      if (suppressClick.current && event.detail > 0) { suppressClick.current = false; return; }
                      suppressClick.current = false;
                      setArrowStart(null);
                      setMarkings({ fen, arrows: [], squares: [] });
                      if (!disabled) onSquare(square);
                    }}
                  >
                    {column === 0 && <span className="chess-coordinate chess-rank" aria-hidden="true">{rank}</span>}
                    {row === 7 && <span className="chess-coordinate chess-file" aria-hidden="true">{file}</span>}
                    {piece && <Piece type={piece.type} color={piece.color} />}
                    {target && <span className={`chess-target${piece ? " chess-target-capture" : ""}`} aria-hidden="true" />}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
        <svg className="chess-annotations" viewBox="0 0 800 800" aria-hidden="true">
          <defs><marker id={arrowId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" /></marker></defs>
          {[...marks.arrows, ...(visibleDrawing && visibleDrawing.from !== visibleDrawing.to ? [visibleDrawing] : [])].map((arrow, index) => {
            const from = point(arrow.from), to = point(arrow.to);
            return <line key={`${arrow.from}${arrow.to}${index}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} markerEnd={`url(#${arrowId})`} />;
          })}
        </svg>
        {activeDrag && game.get(activeDrag.from) && <div className="chess-drag-piece" aria-hidden="true" style={{ left: `${activeDrag.x}%`, top: `${activeDrag.y}%` }}><Piece type={game.get(activeDrag.from)!.type} color={game.get(activeDrag.from)!.color} /></div>}
      </div>
    </div>
  );
}
