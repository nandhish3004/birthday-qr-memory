const fs = require('fs');
const path = require('path');

let Jimp = null;
try {
  Jimp = require('jimp');
} catch (e) {
  console.log('ℹ️ Jimp not found, fallback to direct copy + in-browser canvas transparency.');
}

const UPLOAD_DIR = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded";
const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_ASSETS = path.join(ROOT_DIR, 'public', 'assets');
const DOCS_ASSETS = path.join(ROOT_DIR, 'docs', 'assets');

// Ground-truth verified avatar source files
const AVATAR_SHEPHERD_SRC = path.join(UPLOAD_DIR, 'media_1789393837249.png'); // Shepherd (White BG)
const AVATAR_VISHNU_SRC   = path.join(UPLOAD_DIR, 'media_1789393854751.jpg'); // Lord Vishnu (Checkerboard BG)
const AVATAR_BUDDHA_SRC   = path.join(UPLOAD_DIR, 'media_1789393871771.jpg'); // Buddha Monk (Black BG)

/**
 * Fast & safe BFS Flood Fill to remove black background from Buddha
 */
async function processBuddha(inputPath, outputPaths) {
  if (!fs.existsSync(inputPath)) return;
  if (!Jimp) {
    outputPaths.forEach(out => { try { fs.copyFileSync(inputPath, out); } catch(e){} });
    return;
  }
  try {
    console.log('Processing Avatar: Buddha (Black BG removal)...');
    const img = await Jimp.read(inputPath);
    const w = img.bitmap.width;
    const h = img.bitmap.height;
    const n = w * h;
    const data = img.bitmap.data;
    const visited = new Uint8Array(n);
    const queue = new Int32Array(n);
    let head = 0;
    let tail = 0;

    for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
    for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }

    function seed(x, y) {
      const idx = y * w + x;
      if (visited[idx]) return;
      const p = idx * 4;
      if (data[p] <= 42 && data[p + 1] <= 42 && data[p + 2] <= 42) {
        visited[idx] = 1;
        queue[tail++] = idx;
      }
    }

    while (head < tail) {
      const idx = queue[head++];
      data[idx * 4 + 3] = 0;
      const x = idx % w;
      const y = (idx / w) | 0;

      check(x - 1, y); check(x + 1, y); check(x, y - 1); check(x, y + 1);
    }

    function check(nx, ny) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) return;
      const nIdx = ny * w + nx;
      if (visited[nIdx]) return;
      const np = nIdx * 4;
      const r = data[np], g = data[np + 1], b = data[np + 2];
      if (r <= 42 && g <= 42 && b <= 42) {
        visited[nIdx] = 1;
        queue[tail++] = nIdx;
      } else if (r <= 70 && g <= 70 && b <= 70) {
        visited[nIdx] = 1;
        const avg = (r + g + b) / 3;
        data[np + 3] = Math.max(0, Math.min(255, Math.round((avg - 42) * 9)));
      }
    }

    for (const outPath of outputPaths) {
      await img.writeAsync(outPath);
      console.log('✅ Saved transparent Buddha avatar to:', outPath);
    }
  } catch (err) {
    console.warn('Buddha processing fallback:', err.message);
    outputPaths.forEach(out => { try { fs.copyFileSync(inputPath, out); } catch(e){} });
  }
}

/**
 * Fast & safe BFS Flood Fill to remove white background from Shepherd
 */
async function processShepherd(inputPath, outputPaths) {
  if (!fs.existsSync(inputPath)) return;
  if (!Jimp) {
    outputPaths.forEach(out => { try { fs.copyFileSync(inputPath, out); } catch(e){} });
    return;
  }
  try {
    console.log('Processing Avatar: Shepherd (White BG removal)...');
    const img = await Jimp.read(inputPath);
    const w = img.bitmap.width;
    const h = img.bitmap.height;
    const n = w * h;
    const data = img.bitmap.data;
    const visited = new Uint8Array(n);
    const queue = new Int32Array(n);
    let head = 0;
    let tail = 0;

    function isWhiteBg(r, g, b) {
      const diff = Math.max(Math.abs(r - g), Math.max(Math.abs(r - b), Math.abs(g - b)));
      return r >= 225 && g >= 225 && b >= 225 && diff <= 25;
    }

    for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
    for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }

    function seed(x, y) {
      const idx = y * w + x;
      if (visited[idx]) return;
      const p = idx * 4;
      if (isWhiteBg(data[p], data[p + 1], data[p + 2])) {
        visited[idx] = 1;
        queue[tail++] = idx;
      }
    }

    while (head < tail) {
      const idx = queue[head++];
      data[idx * 4 + 3] = 0;
      const x = idx % w;
      const y = (idx / w) | 0;

      check(x - 1, y); check(x + 1, y); check(x, y - 1); check(x, y + 1);
    }

    function check(nx, ny) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) return;
      const nIdx = ny * w + nx;
      if (visited[nIdx]) return;
      const np = nIdx * 4;
      const r = data[np], g = data[np + 1], b = data[np + 2];
      if (isWhiteBg(r, g, b)) {
        visited[nIdx] = 1;
        queue[tail++] = nIdx;
      } else {
        const diff = Math.max(Math.abs(r - g), Math.max(Math.abs(r - b), Math.abs(g - b)));
        if (r >= 210 && g >= 210 && b >= 210 && diff <= 15) {
          visited[nIdx] = 1;
          const avg = (r + g + b) / 3;
          data[np + 3] = Math.max(0, Math.min(255, Math.round((255 - avg) * 8)));
        }
      }
    }

    for (const outPath of outputPaths) {
      await img.writeAsync(outPath);
      console.log('✅ Saved transparent Shepherd avatar to:', outPath);
    }
  } catch (err) {
    console.warn('Shepherd processing fallback:', err.message);
    outputPaths.forEach(out => { try { fs.copyFileSync(inputPath, out); } catch(e){} });
  }
}

/**
 * Fast & safe BFS Flood Fill to remove faux-checkerboard from Lord Vishnu
 */
async function processVishnu(inputPath, outputPaths) {
  if (!fs.existsSync(inputPath)) return;
  if (!Jimp) {
    outputPaths.forEach(out => { try { fs.copyFileSync(inputPath, out); } catch(e){} });
    return;
  }
  try {
    console.log('Processing Avatar: Lord Vishnu (Checkerboard BG removal)...');
    const img = await Jimp.read(inputPath);
    const w = img.bitmap.width;
    const h = img.bitmap.height;
    const n = w * h;
    const data = img.bitmap.data;
    const visited = new Uint8Array(n);
    const queue = new Int32Array(n);
    let head = 0;
    let tail = 0;

    function isCheckerboard(r, g, b) {
      const diff = Math.max(Math.abs(r - g), Math.max(Math.abs(r - b), Math.abs(g - b)));
      const isGrey = (r >= 165 && r <= 228 && diff <= 14);
      const isWhite = (r >= 235 && g >= 235 && b >= 235 && diff <= 8);
      return isGrey || isWhite;
    }

    function isStrictGrey(r, g, b) {
      const diff = Math.max(Math.abs(r - g), Math.max(Math.abs(r - b), Math.abs(g - b)));
      return r >= 175 && r <= 220 && diff <= 6;
    }

    for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
    for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }

    function seed(x, y) {
      const idx = y * w + x;
      if (visited[idx]) return;
      const p = idx * 4;
      if (isCheckerboard(data[p], data[p + 1], data[p + 2])) {
        visited[idx] = 1;
        queue[tail++] = idx;
      }
    }

    while (head < tail) {
      const idx = queue[head++];
      data[idx * 4 + 3] = 0;
      const x = idx % w;
      const y = (idx / w) | 0;

      check(x - 1, y); check(x + 1, y); check(x, y - 1); check(x, y + 1);
    }

    function check(nx, ny) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) return;
      const nIdx = ny * w + nx;
      if (visited[nIdx]) return;
      const np = nIdx * 4;
      if (isCheckerboard(data[np], data[np + 1], data[np + 2])) {
        visited[nIdx] = 1;
        queue[tail++] = nIdx;
      }
    }

    // Pockets
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        if (visited[idx]) continue;
        const p = idx * 4;
        if (isStrictGrey(data[p], data[p + 1], data[p + 2])) {
          let pHead = tail;
          visited[idx] = 1;
          queue[tail++] = idx;
          while (pHead < tail) {
            const cur = queue[pHead++];
            data[cur * 4 + 3] = 0;
            const cx = cur % w;
            const cy = (cur / w) | 0;
            const nb = [[cx-1, cy], [cx+1, cy], [cx, cy-1], [cx, cy+1]];
            for (const [nx, ny] of nb) {
              if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
              const nIdx = ny * w + nx;
              if (visited[nIdx]) continue;
              const np = nIdx * 4;
              if (isCheckerboard(data[np], data[np + 1], data[np + 2])) {
                visited[nIdx] = 1;
                queue[tail++] = nIdx;
              }
            }
          }
        }
      }
    }

    for (const outPath of outputPaths) {
      await img.writeAsync(outPath);
      console.log('✅ Saved transparent Vishnu avatar to:', outPath);
    }
  } catch (err) {
    console.warn('Vishnu processing fallback:', err.message);
    outputPaths.forEach(out => { try { fs.copyFileSync(inputPath, out); } catch(e){} });
  }
}

async function processAllAvatars() {
  console.log('--- Processing All 3 Nandhish Avatar Figures ---');
  await processBuddha(AVATAR_BUDDHA_SRC, [
    path.join(PUBLIC_ASSETS, 'avatar-buddha.png'),
    path.join(DOCS_ASSETS, 'avatar-buddha.png')
  ]);

  await processShepherd(AVATAR_SHEPHERD_SRC, [
    path.join(PUBLIC_ASSETS, 'avatar-shepherd.png'),
    path.join(DOCS_ASSETS, 'avatar-shepherd.png')
  ]);

  await processVishnu(AVATAR_VISHNU_SRC, [
    path.join(PUBLIC_ASSETS, 'avatar-vishnu.png'),
    path.join(DOCS_ASSETS, 'avatar-vishnu.png')
  ]);

  console.log('✨ Avatar sync completed successfully.');
}

if (require.main === module) {
  processAllAvatars().catch(console.error);
}

module.exports = { processAllAvatars };
