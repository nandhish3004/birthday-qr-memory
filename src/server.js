require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const archiver = require('archiver');

const db = require('./db');
const { upload, getMediaType, deleteLocalFile, UPLOADS_DIR } = require('./storage');
const { generateQRCode, generateAllQRCodes, QR_OUTPUT_DIR } = require('./qr-generator');
const { composePoster, ensureOriginalPoster, POSTER_OUTPUT, QR_PLACEMENTS } = require('./poster-composer');

const app = express();
const PORT = process.env.PORT || 3000;
let BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const ADMIN_PIN = process.env.ADMIN_PIN || 'shaaaw2026';

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.get('/assets/original-poster.jpg', (req, res) => {
  const localPoster = path.join(__dirname, '..', 'public', 'assets', 'original-poster.jpg');
  const uploadedPoster = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\e6a1bd95-2328-4114-a602-d70aeb13f4f0\\.user_uploaded\\media_1789324183044.jpg";
  if (fs.existsSync(uploadedPoster)) {
    return res.sendFile(uploadedPoster);
  }
  if (fs.existsSync(localPoster)) {
    return res.sendFile(localPoster);
  }
  res.status(404).send('Original poster not found');
});

app.get('/assets/caricature.png', (req, res) => {
  const localCaricature = path.join(__dirname, '..', 'public', 'assets', 'caricature.png');
  const uploadedCaricature = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\e6a1bd95-2328-4114-a602-d70aeb13f4f0\\.user_uploaded\\media_1789319562845.png";
  if (fs.existsSync(localCaricature)) {
    return res.sendFile(localCaricature);
  }
  if (fs.existsSync(uploadedCaricature)) {
    return res.sendFile(uploadedCaricature);
  }
  res.status(404).send('Caricature not found');
});

// Lord Nandhish (The Supreme Cosmic Preserver) asset handler
const USER_UPLOADED_LORD = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\4d15bc15-2ae2-43f8-9dc8-e3aeeec3a9c5\\.user_uploaded\\media_1789364766184.jpg";
const LORD_PNG = path.join(__dirname, '..', 'public', 'assets', 'lord-nandhish.png');
const LORD_RAW = path.join(__dirname, '..', 'public', 'assets', 'lord-nandhish-raw.jpg');

async function ensureLordNandhishAsset() {
  try {
    if (!fs.existsSync(LORD_RAW) && fs.existsSync(USER_UPLOADED_LORD)) {
      fs.copyFileSync(USER_UPLOADED_LORD, LORD_RAW);
    }
    if (!fs.existsSync(LORD_PNG)) {
      const { processLordNandhish } = require('../scripts/process-lord-nandhish');
      const src = fs.existsSync(LORD_RAW) ? LORD_RAW : (fs.existsSync(USER_UPLOADED_LORD) ? USER_UPLOADED_LORD : null);
      if (src) {
        await processLordNandhish(src, LORD_PNG);
      }
    }
  } catch (err) {
    console.warn('Lord Nandhish processing notice:', err.message);
  }
}

app.get('/assets/lord-nandhish.png', async (req, res) => {
  await ensureLordNandhishAsset();
  if (fs.existsSync(LORD_PNG)) {
    res.setHeader('Content-Type', 'image/png');
    return res.sendFile(LORD_PNG);
  }
  if (fs.existsSync(LORD_RAW)) {
    return res.sendFile(LORD_RAW);
  }
  if (fs.existsSync(USER_UPLOADED_LORD)) {
    return res.sendFile(USER_UPLOADED_LORD);
  }
  res.status(404).send('Lord Nandhish asset not found');
});

app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Admin auth middleware for protected API endpoints
function requireAdmin(req, res, next) {
  const token = req.cookies.admin_token || req.headers['x-admin-pin'];
  if (token === ADMIN_PIN) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
}

// ----------------------
// HTML Page Routes
// ----------------------

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Memory Page: /memory/:id
app.get('/memory/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1 || id > 8) {
    return res.status(404).send('Memory not found. Valid memories are 1 through 8.');
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'memory.html'));
});

// Admin Dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// ----------------------
// API Authentication
// ----------------------

app.post('/api/auth/login', (req, res) => {
  const { pin } = req.body;
  if (pin === ADMIN_PIN) {
    res.cookie('admin_token', pin, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    return res.json({ success: true, message: 'Logged in successfully' });
  }
  return res.status(401).json({ success: false, error: 'Incorrect Admin PIN' });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true, message: 'Logged out' });
});

app.get('/api/auth/check', (req, res) => {
  const token = req.cookies.admin_token;
  res.json({ isAuthenticated: token === ADMIN_PIN });
});

// ----------------------
// Memory API
// ----------------------

// Get all memories
app.get('/api/memories', (req, res) => {
  const memories = db.getAllMemories();
  res.json({ memories, baseUrl: BASE_URL });
});

// Get single memory
app.get('/api/memories/:id', (req, res) => {
  const memory = db.getMemoryById(req.params.id);
  if (!memory) {
    return res.status(404).json({ error: 'Memory not found' });
  }
  res.json({ memory, baseUrl: BASE_URL });
});

// Upload / Replace media for a memory
app.post('/api/memories/:id/upload', requireAdmin, upload.single('media'), async (req, res) => {
  try {
    const memoryId = parseInt(req.params.id, 10);
    if (isNaN(memoryId) || memoryId < 1 || memoryId > 8) {
      return res.status(400).json({ error: 'Invalid memory ID (1-8)' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No media file provided' });
    }

    const existing = db.getMemoryById(memoryId);
    if (existing && existing.media_url) {
      deleteLocalFile(existing.media_url);
    }

    const mediaType = getMediaType(req.file.mimetype, req.file.originalname);
    const mediaUrl = `/uploads/${req.file.filename}`;

    const updated = db.updateMemoryMedia(memoryId, {
      media_type: mediaType,
      media_url: mediaUrl,
      mime_type: req.file.mimetype,
      file_name: req.file.originalname,
      file_size: req.file.size,
      title: req.body.title || undefined,
      note: req.body.note || undefined
    });

    res.json({ success: true, memory: updated });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload media' });
  }
});

// Update title and note without replacing media
app.put('/api/memories/:id', requireAdmin, (req, res) => {
  const memoryId = parseInt(req.params.id, 10);
  const { title, note } = req.body;
  const updated = db.updateMemoryDetails(memoryId, { title, note });
  if (!updated) {
    return res.status(404).json({ error: 'Memory not found' });
  }
  res.json({ success: true, memory: updated });
});

// Delete media from a memory
app.delete('/api/memories/:id', requireAdmin, (req, res) => {
  const memoryId = parseInt(req.params.id, 10);
  const result = db.deleteMemoryMedia(memoryId);
  if (!result) {
    return res.status(404).json({ error: 'Memory not found' });
  }

  if (result.oldMediaUrl) {
    deleteLocalFile(result.oldMediaUrl);
  }

  res.json({ success: true, memory: result.memory });
});

const CONFIG_FILE = path.join(__dirname, '..', 'data', 'config.json');
const { verifyQRCodes } = require('./qr-generator');
const { buildGitHubPages } = require('../scripts/build-github-pages');

function loadFullConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (data && typeof data === 'object') {
        return {
          permanentDomain: data.permanentDomain || 'https://nandhish3004.github.io/birthday-qr-memory',
          isLocked: data.isLocked !== false, // default to true once set
          lockedAt: data.lockedAt || new Date().toISOString(),
          targetServerUrl: data.targetServerUrl || BASE_URL,
          hubType: data.hubType || 'github-pages'
        };
      }
    }
  } catch (err) {}
  return {
    permanentDomain: 'https://nandhish3004.github.io/birthday-qr-memory',
    isLocked: true,
    lockedAt: new Date().toISOString(),
    targetServerUrl: BASE_URL,
    hubType: 'github-pages'
  };
}

function saveFullConfig(config) {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (err) {
    console.error('Error saving config:', err);
  }
}

// ----------------------
// Configuration & Poster API
// ----------------------

// Get current system configuration and permanent lock status
app.get('/api/config', (req, res) => {
  const config = loadFullConfig();
  const verification = verifyQRCodes();
  res.json({
    baseUrl: config.targetServerUrl || BASE_URL,
    permanentDomain: config.permanentDomain,
    isLocked: config.isLocked,
    lockedAt: config.lockedAt,
    targetServerUrl: config.targetServerUrl,
    storageType: process.env.STORAGE_TYPE || 'local',
    nodeEnv: process.env.NODE_ENV || 'development',
    placements: QR_PLACEMENTS,
    verification
  });
});

// Check permanent status
app.get('/api/admin/permanent-status', requireAdmin, (req, res) => {
  const config = loadFullConfig();
  const verification = verifyQRCodes();
  const cleanBase = config.permanentDomain.replace(/\/+$/, '');
  const items = verification.items.map(item => ({
    ...item,
    url: cleanBase.includes('github.io') ? `${cleanBase}/m/${item.id}` : `${cleanBase}/memory/${item.id}`
  }));

  res.json({
    permanentDomain: config.permanentDomain,
    isLocked: config.isLocked,
    lockedAt: config.lockedAt,
    targetServerUrl: config.targetServerUrl,
    hubType: config.hubType,
    allValid: verification.allValid,
    items
  });
});

// Lock Permanent QR Codes (Single-time generation)
app.post('/api/admin/lock-permanent-qr', requireAdmin, async (req, res) => {
  try {
    const { permanentDomain, targetServerUrl } = req.body;
    const domain = (permanentDomain || 'https://nandhish3004.github.io/birthday-qr-memory').trim().replace(/\/+$/, '');
    const activeTarget = (targetServerUrl || BASE_URL).trim().replace(/\/+$/, '');

    // 1. Generate all 8 permanent QRs (PNG + SVG)
    console.log('🔒 Generating and permanently locking 8 QR codes for:', domain);
    await generateAllQRCodes(domain);

    // 2. Build GitHub Pages redirect hub if applicable
    if (domain.includes('github.io')) {
      buildGitHubPages(activeTarget);
    }

    // 3. Save config with isLocked = true
    const config = {
      permanentDomain: domain,
      isLocked: true,
      lockedAt: new Date().toISOString(),
      targetServerUrl: activeTarget,
      hubType: domain.includes('github.io') ? 'github-pages' : 'direct'
    };
    saveFullConfig(config);

    // 4. Update poster
    try {
      await composePoster(domain);
    } catch (e) {
      console.warn('Poster update notice:', e.message);
    }

    const verification = verifyQRCodes();

    res.json({
      success: true,
      message: 'Permanent QR codes generated and locked forever! 🔒✨',
      config,
      verification
    });
  } catch (err) {
    console.error('Lock error:', err);
    res.status(500).json({ error: 'Failed to lock QR codes: ' + err.message });
  }
});

// Unlock QR Codes (Only if explicitly needed before printing)
app.post('/api/admin/unlock-qr', requireAdmin, (req, res) => {
  const config = loadFullConfig();
  config.isLocked = false;
  saveFullConfig(config);
  res.json({ success: true, message: 'QR codes unlocked for reconfiguration. Remember to re-lock before printing!' });
});

// Update Target Live Server URL (without altering the printed physical QR codes)
app.post('/api/admin/update-target-server', requireAdmin, (req, res) => {
  const { targetServerUrl } = req.body;
  if (!targetServerUrl || !targetServerUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Valid URL starting with http:// or https:// is required' });
  }

  const config = loadFullConfig();
  config.targetServerUrl = targetServerUrl.replace(/\/+$/, '');
  saveFullConfig(config);

  if (config.permanentDomain.includes('github.io')) {
    buildGitHubPages(config.targetServerUrl);
  }

  res.json({
    success: true,
    message: 'Active server destination updated! The printed physical QR codes remain permanently valid.',
    targetServerUrl: config.targetServerUrl
  });
});

// Legacy set-base-url redirect to permanent lock
app.post('/api/admin/set-base-url', requireAdmin, async (req, res) => {
  const { baseUrl } = req.body;
  if (!baseUrl || !baseUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Valid URL starting with http:// or https:// is required' });
  }
  const config = loadFullConfig();
  config.targetServerUrl = baseUrl.replace(/\/+$/, '');
  saveFullConfig(config);
  if (config.permanentDomain.includes('github.io')) {
    buildGitHubPages(config.targetServerUrl);
  }
  res.json({ success: true, baseUrl: config.targetServerUrl, message: 'Server URL updated successfully.' });
});

// Serve permanent locked static QR code image
app.get('/api/qr/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1 || id > 8) {
      return res.status(404).send('Invalid QR ID');
    }

    const format = req.query.format === 'svg' ? 'svg' : 'png';
    const filePath = path.join(QR_OUTPUT_DIR, `${id}.${format}`);

    // If file does not exist yet, generate it once
    if (!fs.existsSync(filePath)) {
      const config = loadFullConfig();
      await generateQRCode(id, config.permanentDomain);
    }

    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else {
      res.setHeader('Content-Type', 'image/png');
    }
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
    res.sendFile(filePath);
  } catch (err) {
    console.error('Error serving QR:', err);
    res.status(500).send('Error serving permanent QR');
  }
});

// Download individual permanent QR code (PNG or SVG)
app.get('/api/admin/download-qr/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1 || id > 8) {
      return res.status(400).json({ error: 'Invalid QR ID' });
    }

    const format = req.query.format === 'svg' ? 'svg' : 'png';
    const filename = `${id}.${format}`;
    const filePath = path.join(QR_OUTPUT_DIR, filename);

    if (!fs.existsSync(filePath)) {
      const config = loadFullConfig();
      await generateQRCode(id, config.permanentDomain);
    }

    const downloadName = `shaaaw_permanent_qr_memory_${id}.${format}`;
    res.download(filePath, downloadName);
  } catch (err) {
    console.error('Error downloading QR:', err);
    res.status(500).json({ error: err.message });
  }
});

// Download all 8 permanent QR codes as a ZIP (Includes Ultra-HD PNGs + Scalable Vector SVGs)
app.get('/api/admin/download-all-qrs', async (req, res) => {
  try {
    const config = loadFullConfig();
    const verification = verifyQRCodes();
    if (!verification.allValid) {
      await generateAllQRCodes(config.permanentDomain);
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    res.attachment('shaaaw_permanent_all_8_qrs_master_pack.zip');

    archive.on('error', (err) => {
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    // Add PNGs and SVGs
    for (let i = 1; i <= 8; i++) {
      const pngPath = path.join(QR_OUTPUT_DIR, `${i}.png`);
      const svgPath = path.join(QR_OUTPUT_DIR, `${i}.svg`);
      if (fs.existsSync(pngPath)) {
        archive.append(fs.createReadStream(pngPath), { name: `png/tape_0${i}_1600px.png` });
      }
      if (fs.existsSync(svgPath)) {
        archive.append(fs.createReadStream(svgPath), { name: `svg_vector/tape_0${i}_lossless.svg` });
      }
    }

    // Add README info file inside ZIP
    const infoText = `======================================================
🎁 SHAAAW'S BIRTHDAY QR CODES — PERMANENT MASTER PACK
======================================================
Status: LOCKED FOREVER (Lifetime Guarantee)
Permanent Hub URL: ${config.permanentDomain}
Locked At: ${config.lockedAt}

RESOLVER URLS ENCODED IN THESE PHYSICAL QR CODES:
Tape 01: ${config.permanentDomain}/m/1
Tape 02: ${config.permanentDomain}/m/2
Tape 03: ${config.permanentDomain}/m/3
Tape 04: ${config.permanentDomain}/m/4
Tape 05: ${config.permanentDomain}/m/5
Tape 06: ${config.permanentDomain}/m/6
Tape 07: ${config.permanentDomain}/m/7
Tape 08: ${config.permanentDomain}/m/8

PRINTING INSTRUCTIONS:
- For posters, scrapbooks, or photo paper: Use the 1600x1600 PNGs in the png/ folder (300+ DPI, razor-sharp).
- For large vinyl banners or laser engraving: Use the lossless SVGs in svg_vector/ (infinite resolution).
- Error Correction Level: High (30% redundancy) — mobile phones can scan even if folded or slightly scratched.

CHANGING MEMORIES IN THE FUTURE:
You can replace videos, audio songs, and notes in the Admin Dashboard at any time.
These physical QR codes NEVER expire and NEVER need to be reprinted!
======================================================`;

    archive.append(infoText, { name: 'PERMANENT_QR_GUIDE.txt' });
    archive.finalize();
  } catch (err) {
    console.error('ZIP generation error:', err);
    res.status(500).send({ error: err.message });
  }
});

// View Scrapbook Poster with Real QRs in browser
app.get('/admin/poster-studio', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'poster-studio.html'));
});

// Download Ready-to-Print Composite Scrapbook Poster with Real QRs
app.get('/api/admin/download-poster', async (req, res) => {
  try {
    const domain = getEffectiveBaseUrl(req);
    await composePoster(domain);
    if (fs.existsSync(POSTER_OUTPUT)) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'attachment; filename="shaaaw_scrapbook_poster_with_real_qrs.png"');
      return res.sendFile(POSTER_OUTPUT);
    }
    res.status(404).send('Poster generation failed');
  } catch (err) {
    console.error('Poster download error:', err);
    res.status(500).send('Error generating poster: ' + err.message);
  }
});

// Printable Sheet: Renders a print-ready A4 grid with all 8 QR codes, titles, and cutting lines
app.get('/admin/printable-sheet', async (req, res) => {
  try {
    const config = loadFullConfig();
    const cleanDomain = config.permanentDomain.replace(/\/+$/, '');
    const QRCode = require('qrcode');
    const memories = db.getAllMemories();

    const qrCards = [];
    for (const mem of memories) {
      const targetUrl = cleanDomain.includes('github.io') ? `${cleanDomain}/m/${mem.id}` : `${cleanDomain}/memory/${mem.id}`;
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        errorCorrectionLevel: 'H',
        margin: 4,
        width: 600,
        color: { dark: '#000000', light: '#ffffff' }
      });
      qrCards.push({
        id: mem.id,
        title: mem.title || `Tape #${mem.id}`,
        type: mem.media_type,
        url: targetUrl,
        qrDataUrl: dataUrl
      });
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Physical QR Cards for Shaaaw (Tapes 01 - 08)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 24px;
    }
    .print-header {
      max-width: 900px;
      margin: 0 auto 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      padding: 16px 24px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .print-title h1 { font-size: 1.3rem; font-weight: 800; color: #e11d48; }
    .print-title p { font-size: 0.85rem; color: #64748b; margin-top: 4px; }
    .print-btn {
      background: #e11d48;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 999px;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.95rem;
      box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
    }
    .cards-grid {
      max-width: 900px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .qr-card-item {
      background: #ffffff;
      border: 2px dashed #cbd5e1;
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 16px;
      page-break-inside: avoid;
    }
    .qr-img {
      width: 140px;
      height: 140px;
      display: block;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .qr-info { flex: 1; }
    .chapter-tag {
      display: inline-block;
      background: #ffe4e6;
      color: #be123c;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .card-meta {
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 8px;
    }
    .card-url {
      font-size: 0.68rem;
      color: #94a3b8;
      word-break: break-all;
      font-family: monospace;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .print-header { display: none; }
      .cards-grid { max-width: 100%; gap: 14px; }
      .qr-card-item { border: 1.5px dashed #94a3b8; padding: 12px; }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <div class="print-title">
      <h1>🖨️ Physical QR Card Sheet for Shaaaw</h1>
      <p>Permanent Domain: <strong>${cleanDomain}</strong> &bull; Error Correction: High (30%) &bull; Status: Locked Forever</p>
    </div>
    <button class="print-btn" onclick="window.print()">Print Cards (Ctrl + P)</button>
  </div>
  <div class="cards-grid">
    ${qrCards.map(c => `
      <div class="qr-card-item">
        <img class="qr-img" src="${c.qrDataUrl}" alt="Tape ${c.id} QR">
        <div class="qr-info">
          <span class="chapter-tag">TAPE 0${c.id}</span>
          <h3 class="card-title">${c.title}</h3>
          <p class="card-meta">Format: ${c.type === 'empty' ? 'Classified Surprise' : (c.type === 'video' ? 'VIDEO REEL' : 'AUDIO TAPE')}</p>
          <p class="card-url">${c.url}</p>
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;
    res.send(html);
  } catch (err) {
    console.error('Print sheet error:', err);
    res.status(500).send('Error generating printable card sheet: ' + err.message);
  }
});

// Server Initialization
async function initServer() {
  ensureOriginalPoster();
  await ensureLordNandhishAsset();
  const config = loadFullConfig();
  BASE_URL = config.targetServerUrl || BASE_URL;

  const verification = verifyQRCodes();
  if (config.isLocked && verification.allValid) {
    console.log('=======================================================');
    console.log('🔒 Permanent QR codes are LOCKED & VERIFIED (Lifetime Mode)');
    console.log(`📱 Encoded Permanent Domain: ${config.permanentDomain}`);
    console.log(`🚀 Forwarding Target Server:  ${config.targetServerUrl}`);
    console.log('=======================================================');
  } else {
    try {
      console.log('Generating permanent QR codes for:', config.permanentDomain);
      await generateAllQRCodes(config.permanentDomain);
      if (config.permanentDomain.includes('github.io')) {
        buildGitHubPages(config.targetServerUrl);
      }
      console.log('All 8 permanent QR codes generated and locked.');
    } catch (err) {
      console.warn('Initial QR code generation notice:', err.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🎉 Birthday QR-Code Memory System is Running!`);
    console.log(`📱 Permanent Domain:     ${config.permanentDomain}`);
    console.log(`🚀 Active Server Target: ${BASE_URL}`);
    console.log(`🌐 Home / Poster Preview: http://localhost:${PORT}`);
    console.log(`🔐 Admin Dashboard:      http://localhost:${PORT}/admin`);
    console.log(`🔑 Admin PIN:             ${ADMIN_PIN}`);
    console.log(`💌 Memories 1 - 8:        http://localhost:${PORT}/memory/1`);
    console.log(`=======================================================`);
  });
}

initServer();

