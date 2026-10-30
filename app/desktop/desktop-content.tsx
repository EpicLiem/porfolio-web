"use client";

import { ContactForm } from "./portfolio-forms";

import { useState } from "react";
import Image from "next/image";
import { career, contact, projects } from "@/lib/portfolio";

export function ExperienceWindow() {
  const [selected, setSelected] = useState(0);
  const job = career[selected];
  const lines = [`# ${job.name}`, "", job.role, job.period, job.location, "", ...job.lines.flatMap(line => [line, ""])];
  return <div className="editor-app">
    <div className="file-path">~/experience/{job.name.toLowerCase().replaceAll(" ", "-")}.md</div>
    <div className="editor-split"><nav className="file-tree" aria-label="Experience files"><span className="tree-root">▾ experience</span>{career.map((item,index) => <button key={item.name} aria-pressed={index === selected} onClick={() => setSelected(index)}><span aria-hidden="true">󰈙</span> {item.name}</button>)}</nav>
    <article className="editor-document" aria-label={`${job.name} experience`} aria-live="polite">{lines.map((line,index) => <div className={`code-line ${index===0 ? "markdown-heading" : ""}`} key={`${job.name}-${index}`}><span className="line-number" aria-hidden="true">{index+1}</span><span>{line || "\u00a0"}</span></div>)}</article></div>
    <div className="editor-status"><span>NORMAL</span><span>{job.name}.md</span><span>utf-8</span><span>markdown</span></div>
  </div>;
}

export function ProjectsWindow() {
  const [selected, setSelected] = useState(0);
  const project = projects[selected];
  return <div className="file-manager">
    <div className="file-path">~/projects/{project.id}</div>
    <div className="project-browser"><nav className="project-folders" aria-label="Project folders">{projects.map((item,index) => <button key={item.id} onClick={() => setSelected(index)} aria-pressed={index===selected}><span aria-hidden="true">󰉋</span> {item.name}</button>)}</nav>
    <article className="project-readme" aria-label={`${project.name} project`} aria-live="polite"><h2>{project.name}</h2><p className="muted">{project.category}{project.date && ` · ${project.date}`}</p>{project.id === "flowcast" && <div className="project-capture"><Image src="/desktop/flowcast.jpg" alt="Flowcast campus simulation" width={800} height={450} sizes="(max-width: 600px) 75vw, 450px" /></div>}{project.description.map(text => <p key={text}>{text}</p>)}<div className="terminal-links">{project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>)}</div></article></div>
    <div className="editor-status"><span>NOR</span><span>README.md</span><span>{selected+1}/{projects.length}</span></div>
  </div>;
}

export function ContactWindow() {
  return <div className="text-document"><p className="terminal-command"><span>liem@portfolio</span> ~ $ cat contact.txt</p><ContactForm /><dl className="contact-list"><dt>email</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd><dt>github</dt><dd><a href={contact.github} target="_blank" rel="noopener noreferrer">github.com/EpicLiem ↗</a></dd><dt>linkedin</dt><dd><a href={contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></dd><dt>devpost</dt><dd><a href={contact.devpost} target="_blank" rel="noopener noreferrer">Devpost ↗</a></dd></dl></div>;
}

export function HelpWindow() {
  return <div className="text-document"><h2>Keybindings</h2><p>Windows tile automatically. Open apps from the left bar or coffee launcher.</p><dl className="help-list">
    <dt>Ctrl + Space</dt><dd>Open the application launcher. Type to search, use ↑/↓ to select, then Enter to open.</dd>
    <dt>Arrows</dt><dd>Focus the neighboring tile, except while typing or playing chess.</dd>
    <dt>Shift + arrows</dt><dd>Swap the active tile with its neighbor. You can also drag a title onto another tile.</dd>
    <dt>Tab</dt><dd>Move through controls. Enter or Space activates a button.</dd>
    <dt>Escape</dt><dd>Close the app launcher or skip the boot animation.</dd>
    <dt>Maximize</dt><dd>Double-click a title or use its square button. Repeat to return to tiling.</dd>
    <dt>Minimize</dt><dd>Use the minus button. Its sidebar icon restores the app and selected file.</dd>
    <dt>Desktop</dt><dd>The monitor button hides or restores all open windows.</dd>
    <dt>Terminal</dt><dd>Enter runs a command. Shift+Enter adds a script line. ↑↓ browse history; Tab completes commands and paths. Ctrl+C cancels the input; Ctrl+L clears output. Shift+Tab leaves the input.</dd>
  </dl><p className="muted">On narrow screens, the sidebar switches between full-size windows.</p><p className="muted">Visual reference: <a href="https://github.com/hexonide/rumda" target="_blank" rel="noopener noreferrer">Rumda by hexonide ↗</a></p></div>;
}
