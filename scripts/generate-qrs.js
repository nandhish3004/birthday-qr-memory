require('dotenv').config();
const path = require('path');
const { generateAllQRCodes } = require('../src/qr-generator');
const { composePoster } = require('../src/poster-composer');

async function main() {
  const customBaseUrl = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000';
  console.log(`\n======================================================`);
  console.log(`✨ Generating Scannable Birthday QRs & Poster`);
  console.log(`🌐 Base URL: ${customBaseUrl}`);
  console.log(`======================================================\n`);

  console.log('Generating 8 high-resolution QR codes (1024x1024, Error Correction H)...');
  const qrs = await generateAllQRCodes(customBaseUrl);
  qrs.forEach(q => {
    console.log(` ✅ QR #${q.id} -> ${q.url}`);
  });

  console.log('\nCompositing QR codes onto scrapbook poster...');
  try {
    const poster = await composePoster(customBaseUrl);
    console.log(` 🎉 Composite poster ready at: ${poster.outputPath}`);
    console.log(` Dimensions: ${poster.width}x${poster.height}`);
  } catch (err) {
    console.warn(` ⚠️ Server compositing notice: ${err.message}`);
    console.log(' Note: You can also download the 4K poster directly from the web browser!');
  }

  console.log('\nDone! Print individual QRs from public/assets/qr/ or download the full poster.\n');
}

main().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
