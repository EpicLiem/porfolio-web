export const clockNow = () => performance.now();
export type Side = "w" | "b";
export type ChessClock = { initialSeconds: number; incrementSeconds: number; remaining: Record<Side, number>; history: Record<Side, number[]>; turn: Side; startedAt: number; running: boolean; spent: number };
export const newClock = (initialSeconds = 600, incrementSeconds = 0): ChessClock => ({ initialSeconds, incrementSeconds, remaining: { w: initialSeconds, b: initialSeconds }, history: { w: [], b: [] }, turn: "w", startedAt: 0, running: false, spent: 0 });
export function clockSeconds(clock: ChessClock, now: number): Record<Side, number> {
  const result = { ...clock.remaining };
  if (clock.running) result[clock.turn] = Math.max(0, result[clock.turn] - Math.max(0, now - clock.startedAt) / 1000);
  return result;
}
export function pauseClock(clock: ChessClock, now: number) {
  if (!clock.running) return;
  const seconds = clockSeconds(clock, now);
  clock.spent += (clock.remaining[clock.turn] - seconds[clock.turn]);
  clock.remaining = seconds;
  clock.running = false;
}
export function completeTurn(clock: ChessClock, now: number): boolean {
  pauseClock(clock, now);
  if (clock.remaining[clock.turn] <= 0) return false;
  clock.history[clock.turn] = [...clock.history[clock.turn], clock.spent].slice(-8);
  clock.remaining[clock.turn] += clock.incrementSeconds;
  clock.spent = 0;
  clock.turn = clock.turn === "w" ? "b" : "w";
  clock.startedAt = now;
  clock.running = true;
  return true;
}
export function completePremove(clock: ChessClock, now: number): boolean {
  pauseClock(clock, now);
  const charge = Math.max(0, 0.1 - clock.spent);
  clock.remaining[clock.turn] = Math.max(0, clock.remaining[clock.turn] - charge);
  clock.spent += charge;
  return completeTurn(clock, now);
}
export function waitForTarget(startedAt: number, targetSeconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => { clearTimeout(timer); signal.removeEventListener("abort", abort); reject(new DOMException("Cancelled", "AbortError")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, Math.max(0, targetSeconds * 1000 - (performance.now() - startedAt)));
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}
