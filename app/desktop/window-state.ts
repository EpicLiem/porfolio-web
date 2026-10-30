export type WindowBounds = { width: number; height: number };
export type WindowGeometry = WindowBounds & { x: number; y: number };
export type InitialDesktopWindow = WindowGeometry & { id: string; title: string; open?: boolean };
export type DesktopWindowState = WindowGeometry & {
  id: string;
  title: string;
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  z: number;
};
export type WindowManagerState = { windows: DesktopWindowState[]; bounds: WindowBounds | null };
export type Direction = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown";
export type WindowAction =
  | { type: "bounds"; bounds: WindowBounds }
  | { type: "layout"; windows: InitialDesktopWindow[]; bounds: WindowBounds }
  | { type: "swap"; id: string; targetId: string }
  | { type: "open" | "close" | "minimize" | "restore" | "maximize" | "toggleMaximize" | "bringToFront"; id: string };

export const TILE_GAP = 10;
export const SINGLE_WINDOW_WIDTH = 700;

export function createWindowState(windows: InitialDesktopWindow[]): WindowManagerState {
  return { bounds: null, windows: windows.map((window, index) => ({ ...window, open: window.open ?? true, minimized: false, maximized: false, z: index + 1 })) };
}

export function getActiveWindowId(windows: DesktopWindowState[]): string | null {
  return windows.filter(window => window.open && !window.minimized).reduce<DesktopWindowState | null>((top, window) => !top || window.z > top.z ? window : top, null)?.id ?? null;
}

export function isSingleWindow(state: WindowManagerState): boolean {
  return (state.bounds?.width ?? 0) < SINGLE_WINDOW_WIDTH || state.windows.some(window => window.id === getActiveWindowId(state.windows) && window.maximized);
}

export function isWindowVisible(state: WindowManagerState, id: string): boolean {
  const window = state.windows.find(window => window.id === id);
  return !!window?.open && !window.minimized && (!isSingleWindow(state) || id === getActiveWindowId(state.windows));
}

function retile(state: WindowManagerState): WindowManagerState {
  if (!state.bounds) return state;
  const width = Math.max(0, state.bounds.width);
  const height = Math.max(0, state.bounds.height);
  const inset = Math.min(8, width / 2, height / 2);
  const area = { x: inset, y: inset, width: width - inset * 2, height: height - inset * 2 };
  const tiles = new Map<string, WindowGeometry>();
  function split(windows: DesktopWindowState[], rect: WindowGeometry) {
    if (!windows.length) return;
    if (windows.length === 1) { tiles.set(windows[0].id, rect); return; }
    const horizontal = rect.width >= rect.height;
    const size = horizontal ? rect.width : rect.height;
    const gap = Math.min(TILE_GAP, size);
    const count = Math.ceil(windows.length / 2);
    const first = (size - gap) * count / windows.length;
    split(windows.slice(0, count), { ...rect, ...(horizontal ? { width: first } : { height: first }) });
    split(windows.slice(count), { ...rect, ...(horizontal ? { x: rect.x + first + gap, width: size - first - gap } : { y: rect.y + first + gap, height: size - first - gap }) });
  }
  const eligible = state.windows.filter(window => window.open && !window.minimized);
  if (isSingleWindow(state)) eligible.forEach(window => tiles.set(window.id, area));
  else split(eligible, area);
  return { ...state, windows: state.windows.map(window => ({ ...window, ...(tiles.get(window.id) ?? {}) })) };
}

export function getNeighborId(state: WindowManagerState, id: string, direction: Direction): string | null {
  if (isSingleWindow(state)) return null;
  const source = state.windows.find(window => window.id === id && isWindowVisible(state, id));
  if (!source) return null;
  const horizontal = direction === "ArrowLeft" || direction === "ArrowRight";
  const sign = direction === "ArrowLeft" || direction === "ArrowUp" ? -1 : 1;
  const center = (window: DesktopWindowState) => [window.x + window.width / 2, window.y + window.height / 2];
  const [sx, sy] = center(source);
  return state.windows.filter(window => window.id !== id && isWindowVisible(state, window.id)).map(window => {
    const [x, y] = center(window);
    const forward = (horizontal ? x - sx : y - sy) * sign;
    const sideways = Math.abs(horizontal ? y - sy : x - sx);
    return { id: window.id, forward, score: forward + sideways * 2 };
  }).filter(window => window.forward > 0.5).sort((a, b) => a.score - b.score)[0]?.id ?? null;
}

export function windowReducer(state: WindowManagerState, action: WindowAction): WindowManagerState {
  if (action.type === "bounds" || action.type === "layout") {
    if (state.bounds?.width === action.bounds.width && state.bounds.height === action.bounds.height) return state;
    return retile({ ...state, bounds: action.bounds });
  }
  const target = state.windows.find(window => window.id === action.id);
  if (!target) return state;
  if (action.type === "swap") {
    if (isSingleWindow(state) || target.id === action.targetId || !isWindowVisible(state, target.id) || !isWindowVisible(state, action.targetId)) return state;
    const windows = [...state.windows];
    const a = windows.indexOf(target);
    const b = windows.findIndex(window => window.id === action.targetId);
    [windows[a], windows[b]] = [windows[b], windows[a]];
    return retile({ ...state, windows });
  }
  const front = Math.max(0, ...state.windows.map(window => window.z)) + 1;
  let updated = target;
  switch (action.type) {
    case "close": updated = { ...target, open: false, minimized: false, maximized: false }; break;
    case "minimize": updated = { ...target, minimized: true }; break;
    case "open": updated = { ...target, open: true, minimized: false, z: front }; break;
    case "bringToFront":
      if (!target.open || target.minimized || getActiveWindowId(state.windows) === target.id) return state;
      updated = { ...target, z: front }; break;
    case "restore": updated = { ...target, maximized: false, open: true, minimized: false, z: front }; break;
    case "maximize":
    case "toggleMaximize":
      updated = { ...target, open: true, minimized: false, maximized: action.type === "maximize" || !target.maximized, z: front };
      break;
  }
  const activates = updated.z === front;
  return retile({ ...state, windows: state.windows.map(window => window.id === target.id ? updated : activates && !window.minimized ? { ...window, maximized: false } : window) });
}
