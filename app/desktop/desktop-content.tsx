"use client";

import { ContactForm } from "./portfolio-forms";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { career, contact, projects } from "@/lib/portfolio";
import { flowcastMedia, notebrewMedia } from "@/lib/project-media";

const patentCredit = "Co-inventor on a U.S. patent application";

export function ExperienceWindow() {
  const [selected, setSelected] = useState(0);
  const job = career[selected];
  const filename = `${job.name.toLowerCase().replaceAll(" ", "-")}.md`;
  const lines = [`# ${job.name}`, "", job.role, job.period, job.location, "", ...job.lines.flatMap(line => [line, ""])];
  return <div className="editor-app">
    <div className="file-path">~/experience/{filename}</div>
    <div className="editor-split"><label className="experience-picker"><span className="picker-caption">Experience<small>{selected+1} of {career.length}</small></span><select value={selected} onChange={event => setSelected(Number(event.target.value))}>{career.map((item,index) => <option key={item.name} value={index}>{item.name}</option>)}</select></label><nav className="file-tree" aria-label="Experience files"><span className="tree-root">▾ experience</span>{career.map((item,index) => <button key={item.name} aria-pressed={index === selected} onClick={() => setSelected(index)}><span aria-hidden="true">󰈙</span> {item.name}</button>)}</nav>
    <article className="editor-document" aria-label={`${job.name} experience`} aria-live="polite">{lines.map((line,index) => <div className={`code-line ${index === 0 ? "markdown-heading" : index === 2 ? "experience-role" : index === 3 || index === 4 ? "experience-meta" : index >= 6 ? "experience-achievement" : ""}${index === 6 ? " experience-lead" : ""}${index === 5 ? " experience-section-break" : ""}${line ? "" : " experience-blank"}`} key={`${job.name}-${index}`}><span className="line-number" aria-hidden="true">{index+1}</span><span>{line.startsWith(patentCredit) ? <><span className="experience-highlight">{patentCredit}</span>{line.slice(patentCredit.length)}</> : line || "\u00a0"}</span></div>)}</article></div>
    <div className="editor-status"><span>NORMAL</span><span>{filename}</span><span>utf-8</span><span>markdown</span></div>
  </div>;
}

type ProjectBrowserControls = { browsing: boolean; onBrowse: () => void; onRead: () => void };

export function ProjectsWindow({ browser }: { browser?: ProjectBrowserControls } = {}) {
  const [selected, setSelected] = useState(0);
  const browserRef = useRef<HTMLDivElement>(null);
  const project = projects[selected];
  const showcase = project.id === "flowcast";
  const browsing = browser?.browsing;
  useEffect(() => {
    if (browsing === undefined) return;
    browserRef.current?.querySelector<HTMLElement>(browsing ? ".project-index button" : ".project-heading h2")?.focus({ preventScroll: true });
  }, [browsing, selected]);
  function selectProject(index: number) {
    if (index === selected && !browser) return;
    browserRef.current?.closest(".wm-body")?.scrollTo(0, 0);
    setSelected(index);
    browser?.onRead();
  }
  function browseProjects() {
    browserRef.current?.closest(".wm-body")?.scrollTo(0, 0);
    browser?.onBrowse();
  }
  const details = <>
    {project.id === "notebrew" && <p className="project-summary">{project.summary}</p>}
    {showcase ? <>
      <section className="project-context" aria-labelledby="flowcast-model-title"><h3 id="flowcast-model-title">Simulation &amp; data</h3><p className="project-explanation">{project.description[1]}</p><p className="project-detail">{project.description[2]}</p></section>
      <section className="project-context" aria-labelledby="flowcast-recognition-title"><h3 id="flowcast-recognition-title">Recognition</h3><p className="project-explanation">{project.description[3]}</p></section>
    </> : project.description.slice(1).map((text,index) => <p className={project.id === "notebrew" && index === 0 ? "project-explanation" : "project-detail"} key={text}>{text}</p>)}
    {showcase && <figure className="project-supporting-capture"><a href={flowcastMedia.incident.src} target="_blank" rel="noopener noreferrer" aria-label="Open full-size Flowcast incident image (opens in a new tab)"><Image {...flowcastMedia.incident} alt={flowcastMedia.incident.alt} sizes="(max-width: 600px) 85vw, 850px" /></a><figcaption>Incident simulation, from the Devpost gallery. <a href={flowcastMedia.incident.src} target="_blank" rel="noopener noreferrer">Full size ↗</a></figcaption></figure>}
    {project.links.length > 0 && <div className="terminal-links">{project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>)}</div>}
  </>;
  return <div className="file-manager">
    <div className="project-browser" ref={browserRef}>
    {browsing ? <section className="project-index" aria-label="Project index">
      <div className="project-index-heading"><span>~/projects</span><span>{projects.length} entries</span></div>
      <nav className="project-index-list" aria-label="All projects">{projects.map((item,index) => <button type="button" key={item.id} aria-label={`Read ${item.name}`} onClick={() => selectProject(index)}><span className="project-index-number" aria-hidden="true">{String(index+1).padStart(2,"0")}</span><span className="project-index-copy"><strong>{item.name}</strong><span className="project-index-category">{item.category}</span><span className="project-index-summary">{item.summary}</span></span><span className="project-index-arrow" aria-hidden="true">›</span></button>)}</nav>
    </section> : <>
    {browser && <nav className="project-reader-toolbar" aria-label="Project browser"><button type="button" onClick={browseProjects}>All projects</button><span>{selected+1} of {projects.length}</span></nav>}
    {!browser && <nav className="project-folders" aria-label="Project folders">{projects.map((item,index) => <button key={item.id} onClick={() => selectProject(index)} aria-pressed={index===selected}><span aria-hidden="true">󰉋</span> {item.name}</button>)}</nav>}
    {!browser && <label className="project-picker"><span className="picker-caption">Project<small>{selected+1} of {projects.length}</small></span><select value={selected} onChange={event => selectProject(Number(event.target.value))}>{projects.map((item,index) => <option key={item.id} value={index}>{item.name}</option>)}</select></label>}
    <article key={project.id} className={`project-readme${showcase ? " project-showcase" : " project-document"}${project.id === "notebrew" ? " project-notebrew" : ""}`} aria-label={`${project.name} project`} aria-live="polite"><div className="project-story">
      <header className="project-heading"><div><h2 tabIndex={browser ? -1 : undefined}>{project.name}</h2><p className="muted">{project.id === "emp" ? project.date : `${project.category}${project.date ? ` · ${project.date}` : ""}`}</p></div>{showcase && <p className="project-contribution">{project.description[0]}</p>}</header>
      {!showcase && project.id !== "emp" && project.id !== "notebrew" && <p className="project-summary">{project.summary}</p>}
      {!showcase && <p className="project-contribution">{project.description[0]}</p>}
      {showcase && <figure className="project-capture"><a href={flowcastMedia.campus.src} target="_blank" rel="noopener noreferrer" aria-label="Open full-size Flowcast campus image (opens in a new tab)"><Image {...flowcastMedia.campus} alt={flowcastMedia.campus.alt} sizes="(max-width: 600px) 85vw, 850px" loading="eager" /></a><figcaption>{project.summary} <a href={flowcastMedia.campus.src} target="_blank" rel="noopener noreferrer">Full size ↗</a></figcaption></figure>}
      {project.id === "notebrew" ? <div className="project-note-body"><figure className="project-gallery">{notebrewMedia.map(image => <a key={image.src} href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size screenshot: ${image.alt} (opens in a new tab)`}><Image {...image} alt={image.alt} sizes="(max-width: 500px) 38vw, 220px" loading="eager" /></a>)}<figcaption>Coffee logs and Dial In. Open either App Store screenshot full size.</figcaption></figure><div className="project-note-copy">{details}</div></div> : details}
      {browser && <nav className="project-document-navigation" aria-label="Project navigation"><button type="button" onClick={browseProjects}>All projects</button>{selected+1 < projects.length && <button type="button" onClick={() => selectProject(selected+1)}><small>Next project</small><strong>{projects[selected+1].name}</strong></button>}</nav>}
    </div></article></>}
    </div>
    <div className="editor-status"><span>NOR</span><span>README.md</span><span>{selected+1}/{projects.length}</span></div>
  </div>;
}

export function ContactWindow() {
  return <div className="text-document contact-document"><p className="terminal-command"><span>liem@portfolio</span> ~ $ cat contact.txt</p><div className="contact-layout"><ContactForm /><dl className="contact-list"><dt>email</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd><dt>github</dt><dd><a href={contact.github} target="_blank" rel="noopener noreferrer">github.com/EpicLiem ↗</a></dd><dt>linkedin</dt><dd><a href={contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></dd><dt>devpost</dt><dd><a href={contact.devpost} target="_blank" rel="noopener noreferrer">Devpost ↗</a></dd></dl></div></div>;
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
