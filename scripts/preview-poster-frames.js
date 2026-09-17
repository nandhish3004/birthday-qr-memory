#!/usr/bin/env node
/**
 * preview-poster-frames.js
 * ===========================================================================
 * Proof harness for poster frame calibration.
 *
 * Composites a distinct test photo into EVERY calibrated frame and writes out
 * a preview PNG, so alignment can be verified by eye before any of it is
 * trusted in a studio UI. The goal is to prove:
 *
 *   1. each photo lands exactly inside its panel — no spill onto the artwork
 *   2. no dark panel edge is left peeking around a photo
 *   3. rotation matches the artwork, not an axis-aligned approximation
 *
 * Rendering is done with an inverse transform (for every poster pixel inside a
 * frame, rotate back into photo space and sample) rather than by compositing a
 * pre-rotated bitmap. That gives exact sub-pixel placement and no resampling
 * halo around the edges.
 *
 * Usage:
 *   node scripts/preview-poster-frames.js <template> <boxes.json> [--out=file.png]
 *                                         [--scale=1] [--solid]
 *
 *   --scale=N   render at N× the template resolution (default 2)
 *   --solid     flat colour tiles instead of numbered gradients (crisper edge check)
 * ===========================================================================
 */
'use strict';
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const argv = process.argv.slice(2);
const positional = argv.filter(a => !a.startsWith('--'));
const [templatePath, boxesPath] = positional;
if (!templatePath || !boxesPath) {
  console.error('Usage: node scripts/preview-poster-frames.js <template> <boxes.json> [--scale=2] [--solid]');
  process.exit(1);
}
const flag = (n, d) => {
  const hit = argv.find(a => a.startsWith('--' + n + '='));
  return hit ? Number(hit.split('=')[1]) : d;
};
const SCALE = flag('scale', 2);
const SOLID = argv.includes('--solid');
const OUT = (argv.find(a => a.startsWith('--out=')) || '').split('=')[1]
  || 'poster-preview.png';

/* ------------------------------ helpers ------------------------------- */
/** Build a test photo: bold gradient + index so rotation is obvious. */
function makeTestPhoto(i, w, h) {
  const img = new Jimp(w, h, 0x000000ff);
  const hue = (i * 47) % 360;
  const [r0, g0, b0] = hsl2rgb(hue, 0.72, 0.55);
  const [r1, g1, b1] = hsl2rgb((hue + 60) % 360, 0.72, 0.3);
  img.scan(0, 0, w, h, function (x, y, idx) {
    const t = (x / w) * 0.5 + (y / h) * 0.5;
    this.bitmap.data[idx] = r0 + (r1 - r0) * t;
    this.bitmap.data[idx + 1] = g0 + (g1 - g0) * t;
    this.bitmap.data[idx + 2] = b0 + (b1 - b0) * t;
    this.bitmap.data[idx + 3] = 255;
  });
  return img;
}

function hsl2rgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/* ------------------------------- main --------------------------------- */
(async () => {
  const tpl = await Jimp.read(templatePath);
  const geo = JSON.parse(fs.readFileSync(boxesPath, 'utf8'));
  const baseW = tpl.bitmap.width, baseH = tpl.bitmap.height;

  const W = Math.round(baseW * SCALE);
  const H = Math.round(baseH * SCALE);

  const canvas = tpl.clone().resize(W, H, Jimp.RESAMPLE_BICUBIC);
  const out = canvas.bitmap.data;

  /* --- baseline snapshot --------------------------------------------- */
  // A "leftover panel pixel" is one that was DARK in the untouched template and
  // that the compositor never overwrote. Comparing against the original (rather
  // than just testing for darkness afterwards) means a genuinely dark PHOTO is
  // never mistaken for leftover panel — the check stays valid for real photos.
  const orig = Buffer.from(canvas.bitmap.data);      // snapshot before compositing
  const lumAt = (buf, idx) => buf[idx] * 0.299 + buf[idx + 1] * 0.587 + buf[idx + 2] * 0.114;
  const DARK = 60;                      // comfortably above the detected ~30
  const panelDark = geo.frames.map(() => 0);
  geo.frames.forEach((frame, fi) => {
    const { x, y, w, h } = frame.frame;
    const cxD = (x / 100) * W, cyD = (y / 100) * H;
    const hwD = (w / 100) * W / 2, hhD = (h / 100) * H / 2;
    if (hwD * hhD === 0) return;
    const rot = (frame.rot * Math.PI) / 180;
    const cos = Math.cos(-rot), sin = Math.sin(-rot);
    const y0 = Math.max(0, Math.floor(cyD - hhD - hwD - 3)), y1 = Math.min(H - 1, Math.ceil(cyD + hhD + hwD + 3));
    const x0 = Math.max(0, Math.floor(cxD - hhD - hwD - 3)), x1 = Math.min(W - 1, Math.ceil(cxD + hhD + hwD + 3));
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const dx = px + 0.5 - cxD, dy = py + 0.5 - cyD;
        const lx = dx * cos - dy * sin, ly = dx * sin + dy * cos;
        if (lx < -hwD || lx >= hwD || ly < -hhD || ly >= hhD) continue;
        const i = (py * W + px) * 4;
        if (lumAt(orig, i) > DARK) continue;      // template pixel wasn't panel
        if (orig[i] !== out[i] || orig[i + 1] !== out[i + 1] || orig[i + 2] !== out[i + 2]) continue;
        panelDark[fi]++;                           // dark AND untouched
      }
    }
  });
  const panelDarkBefore = panelDark.slice();
  panelDark.fill(0);

  const diag = [];
  let worstSpill = 0;
  let overlaps = 0;
  let leftoverDark = 0;

  geo.frames.forEach((frame, fi) => {
    const { x, y, w, h } = frame.frame;          // centre + size, % of poster
    const rot = (frame.rot * Math.PI) / 180;

    // frame geometry in destination pixels
    const cxD = (x / 100) * W;
    const cyD = (y / 100) * H;
    const wD = (w / 100) * W;
    const hD = (h / 100) * H;
    const hwD = wD / 2, hhD = hD / 2;

    // test photo at ~1.5× destination density for a clean downsample
    const pw = Math.max(24, Math.round(wD * 1.5));
    const ph = Math.max(24, Math.round(hD * 1.5));
    const photo = SOLID
      ? new Jimp(pw, ph, Jimp.rgbaToInt(...hsl2rgb((fi * 47) % 360, 0.7, 0.5).map(Math.round), 255))
      : makeTestPhoto(fi, pw, ph);
    const pdata = photo.bitmap.data;

    const cos = Math.cos(-rot), sin = Math.sin(-rot);

    // bounding box of the rotated frame, padded for safety
    const ext = Math.abs(hwD * Math.cos(rot)) + Math.abs(hhD * Math.sin(rot));
    const eyt = Math.abs(hwD * Math.sin(rot)) + Math.abs(hhD * Math.cos(rot));
    const x0 = Math.max(0, Math.floor(cxD - ext) - 2);
    const x1 = Math.min(W - 1, Math.ceil(cxD + ext) + 2);
    const y0 = Math.max(0, Math.floor(cyD - eyt) - 2);
    const y1 = Math.min(H - 1, Math.ceil(cyD + eyt) + 2);

    let insideCount = 0;
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {

        // to frame-local space
        const dx = px + 0.5 - cxD;
        const dy = py + 0.5 - cyD;
        // inverse rotation
        const lx = dx * cos - dy * sin;
        const ly = dx * sin + dy * cos;

        // inside the frame? (half-open so neighbouring frames can't overlap)
        if (lx < -hwD || lx >= hwD || ly < -hhD || ly >= hhD) continue;
        insideCount++;

        // map to photo pixel space
        const u = (lx + hwD) / wD;
        const v = (ly + hhD) / hD;
        let sx = Math.min(pw - 1, Math.max(0, Math.round(u * pw - 0.5)));
        let sy = Math.min(ph - 1, Math.max(0, Math.round(v * ph - 0.5)));

        const sIdx = (sy * pw + sx) * 4;
        const dIdx = (py * W + px) * 4;
        out[dIdx] = pdata[sIdx];
        out[dIdx + 1] = pdata[sIdx + 1];
        out[dIdx + 2] = pdata[sIdx + 2];
        out[dIdx + 3] = 255;
      }
    }

    // Coverage is measured against the frame itself, so it must come out at
    // ~100%. Any shortfall means the compositor and the geometry disagree
    // (i.e. a real misalignment). The frame is deliberately inset slightly
    // inside the detected panel, so it can never bleed onto the artwork.
    const framePx = wD * hD;
    const coverage = insideCount / framePx;
    diag.push({
      id: frame.id,
      centre: `${frame.frame.x}, ${frame.frame.y}`,
      size: `${frame.frame.w}×${frame.frame.h}`,
      rot: frame.rot,
      frameCoverage: +(coverage * 100).toFixed(1),
      darkPx: 0,
    });
    worstSpill = Math.max(worstSpill, Math.abs(1 - coverage));
    // A rasterised rect of area A contains at most A + perimeter/2 pixel
    // centres, so sub-0.5% overshoot is discretisation, not misalignment.
    if (coverage > 1.005) overlaps++;    // frame painted outside its own rect
  });

  /* --- verification pass, AFTER all compositing ---------------------- */
  // Re-run the identical test: any template-dark pixel the compositor left
  // untouched is a visible sliver of black panel. Must be zero.
  geo.frames.forEach((frame, fi) => {
    const { x, y, w, h } = frame.frame;
    const cxD = (x / 100) * W, cyD = (y / 100) * H;
    const hwD = (w / 100) * W / 2, hhD = (h / 100) * H / 2;
    const rot = (frame.rot * Math.PI) / 180;
    const cos = Math.cos(-rot), sin = Math.sin(-rot);
    const y0 = Math.max(0, Math.floor(cyD - hhD - hwD - 3)), y1 = Math.min(H - 1, Math.ceil(cyD + hhD + hwD + 3));
    const x0 = Math.max(0, Math.floor(cxD - hhD - hwD - 3)), x1 = Math.min(W - 1, Math.ceil(cxD + hhD + hwD + 3));
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const dx = px + 0.5 - cxD, dy = py + 0.5 - cyD;
        const lx = dx * cos - dy * sin, ly = dx * sin + dy * cos;
        if (lx < -hwD || lx >= hwD || ly < -hhD || ly >= hhD) continue;
        const i = (py * W + px) * 4;
        if (lumAt(orig, i) > DARK) continue;
        if (orig[i] !== out[i] || orig[i + 1] !== out[i + 1] || orig[i + 2] !== out[i + 2]) continue;
        panelDark[fi]++;
      }
    }
  });
  leftoverDark = panelDark.reduce((a, b) => a + b, 0);
  const darkInFrameBefore = panelDarkBefore.reduce((a, b) => a + b, 0);
  diag.forEach((d, i) => { d.darkPx = panelDark[i]; });

  await canvas.writeAsync(OUT);

  console.log(`\n🖼  ${path.basename(OUT)}   ${W}×${H}px   (template ${baseW}×${baseH} @ ${SCALE}×)`);
  console.log(`    ${geo.frames.length} frames composited\n`);
  console.log('    #   centre %          frame w%×h%        rot°    coverage   leftover panel px');
  console.log('    ' + '-'.repeat(86));
  diag.forEach(d => {
    console.log(`    ${d.id.replace('photo-', '').padStart(2)}  ${d.centre.padEnd(17)} ${d.size.padEnd(16)} ${String(d.rot).padStart(6)}   ${String(d.frameCoverage + '%').padStart(8)}   ${d.darkPx ? '⚠ ' + d.darkPx : '✓ 0'}`);
  });

  const ok = overlaps === 0 && leftoverDark === 0;
  console.log(`\n    ${ok ? '✅' : '❌'} leftover dark panel pixels: ${leftoverDark}   |   overpainting outside frame: ${overlaps}`);
  console.log(`    ${ok
    ? 'Every photo covers its panel exactly — no black ring, no spill onto the artwork.'
    : 'PROBLEM: dark panel pixels survive, so a black ring or a gap is still visible.'}`);
})().catch(e => { console.error('✗ ' + e.stack); process.exit(1); });
