"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { preload } from "react-dom";
import dynamic from "next/dynamic";
import { contact } from "@/lib/portfolio";
import type { DesktopEffect } from "@/lib/terminal/shell";
import { ApplicationLauncher } from "./application-launcher";
import { TerminalWindow } from "./terminal/terminal-window";
import { GuestbookWindow } from "./portfolio-forms";
import { DesktopWindow, useDesktopWindows, type InitialDesktopWindow } from "./window-manager";
import { DesktopIcon } from "./desktop-icon";
import type { Direction } from "./window-state";
import { palettes, wallpapers } from "./themes";
import { ContactWindow, ExperienceWindow, HelpWindow, ProjectsWindow } from "./desktop-content";
import { HandheldChrome, HandheldHelp, HandheldHome, HandheldSwitcher, handheldLabel, useHandheld } from "./handheld";
import { getHandheldViewport, shouldRecoverHandheldKeyboard } from "./handheld-viewport";
import "./desktop.css";
import "./handheld.css";

const ChessWindow = dynamic(() => import("./chess/chess-window").then(module => module.ChessWindow), {
  loading: () => <p role="status">Loading chess…</p>,
});
const EffectSequence = dynamic(() => import("./effects/desktop-effect").then(module => module.DesktopEffect));

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
  { id: "experience", title: "~/experience", x: 570, y: 0, width: 650, height: 470, open: false },
  { id: "projects", title: "~/projects", x: 100, y: 460, width: 620, height: 320 },
  { id: "contact", title: "contact.txt", x: 260, y: 200, width: 480, height: 300, open: false },
  { id: "guestbook", title: "guestbook", x: 260, y: 200, width: 480, height: 400, open: false },
  { id: "chess", title: "chess · liemfish", x: 120, y: 40, width: 800, height: 680, open: false },
  { id: "help", title: "keybindings.txt", x: 360, y: 120, width: 510, height: 420, open: false },
];

export default function Desktop() {
  const handheld = useHandheld();
  const shellRef = useRef<HTMLDivElement>(null);
  const [mobileHistory, setMobileHistory] = useState(["home"]);
  const [switcher, setSwitcher] = useState(false);
  const [featuredProjectVisit, setFeaturedProjectVisit] = useState(0);
  const [projectIndexOpen, setProjectIndexOpen] = useState(true);
  const [projectIndexBack, setProjectIndexBack] = useState(false);
  const mobileHome = mobileHistory.at(-1) === "home";
  const workspaceRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const effectSequence = useRef(0);
  const manager = useDesktopWindows({ workspaceRef, initialWindows });
  const [launcher, setLauncher] = useState(false);
  const [effect, setEffect] = useState<{ name: DesktopEffect; id: number } | null>(null);
  const palette = palettes[0];
  const wallpaper = wallpapers[0];
  preload(wallpaper.src, { as: "image", fetchPriority: "high", media: "(min-width: 768px) and (min-height: 501px), (min-width: 1001px)" });
  const hiddenWindows = useRef<string[]>([]);
  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    let frame = 0;
    let unfocusedHeight = 0;
    let previousWidth = 0;
    let keyboardOpen = false;
    let recoveryTimer: ReturnType<typeof setTimeout> | undefined;
    let recoveryHeight = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (viewport && viewport.scale !== 1) return;
        const height = viewport?.height ?? window.innerHeight;
        const width = window.innerWidth;
        const active = document.activeElement;
        const editing = active instanceof HTMLElement && active.matches('textarea,input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),[contenteditable="true"]');
        const landscape = window.screen.orientation?.type.startsWith("landscape") ?? width > window.innerHeight;
        if (!landscape || width !== previousWidth) shellRef.current?.removeAttribute("data-typing-blocked");
        if (width !== previousWidth || (!editing && !keyboardOpen)) unfocusedHeight = height;
        previousWidth = width;
        const state = getHandheldViewport({ height, offsetTop: viewport?.offsetTop ?? 0, scale: viewport?.scale ?? 1, layoutHeight: window.innerHeight, unfocusedHeight, editing, keyboardOpen });
        if (!state) return;
        keyboardOpen = state.keyboard;
        const shell = shellRef.current;
        shell?.style.setProperty("--handheld-height", `${state.height}px`);
        shell?.style.setProperty("--handheld-top", `${state.top}px`);
        shell?.toggleAttribute("data-compact", state.height <= 600);
        shell?.toggleAttribute("data-keyboard", state.keyboard);
        if (handheld && shouldRecoverHandheldKeyboard(state, editing, landscape)) {
          if (!recoveryTimer || Math.abs(recoveryHeight - state.height) > 2) {
            clearTimeout(recoveryTimer);
            recoveryHeight = state.height;
            recoveryTimer = setTimeout(() => {
              recoveryTimer = undefined;
              const focused = document.activeElement;
              const stillLandscape = window.screen.orientation?.type.startsWith("landscape") ?? window.innerWidth > window.innerHeight;
              if (focused === active && focused instanceof HTMLElement && stillLandscape && viewport?.scale === 1 && shouldRecoverHandheldKeyboard({ height: viewport.height, keyboard: keyboardOpen }, true, true)) {
                shellRef.current?.setAttribute("data-typing-blocked", "");
                focused.blur();
              }
            }, 350);
          }
        } else {
          clearTimeout(recoveryTimer);
          recoveryTimer = undefined;
        }
        if (shell?.contains(active) && active instanceof HTMLElement && active.matches("input, textarea, select")) {
          active.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      });
    };
    const focusIn = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement && event.target.matches('input,textarea,[contenteditable="true"]')) {
        shellRef.current?.removeAttribute("data-typing-blocked");
        clearTimeout(recoveryTimer);
        recoveryTimer = undefined;
      }
      measure();
    };
    measure();
    viewport?.addEventListener("resize", measure);
    viewport?.addEventListener("scroll", measure);
    window.addEventListener("resize", measure);
    document.addEventListener("focusin", focusIn);
    document.addEventListener("focusout", measure);
    return () => {
      viewport?.removeEventListener("resize", measure);
      viewport?.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      document.removeEventListener("focusin", focusIn);
      document.removeEventListener("focusout", measure);
      cancelAnimationFrame(frame);
      clearTimeout(recoveryTimer);
    };
  }, [handheld]);
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if (!event.defaultPrevented && !event.isComposing && event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && event.code === "Space" && !workspaceRef.current?.closest("[inert]")) {
        event.preventDefault();
        if (handheld) setSwitcher(value => !value);
        else setLauncher(value => !value);
        return;
      }
      if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || launcher || handheld || !manager.activeId) return;
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
  }, [manager, launcher, handheld]);
  useEffect(() => {
    if (handheld && mobileHome) {
      pendingFocus.current = null;
      return;
    }
    const id = pendingFocus.current;
    if (id) {
      workspaceRef.current?.querySelector<HTMLElement>(`[data-window-id="${id}"] ${handheld ? ".wm-body" : ".wm-titlebar"}`)?.focus({ preventScroll: true });
      pendingFocus.current = null;
    } else if (document.activeElement === document.body && manager.activeId) {
      workspaceRef.current?.querySelector<HTMLElement>(`[data-window-id="${manager.activeId}"] ${handheld ? ".wm-body" : ".wm-titlebar"}`)?.focus({ preventScroll: true });
    }
  }, [manager.windows, manager.activeId, launcher, handheld, mobileHome]);

  function openApp(id: string) {
    if (id === "projects" && !manager.windows.find(item => item.id === id)?.open) {
      setProjectIndexOpen(true);
      setProjectIndexBack(false);
    }
    shellRef.current?.removeAttribute("data-typing-blocked");
    pendingFocus.current = id; manager.actions.open(id); setLauncher(false); setSwitcher(false);
    setMobileHistory(previous => previous.at(-1) === id ? previous : [...previous, id].slice(-30));
  }
  function home() {
    shellRef.current?.removeAttribute("data-typing-blocked");
    shellRef.current?.querySelector<HTMLButtonElement>(".pda-hardware button")?.focus({ preventScroll: true });
    setMobileHistory(previous => previous.at(-1) === "home" ? previous : [...previous, "home"].slice(-30));
  }
  function openFeaturedProject() {
    workspaceRef.current?.querySelector<HTMLElement>('[data-window-id="projects"] .wm-body')?.scrollTo(0, 0);
    setFeaturedProjectVisit(previous => previous + 1);
    openApp("projects");
    setProjectIndexOpen(false);
    setProjectIndexBack(false);
  }
  function openHomeApp(id: string) {
    openApp(id);
    if (id === "projects") {
      workspaceRef.current?.querySelector<HTMLElement>('[data-window-id="projects"] .wm-body')?.scrollTo(0, 0);
      setProjectIndexOpen(true);
      setProjectIndexBack(false);
    }
  }
  function back() {
    shellRef.current?.removeAttribute("data-typing-blocked");
    if (handheld && !mobileHome && manager.activeId === "projects" && !projectIndexOpen && projectIndexBack) {
      workspaceRef.current?.querySelector<HTMLElement>('[data-window-id="projects"] .wm-body')?.scrollTo(0, 0);
      setProjectIndexOpen(true);
      setProjectIndexBack(false);
      return;
    }
    if (mobileHistory.length < 2) return;
    const previous = mobileHistory[mobileHistory.length - 2];
    if (previous === "home") shellRef.current?.querySelector<HTMLButtonElement>(".pda-hardware button")?.focus({ preventScroll: true });
    setMobileHistory(mobileHistory.slice(0, -1));
    if (previous !== "home") { pendingFocus.current = previous; manager.actions.open(previous); }
  }
  function closeMobileApp(id: string) {
    manager.actions.close(id);
    setMobileHistory(previous => {
      const remaining = previous.filter(item => item !== id);
      return [...remaining, "home"].slice(-30);
    });
  }
  function toggleDesktop() {
    const visible = manager.windows.filter(item => item.open && !item.minimized);
    if (visible.length) { hiddenWindows.current = visible.map(item => item.id); visible.forEach(item => manager.actions.minimize(item.id)); }
    else { (hiddenWindows.current.length ? hiddenWindows.current : ["about", "help"]).forEach(manager.actions.open); hiddenWindows.current = []; }
  }
  const content = {
    about: <TerminalWindow touchControls={handheld} compact={(manager.windows.find(item => item.id === "about")?.height ?? Infinity) <= 380} open={openApp} onEffect={name => setEffect({ name, id: ++effectSequence.current })} />, projects: <ProjectsWindow key={featuredProjectVisit} browser={handheld ? { browsing:projectIndexOpen, onBrowse:() => { setProjectIndexOpen(true); setProjectIndexBack(false); }, onRead:() => { setProjectIndexOpen(false); setProjectIndexBack(true); } } : undefined} />, experience: <ExperienceWindow />, contact: <ContactWindow />, help: handheld ? <HandheldHelp /> : <HelpWindow />, guestbook: <GuestbookWindow />, chess: <ChessWindow />,
  };
  const activeApp = apps.find(app => app.id === manager.activeId);
  const readingApp = handheld && !mobileHome && ["projects", "experience", "help"].includes(manager.activeId ?? "");
  const introduction = manager.windows.find(item => item.id === "about");
  const visibleWindows = manager.windows.filter(item => manager.isVisible(item.id));
  const stackedPortfolio = !handheld && visibleWindows.length === 2 && visibleWindows.some(item => item.id === "projects" && introduction && item.x === introduction.x && item.y !== introduction.y) && manager.isVisible("about");
  const showLandingCup = !handheld && !manager.singleWindow && visibleWindows.length === 2 && visibleWindows.some(item => item.id === "projects") && introduction && manager.isVisible("about") && introduction.width <= 360;
  const singleStage = visibleWindows.length === 1 ? visibleWindows[0] : undefined;
  const showSingleCup = !!(!handheld && singleStage && !singleStage.maximized && singleStage.height <= 520 && manager.bounds && manager.bounds.height - singleStage.y - singleStage.height >= manager.bounds.width * .1 + 12);
  const denseWorkspace = !handheld && !manager.singleWindow && visibleWindows.length >= 3;
  const coffeeAnchor = showSingleCup ? singleStage : introduction;
  const coffeeFloor = showSingleCup && singleStage ? `calc(${singleStage.y + singleStage.height + 20}px - 52vh + 4.73vw)` : `${introduction ? (introduction.y + introduction.height + 8) * .48 : 0}px`;
  const wallpaperStyle = { backgroundImage: `url("${wallpaper.src}")`, "--coffee-x": `${coffeeAnchor ? coffeeAnchor.x + coffeeAnchor.width / 2 : 0}px`, "--coffee-floor": coffeeFloor } as CSSProperties;
  return <div ref={shellRef} className="rumda-desktop" data-reading={readingApp || undefined} data-stacked={stackedPortfolio || undefined} data-effect={effect?.name} data-palette={palette.id} data-wallpaper={wallpaper.id} style={Object.fromEntries(Object.entries(palette.colors).map(([key, value]) => [`--${key}`, value])) as CSSProperties}>
    <div ref={sceneRef} className="desktop-scene">
    <HandheldChrome title={activeApp ? handheldLabel(activeApp) : "Applications"} home={mobileHome} canBack={mobileHistory.length > 1 || !projectIndexOpen && projectIndexBack && manager.activeId === "projects"} running={manager.windows.filter(item => item.open).length} onHome={home} onBack={back} onSwitch={() => setSwitcher(true)} />
    <a className="desktop-skip" href="#desktop-workspace">Skip to windows</a>
    <div className="desktop-wallpaper" data-reframed={showLandingCup || showSingleCup || undefined} data-dense={denseWorkspace || undefined} aria-hidden="true" style={wallpaperStyle} />
    <aside className="rumda-bar" aria-label="Desktop controls">
      <button className="bar-coffee" aria-label="Open application launcher" aria-haspopup="dialog" aria-expanded={launcher} title="Applications · Ctrl + Space" onClick={() => setLauncher(true)}><span className="bar-launcher-icon" aria-hidden="true" /><span className="bar-launcher-label">Apps</span></button>
      <div className="bar-top">
        <BarClock />
        <div className="bar-rings"><button aria-label="Open Projects" title="Projects" onClick={() => openApp("projects")}><i /></button><button aria-label="Open Experience" title="Experience" onClick={() => openApp("experience")}><i /></button></div>
      </div>
      <nav className="bar-workspaces" aria-label="Applications">{apps.map(app => {
        const item = manager.windows.find(window => window.id === app.id);
        return <button key={app.id} data-app-id={app.id} className={manager.activeId === app.id ? "active" : ""} aria-label={`Open ${app.label}`} aria-pressed={item?.open && !item.minimized} title={`${app.label}${item?.minimized ? " (minimized)" : ""}`} onClick={() => openApp(app.id)}><DesktopIcon name={app.id} /></button>;
      })}</nav>
      <div className="bar-bottom"><a href={contact.github} aria-label="GitHub" title="GitHub" target="_blank" rel="noopener noreferrer"><DesktopIcon name="github" /></a><button aria-label="Show or restore desktop" title="Show desktop" onClick={toggleDesktop}><DesktopIcon name="desktop" /></button></div>
    </aside>
    <main ref={workspaceRef} className="desktop-workspace" id="desktop-workspace" tabIndex={-1} aria-label="Portfolio desktop">
      <h1 className="sr-only">Liem Luttrell’s portfolio</h1>
      <HandheldHome apps={apps} open={openHomeApp} openFeatured={openFeaturedProject} hidden={!mobileHome} />
      <div className={`desktop-app-host${mobileHome ? " pda-apps-hidden" : ""}`} inert={handheld && mobileHome} aria-hidden={handheld && mobileHome || undefined}>
      {manager.windows.map(item => <DesktopWindow key={item.id} window={item} manager={manager}>{content[item.id as keyof typeof content]}</DesktopWindow>)}
      {!manager.windows.some(item => item.open && !item.minimized) && <button className="empty-desktop" onClick={() => setLauncher(true)}>Open applications</button>}
      </div>
    </main>
    {launcher && !handheld && <ApplicationLauncher apps={apps} running={manager.windows.filter(item => item.open).map(item => item.id)} onClose={() => setLauncher(false)} onLaunch={openApp} />}
    {switcher && handheld && <HandheldSwitcher apps={apps} running={manager.windows.filter(item => item.open).map(item => item.id)} open={openApp} close={closeMobileApp} dismiss={() => setSwitcher(false)} />}
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
