import { readFile, readdir, rename, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import subsetFont from "subset-font";
import { create } from "fontkit";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".json"]);
export const FONT_BYTE_BUDGET = 100 * 1024;
export const isPrivateUse = value => (value >= 0xe000 && value <= 0xf8ff)
  || (value >= 0xf0000 && value <= 0xffffd)
  || (value >= 0x100000 && value <= 0x10fffd);
const label = value => `U+${value.toString(16).toUpperCase().padStart(4, "0")}`;

// Scan conservatively, including escaped literals in comments: extra glyphs are safer than missing icons.
export function sourceCodePoints(text) {
  const points = new Set(Array.from(text, char => char.codePointAt(0)));
  const decoded = text.replace(/\\u\{([\da-f]{1,6})\}|\\u([\da-f]{4})/gi, (match, brace, fixed) => {
    const value = Number.parseInt(brace || fixed, 16);
    return value <= 0x10ffff ? String.fromCodePoint(value) : match;
  });
  for (const char of decoded) points.add(char.codePointAt(0));
  for (const match of text.matchAll(/\\([\da-f]{1,6})(?:\r\n|[ \t\r\n\f])?/gi)) {
    const value = Number.parseInt(match[1], 16);
    if (value <= 0x10ffff) points.add(value);
  }
  for (const match of text.matchAll(/&#(?:x([\da-f]+)|(\d+));/gi)) {
    const value = Number.parseInt(match[1] || match[2], match[1] ? 16 : 10);
    if (value <= 0x10ffff) points.add(value);
  }
  return points;
}

export async function collectPrivateUse(root) {
  const points = new Set();
  async function visit(directory) {
    const entries = (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && sourceExtensions.has(extname(entry.name))) {
        for (const point of sourceCodePoints(await readFile(path, "utf8"))) {
          if (isPrivateUse(point)) points.add(point);
        }
      }
    }
  }
  for (const directory of ["app", "lib"]) await visit(join(root, directory));
  return [...points].sort((a, b) => a - b);
}

export function verifySubset(source, output, selected, filename) {
  for (const metric of ["unitsPerEm", "ascent", "descent", "lineGap"]) {
    if (source[metric] !== output[metric]) throw new Error(`${filename}: changed ${metric}`);
  }
  const coverage = new Set(output.characterSet);
  for (const point of selected) {
    if (!coverage.has(point)) throw new Error(`${filename}: missing ${label(point)}`);
    const original = source.glyphForCodePoint(point);
    const subset = output.glyphForCodePoint(point);
    if (original.advanceWidth !== subset.advanceWidth
      || JSON.stringify(original.path.commands) !== JSON.stringify(subset.path.commands)) {
      throw new Error(`${filename}: changed advance or outline for ${label(point)}`);
    }
  }
}

export async function prepareFonts({ root = projectRoot, check = false, maxBytes = FONT_BYTE_BUDGET } = {}) {
  const usedIcons = await collectPrivateUse(root);
  const results = [];
  for (const weight of ["regular", "bold"]) {
    const name = `terminess-${weight}`;
    const original = await readFile(join(root, "app/fonts", `${name}.ttf`));
    const source = create(original);
    const available = new Set(source.characterSet);
    for (const point of usedIcons) {
      if (!available.has(point)) throw new Error(`${name}: source references ${label(point)}, absent from the original font`);
    }
    const selected = [...new Set([...source.characterSet.filter(point => !isPrivateUse(point)), ...usedIcons])].sort((a, b) => a - b);
    const output = await subsetFont(original, selected.map(point => String.fromCodePoint(point)).join(""), {
      targetFormat: "woff2",
      preserveNameIds: [0, 1, 2, 3, 4, 5, 6, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19],
    });
    if (output.length > maxBytes) throw new Error(`${name}: ${output.length} bytes exceeds the ${maxBytes}-byte budget`);
    verifySubset(source, create(output), selected, name);
    const path = join(root, "app/fonts", `${name}.woff2`);
    let existing;
    try { existing = await readFile(path); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    const changed = !existing?.equals(output);
    if (check && changed) throw new Error(`${name}.woff2 is missing or stale; run npm run prepare:fonts`);
    results.push({ name, path, output, changed, bytes: output.length, characters: selected.length, icons: usedIcons.length });
  }
  if (!check) {
    for (const result of results.filter(item => item.changed)) {
      const temporary = `${result.path}.${randomUUID()}.tmp`;
      await writeFile(temporary, result.output);
      await rename(temporary, result.path);
    }
  }
  return results.map(({ name, changed, bytes, characters, icons }) => ({ name, changed, bytes, characters, icons }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.slice(2).some(argument => argument !== "--check")) throw new Error("Usage: node scripts/prepare-fonts.mjs [--check]");
    const check = process.argv.includes("--check");
    for (const result of await prepareFonts({ check })) {
      console.log(`${result.name}: ${result.bytes} bytes, ${result.characters} characters (${result.icons} private-use icons), ${check ? "verified" : result.changed ? "generated" : "unchanged"}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
