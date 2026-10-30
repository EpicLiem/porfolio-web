import type { DesktopEffect } from "@/lib/terminal/shell";
import { sampleEffect } from "./timeline";

type Voice = { ctx: AudioContext; out: AudioNode; t: number; d: number; track: (source: AudioScheduledSourceNode) => void };

let shared: AudioContext | null = null;
let stopActive: (() => void) | undefined;
const noiseBuffers = new WeakMap<AudioContext, AudioBuffer>();
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function noise(v: Voice, from: number, to: number) {
  let buffer = noiseBuffers.get(v.ctx);
  if (!buffer) {
    buffer = v.ctx.createBuffer(1, v.ctx.sampleRate * 2, v.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(v.ctx, buffer);
  }
  const source = v.ctx.createBufferSource();
  source.buffer = buffer; source.loop = true;
  source.start(v.t + from); source.stop(v.t + to); v.track(source);
  return source;
}

function tone(v: Voice, type: OscillatorType, frequency: number, from: number, to: number, detune = 0) {
  const oscillator = v.ctx.createOscillator();
  oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, v.t + from); oscillator.detune.value = detune;
  oscillator.start(v.t + from); oscillator.stop(v.t + to); v.track(oscillator);
  return oscillator;
}

function filter(v: Voice, type: BiquadFilterType, frequency: number, q = 1) {
  const node = v.ctx.createBiquadFilter();
  node.type = type; node.frequency.value = frequency; node.Q.value = q;
  return node;
}

/** Gain node with an envelope given as [seconds from start, level] points. */
function envelope(v: Voice, points: [number, number][]) {
  const gain = v.ctx.createGain();
  gain.gain.setValueAtTime(0, v.t);
  for (const [at, level] of points) gain.gain.linearRampToValueAtTime(level, v.t + at);
  return gain;
}

function curve(v: Voice, values: Float32Array, from = 0, length = v.d) {
  const gain = v.ctx.createGain();
  // A value curve may not overlap other automation events, so set the resting level directly.
  gain.gain.value = 0;
  gain.gain.setValueCurveAtTime(values, v.t + from, length);
  return gain;
}

function drive(v: Voice, amount: number) {
  const shaper = v.ctx.createWaveShaper();
  const shape = new Float32Array(1024);
  for (let i = 0; i < shape.length; i++) shape[i] = Math.tanh(amount * (i / 511.5 - 1));
  shaper.curve = shape;
  return shaper;
}

function chain(v: Voice, ...nodes: AudioNode[]) {
  nodes.reduce((from, to) => { from.connect(to); return to; }).connect(v.out);
}

function sampled(v: Voice, steps: number, level: (t: number, i: number) => number) {
  return Float32Array.from({ length: steps }, (_, i) => Math.max(0, level(i / (steps - 1), i)));
}

const cues: Record<DesktopEffect, (v: Voice) => void> = {
  sandevistan(v) {
    const { d } = v, surge = .16 * d, recover = .72 * d;
    // Charge-up whine into the activation hit.
    const whine = tone(v, "sawtooth", 260, 0, surge + .05);
    whine.frequency.exponentialRampToValueAtTime(2600, v.t + surge);
    chain(v, whine, filter(v, "lowpass", 3200, 4), envelope(v, [[.05, .05], [surge - .03, .12], [surge + .03, 0]]));
    // Sub drop and air rushing past as time slows.
    const sub = tone(v, "sine", 95, surge, surge + 1.4);
    sub.frequency.exponentialRampToValueAtTime(32, v.t + surge + 1.2);
    chain(v, sub, envelope(v, [[surge, 0], [surge + .02, .75], [surge + 1.4, 0]]));
    const rush = filter(v, "bandpass", 3600, 1.4);
    rush.frequency.setValueAtTime(3600, v.t + surge); rush.frequency.exponentialRampToValueAtTime(180, v.t + surge + 1.1);
    chain(v, noise(v, surge, surge + 1.3), rush, envelope(v, [[surge, 0], [surge + .03, .35], [surge + 1.3, 0]]));
    // Slowed-world drone with a heavy heartbeat underneath.
    const pad = filter(v, "lowpass", 420, .7), padGain = envelope(v, [[surge, 0], [surge + .5, .16], [recover, .14], [d, 0]]);
    for (const detune of [-14, 0, 13]) chain(v, tone(v, "sawtooth", 55, surge, d, detune), pad, padGain);
    for (const beat of [1.15, 1.95, 2.75]) if (beat < recover) {
      const thump = tone(v, "sine", 64, beat, beat + .32);
      thump.frequency.exponentialRampToValueAtTime(38, v.t + beat + .3);
      chain(v, thump, envelope(v, [[beat, 0], [beat + .015, .5], [beat + .32, 0]]));
    }
    // Rising rush as normal speed returns.
    const back = filter(v, "bandpass", 260, 1.2);
    back.frequency.setValueAtTime(260, v.t + recover); back.frequency.exponentialRampToValueAtTime(5200, v.t + d - .05);
    chain(v, noise(v, recover, d), back, envelope(v, [[recover, 0], [d - .2, .3], [d, 0]]));
  },

  relic(v) {
    const { d } = v;
    // Detuned, overdriven hum that swells with the visual interference curve.
    const hum = filter(v, "lowpass", 950, 2), humGain = curve(v, sampled(v, 160, t => sampleEffect("relic", t * d * 1000).interference * .32));
    const tremolo = v.ctx.createGain(), lfo = tone(v, "square", 13, 0, d), depth = v.ctx.createGain();
    depth.gain.value = .5; tremolo.gain.value = .5; lfo.connect(depth).connect(tremolo.gain);
    for (const frequency of [110, 116.5]) chain(v, tone(v, "sawtooth", frequency, 0, d), drive(v, 3), hum, tremolo, humGain);
    // Digital stutters: short square chirps and static clusters around the surge and echo.
    for (let i = 0; i < 34; i++) {
      const cluster = i % 2 ? .16 : .47, at = Math.max(0, Math.min(d - .1, (cluster + (hash(i) - .5) * .22) * d)), length = .025 + hash(i + 50) * .05;
      const chirp = tone(v, "square", 180 + hash(i + 9) * 1900, at, at + length);
      chirp.frequency.exponentialRampToValueAtTime(90 + hash(i + 3) * 400, v.t + at + length);
      chain(v, chirp, envelope(v, [[at, 0], [at + .004, .12], [at + length, 0]]));
      if (i % 3 === 0) chain(v, noise(v, at, at + length), filter(v, "highpass", 2400), envelope(v, [[at, 0], [at + .003, .26], [at + length, 0]]));
    }
  },

  blackwall(v) {
    const { d } = v, ignite = .2 * d;
    const ignition = (t: number) => Math.exp(-Math.pow((t - .2) / .1, 2));
    // Deep, distorted drone peaking at ignition and decaying into interference.
    const droneGain = curve(v, sampled(v, 160, t => (.35 + ignition(t) * .65) * (1 - Math.pow(t, 3)) * .32));
    const low = filter(v, "lowpass", 260, 3);
    chain(v, tone(v, "sine", 41, 0, d), droneGain);
    chain(v, tone(v, "sawtooth", 82, 0, d), drive(v, 4), low, droneGain);
    // Reverse swell into the ignition hit.
    const swell = filter(v, "lowpass", 200, 6);
    swell.frequency.setValueAtTime(200, v.t); swell.frequency.exponentialRampToValueAtTime(5000, v.t + ignite);
    chain(v, noise(v, 0, ignite + .05), swell, envelope(v, [[ignite - .02, .32], [ignite + .05, 0]]));
    const boom = tone(v, "sine", 70, ignite, ignite + 1.6);
    boom.frequency.exponentialRampToValueAtTime(28, v.t + ignite + 1.4);
    chain(v, boom, drive(v, 2), envelope(v, [[ignite, 0], [ignite + .015, .7], [ignite + 1.6, 0]]));
    // Electrical crackle: sparse spikes, densest around ignition.
    chain(v, noise(v, 0, d), filter(v, "highpass", 1700), curve(v, sampled(v, 480, (t, i) => hash(i * 1.7) > .82 - ignition(t) * .25 ? (.12 + ignition(t) * .3) * (1 - t * .7) : 0)));
    // Thin, unsettling high tone with a slow wobble.
    const high = tone(v, "sine", 1760, 0, d), wobble = tone(v, "sine", 5.5, 0, d), wobbleDepth = v.ctx.createGain();
    wobbleDepth.gain.value = 18; wobble.connect(wobbleDepth).connect(high.frequency);
    chain(v, high, envelope(v, [[ignite, .025], [d * .8, .015], [d, 0]]));
  },

  nightcity(v) {
    const { d } = v;
    // Synthwave stab: detuned A minor 9 through a sweeping filter.
    const sweep = filter(v, "lowpass", 280, 5);
    sweep.frequency.setValueAtTime(280, v.t); sweep.frequency.exponentialRampToValueAtTime(2600, v.t + .5); sweep.frequency.exponentialRampToValueAtTime(700, v.t + d);
    const pad = envelope(v, [[.06, .15], [d * .55, .1], [d, 0]]);
    for (const frequency of [110, 164.81, 196, 246.94, 261.63]) for (const detune of [-9, 9]) chain(v, tone(v, "sawtooth", frequency, 0, d, detune), sweep, pad);
    // Plucked arpeggio over the pad.
    [440, 523.25, 659.25, 783.99, 659.25, 523.25, 587.33, 659.25].forEach((frequency, i) => {
      const at = .35 + i * .19;
      if (at < d - .3) chain(v, tone(v, "triangle", frequency, at, at + .4), filter(v, "lowpass", 2400), envelope(v, [[at, 0], [at + .008, .14], [at + .4, 0]]));
    });
    // Rain on the street, matching the falling streaks.
    chain(v, noise(v, 0, d), filter(v, "bandpass", 1300, .6), envelope(v, [[.3, .07], [d * .75, .06], [d, 0]]));
  },

  matrix(v) {
    const { d } = v;
    const drop = tone(v, "sine", 1400, 0, .55);
    drop.frequency.exponentialRampToValueAtTime(140, v.t + .5);
    chain(v, drop, envelope(v, [[.01, .25], [.55, 0]]));
    chain(v, tone(v, "sine", 73.42, 0, d), envelope(v, [[.4, .18], [d * .7, .14], [d, 0]]));
    // Falling-code blips on a pentatonic scale.
    const notes = [880, 1046.5, 1318.51, 1567.98, 1760, 2093];
    for (let i = 0; i < 42; i++) {
      const at = .3 + hash(i + 70) * (d - .5);
      chain(v, tone(v, "sine", notes[Math.floor(hash(i + 20) * notes.length)], at, at + .07), envelope(v, [[at, 0], [at + .004, .1], [at + .07, 0]]));
    }
  },
};

type RecordingCue = { file: string; at: number; gain: number };
const relicStarts = ["relic_malfunction.mp3", "relic_low_start.mp3", "relic_medium_start.mp3", "relic_heavy_start.mp3"];
let relicIndex = 0;
function recordings(name: DesktopEffect | "fixer"): RecordingCue[] {
  switch (name) {
    case "relic": return [
      { file: relicStarts[relicIndex++ % relicStarts.length], at: 0, gain: .8 },
      { file: "relic_warning_jingle.mp3", at: .35, gain: .3 },
      { file: "relic_blackout_short.mp3", at: 6, gain: .45 },
    ];
    case "sandevistan": return [{ file: "david-martinez-sandevistan-start.mp3", at: 0, gain: 1 }];
    case "nightcity": return [{ file: "cyberpunk_incoming_call.mp3", at: 0, gain: .8 }];
    case "fixer": return [{ file: "cyberpunk-2077-phone-call.mp3", at: 0, gain: .8 }];
    default: return [];
  }
}
const decoded = new WeakMap<AudioContext, Map<string, Promise<AudioBuffer | null>>>();

function recording(ctx: AudioContext, file: string) {
  let cache = decoded.get(ctx);
  if (!cache) decoded.set(ctx, cache = new Map());
  let buffer = cache.get(file);
  if (!buffer) {
    buffer = fetch(`/desktop/sfx/${file}`).then(response => response.ok ? response.arrayBuffer() : Promise.reject()).then(data => ctx.decodeAudioData(data)).catch(() => null);
    cache.set(file, buffer);
  }
  return buffer;
}

/** Starts the cue for an effect and returns a function that fades it out. */
export function playEffectSound(name: DesktopEffect | "fixer", durationMs: number): () => void {
  stopActive?.();
  let ctx: AudioContext;
  try {
    if (!shared || shared.state === "closed") shared = new AudioContext();
    ctx = shared;
  } catch { return () => {}; } // Sound is optional when Web Audio is unavailable.
  const master = ctx.createGain(), limiter = ctx.createDynamicsCompressor();
  master.gain.value = .55; limiter.threshold.value = -10; limiter.ratio.value = 8;
  master.connect(limiter).connect(ctx.destination);
  const sources: AudioScheduledSourceNode[] = [];
  let stopped = false;
  const startedAt = ctx.currentTime;
  const synthesize = () => {
    try { if (name !== "fixer") cues[name]({ ctx, out: master, t: ctx.currentTime + .02, d: durationMs / 1000, track: source => sources.push(source) }); }
    catch { /* A failed cue must never break the visual effect. */ }
  };
  const start = async () => {
    const clips = recordings(name);
    const buffers = await Promise.all(clips.map(clip => recording(ctx, clip.file)));
    if (stopped) return;
    if (!buffers.some(Boolean)) { synthesize(); return; }
    clips.forEach((clip, index) => {
      const buffer = buffers[index];
      if (!buffer) return;
      const intended = startedAt + clip.at;
      const offset = Math.max(0, ctx.currentTime - intended);
      if (offset >= buffer.duration) return;
      const source = ctx.createBufferSource(), gain = ctx.createGain();
      gain.gain.value = clip.gain;
      source.buffer = buffer; source.connect(gain).connect(master);
      source.onended = () => { source.disconnect(); gain.disconnect(); };
      source.start(Math.max(ctx.currentTime, intended), offset); sources.push(source);
    });
  };
  const resumed = ctx.state === "running" ? Promise.resolve() : ctx.resume();
  resumed.then(start, () => {});
  const deadline = setTimeout(() => stop(), durationMs);
  const stop = () => {
    if (stopped) return;
    stopped = true;
    clearTimeout(deadline);
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now); master.gain.setValueAtTime(master.gain.value, now); master.gain.linearRampToValueAtTime(0, now + .12);
    for (const source of sources) try { source.stop(now + .15); } catch { /* Already stopped. */ }
    setTimeout(() => { master.disconnect(); limiter.disconnect(); }, 300);
  };
  stopActive = stop;
  return stop;
}
