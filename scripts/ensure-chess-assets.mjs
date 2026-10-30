import { createHash } from "node:crypto";
import { access, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { prepareAssets, verifyAssets } from "../node_modules/@epicliem/liemfish-browser/scripts/assets.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(await readFile(new URL("./chess-assets-source.json", import.meta.url), "utf8"));

export async function downloadSourceFile(file, destination, fetchFile = fetch) {
  const response = await fetchFile(file.url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`Chess asset download failed (${response.status}): ${file.path}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length !== file.bytes || createHash("sha256").update(bytes).digest("hex") !== file.sha256) {
    throw new Error(`Chess asset checksum mismatch: ${file.path}`);
  }
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
}

export async function ensureChessAssets(out = join(root, "public/chess/engine"), fetchFile = fetch) {
  let exists = true;
  try { await access(out); } catch (error) {
    if (error.code !== "ENOENT") throw error;
    exists = false;
  }
  if (exists) {
    await verifyAssets(out);
    console.log("Verified existing chess assets.");
    return;
  }

  // Stage beside the output so publishing is a same-filesystem atomic rename.
  await mkdir(dirname(out), { recursive: true });
  const staging = await mkdtemp(join(dirname(out), ".engine-"));
  try {
    const sourceDir = join(staging, "source");
    console.log(`Preparing chess assets from Liemfish ${source.commit}.`);
    for (const file of source.files) {
      await downloadSourceFile(file, join(sourceDir, file.path), fetchFile);
    }
    const prepared = join(staging, "prepared");
    await prepareAssets(sourceDir, prepared);
    await rename(prepared, out);
    console.log("Downloaded and verified chess assets.");
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  ensureChessAssets().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
