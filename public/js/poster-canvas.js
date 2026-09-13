/**
 * High-Resolution Browser Canvas Poster Compositor
 * Generates and downloads the composite poster with all 8 scannable QR codes.
 */

// Exact scrapbook aesthetic placements (Percentage coordinates)
const POSTER_PLACEMENTS = [
  { id: 1, label: "Scan #1 💗", xPct: 0.32, yPct: 0.058, sizePct: 0.125, rotation: -2 },
  { id: 2, label: "Scan #2 ✨", xPct: 0.81, yPct: 0.042, sizePct: 0.125, rotation: 3 },
  { id: 3, label: "Scan #3 🎵", xPct: 0.04, yPct: 0.345, sizePct: 0.125, rotation: -1 },
  { id: 4, label: "Scan #4 💌", xPct: 0.06, yPct: 0.605, sizePct: 0.135, rotation: 2 },
  { id: 5, label: "Scan #5 🌸", xPct: 0.52, yPct: 0.535, sizePct: 0.125, rotation: -2 },
  { id: 6, label: "Scan #6 🎶", xPct: 0.82, yPct: 0.600, sizePct: 0.125, rotation: 1 },
  { id: 7, label: "Scan #7 🎸", xPct: 0.18, yPct: 0.900, sizePct: 0.125, rotation: -3 },
  { id: 8, label: "Scan #8 💫", xPct: 0.52, yPct: 0.885, sizePct: 0.125, rotation: 2 }
];

/**
 * Generate a QR code as a temporary in-memory canvas
 */
function createQRCanvas(targetUrl, size = 500) {
  return new Promise((resolve, reject) => {
    const tempCanvas = document.createElement('canvas');
    if (typeof QRCode !== 'undefined' && QRCode.toCanvas) {
      QRCode.toCanvas(tempCanvas, targetUrl, {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#1a1016',
          light: '#ffffff'
        }
      }, (err) => {
        if (err) reject(err);
        else resolve(tempCanvas);
      });
    } else {
      // Fallback to loading server image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        tempCanvas.width = size;
        tempCanvas.height = size;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        resolve(tempCanvas);
      };
      img.onerror = reject;
      img.src = `/assets/qr/${targetUrl.split('/').pop()}.png`;
    }
  });
}

/**
 * Composite all 8 QR codes onto base poster and trigger download
 */
async function generateAndDownloadCanvasPoster(baseUrl = window.location.origin) {
  const downloadBtn = document.getElementById('downloadCanvasPosterBtn');
  if (downloadBtn) {
    downloadBtn.textContent = '⏳ Rendering 4K Poster...';
    downloadBtn.disabled = true;
  }

  try {
    const posterImg = document.getElementById('mainPosterImg');
    const canvas = document.getElementById('exportCanvas') || document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Wait for image to load if not complete
    if (!posterImg.complete) {
      await new Promise(r => posterImg.onload = r);
    }

    const naturalWidth = posterImg.naturalWidth || 1080;
    const naturalHeight = posterImg.naturalHeight || 1920;

    canvas.width = naturalWidth;
    canvas.height = naturalHeight;

    // Draw the base poster
    ctx.drawImage(posterImg, 0, 0, naturalWidth, naturalHeight);

    // Draw each QR code sticker
    for (const p of POSTER_PLACEMENTS) {
      const cleanBase = baseUrl.replace(/\/+$/, '');
      const memoryUrl = `${cleanBase}/memory/${p.id}`;

      const qrCanvas = await createQRCanvas(memoryUrl, 500);

      const targetSize = Math.round(naturalWidth * p.sizePct);
      const padding = Math.round(targetSize * 0.12);
      const cardW = targetSize + (padding * 2);
      const cardH = targetSize + (padding * 2) + Math.round(targetSize * 0.15); // Extra for label
      const posX = Math.round(naturalWidth * p.xPct);
      const posY = Math.round(naturalHeight * p.yPct);

      ctx.save();
      // Position and rotate card
      ctx.translate(posX + cardW / 2, posY + cardH / 2);
      ctx.rotate((p.rotation * Math.PI) / 180);

      // Card shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowBlur = Math.round(targetSize * 0.1);
      ctx.shadowOffsetY = Math.round(targetSize * 0.05);

      // White card body (Polaroid sticker)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const rad = Math.round(targetSize * 0.06);
      ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, rad);
      ctx.fill();

      // Reset shadow for QR content
      ctx.shadowColor = 'transparent';

      // Border stroke
      ctx.strokeStyle = 'rgba(255, 117, 143, 0.35)';
      ctx.lineWidth = Math.max(2, Math.round(targetSize * 0.015));
      ctx.stroke();

      // Draw QR image
      ctx.drawImage(qrCanvas, -cardW / 2 + padding, -cardH / 2 + padding, targetSize, targetSize);

      // Draw scrapbook label at bottom of card
      ctx.fillStyle = '#590d22';
      ctx.font = `bold ${Math.round(targetSize * 0.13)}px "Outfit", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(p.label, 0, cardH / 2 - Math.round(padding * 0.6));

      ctx.restore();
    }

    // Trigger file download
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `shaaaw_birthday_poster_with_8_qrs.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    console.error('Failed to generate high-res canvas poster:', err);
    alert('Could not render canvas poster: ' + err.message);
  } finally {
    if (downloadBtn) {
      downloadBtn.textContent = '🖨️ Download Print-Ready Poster (High-Res)';
      downloadBtn.disabled = false;
    }
  }
}

window.POSTER_PLACEMENTS = POSTER_PLACEMENTS;
window.generateAndDownloadCanvasPoster = generateAndDownloadCanvasPoster;
