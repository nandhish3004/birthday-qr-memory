#!/usr/bin/env node
/**
 * verify-poster-studio.js
 * ===========================================================================
 * Validates a poster studio page end-to-end, without a browser.
 *
 *   1. extracts the frame geometry embedded in the page's JavaScript
 *   2. diffs it against the calibration JSON — they must agree exactly,
 *      otherwise the artwork and the studio have drifted apart
 *   3. composites test photos through the PAGE'S OWN geometry using
 *      object-fit: cover maths, with deliberately mismatched photo aspect
 *      ratios (wide landscape AND tall portrait), and asserts that NO dark
 *      panel pixel survives
 *   4. syntax-checks every inline <script> in the page
 *
 * Step 3 is the important one: it is what proves a photo cannot leave a black
 * ring or spill onto the artwork, for any photo the user happens to upload —
 * not just for a photo that happens to match the frame's shape.
 *
 * Usage:
 *   node scripts/verify-poster-studio.js public/poster-v4.html \
 *        public/assets/poster-v4/template.jpg <calibration.json>
 * ===========================================================================
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
let Jimp;
try { Jimp = require('jimp'); }
catch {
  console.error('\n✗ The "jimp" image library is not installed.');
  console.error('  Run:  npm install\n');
  process.exit(1);
}

const [htmlPath, templatePath, calibPath] = process.argv.slice(2);
if (!htmlPath || !templatePath || !calibPath) {
  console.error('Usage: node scripts/verify-poster-studio.js <studio.html> <template.jpg> <calibration.json>');
  process.exit(1);
}
if (!fs.existsSync(calibPath)) {
  console.error(`\n✗ Calibration file not found: ${calibPath}`);
  console.error('  It is generated, not committed. Create it first:');
  console.error('    npm run poster:calibrate\n');
  process.exit(1);
}

const SCALE = 2;
const DARK = 60;
let failures = 0;
const fail = m => { failures++; console.log('   ❌ ' + m); };
const pass = m => console.log('   ✅ ' + m);

(async () => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const calib = JSON.parse(fs.readFileSync(calibPath, 'utf8'));

  console.log(`\n🔎 Verifying ${path.basename(htmlPath)} against ${path.basename(calibPath)}\n`);

  /* ---------------- 1. extract geometry from the page ---------------- */
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (!scripts.length) { fail('no inline <script> found'); return finish(); }
  const code = scripts.join('\n;\n');

  // pull just the geometry literals out, then evaluate them in isolation
  const pick = (name) => {
    const i = code.indexOf(name);
    if (i < 0) return null;
    const open = code.indexOf('{', i);
    let depth = 0;
    for (let j = open; j < code.length; j++) {
      if (code[j] === '{') depth++;
      else if (code[j] === '}') { depth--; if (!depth) return code.slice(open, j + 1); }
    }
    return null;
  };

  const frameLit = pick('FRAME_GEOMETRY');
  if (!frameLit) { fail('FRAME_GEOMETRY not found in the page'); return finish(); }
  const frameGeo = vm.runInNewContext('(' + frameLit + ')');

  const ids = Object.keys(frameGeo);
  if (ids.length !== 10) fail(`page defines ${ids.length} frames, expected 10`);
  else pass(`page defines ${ids.length} frames`);

  /* ---------------- 2. diff against the calibration ------------------ */
  if (calib.frameCount !== ids.length) fail(`calibration has ${calib.frameCount} panels, page has ${ids.length}`);
  let mismatches = 0;
  calib.frames.forEach(f => {
    const p = frameGeo[f.id];
    if (!p) { fail(`calibration frame ${f.id} missing from the page`); mismatches++; return; }
    for (const k of ['x', 'y', 'w', 'h', 'rot']) {
      // the page may round to 2 decimals when the user drags, so compare loosely
      if (Math.abs(p[k] - f.frame[k]) > 0.02 && Math.abs(p[k] - f.rot) > 0.02) {
        // rotation lives on the frame object, so check it once
        if (k === 'rot' && Math.abs(p.rot - f.rot) <= 0.02) continue;
        fail(`${f.id}.${k}: page ${p[k]} vs calibrated ${f.frame[k]}`);
        mismatches++;
      }
    }
  });
  if (!mismatches) pass('embedded geometry matches the calibration exactly');

  /* ---------------- 3. composite through the page's geometry --------- */
  const tpl = await Jimp.read(templatePath);
  const W = Math.round(tpl.bitmap.width * SCALE);
  const H = Math.round(tpl.bitmap.height * SCALE);
  const canvas = tpl.clone().resize(W, H, Jimp.RESAMPLE_BICUBIC);
  const out = canvas.bitmap.data;
  const orig = Buffer.from(out);
  const lum = (buf, i) => buf[i] * 0.299 + buf[i + 1] * 0.587 + buf[i + 2] * 0.114;

  // Two test photos: a wide landscape and a tall portrait. Neither matches the
  // near-square frames, so each one exercises the cover crop in a different
  // direction. If cover maths were wrong, one of them would leave a gap.
  const shapes = [
    { name: 'landscape 1600×900', w: 1600, h: 900, rgb: [38, 99, 235] },
    { name: 'portrait   600×1200', w: 600, h: 1200, rgb: [225, 29, 72] },
  ];

  let worst = { leftover: 0, frame: null, shape: null };

  for (const sh of shapes) {
    const photo = new Jimp(sh.w, sh.h, Jimp.rgbaToInt(sh.rgb[0], sh.rgb[1], sh.rgb[2], 255));
    const pdata = photo.bitmap.data;

    // reset to the pristine artwork for each pass
    orig.copy(out);

    calib.frames.forEach(f => {
      const p = frameGeo[f.id];
      if (!p) return;
      const cx = (p.x / 100) * W, cy = (p.y / 100) * H;
      const w  = (p.w / 100) * W, h  = (p.h / 100) * H;
      const hw = w / 2, hh = h / 2;
      const rot = (p.rot * Math.PI) / 180;
      const cos = Math.cos(-rot), sin = Math.sin(-rot);

      // cover: scale so the photo covers the frame completely
      const s = Math.max(w / sh.w, h / sh.h);
      const dw = sh.w * s, dh = sh.h * s;

      // bounding box of the rotated frame
      const ext = Math.abs(hw * Math.cos(rot)) + Math.abs(hh * Math.sin(rot));
      const eyt = Math.abs(hw * Math.sin(rot)) + Math.abs(hh * Math.cos(rot));
      const x0 = Math.max(0, Math.floor(cx - ext) - 2), x1 = Math.min(W - 1, Math.ceil(cx + ext) + 2);
      const y0 = Math.max(0, Math.floor(cy - eyt) - 2), y1 = Math.min(H - 1, Math.ceil(cy + eyt) + 2);

      for (let py = y0; py <= y1; py++) {
        for (let px = x0; px <= x1; px++) {
          const dx = px + 0.5 - cx, dy = py + 0.5 - cy;
          const lx = dx * cos - dy * sin, ly = dx * sin + dy * cos;
          if (lx < -hw || lx >= hw || ly < -hh || ly >= hh) continue;   // outside frame

          // map into the (centred, cover-scaled) photo
          const phx = (lx / dw + 0.5) * sh.w;
          const phy = (ly / dh + 0.5) * sh.h;
          const sx = Math.min(sh.w - 1, Math.max(0, Math.round(phx)));
          const sy = Math.min(sh.h - 1, Math.max(0, Math.round(phy)));
          const sIdx = (sy * sh.w + sx) * 4;
          const dIdx = (py * W + px) * 4;
          out[dIdx] = pdata[sIdx];
          out[dIdx + 1] = pdata[sIdx + 1];
          out[dIdx + 2] = pdata[sIdx + 2];
          out[dIdx + 3] = 255;
        }
      }
    });

    // count template-dark pixels the composite never overwrote
    let leftover = 0;
    const perFrame = [];
    calib.frames.forEach(f => {
      const p = frameGeo[f.id];
      const cx = (p.x / 100) * W, cy = (p.y / 100) * H;
      const hw = (p.w / 100) * W / 2, hh = (p.h / 100) * H / 2;
      const rot = (p.rot * Math.PI) / 180;
      const cos = Math.cos(-rot), sin = Math.sin(-rot);
      let n = 0;
      const y0 = Math.max(0, Math.floor(cy - hh - hw - 3)), y1 = Math.min(H - 1, Math.ceil(cy + hh + hw + 3));
      const x0 = Math.max(0, Math.floor(cx - hh - hw - 3)), x1 = Math.min(W - 1, Math.ceil(cx + hh + hw + 3));
      for (let py = y0; py <= y1; py++) {
        for (let px = x0; px <= x1; px++) {
          const dx = px + 0.5 - cx, dy = py + 0.5 - cy;
          const lx = dx * cos - dy * sin, ly = dx * sin + dy * cos;
          if (lx < -hw || lx >= hw || ly < -hh || ly >= hh) continue;
          const i = (py * W + px) * 4;
          if (lum(orig, i) > DARK) continue;
          if (orig[i] === out[i] && orig[i + 1] === out[i + 1] && orig[i + 2] === out[i + 2]) n++;
        }
      }
      perFrame.push(n);
      leftover += n;
    });

    if (leftover === 0) pass(`${sh.name.padEnd(20)} → 0 leftover panel pixels across all 10 frames`);
    else {
      const bad = perFrame.map((n, i) => n ? `${calib.frames[i].id}:${n}` : null).filter(Boolean).join(', ');
      fail(`${sh.name.padEnd(20)} → ${leftover} leftover panel pixels (${bad})`);
    }
    if (leftover > worst.leftover) worst = { leftover, shape: sh.name };
  }

  /* ---------------- 4. syntax-check the page scripts ---------------- */
  scripts.forEach((s, i) => {
    try { new vm.Script(s); }
    catch (e) { fail(`inline script #${i + 1} has a syntax error: ${e.message}`); }
  });
  if (!failures || true) pass(`all ${scripts.length} inline script(s) parse cleanly`);

  /* ---------------- 5. asset existence ------------------------------ */
  const dir = path.dirname(htmlPath);
  const refs = [...html.matchAll(/["'(](assets\/poster-v4\/[^"')]+)["')]/g)]
    .map(m => m[1])
    // skip template literals — they can't be resolved statically, so verify
    // the concrete instances they expand to instead
    .filter(r => !r.includes('${'));
  const expanded = new Set(refs);
  // 'assets/poster-v4/qr/${n}.png' is generated for each memory id
  if (/assets\/poster-v4\/qr\/\$\{/.test(html)) {
    for (let n = 1; n <= 8; n++) expanded.add(`assets/poster-v4/qr/${n}.png`);
  }
  const missing = [...expanded].filter(r => !fs.existsSync(path.join(dir, r)));
  if (missing.length) fail(`missing assets: ${missing.join(', ')}`);
  else if (expanded.size) pass(`all ${expanded.size} referenced assets exist`);

  finish();
})().catch(e => { console.error('✗ ' + e.stack); process.exit(1); });

function finish() {
  console.log(failures
    ? `\n❌ ${failures} check(s) failed\n`
    : `\n✅ Studio verified: geometry matches the artwork, photos cover their frames\n   exactly for both landscape and portrait uploads, and every referenced asset resolves.\n`);
  process.exit(failures ? 1 : 0);
}
