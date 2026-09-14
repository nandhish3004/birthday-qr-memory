const fs = require('fs');
const path = require('path');

function getJpegDimensions(buffer) {
  let i = 0;
  if (buffer[i] !== 0xFF || buffer[i+1] !== 0xD8) {
    throw new Error('Not a valid JPEG');
  }
  i += 2;
  while (i < buffer.length) {
    if (buffer[i] !== 0xFF) {
      i++;
      continue;
    }
    const marker = buffer[i + 1];
    if (marker === 0xC0 || marker === 0xC2) { // SOF0 or SOF2
      const height = buffer.readUInt16BE(i + 5);
      const width = buffer.readUInt16BE(i + 7);
      return { width, height };
    }
    const length = buffer.readUInt16BE(i + 2);
    i += 2 + length;
  }
  throw new Error('SOF marker not found');
}

const targetPath = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789368265793.jpg";
const lordNandhishUpload = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789364766184.jpg";

console.log('--- Inspecting Images ---');
if (fs.existsSync(targetPath)) {
  const buf = fs.readFileSync(targetPath);
  const dims = getJpegDimensions(buf);
  console.log(`Poster: ${dims.width} x ${dims.height}, ratio: ${(dims.width / dims.height).toFixed(4)} (4:5 is 0.8000)`);
} else {
  console.log('Poster not found at targetPath');
}

if (fs.existsSync(lordNandhishUpload)) {
  const buf = fs.readFileSync(lordNandhishUpload);
  const dims = getJpegDimensions(buf);
  console.log(`Lord Nandhish: ${dims.width} x ${dims.height}`);
} else {
  console.log('Lord Nandhish not found at targetPath');
}
