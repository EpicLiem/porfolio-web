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

test("crowded workspaces show the active app and return to tiling when there is room", () => {
  let state = initialized(3, 850, 700);
  assert.equal(state.windows.filter(window => isWindowVisible(state, window.id)).length, 1);
  assert.equal(isWindowVisible(state, "window-2"), true);
  state = windowReducer(state, { type: "open", id: "window-0" });
  assert.equal(isWindowVisible(state, "window-0"), true);
  state = windowReducer(state, { type: "bounds", bounds: { width: 1280, height: 800 } });
  assert.equal(state.windows.filter(window => isWindowVisible(state, window.id)).length, 3);
  assertTiles(state);
  assert.equal(windowById(state, "window-0").width, windowById(state, "window-2").width);
});

test("portfolio tiles require room for introduction and project evidence", () => {
  let state = createWindowState(["about", "projects", "help"].map(id => ({ ...initialWindows[0], id })));
  state = windowReducer(state, { type: "bounds", bounds: { width: 1094, height: 760 } });
  assert.equal(state.windows.filter(window => isWindowVisible(state, window.id)).length, 1);
  state = windowReducer(state, { type: "bounds", bounds: { width: 1700, height: 1080 } });
  assert.equal(state.windows.filter(window => isWindowVisible(state, window.id)).length, 3);
  assertTiles(state);
});

test("single-window landing introduces the owner without overriding later app choices", () => {
  const initial = createWindowState(["about", "projects"].map(id => ({ ...initialWindows[0], id })));
  let state = windowReducer(initial, { type: "bounds", bounds: { width: 738, height: 728 } });
  assert.equal(getActiveWindowId(state.windows), "about");
  state = windowReducer(state, { type: "open", id: "projects" });
  state = windowReducer(state, { type: "bounds", bounds: { width: 634, height: 1140 } });
  assert.equal(getActiveWindowId(state.windows), "projects");
  const tiled = windowReducer(initial, { type: "bounds", bounds: { width: 1700, height: 1040 } });
  assert.equal(getActiveWindowId(tiled.windows), "projects");
});

test("expanded portfolio supports the introduction while giving the neighboring app reading room", () => {
  const initial = createWindowState(["about", "projects", "experience"].map(id => ({ ...initialWindows[0], id })));
  for (const width of [1600, 1700, 1900]) {
    let state = windowReducer(initial, { type:"bounds", bounds:{ width, height:1040 } });
    assert.equal(state.windows.filter(window => isWindowVisible(state, window.id)).length, 3);
    const intro = geometry(windowById(state, "about"));
    assert.ok(intro.width <= 600 && intro.height <= 340);
    assert.ok(windowById(state, "experience").height > intro.height * 1.8);
    assertTiles(state);
    state = windowReducer(state, { type:"maximize", id:"about" });
    assert.ok(windowById(state, "about").height > 1000);
    state = windowReducer(state, { type:"toggleMaximize", id:"about" });
    assert.deepEqual(geometry(windowById(state, "about")), intro);
  }
  const narrow = windowReducer(initial, { type:"bounds", bounds:{ width:1094, height:760 } });
  assert.equal(narrow.windows.filter(window => isWindowVisible(narrow, window.id)).length, 1);
});

test("the two-app portfolio gives work the dominant tile and preserves swapping", () => {
  const initial = createWindowState(["about", "projects"].map(id => ({ ...initialWindows[0], id })));
  let state = windowReducer(initial, { type: "bounds", bounds: { width: 1246, height: 812 } });
  assert.equal(state.windows.filter(window => isWindowVisible(state, window.id)).length, 2);
  const intro = geometry(windowById(state, "about"));
  const project = geometry(windowById(state, "projects"));
  assert.ok(project.width > intro.width * 1.8);
  assert.ok(project.height > intro.height);
  assertTiles(state);
  state = windowReducer(state, { type: "swap", id: "about", targetId: "projects" });
  assert.deepEqual(geometry(windowById(state, "about")), project);
  assert.deepEqual(geometry(windowById(state, "projects")), intro);
});

test("portrait tablets stack the introduction above a readable project", () => {
  const initial = createWindowState(["about", "projects"].map(id => ({ ...initialWindows[0], id })));
  const state = windowReducer(initial, { type: "bounds", bounds: { width: 574, height: 936 } });
  assert.equal(state.windows.filter(window => isWindowVisible(state, window.id)).length, 2);
  assert.ok(windowById(state, "projects").y > windowById(state, "about").y);
  assert.ok(windowById(state, "projects").height >= 480);
  assertTiles(state);
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

test("single-app stages fit their content and maximize still uses the whole workspace", () => {
  for (const id of ["experience", "contact", "help", "guestbook", "about", "projects", "chess"]) {
    const initial = createWindowState([{ ...initialWindows[0], id }]);
    let state = windowReducer(initial, { type:"bounds", bounds:{ width:1700, height:1040 } });
    const stage = geometry(windowById(state, id));
    assert.ok(stage.width <= 1100 && stage.height <= 800);
    assert.equal(stage.x + stage.width / 2, 850);
    assert.equal(stage.y + stage.height / 2, 520);
    state = windowReducer(state, { type:"maximize", id });
    assert.deepEqual(geometry(windowById(state, id)), { x:8, y:8, width:1684, height:1024 });
    state = windowReducer(state, { type:"toggleMaximize", id });
    assert.deepEqual(geometry(windowById(state, id)), stage);
    if (id === "contact") {
      state = windowReducer(state, { type:"bounds", bounds:{ width:740, height:1100 } });
      assert.equal(windowById(state, id).height, 920);
      assertTiles(state);
    }
    state = windowReducer(state, { type:"bounds", bounds:{ width:460, height:500 } });
    assertTiles(state);
  }
});

test("Contact keeps its submit action in a readable stage when four tiles are too short", () => {
  const windows = ["about", "projects", "experience", "contact"].map(id => ({ ...initialWindows[0], id, open:id === "about" || id === "projects" }));
  for (const [width,height] of [[1920,1080],[1920,1040],[1728,1117],[1920,1200],[2560,1300]]) {
    let state = windowReducer(createWindowState(windows), { type:"bounds", bounds:{ width:width - 87, height:height - 16 } });
    state = windowReducer(state, { type:"open", id:"experience" });
    const previous = state.windows.filter(window => window.id !== "contact").map(geometry);
    state = windowReducer(state, { type:"open", id:"contact" });
    const visible = state.windows.filter(window => isWindowVisible(state, window.id));
    assert.ok(windowById(state, "contact").height >= 575);
    assert.equal(visible.length, height < 1200 ? 1 : 4);
    assert.ok(isWindowVisible(state, "contact"));
    assertTiles(state);
    state = windowReducer(state, { type:"close", id:"contact" });
    assert.deepEqual(state.windows.filter(window => window.id !== "contact").map(geometry), previous);
  }
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
