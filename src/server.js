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
  const uploadedPoster = "C:\\Users\\Nandheesaprasad\\.gemini\\antigravity-ide\\brain\\e6a1bd95-2328-4114-a602-d70aeb13f4f0\\.user_uploaded\\media_1789313085861.jpg";
  if (fs.existsSync(localPoster)) {
    return res.sendFile(localPoster);
  }
  if (fs.existsSync(uploadedPoster)) {
    return res.sendFile(uploadedPoster);
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

// Helper to determine effective public base URL
function getEffectiveBaseUrl(req) {
  if (BASE_URL && !BASE_URL.includes('localhost')) {
    return BASE_URL.replace(/\/+$/, '');
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, '');
  }
  if (req) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    if (host && !host.includes('localhost')) {
      return `${proto}://${host}`.replace(/\/+$/, '');
    }
  }
  return BASE_URL.replace(/\/+$/, '');
}

// ----------------------
// Configuration & Poster API
// ----------------------

// Get current system configuration
app.get('/api/config', (req, res) => {
  const currentBase = getEffectiveBaseUrl(req);
  res.json({
    baseUrl: currentBase,
    storageType: process.env.STORAGE_TYPE || 'local',
    nodeEnv: process.env.NODE_ENV || 'development',
    placements: QR_PLACEMENTS
  });
});

// Update Base URL manually
app.post('/api/admin/set-base-url', requireAdmin, async (req, res) => {
  const { baseUrl } = req.body;
  if (!baseUrl || !baseUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Valid URL starting with http:// or https:// is required' });
  }

  BASE_URL = baseUrl.replace(/\/+$/, '');
  try {
    await generateAllQRCodes(BASE_URL);
    await composePoster(BASE_URL);
    res.json({ success: true, baseUrl: BASE_URL, message: 'Base URL updated, QRs and poster regenerated!' });
  } catch (err) {
    console.warn('Poster generation error during base URL update:', err.message);
    res.json({ success: true, baseUrl: BASE_URL, warning: err.message });
  }
});

// Dynamic live QR code thumbnail endpoint
app.get('/api/qr/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const domain = getEffectiveBaseUrl(req);
    const targetUrl = `${domain}/memory/${id}`;
    const QRCode = require('qrcode');

    const buffer = await QRCode.toBuffer(targetUrl, {
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 600,
      color: { dark: '#000000', light: '#ffffff' }
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Error generating QR');
  }
});

// Download individual QR code (Generated live on the fly with the exact current domain)
app.get('/api/admin/download-qr/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const domain = getEffectiveBaseUrl(req);
    const targetUrl = `${domain}/memory/${id}`;
    const QRCode = require('qrcode');

    const qrBuffer = await QRCode.toBuffer(targetUrl, {
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 1400,
      color: { dark: '#000000', light: '#ffffff' }
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="shaaaw_qr_memory_${id}.png"`);
    res.send(qrBuffer);
  } catch (err) {
    console.error('Error generating download QR:', err);
    res.status(500).json({ error: err.message });
  }
});

// Download all 8 QR codes as a ZIP (Generated live on the fly with the exact current domain)
app.get('/api/admin/download-all-qrs', async (req, res) => {
  try {
    const domain = getEffectiveBaseUrl(req);
    const QRCode = require('qrcode');
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.attachment('shaaaw_birthday_all_8_qrs.zip');

    archive.on('error', (err) => {
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    for (let i = 1; i <= 8; i++) {
      const targetUrl = `${domain}/memory/${i}`;
      const buffer = await QRCode.toBuffer(targetUrl, {
        errorCorrectionLevel: 'H',
        margin: 4,
        width: 1400,
        color: { dark: '#000000', light: '#ffffff' }
      });
      archive.append(buffer, { name: `qr_memory_${i}.png` });
    }

    archive.finalize();
  } catch (err) {
    console.error('ZIP generation error:', err);
    res.status(500).send({ error: err.message });
  }
});

// Printable Sheet: Renders a print-ready A4 grid with all 8 QR codes, titles, and cutting lines
app.get('/admin/printable-sheet', async (req, res) => {
  try {
    const domain = getEffectiveBaseUrl(req);
    const QRCode = require('qrcode');
    const memories = db.getAllMemories();

    const qrCards = [];
    for (const mem of memories) {
      const targetUrl = `${domain}/memory/${mem.id}`;
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        errorCorrectionLevel: 'H',
        margin: 4,
        width: 600,
        color: { dark: '#000000', light: '#ffffff' }
      });
      qrCards.push({
        id: mem.id,
        title: mem.title || `Memory #${mem.id}`,
        type: mem.media_type,
        url: targetUrl,
        qrDataUrl: dataUrl
      });
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Printable QR Cards for Shaaaw's Birthday (Chapters 1 - 8)</title>
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
      <p>Domain: <strong>${domain}</strong> &bull; Error Correction: High (30%) &bull; Margin: 4 (100% Mobile Scanner Safe)</p>
    </div>
    <button class="print-btn" onclick="window.print()">Print Cards (Ctrl + P)</button>
  </div>
  <div class="cards-grid">
    ${qrCards.map(c => `
      <div class="qr-card-item">
        <img class="qr-img" src="${c.qrDataUrl}" alt="Chapter ${c.id} QR">
        <div class="qr-info">
          <span class="chapter-tag">CHAPTER 0${c.id}</span>
          <h3 class="card-title">${c.title}</h3>
          <p class="card-meta">Media: ${c.type === 'empty' ? 'Secret Surprise' : c.type.toUpperCase()}</p>
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
  try {
    console.log('Generating initial QR codes for Base URL:', BASE_URL);
    await generateAllQRCodes(BASE_URL);
    console.log('All 8 QR codes ready.');
  } catch (err) {
    console.warn('Initial QR code generation notice:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🎉 Birthday QR-Code Memory System is Running!`);
    console.log(`📱 Base URL: ${BASE_URL}`);
    console.log(`🌐 Home / Poster Preview: http://localhost:${PORT}`);
    console.log(`🔐 Admin Dashboard:      http://localhost:${PORT}/admin`);
    console.log(`🔑 Admin PIN:             ${ADMIN_PIN}`);
    console.log(`💌 Memories 1 - 8:        http://localhost:${PORT}/memory/1`);
    console.log(`=======================================================`);
  });
}

initServer();
