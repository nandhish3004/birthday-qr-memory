// Ambient background floating hearts generator
function initFloatingHearts() {
  const container = document.getElementById('heartsContainer');
  if (!container) return;
  const hearts = ['💗', '💖', '✨', '🌸', '⭐', '🤍'];

  for (let i = 0; i < 14; i++) {
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

let CURRENT_BASE_URL = window.location.origin;

// Load Data and Initialize Showcase
async function initShowcase() {
  try {
    const [memoriesRes, configRes] = await Promise.all([
      fetch('/api/memories'),
      fetch('/api/config')
    ]);

    const { memories, baseUrl } = await memoriesRes.json();
    const config = await configRes.json();
    CURRENT_BASE_URL = baseUrl || window.location.origin;

    renderInteractiveQRPins(memories);
    renderDirectoryList(memories);
  } catch (err) {
    console.error('Showcase init error:', err);
  }
}

// Render Interactive Scannable QR Pins onto the Poster
function renderInteractiveQRPins(memories) {
  const layer = document.getElementById('qrPinLayer');
  if (!layer || !window.POSTER_PLACEMENTS) return;
  layer.innerHTML = '';

  window.POSTER_PLACEMENTS.forEach(p => {
    const mem = memories.find(m => m.id === p.id) || { id: p.id };
    const pin = document.createElement('a');
    pin.href = `/memory/${p.id}`;
    pin.className = 'qr-interactive-pin';
    pin.title = `Memory #${p.id}: ${mem.title || 'Click to view'}`;

    // Styling based on percentage coordinates
    pin.style.left = `${p.xPct * 100}%`;
    pin.style.top = `${p.yPct * 100}%`;
    pin.style.width = `${p.sizePct * 100}%`;
    pin.style.transform = `rotate(${p.rotation}deg)`;

    const qrSrc = `/assets/qr/${p.id}.png?t=${Date.now()}`;

    pin.innerHTML = `
      <img src="${qrSrc}" alt="QR ${p.id}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>📱</text></svg>'">
      <span class="qr-pin-tag">#${p.id} 💗</span>
    `;

    layer.appendChild(pin);
  });
}

// Render Directory List on the Right
function renderDirectoryList(memories) {
  const list = document.getElementById('directoryList');
  if (!list) return;
  list.innerHTML = '';

  memories.forEach(mem => {
    const item = document.createElement('a');
    item.href = `/memory/${mem.id}`;
    item.className = 'directory-item';

    let badge = `<span class="badge badge-empty">Waiting 💗</span>`;
    if (mem.media_type === 'video') {
      badge = `<span class="badge badge-video">Video 🎬</span>`;
    } else if (mem.media_type === 'audio') {
      badge = `<span class="badge badge-audio">Audio 🎵</span>`;
    }

    item.innerHTML = `
      <div class="item-left">
        <div class="item-num">${mem.id}</div>
        <div class="item-details">
          <h4>${mem.title || `Memory #${mem.id}`}</h4>
          <p>${mem.media_url ? (mem.file_name || 'Assigned Media') : 'A little surprise is waiting here 💗'}</p>
        </div>
      </div>
      <div class="item-right">
        ${badge}
      </div>
    `;

    list.appendChild(item);
  });
}

// Setup High-Res Poster Download
document.addEventListener('DOMContentLoaded', () => {
  initFloatingHearts();
  initShowcase();

  const downloadBtn = document.getElementById('downloadCanvasPosterBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (typeof window.generateAndDownloadCanvasPoster === 'function') {
        window.generateAndDownloadCanvasPoster(CURRENT_BASE_URL);
      }
    });
  }
});
