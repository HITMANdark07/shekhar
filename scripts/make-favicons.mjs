#!/usr/bin/env node
// Renders app/icon.svg to app/icon.png (96px, for Google's search favicon) and app/favicon.ico (16/32/48 PNG-in-ICO).
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const svg = readFileSync("app/icon.svg");
const png = (size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();

writeFileSync("app/icon.png", await png(96));

const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((size, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(size, 0);
  e.writeUInt8(size, 1);
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(images[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += images[i].length;
  return e;
});
writeFileSync("app/favicon.ico", Buffer.concat([header, ...entries, ...images]));
console.log("wrote app/icon.png and app/favicon.ico");
