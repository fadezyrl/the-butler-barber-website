import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "icons");
const logoPath = path.join(root, "public", "assets", "logo", "butler_logo.png");

fs.mkdirSync(outDir, { recursive: true });

const BG = { r: 28, g: 28, b: 27, alpha: 1 };
const GOLD = "#D4AE78";

const isGoldPixel = (data, i) => {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];
  return (
    a > 180 &&
    r > 140 &&
    g > 100 &&
    b > 60 &&
    r > g &&
    g >= b - 10 &&
    r - b > 35
  );
};

/** Crop left mark from butler_logo.png: vertical "The" + flourished "B". */
const detectLogoBCrop = async () => {
  const { data, info } = await sharp(logoPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const y0 = Math.round(h * 0.25);
  const y1 = Math.round(h * 0.85);
  const colCounts = new Array(w).fill(0);

  for (let y = y0; y < y1; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (isGoldPixel(data, (y * w + x) * 4)) colCounts[x] += 1;
    }
  }

  let start = 0;
  while (start < w && colCounts[start] < 5) start += 1;

  let peak = start;
  let peakVal = 0;
  for (let x = start; x < Math.min(w, start + 200); x += 1) {
    if (colCounts[x] > peakVal) {
      peakVal = colCounts[x];
      peak = x;
    }
  }

  let valley = peak;
  let minAfter = Number.POSITIVE_INFINITY;
  for (let x = peak; x < Math.min(w, peak + 180); x += 1) {
    if (colCounts[x] < minAfter) {
      minAfter = colCounts[x];
      valley = x;
    }
    if (minAfter < 8 && colCounts[x] > minAfter + 15 && x > peak + 40) break;
  }

  const left = 0;
  const end = valley;
  let minY = h;
  let maxY = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = left; x <= end; x += 1) {
      const i = (y * w + x) * 4;
      const a = data[i + 3];
      if (a < 180) continue;
      const bright = data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200;
      if (bright || isGoldPixel(data, i)) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  return {
    left,
    top: Math.max(0, minY - 6),
    width: Math.min(w, end - left + 10),
    height: Math.min(h - Math.max(0, minY - 6), maxY - minY + 18),
  };
};

const buildMarkPng = async (size, crop) => {
  const cropped = await sharp(logoPath)
    .extract(crop)
    .resize(Math.round(size * 0.82), Math.round(size * 0.82), {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const radius = Math.round(size * 0.18);
  const inset = Math.max(1, Math.round(size * 0.04));
  const stroke = Math.max(1, Math.round(size * 0.04));
  const frame = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#1C1C1B"/>
  <rect x="${inset}" y="${inset}" width="${size - inset * 2}" height="${size - inset * 2}" rx="${Math.max(1, radius - inset)}" fill="none" stroke="${GOLD}" stroke-width="${stroke}"/>
</svg>`);

  return sharp(frame)
    .composite([{ input: cropped, gravity: "centre" }])
    .png()
    .toBuffer();
};

const writeFromLogoFull = async (size, file) => {
  await sharp(logoPath)
    .resize(size, size, {
      fit: "contain",
      background: BG,
    })
    .png()
    .toFile(file);
  console.log("wrote", path.relative(root, file), "(full logo)");
};

const crop = await detectLogoBCrop();
console.log("logo B crop", crop);

const p16 = path.join(outDir, "icon-16.png");
const p32 = path.join(outDir, "icon-32.png");
const p48 = path.join(outDir, "icon-48.png");
const p180 = path.join(outDir, "apple-touch-icon.png");
const p192 = path.join(outDir, "icon-192.png");

for (const [size, file] of [
  [16, p16],
  [32, p32],
  [48, p48],
]) {
  fs.writeFileSync(file, await buildMarkPng(size, crop));
  console.log("wrote", path.relative(root, file), "(logo B)");
}

await writeFromLogoFull(180, p180);
await writeFromLogoFull(192, p192);

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

for (const name of [
  "_preview-b.png",
  "_b-only.png",
  "_b-only2.png",
  "_c0.png",
  "_c1.png",
  "_c2.png",
]) {
  const file = path.join(outDir, name);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}
const tmp = path.join(outDir, "_tmp");
if (fs.existsSync(tmp)) fs.rmSync(tmp, { recursive: true, force: true });
