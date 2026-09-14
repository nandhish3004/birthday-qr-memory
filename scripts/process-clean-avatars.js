const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_ASSETS = path.join(ROOT_DIR, 'public', 'assets');
const DOCS_ASSETS = path.join(ROOT_DIR, 'docs', 'assets');

// Raw avatar candidates
const BUDDHA_RAW = [
  path.join(PUBLIC_ASSETS, 'avatar-buddha-raw.jpg'),
  path.join(DOCS_ASSETS, 'avatar-buddha-raw.jpg'),
  'C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789393871771.jpg'
];

const VISHNU_RAW = [
  path.join(PUBLIC_ASSETS, 'avatar-vishnu-raw.jpg'),
  path.join(DOCS_ASSETS, 'avatar-vishnu-raw.jpg'),
  'C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789393854751.jpg'
];

const SHEPHERD_RAW = [
  path.join(PUBLIC_ASSETS, 'avatar-shepherd-raw.png'),
  path.join(DOCS_ASSETS, 'avatar-shepherd-raw.png'),
  'C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789393837249.png'
];

function findExisting(list) {
  for (const p of list) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * 1. Clean Buddha (Solid Black Background)
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
      if (r <= 45 && g <= 45 && b <= 45) {
        visited[nIdx] = 1;
        queue[tail++] = nIdx;
      } else if (r <= 75 && g <= 75 && b <= 75) {
        visited[nIdx] = 1;
        const avg = (r + g + b) / 3;
        data[np + 3] = Math.max(0, Math.min(255, Math.round((avg - 45) * 8.5)));
      }
    }
  }

  const outPub = path.join(PUBLIC_ASSETS, 'avatar-buddha.png');
  const outDocs = path.join(DOCS_ASSETS, 'avatar-buddha.png');
  await img.writeAsync(outPub);
  fs.copyFileSync(outPub, outDocs);
  console.log('✅ Buddha saved cleanly to public & docs assets');
}

/**
 * 2. Clean Lord Vishnu (Checkerboard Background)
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
    const isGreySquare = (r >= 155 && r <= 235 && diff <= 15);
    const isWhiteSquare = (r >= 235 && g >= 235 && b >= 235);
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
      const diff = Math.max(Math.abs(r - g), Math.max(Math.abs(r - b), Math.abs(g - b)));
      // Very specific grey or pure white checker pocket
      if ((r >= 165 && r <= 228 && diff <= 8) || (r >= 245 && g >= 245 && b >= 245)) {
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
  console.log('✅ Vishnu saved cleanly to public & docs assets');
}

/**
 * 3. Clean Shepherd (White Background)
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
    return r >= 220 && g >= 220 && b >= 220 && diff <= 22;
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
        if (r >= 200 && g >= 200 && b >= 200 && diff <= 14) {
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
  console.log('✅ Shepherd saved cleanly to public & docs assets');
}

/**
 * 4. Inspect Poster Candidates to confirm authentic scrapbook
 */
async function inspectPosters() {
  const posters = [
    { label: 'Public original-poster.jpg', path: path.join(PUBLIC_ASSETS, 'original-poster.jpg') },
    { label: 'Docs original-poster.jpg', path: path.join(DOCS_ASSETS, 'original-poster.jpg') },
    { label: 'Public clean-poster-bg.jpg', path: path.join(PUBLIC_ASSETS, 'clean-poster-bg.jpg') },
    { label: 'Brain 4d15 media_1789368265793.jpg', path: 'C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789368265793.jpg' },
    { label: 'Brain e6a1 media_1789324183044.jpg', path: 'C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\e6a1bd95-2328-4114-a602-d70aeb13f4f0\\.user_uploaded\\media_1789324183044.jpg' }
  ];

  console.log('\n--- Poster Candidates Inspection ---');
  for (const p of posters) {
    if (fs.existsSync(p.path)) {
      try {
        const stats = fs.statSync(p.path);
        const img = await Jimp.read(p.path);
        console.log(`[${p.label}]: ${img.bitmap.width}x${img.bitmap.height} (${stats.size} bytes)`);
      } catch (e) {
        console.log(`[${p.label}]: Error reading: ${e.message}`);
      }
    } else {
      console.log(`[${p.label}]: File not found`);
    }
  }
}

async function main() {
  console.log('=== Starting Clean Avatar Processing ===');
  await cleanBuddha();
  await cleanVishnu();
  await cleanShepherd();
  await inspectPosters();
  console.log('=== Clean Avatar Processing Finished ===');
}

main().catch(console.error);
