const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'memories.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial 8 memories state
const DEFAULT_MEMORIES = [
  { id: 1, title: "Memory #1", media_type: null, media_url: null, mime_type: null, file_name: null, file_size: 0, note: "A little surprise is waiting here 💗", updated_at: new Date().toISOString() },
  { id: 2, title: "Memory #2", media_type: null, media_url: null, mime_type: null, file_name: null, file_size: 0, note: "A little surprise is waiting here 💗", updated_at: new Date().toISOString() },
  { id: 3, title: "Memory #3", media_type: null, media_url: null, mime_type: null, file_name: null, file_size: 0, note: "A little surprise is waiting here 💗", updated_at: new Date().toISOString() },
  { id: 4, title: "Memory #4", media_type: null, media_url: null, mime_type: null, file_name: null, file_size: 0, note: "A little surprise is waiting here 💗", updated_at: new Date().toISOString() },
  { id: 5, title: "Memory #5", media_type: null, media_url: null, mime_type: null, file_name: null, file_size: 0, note: "A little surprise is waiting here 💗", updated_at: new Date().toISOString() },
  { id: 6, title: "Memory #6", media_type: null, media_url: null, mime_type: null, file_name: null, file_size: 0, note: "A little surprise is waiting here 💗", updated_at: new Date().toISOString() },
  { id: 7, title: "Memory #7", media_type: null, media_url: null, mime_type: null, file_name: null, file_size: 0, note: "A little surprise is waiting here 💗", updated_at: new Date().toISOString() },
  { id: 8, title: "Memory #8", media_type: null, media_url: null, mime_type: null, file_name: null, file_size: 0, note: "A little surprise is waiting here 💗", updated_at: new Date().toISOString() },
];

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDB(DEFAULT_MEMORIES);
      return DEFAULT_MEMORIES;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 8) {
      writeDB(DEFAULT_MEMORIES);
      return DEFAULT_MEMORIES;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading memories DB, re-initializing:', err.message);
    writeDB(DEFAULT_MEMORIES);
    return DEFAULT_MEMORIES;
  }
}

function writeDB(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing memories DB:', err.message);
    throw err;
  }
}

// Public DB API
const db = {
  getAllMemories() {
    return readDB();
  },

  getMemoryById(id) {
    const numId = parseInt(id, 10);
    const memories = readDB();
    return memories.find(m => m.id === numId) || null;
  },

  updateMemoryMedia(id, { media_type, media_url, mime_type, file_name, file_size, note, title }) {
    const numId = parseInt(id, 10);
    const memories = readDB();
    const index = memories.findIndex(m => m.id === numId);
    if (index === -1) return null;

    memories[index] = {
      ...memories[index],
      media_type,
      media_url,
      mime_type,
      file_name: file_name || memories[index].file_name,
      file_size: file_size !== undefined ? file_size : memories[index].file_size,
      note: note !== undefined ? note : memories[index].note,
      title: title || memories[index].title,
      updated_at: new Date().toISOString()
    };

    writeDB(memories);
    return memories[index];
  },

  updateMemoryDetails(id, { title, note }) {
    const numId = parseInt(id, 10);
    const memories = readDB();
    const index = memories.findIndex(m => m.id === numId);
    if (index === -1) return null;

    if (title !== undefined) memories[index].title = title;
    if (note !== undefined) memories[index].note = note;
    memories[index].updated_at = new Date().toISOString();

    writeDB(memories);
    return memories[index];
  },

  deleteMemoryMedia(id) {
    const numId = parseInt(id, 10);
    const memories = readDB();
    const index = memories.findIndex(m => m.id === numId);
    if (index === -1) return null;

    const oldMediaUrl = memories[index].media_url;

    memories[index] = {
      ...memories[index],
      media_type: null,
      media_url: null,
      mime_type: null,
      file_name: null,
      file_size: 0,
      updated_at: new Date().toISOString()
    };

    writeDB(memories);
    return { memory: memories[index], oldMediaUrl };
  }
};

module.exports = db;
