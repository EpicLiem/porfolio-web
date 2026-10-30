"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Chess } from "chess.js";
import { ChessAudio, moveSound } from "@/lib/chess/sound";

const preferenceKey = "liemfish-sound";
const preferenceEvent = "liemfish-sound-change";
let fallbackEnabled: boolean | undefined;
function readEnabled() {
  if (fallbackEnabled !== undefined) return fallbackEnabled;
  try { return localStorage.getItem(preferenceKey) !== "off"; }
  catch { return true; }
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(preferenceEvent, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(preferenceEvent, callback); };
}

export function useChessSound(moves: string[], ended: boolean) {
  const enabled = useSyncExternalStore(subscribe, readEnabled, () => true);
  const [audio] = useState(() => new ChessAudio());
  const previous = useRef({ moves: [] as string[], ended: false });
  useEffect(() => { audio.setMuted(!enabled); }, [audio, enabled]);
  useEffect(() => () => audio.dispose(), [audio]);
  useEffect(() => {
    const old = previous.current;
    previous.current = { moves: [...moves], ended };
    if (moves.length < old.moves.length || !old.moves.every((move, index) => moves[index] === move)) { audio.stop(); return; }
    if (ended && !old.ended) { audio.play("end"); return; }
    if (moves.length === old.moves.length) return;
    const game = new Chess();
    moves.forEach((move, index) => {
      game.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] });
      if (index >= old.moves.length) audio.play(moveSound(game), (index - old.moves.length) * .09);
    });
  }, [audio, moves, ended]);

  function unlock() { audio.setMuted(!readEnabled()); audio.unlock(); }
  function toggle() {
    const next = !readEnabled();
    try { localStorage.setItem(preferenceKey, next ? "on" : "off"); fallbackEnabled = undefined; }
    catch { fallbackEnabled = next; }
    audio.setMuted(!next);
    if (next) { audio.unlock(); audio.play("move"); }
    window.dispatchEvent(new Event(preferenceEvent));
  }
  return { enabled, unlock, toggle };
}
