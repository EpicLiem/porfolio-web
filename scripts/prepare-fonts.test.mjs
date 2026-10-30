import assert from "node:assert/strict";
import test from "node:test";
import { copyFile, mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { create } from "fontkit";
import { FONT_BYTE_BUDGET, collectPrivateUse, isPrivateUse, prepareFonts, sourceCodePoints, verifySubset } from "./prepare-fonts.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("finds literal, JS brace/fixed/surrogate, CSS, and numeric entity private-use characters", () => {
  const source = String.raw`const icons = "\uE001 \u{F0002} \uDB80\uDC03"; content: "\e004 \0f0005"; <i>&#57350;&#xE007;</i>` + String.fromCodePoint(0xe008);
  const found = [...sourceCodePoints(source)].filter(isPrivateUse).sort((a, b) => a - b);
  assert.deepEqual(found, [0xe001, 0xe004, 0xe006, 0xe007, 0xe008, 0xf0002, 0xf0003, 0xf0005]);
  assert(!isPrivateUse(0xdfff)); assert(!isPrivateUse(0xf900)); assert(!isPrivateUse(0xffffe));
});

test("retains all normal text and referenced icons; source changes fail check until regenerated", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "portfolio-font-test-"));
  try {
    await mkdir(join(fixture, "app/fonts"), { recursive: true });
    await mkdir(join(fixture, "lib/nested"), { recursive: true });
    for (const weight of ["regular", "bold"]) await copyFile(join(root, `app/fonts/terminess-${weight}.ttf`), join(fixture, `app/fonts/terminess-${weight}.ttf`));
    const source = create(await readFile(join(fixture, "app/fonts/terminess-regular.ttf")));
    const icons = source.characterSet.filter(isPrivateUse);
    const [first, second] = icons;
    await writeFile(join(fixture, "app/page.tsx"), `export default ${JSON.stringify(String.fromCodePoint(first))};`);
    await writeFile(join(fixture, "lib/nested/data.json"), '{"text":"Dynamic guestbook text need not appear in source"}');
    await writeFile(join(fixture, "app/fonts/ignored.md"), String.fromCodePoint(0xe000));
    assert.deepEqual(await collectPrivateUse(fixture), [first]);
    await assert.rejects(prepareFonts({ root: fixture, check: true }), /missing or stale/);
    const built = await prepareFonts({ root: fixture });
    assert(built.every(font => font.bytes < FONT_BYTE_BUDGET && font.changed));
    const outputPath = join(fixture, "app/fonts/terminess-regular.woff2");
    const originalBytes = await readFile(outputPath);
    const originalMtime = (await stat(outputPath)).mtimeMs;
    const output = create(originalBytes);
    const selected = [...source.characterSet.filter(point => !isPrivateUse(point)), first];
    verifySubset(source, output, selected, "fixture");
    assert(output.characterSet.includes(first));
    assert(!output.characterSet.includes(second));
    assert((await prepareFonts({ root: fixture, check: true })).every(font => !font.changed));
    assert((await prepareFonts({ root: fixture })).every(font => !font.changed));
    assert.equal((await stat(outputPath)).mtimeMs, originalMtime);
    await assert.rejects(prepareFonts({ root: fixture, maxBytes: 1 }), /exceeds the 1-byte budget/);
    assert.deepEqual(await readFile(outputPath), originalBytes);
    await writeFile(join(fixture, "lib/nested/icon.css"), `.icon::before { content: "\\${second.toString(16)} "; }`);
    await assert.rejects(prepareFonts({ root: fixture, check: true }), /missing or stale/);
    assert.deepEqual(await readFile(outputPath), originalBytes);
    await prepareFonts({ root: fixture });
    assert(create(await readFile(outputPath)).characterSet.includes(second));
    await prepareFonts({ root: fixture, check: true });
    const unavailable = Array.from({ length: 0x1900 }, (_, i) => 0xe000 + i).find(point => !source.characterSet.includes(point));
    assert.notEqual(unavailable, undefined);
    await writeFile(join(fixture, "lib/missing.ts"), `export const missing = "\\u${unavailable.toString(16)}";`);
    await assert.rejects(prepareFonts({ root: fixture }), /absent from the original font/);
  } finally { await rm(fixture, { recursive: true, force: true }); }
});
