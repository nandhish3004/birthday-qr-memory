// Ambient particles generator
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

// Confetti Trigger
function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 85,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#f43f5e', '#ff758f', '#fbbf24', '#c084fc', '#38bdf8']
    });
  }
}

// Load Memories & Render Modern Chapter Cards
async function loadModernMemories() {
  const grid = document.getElementById('chaptersGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/memories');
    const { memories } = await res.json();

    grid.innerHTML = '';

    memories.forEach(mem => {
      const card = document.createElement('a');
      card.href = `/memory/${mem.id}`;
      card.className = 'modern-chapter-card';

      let typeBadge = '<span class="badge badge-empty">🎁 Classified Surprise</span>';
      if (mem.media_type === 'video') {
        typeBadge = '<span class="badge badge-video">🎬 Video Reel</span>';
      } else if (mem.media_type === 'audio') {
        typeBadge = '<span class="badge badge-audio">🎵 Audio Tape</span>';
      }

      const notePreview = mem.note || "A special birthday tape locked inside the Hawkins archive.";

      card.innerHTML = `
        <div class="card-top-tags">
          <span class="card-chapter-num">TAPE 0${mem.id}</span>
          ${typeBadge}
        </div>
        <div class="card-content-block">
          <h3 class="card-title-text">${mem.title || `Tape #${mem.id}`}</h3>
          <p class="card-snippet-text">${notePreview}</p>
        </div>
        <div class="card-footer-action">
          <span class="action-open-label">Play Tape →</span>
        </div>
      `;

      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load memories for home portal:', err);
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initDreamyParticles();

  // Initialize Sarcastic Guru Companion with Hawkins Cast
  if (typeof initSarcasticGuru === 'function') {
    initSarcasticGuru('welcome_showcase');
  }

  loadModernMemories();
});
