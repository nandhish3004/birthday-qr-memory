/**
 * 🕉️ LORD NANDHISH — SUPREME COSMIC PRESERVER & CELESTIAL AVATAR
 * 
 * Far superior to mortal saints!
 * - Four Divine Arms: Sudarshana Chakra, Panchajanya Shankha, Kaumodaki Gada, and Abhaya Mudra
 * - Cosmic Protector of Shaaaw's Eternal Birthday Joy
 * - Preserver of the 8 Eternal Memory Tapes across space and time
 */

const LORD_NANDHISH_DECREES = [
  "I am Lord Nandhish, Preserver of the Multiverse and Supreme Sovereign of Shaaaw's Joy! Saint Nandhish is merely my humble earthly representative.",
  "Behold my Sudarshana Chakra! It spins eternally to slice away all sorrow, doubt, and mid vibes from Shaaaw's path across all galaxies!",
  "With my Panchajanya Conch, I sound the sacred cosmic vibration of celebration! Every star in the heavens honors Shaaaw today!",
  "By the crushing power of my Kaumodaki Gada, every demodog, bad vibe, and worry near Shaaaw is pulverized into harmless stardust!",
  "Abhaya Mudra: Fear nothing, Shaaaw! Lift your head in joy. Under my four divine arms, your happiness is eternal and untouchable.",
  "Saint Nandhish built an earthly archive. I, Lord Nandhish, have engraved Shaaaw's name into the celestial ledger of the cosmos!",
  "The 8 Tapes of Memory are consecrated by my cosmic authority. Neither time, nor space, nor server restarts can ever destroy them!",
  "A decree to the universe: Let the cake be heavenly, let the laughter be boundless, and let Shaaaw be blessed beyond measure today!"
];

class LordNandhishCosmicEngine {
  constructor() {
    this.currentDecreeIndex = 0;
    this.audioCtx = null;
    this.init();
  }

  init() {
    if (document.getElementById('lordNandhishDarshanPill')) return;

    this.renderTriggerPill();
    this.renderDarshanModal();
    this.bindEvents();
    this.ensureTransparentAvatar();
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.audioCtx = new AudioContext();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Sacred Conch / Drone Sound Synthesizer
  playDivineSound(type = 'conch') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'conch') {
        // Deep resonant sacred drone
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(136.1, now); // 136.1 Hz = Om frequency
        osc.frequency.linearRampToValueAtTime(140, now + 1.2);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(272.2, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 2.0);
        osc2.stop(now + 2.0);
      } else if (type === 'chakra') {
        // High frequency spinning laser hum
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.4);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'gada') {
        // Heavy thunder bass impact
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (_) {}
  }

  renderTriggerPill() {
    const pill = document.createElement('div');
    pill.id = 'lordNandhishDarshanPill';
    pill.className = 'lord-darshan-pill';
    pill.title = 'Seek the Supreme Darshan of Lord Nandhish';

    pill.innerHTML = `
      <div class="lord-pill-avatar-wrap">
        <img src="/assets/lord-nandhish.png" alt="Lord Nandhish" class="lord-pill-avatar-img" id="lordPillAvatarImg">
      </div>
      <div class="lord-pill-info">
        <span class="lord-pill-title">🕉️ Lord Nandhish</span>
        <span class="lord-pill-sub">Supreme Cosmic Preserver</span>
      </div>
    `;

    document.body.appendChild(pill);
  }

  renderDarshanModal() {
    const overlay = document.createElement('div');
    overlay.id = 'lordDarshanOverlay';
    overlay.className = 'lord-darshan-overlay';

    overlay.innerHTML = `
      <div class="lord-cosmos-card">
        <button class="lord-close-btn" id="lordCloseBtn" title="Close Darshan">✕</button>

        <span class="lord-header-badge">
          <span>🕉️ MAHA VISHNU AVATAR</span> &bull; <span>SUPREME CELESTIAL DEITY</span>
        </span>

        <h2 class="lord-main-title">LORD NANDHISH</h2>
        <p class="lord-subtitle">
          Supreme Preserver of the Multiverse & Sovereign Guardian of Shaaaw's 8 Birthday Tapes
        </p>

        <!-- Divine Avatar Stage with Rotating Sudarshana Chakra -->
        <div class="lord-stage-wrap">
          <div class="lord-cosmic-halo"></div>
          <div class="lord-sudarshana-chakra" id="lordChakra" title="Sudarshana Chakra of Infinite Joy"></div>
          <img src="/assets/lord-nandhish.png" alt="Lord Nandhish" class="lord-avatar-figure" id="lordMainFigure">
        </div>

        <!-- Divine Decree Speech Box -->
        <div class="lord-decree-box">
          <span class="lord-speaker-badge">🕉️ SUPREME COSMIC DECREE</span>
          <p class="lord-decree-text" id="lordDecreeText">
            "I am Lord Nandhish, Preserver of the Multiverse and Supreme Sovereign of Shaaaw's Joy! Saint Nandhish is merely my humble earthly representative."
          </p>
        </div>

        <!-- Cosmic Powers Toolbar -->
        <div class="lord-powers-row">
          <button class="lord-power-btn" id="btnSpinChakra">
            <span>🌀 Spin Sudarshana Chakra</span>
          </button>
          <button class="lord-power-btn" id="btnSoundConch">
            <span>🐚 Sound Sacred Shankha</span>
          </button>
          <button class="lord-power-btn" id="btnStrikeGada">
            <span>⚡ Strike Kaumodaki Gada</span>
          </button>
          <button class="lord-power-btn" id="btnAbhayaBlessing" style="background:linear-gradient(135deg,#f59e0b,#d97706); border-color:#fef08a;">
            <span>✨ Bestow Abhaya Blessing</span>
          </button>
        </div>

        <div class="saint-reverence-banner">
          <span>🙏 <strong>Saint Nandhish bows in reverence:</strong> "My Lord Nandhish, You are the Supreme Preserver. Shaaaw is in divine hands!"</span>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  bindEvents() {
    const pill = document.getElementById('lordNandhishDarshanPill');
    const overlay = document.getElementById('lordDarshanOverlay');
    const closeBtn = document.getElementById('lordCloseBtn');
    const mainFig = document.getElementById('lordMainFigure');
    const chakra = document.getElementById('lordChakra');

    if (pill) {
      pill.addEventListener('click', () => {
        this.openDarshan();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeDarshan();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeDarshan();
      });
    }

    // Tapping Lord Nandhish or his speech box cycles through his supreme decrees
    if (mainFig) {
      mainFig.addEventListener('click', () => {
        this.nextDecree();
        this.playDivineSound('chakra');
      });
    }

    const decreeBox = document.querySelector('.lord-decree-box');
    if (decreeBox) {
      decreeBox.addEventListener('click', () => this.nextDecree());
    }

    // Power Buttons
    const btnSpin = document.getElementById('btnSpinChakra');
    if (btnSpin) {
      btnSpin.addEventListener('click', () => {
        this.spinChakraEffect();
      });
    }

    const btnConch = document.getElementById('btnSoundConch');
    if (btnConch) {
      btnConch.addEventListener('click', () => {
        this.playDivineSound('conch');
        this.setDecree("With my Panchajanya Conch, I sound the sacred cosmic vibration of celebration! Every star in the heavens honors Shaaaw today! 🐚✨");
        this.fireSacredConfetti();
      });
    }

    const btnGada = document.getElementById('btnStrikeGada');
    if (btnGada) {
      btnGada.addEventListener('click', () => {
        this.playDivineSound('gada');
        this.setDecree("By the crushing power of my Kaumodaki Gada, all stress, sadness, and bad luck near Shaaaw are obliterated into stardust! ⚡💥");
        const card = document.querySelector('.lord-cosmos-card');
        if (card) {
          card.style.transform = 'scale(1.02)';
          setTimeout(() => card.style.transform = '', 200);
        }
      });
    }

    const btnAbhaya = document.getElementById('btnAbhayaBlessing');
    if (btnAbhaya) {
      btnAbhaya.addEventListener('click', () => {
        this.playDivineSound('conch');
        this.setDecree("Abhaya Mudra: Fear nothing, Shaaaw! Lift your head in joy. Under my four divine arms, your happiness is eternal and untouchable! 💗✨");
        this.fireSacredConfetti(120);
      });
    }
  }

  openDarshan() {
    const overlay = document.getElementById('lordDarshanOverlay');
    if (overlay) {
      overlay.classList.add('active');
      this.playDivineSound('conch');
      this.fireSacredConfetti(60);

      // If Saint Nandhish is on page, make Saint Nandhish speak in reverence
      if (window.guruInstance) {
        window.guruInstance.speak(
          "✨ Saint Nandhish",
          "🙏 *Bows in awe* Look upon Lord Nandhish, Shaaaw! The Supreme Cosmic Preserver has descended for your birthday!",
          'bubble-saint',
          8000
        );
      }
    }
  }

  closeDarshan() {
    const overlay = document.getElementById('lordDarshanOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  nextDecree() {
    this.currentDecreeIndex = (this.currentDecreeIndex + 1) % LORD_NANDHISH_DECREES.length;
    this.setDecree(LORD_NANDHISH_DECREES[this.currentDecreeIndex]);
    this.fireSacredConfetti(25);
  }

  setDecree(text) {
    const el = document.getElementById('lordDecreeText');
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = `"${text}"`;
        el.style.opacity = '1';
      }, 150);
    }
  }

  spinChakraEffect() {
    const chakra = document.getElementById('lordChakra');
    if (chakra) {
      chakra.classList.add('speedup');
      this.playDivineSound('chakra');
      this.setDecree("The Sudarshana Chakra accelerates to cosmic velocity! All obstacles before Shaaaw are cleanly sliced away! 🌀⚡");
      this.fireSacredConfetti(40);
      setTimeout(() => chakra.classList.remove('speedup'), 2500);
    }
  }

  fireSacredConfetti(count = 50) {
    if (typeof confetti === 'function') {
      try {
        confetti({
          particleCount: count,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#a855f7', '#ec4899', '#fef08a']
        });
      } catch (_) {}
    }
  }

  // Client-side Flood Fill Background Cleaner fallback:
  // Guarantees that any residual faux-checkerboard is made 100% transparent on any device
  ensureTransparentAvatar() {
    const imgs = [
      document.getElementById('lordPillAvatarImg'),
      document.getElementById('lordMainFigure')
    ];

    imgs.forEach(img => {
      if (!img) return;

      const cleanCanvas = () => {
        try {
          const canvas = document.createElement('canvas');
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          if (!w || !h) return;

          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;

          const isChecker = (idx) => {
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const diff = Math.max(r, g, b) - Math.min(r, g, b);
            if (diff > 16) return false;
            // Either grey checkerboard (165-220) or white (>235)
            return (r >= 165 && r <= 220) || (r >= 235 && g >= 235 && b >= 235);
          };

          const isBoundary = (idx) => {
            return data[idx] < 100 && data[idx + 1] < 100 && data[idx + 2] < 100;
          };

          // Outer BFS flood fill from 4 borders
          const visited = new Uint8Array(w * h);
          const queue = [];

          const push = (x, y) => {
            const p = y * w + x;
            if (!visited[p]) {
              visited[p] = 1;
              queue.push(p);
            }
          };

          for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
          for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }

          let head = 0;
          while (head < queue.length) {
            const pos = queue[head++];
            const cx = pos % w;
            const cy = Math.floor(pos / w);
            const idx = pos * 4;

            if (isBoundary(idx)) continue;

            if (isChecker(idx)) {
              data[idx + 3] = 0; // Transparent
              if (cx > 0) push(cx - 1, cy);
              if (cx < w - 1) push(cx + 1, cy);
              if (cy > 0) push(cx, cy - 1);
              if (cy < h - 1) push(cx, cy + 1);
            }
          }

          ctx.putImageData(imgData, 0, 0);
          img.src = canvas.toDataURL('image/png');
        } catch (err) {
          console.log('Lord Nandhish transparency canvas check completed:', err);
        }
      };

      if (img.complete && img.naturalWidth) {
        cleanCanvas();
      } else {
        img.onload = cleanCanvas;
      }
    });
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.lordNandhishInstance = new LordNandhishCosmicEngine();
});
