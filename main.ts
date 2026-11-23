import { copyFileSync, existsSync, statSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Meme Sprint 3: AI Agent Goes Rogue — entry is a single 1024x1024 PNG meme.
// This program validates the meme against the bounty gate, then copies it
// into the grader's output directory.
const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const src = join(here, "entry.png");

if (!existsSync(src)) throw new Error("entry.png missing next to main.ts");
const size = statSync(src).size;
if (size > 1_048_576) throw new Error(`entry.png too big: ${size} bytes (max 1 MiB)`);

// Gate check: real PNG signature + IHDR dimensions at most 1024x1024.
const buf = readFileSync(src);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (buf.length < 33 || !buf.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("entry.png is not a PNG file");
}
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height} (max 1024x1024)`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(src, join(outDir, "entry.png"));
console.log(`wrote entry.png (${width}x${height}, ${size} bytes) to ${outDir}`);
