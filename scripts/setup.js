const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const ROOT_DIR = path.join(__dirname, '..');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const ASSETS_DIR = path.join(ROOT_DIR, 'public', 'assets');
const QR_DIR = path.join(ASSETS_DIR, 'qr');

const POSTER_SRC_DEST = path.join(ASSETS_DIR, 'original-poster.jpg');
const USER_POSTER_SOURCE = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\e6a1bd95-2328-4114-a602-d70aeb13f4f0\\.user_uploaded\\media_1789313085861.jpg";

async function runSetup() {
  console.log('🚀 Running Setup for Birthday QR Memory System...');

  // 1. Create directories
  [UPLOADS_DIR, DATA_DIR, ASSETS_DIR, QR_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });

  // 2. Copy original poster image
  if (fs.existsSync(USER_POSTER_SOURCE)) {
    fs.copyFileSync(USER_POSTER_SOURCE, POSTER_SRC_DEST);
    console.log(`✅ Copied original birthday poster to: ${POSTER_SRC_DEST}`);
  } else {
    console.log(`⚠️ User poster source not found at: ${USER_POSTER_SOURCE}`);
  }

  // 3. Initialize database if missing
  const dbFile = path.join(DATA_DIR, 'memories.json');
  if (!fs.existsSync(dbFile)) {
    const defaultMemories = [];
    for (let i = 1; i <= 8; i++) {
      defaultMemories.push({
        id: i,
        title: `Memory #${i}`,
        media_type: null,
        media_url: null,
        mime_type: null,
        file_name: null,
        file_size: 0,
        note: "A little surprise is waiting here 💗",
        updated_at: new Date().toISOString()
      });
    }
    fs.writeFileSync(dbFile, JSON.stringify(defaultMemories, null, 2), 'utf8');
    console.log('✅ Initialized data/memories.json with 8 memories.');
  }

  // 4. Generate initial 8 QR codes
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  console.log(`Generating 8 initial QR codes with Base URL: ${baseUrl}`);

  for (let i = 1; i <= 8; i++) {
    const targetUrl = `${baseUrl.replace(/\/+$/, '')}/memory/${i}`;
    const qrPath = path.join(QR_DIR, `${i}.png`);
    await QRCode.toFile(qrPath, targetUrl, {
      errorCorrectionLevel: 'H',
      margin: 3,
      width: 1024,
      color: {
        dark: '#1a1016',
        light: '#ffffff'
      }
    });
    console.log(` - QR ${i}: ${targetUrl} -> public/assets/qr/${i}.png`);
  }

  console.log('🎉 Setup complete! Run `npm start` to launch the application.');
}

runSetup().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
