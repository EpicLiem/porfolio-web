import test from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";
import { ChessAudio, moveSound } from "./sound";

test("sounds follow committed moves, captures, check, and mate in priority order", () => {
  const game = new Chess();
  game.move("e4"); assert.equal(moveSound(game), "move");
  game.move("d5"); game.move("exd5"); assert.equal(moveSound(game), "capture");
  const check = new Chess();
  for (const move of ["e4", "f6", "Qh5+"]) check.move(move);
  assert.equal(moveSound(check), "check");
  const mate = new Chess();
  for (const move of ["f3", "e5", "g4", "Qh4#"]) mate.move(move);
  assert.equal(moveSound(mate), "end");
  const ep = new Chess();
  for (const move of ["e4", "a6", "e5", "d5", "exd6"]) ep.move(move);
  assert.equal(moveSound(ep), "capture");
});

test("audio waits for browser resume and cancels pending sounds on mute or disposal", async () => {
  const original = globalThis.AudioContext;
  let starts = 0;
  const contexts: FakeContext[] = [];
  class FakeContext {
    state = "suspended";
    currentTime = 0;
    destination = {};
    ready!: () => void;
    resumeCalls = 0;
    constructor() { contexts.push(this); }
    resume() { this.resumeCalls++; return new Promise<void>(resolve => { this.ready = () => { this.state = "running"; resolve(); }; }); }
    close() { this.state = "closed"; return Promise.resolve(); }
    suspend() { this.state = "suspended"; return Promise.resolve(); }
    decodeAudioData() { return Promise.resolve({}); }
    createBufferSource() { return { buffer: null, connect() {}, disconnect() {}, start() { starts++; }, stop() {} }; }
    createGain() { return { gain: { value: 1 }, connect() {}, disconnect() {} }; }
  }
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) })) as unknown as typeof fetch;
  globalThis.AudioContext = FakeContext as unknown as typeof AudioContext;
  const settle = () => new Promise(resolve => setImmediate(resolve));
  try {
    const audio = new ChessAudio();
    audio.unlock(); audio.play("move");
    assert.equal(starts, 0);
    assert.equal(contexts[0].resumeCalls, 1);
    contexts[0].ready(); await settle();
    assert.equal(starts, 1);
    contexts[0].state = "interrupted";
    audio.play("capture"); contexts[0].ready(); await settle();
    assert.equal(starts, 2);
    contexts[0].state = "suspended";
    audio.play("move"); audio.setMuted(true); contexts[0].ready(); await settle();
    assert.equal(starts, 2);
    audio.setMuted(false); contexts[0].state = "suspended";
    audio.play("move"); audio.dispose(); contexts[0].ready(); await settle();
    assert.equal(starts, 2);
    audio.unlock(); audio.play("move"); contexts[1].ready(); await settle();
    assert.equal(starts, 3);
    audio.dispose();
  } finally { globalThis.AudioContext = original; globalThis.fetch = originalFetch; }
});

test("audio suspends between sounds, retains queued voices, and resumes for the next move", async t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const original = globalThis.AudioContext, originalFetch = globalThis.fetch;
  const voices: { onended: (() => void) | null; start: () => void }[] = [];
  let starts = 0;
  class FakeContext {
    state = "suspended";
    currentTime = 0;
    destination = {};
    resume() { this.state = "running"; return Promise.resolve(); }
    suspend() { this.state = "suspended"; return Promise.resolve(); }
    close() { this.state = "closed"; return Promise.resolve(); }
    decodeAudioData() { return Promise.resolve({}); }
    createBufferSource() {
      const voice = { onended: null as (() => void) | null, buffer: null, connect() {}, disconnect() {}, start() { starts++; }, stop() {} };
      voices.push(voice); return voice;
    }
    createGain() { return { gain: { value: 1 }, connect() {}, disconnect() {} }; }
  }
  const context = new FakeContext();
  globalThis.AudioContext = function () { return context; } as unknown as typeof AudioContext;
  globalThis.fetch = (() => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) })) as unknown as typeof fetch;
  const settle = () => new Promise(resolve => setImmediate(resolve));
  const audio = new ChessAudio();
  try {
    audio.unlock(); await settle(); t.mock.timers.tick(300);
    assert.equal(context.state, "suspended", "unlock without a sound must not keep audio running");
    audio.play("move"); audio.play("capture", .09); await settle();
    assert.equal(starts, 2); t.mock.timers.tick(1000);
    assert.equal(context.state, "running", "queued voices must keep their audio clock running");
    voices[0].onended?.(); t.mock.timers.tick(300);
    assert.equal(context.state, "running");
    voices[1].onended?.(); t.mock.timers.tick(300);
    assert.equal(context.state, "suspended");
    audio.play("check"); await settle();
    assert.equal(starts, 3); assert.equal(context.state, "running");
    audio.setMuted(true); t.mock.timers.tick(300);
    assert.equal(context.state, "suspended");
    audio.dispose(); t.mock.timers.tick(1000);
    assert.equal(context.state, "closed");
  } finally { audio.dispose(); globalThis.AudioContext = original; globalThis.fetch = originalFetch; }
});
