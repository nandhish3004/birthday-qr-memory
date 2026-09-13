const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const QR_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'qr');

if (!fs.existsSync(QR_OUTPUT_DIR)) {
  fs.mkdirSync(QR_OUTPUT_DIR, { recursive: true });
}

/**
 * Generate a single QR code for a memory
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
    errorCorrectionLevel: 'H', // 30% redundancy for extreme reliability
    type: 'png',
    margin: 3,                 // Proper quiet zone
    width: options.width || 1024,
    color: {
      dark: '#1a1016',         // Deep aesthetic midnight plum/black
      light: '#ffffff'         // Crisp white quiet zone
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
