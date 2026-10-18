import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#1C1C1B"/>
  <rect x="1.25" y="1.25" width="29.5" height="29.5" rx="5" fill="none" stroke="#D4AE78" stroke-width="1.25"/>
  <path fill="#D4AE78" d="M9.2 7.2h7.1c2.95 0 4.85 1.45 4.85 3.7 0 1.55-.85 2.7-2.25 3.25 1.8.55 2.9 1.9 2.9 3.85 0 2.55-2.1 4.1-5.35 4.1H9.2V7.2zm3.15 2.35v3.55h3.55c1.35 0 2.1-.65 2.1-1.8s-.75-1.75-2.1-1.75h-3.55zm0 5.9v4.05h4.05c1.55 0 2.45-.75 2.45-2.05s-.9-2-2.45-2H12.35z"/>
</svg>`;

const writePng = async (size, file) => {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(file);
  console.log("wrote", file);
};

const p16 = path.join(outDir, "icon-16.png");
const p32 = path.join(outDir, "icon-32.png");
const p48 = path.join(outDir, "icon-48.png");
const p180 = path.join(outDir, "apple-touch-icon.png");
const p192 = path.join(outDir, "icon-192.png");

await writePng(16, p16);
await writePng(32, p32);
await writePng(48, p48);
await writePng(180, p180);
await writePng(192, p192);

const sizes = [
  { size: 16, file: p16 },
  { size: 32, file: p32 },
  { size: 48, file: p48 },
];
const images = sizes.map((s) => fs.readFileSync(s.file));
const headerSize = 6 + 16 * images.length;
let offset = headerSize;
const dirs = images.map((img, i) => {
  const entry = { dim: sizes[i].size, size: img.length, offset };
  offset += img.length;
  return entry;
});

const buf = Buffer.alloc(offset);
buf.writeUInt16LE(0, 0);
buf.writeUInt16LE(1, 2);
buf.writeUInt16LE(images.length, 4);
let dirOff = 6;
for (const d of dirs) {
  buf[dirOff] = d.dim === 256 ? 0 : d.dim;
  buf[dirOff + 1] = d.dim === 256 ? 0 : d.dim;
  buf[dirOff + 2] = 0;
  buf[dirOff + 3] = 0;
  buf.writeUInt16LE(1, dirOff + 4);
  buf.writeUInt16LE(32, dirOff + 6);
  buf.writeUInt32LE(d.size, dirOff + 8);
  buf.writeUInt32LE(d.offset, dirOff + 12);
  dirOff += 16;
}
let writeAt = headerSize;
for (const img of images) {
  img.copy(buf, writeAt);
  writeAt += img.length;
}

fs.writeFileSync(path.join(root, "public", "favicon.ico"), buf);
console.log("wrote public/favicon.ico", buf.length);
