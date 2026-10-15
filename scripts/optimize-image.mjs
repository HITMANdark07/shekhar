#!/usr/bin/env node
// Usage: node scripts/optimize-image.mjs <input> <output.webp> <width> [height] [quality=75]
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";

const [input, output, width, height, quality = "75"] = process.argv.slice(2);
if (!input || !output || !width) {
  console.error("Usage: node scripts/optimize-image.mjs <input> <output.webp> <width> [height] [quality]");
  process.exit(1);
}

mkdirSync(dirname(output), { recursive: true });
const info = await sharp(input)
  .resize({ width: Number(width), height: height ? Number(height) : undefined, fit: "cover" })
  .webp({ quality: Number(quality) })
  .toFile(output);
console.log(`${output}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)} KB`);
