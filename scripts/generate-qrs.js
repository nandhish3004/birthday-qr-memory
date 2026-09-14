require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { generateAllQRCodes, verifyQRCodes } = require('../src/qr-generator');
const { composePoster } = require('../src/poster-composer');
const { buildGitHubPages } = require('./build-github-pages');

const CONFIG_FILE = path.join(__dirname, '..', 'data', 'config.json');

async function main() {
  const permanentDomain = process.argv[2] || 'https://nandhish3004.github.io/birthday-qr-memory';
  const targetServerUrl = process.argv[3] || process.env.BASE_URL || 'https://birthday-qr-memory-system.onrender.com';

  console.log(`\n======================================================`);
  console.log(`🔒 Generating Lifetime Permanent Birthday QRs`);
  console.log(`🌐 Permanent Encoded Domain: ${permanentDomain}`);
  console.log(`🚀 Forwarding Target Server:  ${targetServerUrl}`);
  console.log(`======================================================\n`);

  console.log('1. Generating 8 Master QR codes (1600x1600 PNG + Lossless Vector SVG, Error Correction H)...');
  const qrs = await generateAllQRCodes(permanentDomain);
  qrs.forEach(q => {
    console.log(`   ✅ QR #${q.id} -> ${q.url}`);
    console.log(`      📁 PNG: ${q.pngFilename} | SVG: ${q.svgFilename}`);
  });

  console.log('\n2. Building GitHub Pages Lifetime Redirect Hub in docs/...');
  buildGitHubPages(targetServerUrl);

  console.log('\n3. Saving Permanent Lock in data/config.json...');
  const dir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const config = {
    permanentDomain,
    isLocked: true,
    lockedAt: new Date().toISOString(),
    targetServerUrl,
    hubType: permanentDomain.includes('github.io') ? 'github-pages' : 'direct'
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

  console.log('\n4. Compositing QR codes onto Master 4K scrapbook poster...');
  try {
    const poster = await composePoster(permanentDomain);
    console.log(`   🎉 Composite poster ready at: ${poster.outputPath}`);
    console.log(`   Dimensions: ${poster.width}x${poster.height}`);
  } catch (err) {
    console.warn(`   ⚠️ Poster notice: ${err.message}`);
  }

  const verification = verifyQRCodes();
  console.log('\n======================================================');
  console.log(`🔒 Integrity Verification: ${verification.allValid ? 'ALL 8 QRS HEALTHY & VERIFIED' : 'WARNING: SOME QRS INCOMPLETE'}`);
  console.log('======================================================');
  console.log('Done! All QR codes are permanently locked and will NEVER need re-generation.\n');
}

main().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});

