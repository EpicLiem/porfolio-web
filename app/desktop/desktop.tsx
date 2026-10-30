"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { preload } from "react-dom";
import { contact } from "@/lib/portfolio";
import type { DesktopEffect } from "@/lib/terminal/shell";
import { DesktopEffect as EffectSequence } from "./effects/desktop-effect";
import { ApplicationLauncher } from "./application-launcher";
import { ChessWindow } from "./chess/chess-window";
import { TerminalWindow } from "./terminal/terminal-window";
import { GuestbookWindow } from "./portfolio-forms";
import { DesktopWindow, useDesktopWindows, type InitialDesktopWindow } from "./window-manager";
import { DesktopIcon } from "./desktop-icon";
import type { Direction } from "./window-state";
import { palettes, wallpapers } from "./themes";
import { ContactWindow, ExperienceWindow, HelpWindow, ProjectsWindow } from "./desktop-content";
import "./desktop.css";

const apps = [
  { id: "about", label: "Terminal", keywords: "shell bash bio about education readme commands", file: "~" },
  { id: "projects", label: "Projects", keywords: "flowcast notebrew micropantry emp code", file: "projects/" },
  { id: "experience", label: "Experience", keywords: "career work honeycake internships", file: "experience/" },
  { id: "contact", label: "Contact", keywords: "email message form", file: "contact.txt" },
  { id: "guestbook", label: "Guestbook", keywords: "visitors sign comments", file: "guestbook" },
  { id: "chess", label: "Play Liemfish", keywords: "chess game ai maia liemfish", file: "chess" },
  { id: "help", label: "Keybindings", keywords: "help shortcuts keyboard", file: "keybindings.txt" },
];
const initialWindows: InitialDesktopWindow[] = [
  { id: "about", title: "liem@portfolio: ~", x: 20, y: 80, width: 450, height: 340 },
  { id: "projects", title: "~/projects", x: 100, y: 460, width: 620, height: 320, open: false },
  { id: "experience", title: "~/experience", x: 570, y: 0, width: 650, height: 470, open: false },
  { id: "contact", title: "contact.txt", x: 260, y: 200, width: 480, height: 300, open: false },
  { id: "guestbook", title: "guestbook", x: 260, y: 200, width: 480, height: 400, open: false },
  { id: "chess", title: "chess · liemfish", x: 120, y: 40, width: 800, height: 680, open: false },
  { id: "help", title: "keybindings.txt", x: 360, y: 120, width: 510, height: 420 },
];

export default function Desktop() {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const effectSequence = useRef(0);
  const manager = useDesktopWindows({ workspaceRef, initialWindows });
  const [launcher, setLauncher] = useState(false);
  const [effect, setEffect] = useState<{ name: DesktopEffect; id: number } | null>(null);
  const palette = palettes[0];
  const wallpaper = wallpapers[0];
  preload(wallpaper.src, { as: "image", fetchPriority: "high" });
  const hiddenWindows = useRef<string[]>([]);
  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if (!event.defaultPrevented && !event.isComposing && event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && event.code === "Space" && !workspaceRef.current?.closest("[inert]")) {
        event.preventDefault();
        setLauncher(value => !value);
        return;
      }
      if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || launcher || !manager.activeId) return;
      if (workspaceRef.current?.closest("[inert]") || document.querySelector("dialog[open]")) return;
      const target = event.target;
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      const nextId = manager.neighbor(manager.activeId, event.key as Direction);
      if (!nextId) return;
      event.preventDefault();
      pendingFocus.current = event.shiftKey ? manager.activeId : nextId;
      if (event.shiftKey) manager.actions.swap(manager.activeId, nextId);
      else manager.actions.bringToFront(nextId);
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [manager, launcher]);
  useEffect(() => {
    const id = pendingFocus.current;
    if (id) {
      workspaceRef.current?.querySelector<HTMLElement>(`[data-window-id="${id}"] .wm-titlebar`)?.focus({ preventScroll: true });
      pendingFocus.current = null;
    } else if (document.activeElement === document.body && manager.activeId) {
      workspaceRef.current?.querySelector<HTMLElement>(`[data-window-id="${manager.activeId}"] .wm-titlebar`)?.focus({ preventScroll: true });
    }
  }, [manager.windows, manager.activeId, launcher]);

  function openApp(id: string) { pendingFocus.current = id; manager.actions.open(id); setLauncher(false); }
  function toggleDesktop() {
    const visible = manager.windows.filter(item => item.open && !item.minimized);
    if (visible.length) { hiddenWindows.current = visible.map(item => item.id); visible.forEach(item => manager.actions.minimize(item.id)); }
    else { (hiddenWindows.current.length ? hiddenWindows.current : ["about", "help"]).forEach(manager.actions.open); hiddenWindows.current = []; }
  }
  const content = {
    about: <TerminalWindow open={openApp} onEffect={name => setEffect({ name, id: ++effectSequence.current })} />, projects: <ProjectsWindow />, experience: <ExperienceWindow />, contact: <ContactWindow />, help: <HelpWindow />, guestbook: <GuestbookWindow />, chess: <ChessWindow />,
  };
  return <div className="rumda-desktop" data-effect={effect?.name} data-palette={palette.id} data-wallpaper={wallpaper.id} style={Object.fromEntries(Object.entries(palette.colors).map(([key, value]) => [`--${key}`, value])) as CSSProperties}>
    <div ref={sceneRef} className="desktop-scene">
    <a className="desktop-skip" href="#desktop-workspace">Skip to windows</a>
    <div className="desktop-wallpaper" aria-hidden="true" style={{ backgroundImage: wallpaper.src ? `url("${wallpaper.src}")` : "none" }} />
    <aside className="rumda-bar" aria-label="Desktop controls">
      <button className="bar-coffee" aria-label="Open applications" title="Applications" onClick={() => setLauncher(true)}><span /></button>
      <div className="bar-top">
        <BarClock />
        <div className="bar-rings"><button aria-label="Open Projects" title="Projects" onClick={() => openApp("projects")}><i /></button><button aria-label="Open Experience" title="Experience" onClick={() => openApp("experience")}><i /></button></div>
      </div>
      <nav className="bar-workspaces" aria-label="Applications">{apps.map(app => {
        const item = manager.windows.find(window => window.id === app.id);
        return <button key={app.id} className={manager.activeId === app.id ? "active" : ""} aria-label={`Open ${app.label}`} aria-pressed={item?.open && !item.minimized} title={`${app.label}${item?.minimized ? " (minimized)" : ""}`} onClick={() => openApp(app.id)}><DesktopIcon name={app.id} /></button>;
      })}</nav>
      <div className="bar-bottom"><a href={contact.github} aria-label="GitHub" title="GitHub" target="_blank" rel="noopener noreferrer"><DesktopIcon name="github" /></a><button aria-label="Open Contact" title="Contact" onClick={() => openApp("contact")}><DesktopIcon name="contact" /></button><button className="coffee-launcher" aria-label="Open application launcher" title="Applications" onClick={() => setLauncher(true)}><span /></button><button aria-label="Show or restore desktop" title="Show desktop" onClick={toggleDesktop}><DesktopIcon name="desktop" /></button></div>
    </aside>
    <main ref={workspaceRef} className="desktop-workspace" id="desktop-workspace" tabIndex={-1} aria-label="Portfolio desktop">
      <h1 className="sr-only">Liem Luttrell’s portfolio</h1>
      {manager.windows.map(item => <DesktopWindow key={item.id} window={item} manager={manager}>{content[item.id as keyof typeof content]}</DesktopWindow>)}
      {!manager.windows.some(item => item.open && !item.minimized) && <button className="empty-desktop" onClick={() => setLauncher(true)}>Open applications</button>}
    </main>
    {launcher && <ApplicationLauncher apps={apps} running={manager.windows.filter(item => item.open).map(item => item.id)} onClose={() => setLauncher(false)} onLaunch={openApp} />}
    </div>
    {effect && <EffectSequence key={effect.id} name={effect.name} scene={sceneRef} onEnd={() => setEffect(current => current?.id === effect.id ? null : current)} />}
  </div>;
}

// Lives in its own component so the per-second tick re-renders only the clock, not every window.
function BarClock() {
  const [clock, setClock] = useState("--:--");
  useEffect(() => {
    const update = () => { const now = new Date(); setClock(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`); };
    update(); const timer = setInterval(update, 1000); return () => clearInterval(timer);
  }, []);
  const [hours, minutes] = clock.split(":");
  return <div className="bar-clock" aria-label={`Local time ${clock}`}><span>{hours}</span><span>{minutes}</span></div>;
}
