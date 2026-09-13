const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Allowed MIME types
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
  'video/x-matroska'
];

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/aac',
  'audio/mp4',
  'audio/x-m4a',
  'audio/ogg'
];

// Determine media type
function getMediaType(mimeType, filename) {
  if (ALLOWED_VIDEO_TYPES.includes(mimeType) || /\.(mp4|mov|webm|m4v|mkv)$/i.test(filename)) {
    return 'video';
  }
  if (ALLOWED_AUDIO_TYPES.includes(mimeType) || /\.(mp3|wav|m4a|aac|ogg)$/i.test(filename)) {
    return 'audio';
  }
  return null;
}

// Multer Disk Storage setup
const storageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const memoryId = req.params.id || 'unknown';
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    cb(null, `memory_${memoryId}_${timestamp}_${cleanBase}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const type = getMediaType(file.mimetype, file.originalname);
  if (!type) {
    return cb(new Error('Invalid file format. Please upload an MP4, MOV, WebM video or MP3, WAV, M4A audio file.'));
  }
  cb(null, true);
};

const upload = multer({
  storage: storageEngine,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB max limit
  }
});

// Delete a local file safely
function deleteLocalFile(fileUrl) {
  if (!fileUrl) return;
  try {
    const filename = path.basename(fileUrl);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old media file: ${filePath}`);
    }
  } catch (err) {
    console.warn(`Could not delete file ${fileUrl}:`, err.message);
  }
}

module.exports = {
  upload,
  getMediaType,
  deleteLocalFile,
  UPLOADS_DIR
};
