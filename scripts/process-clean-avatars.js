const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_ASSETS = path.join(ROOT_DIR, 'public', 'assets');
const DOCS_ASSETS = path.join(ROOT_DIR, 'docs', 'assets');

// Authentic Scrapbook Poster with embedded QRs and avatars
const REAL_POSTER_SRC = 'C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\6ea84756-37a6-43a8-8392-c3735cd7d754\\.user_uploaded\\media_1789417290826.jpg';

// Raw avatar candidates
const BUDDHA_RAW = [
  'C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789393871771.jpg',
  path.join(PUBLIC_ASSETS, 'avatar-buddha-raw.jpg'),
  path.join(DOCS_ASSETS, 'avatar-buddha-raw.jpg')
];

const VISHNU_RAW = [
  'C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789393854751.jpg',
  path.join(PUBLIC_ASSETS, 'avatar-vishnu-raw.jpg'),
  path.join(DOCS_ASSETS, 'avatar-vishnu-raw.jpg')
];

const SHEPHERD_RAW = [
  'C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789393837249.png',
  path.join(PUBLIC_ASSETS, 'avatar-shepherd-raw.png'),
  path.join(DOCS_ASSETS, 'avatar-shepherd-raw.png')
];

function findExisting(list) {
  for (const p of list) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * 1. Restore Authentic Scrapbook Poster
 */
function restoreAuthenticPoster() {
  console.log('Restoring authentic scrapbook poster from:', REAL_POSTER_SRC);
  if (fs.existsSync(REAL_POSTER_SRC)) {
    const targets = [
      path.join(PUBLIC_ASSETS, 'original-poster.jpg'),
      path.join(DOCS_ASSETS, 'original-poster.jpg'),
      path.join(PUBLIC_ASSETS, 'clean-poster-bg.jpg'),
      path.join(DOCS_ASSETS, 'clean-poster-bg.jpg')
    ];
    for (const t of targets) {
      fs.copyFileSync(REAL_POSTER_SRC, t);
      console.log('  -> Copied to:', t);
    }
    console.log('✅ Authentic Scrapbook Poster restored successfully!');
  } else {
    console.warn('⚠️ Real poster source not found at:', REAL_POSTER_SRC);
  }
}

/**
 * 2. Clean Buddha (Solid Black Background outside white sticker border)
 */
async function cleanBuddha() {
  const src = findExisting(BUDDHA_RAW);
  if (!src) {
    console.warn('Buddha raw not found!');
    return;
  }
  console.log('Cleaning Buddha from:', src);
  const img = await Jimp.read(src);
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const data = img.bitmap.data;
  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0, tail = 0;

  function seed(x, y) {
    const idx = y * w + x;
    if (visited[idx]) return;
    const p = idx * 4;
    if (data[p] <= 45 && data[p+1] <= 45 && data[p+2] <= 45) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  }

  for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
  for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }

  while (head < tail) {
    const idx = queue[head++];
    data[idx * 4 + 3] = 0; // Transparent
    const x = idx % w;
    const y = (idx / w) | 0;

    const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const nIdx = ny * w + nx;
      if (visited[nIdx]) continue;
      const np = nIdx * 4;
      const r = data[np], g = data[np+1], b = data[np+2];
      if (r <= 48 && g <= 48 && b <= 48) {
        visited[nIdx] = 1;
        queue[tail++] = nIdx;
      } else if (r <= 78 && g <= 78 && b <= 78) {
        visited[nIdx] = 1;
        const avg = (r + g + b) / 3;
        data[np + 3] = Math.max(0, Math.min(255, Math.round((avg - 48) * 8.5)));
      }
    }
  }

  const outPub = path.join(PUBLIC_ASSETS, 'avatar-buddha.png');
  const outDocs = path.join(DOCS_ASSETS, 'avatar-buddha.png');
  await img.writeAsync(outPub);
  fs.copyFileSync(outPub, outDocs);
  console.log('✅ Transparent Buddha saved to public & docs assets');
}

/**
 * 3. Clean Lord Vishnu (Checkerboard Background outside white sticker border)
 */
async function cleanVishnu() {
  const src = findExisting(VISHNU_RAW);
  if (!src) {
    console.warn('Vishnu raw not found!');
    return;
  }
  console.log('Cleaning Vishnu from:', src);
  const img = await Jimp.read(src);
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const data = img.bitmap.data;
  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0, tail = 0;

  function isChecker(r, g, b) {
    const diff = Math.max(Math.abs(r - g), Math.max(Math.abs(r - b), Math.abs(g - b)));
    const isGreySquare = (r >= 150 && r <= 235 && diff <= 16);
    const isWhiteSquare = (r >= 235 && g >= 235 && b >= 235 && diff <= 12);
    return isGreySquare || isWhiteSquare;
  }

  // Seed outer border
  for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
  for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }

  function seed(x, y) {
    const idx = y * w + x;
    if (visited[idx]) return;
    const p = idx * 4;
    if (isChecker(data[p], data[p+1], data[p+2])) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  }

  while (head < tail) {
    const idx = queue[head++];
    data[idx * 4 + 3] = 0;
    const x = idx % w;
    const y = (idx / w) | 0;

    const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const nIdx = ny * w + nx;
      if (visited[nIdx]) continue;
      const np = nIdx * 4;
      if (isChecker(data[np], data[np+1], data[np+2])) {
        visited[nIdx] = 1;
        queue[tail++] = nIdx;
      }
    }
  }

  // Enclosed pockets between arms, weapons and crown
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (visited[idx]) continue;
      const p = idx * 4;
      const r = data[p], g = data[p+1], b = data[p+2];
      if (isChecker(r, g, b)) {
        let pHead = tail;
        visited[idx] = 1;
        queue[tail++] = idx;
        while (pHead < tail) {
          const cur = queue[pHead++];
          data[cur * 4 + 3] = 0;
          const cx = cur % w;
          const cy = (cur / w) | 0;
          const nb = [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]];
          for (const [nx, ny] of nb) {
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            const nIdx = ny * w + nx;
            if (visited[nIdx]) continue;
            const np = nIdx * 4;
            if (isChecker(data[np], data[np+1], data[np+2])) {
              visited[nIdx] = 1;
              queue[tail++] = nIdx;
            }
          }
        }
      }
    }
  }

  const outPub = path.join(PUBLIC_ASSETS, 'avatar-vishnu.png');
  const outDocs = path.join(DOCS_ASSETS, 'avatar-vishnu.png');
  await img.writeAsync(outPub);
  fs.copyFileSync(outPub, outDocs);
  console.log('✅ Transparent Vishnu saved to public & docs assets');
}

/**
 * 4. Clean Shepherd (White Background)
 */
async function cleanShepherd() {
  const src = findExisting(SHEPHERD_RAW);
  if (!src) {
    console.warn('Shepherd raw not found!');
    return;
  }
  console.log('Cleaning Shepherd from:', src);
  const img = await Jimp.read(src);
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const data = img.bitmap.data;
  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0, tail = 0;

  function isWhite(r, g, b) {
    const diff = Math.max(Math.abs(r - g), Math.max(Math.abs(r - b), Math.abs(g - b)));
    return r >= 220 && g >= 220 && b >= 220 && diff <= 25;
  }

  for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
  for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }

  function seed(x, y) {
    const idx = y * w + x;
    if (visited[idx]) return;
    const p = idx * 4;
    if (isWhite(data[p], data[p+1], data[p+2])) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  }

  while (head < tail) {
    const idx = queue[head++];
    data[idx * 4 + 3] = 0;
    const x = idx % w;
    const y = (idx / w) | 0;

    const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const nIdx = ny * w + nx;
      if (visited[nIdx]) continue;
      const np = nIdx * 4;
      const r = data[np], g = data[np+1], b = data[np+2];
      if (isWhite(r, g, b)) {
        visited[nIdx] = 1;
        queue[tail++] = nIdx;
      } else {
        const diff = Math.max(Math.abs(r - g), Math.max(Math.abs(r - b), Math.abs(g - b)));
        if (r >= 200 && g >= 200 && b >= 200 && diff <= 16) {
          visited[nIdx] = 1;
          const avg = (r + g + b) / 3;
          data[np + 3] = Math.max(0, Math.min(255, Math.round((255 - avg) * 7.5)));
        }
      }
    }
  }

  const outPub = path.join(PUBLIC_ASSETS, 'avatar-shepherd.png');
  const outDocs = path.join(DOCS_ASSETS, 'avatar-shepherd.png');
  await img.writeAsync(outPub);
  fs.copyFileSync(outPub, outDocs);
  console.log('✅ Transparent Shepherd saved to public & docs assets');
}

async function main() {
  console.log('=== Step 1: Restoring Authentic Scrapbook Poster ===');
  restoreAuthenticPoster();
  console.log('=== Step 2: Processing Transparent Avatars ===');
  await cleanBuddha();
  await cleanVishnu();
  await cleanShepherd();
  console.log('=== All Assets Restored & Cleaned! ===');
}

main().catch(console.error);
