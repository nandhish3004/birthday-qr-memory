const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const M_DIR = path.join(DOCS_DIR, 'm');

if (!fs.existsSync(M_DIR)) {
  fs.mkdirSync(M_DIR, { recursive: true });
}

function generateRedirectPage(memoryId, defaultTarget = 'https://birthday-qr-memory-system.onrender.com') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Opening Tape 0${memoryId} ✨ For Shaaaw</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📼</text></svg>">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:ital,wght@1,600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      background: radial-gradient(circle at top, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%);
      color: #0f172a;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .card {
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 28px;
      padding: 40px 32px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(225, 29, 72, 0.18);
      position: relative;
      overflow: hidden;
    }
    .badge {
      display: inline-block;
      background: #ffe4e6;
      color: #e11d48;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 6px 14px;
      border-radius: 999px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 1.45rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 10px;
    }
    p {
      color: #64748b;
      font-size: 0.92rem;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .loader-ring {
      width: 64px;
      height: 64px;
      margin: 0 auto 20px;
      border: 4px solid #ffe4e6;
      border-top-color: #e11d48;
      border-radius: 50%;
      animation: spin 0.85s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .action-btn {
      display: inline-block;
      background: linear-gradient(135deg, #e11d48, #f43f5e);
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.95rem;
      padding: 12px 24px;
      border-radius: 999px;
      box-shadow: 0 8px 20px rgba(225, 29, 72, 0.35);
      transition: transform 0.2s;
    }
    .action-btn:hover {
      transform: translateY(-2px);
    }
    .footer-text {
      margin-top: 24px;
      font-size: 0.76rem;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">✨ TAPE 0${memoryId} &bull; LIFETIME HUB ✨</span>
    <div class="loader-ring"></div>
    <h1>Connecting to Tape 0${memoryId}...</h1>
    <p>Opening Shaaaw's birthday memory archive. If your screen doesn't redirect automatically, tap below!</p>
    <a href="${defaultTarget}/memory/${memoryId}" class="action-btn" id="manualBtn">
      ▶ Open Memory Now
    </a>
    <div class="footer-text">
      🔒 Permanent QR Resolver &bull; Powered by GitHub Pages
    </div>
  </div>

  <script>
    const memoryId = ${memoryId};
    const defaultTarget = "${defaultTarget}";

    async function routeToActiveServer() {
      let targetUrl = defaultTarget + '/memory/' + memoryId;

      try {
        // Fetch current active server endpoint from config.json if available
        const res = await fetch('../config.json?t=' + Date.now());
        if (res.ok) {
          const cfg = await res.json();
          if (cfg && cfg.targetBaseUrl) {
            const clean = cfg.targetBaseUrl.replace(/\\/+$/, '');
            targetUrl = clean + '/memory/' + memoryId;
          }
        }
      } catch (e) {
        console.warn('Using default target URL:', targetUrl);
      }

      const btn = document.getElementById('manualBtn');
      if (btn) btn.href = targetUrl;

      // Seamless redirect
      window.location.replace(targetUrl);
    }

    routeToActiveServer();
  </script>
</body>
</html>`;
}

function generateIndexPage(defaultTarget = 'https://birthday-qr-memory-system.onrender.com') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shaaaw's Birthday Memories &bull; Permanent Resolver Hub</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎁</text></svg>">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:ital,wght@1,600;1,700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      background: #0f172a;
      color: #f8fafc;
      padding: 32px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .hub-container {
      max-width: 600px;
      width: 100%;
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 28px;
      padding: 36px 28px;
      text-align: center;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-block;
      background: rgba(225, 29, 72, 0.2);
      border: 1px solid rgba(225, 29, 72, 0.4);
      color: #fda4af;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 6px 16px;
      border-radius: 999px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 1.8rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 10px;
    }
    p {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .tape-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .tape-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 12px 16px;
      border-radius: 14px;
      color: #f1f5f9;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .tape-btn:hover {
      background: rgba(225, 29, 72, 0.25);
      border-color: #e11d48;
      transform: translateY(-2px);
      color: #fff;
    }
    .live-app-btn {
      display: inline-block;
      background: linear-gradient(135deg, #e11d48, #f43f5e);
      color: #fff;
      text-decoration: none;
      font-weight: 700;
      padding: 14px 28px;
      border-radius: 999px;
      font-size: 1rem;
      box-shadow: 0 10px 25px rgba(225, 29, 72, 0.4);
      margin-top: 10px;
    }
    .footer-note {
      margin-top: 24px;
      font-size: 0.78rem;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="hub-container">
    <span class="badge">🔒 PERMANENT RESOLVER VAULT &bull; ACTIVE</span>
    <h1>Shaaaw's Birthday Archive</h1>
    <p>Lifetime Resolver Hub hosted on GitHub Pages. Every scanned physical QR code resolves through this hub directly to Shaaaw's memory playback.</p>

    <div class="tape-grid">
      <a href="m/1.html" class="tape-btn"><span>📼</span> Tape 01</a>
      <a href="m/2.html" class="tape-btn"><span>📼</span> Tape 02</a>
      <a href="m/3.html" class="tape-btn"><span>📼</span> Tape 03</a>
      <a href="m/4.html" class="tape-btn"><span>📼</span> Tape 04</a>
      <a href="m/5.html" class="tape-btn"><span>📼</span> Tape 05</a>
      <a href="m/6.html" class="tape-btn"><span>📼</span> Tape 06</a>
      <a href="m/7.html" class="tape-btn"><span>📼</span> Tape 07</a>
      <a href="m/8.html" class="tape-btn"><span>📼</span> Tape 08</a>
    </div>

    <a href="${defaultTarget}" class="live-app-btn" id="liveAppBtn">
      ✨ Enter Full Birthday Experience
    </a>

    <p class="footer-note">
      Permanent Hub for: <code>https://nandhish3004.github.io/birthday-qr-memory</code>
    </p>
  </div>

  <script>
    async function init() {
      try {
        const res = await fetch('config.json?t=' + Date.now());
        if (res.ok) {
          const cfg = await res.json();
          if (cfg && cfg.targetBaseUrl) {
            document.getElementById('liveAppBtn').href = cfg.targetBaseUrl;
          }
        }
      } catch (e) {}
    }
    init();
  </script>
</body>
</html>`;
}

function buildGitHubPages(targetBaseUrl = 'https://birthday-qr-memory-system.onrender.com') {
  console.log('Building GitHub Pages Permanent Redirect Hub...');
  
  // 1. Write config.json
  const config = {
    targetBaseUrl,
    updatedAt: new Date().toISOString(),
    permanentDomain: 'https://nandhish3004.github.io/birthday-qr-memory'
  };
  fs.writeFileSync(path.join(DOCS_DIR, 'config.json'), JSON.stringify(config, null, 2));

  // 2. Write index.html & 404.html
  const indexHtml = generateIndexPage(targetBaseUrl);
  fs.writeFileSync(path.join(DOCS_DIR, 'index.html'), indexHtml);
  fs.writeFileSync(path.join(DOCS_DIR, '404.html'), indexHtml);

  // 3. Write individual m/1.html ... m/8.html
  for (let i = 1; i <= 8; i++) {
    const pageHtml = generateRedirectPage(i, targetBaseUrl);
    fs.writeFileSync(path.join(M_DIR, `${i}.html`), pageHtml);
    // Also support /m/1 (without .html) via folder structure
    const tapeDir = path.join(M_DIR, `${i}`);
    if (!fs.existsSync(tapeDir)) fs.mkdirSync(tapeDir, { recursive: true });
    fs.writeFileSync(path.join(tapeDir, 'index.html'), pageHtml);
  }

  console.log('✅ GitHub Pages docs/ created successfully with all 8 resolvers!');
}

if (require.main === module) {
  const target = process.argv[2] || 'https://birthday-qr-memory-system.onrender.com';
  buildGitHubPages(target);
}

module.exports = { buildGitHubPages, DOCS_DIR };
