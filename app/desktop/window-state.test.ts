import assert from "node:assert/strict";
import test from "node:test";
import { createWindowState, getActiveWindowId, getNeighborId, isWindowVisible, TILE_GAP, windowReducer, type WindowGeometry, type WindowManagerState } from "./window-state";

const initialWindows = Array.from({ length: 4 }, (_, i) => ({ id: `window-${i}`, title: `Window ${i}`, x: 40, y: 70, width: 440, height: 300 }));
const initialized = (count = 4, width = 1280, height = 800) => windowReducer(createWindowState(Array.from({ length: count }, (_, i) => ({ ...initialWindows[0], id: `window-${i}` }))), { type: "bounds", bounds: { width, height } });
const geometry = ({ x, y, width, height }: WindowGeometry) => ({ x, y, width, height });
const windowById = (state: WindowManagerState, id: string) => state.windows.find(window => window.id === id)!;

function assertTiles(state: WindowManagerState) {
  const visible = state.windows.filter(window => isWindowVisible(state, window.id));
  for (const a of visible) {
    assert.ok(a.x >= 0 && a.y >= 0 && a.width >= 0 && a.height >= 0);
    assert.ok(a.x + a.width <= state.bounds!.width + 0.001);
    assert.ok(a.y + a.height <= state.bounds!.height + 0.001);
    for (const b of visible) {
      if (a === b) continue;
      assert.ok(a.x + a.width + TILE_GAP <= b.x + 0.001 || b.x + b.width + TILE_GAP <= a.x + 0.001 || a.y + a.height + TILE_GAP <= b.y + 0.001 || b.y + b.height + TILE_GAP <= a.y + 0.001, `${a.id} overlaps ${b.id} or lacks shadow clearance`);
    }
  }
}

test("recursive tiling fits all edges with shadow clearance for 1 through 12 windows", () => {
  for (const width of [700, 900, 1280, 1920]) for (const height of [500, 800, 1200]) for (let count = 1; count <= 12; count++) assertTiles(initialized(count, width, height));
  const state = initialized();
  assert.deepEqual(state.windows.map(geometry), [
    { x: 8, y: 8, width: 627, height: 387 }, { x: 8, y: 405, width: 627, height: 387 },
    { x: 645, y: 8, width: 627, height: 387 }, { x: 645, y: 405, width: 627, height: 387 },
  ]);
});

test("open, close, minimize and restore retile without reviving other minimized windows", () => {
  let state = initialized();
  state = windowReducer(state, { type: "minimize", id: "window-0" });
  state = windowReducer(state, { type: "close", id: "window-1" });
  assertTiles(state);
  assert.equal(state.windows.filter(window => isWindowVisible(state, window.id)).length, 2);
  state = windowReducer(state, { type: "open", id: "window-1" });
  assert.equal(windowById(state, "window-0").minimized, true);
  assert.equal(getActiveWindowId(state.windows), "window-1");
  assertTiles(state);
  state = windowReducer(state, { type: "restore", id: "window-0" });
  assert.deepEqual(state.windows.map(geometry), initialized().windows.map(geometry));
});

test("maximize is exclusive; restore retiles using current bounds and visibility", () => {
  let state = initialized();
  state = windowReducer(state, { type: "maximize", id: "window-0" });
  state = windowReducer(state, { type: "maximize", id: "window-0" });
  assert.deepEqual(geometry(windowById(state, "window-0")), { x: 8, y: 8, width: 1264, height: 784 });
  assert.equal(state.windows.filter(window => isWindowVisible(state, window.id)).length, 1);
  state = windowReducer(state, { type: "minimize", id: "window-0" });
  assert.equal(windowById(state, "window-0").maximized, true);
  assertTiles(state);
  state = windowReducer(state, { type: "bounds", bounds: { width: 1000, height: 600 } });
  state = windowReducer(state, { type: "open", id: "window-0" });
  assert.equal(windowById(state, "window-0").maximized, true);
  state = windowReducer(state, { type: "toggleMaximize", id: "window-0" });
  assert.deepEqual(state.windows.map(geometry), initialized(4, 1000, 600).windows.map(geometry));
  assertTiles(state);
});

test("sidebar activation exits another maximized window without unminimizing others", () => {
  let state = windowReducer(initialized(), { type: "minimize", id: "window-2" });
  state = windowReducer(state, { type: "maximize", id: "window-0" });
  state = windowReducer(state, { type: "open", id: "window-1" });
  assert.equal(windowById(state, "window-0").maximized, false);
  assert.equal(windowById(state, "window-2").minimized, true);
  assert.equal(getActiveWindowId(state.windows), "window-1");
  assertTiles(state);
});

test("narrow mode exposes only active window without changing open or minimized state", () => {
  let state = windowReducer(initialized(), { type: "minimize", id: "window-0" });
  for (const width of [699, 320, 10, 0]) {
    state = windowReducer(state, { type: "bounds", bounds: { width, height: 600 } });
    assert.equal(state.windows.filter(window => isWindowVisible(state, window.id)).length, 1);
    assert.ok(state.windows.every(window => window.open));
    assert.equal(windowById(state, "window-0").minimized, true);
    assertTiles(state);
  }
  state = windowReducer(state, { type: "open", id: "window-1" });
  assert.equal(isWindowVisible(state, "window-1"), true);
  assert.equal(isWindowVisible(state, "window-3"), false);
  state = windowReducer(state, { type: "bounds", bounds: { width: 1280, height: 800 } });
  assert.equal(state.windows.filter(window => isWindowVisible(state, window.id)).length, 3);
  assertTiles(state);
});

test("swaps exchange tile positions, preserve focus and survive retiling", () => {
  let state = initialized();
  const before = state.windows.map(geometry);
  state = windowReducer(state, { type: "swap", id: "window-0", targetId: "window-3" });
  assert.deepEqual(geometry(windowById(state, "window-0")), before[3]);
  assert.deepEqual(geometry(windowById(state, "window-3")), before[0]);
  assert.equal(getActiveWindowId(state.windows), "window-3");
  state = windowReducer(state, { type: "bounds", bounds: { width: 1000, height: 700 } });
  assert.deepEqual(state.windows.map(window => window.id), ["window-3", "window-1", "window-2", "window-0"]);
  assertTiles(state);
  assert.equal(windowReducer(state, { type: "swap", id: "window-0", targetId: "missing" }), state);
  state = windowReducer(state, { type: "minimize", id: "window-3" });
  assert.equal(windowReducer(state, { type: "swap", id: "window-0", targetId: "window-3" }), state);
});

test("directional neighbors match spatial tiles and stop at edges or in single-window mode", () => {
  const state = initialized();
  assert.equal(getNeighborId(state, "window-0", "ArrowRight"), "window-2");
  assert.equal(getNeighborId(state, "window-0", "ArrowDown"), "window-1");
  assert.equal(getNeighborId(state, "window-0", "ArrowLeft"), null);
  assert.equal(getNeighborId(state, "window-0", "ArrowUp"), null);
  const narrow = initialized(4, 400);
  assert.equal(getNeighborId(narrow, "window-3", "ArrowLeft"), null);
  assert.equal(windowReducer(narrow, { type: "swap", id: "window-3", targetId: "window-0" }), narrow);
});

test("closing every window clears focus; compatibility layout ignores floating coordinates", () => {
  let state = initialized();
  for (const window of state.windows) state = windowReducer(state, { type: "close", id: window.id });
  assert.equal(getActiveWindowId(state.windows), null);
  assert.equal(windowReducer(state, { type: "bringToFront", id: "window-0" }), state);
  state = windowReducer(state, { type: "layout", bounds: { width: 900, height: 600 }, windows: initialWindows });
  assert.ok(state.windows.every(window => !window.open));
  state = windowReducer(state, { type: "open", id: "window-2" });
  assert.deepEqual(geometry(windowById(state, "window-2")), { x: 8, y: 8, width: 884, height: 584 });
  assert.equal(windowReducer(state, { type: "bringToFront", id: "window-2" }), state);
});
