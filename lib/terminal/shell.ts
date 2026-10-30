import { about, career, contact, education, projects } from "../portfolio";

type Entry = { kind: "directory" } | { kind: "file"; content: string };
export interface ShellState {
  cwd: string;
  env: Record<string, string>;
  history: string[];
  lastExitCode: number;
  filesystem: Map<string, Entry>;
}
export type DesktopEffect = "nightcity" | "relic" | "blackwall" | "sandevistan" | "matrix";
export interface ShellResult { output: string; exitCode: number; clear: boolean; openApps: string[]; effect?: DesktopEffect; sound?: "fixer" }
type Part = { text: string; expand: boolean };
type Word = { kind: "word"; parts: Part[] };
type Token = Word | { kind: "operator"; value: string };
type Command = { words: Word[]; redirect?: { append: boolean; path: Word } };
type Pipeline = { commands: Command[]; condition: ";" | "&&" | "||" };
type Context = { steps: number; depth: number; clear: boolean; clears: number; openApps: string[]; effect?: DesktopEffect; sound?: "fixer" };
const HOME = "/home/liem";
const LIMIT = { input: 16384, output: 32768, file: 32768, total: 262144, entries: 256, steps: 128, depth: 8 };
const appIds: Record<string, string> = { terminal: "about", about: "about", projects: "projects", experience: "experience", contact: "contact", guestbook: "guestbook", chess: "chess", liemfish: "chess", help: "help", keybindings: "help" };
const commands = ["help", "pwd", "ls", "tree", "cd", "cat", "echo", "printf", "mkdir", "touch", "cp", "mv", "rm", "grep", "head", "tail", "wc", "sort", "uniq", "clear", "history", "whoami", "date", "uname", "env", "export", "true", "false", "open", "source", "sh", "fastfetch", "neofetch", "coffee", "fortune", "cowsay", "sudo", "matrix", "sl", "nightcity", "fixer", "relic", "blackwall", "sandevistan"];
function fail(message: string): never { throw new Error(message); }
const slug = (value: string) => value.toLowerCase().replaceAll(" ", "-");

export function createShell(): ShellState {
  const filesystem = new Map<string, Entry>();
  for (const path of ["/", "/home", HOME, `${HOME}/projects`, `${HOME}/experience`, `${HOME}/notes`, "/etc"]) filesystem.set(path, { kind: "directory" });
  const file = (path: string, content: string) => filesystem.set(path, { kind: "file", content: content + "\n" });
  file(`${HOME}/readme.txt`, `${about}\n\nBrowse projects/ and experience/, or use open projects.\nYour virtual files live in this window only. Minimize keeps them; closing resets the session.\nTry help, fastfetch, or ls -a.`);
  file(`${HOME}/contact.txt`, Object.entries(contact).map(([name, value]) => `${name}: ${value}`).join("\n"));
  file(`${HOME}/.secrets`, "Off the menu:\ncoffee espresso\ncoffee pour-over\nfortune | cowsay\nmatrix\nsl\nsudo make me a sandwich\n\nRecovered shard:\nnightcity\nfixer\nrelic\nblackwall\nsandevistan");
  file(`${HOME}/notes/welcome.sh`, '# A tiny script you can edit with echo and redirection.\nNAME="visitor"\necho "Hello, $NAME."\nprintf "The coffee is ready.\\n"\n');
  file("/etc/os-release", 'NAME="Portfolio Linux"\nPRETTY_NAME="Liem’s browser desktop"\nID=portfolio\nNOTE="A virtual shell, not a connection to a real machine."');
  for (const project of projects) file(`${HOME}/projects/${project.id}.md`, [`# ${project.name}`, project.category, project.date, ...project.description, ...project.links.map(link => `${link.label}: ${link.href}`)].filter(Boolean).join("\n\n"));
  for (const job of career) file(`${HOME}/experience/${slug(job.name)}.md`, [`# ${job.name}`, job.role, job.period, job.location, ...job.lines].filter(Boolean).join("\n\n"));
  return { cwd: HOME, env: Object.assign(Object.create(null), { HOME, USER: "liem", SHELL: "/bin/portfolio-sh", TERM: "portfolio", PWD: HOME }), history: [], lastExitCode: 0, filesystem };
}

export function resolvePath(shell: ShellState, path: string): string {
  const expanded = path === "~" || path.startsWith("~/") ? HOME + path.slice(1) : path;
  const parts: string[] = [];
  for (const part of (expanded.startsWith("/") ? expanded : `${shell.cwd}/${expanded}`).split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop(); else parts.push(part);
  }
  return "/" + parts.join("/");
}
const parentPath = (path: string) => path.slice(0, path.lastIndexOf("/")) || "/";
const basename = (path: string) => path.slice(path.lastIndexOf("/") + 1);
function read(shell: ShellState, path: string): string {
  const absolute = resolvePath(shell, path), entry = shell.filesystem.get(absolute);
  if (!entry) fail(`${path}: No such file or directory`);
  if (entry.kind !== "file") fail(`${path}: Is a directory`);
  return entry.content;
}
function writable(path: string) { if (!path.startsWith(HOME + "/")) fail(`${path}: Permission denied (write inside ~)`); }
function validateSize(fs: Map<string, Entry>) {
  if (fs.size > LIMIT.entries) fail("Virtual filesystem entry limit reached");
  let total = 0;
  for (const entry of fs.values()) if (entry.kind === "file") {
    if (entry.content.length > LIMIT.file) fail("Virtual file size limit reached (32 KiB)");
    total += entry.content.length;
  }
  if (total > LIMIT.total) fail("Virtual filesystem capacity reached (256 KiB)");
}
function write(shell: ShellState, path: string, content: string, append = false) {
  const absolute = resolvePath(shell, path); writable(absolute);
  if (shell.filesystem.get(parentPath(absolute))?.kind !== "directory") fail(`${path}: Parent directory does not exist`);
  const old = shell.filesystem.get(absolute);
  if (old?.kind === "directory") fail(`${path}: Is a directory`);
  const next = new Map(shell.filesystem);
  next.set(absolute, { kind: "file", content: (append && old?.kind === "file" ? old.content : "") + content });
  validateSize(next); shell.filesystem = next;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let parts: Part[] = [], started = false, quote: "'" | '"' | null = null;
  const add = (text: string, expand: boolean) => { started = true; if (parts.at(-1)?.expand === expand) parts[parts.length - 1].text += text; else parts.push({ text, expand }); };
  const flush = () => { if (started) tokens.push({ kind: "word", parts }); parts = []; started = false; };
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quote === "'") { if (c === "'") quote = null; else add(c, false); continue; }
    if (c === "\\") {
      if (i + 1 === input.length) fail("Incomplete escape: add a character after \\");
      const next = input[++i];
      if (next === "\n") continue;
      if (quote === '"' && !['"', "$", "\\"].includes(next)) add("\\", false);
      add(next, false); continue;
    }
    if (c === "`") fail("Command substitution is not supported");
    if (quote === '"') { if (c === '"') quote = null; else { if (c === "$" && input[i + 1] === "(") fail("Command substitution is not supported"); add(c, true); } continue; }
    if (c === "'" || c === '"') { started = true; quote = c; continue; }
    if (c === "$" && input[i + 1] === "(") fail("Command substitution is not supported");
    if (c === "#" && !started) { while (i < input.length && input[i] !== "\n") i++; if (i < input.length) tokens.push({ kind: "operator", value: ";" }); continue; }
    if (c === "\n" || c === ";") { flush(); tokens.push({ kind: "operator", value: ";" }); continue; }
    if (/\s/.test(c)) { flush(); continue; }
    if ("|&><".includes(c)) {
      flush();
      const pair = c + (input[i + 1] ?? "");
      if (["||", "&&", ">>"].includes(pair)) { tokens.push({ kind: "operator", value: pair }); i++; }
      else if (c === "|" || c === ">") tokens.push({ kind: "operator", value: c });
      else fail(`${c}: Unsupported operator`);
      continue;
    }
    add(c, true);
  }
  if (quote) fail(`Unclosed ${quote === "'" ? "single" : "double"} quote`);
  flush(); return tokens;
}
function parse(input: string): Pipeline[] {
  const tokens = tokenize(input), pipelines: Pipeline[] = [];
  let commands: Command[] = [], current: Command = { words: [] }, condition: Pipeline["condition"] = ";", expecting = false;
  const finish = () => { if (!current.words.length) fail("Expected a command"); commands.push(current); current = { words: [] }; };
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.kind === "word") { current.words.push(token); expecting = false; continue; }
    if (token.value === ">" || token.value === ">>") {
      const path = tokens[++i];
      if (!path || path.kind !== "word" || current.redirect) fail("Expected one output file after redirection");
      current.redirect = { append: token.value === ">>", path }; continue;
    }
    if (token.value === "|") { if (current.redirect) fail("Redirection must be on the last command in a pipeline"); finish(); expecting = true; continue; }
    if (!current.words.length && !commands.length && token.value === ";" && !expecting) continue;
    finish(); pipelines.push({ commands, condition }); commands = [];
    condition = token.value as Pipeline["condition"]; expecting = token.value !== ";";
  }
  if (expecting) fail("Expected a command after operator");
  if (current.words.length || current.redirect || commands.length) { finish(); pipelines.push({ commands, condition }); }
  return pipelines;
}
function expand(shell: ShellState, word: Word): string {
  return word.parts.map(part => part.expand ? part.text.replace(/\$(\?|[A-Za-z_][A-Za-z0-9_]*|\{[A-Za-z_][A-Za-z0-9_]*\})/g, (_, key: string) => key === "?" ? String(shell.lastExitCode) : shell.env[key.replace(/[{}]/g, "")] ?? "") : part.text).join("");
}
function list(shell: ShellState, path: string, hidden: boolean) {
  const absolute = resolvePath(shell, path), entry = shell.filesystem.get(absolute);
  if (!entry) fail(`${path}: No such file or directory`);
  if (entry.kind === "file") return [basename(absolute)];
  return [...shell.filesystem.keys()].filter(key => key !== "/" && parentPath(key) === absolute && (hidden || !basename(key).startsWith("."))).sort().map(key => basename(key) + (shell.filesystem.get(key)?.kind === "directory" ? "/" : ""));
}
function inputText(shell: ShellState, paths: string[], stdin: string) { return paths.length ? paths.map(path => read(shell, path)).join("") : stdin; }
function lines(text: string) { return text.replace(/\n$/, "").split("\n").filter((_, i, all) => text !== "" || i !== all.length - 1); }
const help = `Portfolio shell\n\nExplore  ls [-a] [path], tree [path], cd [path], pwd, cat files\nWrite    echo, printf, mkdir [-p], touch, cp [-r], mv, rm [-r]\nFilter   grep [-in] text [files], head/tail [-n N], wc [-lwc], sort, uniq\nSession  help, history, clear, whoami, date, uname, env, export\nApps     open terminal|projects|experience|contact|guestbook|chess|help\nScripts  sh file / source file, or paste multiple lines\n\nQuotes, $NAME, $? and ~ paths are supported. Chain with ; && ||, pipe with |, write with > or >>.\nExample: cat projects/flowcast.md | grep campus\nExample: echo 'echo "Fresh coffee for $USER"' > notes/brew.sh; sh notes/brew.sh\n\nStart with fastfetch. For the off-menu items, try ls -a.\n`;
function command(shell: ShellState, words: string[], stdin: string, context: Context): { output: string; exitCode: number } {
  if (++context.steps > LIMIT.steps) fail("Command budget exceeded (128 commands)");
  const args = [...words], name = args.shift()!;
  if (["nightcity", "relic", "blackwall", "sandevistan", "matrix"].includes(name)) context.effect = name as DesktopEffect;
  if (name === "fixer") {
    context.sound = "fixer";
    if (!context.openApps.includes("guestbook")) context.openApps.push("guestbook");
  }
  const done = (output = "", exitCode = 0) => ({ output, exitCode });
  const requireArgs = (n: number) => { if (args.length < n) fail(`${name}: Missing operand`); };
  switch (name) {
    case "help": case "man": return done(help);
    case "true": return done(); case "false": return done("", 1);
    case "pwd": return done(shell.cwd + "\n");
    case "whoami": return done("liem\n");
    case "uname": return done("Portfolio Linux · browser-local virtual shell\n");
    case "date": return done(new Date().toString() + "\n");
    case "env": return done(Object.entries(shell.env).map(([key, value]) => `${key}=${value}`).join("\n") + "\n");
    case "export": {
      for (const arg of args) { const match = /^([A-Za-z_][A-Za-z0-9_]*)=([\s\S]*)$/.exec(arg); if (!match) fail("export: Use NAME=value"); if (match[2].length > LIMIT.file || Object.keys(shell.env).length > 128) fail("Environment limit reached"); shell.env[match[1]] = match[2]; }
      return done();
    }
    case "echo": { const noLine = args[0] === "-n"; if (noLine) args.shift(); return done(args.join(" ") + (noLine ? "" : "\n")); }
    case "printf": { const format = args.shift() ?? ""; let index = 0; return done(format.replace(/\\[ntr\\]|%[%sd]/g, token => token === "\\n" ? "\n" : token === "\\t" ? "\t" : token === "\\r" ? "\r" : token === "\\\\" ? "\\" : token === "%%" ? "%" : token === "%d" ? String(Number.parseInt(args[index++] ?? "0", 10) || 0) : args[index++] ?? "")); }
    case "cd": { const destination = resolvePath(shell, args[0] === "-" ? shell.env.OLDPWD ?? HOME : args[0] ?? HOME); if (shell.filesystem.get(destination)?.kind !== "directory") fail(`${args[0] ?? "~"}: Not a directory`); shell.env.OLDPWD = shell.cwd; shell.cwd = destination; shell.env.PWD = destination; return done(); }
    case "ls": { const flags = args.filter(arg => arg.startsWith("-")); if (flags.some(flag => !/^-[al]+$/.test(flag))) fail("ls: Supported options are -a and -l"); const paths = args.filter(arg => !arg.startsWith("-")); return done((paths.length ? paths : ["."]).map(path => list(shell, path, flags.some(flag => flag.includes("a"))).join("  ")).join("\n") + "\n"); }
    case "tree": { const root = resolvePath(shell, args[0] ?? "."); if (!shell.filesystem.has(root)) fail(`${root}: No such file or directory`); const entries = [...shell.filesystem.keys()].filter(path => path.startsWith(root === "/" ? "/" : root + "/")).sort(); return done(root + "\n" + entries.map(path => { const relative = path.slice(root === "/" ? 1 : root.length + 1); return "  ".repeat(relative.split("/").length - 1) + basename(path) + (shell.filesystem.get(path)?.kind === "directory" ? "/" : ""); }).join("\n") + "\n"); }
    case "cat": return done(inputText(shell, args, stdin));
    case "mkdir": { const recursive = args[0] === "-p"; if (recursive) args.shift(); requireArgs(1); const next = new Map(shell.filesystem); for (const arg of args) { const path = resolvePath(shell, arg); writable(path); const segments = path.split("/").filter(Boolean); for (let i = 1; i <= segments.length; i++) { const part = "/" + segments.slice(0, i).join("/"); const old = next.get(part); if (old?.kind === "file") fail(`${part}: Not a directory`); if (!old) { if (!recursive && i !== segments.length) fail(`${arg}: Parent directory does not exist`); next.set(part, { kind: "directory" }); } else if (i === segments.length && !recursive) fail(`${arg}: File exists`); } } validateSize(next); shell.filesystem = next; return done(); }
    case "touch": requireArgs(1); for (const arg of args) { if (!shell.filesystem.has(resolvePath(shell, arg))) write(shell, arg, ""); } return done();
    case "cp": case "mv": {
      const recursive = args[0] === "-r" || args[0] === "-R"; if (recursive) args.shift(); requireArgs(2); if (args.length !== 2) fail(`${name}: Use one source and one destination`);
      const from = resolvePath(shell, args[0]), source = shell.filesystem.get(from); if (!source) fail(`${args[0]}: No such file or directory`);
      let to = resolvePath(shell, args[1]); if (shell.filesystem.get(to)?.kind === "directory") to += "/" + basename(from);
      writable(to); if (from === to) fail(`${name}: Source and destination are the same`);
      if (source.kind === "directory" && name === "cp" && !recursive) fail("cp: Use -r to copy a directory");
      if (source.kind === "directory" && to.startsWith(from + "/")) fail(`${name}: Cannot move or copy a directory into itself`);
      if (name === "mv") { writable(from); if (shell.cwd === from || shell.cwd.startsWith(from + "/")) fail("mv: Cannot move the current directory or its parent"); }
      if (shell.filesystem.get(parentPath(to))?.kind !== "directory") fail(`${args[1]}: Parent directory does not exist`);
      if (shell.filesystem.get(to)?.kind === "directory") fail(`${args[1]}: Destination is a directory`);
      if (source.kind === "directory" && shell.filesystem.has(to)) fail(`${args[1]}: Destination exists`);
      const next = new Map(shell.filesystem);
      for (const [path, entry] of shell.filesystem) if (path === from || path.startsWith(from + "/")) { next.set(to + path.slice(from.length), { ...entry }); if (name === "mv") next.delete(path); }
      validateSize(next); shell.filesystem = next; return done();
    }
    case "rm": { const flags = args.filter(arg => arg.startsWith("-")); if (flags.some(flag => !/^-[rf]+$/.test(flag))) fail("rm: Supported options are -r and -f"); const recursive = flags.some(flag => flag.includes("r")), force = flags.some(flag => flag.includes("f")); const paths = args.filter(arg => !arg.startsWith("-")); if (!paths.length) fail("rm: Missing operand"); const next = new Map(shell.filesystem); for (const arg of paths) { const path = resolvePath(shell, arg); writable(path); const entry = next.get(path); if (!entry) { if (!force) fail(`${arg}: No such file or directory`); continue; } if (entry.kind === "directory" && !recursive) fail(`${arg}: Is a directory (use -r)`); if (shell.cwd === path || shell.cwd.startsWith(path + "/")) fail("rm: Cannot remove current directory or its parent"); for (const key of next.keys()) if (key === path || key.startsWith(path + "/")) next.delete(key); } shell.filesystem = next; return done(); }
    case "grep": { let insensitive = false, numbered = false; while (args[0]?.startsWith("-")) { const flag = args.shift()!; if (!/^-[in]+$/.test(flag)) fail("grep: Supported options are -i and -n (literal matching)"); insensitive ||= flag.includes("i"); numbered ||= flag.includes("n"); } requireArgs(1); const pattern = args.shift()!; const result = lines(inputText(shell, args, stdin)).flatMap((line, i) => (insensitive ? line.toLowerCase().includes(pattern.toLowerCase()) : line.includes(pattern)) ? [(numbered ? `${i + 1}:` : "") + line] : []); return done(result.length ? result.join("\n") + "\n" : "", result.length ? 0 : 1); }
    case "head": case "tail": { let count = 10; if (args[0] === "-n") { args.shift(); const value = args.shift() ?? ""; if (!/^\d+$/.test(value) || Number(value) > LIMIT.output) fail(`${name}: Invalid line count`); count = Number(value); } const all = lines(inputText(shell, args, stdin)); const result = count === 0 ? [] : name === "head" ? all.slice(0, count) : all.slice(-count); return done(result.length ? result.join("\n") + "\n" : ""); }
    case "wc": { const flags = args.filter(arg => arg.startsWith("-")); if (flags.some(flag => !/^-[lwc]+$/.test(flag))) fail("wc: Supported options are -l, -w and -c"); const text = inputText(shell, args.filter(arg => !arg.startsWith("-")), stdin); const values = { l: (text.match(/\n/g) ?? []).length, w: text.trim() ? text.trim().split(/\s+/).length : 0, c: new TextEncoder().encode(text).length }; return done((flags.length ? [..."lwc"].filter(key => flags.some(flag => flag.includes(key))) : [..."lwc"]).map(key => values[key as keyof typeof values]).join(" ") + "\n"); }
    case "sort": return done(lines(inputText(shell, args, stdin)).sort().join("\n") + "\n");
    case "uniq": { const all = lines(inputText(shell, args, stdin)); return done(all.filter((line, i) => i === 0 || line !== all[i - 1]).join("\n") + "\n"); }
    case "clear": context.clear = true; context.clears++; return done();
    case "history": return done(shell.history.map((line, i) => `${String(i + 1).padStart(3)}  ${line}`).join("\n") + "\n");
    case "open": { requireArgs(1); const id = appIds[args[0].replace(/\/$/, "")]; if (!id) fail(`open: Unknown app '${args[0]}'. Try projects, experience, contact, guestbook, chess, or help.`); if (!context.openApps.includes(id)) context.openApps.push(id); return done(`Opening ${args[0]}.\n`); }
    case "source": case ".": case "sh": { requireArgs(1); if (context.depth >= LIMIT.depth) fail("Script nesting limit reached (8 levels)"); context.depth++; try { return run(shell, read(shell, args[0]), context); } finally { context.depth--; } }
    case "fastfetch": case "neofetch": return done(`       ( (\n        ) )     liem@portfolio\n     .------.   Liem Luttrell\n     |      |]  ${education.school}\n     |______|   ${education.major} · ${education.graduation}\n      '----'    Software / AI\n\n${about}\n\nProjects: ${projects.map(project => project.name).join(" · ")}\nType help to explore, or open projects.\n`);
    case "coffee": { const drink = args.join(" ") || "pour-over"; if (drink === "espresso") return done("18 g in. 36 g out.\nA small cup with a very large responsibility.\n"); if (drink === "pour-over") return done("30 g coffee · 500 g water\nBloom. Pour slowly. Let the terminal breathe.\n"); return done(`One ${drink}, coming up.\nThe barista suggests trying coffee espresso.\n`); }
    case "fortune": return done(["A failing test is a question with a reproducible answer.", "There are only two hard things: cache invalidation, naming things, and off-by-one errors.", "A backup you have never restored is a theory."][shell.history.length % 3] + "\n");
    case "cowsay": { const saying = (args.join(" ") || stdin.trim() || "Moo.").slice(0, 500); return done(` ${"_".repeat(Math.min(saying.length + 2, 60))}\n< ${saying} >\n ${"-".repeat(Math.min(saying.length + 2, 60))}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||\n`); }
    case "sudo": return done(args.join(" ") === "make me a sandwich" ? "Okay. One grilled cheese, on the house.\n" : "liem is not in the sudoers file. This incident will be reported.\n", args.join(" ") === "make me a sandwich" ? 0 : 1);
    case "nightcity": return done("NIGHT CITY · 02:17\nDistrict: Watson\nNCPD scanner: encrypted\n\nOne unread message from a fixer.\n");
    case "fixer": return done("INCOMING GIG: LEAVE NO TRACE\nA dead drop just went live.\nLeave your handle in the guestbook. No real names.\n\nOpening the drop.\n");
    case "relic": return done("RELIC // MALFUNCTION DETECTED\nEngram integrity: unstable\nSecond consciousness detected.\n\nJohnny: You gonna stare at that terminal all night?\n");
    case "blackwall": return done("BLACKWALL // UNAUTHORIZED CONNECTION\nOutbound packets: 0\nInbound packets: 1\n\nYou did not initiate this handshake.\n");
    case "sandevistan": return done("SANDEVISTAN // ENGAGED\nNeural accelerator online.\nTry moving a window.\n\nWatch the world catch up.\n");
    case "matrix": return done("Wake up, Neo.\nThe Matrix has you.\nFollow the white rabbit.\n");
    case "sl": return done("      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|___________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |    |   |         ||_| |_||\n  |______|__|___H__|__|____|___|_________|_|___|_|\n    O-O-O             O-O-O             O-O\nYou typed sl. The train arrived anyway.\n");
    default: return done(`${name}: command not found. Type help for available commands.\n`, 127);
  }
}

function run(shell: ShellState, input: string, context: Context): { output: string; exitCode: number } {
  if (input.length > LIMIT.input) fail("Input limit exceeded (16 KiB)");
  const pipelines = parse(input);
  let output = "", exitCode = shell.lastExitCode;
  for (const pipeline of pipelines) {
    if ((pipeline.condition === "&&" && exitCode !== 0) || (pipeline.condition === "||" && exitCode === 0)) continue;
    let stream = "";
    const clearsBefore = context.clears;
    for (const stage of pipeline.commands) {
      if (context.steps >= LIMIT.steps) fail("Command budget exceeded (128 commands)");
      const words = stage.words.map(word => expand(shell, word));
      const assignments: [string, string][] = [];
      while (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[0] ?? "")) { const word = words.shift()!; const index = word.indexOf("="); assignments.push([word.slice(0, index), word.slice(index + 1)]); }
      const oldEnv = shell.env;
      if (words.length && assignments.length) shell.env = Object.assign(Object.create(null), shell.env);
      for (const [key, value] of assignments) { if (value.length > LIMIT.file || Object.keys(shell.env).length > 128) fail("Environment limit reached"); shell.env[key] = value; }
      try {
        const result = words.length ? command(shell, words, stream, context) : { output: "", exitCode: 0 };
        stream = result.output; exitCode = result.exitCode;
        if (stream.length > LIMIT.output) fail("Output limit exceeded (32 KiB)");
        if (stage.redirect) { write(shell, expand(shell, stage.redirect.path), stream, stage.redirect.append); stream = ""; }
      } catch (error) { stream = `${words[0] ?? "shell"}: ${error instanceof Error ? error.message : String(error)}\n`; exitCode = 1; }
      finally { if (words.length && assignments.length) shell.env = oldEnv; }
      shell.lastExitCode = exitCode;
    }
    if (context.clears !== clearsBefore) output = "";
    output += stream;
    if (output.length > LIMIT.output) fail("Output limit exceeded (32 KiB)");
  }
  return { output, exitCode };
}

export function execute(shell: ShellState, input: string): ShellResult {
  const context: Context = { steps: 0, depth: 0, clear: false, clears: 0, openApps: [] };
  if (input.trim()) shell.history = [...shell.history, input.slice(0, LIMIT.input)].slice(-100);
  try {
    const result = run(shell, input, context); shell.lastExitCode = result.exitCode;
    return { ...result, output: result.output.replace(/\n$/, ""), clear: context.clear, openApps: context.openApps, ...(context.effect && { effect: context.effect }), ...(context.sound && { sound: context.sound }) };
  } catch (error) {
    shell.lastExitCode = 1;
    return { output: `shell: ${error instanceof Error ? error.message : String(error)}`, exitCode: 1, clear: context.clear, openApps: context.openApps, ...(context.effect && { effect: context.effect }), ...(context.sound && { sound: context.sound }) };
  }
}

export function complete(shell: ShellState, input: string): { value: string; matches: string[] } {
  const match = /(?:^|\s)([^\s"';&|<>]*)$/.exec(input);
  if (!match) return { value: input, matches: [] };
  const fragment = match[1], start = input.length - fragment.length;
  const commandPosition = !input.slice(0, start).trim() || /(?:;|&&|\|\||\|)\s*$/.test(input.slice(0, start));
  let matches: string[];
  if (commandPosition && !fragment.includes("/")) matches = commands.filter(command => command.startsWith(fragment));
  else if (/(?:^|[;|&])\s*open\s+$/.test(input.slice(0, start))) matches = Object.keys(appIds).filter(name => name.startsWith(fragment));
  else {
    const slash = fragment.lastIndexOf("/"), prefix = slash < 0 ? "" : fragment.slice(0, slash + 1), leaf = fragment.slice(slash + 1);
    try { matches = list(shell, prefix || ".", leaf.startsWith(".")).filter(name => name.startsWith(leaf)).map(name => prefix + name); } catch { matches = []; }
  }
  if (matches.length === 1) return { value: input.slice(0, start) + matches[0].replace(/([\\\s"';&|<>$`])/g, "\\$1") + (matches[0].endsWith("/") ? "" : " "), matches };
  return { value: input, matches };
}
