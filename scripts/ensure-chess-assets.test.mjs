import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { downloadSourceFile, ensureChessAssets } from "./ensure-chess-assets.mjs";

const content = Buffer.from("verified fixture");
const file = { path: "models/model.onnx", url: "https://example.test/model", bytes: content.length, sha256: createHash("sha256").update(content).digest("hex") };

test("downloads only checksum-verified bytes and creates parent directories", async () => {
  const temp = await mkdtemp(join(tmpdir(), "chess-assets-test-"));
  try {
    const destination = join(temp, file.path);
    await downloadSourceFile(file, destination, async () => new Response(content));
    assert.deepEqual(await readFile(destination), content);
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test("HTTP failures, wrong sizes and same-size corrupt bytes cannot overwrite an asset", async () => {
  const temp = await mkdtemp(join(tmpdir(), "chess-assets-test-"));
  try {
    const destination = join(temp, "model.onnx");
    await writeFile(destination, content);
    for (const response of [new Response("missing", { status: 404 }), new Response("short"), new Response(Buffer.alloc(content.length))]) {
      await assert.rejects(downloadSourceFile(file, destination, async () => response), /download failed|checksum mismatch/);
      assert.deepEqual(await readFile(destination), content);
    }
    await assert.rejects(downloadSourceFile(file, destination, async () => { throw new Error("timeout"); }), /timeout/);
    assert.deepEqual(await readFile(destination), content);
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test("existing incomplete assets fail verification without being replaced", async () => {
  const temp = await mkdtemp(join(tmpdir(), "chess-assets-test-"));
  try {
    await writeFile(join(temp, "keep.txt"), "local data");
    await assert.rejects(ensureChessAssets(temp), /ENOENT/);
    assert.deepEqual(await readdir(temp), ["keep.txt"]);
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test("failed clean preparation removes staging and leaves the output absent", async () => {
  const temp = await mkdtemp(join(tmpdir(), "chess-assets-test-"));
  try {
    await assert.rejects(ensureChessAssets(join(temp, "engine"), async () => new Response("unavailable", { status: 503 })), /download failed/);
    assert.deepEqual(await readdir(temp), []);
  } finally { await rm(temp, { recursive: true, force: true }); }
});
