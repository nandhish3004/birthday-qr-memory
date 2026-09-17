#!/usr/bin/env node
/**
 * calibrate-poster-boxes.js
 * ===========================================================================
 * Finds every empty photo placeholder panel ("ur pic here" boxes) in a poster
 * template and prints its EXACT geometry — centroid, true (un-rotated) size
 * and tilt — as percentages of the poster, ready to paste into a studio's
 * DEFAULTS.positions block.
 *
 * Why this matters: frames in scrapbook posters are ROTATED. A naive
 * axis-aligned bounding box is systematically too wide/tall, which is exactly
 * how photos end up spilling outside the frame or sitting off-centre. This
 * tool computes an ORIENTED bounding box via image moments (PCA) followed by
 * an angle sweep that minimises the box area, so the geometry matches the
 * artwork to the pixel.
 *
 * Usage:
 *   node scripts/calibrate-poster-boxes.js <image> [options]
 *
 *   --dark           panels are darker than the artwork   (default: auto)
 *   --light          panels are LIGHTER than the artwork (white polaroids)
 *   --inset=<pct>    shrink each panel by this % of the poster on every side
 *                    so no dark frame edge peeks out. Default 0.35
 *   --min-area=<pct> ignore blobs smaller than this % of the poster. Default 0.4
 *   --aspect=<lo-hi> accept panels whose w/h is inside range. Default 0.45-2.3
 *   --json           machine-readable output only
 *   --quiet          no console table (use with --json)
 *
 * Outputs (next to the input image):
 *   <name>-detected.png   proof overlay: red box = detected panel
 *   <name>-boxes.json     full geometry, both centre- and corner-anchored
 * ===========================================================================
 */
'use strict';
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

/* ----------------------------- args ---------------------------------- */
const argv = process.argv.slice(2);
const file = argv.find(a => !a.startsWith('--'));
if (!file) { console.error('Usage: node scripts/calibrate-poster-boxes.js <image> [--light|--dark] [--inset=0.35] [--json]'); process.exit(1); }
const flag = (name, dflt) => {
  const hit = argv.find(a => a.startsWith('--' + name + '='));
  return hit ? Number(hit.split('=')[1]) : dflt;
};
const has = n => argv.includes('--' + n);
const INSET = flag('inset', 0.35);                 // % of poster
const MIN_AREA_PCT = flag('min-area', 0.4);        // % of poster
const MIN_FILL = flag('min-fill', 0.72);           // solidity in the ROTATED frame
const aspectArg = (argv.find(a => a.startsWith('--aspect=')) || '').split('=')[1] || '0.45-2.3';
const [AR_LO, AR_HI] = aspectArg.split('-').map(Number);
const MODE = has('light') ? 'light' : has('dark') ? 'dark' : 'auto';
const AS_JSON = has('json');
const QUIET = has('quiet');

const abs = path.resolve(file);
if (!fs.existsSync(abs)) { console.error('✗ Not found: ' + abs); process.exit(1); }

/* ------------------------------- main -------------------------------- */
Jimp.read(abs).then(async img => {
  const W = img.bitmap.width, H = img.bitmap.height;
  const { data } = img.bitmap;
  const N = W * H;

  const lum = new Uint8Array(N);
  for (let i = 0, p = 0; p < N; p++, i += 4) {
    lum[p] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0;
  }
  const hist = new Uint32Array(256);
  for (let i = 0; i < N; i++) hist[lum[i]]++;

  const modes = MODE === 'auto' ? ['dark', 'light'] : [MODE];
  const results = {};
  for (const m of modes) results[m] = detect(lum, hist, W, H, m);

  const pick = MODE === 'auto'
    ? (results.dark.length >= results.light.length ? 'dark' : 'light')
    : MODE;
  const boxes = results[pick];

  /* --------------------- order into reading order ------------------- */
  // group into rows by vertical overlap, then left→right inside each row
  boxes.sort((a, b) => a.cy - b.cy);
  const rows = [];
  for (const b of boxes) {
    const row = rows.find(r => Math.abs(r.y - b.cy) < Math.max(b.h, r.h) * 0.62);
    if (row) { row.items.push(b); row.y = (row.y * (row.items.length - 1) + b.cy) / row.items.length; row.h = Math.max(row.h, b.h); }
    else rows.push({ y: b.cy, h: b.h, items: [b] });
  }
  rows.sort((a, b) => a.y - b.y);
  const ordered = [];
  rows.forEach(r => { r.items.sort((a, b) => a.cx - b.cx); r.items.forEach(b => ordered.push(b)); });

  /* --------------------------- report ------------------------------- */
  const out = {
    image: path.basename(abs), width: W, height: H,
    aspect: +(W / H).toFixed(4),
    mode: pick,
    candidates: { dark: results.dark.length, light: results.light.length },
    insetPct: INSET,
    frameCount: ordered.length,
    frames: ordered.map((b, i) => {
      const wP = (b.w / W) * 100, hP = (b.h / H) * 100;
      const xP = (b.cx / W) * 100, yP = (b.cy / H) * 100;
      const iw = Math.max(wP - INSET * 2, 0.5);
      const ih = Math.max(hP - INSET * 2, 0.5);
      return {
        id: `photo-${i + 1}`,
        center: { x: r3(xP), y: r3(yP), w: r3(wP), h: r3(hP) },
        topLeft: { x: r3(xP - wP / 2), y: r3(yP - hP / 2), w: r3(wP), h: r3(hP) },
        inset: { x: r3(xP), y: r3(yP), w: r3(iw), h: r3(ih) },
        rot: r3(b.rot),
        px: { x: Math.round(b.minX), y: Math.round(b.minY), w: Math.round(b.w), h: Math.round(b.h) },
        fill: +b.fill.toFixed(3),
        aspect: +(b.w / b.h).toFixed(3),
      };
    }),
  };

  /* ---------------------- paste-ready snippet ----------------------- */
  out.positionsSnippet = '{\n' + out.frames
    .map(f => `    '${f.id}': {x:${f.inset.x}, y:${f.inset.y}, w:${f.inset.w}, h:${f.inset.h}, rot:${f.rot}},`)
    .join('\n') + '\n  }';

  /* ------------------------- proof overlay -------------------------- */
  const base = path.basename(abs).replace(/\.(jpe?g|png)$/i, '');
  const proofPath = path.join(path.dirname(abs), base + '-detected.png');
  const proof = img.clone();
  const RED = Jimp.rgbaToInt(255, 0, 80, 255);
  const GREEN = Jimp.rgbaToInt(0, 220, 120, 255);
  for (const b of ordered) {
    strokeOBB(proof, b, RED, 4);                                    // detected panel
    strokeOBB(proof, { ...b, w: b.w - 2 * INSET * W / 100, h: b.h - 2 * INSET * H / 100 }, GREEN, 2); // photo area
  }
  await proof.writeAsync(proofPath);

  const jsonPath = path.join(path.dirname(abs), base + '-boxes.json');
  fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2) + '\n');
  out.proof = path.relative(process.cwd(), proofPath);
  out.jsonFile = path.relative(process.cwd(), jsonPath);

  /* --------------------------- console ------------------------------ */
  if (AS_JSON) { console.log(JSON.stringify(out, null, 2)); return; }
  if (QUIET) return;

  console.log(`\n📐 ${out.image}   ${W}×${H}px   ratio ${out.aspect}`);
  console.log(`   detection mode: ${pick}  (dark candidates ${results.dark.length}, light candidates ${results.light.length})`);
  console.log(`   panels found: ${out.frameCount}   inset: ${INSET}% per side\n`);
  console.log('   #   centre x%   centre y%     w%      h%     rot°    px(x,y,w,h)            fill');
  console.log('   ' + '-'.repeat(88));
  out.frames.forEach(f => {
    console.log(`   ${String(f.id.replace('photo-', '')).padStart(2)}   ${p(f.center.x, 8)} ${p(f.center.y, 9)} ${p(f.center.w, 7)} ${p(f.center.h, 7)} ${p(f.rot, 6)}   ` +
      `${String(f.px.x).padStart(5)},${String(f.px.y).padStart(5)},${String(f.px.w).padStart(4)},${String(f.px.h).padStart(4)}   ${f.fill}`);
  });
  console.log(`\n   🖼  proof overlay → ${out.proof}   (red = detected panel, green = photo area after inset)`);
  console.log(`   🧾  geometry json → ${out.jsonFile}`);
  console.log(`\n   Paste-ready DEFAULTS.positions block (centre-anchored, inset applied):\n`);
  console.log('   positions: ' + out.positionsSnippet + '\n');
}).catch(e => { console.error('✗ ' + e.stack); process.exit(1); });

const r3 = n => Math.round(n * 1000) / 1000;
const p = (n, w = 8) => String(n).padEnd(w);

/* ===================================================================== */
/* Detection                                                             */
/* ===================================================================== */
function detect(lum, hist, W, H, mode) {
  const N = W * H;
  let total = 0, cum = 0, threshold = mode === 'dark' ? 40 : 215;
  for (let v = 0; v < 256; v++) total += hist[v];
  if (mode === 'dark') {
    for (let v = 0; v < 256; v++) { cum += hist[v]; if (cum / total >= 0.05) { threshold = Math.max(30, v); break; } }
  } else {
    for (let v = 255; v >= 0; v--) { cum += hist[v]; if (cum / total >= 0.05) { threshold = Math.min(225, v); break; } }
  }

  const bin = new Uint8Array(N);
  if (mode === 'dark') for (let i = 0; i < N; i++) bin[i] = lum[i] <= threshold ? 1 : 0;
  else                 for (let i = 0; i < N; i++) bin[i] = lum[i] >= threshold ? 1 : 0;

  /* Optional morphological close (off by default — it merges a panel with any
     nearby dark artwork, losing frames). White placeholder text inside a panel
     does NOT break connectivity, so it is rarely needed. */
  const closed = has('close') ? dilate(bin, W, H) : bin;

  const seen = new Uint8Array(N);
  const stack = new Int32Array(N);
  const minArea = Math.round(N * (MIN_AREA_PCT / 100));
  const boxes = [];

  for (let s = 0; s < N; s++) {
    if (!closed[s] || seen[s]) continue;
    let sp = 0; stack[sp++] = s; seen[s] = 1;
    const px = [];                       // pixel indices of this blob
    let minX = W, maxX = 0, minY = H, maxY = 0;
    while (sp > 0) {
      const idx = stack[--sp];
      const x = idx % W, y = (idx / W) | 0;
      px.push(idx);
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (x > 0     && closed[idx - 1] && !seen[idx - 1]) { seen[idx - 1] = 1; stack[sp++] = idx - 1; }
      if (x < W - 1 && closed[idx + 1] && !seen[idx + 1]) { seen[idx + 1] = 1; stack[sp++] = idx + 1; }
      if (y > 0     && closed[idx - W] && !seen[idx - W]) { seen[idx - W] = 1; stack[sp++] = idx - W; }
      if (y < H - 1 && closed[idx + W] && !seen[idx + W]) { seen[idx + W] = 1; stack[sp++] = idx + W; }
    }
    const area = px.length;
    if (area < minArea) continue;

    /* ---------- image moments → centroid + orientation ---------- */
    let sx = 0, sy = 0;
    for (const idx of px) { sx += idx % W; sy += (idx / W) | 0; }
    const cx = sx / area, cy = sy / area;

    let mu20 = 0, mu02 = 0, mu11 = 0;
    for (const idx of px) {
      const dx = (idx % W) - cx, dy = ((idx / W) | 0) - cy;
      mu20 += dx * dx; mu02 += dy * dy; mu11 += dx * dy;
    }
    mu20 /= area; mu02 /= area; mu11 /= area;

    /* ---------- exact oriented bounding box ---------- */
    // min-area rectangle via convex hull + rotating calipers. PCA alone is
    // ambiguous for near-square panels; calipers snaps to a real panel edge.
    const rect = minAreaRect(px, W);
    const bw = rect.w, bh = rect.h, bx = rect.cx, by = rect.cy, rot = rect.deg;
    const fill = area / (bw * bh);

    const ar = bw / bh;
    if (fill < MIN_FILL) continue;                 // not a clean rectangle
    if (ar < AR_LO || ar > AR_HI) continue;        // not a photo panel shape
    if (bw < W * 0.05 || bh < H * 0.03) continue;  // too small to be a frame

    boxes.push({ minX, minY, maxX, maxY, cx: bx, cy: by, w: bw, h: bh, rot, area, fill });
  }

  /* de-duplicate NESTED blobs only (a frame drawn inside a frame). Neighbouring
     frames legitimately sit close together, so centre-proximity is wrong here. */
  const kept = [];
  for (const b of boxes.sort((a, b) => b.area - a.area)) {
    const contained = kept.some(k => {
      const bx0 = b.cx - b.w / 2, bx1 = b.cx + b.w / 2, by0 = b.cy - b.h / 2, by1 = b.cy + b.h / 2;
      const kx0 = k.cx - k.w / 2, kx1 = k.cx + k.w / 2, ky0 = k.cy - k.h / 2, ky1 = k.cy + k.h / 2;
      const ox = Math.min(bx1, kx1) - Math.max(bx0, kx0);
      const oy = Math.min(by1, ky1) - Math.max(by0, ky0);
      if (ox <= 0 || oy <= 0) return false;
      return (ox * oy) / (b.w * b.h) > 0.85;      // b almost entirely inside k
    });
    if (!contained) kept.push(b);
  }
  return kept;
}

/**
 * Minimum-area rectangle around a set of pixels.
 * Andrew's monotone-chain convex hull + rotating calipers, which is exact and
 * immune to the ambiguity that a moment/PCA fit suffers on square panels.
 */
function minAreaRect(px, W) {
  /* --- hull --- */
  const pts = new Array(px.length);
  for (let i = 0; i < px.length; i++) pts[i] = [px[i] % W, (px[i] / W) | 0];
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  const hull = lower.slice(0, -1).concat(upper.slice(0, -1));

  /* --- rotating calipers --- */
  let best = null;
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i], b = hull[(i + 1) % hull.length];
    const ex = b[0] - a[0], ey = b[1] - a[1];
    const len = Math.hypot(ex, ey);
    if (len < 1e-9) continue;
    const ux = ex / len, uy = ey / len;          // along-edge axis
    const vx = -uy, vy = ux;                     // perpendicular axis
    let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
    for (const p of hull) {
      const dx = p[0] - a[0], dy = p[1] - a[1];
      const u = dx * ux + dy * uy;
      const v = dx * vx + dy * vy;
      if (u < minU) minU = u; if (u > maxU) maxU = u;
      if (v < minV) minV = v; if (v > maxV) maxV = v;
    }
    const w = maxU - minU, h = maxV - minV;
    const area = w * h;
    if (!best || area < best.area) {
      // centre of the rectangle, back in image space
      const cu = (minU + maxU) / 2, cv = (minV + maxV) / 2;
      best = {
        area, w: w + 1, h: h + 1,
        cx: a[0] + cu * ux + cv * vx,
        cy: a[1] + cu * uy + cv * vy,
        deg: (Math.atan2(ey, ex) * 180) / Math.PI,
      };
    }
  }

  /* normalise so the long side is 'w' and the tilt is inside (-45, 45] */
  let deg = best.deg % 180;
  if (deg > 90) deg -= 180;
  if (deg <= -90) deg += 180;
  if (deg > 45) { deg -= 90; const t = best.w; best.w = best.h; best.h = t; }
  if (deg <= -45) { deg += 90; const t = best.w; best.w = best.h; best.h = t; }

  return { cx: best.cx, cy: best.cy, w: best.w, h: best.h, deg: +deg.toFixed(2) };
}

/* ------------------------- morphology helpers ------------------------- */
function dilate(src, W, H) {
  const out = new Uint8Array(src.length);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (src[i]) { out[i] = 1; continue; }
      if ((x > 0 && src[i - 1]) || (x < W - 1 && src[i + 1]) ||
          (y > 0 && src[i - W]) || (y < H - 1 && src[i + W])) out[i] = 1;
    }
  }
  return out;
}
function erode(src, W, H) {
  const out = new Uint8Array(src.length);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!src[i]) continue;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) continue;
      if (src[i - 1] && src[i + 1] && src[i - W] && src[i + W]) out[i] = 1;
    }
  }
  return out;
}

/* --------------------------- overlay drawing -------------------------- */
function strokeOBB(img, b, color, thickness) {
  const W = img.bitmap.width, H = img.bitmap.height;
  const a = (b.rot * Math.PI) / 180;
  const c = Math.cos(a), s = Math.sin(a);
  const hw = b.w / 2, hh = b.h / 2;
  const corner = (dx, dy) => [b.cx + dx * c - dy * s, b.cy + dx * s + dy * c];
  const pts = [corner(-hw, -hh), corner(hw, -hh), corner(hw, hh), corner(-hw, hh)];
  const put = (x, y) => { const xi = Math.round(x), yi = Math.round(y); if (xi >= 0 && yi >= 0 && xi < W && yi < H) img.setPixelColor(color, xi, yi); };
  for (let i = 0; i < 4; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % 4];
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1)) * 2;
    for (let t = 0; t <= steps; t++) {
      const x = x1 + ((x2 - x1) * t) / steps, y = y1 + ((y2 - y1) * t) / steps;
      const r = Math.floor(thickness / 2);
      for (let ox = -r; ox <= r; ox++) for (let oy = -r; oy <= r; oy++) put(x + ox, y + oy);
    }
  }
}
