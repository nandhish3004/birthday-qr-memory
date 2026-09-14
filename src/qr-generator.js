const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const QR_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'qr');

if (!fs.existsSync(QR_OUTPUT_DIR)) {
  fs.mkdirSync(QR_OUTPUT_DIR, { recursive: true });
}

/**
 * Generate a single print-ready permanent QR code for a memory
 * Outputs both Ultra-HD 1600px PNG and lossless Vector SVG
 * @param {number} id - Memory ID (1 to 8)
 * @param {string} baseUrl - Base URL or permanent hub URL (e.g. https://nandhish3004.github.io/birthday-qr-memory)
 * @param {object} options - Customization options
 */
async function generateQRCode(id, baseUrl = 'https://nandhish3004.github.io/birthday-qr-memory', options = {}) {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  // For GitHub Pages hub, URLs format as /m/1 (or /memory/1 if supported)
  const targetUrl = cleanBase.includes('github.io') ? `${cleanBase}/m/${id}` : `${cleanBase}/memory/${id}`;

  const pngFilename = `${id}.png`;
  const svgFilename = `${id}.svg`;
  const pngPath = path.join(QR_OUTPUT_DIR, pngFilename);
  const svgPath = path.join(QR_OUTPUT_DIR, svgFilename);

  const qrOptions = {
    errorCorrectionLevel: 'H',     // 30% error correction (handles scratches, folds, prints)
    type: 'png',
    margin: 4,                     // ISO standard 4-module quiet zone (essential for phone cameras)
    width: options.width || 1600,  // 1600px ultra-high definition for 300+ DPI razor-sharp printing
    color: {
      dark: '#000000',             // 100% pitch black for maximum optical camera contrast
      light: '#ffffff'             // 100% stark white background
    }
  };

  // 1. Generate Ultra-HD PNG
  await QRCode.toFile(pngPath, targetUrl, qrOptions);

  // 2. Generate Vector SVG (lossless, infinite DPI print standard)
  await QRCode.toFile(svgPath, targetUrl, {
    ...qrOptions,
    type: 'svg'
  });

  const dataUrl = await QRCode.toDataURL(targetUrl, qrOptions);

  return {
    id,
    url: targetUrl,
    pngFilename,
    svgFilename,
    pngPath,
    svgPath,
    dataUrl
  };
}

/**
 * Generate all 8 QR codes once and lock them
 */
async function generateAllQRCodes(baseUrl = 'https://nandhish3004.github.io/birthday-qr-memory') {
  const results = [];
  for (let id = 1; id <= 8; id++) {
    const qr = await generateQRCode(id, baseUrl);
    results.push(qr);
  }
  return results;
}

/**
 * Verify that all 8 permanent QR files exist on disk and are healthy
 */
function verifyQRCodes() {
  const status = [];
  for (let id = 1; id <= 8; id++) {
    const pngPath = path.join(QR_OUTPUT_DIR, `${id}.png`);
    const svgPath = path.join(QR_OUTPUT_DIR, `${id}.svg`);
    const pngExists = fs.existsSync(pngPath) && fs.statSync(pngPath).size > 1000;
    const svgExists = fs.existsSync(svgPath) && fs.statSync(svgPath).size > 500;
    status.push({
      id,
      pngExists,
      svgExists,
      isValid: pngExists && svgExists,
      pngSize: pngExists ? fs.statSync(pngPath).size : 0,
      svgSize: svgExists ? fs.statSync(svgPath).size : 0
    });
  }
  const allValid = status.every(s => s.isValid);
  return { allValid, items: status };
}

module.exports = {
  generateQRCode,
  generateAllQRCodes,
  verifyQRCodes,
  QR_OUTPUT_DIR
};

