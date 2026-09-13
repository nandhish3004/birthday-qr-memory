// Dreamy particles generator
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

// Retro Taskbar System Clock
function startClock() {
  const clockEl = document.getElementById('trayClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    let hours = now.getHours();
    const mins = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    clockEl.textContent = `${hours}:${mins < 10 ? '0' : ''}${mins} ${ampm}`;
  }

  update();
  setInterval(update, 1000);
}

// Load Memories & Render Chapter Cards
async function loadDesktopMemories() {
  const grid = document.getElementById('chaptersGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/memories');
    const { memories } = await res.json();

    grid.innerHTML = '';

    memories.forEach(mem => {
      const card = document.createElement('a');
      card.href = `/memory/${mem.id}`;
      card.className = 'chapter-tape-card';

      let icon = '🎁';
      let badge = '<span class="badge badge-empty">Surprise 💗</span>';

      if (mem.media_type === 'video') {
        icon = '📺';
        badge = '<span class="badge badge-video">Video 🎬</span>';
      } else if (mem.media_type === 'audio') {
        icon = '📼';
        badge = '<span class="badge badge-audio">Audio 🎵</span>';
      }

      card.innerHTML = `
        <div class="card-tape-icon">${icon}</div>
        <div class="card-chapter-tag">CHAPTER 0${mem.id}</div>
        <div class="card-memory-title">${mem.title || `Memory #${mem.id}`}</div>
        <div class="card-status-badge">${badge}</div>
      `;

      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load memories for desktop:', err);
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initDreamyParticles();
  startClock();

  // Initialize Sarcastic Guru Companion
  if (typeof initSarcasticGuru === 'function') {
    initSarcasticGuru('welcome_showcase');
  }

  loadDesktopMemories();
});
