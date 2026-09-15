#!/usr/bin/env node
/**
 * build-github-pages.js — REBUILT FROM SCRATCH
 * ---------------------------------------------------------------------------
 * The 8 QR stickers scan to GitHub Pages /m/N. The old build generated
 * "standalone players" with a BUILT-IN synthesized melody, so a scan never
 * reached your live app — and the audio you upload in the Admin Panel never
 * played.
 *
 * The new build is deliberately simple with zero moving parts:
 *   every /m/N page is a small on-theme "Opening your tape..." card that
 *   redirects straight to the LIVE app, where the uploaded audio lives:
 *       https://birthday-qr-memory.onrender.com/memory/N
 *   (JS jump after 1.5 s + 3 s meta-refresh fallback + visible button)
 *
 * It also:
 *   - rebuilds docs/index.html (hub) and docs/404.html
 *   - points docs/config.json / data/config.json at the live domain
 *     (away from the dead free-plan URL)
 *   - swaps the mislabeled public/assets/qr/1.png <-> 2.png
 *     (1.png encoded /memory/2 and vice versa) — guarded by a marker file
 *   - fixes doc references to the dead free-plan URL
 *
 * Usage:  node scripts/build-github-pages.js     (idempotent, safe to re-run)
 * Then:   git add -A
 *         git commit -m "rebuild: QR tape pages now open the live app"
 *         git push origin main
 * ---------------------------------------------------------------------------
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LIVE = 'https://birthday-qr-memory.onrender.com';
const DEAD = 'https://birthday-qr-memory-system.onrender.com';

const TAPES = [
  { id: 1, title: 'THE GENESIS MEMORY' },
  { id: 2, title: 'THE UNBREAKABLE BOND' },
  { id: 3, title: 'COZY MEMORIES & CONFESSIONS' },
  { id: 4, title: 'PURE JOY & SUNSHINE' },
  { id: 5, title: 'ADVENTURE & WANDERLUST' },
  { id: 6, title: 'GROWTH & RESILIENCE' },
  { id: 7, title: 'SOUNDTRACK OF OUR LIVES' },
  { id: 8, title: 'FOREVER & ALWAYS' },
];

const written = [];
function write(rel, text) {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
  written.push(rel);
}

/* ----------------------------- tape page ------------------------------ */
function tapePage(t) {
  const url = LIVE + '/memory/' + t.id;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tape 0${t.id} • For Shaaaw</title>
<meta http-equiv="refresh" content="3;url=${url}">
<style>
  html, body { margin:0; height:100%; display:flex; align-items:center; justify-content:center;
    background: radial-gradient(1200px 600px at 50% 18%, #2a1230, #120818 60%, #0a0510);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color:#fff; }
  .card { text-align:center; padding:2rem; }
  .tape { font-size:3.2rem; display:inline-block; animation: spin 2.5s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  h1 { font-size:1.35rem; letter-spacing:.12em; margin:.9rem 0 .3rem; color:#ffd7ec; }
  .sub { font-size:.95rem; opacity:.75; margin-bottom:1.4rem; }
  .dots::after { content:'…'; animation: dots 1.2s steps(4) infinite; }
  @keyframes dots { 0% { content:''; } 25% { content:'.'; } 50% { content:'..'; } 75% { content:'...'; } }
  a.btn { display:inline-block; margin-top:.4rem; color:#ff8fd0; text-decoration:none;
      border:1px solid #ff8fd0; padding:.6rem 1.4rem; border-radius:999px; font-size:.9rem; }
  a.btn:hover { background:rgba(255,143,208,.13); }
</style>
</head>
<body>
  <div class="card">
    <span class="tape">📼</span>
    <h1>TAPE 0${t.id} • ${t.title}</h1>
    <div class="sub">Opening your memory<span class="dots"></span></div>
    <a class="btn" href="${url}">Open your tape now</a>
  </div>
  <script>
    // Your uploaded audio lives in the live app — jump there.
    setTimeout(function () { window.location.replace(${JSON.stringify(url)}); }, 1500);
  </script>
</body>
</html>
`;
}

/* ------------------------------- hub ---------------------------------- */
function hubPage() {
  const tiles = TAPES
    .map(t => `    <a class="tile" href="${LIVE}/memory/${t.id}"><span class="n">TAPE 0${t.id}</span>${t.title}</a>`)
    .join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>For Shaaaw 💖 — Birthday QR Memory</title>
<style>
  html, body { margin:0; min-height:100%; background: radial-gradient(1200px 600px at 50% 10%, #2a1230, #120818 60%, #0a0510);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color:#fff; }
  .wrap { max-width:760px; margin:0 auto; padding:3.5rem 1.25rem 3rem; text-align:center; }
  .cake { font-size:3rem; }
  h1 { font-size:2rem; margin:.5rem 0 .25rem; letter-spacing:.06em; }
  .tag { opacity:.75; margin-bottom:2rem; }
  a.big { display:inline-block; background:#ff5fa2; color:#fff; text-decoration:none; font-weight:600;
    padding:.85rem 2rem; border-radius:999px; font-size:1.05rem; box-shadow:0 8px 30px rgba(255,95,162,.35); }
  a.big:hover { background:#ff79b0; }
  .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:.75rem; margin:2.25rem 0 1.5rem; text-align:left; }
  .tile { display:block; text-decoration:none; color:#fff; background:rgba(255,255,255,.06);
    border:1px solid rgba(255,255,255,.12); border-radius:14px; padding:.8rem 1rem; }
  .tile:hover { background:rgba(255,143,208,.12); border-color:#ff8fd0; }
  .tile .n { display:block; font-size:.7rem; letter-spacing:.18em; color:#ff8fd0; margin-bottom:.3rem; }
  .foot { display:flex; gap:1.5rem; justify-content:center; opacity:.7; font-size:.85rem; }
  .foot a { color:#ff9fd6; text-decoration:none; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="cake">🎂</div>
    <h1>For Shaaaw 💖</h1>
    <div class="tag">Divine Chaos Since Day 1 ♡ — 8 lifetimes of memories, locked in QR</div>
    <a class="big" href="${LIVE}">Open the Live Experience</a>
    <div class="grid">
${tiles}
    </div>
    <div class="foot">
      <a href="${LIVE}/kodak-print.html">📸 View the Poster</a>
      <a href="${LIVE}/admin.html">🔐 Admin</a>
    </div>
  </div>
</body>
</html>
`;
}

/* ------------------------------- 404 ---------------------------------- */
function notFoundPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lost Tape</title>
<meta http-equiv="refresh" content="3;url=${LIVE}">
<style>
  html, body { margin:0; height:100%; display:flex; align-items:center; justify-content:center;
    background:#120818; font-family:'Segoe UI', system-ui, sans-serif; color:#fff; text-align:center; }
  a { color:#ff8fd0; }
</style>
</head>
<body>
  <div>
    <div style="font-size:3rem">📼</div>
    <h1>Lost tape</h1>
    <p>Opening the memory hub<span style="animation:none">…</span></p>
    <p><a href="${LIVE}">Take me there now</a></p>
  </div>
</body>
</html>
`;
}

/* ---------------------------- side fixes ------------------------------ */
function patchJson(rel, key) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return;
  try {
    const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (cfg[key] === DEAD) {
      cfg[key] = LIVE;
      fs.writeFileSync(p, JSON.stringify(cfg, null, 2) + '\n');
      written.push(rel);
    }
  } catch (e) {
    console.warn('  ! skipped', rel, '-', e.message);
  }
}

function patchText(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return;
  const t = fs.readFileSync(p, 'utf8');
  if (t.includes(DEAD)) {
    fs.writeFileSync(p, t.split(DEAD).join(LIVE));
    written.push(rel);
  }
}

function swapQr() {
  const qrDir = path.join(ROOT, 'public', 'assets', 'qr');
  const f1 = path.join(qrDir, '1.png');
  const f2 = path.join(qrDir, '2.png');
  const marker = path.join(qrDir, '.qr12-swapped');
  if (!fs.existsSync(f1) || !fs.existsSync(f2) || fs.existsSync(marker)) return;
  const tmp = path.join(qrDir, '.1.tmp.png');
  fs.copyFileSync(f1, tmp);
  fs.copyFileSync(f2, f1);
  fs.copyFileSync(tmp, f2);
  fs.unlinkSync(tmp);
  fs.writeFileSync(marker, '1.png and 2.png were swapped so each encodes its own memory\n');
  written.push('public/assets/qr/1.png + 2.png (swapped)');
}

/* ------------------------------- main --------------------------------- */
function buildGitHubPages() {
  // 1. The 8 tape pages, at every path that can serve them
  for (const t of TAPES) {
    const html = tapePage(t);
    write(`docs/m/${t.id}.html`, html);
    write(`docs/m/${t.id}/index.html`, html);
    write(`docs/memory/${t.id}/index.html`, html);
    write(`public/m/${t.id}.html`, html);
    write(`public/m/${t.id}/index.html`, html);
  }
  // 2. Hub + 404
  write('docs/index.html', hubPage());
  write('docs/404.html', notFoundPage());
  // 3. Configs + docs pointing at the dead free-plan URL
  patchJson('docs/config.json', 'targetBaseUrl');
  patchJson('data/config.json', 'targetServerUrl');
  for (const rel of ['scripts/generate-qrs.js', 'README.md', 'DEPLOYMENT.md']) patchText(rel);
  // 4. Swapped QR PNGs
  swapQr();

  console.log(`✅ Rebuilt ${written.length} files for the live-redirect memory site.`);
  console.log('   Every /m/N tape page now opens ' + LIVE + '/memory/N');
  console.log('\nNow commit & push:');
  console.log('   git add -A');
  console.log('   git commit -m "rebuild: QR tape pages now open the live app"');
  console.log('   git push origin main');
}

buildGitHubPages();
