const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const QR_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'qr');

if (!fs.existsSync(QR_OUTPUT_DIR)) {
  fs.mkdirSync(QR_OUTPUT_DIR, { recursive: true });
}

/**
 * Generate a single print-ready QR code for a memory
 * Guaranteed 100% accessible with any mobile QR scanner (iPhone, Android, Samsung, WhatsApp, Lens)
 * @param {number} id - Memory ID (1 to 8)
 * @param {string} baseUrl - Base URL, e.g. https://shaaaw.onrender.com
 * @param {object} options - Customization options
 */
async function generateQRCode(id, baseUrl = 'http://localhost:3000', options = {}) {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const targetUrl = `${cleanBase}/memory/${id}`;
  const filename = `${id}.png`;
  const outputPath = path.join(QR_OUTPUT_DIR, filename);

  const qrOptions = {
    errorCorrectionLevel: 'H',     // 30% error correction (handles scratches, folds, prints)
    type: 'png',
    margin: 4,                     // ISO standard 4-module quiet zone (essential for phone cameras)
    width: options.width || 1400,  // 1400px ultra-high definition for 300+ DPI razor-sharp printing
    color: {
      dark: '#000000',             // 100% pitch black for maximum optical camera contrast
      light: '#ffffff'             // 100% stark white background
    }
  };

  // Generate buffer and file
  await QRCode.toFile(outputPath, targetUrl, qrOptions);
  const dataUrl = await QRCode.toDataURL(targetUrl, qrOptions);

  return {
    id,
    url: targetUrl,
    filename,
    filePath: outputPath,
    dataUrl
  };
}

/**
 * Generate all 8 QR codes
 */
async function generateAllQRCodes(baseUrl = 'http://localhost:3000') {
  const results = [];
  for (let id = 1; id <= 8; id++) {
    const qr = await generateQRCode(id, baseUrl);
    results.push(qr);
  }
  return results;
}

module.exports = {
  generateQRCode,
  generateAllQRCodes,
  QR_OUTPUT_DIR
};
