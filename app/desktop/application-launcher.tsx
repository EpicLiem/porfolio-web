"use client";

import { useEffect, useId, useRef, useState } from "react";
import "./application-launcher.css";

export type LauncherApp = { id: string; label: string; file: string; keywords: string };

export function ApplicationLauncher({ apps, running, onLaunch, onClose }: {
  apps: LauncherApp[];
  running: string[];
  onLaunch: (id: string) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launching = useRef(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const listId = useId();
  const titleId = useId();
  const matches = apps.filter(app => query.toLowerCase().trim().split(/\s+/).every(word => `${app.label} ${app.file} ${app.keywords}`.toLowerCase().includes(word)));
  const active = matches[selected];

  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    inputRef.current?.focus();
    return () => {
      dialog?.close();
      if (!launching.current) previous?.focus({ preventScroll: true });
    };
  }, []);

  function launch(id: string) {
    launching.current = true;
    onLaunch(id);
  }

  return <dialog ref={dialogRef} className="application-launcher" aria-labelledby={titleId}
    onCancel={onClose}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <header className="launcher-caption"><h2 id={titleId}>Applications</h2><button type="button" onClick={onClose} aria-label="Close application launcher">esc</button></header>
    <input ref={inputRef} className="launcher-search" aria-label="Search applications" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls={listId} aria-activedescendant={active ? `${listId}-${active.id}` : undefined}
      placeholder="Search..." value={query} autoComplete="off" spellCheck={false}
      onChange={event => { setQuery(event.target.value); setSelected(0); }}
      onKeyDown={event => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          if (matches.length) setSelected(index => (index + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length);
        } else if (event.key === "Enter" && active) {
          event.preventDefault();
          launch(active.id);
        }
      }} />
    <div id={listId} className="launcher-results" role="listbox" aria-label="Applications">
      {matches.map((app, index) => <div key={app.id} id={`${listId}-${app.id}`} role="option" aria-selected={selected === index}
        className="launcher-result" onMouseEnter={() => setSelected(index)} onMouseDown={event => event.preventDefault()} onClick={() => launch(app.id)}>
        <span>{app.label}</span><span className="launcher-running" aria-label={running.includes(app.id) ? "Open" : undefined}>{running.includes(app.id) ? "●" : ""}</span>
      </div>)}
    </div>
    {!matches.length && <p className="launcher-empty" role="status">No applications found.</p>}
    <footer className="launcher-footer"><span>↑↓ select · enter open</span><span>{matches.length}/{apps.length}</span></footer>
  </dialog>;
}
