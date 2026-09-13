const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const { generateAllQRCodes } = require('./qr-generator');

const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets');
const QR_DIR = path.join(ASSETS_DIR, 'qr');
const POSTER_SRC = path.join(ASSETS_DIR, 'original-poster.jpg');
const POSTER_OUTPUT = path.join(ASSETS_DIR, 'poster-with-qrs.png');

// Fallback path to the original user-uploaded poster
const USER_UPLOADED_POSTER = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\e6a1bd95-2328-4114-a602-d70aeb13f4f0\\.user_uploaded\\media_1789313085861.jpg";

/**
 * Aesthetic placement coordinates for 8 QR codes (proportional % of image width and height)
 * Carefully chosen on the scrapbook background to preserve faces, polaroids, and text.
 */
const QR_PLACEMENTS = [
  { id: 1, label: "Memory #1 💗", xPct: 0.32, yPct: 0.058, sizePct: 0.125, rotation: -2 }, // Near top postcard stamp
  { id: 2, label: "Memory #2 ✨", xPct: 0.81, yPct: 0.042, sizePct: 0.125, rotation: 3 },  // Above film strip top right
  { id: 3, label: "Memory #3 🎵", xPct: 0.04, yPct: 0.345, sizePct: 0.125, rotation: -1 }, // Near silver balloon "13"
  { id: 4, label: "Memory #4 💌", xPct: 0.06, yPct: 0.605, sizePct: 0.135, rotation: 2 },  // Below "HAPPY Bday" cutouts
  { id: 5, label: "Memory #5 🌸", xPct: 0.52, yPct: 0.535, sizePct: 0.125, rotation: -2 }, // Above flowers / center-right
  { id: 6, label: "Memory #6 🎶", xPct: 0.82, yPct: 0.600, sizePct: 0.125, rotation: 1 },  // Next to Spotify quote card
  { id: 7, label: "Memory #7 🎸", xPct: 0.18, yPct: 0.900, sizePct: 0.125, rotation: -3 }, // Next to electric guitar bottom left
  { id: 8, label: "Memory #8 💫", xPct: 0.52, yPct: 0.885, sizePct: 0.125, rotation: 2 }   // Bottom center between photos
];

// Ensure original poster exists in public/assets
function ensureOriginalPoster() {
  if (!fs.existsSync(POSTER_SRC)) {
    if (fs.existsSync(USER_UPLOADED_POSTER)) {
      fs.copyFileSync(USER_UPLOADED_POSTER, POSTER_SRC);
      console.log('Copied uploaded poster to assets directory.');
    } else {
      console.warn('Original poster source not found at', USER_UPLOADED_POSTER);
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

  // 3. Composite each QR code
  for (const placement of QR_PLACEMENTS) {
    const qrPath = path.join(QR_DIR, `${placement.id}.png`);
    if (!fs.existsSync(qrPath)) continue;

    const qrImage = await Jimp.read(qrPath);
    const targetSize = Math.round(posterWidth * placement.sizePct);
    const borderPadding = Math.round(targetSize * 0.12);
    const totalFrameSize = targetSize + (borderPadding * 2);

    // Create a scrapbook sticker background (white Polaroid-style card with soft shadow/border)
    const stickerCard = new Jimp(totalFrameSize, totalFrameSize + Math.round(borderPadding * 1.2), 0xFFFFFFFF);

    // Resize QR code
    qrImage.resize(targetSize, targetSize, Jimp.RESIZE_BILINEAR);

    // Composite QR inside the white sticker card
    stickerCard.composite(qrImage, borderPadding, borderPadding);

    // If rotation requested, rotate slightly for scrapbook feel
    if (placement.rotation && Math.abs(placement.rotation) <= 5) {
      stickerCard.rotate(placement.rotation);
    }

    // Coordinates on poster
    const posX = Math.round(posterWidth * placement.xPct);
    const posY = Math.round(posterHeight * placement.yPct);

    // Composite sticker onto poster
    poster.composite(stickerCard, posX, posY, {
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
