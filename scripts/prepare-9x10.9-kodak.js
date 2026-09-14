const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'public', 'assets');
const DOCS_ASSETS_DIR = path.join(ROOT_DIR, 'docs', 'assets');
const USER_LORD = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789372775279.jpg";
const USER_POSTER = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789368265793.jpg";
const USER_SHAAW_CENTER = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789381931433.jpg";

console.log('--- 9x10.9 4K Ultra-HD Kodak Print & Asset Setup ---');

// 1. Ensure directories exist
[ASSETS_DIR, DOCS_ASSETS_DIR, path.join(ASSETS_DIR, 'qr'), path.join(DOCS_ASSETS_DIR, 'qr')].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 2. Lord Nandhish assets (Supreme Celestial Preserver)
if (fs.existsSync(USER_LORD)) {
  fs.copyFileSync(USER_LORD, path.join(ASSETS_DIR, 'lord-nandhish-raw.jpg'));
  fs.copyFileSync(USER_LORD, path.join(ASSETS_DIR, 'lord-nandhish.png'));
  fs.copyFileSync(USER_LORD, path.join(DOCS_ASSETS_DIR, 'lord-nandhish.png'));
  console.log('✅ Copied Supreme Lord Nandhish caricature into public/assets/ and docs/assets/');
}

// 3. Shaaaw Center Polaroid Photo
if (fs.existsSync(USER_SHAAW_CENTER)) {
  fs.copyFileSync(USER_SHAAW_CENTER, path.join(ASSETS_DIR, 'shaaw-center.jpg'));
  fs.copyFileSync(USER_SHAAW_CENTER, path.join(DOCS_ASSETS_DIR, 'shaaw-center.jpg'));
  console.log('✅ Copied Shaaaw center polaroid photo to public/assets/shaaw-center.jpg');
}

// 4. Poster asset
if (fs.existsSync(USER_POSTER)) {
  fs.copyFileSync(USER_POSTER, path.join(ASSETS_DIR, 'original-poster.jpg'));
  fs.copyFileSync(USER_POSTER, path.join(DOCS_ASSETS_DIR, 'original-poster.jpg'));
  console.log('✅ Updated original-poster.jpg with latest uploaded collage');
}

console.log('Done! Now run create-9x10.9-kodak-print.bat or open public/kodak-print.html in your browser.');
