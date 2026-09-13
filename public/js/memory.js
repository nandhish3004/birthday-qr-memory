// Ambient background floating spores & twinkling stars generator
function initDreamyParticles() {
  const container = document.getElementById('sporesContainer');
  if (!container) return;
  const emojis = ['✨', '⭐', '🌸', '💖', '⚡', '💫'];

  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    const isStar = Math.random() > 0.5;
    p.className = `spore ${isStar ? 'star' : 'bubble'}`;
    if (isStar) {
      p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.fontSize = `${0.8 + Math.random() * 0.8}rem`;
    } else {
      const size = 4 + Math.random() * 8;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
    }
    p.style.left = `${Math.random() * 95}vw`;
    p.style.animationDelay = `${Math.random() * 8}s`;
    p.style.animationDuration = `${7 + Math.random() * 8}s`;
    container.appendChild(p);
  }
}

// Confetti helper
function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 75,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ff2d55', '#ff6b8b', '#ffd166', '#9d4edd', '#06d6a0', '#ffffff']
    });
  }
}

// Extract Memory ID from current path: /memory/:id
function getMemoryIdFromUrl() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const idIndex = parts.indexOf('memory');
  if (idIndex !== -1 && parts[idIndex + 1]) {
    const parsed = parseInt(parts[idIndex + 1], 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 8) {
      return parsed;
    }
  }
  return 1;
}

// Render 1-8 navigation pills
function renderNavPills(currentId) {
  const pillsContainer = document.getElementById('memoryNavPills');
  if (!pillsContainer) return;
  pillsContainer.innerHTML = '';

  for (let i = 1; i <= 8; i++) {
    const pill = document.createElement('a');
    pill.href = `/memory/${i}`;
    pill.className = `memory-pill ${i === currentId ? 'current' : ''}`;
    pill.textContent = i < 10 ? `0${i}` : i;
    pill.title = `Memory #${i}`;
    pillsContainer.appendChild(pill);
  }
}

// Audio Player Controller
function setupAudioPlayer(audioEl, audioUrl) {
  const playBtn = document.getElementById('audioPlayBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const progressBar = document.getElementById('audioProgressBar');
  const progressContainer = document.getElementById('audioProgressContainer');
  const timeDisplay = document.getElementById('audioTime');
  const spoolLeft = document.getElementById('spoolLeft');
  const spoolRight = document.getElementById('spoolRight');

  audioEl.src = audioUrl;

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  playBtn.onclick = () => {
    if (audioEl.paused) {
      audioEl.play();
    } else {
      audioEl.pause();
    }
  };

  audioEl.onplay = () => {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'inline';
    if (spoolLeft) spoolLeft.classList.add('spinning');
    if (spoolRight) spoolRight.classList.add('spinning');

    // Sarcastic Guru Audio Comment
    if (window.guruInstance) {
      window.guruInstance.speakRandom('audio_play');
    }
  };

  audioEl.onpause = () => {
    playIcon.style.display = 'inline';
    pauseIcon.style.display = 'none';
    if (spoolLeft) spoolLeft.classList.remove('spinning');
    if (spoolRight) spoolRight.classList.remove('spinning');
  };

  audioEl.ontimeupdate = () => {
    if (audioEl.duration) {
      const pct = (audioEl.currentTime / audioEl.duration) * 100;
      progressBar.style.width = `${pct}%`;
      timeDisplay.textContent = formatTime(audioEl.currentTime);
    }
  };

  audioEl.onloadedmetadata = () => {
    timeDisplay.textContent = formatTime(audioEl.duration || 0);
  };

  progressContainer.onclick = (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const clickPos = (e.clientX - rect.left) / rect.width;
    if (audioEl.duration) {
      audioEl.currentTime = clickPos * audioEl.duration;
    }
  };
}

// Fetch and display Memory
async function loadMemory() {
  const memoryId = getMemoryIdFromUrl();
  renderNavPills(memoryId);

  const windowTitle = document.getElementById('windowTitle');
  const chapterBadge = document.getElementById('chapterBadge');
  const headerMemoryNum = document.getElementById('headerMemoryNum');

  if (windowTitle) windowTitle.textContent = `Memory_0${memoryId}.exe — Hawkins Media Player`;
  if (chapterBadge) chapterBadge.textContent = `CHAPTER 0${memoryId}`;
  if (headerMemoryNum) headerMemoryNum.textContent = `#${memoryId}`;

  const loadingState = document.getElementById('loadingState');
  const videoState = document.getElementById('videoState');
  const audioState = document.getElementById('audioState');
  const emptyState = document.getElementById('emptyState');

  const memoryTitle = document.getElementById('memoryTitle');
  const memoryNote = document.getElementById('memoryNote');
  const videoEl = document.getElementById('memoryVideo');
  const audioEl = document.getElementById('memoryAudio');

  try {
    const res = await fetch(`/api/memories/${memoryId}`);
    if (!res.ok) throw new Error('Could not fetch memory data');
    const data = await res.json();
    const memory = data.memory;

    // Set title and note
    memoryTitle.textContent = memory.title || `Memory #${memoryId}`;
    memoryNote.textContent = memory.note || "A special moment locked in time forever!";

    // Hide loading
    loadingState.classList.remove('active');

    if (memory.media_type === 'video' && memory.media_url) {
      videoEl.src = memory.media_url;
      videoState.classList.add('active');
      setTimeout(triggerConfetti, 400);

      videoEl.onplay = () => {
        if (window.guruInstance) {
          window.guruInstance.speakRandom('video_play');
        }
      };
    } else if (memory.media_type === 'audio' && memory.media_url) {
      document.getElementById('audioTitle').textContent = memory.file_name || memory.title || "Voice Note";
      setupAudioPlayer(audioEl, memory.media_url);
      audioState.classList.add('active');
      setTimeout(triggerConfetti, 400);
    } else {
      // Empty surprise state
      emptyState.classList.add('active');
      if (window.guruInstance) {
        setTimeout(() => window.guruInstance.speakRandom('unassigned'), 1200);
      }
    }
  } catch (err) {
    console.error(err);
    loadingState.innerHTML = `
      <div style="text-align:center; padding: 20px;">
        <span style="font-size:2.5rem;">⚡</span>
        <p style="color:#ff2d55; font-weight:700; margin-top:8px;">SIGNAL LOST IN THE UPSIDE DOWN</p>
        <button class="btn-secondary" style="margin-top:10px;" onclick="location.reload()">Retry Connection</button>
      </div>
    `;
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initDreamyParticles();

  // Initialize Sarcastic Guru Companion
  if (typeof initSarcasticGuru === 'function') {
    initSarcasticGuru('welcome_memory');
  }

  loadMemory();

  // Celebrate button
  const celebrateBtn = document.getElementById('celebrateBtn');
  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', () => {
      triggerConfetti();
    });
  }

  // Surprise box interactive click
  const surpriseBox = document.getElementById('surpriseBox');
  if (surpriseBox) {
    surpriseBox.addEventListener('click', () => {
      triggerConfetti();
      if (window.guruInstance) {
        window.guruInstance.speak("💗 Shh, Shaaaw! No snooping around! Your surprise is coming very soon!");
      }
    });
  }
});
