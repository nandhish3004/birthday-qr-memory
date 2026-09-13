/**
 * 🧙‍♂️ Saint Nandhish — Personal Sarcastic Caricature Guide for Shaaaw
 * The creator himself, dressed as a saint, speaking directly to Shaaaw!
 */

const GURU_QUOTES = {
  welcome_showcase: [
    "Behold, Shaaaw! Your personal saint has descended from the Upside Down to grace your birthday.",
    "Yes, Shaaaw, I built an entire retro dimension just for you. You can thank me with cake later.",
    "Look upon my holy robes, Shaaaw, and marvel at the effort I put into being the greatest friend alive.",
    "Happy Birthday, Shaaaw! Don't worry, my eternal wisdom is enough for the both of us.",
    "8 chapters of memories unlocked from the Upside Down. Dive in, Shaaaw!"
  ],
  welcome_memory: [
    "Welcome to another chapter of our legendary adventures, Shaaaw. Prepare your emotions.",
    "The rift has opened! Let us see what questionable life choices we made here, Shaaaw.",
    "You have summoned me to this memory, Shaaaw. It was hand-picked with saintly care.",
    "Even Vecna took a day off just to celebrate your birthday, Shaaaw.",
    "Another chapter of Shaaaw's epic existence! Tap play and enjoy, birthday girl."
  ],
  video_play: [
    "Behold, Shaaaw! Video evidence of our questionable life choices. Try not to cringe too hard!",
    "Look at this footage, Shaaaw... honestly, Demogorgons aren't even half as chaotic as you.",
    "A rare artifact from the archives! Proof of my saintly patience dealing with you.",
    "Watch closely, Shaaaw. That is pure unscripted nostalgia right there!",
    "I risked my life in the Upside Down to retrieve this video tape for you, Shaaaw."
  ],
  audio_play: [
    "Max used Kate Bush to escape Vecna. You get to listen to this masterpiece, Shaaaw. You're welcome.",
    "Listen carefully, Shaaaw... that holy audio was blessed by your favorite saint.",
    "I spent hours getting this tape out of the Upside Down, so you better listen to every second, Shaaaw!",
    "Turn up the volume, Shaaaw! Even the Demodogs are grooving to this one.",
    "Running up that hill with you, Shaaaw! Best soundtrack for the best birthday girl."
  ],
  unassigned: [
    "Patience, Shaaaw! Even a saint needs a little time to prepare divine miracles.",
    "A little surprise is waiting here, Shaaaw... which means I'm brewing something special for you!",
    "Curiosity killed the Demogorgon, Shaaaw! Check back soon or ask me for a hint.",
    "Shh, Shaaaw, no spoilers! Some surprises are too legendary to reveal all at once.",
    "Hold your horses, Shaaaw! The Upside Down delivery service is running on 80s dial-up."
  ],
  click_guru: [
    "Hey! Do NOT touch the holy robe, Shaaaw, it's dry-clean only!",
    "Stop poking me, Shaaaw! I built you an entire website and this is the thanks I get?",
    "Yes, Shaaaw, my curls look divine today. No, you cannot touch them.",
    "Keep poking me, Shaaaw, and I'll send your birthday cake straight to the Upside Down!",
    "You are truly blessed to have a friend like me, Shaaaw. Remind yourself of this daily.",
    "Happy Birthday, Shaaaw! Now stop tapping my face and enjoy your memory!",
    "What, Shaaaw? You want more wisdom? Okay: never trust a Demodog with your snacks.",
    "I am Saint Nandhish, guardian of your birthday. Show some respect, Shaaaw!"
  ],
  admin: [
    "Welcome back, Oh Holy Creator. Remember to upload the best memories for Shaaaw.",
    "Make sure you set your live Render URL so Shaaaw's QR codes work smoothly!",
    "Replacing media won't change the physical QR code on Shaaaw's card. Pure genius.",
    "All 8 chapters are ready. Shaaaw is going to love this!"
  ]
};

class SarcasticGuru {
  constructor(context = 'welcome_memory') {
    this.context = context;
    this.isSpeaking = false;
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
      <div class="guru-speech-bubble" id="guruBubble">
        <span class="bubble-tag">✨ Saint Nandhish</span>
        <p class="bubble-text" id="guruText">Blessing Shaaaw's birthday...</p>
        <span class="bubble-tip">Tap me for divine wisdom</span>
      </div>
      <div class="guru-avatar-wrapper" id="guruAvatar" title="Tap Saint Nandhish for wisdom">
        <img src="/assets/caricature.png" alt="Saint Nandhish" class="guru-avatar-img">
        <div class="guru-glow-halo"></div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.bubble = document.getElementById('guruBubble');
    this.avatar = document.getElementById('guruAvatar');

    // Tap Saint to trigger funny personalized roast
    this.avatar.addEventListener('click', () => {
      this.avatar.classList.add('shake');
      setTimeout(() => this.avatar.classList.remove('shake'), 400);
      this.speakRandom('click_guru');
    });

    this.bubble.addEventListener('click', () => {
      this.speakRandom(this.context);
    });

    // Initial greeting after 0.8s
    setTimeout(() => {
      this.speakRandom(this.context);
    }, 800);
  }

  speak(text, duration = 6500) {
    if (!this.bubble) return;
    const textEl = document.getElementById('guruText');
    if (!textEl) return;

    clearTimeout(this.speechTimeout);
    textEl.textContent = text;
    this.bubble.classList.add('active');

    this.speechTimeout = setTimeout(() => {
      this.bubble.classList.remove('active');
    }, duration);
  }

  speakRandom(categoryKey) {
    const list = GURU_QUOTES[categoryKey] || GURU_QUOTES['welcome_memory'];
    const randomQuote = list[Math.floor(Math.random() * list.length)];
    this.speak(randomQuote);
  }

  setContext(newContext) {
    this.context = newContext;
    this.speakRandom(newContext);
  }
}

// Global accessor
window.initSarcasticGuru = function(context) {
  if (!window.guruInstance) {
    window.guruInstance = new SarcasticGuru(context);
  } else {
    window.guruInstance.setContext(context);
  }
  return window.guruInstance;
};
