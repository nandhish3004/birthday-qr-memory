const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Pure Node.js PNG Background Remover (Zero Dependencies)
 * Flood-fills from the outer boundary to make the white background 100% transparent,
 * while keeping his inner white tunic untouched!
 */
function removeWhiteBackgroundPNG(inputPath, outputPath) {
  const buf = fs.readFileSync(inputPath);
  
  // Verify PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4E || buf[3] !== 0x47) {
    throw new Error('Not a valid PNG file');
  }

  let pos = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks = [];

  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);

    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
      bitDepth = buf[pos + 16];
      colorType = buf[pos + 17];
    } else if (type === 'IDAT') {
      idatChunks.push(buf.subarray(pos + 8, pos + 8 + length));
    } else if (type === 'IEND') {
      break;
    }

    pos += 12 + length;
  }

  console.log(`Processing PNG: ${width}x${height}, colorType=${colorType}, bitDepth=${bitDepth}`);

  // Only handle standard 8-bit truecolor (RGB = 2) or RGBA (6)
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    console.log('PNG is not 8-bit RGB/RGBA, falling back to browser canvas transparency.');
    return false;
  }

  const compressedData = Buffer.concat(idatChunks);
  const uncompressed = zlib.inflateSync(compressedData);

  const bytesPerPixel = colorType === 6 ? 4 : 3;
  const stride = width * bytesPerPixel;
  const newBytesPerPixel = 4;
  const newStride = width * newBytesPerPixel;
  const newBuffer = Buffer.alloc(height * (1 + newStride));

  // Reconstruct uncompressed image data into a flat RGBA buffer
  const rgba = Buffer.alloc(width * height * 4);
  const rowBuffer = Buffer.alloc(stride);

  let srcPos = 0;
  for (let y = 0; y < height; y++) {
    const filterType = uncompressed[srcPos++];
    const srcRow = uncompressed.subarray(srcPos, srcPos + stride);
    srcPos += stride;

    // Filter decoding (Support 0: None, 1: Sub, 2: Up, 3: Average, 4: Paeth)
    for (let x = 0; x < stride; x++) {
      const byteVal = srcRow[x];
      const left = x >= bytesPerPixel ? rowBuffer[x - bytesPerPixel] : 0;
      const up = y > 0 ? rowBuffer[x] : 0;
      let val = byteVal;

      if (filterType === 1) val = (byteVal + left) & 0xFF;
      else if (filterType === 2) val = (byteVal + up) & 0xFF;
      else if (filterType === 3) val = (byteVal + Math.floor((left + up) / 2)) & 0xFF;
      else if (filterType === 4) {
        const upLeft = (y > 0 && x >= bytesPerPixel) ? rowBuffer[x - bytesPerPixel] : 0;
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        let pr = pc <= pa && pc <= pb ? upLeft : (pa <= pb ? left : up);
        val = (byteVal + pr) & 0xFF;
      }

      rowBuffer[x] = val;
    }

    // Copy decoded row into RGBA
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const sIdx = x * bytesPerPixel;
      rgba[idx] = rowBuffer[sIdx];
      rgba[idx + 1] = rowBuffer[sIdx + 1];
      rgba[idx + 2] = rowBuffer[sIdx + 2];
      rgba[idx + 3] = colorType === 6 ? rowBuffer[sIdx + 3] : 255;
    }
  }

  // Flood fill from borders to make outer white background transparent
  const isWhite = (x, y) => {
    const idx = (y * width + x) * 4;
    return rgba[idx] > 225 && rgba[idx + 1] > 225 && rgba[idx + 2] > 225;
  };

  const visited = new Uint8Array(width * height);
  const queueX = [];
  const queueY = [];

  // Seed with outer border pixels
  for (let x = 0; x < width; x++) {
    if (isWhite(x, 0)) { queueX.push(x); queueY.push(0); visited[x] = 1; }
    if (isWhite(x, height - 1)) { queueX.push(x); queueY.push(height - 1); visited[(height - 1) * width + x] = 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isWhite(0, y)) { queueX.push(0); queueY.push(y); visited[y * width] = 1; }
    if (isWhite(width - 1, y)) { queueX.push(width - 1); queueY.push(y); visited[y * width + (width - 1)] = 1; }
  }

  // BFS
  let head = 0;
  while (head < queueX.length) {
    const cx = queueX[head];
    const cy = queueY[head];
    head++;

    const idx = (cy * width + cx) * 4;
    rgba[idx + 3] = 0; // Transparent!

    const neighbors = [
      [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx] && isWhite(nx, ny)) {
          visited[nIdx] = 1;
          queueX.push(nx);
          queueY.push(ny);
        }
      }
    }
  }

  // Re-encode into PNG raw scanlines (Filter 0: None)
  let destPos = 0;
  for (let y = 0; y < height; y++) {
    newBuffer[destPos++] = 0; // Filter 0
    const row = rgba.subarray(y * newStride, (y + 1) * newStride);
    row.copy(newBuffer, destPos);
    destPos += newStride;
  }

  // Deflate
  const newIdatData = zlib.deflateSync(newBuffer);

  // Write new PNG file
  const parts = [];
  parts.push(buf.subarray(0, 8)); // Signature

  // IHDR chunk (Color type 6 = RGBA)
  const ihdrChunk = Buffer.alloc(13);
  ihdrChunk.writeUInt32BE(width, 0);
  ihdrChunk.writeUInt32BE(height, 4);
  ihdrChunk[8] = 8;
  ihdrChunk[9] = 6; // RGBA
  ihdrChunk[10] = 0;
  ihdrChunk[11] = 0;
  ihdrChunk[12] = 0;
  parts.push(writeChunk('IHDR', ihdrChunk));

  // IDAT chunk
  parts.push(writeChunk('IDAT', newIdatData));

  // IEND chunk
  parts.push(writeChunk('IEND', Buffer.alloc(0)));

  fs.writeFileSync(outputPath, Buffer.concat(parts));
  console.log(`✅ Successfully made background transparent at: ${outputPath}`);
  return true;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Execute
const caricaturePath = path.join(__dirname, '..', 'public', 'assets', 'caricature.png');
const uploadedPath = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\e6a1bd95-2328-4114-a602-d70aeb13f4f0\\.user_uploaded\\media_1789319562845.png";

const src = fs.existsSync(caricaturePath) ? caricaturePath : uploadedPath;
if (fs.existsSync(src)) {
  removeWhiteBackgroundPNG(src, caricaturePath);
} else {
  console.warn('Caricature file not found.');
}
