"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DesktopIcon } from "./desktop-icon";
import { education } from "@/lib/portfolio";

const query = "(max-width: 767px), (max-width: 1000px) and (max-height: 500px)";
function subscribe(callback: () => void) {
  const media = matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
export function useHandheld() {
  return useSyncExternalStore(subscribe, () => matchMedia(query).matches, () => false);
}

export type HandheldApp = { id: string; label: string };
const homeApps = ["projects", "experience", "about", "chess", "contact", "guestbook"];
export const handheldLabel = (app: HandheldApp) => app.id === "chess" ? "Liemfish" : app.id === "help" ? "Help & controls" : app.label;

function PocketClock() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);
  return <time aria-label={`Local time ${time}`}>{time}</time>;
}

function HardwareIcon({ kind }: { kind: "home" | "back" | "switch" }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    {kind === "home" ? <path d="m3 11 9-8 9 8M6 9v12h5v-7h3v7h4V9" /> : kind === "back" ? <path d="m10 5-7 7 7 7M3 12h18" /> : <><rect x="3" y="3" width="12" height="12" /><path d="M18 9h3v12H9v-3" /></>}
  </svg>;
}

export function HandheldChrome({ title, home, canBack, running, onHome, onBack, onSwitch }: {
  title: string; home: boolean; canBack: boolean; running: number;
  onHome: () => void; onBack: () => void; onSwitch: () => void;
}) {
  return <div className="pda-chrome">
    <header className="pda-masthead"><span>LIEM / POCKET</span><i className="pda-speaker" aria-hidden="true" /></header>
    <div className="pda-status"><span>{home ? "Personal organizer" : title}</span><PocketClock /></div>
    <nav className="pda-hardware" aria-label="Handheld navigation">
      <button onClick={onHome} aria-current={home ? "page" : undefined}><HardwareIcon kind="home" /><span>Home</span></button>
      <button onClick={onBack} disabled={!canBack}><HardwareIcon kind="back" /><span>Back</span></button>
      <button onClick={onSwitch} aria-label={`Switch apps, ${running} running`}><HardwareIcon kind="switch" /><span>Switch</span></button>
    </nav>
    <div className="pda-engraving" aria-hidden="true">EPICLIEM.COM</div>
  </div>;
}

export function HandheldHome({ apps, open, hidden }: { apps: HandheldApp[]; open: (id: string) => void; hidden: boolean }) {
  return <section className="pda-home" hidden={hidden} aria-label="Pocket organizer home">
    <header className="pda-intro"><h2>Liem Luttrell</h2><p>Software &amp; engineering</p><p>{education.school} · Class of 2030</p></header>
    <nav className="pda-app-grid" aria-label="Pocket applications">
      {homeApps.map(id => {
        const app = apps.find(item => item.id === id)!;
        return <button key={id} onClick={() => open(id)}><span className="pda-app-icon"><DesktopIcon name={id} /></span><span>{handheldLabel(app)}</span></button>;
      })}
    </nav>
    <button className="pda-help-link" onClick={() => open("help")}><DesktopIcon name="help" /><span>Help &amp; controls</span><span aria-hidden="true">›</span></button>
  </section>;
}

export function HandheldSwitcher({ apps, running, open, close, dismiss }: {
  apps: HandheldApp[]; running: string[]; open: (id: string) => void; close: (id: string) => void; dismiss: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); previous?.focus({ preventScroll: true }); };
  }, []);
  const matches = apps.filter(app => `${handheldLabel(app)} ${app.label}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <dialog className="pda-switcher" ref={dialog} aria-labelledby="pda-switcher-title" onCancel={dismiss}>
    <header><h2 id="pda-switcher-title">Applications</h2><button onClick={dismiss} aria-label="Close app switcher" autoFocus>Done</button></header>
    <label className="pda-search">Find an app<input type="search" value={query} onChange={event => setQuery(event.target.value)} autoComplete="off" /></label>
    <ul>{matches.map(app => <li key={app.id}>
      <div className="pda-switcher-row"><button className="pda-switcher-open" onClick={() => open(app.id)}><DesktopIcon name={app.id} /><span>{handheldLabel(app)}</span>{running.includes(app.id) && <small>Open</small>}</button>
        {running.includes(app.id) && <button onClick={() => setConfirm(app.id)} aria-label={`Close ${handheldLabel(app)}`}>×</button>}
      </div>
      {confirm === app.id && <div className="pda-close-confirm"><p>Close {handheldLabel(app)}? Its current session will be cleared.</p><button onClick={() => { close(app.id); setConfirm(null); }}>Close app</button><button onClick={() => setConfirm(null)}>Keep open</button></div>}
    </li>)}</ul>
    {!matches.length && <p role="status">No matching apps.</p>}
    <p className="pda-switcher-note">Switching keeps your place. Closing ends the app session.</p>
  </dialog>;
}

export function HandheldHelp() {
  return <article className="pda-help"><h2>A pocket guide</h2><p>The same portfolio, made for your pocket.</p>
    <dl><dt>Home</dt><dd>Return to the organizer. Open apps keep their place.</dd><dt>Back</dt><dd>Return to the previous app or the organizer.</dd><dt>Switch</dt><dd>Find any app, return to an open one, or close its session.</dd><dt>Terminal</dt><dd>Type a command and tap Run. Tab completes it; the arrow buttons browse your command history. Try <code>help</code> or <code>open projects</code>.</dd><dt>Liemfish</dt><dd>Choose your side and time control, then start. Tap or drag pieces to move. Games and clocks continue while you visit other apps.</dd></dl>
    <p>A connected keyboard still works. In the terminal, Enter runs, Shift+Enter adds a line, and Tab completes. Escape closes the app switcher.</p>
  </article>;
}
