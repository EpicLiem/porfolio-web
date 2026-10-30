"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { playEffectSound } from "../effects/effect-sound";
import { complete, createShell, execute, type DesktopEffect } from "@/lib/terminal/shell";
import "./terminal-window.css";

type Entry = { id: number; cwd: string; command?: string; output: string; failed?: boolean };
const displayPath = (cwd: string) => cwd === "/home/liem" ? "~" : cwd.startsWith("/home/liem/") ? `~${cwd.slice(10)}` : cwd;

export function TerminalWindow({ open, onEffect }: { open: (id: string) => void; onEffect: (effect: DesktopEffect) => void }) {
  const [session] = useState(() => {
    const shell = createShell();
    const welcome = execute(shell, "fastfetch").output;
    shell.history.length = 0;
    return { shell, welcome };
  });
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, cwd: session.shell.cwd, output: session.welcome }]);
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const sequence = useRef(1);
  const historyIndex = useRef<number | null>(null);
  const draft = useRef("");
  const stopSound = useRef<(() => void) | null>(null);
  useEffect(() => () => stopSound.current?.(), []);
  const cwd = session.shell.cwd;

  useLayoutEffect(() => {
    const output = outputRef.current;
    if (output) output.scrollTop = output.scrollHeight;
  }, [entries]);

  function append(entry: Omit<Entry, "id">, clear = false) {
    const record = { ...entry, id: sequence.current++ };
    setEntries(previous => {
      const next = clear ? (entry.output ? [record] : []) : [...previous, record].slice(-120);
      let length = next.reduce((total, item) => total + item.output.length + (item.command?.length ?? 0), 0);
      while (next.length > 1 && length > 64000) {
        const removed = next.shift()!;
        length -= removed.output.length + (removed.command?.length ?? 0);
      }
      return next;
    });
  }

  function submit() {
    if (!input.trim()) return;
    const command = input;
    const from = session.shell.cwd;
    const result = execute(session.shell, command);
    append({ cwd: from, command, output: result.output, failed: result.exitCode !== 0 }, result.clear);
    for (const id of result.openApps) open(id);
    if (result.sound) {
      stopSound.current?.();
      stopSound.current = playEffectSound(result.sound, 5000);
    }
    if (result.effect) onEffect(result.effect);
    setInput(""); setNotice(""); historyIndex.current = null; draft.current = "";
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key.startsWith("Arrow")) event.stopPropagation();
    if (event.ctrlKey && !event.altKey && !event.metaKey && ["c", "l"].includes(event.key.toLowerCase())) {
      event.preventDefault(); event.stopPropagation();
      if (event.key.toLowerCase() === "l") setEntries([]);
      else { append({ cwd, command: `${input}^C`, output: "" }); setInput(""); historyIndex.current = null; setNotice(""); }
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.stopPropagation(); submit(); return; }
    if (event.key === "Tab" && !event.shiftKey && input.length > 0) {
      event.preventDefault(); event.stopPropagation();
      const result = complete(session.shell, input);
      setInput(result.value);
      setNotice(result.matches.length > 1 ? result.matches.join("  ") : "");
      return;
    }
    if (!input.includes("\n") && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      const history = session.shell.history;
      if (!history.length) return;
      if (historyIndex.current === null) { draft.current = input; historyIndex.current = history.length; }
      const index = Math.max(0, Math.min(history.length, historyIndex.current + (event.key === "ArrowUp" ? -1 : 1)));
      historyIndex.current = index;
      setInput(index === history.length ? draft.current : history[index]);
    }
  }

  return <section className="shell-terminal" aria-label="Interactive terminal">
    <div className="shell-output" ref={outputRef} role="log" aria-label="Terminal output" aria-live="polite" tabIndex={0} onClick={() => { if (!window.getSelection()?.toString()) inputRef.current?.focus(); }}>
      {entries.map(entry => <div className="shell-entry" key={entry.id}>
        {entry.command !== undefined && <div className="shell-command"><span className="shell-user">liem@portfolio</span> <span className="shell-path">{displayPath(entry.cwd)}</span> <span aria-hidden="true">$ </span><span>{entry.command}</span></div>}
        {entry.output && <pre className={entry.failed ? "shell-error" : undefined}>{entry.output}</pre>}
      </div>)}
    </div>
    <div className="shell-input-row">
      <span className="shell-prompt" aria-hidden="true"><span className="shell-user">liem@portfolio</span> <span className="shell-path">{displayPath(cwd)}</span> $</span>
      <textarea ref={inputRef} aria-label="Terminal command" aria-describedby="shell-hint" value={input} rows={Math.min(6, input.split("\n").length)} spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" maxLength={8192} onChange={event => { setInput(event.target.value); setNotice(""); historyIndex.current = null; }} onKeyDown={keyDown} />
    </div>
    {notice && <p className="shell-completions" role="status">{notice}</p>}
    <p className="shell-hint" id="shell-hint">Type <kbd>help</kbd> · Tab completes · ↑↓ history · Shift+Enter adds a line</p>
  </section>;
}
