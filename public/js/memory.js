// Ambient background floating spores & twinkling stars generator
function initDreamyParticles() {
  const container = document.getElementById('sporesContainer');
  if (!container) return;
  const emojis = ['✨', '⭐', '🌸', '💖', '⚡', '💫'];

  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    const isStar = Math.random() > 0.45;
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
      particleCount: 80,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#f43f5e', '#ff758f', '#fbbf24', '#c084fc', '#38bdf8']
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

// Render 1-8 modern navigation chips
function renderNavPills(currentId) {
  const pillsContainer = document.getElementById('memoryNavPills');
  if (!pillsContainer) return;
  pillsContainer.innerHTML = '';

  for (let i = 1; i <= 8; i++) {
    const pill = document.createElement('a');
    pill.href = `/memory/${i}`;
    pill.className = `nav-chapter-chip ${i === currentId ? 'active' : ''}`;
    pill.innerHTML = `<span>Chapter 0${i}</span>`;
    pill.title = `Memory #${i}`;
    pillsContainer.appendChild(pill);
  }
}

// Modern Audio Streaming Controller
function setupAudioPlayer(audioEl, audioUrl) {
  const playBtn = document.getElementById('audioPlayBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const progressBar = document.getElementById('audioProgressBar');
  const progressContainer = document.getElementById('audioProgressContainer');
  const timeCurrent = document.getElementById('audioTimeCurrent');
  const timeTotal = document.getElementById('audioTimeTotal');
  const vinylDisc = document.getElementById('vinylDisc');
  const waveformViz = document.getElementById('waveformViz');
  const rewindBtn = document.getElementById('audioRewind10');
  const forwardBtn = document.getElementById('audioForward10');

  audioEl.src = audioUrl;

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Play / Pause Toggle
  playBtn.onclick = () => {
    if (audioEl.paused) {
      audioEl.play().catch(e => console.warn('Audio play request:', e));
    } else {
      audioEl.pause();
    }
  };

  // Rewind 10s
  if (rewindBtn) {
    rewindBtn.onclick = () => {
      audioEl.currentTime = Math.max(0, audioEl.currentTime - 10);
    };
  }

  // Forward 10s
  if (forwardBtn) {
    forwardBtn.onclick = () => {
      if (audioEl.duration) {
        audioEl.currentTime = Math.min(audioEl.duration, audioEl.currentTime + 10);
      }
    };
  }

  audioEl.onplay = () => {
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'inline';
    if (vinylDisc) vinylDisc.classList.add('playing');
    if (waveformViz) waveformViz.classList.add('playing');

    if (window.guruInstance) {
      window.guruInstance.speakRandom('audio_play');
    }
  };

  audioEl.onpause = () => {
    if (playIcon) playIcon.style.display = 'inline';
    if (pauseIcon) pauseIcon.style.display = 'none';
    if (vinylDisc) vinylDisc.classList.remove('playing');
    if (waveformViz) waveformViz.classList.remove('playing');
  };

  audioEl.ontimeupdate = () => {
    if (audioEl.duration) {
      const pct = (audioEl.currentTime / audioEl.duration) * 100;
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (timeCurrent) timeCurrent.textContent = formatTime(audioEl.currentTime);
    }
  };

  audioEl.onloadedmetadata = () => {
    if (timeTotal) timeTotal.textContent = formatTime(audioEl.duration || 0);
  };

  if (progressContainer) {
    progressContainer.onclick = (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const clickPos = (e.clientX - rect.left) / rect.width;
      if (audioEl.duration) {
        audioEl.currentTime = clickPos * audioEl.duration;
      }
    };
  }
}

// Fetch and display Memory
async function loadMemory() {
  const memoryId = getMemoryIdFromUrl();
  renderNavPills(memoryId);

  const chapterBadge = document.getElementById('chapterBadge');
  const statusBadge = document.getElementById('statusBadge');
  if (chapterBadge) chapterBadge.textContent = `CHAPTER 0${memoryId}`;

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
    if (memoryTitle) memoryTitle.textContent = memory.title || `Memory #${memoryId}`;
    if (memoryNote) memoryNote.textContent = memory.note || "A special moment locked in time forever for Shaaaw!";

    // Hide loading
    loadingState.classList.remove('active');

    if (memory.media_type === 'video' && memory.media_url) {
      videoEl.src = memory.media_url;
      videoState.classList.add('active');
      if (statusBadge) {
        statusBadge.className = 'badge badge-video';
        statusBadge.textContent = '🎬 Video Stream';
      }
      setTimeout(triggerConfetti, 400);

      videoEl.onplay = () => {
        if (window.guruInstance) {
          window.guruInstance.speakRandom('video_play');
        }
      };
    } else if (memory.media_type === 'audio' && memory.media_url) {
      const audioTitle = document.getElementById('audioTrackTitle');
      if (audioTitle) {
        audioTitle.textContent = memory.title || memory.file_name || "Audio Recording";
      }
      setupAudioPlayer(audioEl, memory.media_url);
      audioState.classList.add('active');
      if (statusBadge) {
        statusBadge.className = 'badge badge-audio';
        statusBadge.textContent = '🎵 Audio Track';
      }
      setTimeout(triggerConfetti, 400);
    } else {
      // Empty surprise state
      emptyState.classList.add('active');
      if (statusBadge) {
        statusBadge.className = 'badge badge-empty';
        statusBadge.textContent = '🎁 Secret Surprise';
      }
      if (window.guruInstance) {
        setTimeout(() => window.guruInstance.speakRandom('unassigned'), 1000);
      }
    }
  } catch (err) {
    console.error(err);
    loadingState.innerHTML = `
      <div style="text-align:center; padding: 30px 10px;">
        <span style="font-size:2.5rem;">✨</span>
        <p style="color:#e11d48; font-weight:700; margin-top:8px;">Memory Signal Initializing...</p>
        <button class="btn-secondary" style="margin-top:12px;" onclick="location.reload()">Reload Memory</button>
      </div>
    `;
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initDreamyParticles();

  // Initialize Sarcastic Guru & Stranger Things Cast Companion
  if (typeof initSarcasticGuru === 'function') {
    initSarcasticGuru('welcome_memory');
  }

  loadMemory();

  // Celebrate button
  const celebrateBtn = document.getElementById('celebrateBtn');
  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', () => {
      triggerConfetti();
      if (window.guruInstance) {
        window.guruInstance.speakCharacter('saint');
      }
    });
  }

  // Surprise box interactive click
  const surpriseBox = document.getElementById('surpriseBox');
  if (surpriseBox) {
    surpriseBox.addEventListener('click', () => {
      triggerConfetti();
      if (window.guruInstance) {
        window.guruInstance.speak("✨ Shhh, Shaaaw! A top-secret birthday surprise is in the works! Stay tuned!");
      }
    });
  }
});
