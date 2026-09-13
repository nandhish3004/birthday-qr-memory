// Toast helper
function showToast(message, duration = 3000) {
  const toast = document.getElementById('adminToast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'block';
  toast.style.position = 'fixed';
  toast.style.bottom = '30px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = '#0f172a';
  toast.style.color = '#ffffff';
  toast.style.padding = '10px 22px';
  toast.style.borderRadius = '999px';
  toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
  toast.style.zIndex = '10001';
  toast.style.fontWeight = '700';
  toast.style.fontSize = '0.9rem';

  setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

// Format bytes
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Check Authentication
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/check');
    const data = await res.json();
    const loginOverlay = document.getElementById('loginOverlay');
    if (data.isAuthenticated) {
      loginOverlay.style.display = 'none';
      loadDashboard();
      if (typeof initSarcasticGuru === 'function') {
        initSarcasticGuru('admin');
      }
    } else {
      loginOverlay.style.display = 'flex';
    }
  } catch (err) {
    console.error('Auth check error:', err);
  }
}

// Handle Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const pin = document.getElementById('pinInput').value.trim();
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('loginOverlay').style.display = 'none';
      loadDashboard();
      if (typeof initSarcasticGuru === 'function') {
        initSarcasticGuru('admin');
      }
      showToast('Welcome to Control Panel! ✨');
    } else {
      errorEl.textContent = data.error || 'Invalid PIN';
    }
  } catch (err) {
    errorEl.textContent = 'Server error during login.';
  }
});

// Handle Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  location.reload();
});

// Load Dashboard Data
async function loadDashboard() {
  try {
    const [memoriesRes, configRes] = await Promise.all([
      fetch('/api/memories'),
      fetch('/api/config')
    ]);

    const memoriesData = await memoriesRes.json();
    const configData = await configRes.json();

    const baseUrlInput = document.getElementById('baseUrlInput');
    if (baseUrlInput && !baseUrlInput.value) {
      baseUrlInput.value = configData.baseUrl || window.location.origin;
    }

    renderMemoriesGrid(memoriesData.memories);
  } catch (err) {
    console.error('Failed to load dashboard:', err);
    showToast('Failed to load memories from server.');
  }
}

// Render Memories Grid (Modern 2026 UI)
function renderMemoriesGrid(memories) {
  const grid = document.getElementById('memoriesGrid');
  grid.innerHTML = '';

  let activeCount = 0;

  memories.forEach(mem => {
    if (mem.media_url) activeCount++;

    const card = document.createElement('div');
    card.className = 'admin-memory-card';
    card.id = `memoryCard-${mem.id}`;

    let statusBadge = `<span class="badge badge-empty">🎁 Surprise</span>`;
    if (mem.media_type === 'video') {
      statusBadge = `<span class="badge badge-video">🎬 Video</span>`;
    } else if (mem.media_type === 'audio') {
      statusBadge = `<span class="badge badge-audio">🎵 Audio</span>`;
    }

    const mediaInfo = mem.media_url ? `
      <div style="font-size:0.78rem; color:var(--text-secondary); background:rgba(255,255,255,0.7); padding:6px 10px; border-radius:8px;">
        <div>📄 <strong>${mem.file_name || 'Uploaded File'}</strong></div>
        <div style="color:var(--text-muted); font-size:0.72rem;">${formatBytes(mem.file_size)} &bull; ${new Date(mem.updated_at).toLocaleDateString()}</div>
      </div>
    ` : `
      <div style="font-size:0.78rem; color:var(--text-muted); font-style:italic;">
        No media uploaded yet &mdash; currently showing "Secret Surprise" state.
      </div>
    `;

    card.innerHTML = `
      <div class="memory-card-top">
        <div class="card-meta-wrap">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="meta-chapter-tag">CHAPTER 0${mem.id}</span>
            ${statusBadge}
          </div>
          <input type="text" class="meta-title-input" id="titleInput-${mem.id}" value="${mem.title || `Memory #${mem.id}`}" placeholder="Memory Title">
          <textarea class="meta-note-input" id="noteInput-${mem.id}" placeholder="Heartfelt birthday message for Shaaaw...">${mem.note || ''}</textarea>
          <button class="btn-secondary" style="align-self:flex-start; font-size:0.78rem; padding:4px 12px;" onclick="saveNote(${mem.id})">Save Details</button>
        </div>
        <div class="card-qr-box" title="100% Mobile Scanner Safe QR (Click to download high-res PNG)">
          <a href="/api/admin/download-qr/${mem.id}" download title="Download Chapter 0${mem.id} QR Code">
            <img class="card-qr-img" src="/api/qr/${mem.id}?t=${Date.now()}" alt="QR ${mem.id}">
          </a>
        </div>
      </div>

      <!-- Modern Upload Dropzone -->
      <div class="admin-dropzone" id="dropzone-${mem.id}" style="background:rgba(255,255,255,0.75); border:1.5px dashed #cbd5e1; border-radius:12px; padding:12px; text-align:center; position:relative; cursor:pointer;">
        <input type="file" id="fileInput-${mem.id}" accept="video/mp4,video/quicktime,video/webm,audio/mp3,audio/mpeg,audio/wav,audio/m4a" style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer;">
        <div style="font-size:1.3rem;">${mem.media_url ? '🔄' : '📤'}</div>
        <div style="font-size:0.84rem; font-weight:700; color:var(--text-primary); margin-top:2px;">${mem.media_url ? 'Replace Media File' : 'Upload Video or Audio'}</div>
        <div style="font-size:0.72rem; color:var(--text-muted);">MP4, MOV, WebM, MP3, WAV (Max 250MB)</div>
      </div>

      ${mediaInfo}

      <!-- Action Toolbar -->
      <div class="card-action-toolbar">
        <button class="btn-primary" style="font-size:0.8rem; padding:6px 14px;" onclick="openPreview(${mem.id})">
          👁️ Preview
        </button>
        <a href="/api/admin/download-qr/${mem.id}" class="btn-secondary" style="font-size:0.8rem; padding:6px 12px;" download>
          📥 Download QR
        </a>
        ${mem.media_url ? `
          <button class="btn-secondary" style="font-size:0.8rem; padding:6px 12px; color:#e11d48; border-color:rgba(225,29,72,0.3);" onclick="deleteMedia(${mem.id})">
            🗑️ Remove
          </button>
        ` : ''}
      </div>
    `;

    grid.appendChild(card);

    // File input listener
    const fileInput = card.querySelector(`#fileInput-${mem.id}`);
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        uploadMedia(mem.id, e.target.files[0]);
      }
    });
  });

  document.getElementById('activeMemoriesCount').textContent = activeCount;
  document.getElementById('emptyMemoriesCount').textContent = 8 - activeCount;
}

// Upload / Replace Media
async function uploadMedia(id, file) {
  const card = document.getElementById(`memoryCard-${id}`);
  const dropzone = card.querySelector(`#dropzone-${id}`);
  dropzone.innerHTML = `<div style="font-size:0.88rem; font-weight:700; color:var(--pastel-crimson);">⏳ Uploading ${file.name}...</div>`;

  const formData = new FormData();
  formData.append('media', file);

  const titleInput = document.getElementById(`titleInput-${id}`);
  const noteInput = document.getElementById(`noteInput-${id}`);
  if (titleInput) formData.append('title', titleInput.value);
  if (noteInput) formData.append('note', noteInput.value);

  try {
    const res = await fetch(`/api/memories/${id}/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Chapter #${id} updated successfully! 💗`);
      loadDashboard();
      if (window.guruInstance) {
        window.guruInstance.speak("✨ Saint Nandhish: Divine upload complete! Shaaaw will cherish this memory.");
      }
    } else {
      showToast(`Upload failed: ${data.error}`);
      loadDashboard();
    }
  } catch (err) {
    console.error(err);
    showToast('Network error while uploading.');
    loadDashboard();
  }
}

// Save Title and Note
async function saveNote(id) {
  const title = document.getElementById(`titleInput-${id}`).value;
  const note = document.getElementById(`noteInput-${id}`).value;

  try {
    const res = await fetch(`/api/memories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, note })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Chapter #${id} saved! ✨`);
    } else {
      showToast('Failed to save.');
    }
  } catch (err) {
    showToast('Network error.');
  }
}

// Delete Media
async function deleteMedia(id) {
  if (!confirm(`Are you sure you want to remove media from Chapter #${id}? It will revert back to "A sweet surprise is being prepared 💗".`)) {
    return;
  }

  try {
    const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`Chapter #${id} media removed.`);
      loadDashboard();
    }
  } catch (err) {
    showToast('Network error deleting media.');
  }
}

// Live Mobile Preview Modal
function openPreview(id) {
  const modal = document.getElementById('previewModal');
  const iframe = document.getElementById('previewIframe');
  const modalTitle = document.getElementById('modalTitle');

  modalTitle.textContent = `Chapter 0${id} Live Preview`;
  iframe.src = `/memory/${id}?preview=true&t=${Date.now()}`;
  modal.style.display = 'flex';
}

document.getElementById('modalCloseBtn').onclick = () => {
  const modal = document.getElementById('previewModal');
  const iframe = document.getElementById('previewIframe');
  iframe.src = '';
  modal.style.display = 'none';
};

// Update Base URL & Regenerate All 8 QRs
document.getElementById('updateBaseUrlBtn').addEventListener('click', async () => {
  const baseUrlInput = document.getElementById('baseUrlInput');
  const baseUrl = baseUrlInput.value.trim();

  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    alert('Please enter a valid URL starting with http:// or https://');
    return;
  }

  const btn = document.getElementById('updateBaseUrlBtn');
  btn.textContent = '⏳ Regenerating 8 QRs...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/admin/set-base-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl })
    });
    const data = await res.json();

    if (data.success) {
      showToast('All 8 QRs regenerated with your Live URL! 📱✨');
      loadDashboard();
      if (window.guruInstance) {
        window.guruInstance.speak("✨ All 8 QR codes regenerated with 100% mobile scanner accuracy!");
      }
    } else {
      showToast(`Error: ${data.error}`);
    }
  } catch (err) {
    showToast('Error updating Base URL.');
  } finally {
    btn.textContent = '⚡ Apply & Regenerate 8 QRs';
    btn.disabled = false;
  }
});

// Download All QRs (ZIP)
document.getElementById('downloadAllQrsBtn').onclick = () => {
  window.location.href = '/api/admin/download-all-qrs';
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});
