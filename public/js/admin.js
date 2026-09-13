// Toast helper
function showToast(message, duration = 3000) {
  const toast = document.getElementById('adminToast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'block';
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
      showToast('Welcome to Hawkins Control Panel! ⚡');
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

// Render Memories Grid
function renderMemoriesGrid(memories) {
  const grid = document.getElementById('memoriesGrid');
  grid.innerHTML = '';

  let activeCount = 0;

  memories.forEach(mem => {
    if (mem.media_url) activeCount++;

    const card = document.createElement('div');
    card.className = 'admin-memory-card';
    card.id = `memoryCard-${mem.id}`;

    let statusBadge = `<span class="badge badge-empty">Surprise 💗</span>`;
    let typeIcon = '🎁';
    if (mem.media_type === 'video') {
      statusBadge = `<span class="badge badge-video">Video 🎬</span>`;
      typeIcon = '📺';
    } else if (mem.media_type === 'audio') {
      statusBadge = `<span class="badge badge-audio">Audio 🎵</span>`;
      typeIcon = '📼';
    }

    const mediaInfo = mem.media_url ? `
      <div class="card-media-meta">
        <div class="media-name">📄 ${mem.file_name || 'Uploaded Media'}</div>
        <div class="media-size">${formatBytes(mem.file_size)} • ${new Date(mem.updated_at).toLocaleDateString()}</div>
      </div>
    ` : `
      <div class="card-media-meta" style="color:#ffccd5;">
        <em>Status: "A little surprise is waiting here 💗"</em>
      </div>
    `;

    card.innerHTML = `
      <div class="card-win-titlebar">
        <span class="card-title-text">${typeIcon} Chapter_0${mem.id}.dat</span>
        ${statusBadge}
      </div>

      <div class="card-win-body">
        <div class="qr-card-top-row">
          <div>
            <div style="font-weight:700; font-size:0.95rem; color:#fff;">QR #${mem.id}</div>
            <div style="font-size:0.75rem; color:#ffd166;">Target: /memory/${mem.id}</div>
          </div>
          <div class="card-qr-thumb" title="Click to download individual QR for physical card">
            <a href="/api/admin/download-qr/${mem.id}" download title="Download QR #${mem.id}">
              <img src="/assets/qr/${mem.id}.png?t=${Date.now()}" alt="QR ${mem.id}">
            </a>
          </div>
        </div>

        <!-- Upload Dropzone -->
        <div class="admin-dropzone" id="dropzone-${mem.id}">
          <input type="file" id="fileInput-${mem.id}" accept="video/mp4,video/quicktime,video/webm,audio/mp3,audio/mpeg,audio/wav,audio/m4a">
          <div class="dz-icon">${mem.media_url ? '🔄' : '📤'}</div>
          <div class="dz-title">${mem.media_url ? 'Replace Video / Audio' : 'Upload Video or Audio'}</div>
          <div class="dz-sub">Drag & drop MP4, MOV, WebM, MP3, WAV, M4A</div>
        </div>

        ${mediaInfo}

        <!-- Inputs for Title & Note -->
        <div class="card-input-group">
          <input type="text" id="titleInput-${mem.id}" value="${mem.title || `Memory #${mem.id}`}" placeholder="Memory Title">
          <textarea id="noteInput-${mem.id}" placeholder="Heartfelt birthday message...">${mem.note || ''}</textarea>
          <button class="btn-secondary btn-xs" onclick="saveNote(${mem.id})">Save Message</button>
        </div>

        <!-- Action Buttons -->
        <div class="card-btn-row">
          <button class="btn-primary btn-xs" onclick="openPreview(${mem.id})">
            👁️ Preview
          </button>
          <a href="/api/admin/download-qr/${mem.id}" class="btn-secondary btn-xs" download>
            📥 Download QR
          </a>
          ${mem.media_url ? `
            <button class="btn-xs btn-delete" onclick="deleteMedia(${mem.id})">
              🗑️ Delete
            </button>
          ` : ''}
        </div>
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
  dropzone.innerHTML = `<div class="dz-title">⏳ Uploading ${file.name}...</div>`;

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
        window.guruInstance.speak("Divine upload successful! Shaaaw is going to love this chapter.");
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
      showToast(`Chapter #${id} message saved! ✨`);
    } else {
      showToast('Failed to save message.');
    }
  } catch (err) {
    showToast('Network error.');
  }
}

// Delete Media
async function deleteMedia(id) {
  if (!confirm(`Are you sure you want to remove media from Chapter #${id}? It will revert back to "A little surprise is waiting here 💗".`)) {
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

  modalTitle.textContent = `Memory_0${id}_Mobile_Preview.exe`;
  iframe.src = `/memory/${id}?preview=true&t=${Date.now()}`;
  modal.classList.add('active');
}

document.getElementById('modalCloseBtn').onclick = () => {
  const modal = document.getElementById('previewModal');
  const iframe = document.getElementById('previewIframe');
  iframe.src = '';
  modal.classList.remove('active');
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
        window.guruInstance.speak("QRs regenerated! Now download them and print them onto Shaaaw's physical card!");
      }
    } else {
      showToast(`Error: ${data.error}`);
    }
  } catch (err) {
    showToast('Error updating Base URL.');
  } finally {
    btn.textContent = '⚡ Apply URL & Regenerate 8 QRs';
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
