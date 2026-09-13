/**
 * 🧙‍♂️ Stranger Things Full Party Cameo Cast & Saint Nandhish Engine
 * Characters:
 * - 🧢 Steve Harrington
 * - 🏰 Will Byers
 * - ⚔️ Mike Wheeler
 * - 🎯 Lucas Sinclair
 * - 📻 Dustin Henderson
 * - 🧇 Eleven (011)
 * - 🕰️ Vecna (001)
 * - 🌸 Cute Demogorgon
 * - 🧙‍♂️ Saint Nandhish (The Host / Caricature)
 */

const CAMEO_QUOTES = {
  // 🧙‍♂️ Saint Nandhish (The Host / Creator)
  saint: [
    "Behold, Shaaaw! Your favorite saint has arrived to bless your birthday with divine vibes.",
    "Yes, Shaaaw, I brought Steve, Will, Mike, Lucas, and the entire Stranger Things party for you. You're welcome!",
    "Look upon my holy robes, Shaaaw, and marvel at the effort I put into being the greatest friend alive.",
    "Happy Birthday, Shaaaw! Don't worry, my eternal wisdom is enough for the both of us.",
    "Hey! Do NOT touch the holy robe, Shaaaw, it's dry-clean only!",
    "Stop poking me, Shaaaw! I built you an entire website and this is the thanks I get?",
    "Yes, Shaaaw, my curls look divine today. No, you cannot touch them.",
    "You are truly blessed to have a friend like me, Shaaaw. Remind yourself of this daily."
  ],

  // 🧢 Steve Harrington
  steve: [
    "Steve: Listen to me, Shaaaw. As Hawkins' official babysitter, I decree that you get the biggest slice of cake today. And don't let anyone touch your hair. Four puffs of Farrah Fawcett spray, remember!",
    "Steve: Yeah, yeah, I fought Demo-bats and Russian soldiers, but making sure Shaaaw has the best birthday in Hawkins? Now that's my real VIP mission.",
    "Steve: If anyone brings bad vibes to your birthday party, Shaaaw, I've got my spiked baseball bat ready in the trunk of the Beemer.",
    "Steve: Always the babysitter, never the birthday girl... wait, today is YOUR day, Shaaaw! Have an awesome one!",
    "Steve: Dustin keeps babbling about quantum physics, but I know true style when I see it. You're rocking it today, Shaaaw!",
    "Steve: Need a ride to Scoops Ahoy for an emergency birthday sundae, Shaaaw? Hop in, USS Butterscotch is on me!"
  ],

  // 🏰 Will Byers
  will: [
    "Will: Can we play D&D now? Just kidding, Happy Birthday Shaaaw! Castle Byers is officially dedicated to you today.",
    "Will: I survived the Upside Down, so I know true strength when I see it. You're the strongest and kindest, Shaaaw!",
    "Will: I drew a special birthday portrait of you, Shaaaw! Even the Mind Flayer thought it was cute.",
    "Will: The back of my neck isn't tingling today... that means all the monsters backed off so Shaaaw can celebrate in peace!",
    "Will: You're the Cleric of our party, Shaaaw. Whenever things get chaotic, you keep everyone's spirits alive. Happy Birthday!",
    "Will: Should I play 'Should I Stay or Should I Go' on the tape deck, Shaaaw? Only good vibes today!"
  ],

  // ⚔️ Mike Wheeler
  mike: [
    "Mike: If anyone ruins Shaaaw's birthday, they are out of the Party! Permanently! Do you copy, everyone?",
    "Mike: It's not just another year, Shaaaw, it's a legendary campaign level-up! Happy Birthday!",
    "Mike: El and I made sure the Upside Down gate stays sealed shut today so you can have the absolute best birthday ever.",
    "Mike: As Dungeon Master, I'm rolling a Natural 20 on Shaaaw's birthday happiness today!",
    "Mike: I promised Dustin I wouldn't argue with him today, solely out of respect for Shaaaw's birthday!",
    "Mike: Friends don't lie, Shaaaw. You really are one of the most incredible people in our universe."
  ],

  // 🎯 Lucas Sinclair
  lucas: [
    "Lucas: I've got my wrist rocket loaded with birthday confetti, Shaaaw! Stand back and celebrate!",
    "Lucas: Max and I agreed: Shaaaw gets ultimate Party privileges and the best playlist all week long.",
    "Lucas: Stay alert, Shaaaw! Demodogs might try to sneak a bite of your birthday cake!",
    "Lucas: We're running on Lucas Sinclair time today—that means non-stop high-energy birthday hype!",
    "Lucas: When things get crazy in Hawkins, you're always the steady one, Shaaaw. Have the happiest birthday!",
    "Lucas: I brought extra fireworks from the 4th of July just to light up your special day, Shaaaw!"
  ],

  // 📻 Dustin Henderson
  dustin: [
    "Dustin: Code Red, Shaaaw! Cerebro is detecting dangerously high levels of birthday joy!",
    "Dustin: NeverEnding Birthday! Ah-ah-ah-ah-ah-ah... do you copy, Shaaaw?",
    "Dustin: She's our friend and she's crazy awesome! Happy Birthday Shaaaw!",
    "Dustin: Hold onto your thinking caps, people, Shaaaw is leveling up today!",
    "Dustin: Grr! My pearly whites are gleaming just thinking about your birthday cake, Shaaaw!"
  ],

  // 🧇 Eleven (011)
  eleven: [
    "Eleven: Friends don't lie. Shaaaw is the prettiest birthday girl in Hawkins! 🧇",
    "Eleven: I used my telekinesis to bring extra Eggo waffles for your party, Shaaaw!",
    "Eleven: Mouthbreathers better stay away from Shaaaw's birthday cake!",
    "Eleven: You are my friend, Shaaaw. Today is special.",
    "Eleven: Bitchin'. That's what your birthday is going to be, Shaaaw."
  ],

  // 🕰️ Vecna (001 / Henry Creel)
  vecna: [
    "Vecna: Tick-tock, Shaaaw... time is running out to eat all the birthday cake.",
    "Vecna: Four chimes for Shaaaw! Even in the Upside Down, we pause to celebrate you.",
    "Vecna: I tried to curse this memory, but your friend's code was too powerful.",
    "Vecna: Your suffering... has ended. Now blow out your candles, Shaaaw.",
    "Vecna: You cannot escape your destiny, Shaaaw... which is having a magnificent birthday."
  ],

  // 🌸 Cute Demogorgon
  demogorgon: [
    "Demogorgon: *Happy flower-face purrs* 🌸 (Translation: Happy Birthday, Shaaaw!)",
    "Demogorgon: *Wiggles happily with party hat* 🎁 (I promise not to eat the birthday cake!)",
    "Demogorgon: *Soft clicking noises* 💗 (Even monsters from the Upside Down love Shaaaw!)"
  ],

  // Contextual triggers
  video_play: [
    "Saint Nandhish: Behold, Shaaaw! Video evidence of our questionable life choices. Try not to cringe!",
    "Steve: Look at this video, Shaaaw! Classic 80s gold. You two are wild.",
    "Dustin: Holy roll! Look at that video footage! That is pure Hawkins history, Shaaaw!"
  ],
  audio_play: [
    "Saint Nandhish: Max used Kate Bush to escape Vecna. You get to listen to this masterpiece, Shaaaw.",
    "Lucas: Turn it up, Shaaaw! That track is bumping through the Walkman!",
    "Dustin: That sound quality is mint! Cerebro is picking up the beat, Shaaaw!"
  ],
  unassigned: [
    "Saint Nandhish: Patience, Shaaaw! Even a saint needs time to prepare divine miracles.",
    "Will: Don't worry, Shaaaw, a secret surprise is being prepared in Castle Byers!",
    "Eleven: Shh, Shaaaw. A secret surprise is hiding in the void..."
  ],
  admin: [
    "Saint Nandhish: Welcome back, Oh Holy Creator! Upload your memories for Shaaaw.",
    "Saint Nandhish: Make sure your live Render link is set so Shaaaw's QRs work smoothly."
  ]
};

const CAMEO_METADATA = {
  saint: { name: "✨ Saint Nandhish", colorClass: "bubble-saint" },
  steve: { name: "🧢 Steve Harrington", colorClass: "bubble-steve" },
  will: { name: "🏰 Will Byers", colorClass: "bubble-will" },
  mike: { name: "⚔️ Mike Wheeler", colorClass: "bubble-mike" },
  lucas: { name: "🎯 Lucas Sinclair", colorClass: "bubble-lucas" },
  dustin: { name: "📻 Dustin Henderson", colorClass: "bubble-dustin" },
  eleven: { name: "🧇 Eleven (011)", colorClass: "bubble-eleven" },
  vecna: { name: "🕰️ Vecna Cameo", colorClass: "bubble-vecna" },
  demogorgon: { name: "🌸 Cute Demogorgon", colorClass: "bubble-demogorgon" }
};

class CameoCastEngine {
  constructor(context = 'saint') {
    this.context = context;
    this.container = null;
    this.bubble = null;
    this.avatar = null;
    this.speechTimeout = null;
    this.init();
  }

  init() {
    if (document.getElementById('sarcasticGuruWidget')) return;

    this.container = document.createElement('div');
    this.container.id = 'sarcasticGuruWidget';
    this.container.className = 'guru-companion-widget';

    this.container.innerHTML = `
      <div class="guru-quick-cameos" id="guruQuickCameos">
        <button class="quick-cameo-btn" onclick="triggerCameo('steve')" title="Steve Harrington">🧢</button>
        <button class="quick-cameo-btn" onclick="triggerCameo('will')" title="Will Byers">🏰</button>
        <button class="quick-cameo-btn" onclick="triggerCameo('mike')" title="Mike Wheeler">⚔️</button>
        <button class="quick-cameo-btn" onclick="triggerCameo('lucas')" title="Lucas Sinclair">🎯</button>
        <button class="quick-cameo-btn" onclick="triggerCameo('dustin')" title="Dustin Henderson">📻</button>
        <button class="quick-cameo-btn" onclick="triggerCameo('eleven')" title="Eleven (011)">🧇</button>
        <button class="quick-cameo-btn" onclick="triggerCameo('vecna')" title="Vecna">🕰️</button>
        <button class="quick-cameo-btn" onclick="triggerCameo('demogorgon')" title="Demogorgon">🌸</button>
        <button class="quick-cameo-btn" onclick="triggerCameo('saint')" title="Saint Nandhish">🧙‍♂️</button>
      </div>

      <div class="guru-speech-bubble" id="guruBubble">
        <span class="bubble-tag" id="guruSpeakerTag">✨ Saint Nandhish</span>
        <p class="bubble-text" id="guruText">Blessing Shaaaw's birthday...</p>
        <span class="bubble-tip">Tap character buttons above for cameos!</span>
      </div>

      <div class="guru-avatar-wrapper" id="guruAvatar" title="Tap Saint Nandhish for holy blessings">
        <img src="/assets/caricature.png" alt="Saint Nandhish" class="guru-avatar-img">
        <div class="guru-glow-halo"></div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.bubble = document.getElementById('guruBubble');
    this.avatar = document.getElementById('guruAvatar');

    // Tap Saint Nandhish
    this.avatar.addEventListener('click', () => {
      this.avatar.classList.add('shake');
      setTimeout(() => this.avatar.classList.remove('shake'), 400);
      this.speakCharacter('saint');
    });

    this.bubble.addEventListener('click', () => {
      this.speakRandom(this.context);
    });

    this.removeWhiteBackground();

    setTimeout(() => {
      this.speakCharacter('saint');
    }, 900);
  }

  removeWhiteBackground() {
    const img = this.avatar ? this.avatar.querySelector('img') : null;
    if (!img) return;

    const process = () => {
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

        // BFS Flood fill starting exclusively from outer edges
        const isWhite = (x, y) => {
          const idx = (y * w + x) * 4;
          return data[idx] > 220 && data[idx + 1] > 220 && data[idx + 2] > 220;
        };

        const visited = new Uint8Array(w * h);
        const queue = [];

        for (let x = 0; x < w; x++) {
          if (isWhite(x, 0)) { queue.push((0 * w) + x); visited[(0 * w) + x] = 1; }
          if (isWhite(x, h - 1)) { queue.push(((h - 1) * w) + x); visited[((h - 1) * w) + x] = 1; }
        }
        for (let y = 0; y < h; y++) {
          if (isWhite(0, y)) { queue.push((y * w) + 0); visited[(y * w) + 0] = 1; }
          if (isWhite(w - 1, y)) { queue.push((y * w) + (w - 1)); visited[(y * w) + (w - 1)] = 1; }
        }

        let head = 0;
        while (head < queue.length) {
          const pos = queue[head++];
          const cx = pos % w;
          const cy = Math.floor(pos / w);

          const idx = (cy * w + cx) * 4;
          data[idx + 3] = 0; // Transparent

          const neighbors = [
            [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nPos = ny * w + nx;
              if (!visited[nPos] && isWhite(nx, ny)) {
                visited[nPos] = 1;
                queue.push(nPos);
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        img.src = canvas.toDataURL('image/png');
      } catch (err) {
        console.warn('Background removal notice:', err);
      }
    };

    if (img.complete && img.naturalWidth) {
      process();
    } else {
      img.onload = process;
    }
  }

  speak(speaker, text, colorClass = 'bubble-saint', duration = 7500) {
    if (!this.bubble) return;
    const tagEl = document.getElementById('guruSpeakerTag');
    const textEl = document.getElementById('guruText');
    if (!textEl) return;

    clearTimeout(this.speechTimeout);

    // Remove old bubble color classes
    const classesToRemove = [
      'bubble-saint', 'bubble-steve', 'bubble-will', 'bubble-mike', 
      'bubble-lucas', 'bubble-dustin', 'bubble-eleven', 'bubble-vecna', 'bubble-demogorgon'
    ];
    this.bubble.classList.remove(...classesToRemove);
    this.bubble.classList.add(colorClass || 'bubble-saint');

    if (tagEl) tagEl.textContent = speaker || "✨ Saint Nandhish";
    textEl.textContent = text;
    this.bubble.classList.add('active');

    this.speechTimeout = setTimeout(() => {
      this.bubble.classList.remove('active');
    }, duration);
  }

  speakCharacter(charKey) {
    const list = CAMEO_QUOTES[charKey] || CAMEO_QUOTES['saint'];
    const text = list[Math.floor(Math.random() * list.length)];
    const meta = CAMEO_METADATA[charKey] || CAMEO_METADATA['saint'];

    this.speak(meta.name, text, meta.colorClass);

    // Subtle celebration pop when tapping characters
    if (typeof confetti === 'function') {
      try {
        confetti({
          particleCount: 15,
          spread: 45,
          origin: { x: 0.9, y: 0.85 },
          colors: ['#ff4d6d', '#ffb703', '#00b4d8', '#7209b7', '#38b000']
        });
      } catch (_) {}
    }
  }

  speakRandom(categoryKey) {
    const list = CAMEO_QUOTES[categoryKey] || CAMEO_QUOTES['saint'];
    const text = list[Math.floor(Math.random() * list.length)];
    this.speak("✨ Saint Nandhish", text, 'bubble-saint');
  }

  setContext(newContext) {
    this.context = newContext;
    this.speakRandom(newContext);
  }
}

// Global accessor
window.initSarcasticGuru = function(context) {
  if (!window.guruInstance) {
    window.guruInstance = new CameoCastEngine(context);
  } else {
    window.guruInstance.setContext(context);
  }
  return window.guruInstance;
};

// Global cameo trigger
window.triggerCameo = function(charKey) {
  if (window.theaterInstance) {
    window.theaterInstance.loadScene(charKey);
  }
  if (window.guruInstance) {
    window.guruInstance.speakCharacter(charKey);
  }
};
