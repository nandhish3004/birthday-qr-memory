const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

async function main() {
  const posterPath = path.join(__dirname, '..', 'docs', 'assets', 'original-poster.jpg');
  console.log('Loading poster:', posterPath);
  const img = await Jimp.read(posterPath);
  const W = img.bitmap.width;
  const H = img.bitmap.height;
  console.log(`Dimensions: ${W} x ${H} (Aspect ratio: ${(W/H).toFixed(4)})`);

  // Let's sample colors across the poster to find grey placeholder regions:
  // Grey placeholder characteristics:
  // r, g, b are close to each other (low saturation), typically around 180-220 (light slate/grey).
  // Let's look at points around the known regions:
  // Center frame: ~50% X, ~37% Y
  const centerColor = Jimp.intToRGBA(img.getPixelColor(Math.round(W * 0.49), Math.round(H * 0.37)));
  console.log('Sample center color at (49%, 37%):', centerColor);

  // Top-Left frame: ~24% X, ~26% Y
  const tlColor = Jimp.intToRGBA(img.getPixelColor(Math.round(W * 0.245), Math.round(H * 0.25)));
  console.log('Sample Top-Left at (24.5%, 25%):', tlColor);

  // Mid-Left frame: ~23% X, ~50% Y
  const mlColor = Jimp.intToRGBA(img.getPixelColor(Math.round(W * 0.23), Math.round(H * 0.50)));
  console.log('Sample Mid-Left at (23%, 50%):', mlColor);

  // Bottom-Left frame: ~37% X, ~65% Y
  const blColor = Jimp.intToRGBA(img.getPixelColor(Math.round(W * 0.37), Math.round(H * 0.65)));
  console.log('Sample Btm-Left at (37%, 65%):', blColor);

  // Bottom-Right frame: ~62.5% X, ~65% Y
  const brColor = Jimp.intToRGBA(img.getPixelColor(Math.round(W * 0.625), Math.round(H * 0.65)));
  console.log('Sample Btm-Right at (62.5%, 65%):', brColor);

  // Top-Right frame: ~72.5% X, ~26% Y
  const trColor = Jimp.intToRGBA(img.getPixelColor(Math.round(W * 0.725), Math.round(H * 0.26)));
  console.log('Sample Top-Right at (72.5%, 26%):', trColor);

  // Mid-Right frame: ~75.5% X, ~50% Y
  const mrColor = Jimp.intToRGBA(img.getPixelColor(Math.round(W * 0.755), Math.round(H * 0.50)));
  console.log('Sample Mid-Right at (75.5%, 50%):', mrColor);
}

main().catch(err => console.error(err));
