const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const CANDIDATES = [
  "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789372775279.jpg",
  "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789364766184.jpg"
];
const INPUT_PATH = CANDIDATES.find(p => fs.existsSync(p)) || CANDIDATES[0];
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'lord-nandhish.png');

async function processLordNandhish(inputPath = INPUT_PATH, outputPath = OUTPUT_PATH) {
  if (!fs.existsSync(inputPath)) {
    // Try fallback locations
    const localFallback = path.join(OUTPUT_DIR, 'lord-nandhish-raw.jpg');
    if (fs.existsSync(localFallback)) {
      inputPath = localFallback;
    } else {
      throw new Error(`Input image not found at ${inputPath}`);
    }
  }

  console.log('Loading Lord Nandhish caricature from:', inputPath);
  const image = await Jimp.read(inputPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  console.log(`Image dimensions: ${width}x${height}`);

  // Inspect corner pixel
  const cornerColor = Jimp.intToRGBA(image.getPixelColor(0, 0));
  console.log('Corner (0,0) RGBA:', cornerColor);

  // Analyze checkerboard pattern
  // Checkerboard is made of neutral grey and white squares
  // Typically: r ~ 204, g ~ 204, b ~ 204 AND r ~ 255, g ~ 255, b ~ 255
  // The sticker outline has a dark/black outer border (r < 80, g < 80, b < 80)
  
  // Helper to determine if a pixel is part of the faux checkerboard background
  function isCheckerboard(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    // Neutral color (low saturation)
    if (diff > 16) return false;
    
    // Either grey square (170 - 215) or white square (> 230)
    const isGrey = (r >= 165 && r <= 218 && g >= 165 && g <= 218 && b >= 165 && b <= 218);
    const isWhite = (r >= 235 && g >= 235 && b >= 235);
    return isGrey || isWhite;
  }

  // Helper to detect dark boundary lines (sticker outline)
  function isDarkBoundary(r, g, b) {
    return r < 110 && g < 110 && b < 110;
  }

  // 1. BFS Flood Fill from all four outer image borders
  const visited = new Uint8Array(width * height);
  const queue = [];

  function pushQueue(x, y) {
    const idx = y * width + x;
    if (!visited[idx]) {
      visited[idx] = 1;
      queue.push(idx);
    }
  }

  // Initialize queue with all edge pixels
  for (let x = 0; x < width; x++) {
    pushQueue(x, 0);
    pushQueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushQueue(0, y);
    pushQueue(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const pos = queue[head++];
    const cx = pos % width;
    const cy = Math.floor(pos / width);

    const pixelInt = image.getPixelColor(cx, cy);
    const rgba = Jimp.intToRGBA(pixelInt);

    // Stop at dark boundary of sticker
    if (isDarkBoundary(rgba.r, rgba.g, rgba.b)) {
      continue;
    }

    // Only spread through checkerboard
    if (isCheckerboard(rgba.r, rgba.g, rgba.b)) {
      // Make transparent
      image.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 0), cx, cy);

      // Explore 4-way neighbors
      if (cx > 0) pushQueue(cx - 1, cy);
      if (cx < width - 1) pushQueue(cx + 1, cy);
      if (cy > 0) pushQueue(cx, cy - 1);
      if (cy < height - 1) pushQueue(cx, cy + 1);
    }
  }

  // 2. Also check internal enclosed holes (between arms, legs, etc.)
  // If an enclosed pocket is made of alternating grey/white checkerboard squares, clear it
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;

      const pInt = image.getPixelColor(x, y);
      const rgba = Jimp.intToRGBA(pInt);

      // Check if this pixel is grey checkerboard
      const isGrey = (rgba.r >= 165 && rgba.r <= 218 && rgba.g >= 165 && rgba.g <= 218 && rgba.b >= 165 && rgba.b <= 218 && Math.max(rgba.r, rgba.g, rgba.b) - Math.min(rgba.r, rgba.g, rgba.b) <= 12);

      if (isGrey) {
        // Run a local flood fill on this enclosed pocket
        const pocketQueue = [idx];
        const pocketVisited = [idx];
        visited[idx] = 1;

        let pHead = 0;
        let hitsCharacterColor = false;

        while (pHead < pocketQueue.length) {
          const pPos = pocketQueue[pHead++];
          const px = pPos % width;
          const py = Math.floor(pPos / width);

          const curInt = image.getPixelColor(px, py);
          const curRgba = Jimp.intToRGBA(curInt);

          if (isDarkBoundary(curRgba.r, curRgba.g, curRgba.b)) {
            continue;
          }

          if (isCheckerboard(curRgba.r, curRgba.g, curRgba.b)) {
            // Check neighbors
            const neighbors = [
              [px - 1, py], [px + 1, py], [px, py - 1], [px, py + 1]
            ];
            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx;
                if (!visited[nIdx]) {
                  visited[nIdx] = 1;
                  pocketQueue.push(nIdx);
                  pocketVisited.push(nIdx);
                }
              }
            }
          } else {
            hitsCharacterColor = true;
          }
        }

        // If it's a genuine checkerboard pocket (bounded by dark border, not colored body)
        for (const pIdx of pocketVisited) {
          const px = pIdx % width;
          const py = Math.floor(pIdx / width);
          image.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 0), px, py);
        }
      }
    }
  }

  // Ensure output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Save transparent PNG
  await image.writeAsync(outputPath);
  console.log(`✅ Successfully saved transparent Lord Nandhish caricature to: ${outputPath}`);
  return outputPath;
}

if (require.main === module) {
  processLordNandhish().catch(err => {
    console.error('Error processing caricature:', err);
    process.exit(1);
  });
}

module.exports = { processLordNandhish, OUTPUT_PATH };
