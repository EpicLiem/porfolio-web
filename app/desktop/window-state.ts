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

const appStages: Record<string, WindowBounds> = {
  about: { width:900, height:660 },
  projects: { width:920, height:780 },
  experience: { width:920, height:520 },
  contact: { width:1100, height:590 },
  help: { width:1040, height:760 },
  guestbook: { width:760, height:640 },
  chess: { width:1080, height:800 },
};

export function createWindowState(windows: InitialDesktopWindow[]): WindowManagerState {
  return { bounds: null, windows: windows.map((window, index) => ({ ...window, open: window.open ?? true, minimized: false, maximized: false, z: index + 1 })) };
}

export function getActiveWindowId(windows: DesktopWindowState[]): string | null {
  return windows.filter(window => window.open && !window.minimized).reduce<DesktopWindowState | null>((top, window) => !top || window.z > top.z ? window : top, null)?.id ?? null;
}

export function isSingleWindow(state: WindowManagerState): boolean {
  const { tiles, area } = tileLayout(state);
  const portfolioPair = tiles.size === 2 && tiles.has("about") && tiles.has("projects");
  const stackedPortfolio = portfolioPair && area.width >= 520 && area.height >= 900;
  const supportingIntroHeight = area.height >= 900 && tiles.size === 3 ? 340 : 440;
  const crowded = portfolioPair && area.width < 810 && !stackedPortfolio || [...tiles].some(([id, rect]) => rect.width < (portfolioPair ? 300 : 440) || rect.height < (portfolioPair ? 260 : id === "about" ? supportingIntroHeight : id === "projects" ? 480 : id === "contact" ? 575 : 300));
  return tiles.size === 1 || (state.bounds?.width ?? 0) < SINGLE_WINDOW_WIDTH && !stackedPortfolio || crowded || state.windows.some(window => window.id === getActiveWindowId(state.windows) && window.maximized);
}

export function isWindowVisible(state: WindowManagerState, id: string): boolean {
  const window = state.windows.find(window => window.id === id);
  return !!window?.open && !window.minimized && (!isSingleWindow(state) || id === getActiveWindowId(state.windows));
}

function tileLayout(state: WindowManagerState) {
  const width = Math.max(0, state.bounds?.width ?? 0);
  const height = Math.max(0, state.bounds?.height ?? 0);
  const inset = Math.min(8, width / 2, height / 2);
  const area = { x: inset, y: inset, width: width - inset * 2, height: height - inset * 2 };
  const tiles = new Map<string, WindowGeometry>();
  function split(windows: DesktopWindowState[], rect: WindowGeometry) {
    if (!windows.length) return;
    if (windows.length === 1) {
      const compactIntro = eligible.length === 3 && windows[0].id === "about" && rect.height === 340 && area.height >= 900;
      const width = compactIntro ? Math.min(600, rect.width) : rect.width;
      tiles.set(windows[0].id, { ...rect, x:rect.x + (rect.width - width) / 2, width });
      return;
    }
    const horizontal = rect.width >= rect.height;
    const size = horizontal ? rect.width : rect.height;
    const gap = Math.min(TILE_GAP, size);
    const count = Math.ceil(windows.length / 2);
    const supportingIntro = eligible.length === 3 && !horizontal && windows.length === 2 && windows[0].id === "about" && rect.height >= 900;
    const first = supportingIntro ? 340 : (size - gap) / 2;
    split(windows.slice(0, count), { ...rect, ...(horizontal ? { width: first } : { height: first }) });
    split(windows.slice(count), { ...rect, ...(horizontal ? { x: rect.x + first + gap, width: size - first - gap } : { y: rect.y + first + gap, height: size - first - gap }) });
  }
  const eligible = state.windows.filter(window => window.open && !window.minimized);
  const portfolioPair = eligible.length === 2 && eligible.some(window => window.id === "about") && eligible.some(window => window.id === "projects");
  if (portfolioPair && area.width >= 810) {
    const supportingWidth = Math.max(300, Math.min(360, area.width * .28));
    const supportingHeight = Math.min(supportingWidth < 330 ? 380 : 340, area.height);
    const projectWidth = Math.min(appStages.projects.width, area.width - supportingWidth - 24);
    const projectHeight = Math.min(appStages.projects.height, area.height);
    const left = area.x + (area.width - supportingWidth - projectWidth - 24) / 2;
    tiles.set(eligible[0].id, { x: left, y: area.y + (area.height - supportingHeight) * .32, width: supportingWidth, height: supportingHeight });
    tiles.set(eligible[1].id, { x: left + supportingWidth + 24, y: area.y + (area.height - projectHeight) * .22, width: projectWidth, height: projectHeight });
  } else if (portfolioPair && area.width >= 520 && area.height >= 900) {
    tiles.set(eligible[0].id, { ...area, height:280 });
    tiles.set(eligible[1].id, { ...area, y:area.y + 304, height:area.height - 304 });
  } else split(eligible, area);
  return { eligible, tiles, area };
}

function retile(state: WindowManagerState): WindowManagerState {
  if (!state.bounds) return state;
  const { eligible, tiles, area } = tileLayout(state);
  if (isSingleWindow(state)) eligible.forEach(window => {
    const stage = !window.maximized && appStages[window.id];
    const width = Math.min(area.width, stage ? stage.width : area.width);
    const preferredHeight = stage ? window.id === "contact" && area.width < 920 ? 920 : stage.height : area.height;
    const height = Math.min(area.height, preferredHeight);
    tiles.set(window.id, { x:area.x + (area.width - width) / 2, y:area.y + (area.height - height) / 2, width, height });
  });
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
    const measured = retile({ ...state, bounds: action.bounds });
    if (state.bounds === null && isSingleWindow(measured) && measured.windows.some(window => window.id === "about" && window.open)) {
      return windowReducer(measured, { type: "bringToFront", id: "about" });
    }
    return measured;
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
