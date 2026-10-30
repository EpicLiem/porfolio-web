"use client";

import { useEffect, useId, useMemo, useReducer, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from "react";
import { createWindowState, getActiveWindowId, getNeighborId, isSingleWindow, isWindowVisible, windowReducer, type DesktopWindowState, type Direction, type InitialDesktopWindow, type WindowBounds } from "./window-state";

export type { DesktopWindowState, InitialDesktopWindow, WindowBounds, WindowGeometry } from "./window-state";

type WindowOptions = {
  workspaceRef: RefObject<HTMLElement | null>;
  initialWindows: InitialDesktopWindow[];
  initialLayout?: (bounds: WindowBounds, windows: InitialDesktopWindow[]) => InitialDesktopWindow[];
};

export function useDesktopWindows({ workspaceRef, initialWindows }: WindowOptions) {
  const [state, dispatch] = useReducer(windowReducer, initialWindows, createWindowState);

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const measure = () => {
      const rect = workspace.getBoundingClientRect();
      dispatch({ type: "bounds", bounds: { width: rect.width, height: rect.height } });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(workspace);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [workspaceRef]);

  const actions = useMemo(() => ({
    open: (id: string) => dispatch({ type: "open", id }),
    close: (id: string) => dispatch({ type: "close", id }),
    minimize: (id: string) => dispatch({ type: "minimize", id }),
    restore: (id: string) => dispatch({ type: "restore", id }),
    maximize: (id: string) => dispatch({ type: "maximize", id }),
    toggleMaximize: (id: string) => dispatch({ type: "toggleMaximize", id }),
    bringToFront: (id: string) => dispatch({ type: "bringToFront", id }),
    swap: (id: string, targetId: string) => dispatch({ type: "swap", id, targetId }),
  }), []);

  return useMemo(() => ({ windows: state.windows, activeId: getActiveWindowId(state.windows), actions, workspaceRef,
    singleWindow: isSingleWindow(state),
    isVisible: (id: string) => state.bounds !== null && isWindowVisible(state, id),
    neighbor: (id: string, direction: Direction) => getNeighborId(state, id, direction),
  }), [state, actions, workspaceRef]);
}

export type DesktopWindowManager = ReturnType<typeof useDesktopWindows>;
export type DesktopWindowProps = { window: DesktopWindowState; manager: DesktopWindowManager; children: ReactNode; className?: string };
type Gesture = { element: HTMLElement; pointerId: number; clientX: number; clientY: number };

function ControlIcon({ kind }: { kind: "minimize" | "maximize" | "restore" | "close" }) {
  return <svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: "block", margin: "auto" }}>
    {kind === "minimize" && <path d="M3 11.5h10" />}
    {kind === "maximize" && <rect x="3" y="3" width="10" height="10" />}
    {kind === "restore" && <><path d="M6 5V2.5h7.5V10H11" /><rect x="2.5" y="5.5" width="8" height="8" /></>}
    {kind === "close" && <path d="m3.5 3.5 9 9m0-9-9 9" />}
  </svg>;
}

export function DesktopWindow({ window: item, manager, children, className = "" }: DesktopWindowProps) {
  const titleId = useId();
  const gesture = useRef<Gesture | null>(null);
  const { actions } = manager;
  const visible = manager.isVisible(item.id);
  const [session, setSession] = useState({ open: item.open, generation: 0 });
  if (session.open !== item.open) {
    setSession({ open: item.open, generation: session.generation + (item.open ? 1 : 0) });
  }
  const [presence, setPresence] = useState({ visible, exiting: false });
  if (presence.visible !== visible) {
    setPresence({ visible, exiting: presence.visible && !visible && (!item.open || item.minimized) });
  }
  useEffect(() => {
    if (!presence.exiting) return;
    const timer = setTimeout(() => setPresence(current => ({ ...current, exiting: false })), 160);
    return () => clearTimeout(timer);
  }, [presence.exiting]);

  useEffect(() => {
    return () => {
      const current = gesture.current;
      gesture.current = null;
      if (current?.element.hasPointerCapture(current.pointerId)) current.element.releasePointerCapture(current.pointerId);
    };
  }, [visible, manager.singleWindow]);

  function start(event: PointerEvent<HTMLElement>) {
    if (manager.singleWindow || event.button !== 0 || !event.isPrimary || gesture.current) return;
    if ((event.target as Element).closest("button, a, input, select, textarea")) return;
    event.preventDefault();
    actions.bringToFront(item.id);
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { element: event.currentTarget, pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY };
  }

  function end(event: PointerEvent<HTMLElement>) {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (event.type === "pointerup" && Math.hypot(event.clientX - current.clientX, event.clientY - current.clientY) > 5) {
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-window-id]");
      if (target && manager.workspaceRef.current?.contains(target) && target.dataset.windowId) actions.swap(item.id, target.dataset.windowId);
    }
    if (current.element.hasPointerCapture(event.pointerId)) current.element.releasePointerCapture(event.pointerId);
  }

  function keyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    const nextId = manager.neighbor(item.id, event.key as Direction);
    if (!nextId) return;
    event.preventDefault();
    if (event.shiftKey) actions.swap(item.id, nextId);
    else {
      actions.bringToFront(nextId);
      const windows = manager.workspaceRef.current?.querySelectorAll<HTMLElement>("[data-window-id]");
      windows?.forEach(window => {
        if (window.dataset.windowId === nextId) window.querySelector<HTMLElement>(".wm-titlebar")?.focus({ preventScroll: true });
      });
    }
  }

  if (!item.open && !presence.exiting) return null;

  return (
    <section
      hidden={!visible && !presence.exiting}
      inert={!visible}
      aria-hidden={!visible || undefined}
      className={`wm-window${presence.exiting ? " is-exiting" : ""}${manager.activeId === item.id ? " is-active" : ""}${item.maximized ? " is-maximized" : ""}${className ? ` ${className}` : ""}`}
      aria-labelledby={titleId}
      data-window-id={item.id}
      style={{ left: item.x, top: item.y, width: item.width, height: item.height, zIndex: item.z }}
      onPointerDownCapture={() => actions.bringToFront(item.id)}
      onFocusCapture={() => actions.bringToFront(item.id)}
    >
      <div className="wm-titlebar" tabIndex={0} aria-label={`${item.title}. Arrow keys focus neighboring tiles; Shift and arrow keys swap tiles.`}
        style={{ cursor: manager.singleWindow ? "default" : "grab" }}
        onPointerDown={start} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
        onKeyDown={keyboard}
        onDoubleClick={event => { if (!(event.target as Element).closest("button")) actions.toggleMaximize(item.id); }}>
        <span className="wm-title" id={titleId}>{item.title}</span>
        <div className="wm-controls">
          <button type="button" className="wm-control wm-minimize" aria-label={`Minimize ${item.title}`} onClick={() => actions.minimize(item.id)}><ControlIcon kind="minimize" /></button>
          <button type="button" className="wm-control wm-maximize" aria-label={`${item.maximized ? "Restore" : "Maximize"} ${item.title}`} onClick={() => actions.toggleMaximize(item.id)}><ControlIcon kind={item.maximized ? "restore" : "maximize"} /></button>
          <button type="button" className="wm-control wm-close" aria-label={`Close ${item.title}`} onClick={() => actions.close(item.id)}><ControlIcon kind="close" /></button>
        </div>
      </div>
      <div className="wm-body" key={session.generation}>{children}</div>
    </section>
  );
}
