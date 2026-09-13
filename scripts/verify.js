const fs = require('fs');
const path = require('path');
const db = require('../src/db');
const { getMediaType } = require('../src/storage');

async function verifySystem() {
  console.log('🔍 Starting Comprehensive Verification of Birthday QR Memory System...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Verify Database Initialization
  const memories = db.getAllMemories();
  assert(Array.isArray(memories) && memories.length === 8, 'Database initialized with exactly 8 memories');

  // 2. Verify URL Structure & IDs
  for (let i = 1; i <= 8; i++) {
    const mem = db.getMemoryById(i);
    assert(mem && mem.id === i, `Memory #${i} exists with correct ID`);
  }

  // 3. Verify Empty State Default
  const mem1 = db.getMemoryById(1);
  assert(mem1.media_type === null && mem1.media_url === null, 'Memory starts with unassigned media');
  assert(mem1.note.includes('surprise is waiting'), 'Default note is "A little surprise is waiting here 💗"');

  // 4. Verify Media Assignment (Video)
  const videoUpdate = db.updateMemoryMedia(1, {
    media_type: 'video',
    media_url: '/uploads/sample_birthday_clip.mp4',
    mime_type: 'video/mp4',
    file_name: 'sample_birthday_clip.mp4',
    file_size: 15420000,
    title: 'Beach Fun',
    note: 'Remember this day? 🌊'
  });
  assert(videoUpdate.media_type === 'video', 'Successfully assigned video to Memory #1');
  assert(videoUpdate.title === 'Beach Fun', 'Updated title successfully');

  // 5. Verify Media Replacement (Replace with Audio without altering ID/URL)
  const audioUpdate = db.updateMemoryMedia(1, {
    media_type: 'audio',
    media_url: '/uploads/special_song.mp3',
    mime_type: 'audio/mpeg',
    file_name: 'special_song.mp3',
    file_size: 4200000,
    title: 'Favorite Jam',
    note: 'Our official road trip theme!'
  });
  assert(audioUpdate.media_type === 'audio', 'Successfully replaced video with audio');
  assert(audioUpdate.id === 1, 'Memory ID remains unchanged after media replacement');

  // 6. Verify Media Deletion (Reverts to surprise)
  const deleteResult = db.deleteMemoryMedia(1);
  assert(deleteResult.memory.media_type === null && deleteResult.memory.media_url === null, 'Media deleted, memory reverted to placeholder');

  // 7. Verify Media Type Detector
  assert(getMediaType('video/mp4', 'clip.mp4') === 'video', 'Correctly identifies MP4 video');
  assert(getMediaType('video/quicktime', 'clip.mov') === 'video', 'Correctly identifies MOV video');
  assert(getMediaType('audio/mpeg', 'song.mp3') === 'audio', 'Correctly identifies MP3 audio');
  assert(getMediaType('audio/x-m4a', 'voice.m4a') === 'audio', 'Correctly identifies M4A audio');
  assert(getMediaType('application/pdf', 'file.pdf') === null, 'Rejects unsupported files');

  // 8. Verify Required Project Files
  const requiredFiles = [
    'src/server.js',
    'src/db.js',
    'src/storage.js',
    'src/qr-generator.js',
    'src/poster-composer.js',
    'public/index.html',
    'public/memory.html',
    'public/admin.html',
    'public/css/global.css',
    'public/css/memory.css',
    'public/css/admin.css',
    'public/css/index.css',
    'public/js/memory.js',
    'public/js/admin.js',
    'public/js/poster-canvas.js',
    'public/js/index.js'
  ];

  requiredFiles.forEach(f => {
    const full = path.join(__dirname, '..', f);
    assert(fs.existsSync(full), `Required file exists: ${f}`);
  });

  console.log(`\n======================================================`);
  console.log(`Verification Complete: ${passed} passed, ${failed} failed.`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

verifySystem().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
