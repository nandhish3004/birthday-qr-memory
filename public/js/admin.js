// Toast Notification helper
function showToast(message, duration = 3000) {
  const toast = document.getElementById('adminToast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

// Format bytes helper
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
      showToast('Welcome back, Admin! 🎂');
    } else {
      errorEl.textContent = data.error || 'Invalid PIN';
    }
  } catch (err) {
    errorEl.textContent = 'Server error during login. Please try again.';
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

    // Populate Base URL
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
    card.className = 'memory-admin-card';
    card.id = `memoryCard-${mem.id}`;

    let statusBadge = `<span class="badge badge-empty">No Media 💗</span>`;
    if (mem.media_type === 'video') {
      statusBadge = `<span class="badge badge-video">Video 🎬</span>`;
    } else if (mem.media_type === 'audio') {
      statusBadge = `<span class="badge badge-audio">Audio 🎵</span>`;
    }

    const mediaInfo = mem.media_url ? `
      <div class="media-info-box">
        <div class="media-filename">📄 ${mem.file_name || 'Uploaded Media'}</div>
        <div class="media-meta">${formatBytes(mem.file_size)} • ${new Date(mem.updated_at).toLocaleDateString()}</div>
      </div>
    ` : `
      <div class="media-info-box" style="background:#fff5f7; color:#8c4a60;">
        <em>Placeholder active: "A little surprise is waiting here 💗"</em>
      </div>
    `;

    card.innerHTML = `
      <div class="card-top">
        <div class="card-title-group">
          <span class="card-qr-number">QR #${mem.id}</span>
          ${statusBadge}
        </div>
        <div class="qr-thumb-wrapper" title="Click to view full QR">
          <img src="/assets/qr/${mem.id}.png?t=${Date.now()}" alt="QR ${mem.id}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>📱</text></svg>'">
        </div>
      </div>

      <!-- Upload / Replace Dropzone -->
      <div class="upload-dropzone" id="dropzone-${mem.id}">
        <input type="file" id="fileInput-${mem.id}" accept="video/mp4,video/quicktime,video/webm,audio/mp3,audio/mpeg,audio/wav,audio/m4a">
        <div class="dropzone-icon">${mem.media_url ? '🔄' : '📤'}</div>
        <div class="dropzone-text">${mem.media_url ? 'Replace Video / Audio' : 'Upload Video or Audio'}</div>
        <div class="dropzone-hint">Drag & drop or tap to select (MP4, MOV, WebM, MP3, WAV, M4A)</div>
      </div>

      ${mediaInfo}

      <!-- Editable Title & Note -->
      <div class="card-inputs">
        <input type="text" id="titleInput-${mem.id}" value="${mem.title || `Memory #${mem.id}`}" placeholder="Memory Title">
        <textarea id="noteInput-${mem.id}" placeholder="Heartfelt birthday message...">${mem.note || ''}</textarea>
        <button class="btn-secondary btn-sm" onclick="saveNote(${mem.id})">Save Title & Note</button>
      </div>

      <!-- Card Action Buttons -->
      <div class="card-actions">
        <button class="btn-primary btn-sm" onclick="openPreview(${mem.id})">
          👁️ Preview
        </button>
        <a href="/api/admin/download-qr/${mem.id}" class="btn-secondary btn-sm" download>
          📱 Download QR
        </a>
        ${mem.media_url ? `
          <button class="btn-sm btn-danger" onclick="deleteMedia(${mem.id})">
            🗑️ Delete
          </button>
        ` : ''}
      </div>
    `;

    grid.appendChild(card);

    // Setup file change event for this memory card
    const fileInput = card.querySelector(`#fileInput-${mem.id}`);
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        uploadMedia(mem.id, e.target.files[0]);
      }
    });
  });

  // Update Stats Counters
  document.getElementById('activeMemoriesCount').textContent = activeCount;
  document.getElementById('emptyMemoriesCount').textContent = 8 - activeCount;
}

// Upload / Replace Media
async function uploadMedia(id, file) {
  const card = document.getElementById(`memoryCard-${id}`);
  const dropzone = card.querySelector(`#dropzone-${id}`);
  dropzone.innerHTML = `<div class="dropzone-text">⏳ Uploading ${file.name}...</div>`;

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
      showToast(`Memory #${id} media successfully updated! 💗`);
      loadDashboard();
    } else {
      showToast(`Upload failed: ${data.error}`);
      loadDashboard();
    }
  } catch (err) {
    console.error(err);
    showToast('Network error while uploading file.');
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
      showToast(`Memory #${id} notes saved! ✨`);
    } else {
      showToast('Failed to save notes.');
    }
  } catch (err) {
    showToast('Network error saving notes.');
  }
}

// Delete Media (Reverts to surprise placeholder)
async function deleteMedia(id) {
  if (!confirm(`Are you sure you want to remove the media for Memory #${id}? It will revert back to "A little surprise is waiting here 💗".`)) {
    return;
  }

  try {
    const res = await fetch(`/api/memories/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Memory #${id} media deleted.`);
      loadDashboard();
    } else {
      showToast('Failed to delete media.');
    }
  } catch (err) {
    showToast('Network error deleting media.');
  }
}

// Open Live Mobile Preview Modal
function openPreview(id) {
  const modal = document.getElementById('previewModal');
  const iframe = document.getElementById('previewIframe');
  const modalTitle = document.getElementById('modalTitle');

  modalTitle.textContent = `Memory #${id} Live Mobile View`;
  iframe.src = `/memory/${id}?preview=true&t=${Date.now()}`;
  modal.classList.add('active');
}

// Close Live Preview Modal
document.getElementById('modalCloseBtn').onclick = () => {
  const modal = document.getElementById('previewModal');
  const iframe = document.getElementById('previewIframe');
  iframe.src = '';
  modal.classList.remove('active');
};

// Update Base URL & Regenerate
document.getElementById('updateBaseUrlBtn').addEventListener('click', async () => {
  const baseUrlInput = document.getElementById('baseUrlInput');
  const baseUrl = baseUrlInput.value.trim();

  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    alert('Please enter a valid URL starting with http:// or https://');
    return;
  }

  const btn = document.getElementById('updateBaseUrlBtn');
  btn.textContent = '⏳ Regenerating QRs & Poster...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/admin/set-base-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl })
    });
    const data = await res.json();

    if (data.success) {
      showToast('QRs & Poster regenerated successfully with new Base URL! 🌟');
      loadDashboard();
    } else {
      showToast(`Error: ${data.error}`);
    }
  } catch (err) {
    showToast('Error updating Base URL.');
  } finally {
    btn.textContent = 'Update & Regenerate QRs + Poster';
    btn.disabled = false;
  }
});

// Poster Preview Modal
document.getElementById('previewPosterBtn').addEventListener('click', () => {
  const modal = document.getElementById('posterModal');
  const img = document.getElementById('posterPreviewImg');
  img.src = `/assets/poster-with-qrs.png?t=${Date.now()}`;
  modal.classList.add('active');
});

document.getElementById('posterModalCloseBtn').onclick = () => {
  document.getElementById('posterModal').classList.remove('active');
};

// Download All QRs
document.getElementById('downloadAllQrsBtn').onclick = () => {
  window.location.href = '/api/admin/download-all-qrs';
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});
