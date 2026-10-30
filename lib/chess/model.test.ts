import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { disposeModel, loadModel, predict, type ModelProgress } from './model';

class ConsumerWorker {
  static instance: ConsumerWorker;
  onmessage?: (event: { data: unknown }) => void;
  messages: { id: number; type: string; position?: unknown }[] = [];
  terminated = false;
  constructor(public url: URL, public options: WorkerOptions) { ConsumerWorker.instance = this; }
  postMessage(message: { id: number; type: string; position?: unknown }) { this.messages.push(message); }
  terminate() { this.terminated = true; }
  reply(index: number, data: object) { this.onmessage?.({ data: { id: this.messages[index].id, ...data } }); }
}

test('portfolio adapter uses same-origin packaged worker and forwards game context, progress and cancellation', async () => {
  const originalWorker = globalThis.Worker;
  const location = Object.getOwnPropertyDescriptor(globalThis, 'location');
  globalThis.Worker = ConsumerWorker as unknown as typeof Worker;
  Object.defineProperty(globalThis, 'location', { value: new URL('https://portfolio.example/desktop'), configurable: true });
  try {
    const progress: ModelProgress[] = [];
    const loading = loadModel(value => progress.push(value));
    const worker = ConsumerWorker.instance;
    assert.equal(worker.url.href, 'https://portfolio.example/chess/engine/model.worker.js');
    assert.equal(worker.options.type, 'module');
    worker.reply(0, { progress: { phase: 'ready', loaded: 100, total: 100 } });
    worker.reply(0, { result: null });
    await loading;
    assert.equal(progress[0].phase, 'ready');
    const fen = new Chess().fen();
    const position = { fen, historyFens: [fen], initialSeconds: 900, incrementSeconds: 10, remainingSeconds: 840, opponentRemainingSeconds: 830, ownTimeHistory: [2], opponentTimeHistory: [3], previousMoveWasCapture: false, eloSelf: 491, eloOpponent: 529 };
    const prediction = predict(position);
    await Promise.resolve();
    assert.deepEqual(worker.messages[1].position, { ...position, eloSelf: 680, eloOpponent: 680 });
    assert.equal(position.eloSelf, 491);
    assert.equal(position.eloOpponent, 529);
    worker.reply(1, { result: { uci: 'e2e4', targetSeconds: 2.5 } });
    assert.deepEqual(await prediction, { uci: 'e2e4', targetSeconds: 2.5 });
    for (const [initialSeconds, incrementSeconds, rating] of [[60, 0, 230], [180, 2, 220], [600, 0, 680]]) {
      const controlPosition = { ...position, initialSeconds, incrementSeconds };
      const result = predict(controlPosition);
      await Promise.resolve();
      const index = worker.messages.length - 1;
      assert.deepEqual(worker.messages[index].position, { ...controlPosition, eloSelf: rating, eloOpponent: rating });
      worker.reply(index, { result: { uci: 'e2e4', targetSeconds: 2.5 } });
      await result;
    }
    const controller = new AbortController();
    const canceled = predict(position, { signal: controller.signal });
    controller.abort();
    await assert.rejects(canceled, { name: 'AbortError' });
    disposeModel();
    assert.equal(worker.terminated, true);
  } finally {
    disposeModel();
    globalThis.Worker = originalWorker;
    if (location) Object.defineProperty(globalThis, 'location', location);
    else Reflect.deleteProperty(globalThis, 'location');
  }
});
