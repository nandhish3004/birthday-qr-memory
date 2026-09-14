const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const UPLOAD_DIR = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded";
const PUBLIC_ASSETS = path.join(__dirname, '..', 'public', 'assets');
const DOCS_ASSETS = path.join(__dirname, '..', 'docs', 'assets');

const AVATAR_SHEPHERD_SRC = path.join(UPLOAD_DIR, 'media_1789393854751.jpg');
const AVATAR_VISHNU_SRC   = path.join(UPLOAD_DIR, 'media_1789393837249.png');
const AVATAR_BUDDHA_SRC   = path.join(UPLOAD_DIR, 'media_1789393871771.jpg');

async function removeWhiteBackgroundFlood(inputPath, outputPaths) {
  if (!fs.existsSync(inputPath)) return;
  console.log('Processing Avatar: Shepherd (White BG)...');
  const img = await Jimp.read(inputPath);
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const visited = new Uint8Array(w * h);
  const queue = [];

  // Seed boundary edges
  for (let x = 0; x < w; x++) { queue.push(x, 0); queue.push(x, h - 1); }
  for (let y = 0; y < h; y++) { queue.push(0, y); queue.push(w - 1, y); }

  while (queue.length > 0) {
    const y = queue.pop();
    const x = queue.pop();
    const idx = y * w + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const p = (y * w + x) * 4;
    const r = img.bitmap.data[p];
    const g = img.bitmap.data[p + 1];
    const b = img.bitmap.data[p + 2];
    const diff = Math.max(Math.abs(r - g), Math.max(Math.abs(r - b), Math.abs(g - b)));

    if (r >= 225 && g >= 225 && b >= 225 && diff <= 25) {
      img.bitmap.data[p + 3] = 0;
      if (x > 0 && !visited[y * w + (x - 1)]) queue.push(x - 1, y);
      if (x < w - 1 && !visited[y * w + (x + 1)]) queue.push(x + 1, y);
      if (y > 0 && !visited[(y - 1) * w + x]) queue.push(x, y - 1);
      if (y < h - 1 && !visited[(y + 1) * w + x]) queue.push(x, y + 1);
    } else if (r >= 210 && g >= 210 && b >= 210 && diff <= 15) {
      // Gentle antialiased fringe
      const avg = (r + g + b) / 3;
      img.bitmap.data[p + 3] = Math.max(0, Math.min(255, Math.round((255 - avg) * 8)));
    }
  }

  for (const out of outputPaths) {
    await img.writeAsync(out);
    console.log('✅ Saved transparent Shepherd avatar to:', out);
  }
}

async function removeBlackBackgroundFlood(inputPath, outputPaths) {
  if (!fs.existsSync(inputPath)) return;
  console.log('Processing Avatar: Buddha (Black BG)...');
  const img = await Jimp.read(inputPath);
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const visited = new Uint8Array(w * h);
  const queue = [];

  // Seed boundary edges
  for (let x = 0; x < w; x++) { queue.push(x, 0); queue.push(x, h - 1); }
  for (let y = 0; y < h; y++) { queue.push(0, y); queue.push(w - 1, y); }

  while (queue.length > 0) {
    const y = queue.pop();
    const x = queue.pop();
    const idx = y * w + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const p = (y * w + x) * 4;
    const r = img.bitmap.data[p];
    const g = img.bitmap.data[p + 1];
    const b = img.bitmap.data[p + 2];

    if (r <= 38 && g <= 38 && b <= 38) {
      img.bitmap.data[p + 3] = 0;
      if (x > 0 && !visited[y * w + (x - 1)]) queue.push(x - 1, y);
      if (x < w - 1 && !visited[y * w + (x + 1)]) queue.push(x + 1, y);
      if (y > 0 && !visited[(y - 1) * w + x]) queue.push(x, y - 1);
      if (y < h - 1 && !visited[(y + 1) * w + x]) queue.push(x, y + 1);
    } else if (r <= 65 && g <= 65 && b <= 65) {
      // Soft edge feathering near sticker outline
      const avg = (r + g + b) / 3;
      img.bitmap.data[p + 3] = Math.max(0, Math.min(255, Math.round((avg - 38) * 8)));
    }
  }

  for (const out of outputPaths) {
    await img.writeAsync(out);
    console.log('✅ Saved transparent Buddha avatar to:', out);
  }
}

async function removeCheckerboardFlood(inputPath, outputPaths) {
  if (!fs.existsSync(inputPath)) return;
  console.log('Processing Avatar: Vishnu (Checkerboard BG)...');
  const img = await Jimp.read(inputPath);
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const visited = new Uint8Array(w * h);
  const queue = [];

  // Seed boundary edges
  for (let x = 0; x < w; x++) { queue.push(x, 0); queue.push(x, h - 1); }
  for (let y = 0; y < h; y++) { queue.push(0, y); queue.push(w - 1, y); }

  // Also seed grey checkerboard squares to clear isolated loops between arms and torso
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const p = idx * 4;
      const r = img.bitmap.data[p];
      const g = img.bitmap.data[p + 1];
      const b = img.bitmap.data[p + 2];
      const diff = Math.max(Math.abs(r - g), Math.max(Math.abs(r - b), Math.abs(g - b)));
      if (r >= 185 && r <= 215 && diff <= 6) {
        queue.push(x, y);
      }
    }
  }

  while (queue.length > 0) {
    const y = queue.pop();
    const x = queue.pop();
    const idx = y * w + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const p = (y * w + x) * 4;
    const r = img.bitmap.data[p];
    const g = img.bitmap.data[p + 1];
    const b = img.bitmap.data[p + 2];

    const diff = Math.max(Math.abs(r - g), Math.max(Math.abs(r - b), Math.abs(g - b)));
    const isGreySquare = (r >= 170 && r <= 225 && diff <= 12);
    const isWhiteSquare = (r >= 235 && g >= 235 && b >= 235 && diff <= 8);

    if (isGreySquare || isWhiteSquare) {
      img.bitmap.data[p + 3] = 0;
      if (x > 0 && !visited[y * w + (x - 1)]) queue.push(x - 1, y);
      if (x < w - 1 && !visited[y * w + (x + 1)]) queue.push(x + 1, y);
      if (y > 0 && !visited[(y - 1) * w + x]) queue.push(x, y - 1);
      if (y < h - 1 && !visited[(y + 1) * w + x]) queue.push(x, y + 1);
    }
  }

  for (const out of outputPaths) {
    await img.writeAsync(out);
    console.log('✅ Saved transparent Vishnu avatar to:', out);
  }
}

async function processAllAvatars() {
  console.log('--- Processing All 3 Nandhish Avatar Figures with Transparent BG ---');
  await removeWhiteBackgroundFlood(AVATAR_SHEPHERD_SRC, [
    path.join(PUBLIC_ASSETS, 'avatar-shepherd.png'),
    path.join(DOCS_ASSETS, 'avatar-shepherd.png')
  ]);

  await removeBlackBackgroundFlood(AVATAR_BUDDHA_SRC, [
    path.join(PUBLIC_ASSETS, 'avatar-buddha.png'),
    path.join(DOCS_ASSETS, 'avatar-buddha.png')
  ]);

  await removeCheckerboardFlood(AVATAR_VISHNU_SRC, [
    path.join(PUBLIC_ASSETS, 'avatar-vishnu.png'),
    path.join(DOCS_ASSETS, 'avatar-vishnu.png')
  ]);

  console.log('✨ All 3 avatars processed with transparent backgrounds successfully!');
}

if (require.main === module) {
  processAllAvatars().catch(console.error);
}

module.exports = { processAllAvatars };
