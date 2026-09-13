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

// ----------------------
// Configuration & Poster API
// ----------------------

// Get current system configuration
app.get('/api/config', (req, res) => {
  res.json({
    baseUrl: BASE_URL,
    storageType: process.env.STORAGE_TYPE || 'local',
    nodeEnv: process.env.NODE_ENV || 'development',
    placements: QR_PLACEMENTS
  });
});

// Update Base URL
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

// Generate or regenerate QRs & Poster
app.post('/api/admin/generate-poster', requireAdmin, async (req, res) => {
  try {
    const targetBaseUrl = req.body.baseUrl || BASE_URL;
    const qrResults = await generateAllQRCodes(targetBaseUrl);
    const posterResult = await composePoster(targetBaseUrl);
    res.json({
      success: true,
      qrResults,
      posterResult
    });
  } catch (err) {
    console.error('Poster generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Download individual QR code
app.get('/api/admin/download-qr/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const qrPath = path.join(QR_OUTPUT_DIR, `${id}.png`);
  if (!fs.existsSync(qrPath)) {
    return res.status(404).json({ error: 'QR Code not generated yet' });
  }
  res.download(qrPath, `birthday_qr_memory_${id}.png`);
});

// Download composite poster
app.get('/api/admin/download-poster', (req, res) => {
  if (!fs.existsSync(POSTER_OUTPUT)) {
    return res.status(404).json({ error: 'Poster not generated yet. Please generate from the admin dashboard.' });
  }
  res.download(POSTER_OUTPUT, 'birthday_poster_with_scannable_qrs.png');
});

// Download all 8 QR codes as a ZIP
app.get('/api/admin/download-all-qrs', (req, res) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  res.attachment('birthday_memory_qrs_all.zip');

  archive.on('error', (err) => {
    res.status(500).send({ error: err.message });
  });

  archive.pipe(res);

  for (let i = 1; i <= 8; i++) {
    const file = path.join(QR_OUTPUT_DIR, `${i}.png`);
    if (fs.existsSync(file)) {
      archive.file(file, { name: `qr_memory_${i}.png` });
    }
  }

  archive.finalize();
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
