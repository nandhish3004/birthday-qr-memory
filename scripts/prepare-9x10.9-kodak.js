const fs = require('fs');
const path = require('path');
const { processAllAvatars } = require('./prepare-avatars');

const ROOT_DIR = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'public', 'assets');
const DOCS_ASSETS_DIR = path.join(ROOT_DIR, 'docs', 'assets');

const USER_UPLOAD = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded";
const USER_POSTER = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\6ea84756-37a6-43a8-8392-c3735cd7d754\\.user_uploaded\\media_1789417290826.jpg";
const USER_SHAAW_CENTER = path.join(USER_UPLOAD, "media_1789381931433.jpg");

const AVATAR_SHEPHERD = path.join(USER_UPLOAD, "media_1789393837249.png");
const AVATAR_VISHNU   = path.join(USER_UPLOAD, "media_1789393854751.jpg");
const AVATAR_BUDDHA   = path.join(USER_UPLOAD, "media_1789393871771.jpg");

function safeCopy(src, dst) {
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      return true;
    }
  } catch (e) {
    console.warn(`Copy failed: ${src} -> ${dst}:`, e.message);
  }
  return false;
}

async function main() {
  console.log('--- 9x10.9 4K Ultra-HD Kodak Print & Asset Setup ---');

  // 1. Ensure directories exist
  [ASSETS_DIR, DOCS_ASSETS_DIR, path.join(ASSETS_DIR, 'qr'), path.join(DOCS_ASSETS_DIR, 'qr')].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // 2. Lord Nandhish assets
  safeCopy(USER_LORD, path.join(ASSETS_DIR, 'lord-nandhish-raw.jpg'));
  safeCopy(USER_LORD, path.join(ASSETS_DIR, 'lord-nandhish.png'));
  safeCopy(USER_LORD, path.join(DOCS_ASSETS_DIR, 'lord-nandhish.png'));

  // 3. Shaaaw Center Polaroid Photo
  safeCopy(USER_SHAAW_CENTER, path.join(ASSETS_DIR, 'shaaw-center.jpg'));
  safeCopy(USER_SHAAW_CENTER, path.join(DOCS_ASSETS_DIR, 'shaaw-center.jpg'));

  // 4. Poster asset: Reworked Clean Scrapbook Background (No baked-in polaroids, no old QRs)
  safeCopy(USER_POSTER, path.join(ASSETS_DIR, 'original-poster.jpg'));
  safeCopy(USER_POSTER, path.join(DOCS_ASSETS_DIR, 'original-poster.jpg'));
  safeCopy(USER_POSTER, path.join(ASSETS_DIR, 'clean-poster-bg.jpg'));
  safeCopy(USER_POSTER, path.join(DOCS_ASSETS_DIR, 'clean-poster-bg.jpg'));

  // 5. Ensure raw avatar files are guaranteed copied
  safeCopy(AVATAR_BUDDHA, path.join(ASSETS_DIR, 'avatar-buddha.png'));
  safeCopy(AVATAR_BUDDHA, path.join(ASSETS_DIR, 'avatar-buddha-raw.jpg'));
  safeCopy(AVATAR_BUDDHA, path.join(DOCS_ASSETS_DIR, 'avatar-buddha.png'));
  safeCopy(AVATAR_BUDDHA, path.join(DOCS_ASSETS_DIR, 'avatar-buddha-raw.jpg'));

  safeCopy(AVATAR_VISHNU, path.join(ASSETS_DIR, 'avatar-vishnu.png'));
  safeCopy(AVATAR_VISHNU, path.join(ASSETS_DIR, 'avatar-vishnu-raw.jpg'));
  safeCopy(AVATAR_VISHNU, path.join(DOCS_ASSETS_DIR, 'avatar-vishnu.png'));
  safeCopy(AVATAR_VISHNU, path.join(DOCS_ASSETS_DIR, 'avatar-vishnu-raw.jpg'));

  safeCopy(AVATAR_SHEPHERD, path.join(ASSETS_DIR, 'avatar-shepherd.png'));
  safeCopy(AVATAR_SHEPHERD, path.join(ASSETS_DIR, 'avatar-shepherd-raw.png'));
  safeCopy(AVATAR_SHEPHERD, path.join(DOCS_ASSETS_DIR, 'avatar-shepherd.png'));
  safeCopy(AVATAR_SHEPHERD, path.join(DOCS_ASSETS_DIR, 'avatar-shepherd-raw.png'));

  // 6. Run avatar processing (if Jimp available)
  try {
    await processAllAvatars();
  } catch (err) {
    console.warn('Avatar processing note:', err.message);
  }

  // 7. Sync HTML studio files between docs and public
  const docsKodak = path.join(ROOT_DIR, 'docs', 'kodak-print.html');
  const pubKodak = path.join(ROOT_DIR, 'public', 'kodak-print.html');
  safeCopy(docsKodak, pubKodak);

  const docsNew = path.join(ROOT_DIR, 'docs', 'new-poster.html');
  const pubNew = path.join(ROOT_DIR, 'public', 'new-poster.html');
  safeCopy(docsNew, pubNew);

  console.log('✅ All assets synced cleanly! 4K Print and Studio ready.');
}

main().catch(console.error);
