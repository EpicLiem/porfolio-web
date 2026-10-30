import type { Chess } from "chess.js";

export type ChessSound = "move" | "capture" | "check" | "end";

export function moveSound(game: Chess): ChessSound {
  if (game.isGameOver()) return "end";
  if (game.isCheck()) return "check";
  return game.history({ verbose: true }).at(-1)?.captured ? "capture" : "move";
}

const files: Record<ChessSound, string> = { move: "move", capture: "capture", check: "check", end: "genericnotify" };
const volume: Record<ChessSound, number> = { move: .9, capture: .9, check: .8, end: .7 };

/** Plays the Lichess SFX set from /chess/sounds (see its README for the license). */
export class ChessAudio {
  private context: AudioContext | null = null;
  private buffers: Promise<Partial<Record<ChessSound, AudioBuffer>>> | null = null;
  private voices = new Set<AudioBufferSourceNode>();
  private muted = false;
  private resuming: Promise<void> | null = null;
  private generation = 0;
  private pending = 0;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  private cancelIdle() {
    if (this.idleTimer !== null) clearTimeout(this.idleTimer);
    this.idleTimer = null;
  }

  private suspendWhenIdle() {
    this.cancelIdle();
    const context = this.context;
    if (!context || this.voices.size || this.pending) return;
    this.idleTimer = setTimeout(() => {
      this.idleTimer = null;
      if (this.context === context && !this.voices.size && !this.pending && context.state !== "closed") {
        void context.suspend().catch(() => {});
      }
    }, 300);
  }

  private resume(context: AudioContext) {
    if (!this.resuming) {
      const pending = context.resume().catch(() => {});
      this.resuming = pending;
      void pending.then(() => { if (this.resuming === pending) this.resuming = null; });
    }
    return this.resuming;
  }

  private load(context: AudioContext) {
    this.buffers ??= Promise.all((Object.keys(files) as ChessSound[]).map(async sound => {
      try {
        const response = await fetch(`/chess/sounds/${files[sound]}.mp3`);
        if (!response.ok) return [sound, null] as const;
        return [sound, await context.decodeAudioData(await response.arrayBuffer())] as const;
      } catch { return [sound, null] as const; } // A missing sound stays silent rather than breaking the game.
    })).then(entries => Object.fromEntries(entries.filter(([, buffer]) => buffer)));
    return this.buffers;
  }

  unlock() {
    if (this.muted) return;
    this.cancelIdle();
    try {
      if (!this.context || this.context.state === "closed") { this.context = new AudioContext(); this.buffers = null; }
      void Promise.all([this.resume(this.context), this.load(this.context)]).then(() => this.suspendWhenIdle());
    } catch { /* Audio is optional when the browser or device does not support it. */ }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) this.stop();
  }

  play(sound: ChessSound, delay = 0) {
    const context = this.context;
    if (this.muted || !context) return;
    this.cancelIdle();
    this.pending++;
    const generation = this.generation, requested = Date.now();
    void Promise.all([this.resume(context), this.load(context)]).then(([, buffers]) => {
      const buffer = buffers[sound];
      // Drop sounds that became stale while the browser resumed audio or decoded files.
      if (buffer && this.context === context && context.state === "running" && !this.muted && generation === this.generation && Date.now() - requested < 1000) this.schedule(context, buffer, sound, delay);
    }).finally(() => { this.pending--; this.suspendWhenIdle(); });
  }

  private schedule(context: AudioContext, buffer: AudioBuffer, sound: ChessSound, delay: number) {
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = volume[sound];
    source.connect(gain);
    gain.connect(context.destination);
    this.voices.add(source);
    source.onended = () => { this.voices.delete(source); source.disconnect(); gain.disconnect(); this.suspendWhenIdle(); };
    source.start(context.currentTime + delay);
  }

  stop() {
    this.generation++;
    for (const voice of this.voices) { voice.stop(); voice.disconnect(); }
    this.voices.clear();
    this.suspendWhenIdle();
  }

  dispose() {
    this.stop();
    this.cancelIdle();
    if (this.context) void this.context.close().catch(() => {});
    this.context = null;
    this.buffers = null;
    this.resuming = null;
  }
}
