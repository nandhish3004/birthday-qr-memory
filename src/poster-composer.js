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
const SHAAW_PHOTO = path.join(ASSETS_DIR, 'shaaw-center.jpg');

/**
 * Aesthetic placement coordinates for 8 QR codes on the Shaaaw Scrapbook Poster
 * Calibrated to replace ONLY the dummy QR square, preserving torn deckle edges,
 * paperclips, washi tape, and cute hand-drawn hearts (♡).
 */
const QR_PLACEMENTS = [
  { id: 1, label: "Tape 01 💗", cxPct: 0.095, cyPct: 0.072, sizePct: 0.078 }, // Top-Left pink scrap
  { id: 2, label: "Tape 02 ✨", cxPct: 0.092, cyPct: 0.324, sizePct: 0.076 }, // Mid-Left pink scrap
  { id: 3, label: "Tape 03 🎵", cxPct: 0.088, cyPct: 0.612, sizePct: 0.076 }, // Bottom-Left pink scrap
  { id: 4, label: "Tape 04 🧇", cxPct: 0.925, cyPct: 0.120, sizePct: 0.076 }, // Top-Right pink scrap
  { id: 5, label: "Tape 05 🏰", cxPct: 0.925, cyPct: 0.322, sizePct: 0.076 }, // Mid-Right purple scrap
  { id: 6, label: "Tape 06 ⚔️", cxPct: 0.915, cyPct: 0.608, sizePct: 0.076 }, // Lower-Mid-Right beige scrap
  { id: 7, label: "Tape 07 🎯", cxPct: 0.908, cyPct: 0.738, sizePct: 0.076 }, // Lower-Right kraft scrap
  { id: 8, label: "Tape 08 📻", cxPct: 0.890, cyPct: 0.885, sizePct: 0.076 }  // Bottom-Right pink scrap
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
 * Composite Shaaaw photo and 8 genuine QR codes onto the poster using Jimp
 */
async function composePoster(baseUrl = 'https://nandhish3004.github.io/birthday-qr-memory') {
  ensureOriginalPoster();
  if (!fs.existsSync(POSTER_SRC)) {
    throw new Error('Original poster not found. Please place original-poster.jpg in public/assets/');
  }

  // 1. Ensure all QR codes are generated with the target baseUrl
  await generateAllQRCodes(baseUrl);

  // 2. Load the base poster image & upscale to 4K Ultra-HD
  const poster = await Jimp.read(POSTER_SRC);

  // Master 4K upscale (2400px width minimum, 300+ DPI print resolution)
  if (poster.bitmap.width < 2400) {
    const scale = 2400 / poster.bitmap.width;
    poster.resize(2400, Math.round(poster.bitmap.height * scale), Jimp.RESIZE_BICUBIC);
    // Edge-sharpening convolution pass for crisp poster clarity
    poster.convolute([
      [0, -0.3, 0],
      [-0.3, 2.2, -0.3],
      [0, -0.3, 0]
    ]);
  }

  const posterWidth = poster.bitmap.width;
  const posterHeight = poster.bitmap.height;

  // 3. Composite Shaaaw's Photo into Center Polaroid Aperture (-2.0° tilt)
  if (fs.existsSync(SHAAW_PHOTO)) {
    try {
      const shaaw = await Jimp.read(SHAAW_PHOTO);
      const pw = Math.round(posterWidth * 0.3200);
      const ph = Math.round(posterHeight * 0.2180);
      const destAspect = pw / ph;

      const baseW = shaaw.bitmap.width;
      const baseH = Math.round(baseW / destAspect);
      const cropW = Math.round(baseW / 1.05);
      const cropH = Math.round(baseH / 1.05);
      const srcX = Math.round((shaaw.bitmap.width - cropW) / 2);
      const srcY = Math.round((shaaw.bitmap.height - cropH) * 0.18);

      shaaw.crop(srcX, srcY, cropW, cropH);
      shaaw.resize(pw, ph, Jimp.RESIZE_BICUBIC);
      shaaw.rotate(2.0); // Jimp rotates counter-clockwise for positive degrees

      const posX = Math.round(posterWidth * 0.5040 - pw / 2);
      const posY = Math.round(posterHeight * 0.3380 - ph / 2);

      poster.composite(shaaw, posX, posY, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1.0,
        opacityDest: 1.0
      });
      console.log('Composited Shaaaw center photo with -2.0° tilt into center polaroid.');
    } catch (err) {
      console.warn('Could not composite Shaaaw photo in Node:', err.message);
    }
  }

  const QRCode = require('qrcode');

  // 4. Composite each QR code replacing ONLY the dummy QR square
  for (const placement of QR_PLACEMENTS) {
    const targetSize = Math.round(posterWidth * placement.sizePct);
    const domain = baseUrl.replace(/\/+$/, '');
    const targetUrl = domain.includes('github.io') ? `${domain}/m/${placement.id}` : `${domain}/memory/${placement.id}`;

    // Generate with warm ivory background & deep espresso ink for seamless integration
    const qrBuffer = await QRCode.toBuffer(targetUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: targetSize,
      color: { dark: '#1a1416', light: '#fcfbf8' }
    });

    const qrImage = await Jimp.read(qrBuffer);

    // Coordinates on poster (centered on dummy QR)
    const posX = Math.round(posterWidth * placement.cxPct - targetSize / 2);
    const posY = Math.round(posterHeight * placement.cyPct - targetSize / 2);

    poster.composite(qrImage, posX, posY, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1.0,
      opacityDest: 1.0
    });
  }

  // 4. Save Master 4K composite poster at maximum quality (100)
  await poster.quality(100).writeAsync(POSTER_OUTPUT);
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
