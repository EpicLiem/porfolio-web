"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PieceSymbol, Square } from "chess.js";
import { loadModel, predict, disposeModel } from "@/lib/chess/model";
import { clockNow, newClock, clockSeconds, pauseClock, completeTurn, completePremove, waitForTarget } from "@/lib/chess/clock";
import { premoveTargets, legalPremove, type Premove } from "@/lib/chess/premove";
import { gameResult, replayGame, timeoutResult } from "@/lib/chess/game";
import { DEFAULT_TIME_CONTROL, TRAINED_TIME_CONTROLS } from "@/lib/chess/time-controls";
import { ChessBoard } from "./chess-board";
import { ChessPiece } from "./chess-piece";
import { useChessSound } from "./use-chess-sound";
import "./chess-window.css";

type Phase = "setup" | "loading" | "playing" | "thinking" | "error" | "ended";
type Side = "w" | "b";

function formatClock(seconds: number) { const whole = Math.max(0, Math.ceil(seconds)); return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`; }

function Captures({ pieces, color }: { pieces: PieceSymbol[]; color: Side }) {
  return <span className="chess-captures" aria-label={`${pieces.length} captured pieces`}>
    {pieces.map((piece, index) => <ChessPiece key={index} type={piece} color={color} />)}
  </span>;
}

export function ChessWindow() {
  const [moves, setMoves] = useState<string[]>([]);
  const currentMoves = useRef<string[]>([]);
  const [timeControl, setTimeControl] = useState(DEFAULT_TIME_CONTROL);
  const [side, setSide] = useState<Side>("w");
  const [phase, setPhase] = useState<Phase>("setup");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<{ from: string; to: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [premove, setPremove] = useState<Premove | null>(null);
  const queuedMove = useRef<Premove | null>(null);
  const clock = useRef(newClock());
  const [clocks, setClocks] = useState({ w: 600, b: 600 });
  const generation = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const promotionChoice = useRef<HTMLButtonElement>(null);
  const { game } = useMemo(() => replayGame(moves), [moves]);
  const legal = selected ? game.moves({ square: selected as Square, verbose: true }) : [];
  const premoving = phase === "thinking";
  const targets = premoving && selected ? premoveTargets(game, selected, side) : legal.map(move => move.to);
  const { result, history, captures } = useMemo(() => {
    const entries = game.history({ verbose: true });
    return {
      result: gameResult(game),
      history: entries.map(move => move.san),
      captures: entries.filter(move => move.captured),
    };
  }, [game]);
  const last = moves.at(-1);
  const capturedBy = (color: Side) => captures.filter(move => move.color === color).map(move => move.captured!);
  const opponent = side === "w" ? "b" : "w";
  const clockActive = phase === "playing" || phase === "thinking";
  const sound = useChessSound(moves, phase === "ended");

  function cancelPremove() {
    queuedMove.current = null;
    setPremove(null);
    setSelected(null);
    setPromotion(null);
  }

  useEffect(() => {
    if (!promotion) return;
    const previous = document.activeElement as HTMLElement | null;
    promotionChoice.current?.focus();
    return () => previous?.focus();
  }, [promotion]);

  useEffect(() => {
    if (!clockActive) return;
    const timer = setInterval(() => {
      if (!clock.current.running) return;
      const remaining = clockSeconds(clock.current, clockNow());
      // Re-render only when a displayed second changes, not on every 100 ms tick.
      setClocks(previous => Math.ceil(previous.w) === Math.ceil(remaining.w) && Math.ceil(previous.b) === Math.ceil(remaining.b) ? previous : remaining);
      if (remaining[clock.current.turn] <= 0) {
        clock.current.running = false;
        generation.current++;
        abort.current?.abort();
        cancelPremove();
        setMessage(timeoutResult(replayGame(currentMoves.current).game, clock.current.turn));
        setPhase("ended");
      }
    }, 100);
    return () => clearInterval(timer);
  }, [clockActive]);
  useEffect(() => () => {
    generation.current++;
    abort.current?.abort();
    disposeModel();
  }, []);

  async function computerMove(nextMoves: string[], token: number) {
    const position = replayGame(nextMoves);
    if (gameResult(position.game)) { setPhase("ended"); return; }
    if (!clock.current.running) { clock.current.startedAt = clockNow(); clock.current.running = true; }
    const turnStart = clock.current.startedAt;
    const ai = position.game.turn();
    const opponent = ai === "w" ? "b" : "w";
    setPhase("thinking");
    setMessage("");
    const controller = new AbortController();
    abort.current = controller;
    try {
      const reply = await predict({
        fen: position.game.fen(), historyFens: position.historyFens,
        initialSeconds: clock.current.initialSeconds, incrementSeconds: clock.current.incrementSeconds, remainingSeconds: clock.current.remaining[ai],
        opponentRemainingSeconds: clock.current.remaining[opponent],
        ownTimeHistory: clock.current.history[ai], opponentTimeHistory: clock.current.history[opponent],
        previousMoveWasCapture: !!position.game.history({ verbose: true }).at(-1)?.captured,
        eloSelf: 491, eloOpponent: 529,
      }, { signal: controller.signal });
      if (token !== generation.current) return;
      await waitForTarget(turnStart, reply.targetSeconds, controller.signal);
      if (token !== generation.current) return;
      const next = [...nextMoves, reply.uci];
      const checked = replayGame(next);
      if (!completeTurn(clock.current, clockNow())) { cancelPremove(); setMessage(timeoutResult(position.game, ai)); setPhase("ended"); return; }
      setClocks({ ...clock.current.remaining });
      if (gameResult(checked.game)) clock.current.running = false;
      currentMoves.current = next;
      setMoves(next);
      const queued = queuedMove.current;
      cancelPremove();
      const uci = !gameResult(checked.game) ? legalPremove(checked.game, queued) : null;
      if (uci) {
        if (!completePremove(clock.current, clockNow())) { setClocks({ ...clock.current.remaining }); setMessage(timeoutResult(checked.game, opponent)); setPhase("ended"); return; }
        const premoved = [...next, uci];
        const after = replayGame(premoved);
        currentMoves.current = premoved;
        setMoves(premoved);
        setClocks({ ...clock.current.remaining });
        if (gameResult(after.game)) { clock.current.running = false; setPhase("ended"); }
        else void computerMove(premoved, token);
        return;
      }
      if (queued && !gameResult(checked.game)) setMessage("Premove canceled: it is no longer legal.");
      setPhase(gameResult(checked.game) ? "ended" : "playing");
    } catch (error) {
      if (token !== generation.current || controller.signal.aborted) return;
      pauseClock(clock.current, clockNow());
      cancelPremove();
      setMessage(error instanceof Error ? error.message : "The model couldn't choose a move. Try again.");
      setPhase("error");
    }
  }

  async function start() {
    const token = ++generation.current;
    abort.current?.abort();
    cancelPremove();
    clock.current = newClock(timeControl.initialSeconds, timeControl.incrementSeconds);
    setClocks({ ...clock.current.remaining });
    setPhase("loading");
    setMessage("Loading the personalized model…");
    try {
      await loadModel(progress => {
        if (token !== generation.current) return;
        setMessage(progress.phase === "ready" ? "Model ready." : progress.phase === "initializing" ? "Preparing the chess model…" : `Downloading model${progress.total ? ` · ${Math.round(progress.loaded / progress.total * 100)}%` : "…"}`);
      });
      if (token !== generation.current) return;
      setMessage("");
      clock.current.startedAt = clockNow(); clock.current.running = true;
      if (side === "b") await computerMove([], token);
      else setPhase("playing");
    } catch (error) {
      if (token !== generation.current) return;
      setMessage(error instanceof Error ? error.message : "The model couldn't load. Please try again.");
      setPhase("setup");
    }
  }

  async function retryMove() {
    const token = generation.current;
    setPhase("loading"); setMessage("Reconnecting to the local model…");
    try {
      await loadModel();
      if (token === generation.current) await computerMove(moves, token);
    } catch (error) {
      if (token !== generation.current) return;
      setMessage(error instanceof Error ? error.message : "The model is unavailable. Please try again.");
      setPhase("error");
    }
  }

  function play(from: string, to: string, promote?: string) {
    const nextMoves = [...moves, `${from}${to}${promote ?? ""}`];
    const next = replayGame(nextMoves);
    if (!completeTurn(clock.current, clockNow())) { setMessage(timeoutResult(game, side)); setPhase("ended"); return; }
    setClocks({ ...clock.current.remaining });
    currentMoves.current = nextMoves;
    setMoves(nextMoves);
    setSelected(null);
    setPromotion(null);
    if (gameResult(next.game)) { clock.current.running = false; setPhase("ended"); }
    else void computerMove(nextMoves, generation.current);
  }

  function select(square: string) {
    if ((phase !== "playing" && !premoving) || promotion) return;
    if (selected && targets.includes(square)) {
      movePiece(selected, square);
    } else setSelected(game.get(square as Square)?.color === side && selected !== square ? square : null);
  }

  function movePiece(from: string, to: string, promote?: string) {
    if (premoving) {
      if (!premoveTargets(game, from, side).includes(to)) return;
      if (game.get(from as Square)?.type === "p" && (to[1] === "1" || to[1] === "8") && !promote) { setPromotion({ from, to }); return; }
      const next = { from, to, promotion: promote };
      queuedMove.current = next;
      setPremove(next);
      setSelected(null);
      setPromotion(null);
      return;
    }
    if (phase !== "playing" || game.turn() !== side) return;
    const move = game.moves({ square: from as Square, verbose: true }).find(move => move.to === to);
    if (!move) return;
    if (move.promotion && !promote) setPromotion({ from, to });
    else play(from, to, promote);
  }

  function reset() {
    generation.current++;
    abort.current?.abort();
    cancelPremove();
    clock.current = newClock(timeControl.initialSeconds, timeControl.incrementSeconds); setClocks({ ...clock.current.remaining });
    currentMoves.current = [];
    setMoves([]); setSelected(null); setPromotion(null); setMessage(""); setPhase("setup"); setConfirmReset(false);
  }

  const status = result ?? (phase === "thinking" ? "Liemfish is thinking…" : phase === "playing" ? `Your move${game.isCheck() ? " · check" : ""}.` : phase === "ended" ? message : phase === "error" ? "Move interrupted." : phase === "loading" ? message : "Choose a side and pull up a chair.");
  return <div className="chess-app" onPointerDownCapture={sound.unlock} onKeyDownCapture={sound.unlock}>
    <header className="chess-heading"><div><h2>Play Liemfish</h2><p>A chess model trained on my games.</p></div><span className="chess-mode">{timeControl.label}</span></header>
    <div className="chess-layout">
      <div className="chess-table">
        <div className="chess-player"><div className="chess-player-info"><strong>Liemfish <span>· {opponent === "b" ? "black" : "white"}</span></strong><Captures pieces={capturedBy(opponent)} color={side} /></div><time className={`chess-clock${clockActive && game.turn() === opponent ? " is-active" : ""}${clocks[opponent] < 20 ? " is-low" : ""}`} aria-label="Liemfish time remaining">{formatClock(clocks[opponent])}</time></div>
        <div className="chess-board-shell">
          <ChessBoard fen={game.fen()} orientation={side} selected={selected} legalTargets={targets} lastMove={last ? { from: last.slice(0, 2), to: last.slice(2, 4) } : null} disabled={(phase !== "playing" && !premoving) || !!promotion} onSquare={select} onMove={movePiece} premoving={premoving} premove={premove} onCancelPremove={cancelPremove} />
          {promotion && <div className="chess-promotion-shade"><fieldset className="chess-promotion" onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); setPromotion(null); } }}><legend>Promote your pawn</legend><div>{([['q','Queen'],['r','Rook'],['b','Bishop'],['n','Knight']] as const).map(([piece,label],index) => <button ref={index === 0 ? promotionChoice : undefined} key={piece} aria-label={`Promote to ${label.toLowerCase()}`} onClick={() => movePiece(promotion.from,promotion.to,piece)}><ChessPiece type={piece} color={side} /><span>{label}</span></button>)}</div><button onClick={() => setPromotion(null)}>Cancel</button></fieldset></div>}
        </div>
        <div className="chess-player"><div className="chess-player-info"><strong>You <span>· {side === "w" ? "white" : "black"}</span></strong><Captures pieces={capturedBy(side)} color={opponent} /></div><time className={`chess-clock${clockActive && game.turn() === side ? " is-active" : ""}${clocks[side] < 20 ? " is-low" : ""}`} aria-label="Your time remaining">{formatClock(clocks[side])}</time></div>
        <p className="chess-board-hint">Drag or click to move · Right-drag to draw an arrow</p>
      </div>
      <aside className="chess-notes" aria-label="Game controls and moves">
        <button className="chess-sound-toggle" aria-pressed={sound.enabled} onClick={sound.toggle}>Sound {sound.enabled ? "on" : "off"}</button>
        <p className="chess-status" role="status" aria-live="polite">{status}</p>
        {premoving && <div className="chess-premove-status" role="status">{premove ? <><span>Premove: {premove.from}–{premove.to}{premove.promotion ? `=${premove.promotion.toUpperCase()}` : ""}</span><button onClick={cancelPremove}>Cancel premove</button></> : <span>You can queue your next move.</span>}</div>}
        {phase === "playing" && message && <p className="chess-small" role="status">{message}</p>}
        {phase === "setup" && <div className="chess-start">
          <fieldset><legend>Your pieces</legend><label><input type="radio" name="chess-side" checked={side === "w"} onChange={() => setSide("w")} /> White</label><label><input type="radio" name="chess-side" checked={side === "b"} onChange={() => setSide("b")} /> Black</label></fieldset>
          <label className="chess-time-control">Time control
            <select value={timeControl.id} onChange={event => {
              const control = TRAINED_TIME_CONTROLS.find(item => item.id === event.target.value)!;
              setTimeControl(control);
              clock.current = newClock(control.initialSeconds, control.incrementSeconds);
              setClocks({ ...clock.current.remaining });
            }}>{TRAINED_TIME_CONTROLS.map(control => <option key={control.id} value={control.id}>{control.label}</option>)}</select>
          </label>
          <button className="chess-primary" onClick={() => { void start(); }}>Start game</button>
          <p className="chess-small">Loads an approximately 92 MB model on first play. Moves are generated on your device.</p>
          {message && <p role="alert">{message}</p>}
        </div>}
        {phase === "error" && <div><p role="alert">{message}</p><button onClick={() => { void retryMove(); }}>Retry move</button></div>}
        {phase !== "setup" && <div className="chess-actions">{confirmReset ? <><span>End this game?</span><button onClick={reset}>Start over</button><button onClick={() => setConfirmReset(false)}>Keep playing</button></> : <button onClick={() => { if (phase === "ended" || moves.length === 0) reset(); else setConfirmReset(true); }}>New game</button>}</div>}
        <h3>Moves</h3>
        {history.length ? <ol className="chess-moves">{Array.from({length:Math.ceil(history.length / 2)},(_,i)=><li key={i}><span>{i+1}.</span><span>{history[i*2]}</span><span>{history[i*2+1] ?? "…"}</span></li>)}</ol> : <p className="chess-small">Your game starts here.</p>}
        <details className="chess-about"><summary>About this opponent</summary><p>A Maia3 model personalized on my Chess.com and Lichess games, with twelve time controls represented in its training data. One move model supports all twelve settings. It samples legal moves from what it learned, so each game can be different.</p><p>The timing model also learns when to pause before moving. The move model was retuned on my 2024–2025 games and selected against games from 2026; this is an imitation of those games, not a strength-rated engine.</p><p><a href="https://github.com/EpicLiem/liemfish" target="_blank" rel="noopener noreferrer">Liemfish on GitHub</a></p><p>Chess pieces by Colin M. L. Burnett, <a href="/chess/pieces/README.md">GPL-2.0-or-later</a>. Sounds from the Lichess SFX set by Enigmahack, <a href="/chess/sounds/README.md">AGPL-3.0-or-later</a>.</p></details>
      </aside>
    </div>
  </div>;
}
