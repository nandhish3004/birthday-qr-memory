// Ambient background floating hearts generator
function initFloatingHearts() {
  const container = document.getElementById('heartsContainer');
  if (!container) return;
  const hearts = ['💗', '💖', '✨', '🌸', '⭐', '🤍'];

  for (let i = 0; i < 15; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerText = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = `${Math.random() * 95}vw`;
    heart.style.animationDelay = `${Math.random() * 8}s`;
    heart.style.animationDuration = `${8 + Math.random() * 8}s`;
    heart.style.fontSize = `${1 + Math.random() * 1}rem`;
    container.appendChild(heart);
  }
}

// Confetti burst helper
function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff758f', '#ffb3c1', '#ffd166', '#c9184a', '#ffffff']
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
  return 1; // Default to 1
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
    pill.textContent = i;
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
  const vinyl = document.getElementById('vinylWrapper');
  const soundWave = document.getElementById('soundWave');

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
    pauseIcon.style.display = 'block';
    vinyl.classList.add('spinning');
    soundWave.classList.add('playing');
  };

  audioEl.onpause = () => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    vinyl.classList.remove('spinning');
    soundWave.classList.remove('playing');
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

  document.getElementById('memoryNumberBadge').textContent = `Memory #${memoryId}`;

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
    memoryNote.textContent = memory.note || "A little surprise is waiting here 💗";

    // Hide loading
    loadingState.classList.remove('active');

    if (memory.media_type === 'video' && memory.media_url) {
      videoEl.src = memory.media_url;
      videoState.classList.add('active');
      setTimeout(triggerConfetti, 400);
    } else if (memory.media_type === 'audio' && memory.media_url) {
      document.getElementById('audioTitle').textContent = memory.file_name || memory.title || "Voice Note";
      setupAudioPlayer(audioEl, memory.media_url);
      audioState.classList.add('active');
      setTimeout(triggerConfetti, 400);
    } else {
      // Empty / placeholder state
      emptyState.classList.add('active');
    }
  } catch (err) {
    console.error(err);
    loadingState.innerHTML = `
      <div style="text-align:center; padding: 20px;">
        <span style="font-size:2.5rem;">💌</span>
        <p style="color:#c9184a; font-weight:600; margin-top:8px;">Unable to load memory</p>
        <button class="btn-secondary" style="margin-top:10px;" onclick="location.reload()">Try Again</button>
      </div>
    `;
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initFloatingHearts();
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
      const desc = surpriseBox.querySelector('.surprise-description');
      if (desc) {
        desc.textContent = "💗 Shh... something magical is coming very soon!";
      }
    });
  }
});
