#!/usr/bin/env node
/**
 * fix-qr-live-redirects.js
 * ---------------------------------------------------------------------------
 * Why this exists:
 *   The 8 QR stickers scan to the static GitHub Pages "tape" pages
 *   (docs/m/N/...), which only play a BUILT-IN synthesized melody
 *   (e.g. "TAPE 01 • THE GENESIS MEMORY") and never reach your live app.
 *   The audio you upload in the Admin Panel lives in the LIVE Render app
 *   (https://birthday-qr-memory.onrender.com/memory/N).
 *
 * What this script does (idempotent, safe to re-run):
 *   1. Points docs/config.json / data/config.json / generate-qrs.js and any
 *      other doc references from the DEAD free-plan URL
 *      (birthday-qr-memory-system.onrender.com — it serves "Not Found")
 *      to the live custom domain.
 *   2. Injects a small "live tape bridge" into every generated standalone
 *      player page: the pretty static card stays as a 2-second landing,
 *      then (and via the ▶ button) it jumps to the live app — where your
 *      uploaded audio actually plays.
 *   3. Fixes the swapped public/assets/qr/1.png <-> 2.png files (1.png
 *      encoded /memory/2 and 2.png encoded /memory/1 — a plain swap makes
 *      both correct).
 *   4. Hooks scripts/build-github-pages.js so future regenerations keep the
 *      bridge automatically.
 *
 * Usage (from the repo root on any machine with Node):
 *   node fix-qr-live-redirects.js
 *   git add -A
 *   git commit -m "fix: QR scans now open the live app so uploaded audio plays"
 *   git push origin main
 * ---------------------------------------------------------------------------
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const LIVE = 'https://birthday-qr-memory.onrender.com';
const DEAD = 'https://birthday-qr-memory-system.onrender.com';

let changed = [];

function writeIfChanged(rel, text) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return;
  if (fs.readFileSync(p, 'utf8') !== text) {
    fs.writeFileSync(p, text);
    changed.push(rel);
  }
}

function applyAll() {
  changed = [];

  // 1) JSON config files: point the redirect target at the live domain
  for (const rel of ['docs/config.json', 'data/config.json']) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) continue;
    try {
      const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
      let touched = false;
      if (cfg.targetBaseUrl === DEAD) { cfg.targetBaseUrl = LIVE; touched = true; }
      if (cfg.targetServerUrl === DEAD) { cfg.targetServerUrl = LIVE; touched = true; }
      if (touched) {
        fs.writeFileSync(p, JSON.stringify(cfg, null, 2) + '\n');
        changed.push(rel);
      }
    } catch (e) {
      console.warn('  ! skipped', rel, '-', e.message);
    }
  }

  // 2) Plain-text references to the dead free-plan URL
  for (const rel of ['scripts/generate-qrs.js', 'docs/index.html', 'docs/404.html', 'README.md', 'DEPLOYMENT.md']) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) continue;
    const t = fs.readFileSync(p, 'utf8');
    if (t.includes(DEAD)) writeIfChanged(rel, t.split(DEAD).join(LIVE));
  }

  // 3) Live-tape bridge in every generated standalone player page
  const bridgeScript = (id) => `
  <!-- LIVE TAPE BRIDGE (added by fix-qr-live-redirects.js): this static page is
       a preview card; the tape with the uploaded audio plays in the live app -->
  <script>
    (function () {
      var LIVE_URL = "${LIVE}/memory/${id}";
      function goLive() { window.location.replace(LIVE_URL); }
      var btn = document.getElementById('playBtn');
      if (btn) { btn.setAttribute('title', 'Play your uploaded tape'); btn.onclick = goLive; }
      var disc = document.querySelector('.disc-wrap');
      if (disc) disc.onclick = goLive;
      setTimeout(goLive, 2000);
    })();
  </script>`;

  const BRIDGE_MARKER = 'LIVE TAPE BRIDGE';
  const playerFiles = [];
  for (const dir of ['docs/m', 'docs/memory', 'public/m']) {
    for (let i = 1; i <= 8; i++) {
      for (const f of [path.join(dir, String(i), 'index.html'), path.join(dir, `${i}.html`)]) {
        const p = path.join(ROOT, f);
        if (fs.existsSync(p)) playerFiles.push({ rel: f.split(path.sep).join('/'), id: i });
      }
    }
  }
  for (const { rel, id } of playerFiles) {
    const p = path.join(ROOT, rel);
    const t = fs.readFileSync(p, 'utf8');
    if (t.includes(BRIDGE_MARKER)) continue; // already patched
    if (!t.includes('</body>')) continue;
    fs.writeFileSync(p, t.replace('</body>', bridgeScript(id) + '  </body>'));
    changed.push(rel);
  }

  // 4) Fix swapped QR PNGs (1.png encoded /memory/2, 2.png encoded /memory/1)
  try {
    const qrDir = path.join(ROOT, 'public', 'assets', 'qr');
    const f1 = path.join(qrDir, '1.png');
    const f2 = path.join(qrDir, '2.png');
    const marker = path.join(qrDir, '.qr12-swapped');
    if (fs.existsSync(f1) && fs.existsSync(f2) && !fs.existsSync(marker)) {
      const tmp = path.join(qrDir, '.1.tmp.png');
      fs.copyFileSync(f1, tmp);
      fs.copyFileSync(f2, f1);
      fs.copyFileSync(tmp, f2);
      fs.unlinkSync(tmp);
      fs.writeFileSync(marker, '1.png and 2.png were swapped so each encodes its own memory\n');
      changed.push('public/assets/qr/1.png + 2.png (swapped)');
    }
  } catch (e) {
    console.warn('  ! QR swap skipped:', e.message);
  }

  // 5) Hook the pages build script so regenerated pages keep the bridge
  {
    const rel = 'scripts/build-github-pages.js';
    const p = path.join(ROOT, rel);
    if (fs.existsSync(p) && !fs.readFileSync(p, 'utf8').includes('fix-qr-live-redirects.js')) {
      const t = fs.readFileSync(p, 'utf8');
      const oldMain = 'if (require.main === module) {\n  buildGitHubPages();\n}';
      const newMain = `if (require.main === module) {
  buildGitHubPages();
  // Re-apply the live-tape bridge so regenerated pages still jump to the live app
  try { require('../fix-qr-live-redirects.js').applyAll(); } catch (e) { console.warn('bridge re-apply skipped:', e.message); }
}`;
      if (t.includes(oldMain)) writeIfChanged(rel, t.split(oldMain).join(newMain));
    }
  }

  return changed;
}

if (require.main === module) {
  const files = applyAll();
  if (files.length) {
    console.log('OK - Patched:');
    files.forEach(f => console.log('   -', f));
    console.log('\nNow commit & push:');
    console.log('   git add -A');
    console.log('   git commit -m "fix: QR scans now open the live app so uploaded audio plays"');
    console.log('   git push origin main');
  } else {
    console.log('OK - Nothing to patch; everything is already up to date.');
  }
}

module.exports = { applyAll };
