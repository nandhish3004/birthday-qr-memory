const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const { generateAllQRCodes } = require('./qr-generator');

const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets');
const QR_DIR = path.join(ASSETS_DIR, 'qr');
const POSTER_SRC = path.join(ASSETS_DIR, 'original-poster.jpg');
const POSTER_OUTPUT = path.join(ASSETS_DIR, 'poster-with-qrs.png');

// Fallback path to the original user-uploaded poster
const USER_UPLOADED_POSTER = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\e6a1bd95-2328-4114-a602-d70aeb13f4f0\\.user_uploaded\\media_1789324183044.jpg";

/**
 * Aesthetic placement coordinates for 8 QR codes on the Shaaaw Scrapbook Poster
 * Directly matching the paper scrap placeholders:
 * Left column: 3 QRs (Top-Left, Mid-Left, Bottom-Left)
 * Right column: 5 QRs (Top-Right, Mid-Right, Lower-Mid, Lower-Right, Bottom-Right)
 */
const QR_PLACEMENTS = [
  { id: 1, label: "Tape 01 💗", xPct: 0.045, yPct: 0.042, sizePct: 0.105, rotation: 0 }, // Top-Left pink scrap
  { id: 2, label: "Tape 02 ✨", xPct: 0.042, yPct: 0.292, sizePct: 0.105, rotation: 0 }, // Mid-Left pink scrap
  { id: 3, label: "Tape 03 🎵", xPct: 0.038, yPct: 0.580, sizePct: 0.105, rotation: 0 }, // Bottom-Left pink scrap
  { id: 4, label: "Tape 04 🧇", xPct: 0.885, yPct: 0.092, sizePct: 0.095, rotation: 0 }, // Top-Right pink scrap
  { id: 5, label: "Tape 05 🏰", xPct: 0.885, yPct: 0.298, sizePct: 0.095, rotation: 0 }, // Mid-Right purple scrap
  { id: 6, label: "Tape 06 ⚔️", xPct: 0.870, yPct: 0.585, sizePct: 0.095, rotation: 0 }, // Lower-Mid-Right beige scrap
  { id: 7, label: "Tape 07 🎯", xPct: 0.860, yPct: 0.715, sizePct: 0.095, rotation: 0 }, // Lower-Right kraft scrap
  { id: 8, label: "Tape 08 📻", xPct: 0.845, yPct: 0.862, sizePct: 0.095, rotation: 0 }  // Bottom-Right pink scrap
];

// Ensure original poster exists in public/assets
function ensureOriginalPoster() {
  if (fs.existsSync(USER_UPLOADED_POSTER)) {
    const statsUser = fs.statSync(USER_UPLOADED_POSTER);
    const statsSrc = fs.existsSync(POSTER_SRC) ? fs.statSync(POSTER_SRC) : null;
    if (!statsSrc || statsSrc.size !== statsUser.size) {
      fs.copyFileSync(USER_UPLOADED_POSTER, POSTER_SRC);
      console.log('Updated original poster in assets with new Shaaaw collage.');
    }
  }
}

/**
 * Composite 8 QR codes onto the poster using Jimp
 */
async function composePoster(baseUrl = 'http://localhost:3000') {
  ensureOriginalPoster();
  if (!fs.existsSync(POSTER_SRC)) {
    throw new Error('Original poster not found. Please place original-poster.jpg in public/assets/');
  }

  // 1. Ensure all QR codes are freshly generated with the target baseUrl
  await generateAllQRCodes(baseUrl);

  // 2. Load the base poster image
  const poster = await Jimp.read(POSTER_SRC);
  const posterWidth = poster.bitmap.width;
  const posterHeight = poster.bitmap.height;

  // 3. Composite each QR code directly over the dummy placeholder
  for (const placement of QR_PLACEMENTS) {
    const qrPath = path.join(QR_DIR, `${placement.id}.png`);
    if (!fs.existsSync(qrPath)) continue;

    const qrImage = await Jimp.read(qrPath);
    const targetSize = Math.round(posterWidth * placement.sizePct);

    // Resize QR code with crisp clarity
    qrImage.resize(targetSize, targetSize, Jimp.RESIZE_BILINEAR);

    // Coordinates on poster
    const posX = Math.round(posterWidth * placement.xPct);
    const posY = Math.round(posterHeight * placement.yPct);

    // Composite real QR right over the dummy QR code
    poster.composite(qrImage, posX, posY, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1.0,
      opacityDest: 1.0
    });
  }

  // 4. Save high-res composite poster
  await poster.quality(95).writeAsync(POSTER_OUTPUT);
  console.log('Successfully created composite poster at:', POSTER_OUTPUT);

  return {
    outputPath: POSTER_OUTPUT,
    width: posterWidth,
    height: posterHeight,
    placements: QR_PLACEMENTS
  };
}

module.exports = {
  composePoster,
  ensureOriginalPoster,
  QR_PLACEMENTS,
  POSTER_SRC,
  POSTER_OUTPUT
};
