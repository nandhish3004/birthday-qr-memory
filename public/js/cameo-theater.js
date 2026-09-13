/**
 * 🎬 Hawkins Cameo Theater — 30-Second Character Animation Engine
 * Features:
 * - Animated Guest Characters: 🧢 Steve, 🛹 Max, 📻 Dustin, 🧇 Eleven, 🏰 Will, ⚔️ Mike, 🎯 Lucas, 🕰️ Vecna
 * - Animated Host: 🧙‍♂️ Saint Nandhish (Caricature with levitation, glowing halo, expressive talking motions)
 * - 30-Second scripted back-and-forth conversations addressing Shaaaw directly
 * - Auto-sequencing: Steve (30s) -> Max (30s) -> Dustin (30s) -> Eleven (30s), etc.
 * - Interactive guest selector tabs, play/pause, next guest controls
 * - Web Audio retro synth chimes & confetti pops
 */

// ==========================================================================
// 1. Scripted 30-Second Back-and-Forth Conversations
// ==========================================================================
const CAMEO_SCENES = {
  steve: {
    id: 'steve',
    name: 'Steve Harrington',
    badge: '🧢 Steve',
    themeColor: '#38bdf8',
    avatarEmoji: '🧢',
    dialogues: [
      {
        speaker: 'guest',
        name: 'Steve Harrington',
        text: "Yo, robe guy! Is this the official VIP lounge for Shaaaw's birthday? Hawkins High sent me to babysit.",
        duration: 5500,
        guestAnim: 'talk-gesture',
        hostAnim: 'listen'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "Welcome, Harrington! Yes, Shaaaw is the guest of honor today. Keep those demodogs far away from her cake.",
        duration: 6000,
        guestAnim: 'idle',
        hostAnim: 'talk-bless'
      },
      {
        speaker: 'guest',
        name: 'Steve Harrington',
        text: "Wait a second... killer curls, holy man! What is that, four puffs of Farrah Fawcett spray? Respect.",
        duration: 5500,
        guestAnim: 'talk-hair',
        hostAnim: 'listen-smile'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "Pure divine genetics, Steve. Now did you bring the Scoops Ahoy sundaes for Shaaaw or what?",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-proud'
      },
      {
        speaker: 'guest',
        name: 'Steve Harrington',
        text: "USS Butterscotch is ready! Happy Birthday, Shaaaw! Have the greatest day ever. Watch out, Max is skating over!",
        duration: 6500,
        guestAnim: 'bat-swing',
        hostAnim: 'listen-cheer',
        confetti: true
      }
    ]
  },

  max: {
    id: 'max',
    name: 'Max Mayfield',
    badge: '🛹 Max',
    themeColor: '#fb923c',
    avatarEmoji: '🛹',
    dialogues: [
      {
        speaker: 'guest',
        name: 'Max Mayfield',
        text: "Move aside, boys! Where's the birthday girl? I paused 'Running Up That Hill' on my Walkman just for you, Shaaaw!",
        duration: 5500,
        guestAnim: 'skate-enter',
        hostAnim: 'listen'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "Greetings, Max! Shaaaw has been anticipating your arrival since tape number one.",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-bless'
      },
      {
        speaker: 'guest',
        name: 'Max Mayfield',
        text: "Tell Shaaaw she gets unlimited arcade tokens and skate park privileges all week long. Vecna wouldn't dare mess with her!",
        duration: 6000,
        guestAnim: 'talk-gesture',
        hostAnim: 'listen-smile'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "Amen! Even the Mind Flayer stays 100 miles away from Shaaaw's celebration today.",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-proud'
      },
      {
        speaker: 'guest',
        name: 'Max Mayfield',
        text: "That's right. Happy Birthday, Shaaaw! Crank that tape deck and dance like nobody's watching!",
        duration: 6500,
        guestAnim: 'headphones-dance',
        hostAnim: 'listen-cheer',
        confetti: true
      }
    ]
  },

  dustin: {
    id: 'dustin',
    name: 'Dustin Henderson',
    badge: '📻 Dustin',
    themeColor: '#2dd4bf',
    avatarEmoji: '📻',
    dialogues: [
      {
        speaker: 'guest',
        name: 'Dustin Henderson',
        text: "Saint Nandhish, do you copy?! Cerebro just detected off-the-charts birthday levels in this sector!",
        duration: 5500,
        guestAnim: 'antenna-radio',
        hostAnim: 'listen'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "Loud and clear, Dustin. Shaaaw is unlocking her exclusive tapes today. Code Red celebration!",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-bless'
      },
      {
        speaker: 'guest',
        name: 'Dustin Henderson',
        text: "Holy roll! She's officially the highest-ranking Party member in Hawkins today! Natural 20 on all stats!",
        duration: 6000,
        guestAnim: 'talk-gesture',
        hostAnim: 'listen-smile'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "Indeed. I personally blessed every single tape for her. Only top-tier vibes.",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-proud'
      },
      {
        speaker: 'guest',
        name: 'Dustin Henderson',
        text: "NeverEnding Birthday! Ah-ah-ah-ah-ah-ah... Have the most awesome birthday ever, Shaaaw!",
        duration: 6500,
        guestAnim: 'sing-celebrate',
        hostAnim: 'listen-cheer',
        confetti: true
      }
    ]
  },

  eleven: {
    id: 'eleven',
    name: 'Eleven (011)',
    badge: '🧇 Eleven',
    themeColor: '#f472b6',
    avatarEmoji: '🧇',
    dialogues: [
      {
        speaker: 'guest',
        name: 'Eleven (011)',
        text: "Hello, Saint. I brought warm Eggo waffles for Shaaaw. Extra syrup.",
        duration: 5000,
        guestAnim: 'waffle-hold',
        hostAnim: 'listen'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "A sacred offering, Eleven! Shaaaw will be thoroughly honored by the waffle feast.",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-bless'
      },
      {
        speaker: 'guest',
        name: 'Eleven (011)',
        text: "Friends don't lie. Shaaaw is the most wonderful friend in our universe.",
        duration: 5500,
        guestAnim: 'psychic-glow',
        hostAnim: 'listen-smile'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "She truly is. That's why the entire Hawkins party gathered right here today.",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-proud'
      },
      {
        speaker: 'guest',
        name: 'Eleven (011)',
        text: "Bitchin'. Happy Birthday, Shaaaw. Today is all about you.",
        duration: 6500,
        guestAnim: 'psychic-cheer',
        hostAnim: 'listen-cheer',
        confetti: true
      }
    ]
  },

  will: {
    id: 'will',
    name: 'Will Byers',
    badge: '🏰 Will',
    themeColor: '#34d399',
    avatarEmoji: '🏰',
    dialogues: [
      {
        speaker: 'guest',
        name: 'Will Byers',
        text: "Hi Saint! I drew a special birthday portrait for Shaaaw. Castle Byers is dedicated to her today!",
        duration: 5500,
        guestAnim: 'sketch-hold',
        hostAnim: 'listen'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "Splendid work, Will! The Cleric of our party deserves nothing less than royal treatment.",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-bless'
      },
      {
        speaker: 'guest',
        name: 'Will Byers',
        text: "The back of my neck isn't tingling at all today... that means all monsters backed off for Shaaaw!",
        duration: 6000,
        guestAnim: 'talk-gesture',
        hostAnim: 'listen-smile'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "Of course they did. No upside-down shadow can dim Shaaaw's birthday light.",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-proud'
      },
      {
        speaker: 'guest',
        name: 'Will Byers',
        text: "Should I Stay or Should I Go? Definitely stay and eat all the cake! Happy Birthday Shaaaw!",
        duration: 6500,
        guestAnim: 'talk-cheer',
        hostAnim: 'listen-cheer',
        confetti: true
      }
    ]
  },

  mike: {
    id: 'mike',
    name: 'Mike Wheeler',
    badge: '⚔️ Mike',
    themeColor: '#f43f5e',
    avatarEmoji: '⚔️',
    dialogues: [
      {
        speaker: 'guest',
        name: 'Mike Wheeler',
        text: "Attention everyone! If anyone dares ruin Shaaaw's birthday today, they are kicked out of the Party permanently!",
        duration: 5500,
        guestAnim: 'paladin-point',
        hostAnim: 'listen'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "Direct and commanding as always, Wheeler. Shaaaw appreciates the fierce loyalty.",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-bless'
      },
      {
        speaker: 'guest',
        name: 'Mike Wheeler',
        text: "As Dungeon Master, I decree that Shaaaw receives +10 to Joy and +10 to Birthday Cake consumption!",
        duration: 6000,
        guestAnim: 'dice-roll',
        hostAnim: 'listen-smile'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "A grand decree! May her year ahead be full of legendary campaigns and victory.",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-proud'
      },
      {
        speaker: 'guest',
        name: 'Mike Wheeler',
        text: "Happy Birthday, Shaaaw! Have an unforgettable day with your best friends!",
        duration: 6500,
        guestAnim: 'talk-cheer',
        hostAnim: 'listen-cheer',
        confetti: true
      }
    ]
  },

  lucas: {
    id: 'lucas',
    name: 'Lucas Sinclair',
    badge: '🎯 Lucas',
    themeColor: '#fbbf24',
    avatarEmoji: '🎯',
    dialogues: [
      {
        speaker: 'guest',
        name: 'Lucas Sinclair',
        text: "Saint Nandhish! I loaded my wrist rocket with premium birthday confetti for Shaaaw!",
        duration: 5500,
        guestAnim: 'slingshot-aim',
        hostAnim: 'listen'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "Fire away, Lucas! Fill the air with sparkles for our birthday girl.",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-bless'
      },
      {
        speaker: 'guest',
        name: 'Lucas Sinclair',
        text: "Max and I voted: Shaaaw gets first choice on every movie, snack, and tape all week long!",
        duration: 6000,
        guestAnim: 'talk-gesture',
        hostAnim: 'listen-smile'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "Wisdom from Sinclair! Shaaaw reigns supreme throughout Hawkins.",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-proud'
      },
      {
        speaker: 'guest',
        name: 'Lucas Sinclair',
        text: "Incoming birthday fireworks! Happy Birthday, Shaaaw! You are the absolute greatest!",
        duration: 6500,
        guestAnim: 'confetti-launch',
        hostAnim: 'listen-cheer',
        confetti: true
      }
    ]
  },

  vecna: {
    id: 'vecna',
    name: 'Vecna (001)',
    badge: '🕰️ Vecna',
    themeColor: '#c084fc',
    avatarEmoji: '🕰️',
    dialogues: [
      {
        speaker: 'guest',
        name: 'Vecna (001)',
        text: "Tick... tock... Shaaaw... The clock has chimed four times... for your birthday cake.",
        duration: 5500,
        guestAnim: 'vine-sway',
        hostAnim: 'listen'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "Hold it right there, Creel! Even dark lords must present gifts and behave at Shaaaw's party.",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-bless'
      },
      {
        speaker: 'guest',
        name: 'Vecna (001)',
        text: "I cannot break the bond of friendship... Your tapes are too powerful... Happy Birthday, Shaaaw.",
        duration: 6000,
        guestAnim: 'clock-chime',
        hostAnim: 'listen-smile'
      },
      {
        speaker: 'host',
        name: 'Saint Nandhish',
        text: "See? The power of Shaaaw makes even the Upside Down celebrate peacefully.",
        duration: 5500,
        guestAnim: 'idle',
        hostAnim: 'talk-proud'
      },
      {
        speaker: 'guest',
        name: 'Vecna (001)',
        text: "Blow out your candles, Shaaaw... before the time runs out... *gentle tentacle wave*",
        duration: 6500,
        guestAnim: 'peace-wave',
        hostAnim: 'listen-cheer',
        confetti: true
      }
    ]
  }
};

const GUEST_ORDER = ['steve', 'max', 'dustin', 'eleven', 'will', 'mike', 'lucas', 'vecna'];

// ==========================================================================
// 2. Vector Puppet Artwork for Characters (High-Res Scalable SVG)
// ==========================================================================
const CHARACTER_SVGS = {
  steve: `
    <svg viewBox="0 0 160 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Shadow -->
      <ellipse cx="80" cy="210" rx="42" ry="7" fill="rgba(0,0,0,0.15)" />
      <!-- Body / Legs -->
      <path d="M68,140 L68,205 L77,205 L78,160 L82,160 L83,205 L92,205 L92,140 Z" fill="#1e293b" />
      <rect x="65" y="200" width="14" height="8" rx="3" fill="#ffffff" />
      <rect x="81" y="200" width="14" height="8" rx="3" fill="#ffffff" />
      <!-- Blue Members Only Jacket -->
      <path d="M52,95 C52,95 44,140 50,146 C56,152 104,152 110,146 C116,140 108,95 108,95 Z" fill="#0284c7" />
      <!-- Yellow & White Racing Stripe -->
      <path d="M65,95 L65,148 M68,95 L68,148" stroke="#fde047" stroke-width="2.5" />
      <!-- Collar & White Undershirt -->
      <polygon points="73,95 80,110 87,95" fill="#f8fafc" />
      <polygon points="68,95 80,105 73,95" fill="#0369a1" />
      <polygon points="92,95 80,105 87,95" fill="#0369a1" />
      <!-- Ray-Ban Sunglasses hanging on collar -->
      <path d="M76,105 Q80,108 84,105" stroke="#0f172a" stroke-width="2" fill="none" />
      <rect x="75" y="106" width="4" height="5" rx="1.5" fill="#0f172a" />
      <rect x="81" y="106" width="4" height="5" rx="1.5" fill="#0f172a" />
      <!-- Spiked Baseball Bat (Right hand) -->
      <g class="puppet-bat" style="transform-origin: 115px 120px;">
        <rect x="114" y="80" width="6" height="55" rx="2.5" fill="#b45309" transform="rotate(-15 117 107)" />
        <rect x="115" y="125" width="4" height="15" rx="1.5" fill="#f8fafc" transform="rotate(-15 117 107)" />
        <!-- Spikes / Nails -->
        <line x1="110" y1="88" x2="124" y2="88" stroke="#94a3b8" stroke-width="2" />
        <line x1="111" y1="96" x2="125" y2="96" stroke="#94a3b8" stroke-width="2" />
        <line x1="112" y1="104" x2="123" y2="104" stroke="#94a3b8" stroke-width="2" />
      </g>
      <!-- Arms -->
      <path d="M52,98 C40,110 38,125 45,135" stroke="#0284c7" stroke-width="12" stroke-linecap="round" fill="none" />
      <circle cx="45" cy="136" r="6" fill="#fcd34d" />
      <path d="M108,98 C115,108 118,122 116,132" stroke="#0284c7" stroke-width="12" stroke-linecap="round" fill="none" />
      <circle cx="116" cy="132" r="6" fill="#fcd34d" />
      <!-- Head & Neck -->
      <rect x="74" y="80" width="12" height="18" fill="#fcd34d" />
      <ellipse cx="80" cy="70" rx="19" ry="21" fill="#fde68a" />
      <!-- Ears -->
      <circle cx="61" cy="70" r="4.5" fill="#fcd34d" />
      <circle cx="99" cy="70" r="4.5" fill="#fcd34d" />
      <!-- Face -->
      <circle cx="73" cy="69" r="2.5" fill="#1e293b" />
      <circle cx="87" cy="69" r="2.5" fill="#1e293b" />
      <path d="M70,62 Q74,60 77,63" stroke="#78350f" stroke-width="1.8" fill="none" />
      <path d="M83,63 Q86,60 90,62" stroke="#78350f" stroke-width="1.8" fill="none" />
      <path d="M79,72 L78,76 L82,76" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" fill="none" />
      <path d="M74,82 Q80,87 86,82" stroke="#b45309" stroke-width="2" fill="none" />
      <!-- Steve's Majestic Pompadour Hair (Farrah Fawcett Spray!) -->
      <path d="M59,66 C55,42 66,22 80,22 C94,22 105,42 101,66 C97,55 93,48 80,48 C67,48 63,55 59,66 Z" fill="#593a1c" />
      <path d="M68,36 Q80,26 92,36 Q80,44 68,36 Z" fill="#784b25" />
    </svg>
  `,

  max: `
    <svg viewBox="0 0 160 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Shadow -->
      <ellipse cx="80" cy="210" rx="40" ry="7" fill="rgba(0,0,0,0.15)" />
      <!-- Skateboard on ground -->
      <g class="puppet-skateboard">
        <rect x="25" y="202" width="70" height="7" rx="3.5" fill="#facc15" />
        <circle cx="35" cy="211" r="4.5" fill="#ef4444" />
        <circle cx="85" cy="211" r="4.5" fill="#ef4444" />
      </g>
      <!-- Jeans -->
      <path d="M68,142 L68,200 L76,200 L78,162 L82,162 L84,200 L92,200 L92,142 Z" fill="#2563eb" />
      <rect x="66" y="196" width="12" height="7" rx="2.5" fill="#f8fafc" />
      <rect x="82" y="196" width="12" height="7" rx="2.5" fill="#f8fafc" />
      <!-- Striped Windbreaker Jacket -->
      <path d="M54,98 C54,98 48,142 54,146 C60,150 100,150 106,146 C112,142 106,98 106,98 Z" fill="#3b82f6" />
      <!-- Red & White Retro Horizontal Stripes -->
      <path d="M52,114 L108,114" stroke="#ef4444" stroke-width="7" />
      <path d="M52,122 L108,122" stroke="#ffffff" stroke-width="5" />
      <!-- Headphones around Neck -->
      <path d="M66,88 Q80,102 94,88" stroke="#f97316" stroke-width="5" fill="none" />
      <circle cx="66" cy="90" r="6" fill="#ea580c" />
      <circle cx="94" cy="90" r="6" fill="#ea580c" />
      <!-- Arms -->
      <path d="M54,100 C44,112 40,126 48,136" stroke="#3b82f6" stroke-width="11" stroke-linecap="round" fill="none" />
      <circle cx="48" cy="136" r="5.5" fill="#fcd34d" />
      <path d="M106,100 C114,110 118,124 112,135" stroke="#3b82f6" stroke-width="11" stroke-linecap="round" fill="none" />
      <circle cx="112" cy="135" r="5.5" fill="#fcd34d" />
      <!-- Head & Neck -->
      <rect x="74" y="82" width="12" height="16" fill="#fcd34d" />
      <ellipse cx="80" cy="72" rx="18" ry="20" fill="#fde68a" />
      <!-- Freckles -->
      <circle cx="70" cy="76" r="1" fill="#ea580c" />
      <circle cx="73" cy="77" r="1" fill="#ea580c" />
      <circle cx="87" cy="77" r="1" fill="#ea580c" />
      <circle cx="90" cy="76" r="1" fill="#ea580c" />
      <!-- Face -->
      <circle cx="73" cy="71" r="2.5" fill="#1e293b" />
      <circle cx="87" cy="71" r="2.5" fill="#1e293b" />
      <path d="M70,64 Q74,62 77,65" stroke="#c2410c" stroke-width="1.8" fill="none" />
      <path d="M83,65 Q86,62 90,64" stroke="#c2410c" stroke-width="1.8" fill="none" />
      <path d="M75,82 Q80,86 85,82" stroke="#b45309" stroke-width="2" fill="none" />
      <!-- Fiery Red Hair / Ponytail -->
      <path d="M60,68 C58,35 68,26 80,26 C92,26 102,35 100,68 C96,52 92,46 80,46 C68,46 64,52 60,68 Z" fill="#ea580c" />
      <!-- Side Ponytail that bounces -->
      <path class="puppet-ponytail" d="M100,48 Q125,50 128,85 Q115,85 106,62 Z" fill="#c2410c" />
    </svg>
  `,

  dustin: `
    <svg viewBox="0 0 160 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Shadow -->
      <ellipse cx="80" cy="210" rx="42" ry="7" fill="rgba(0,0,0,0.15)" />
      <!-- Khaki pants -->
      <path d="M66,140 L66,204 L75,204 L78,162 L82,162 L85,204 L94,204 L94,140 Z" fill="#d97706" />
      <rect x="64" y="200" width="13" height="7" rx="2.5" fill="#ffffff" />
      <rect x="83" y="200" width="13" height="7" rx="2.5" fill="#ffffff" />
      <!-- Green Camp Know Where Tee -->
      <path d="M52,96 C52,96 46,140 52,146 C58,150 102,150 108,146 C114,140 108,96 108,96 Z" fill="#15803d" />
      <circle cx="80" cy="120" r="14" fill="#fde047" />
      <path d="M72,120 Q80,112 88,120" stroke="#15803d" stroke-width="2" fill="none" />
      <!-- Cerebro Walkie Talkie with Antenna (Right Hand) -->
      <g class="puppet-walkie">
        <rect x="114" y="112" width="14" height="24" rx="3" fill="#1e293b" />
        <line x1="121" y1="112" x2="121" y2="70" stroke="#94a3b8" stroke-width="2.5" />
        <circle cx="121" cy="70" r="3" fill="#ef4444" />
      </g>
      <!-- Arms -->
      <path d="M52,98 C42,110 38,124 45,134" stroke="#15803d" stroke-width="11" stroke-linecap="round" fill="none" />
      <circle cx="45" cy="134" r="5.5" fill="#fcd34d" />
      <path d="M108,98 C115,108 118,120 118,128" stroke="#15803d" stroke-width="11" stroke-linecap="round" fill="none" />
      <!-- Head & Neck -->
      <rect x="74" y="80" width="12" height="18" fill="#fcd34d" />
      <ellipse cx="80" cy="70" rx="20" ry="21" fill="#fde68a" />
      <!-- Pearly Whites Smile -->
      <path d="M72,78 Q80,88 88,78 Z" fill="#ffffff" stroke="#78350f" stroke-width="1.5" />
      <circle cx="73" cy="68" r="2.5" fill="#1e293b" />
      <circle cx="87" cy="68" r="2.5" fill="#1e293b" />
      <!-- Curly Hair Under Cap -->
      <path d="M56,65 C54,76 60,85 64,85 C68,85 68,75 68,68 Z" fill="#593a1c" />
      <path d="M104,65 C106,76 100,85 96,85 C92,85 92,75 92,68 Z" fill="#593a1c" />
      <!-- Dustin's Iconic Thinking Cap -->
      <path d="M54,58 Q80,32 106,58 Z" fill="#2563eb" />
      <path d="M60,58 Q80,40 100,58 Z" fill="#ffffff" />
      <rect x="52" y="56" width="56" height="7" rx="3" fill="#dc2626" />
    </svg>
  `,

  eleven: `
    <svg viewBox="0 0 160 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Shadow -->
      <ellipse cx="80" cy="210" rx="38" ry="7" fill="rgba(0,0,0,0.15)" />
      <!-- Striped Socks & Shoes -->
      <rect x="68" y="175" width="8" height="30" fill="#f8fafc" />
      <rect x="84" y="175" width="8" height="30" fill="#f8fafc" />
      <rect x="68" y="180" width="8" height="3" fill="#2563eb" />
      <rect x="84" y="180" width="8" height="3" fill="#2563eb" />
      <rect x="68" y="186" width="8" height="3" fill="#dc2626" />
      <rect x="84" y="186" width="8" height="3" fill="#dc2626" />
      <rect x="65" y="200" width="14" height="7" rx="3" fill="#ffffff" />
      <rect x="81" y="200" width="14" height="7" rx="3" fill="#ffffff" />
      <!-- Iconic Pink Dress -->
      <path d="M54,102 L106,102 L116,176 L44,176 Z" fill="#f472b6" />
      <!-- Blue Bomber Jacket over Dress -->
      <path d="M50,98 C50,98 42,142 50,146 C58,150 102,150 110,146 C118,142 110,98 110,98 Z" fill="#1e3a8a" opacity="0.9" />
      <!-- White Peter Pan Collar -->
      <ellipse cx="73" cy="98" rx="8" ry="5" fill="#ffffff" />
      <ellipse cx="87" cy="98" rx="8" ry="5" fill="#ffffff" />
      <!-- Eggo Waffle in Left Hand -->
      <g class="puppet-waffle">
        <circle cx="40" cy="132" r="13" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
        <rect x="33" y="125" width="14" height="14" fill="none" stroke="#d97706" stroke-width="1.5" />
      </g>
      <!-- Telekinetic Right Hand with Pink Sparkle Aura -->
      <g class="puppet-psychic-hand">
        <circle cx="118" cy="120" r="12" fill="rgba(244,114,182,0.3)" />
        <circle cx="118" cy="120" r="5" fill="#fcd34d" />
        <path d="M106,100 C114,108 118,114 118,120" stroke="#1e3a8a" stroke-width="10" stroke-linecap="round" fill="none" />
      </g>
      <!-- Head & Neck -->
      <rect x="74" y="82" width="12" height="16" fill="#fcd34d" />
      <ellipse cx="80" cy="72" rx="18" ry="20" fill="#fde68a" />
      <!-- Determined Sweet Face -->
      <circle cx="73" cy="71" r="2.5" fill="#1e293b" />
      <circle cx="87" cy="71" r="2.5" fill="#1e293b" />
      <path d="M71,64 Q74,62 77,65" stroke="#78350f" stroke-width="1.8" fill="none" />
      <path d="M83,65 Q86,62 89,64" stroke="#78350f" stroke-width="1.8" fill="none" />
      <path d="M76,82 Q80,85 84,82" stroke="#b45309" stroke-width="2" fill="none" />
      <!-- Iconic Short Wavy Brunette Hair / Buzz Cut -->
      <path d="M62,68 C60,45 68,36 80,36 C92,36 100,45 98,68 C94,54 90,48 80,48 C70,48 66,54 62,68 Z" fill="#78350f" />
    </svg>
  `,

  will: `
    <svg viewBox="0 0 160 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="210" rx="38" ry="7" fill="rgba(0,0,0,0.15)" />
      <path d="M68,142 L68,204 L76,204 L78,162 L82,162 L84,204 L92,204 L92,142 Z" fill="#1e293b" />
      <path d="M54,98 L106,98 L106,146 L54,146 Z" fill="#f97316" />
      <path d="M64,98 L96,98 L96,146 L64,146 Z" fill="#dc2626" />
      <circle cx="44" cy="136" r="5" fill="#fcd34d" />
      <circle cx="116" cy="136" r="5" fill="#fcd34d" />
      <rect x="74" y="82" width="12" height="16" fill="#fcd34d" />
      <ellipse cx="80" cy="72" rx="18" ry="20" fill="#fde68a" />
      <circle cx="73" cy="71" r="2.5" fill="#1e293b" />
      <circle cx="87" cy="71" r="2.5" fill="#1e293b" />
      <path d="M75,82 Q80,85 85,82" stroke="#b45309" stroke-width="2" fill="none" />
      <!-- Will's Signature Bowl Cut -->
      <path d="M60,68 C58,38 68,30 80,30 C92,30 102,38 100,68 C96,56 88,52 80,52 C72,52 64,56 60,68 Z" fill="#593a1c" />
    </svg>
  `,

  mike: `
    <svg viewBox="0 0 160 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="210" rx="38" ry="7" fill="rgba(0,0,0,0.15)" />
      <path d="M68,142 L68,204 L76,204 L78,162 L82,162 L84,204 L92,204 L92,142 Z" fill="#334155" />
      <path d="M54,98 L106,98 L106,146 L54,146 Z" fill="#f1f5f9" />
      <path d="M54,112 L106,112 M54,124 L106,124" stroke="#0284c7" stroke-width="5" />
      <circle cx="44" cy="136" r="5" fill="#fcd34d" />
      <circle cx="116" cy="136" r="5" fill="#fcd34d" />
      <rect x="74" y="82" width="12" height="16" fill="#fcd34d" />
      <ellipse cx="80" cy="72" rx="18" ry="20" fill="#fde68a" />
      <circle cx="73" cy="71" r="2.5" fill="#1e293b" />
      <circle cx="87" cy="71" r="2.5" fill="#1e293b" />
      <path d="M75,82 Q80,85 85,82" stroke="#b45309" stroke-width="2" fill="none" />
      <!-- Mike's Wavy Dark Hair -->
      <path d="M58,68 C54,42 66,28 80,28 C94,28 106,42 102,68 C96,52 90,44 80,44 C70,44 64,52 58,68 Z" fill="#1e293b" />
    </svg>
  `,

  lucas: `
    <svg viewBox="0 0 160 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="210" rx="38" ry="7" fill="rgba(0,0,0,0.15)" />
      <path d="M68,142 L68,204 L76,204 L78,162 L82,162 L84,204 L92,204 L92,142 Z" fill="#1e293b" />
      <!-- Red jacket with sherpa collar -->
      <path d="M54,98 L106,98 L106,146 L54,146 Z" fill="#dc2626" />
      <ellipse cx="73" cy="98" rx="7" ry="5" fill="#fef08a" />
      <ellipse cx="87" cy="98" rx="7" ry="5" fill="#fef08a" />
      <!-- Slingshot / Wrist Rocket (Right Hand) -->
      <path d="M116,128 L124,116 M124,116 L120,108 M124,116 L128,108" stroke="#b45309" stroke-width="3" stroke-linecap="round" fill="none" />
      <circle cx="44" cy="136" r="5" fill="#92400e" />
      <rect x="74" y="82" width="12" height="16" fill="#92400e" />
      <ellipse cx="80" cy="72" rx="18" ry="20" fill="#b45309" />
      <!-- Camo Headband -->
      <rect x="62" y="58" width="36" height="7" rx="2" fill="#15803d" />
      <circle cx="73" cy="71" r="2.5" fill="#1e293b" />
      <circle cx="87" cy="71" r="2.5" fill="#1e293b" />
      <path d="M75,82 Q80,85 85,82" stroke="#451a03" stroke-width="2" fill="none" />
      <path d="M62,60 C62,44 68,36 80,36 C92,36 98,44 98,60 Z" fill="#1c1917" />
    </svg>
  `,

  vecna: `
    <svg viewBox="0 0 160 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="210" rx="44" ry="8" fill="rgba(0,0,0,0.2)" />
      <!-- Creepy-Cute Vines Torso -->
      <path d="M50,96 C50,96 42,160 52,175 C62,185 98,185 108,175 C118,160 110,96 110,96 Z" fill="#64748b" />
      <!-- Grandfather Clock Motif -->
      <circle cx="80" cy="135" r="15" fill="#1e1b4b" stroke="#fde047" stroke-width="2" />
      <line x1="80" y1="135" x2="80" y2="126" stroke="#fde047" stroke-width="2" stroke-linecap="round" />
      <line x1="80" y1="135" x2="87" y2="135" stroke="#fde047" stroke-width="2" stroke-linecap="round" />
      <!-- Vines -->
      <path d="M52,110 Q40,140 45,170" stroke="#475569" stroke-width="5" fill="none" />
      <path d="M108,110 Q120,140 115,170" stroke="#475569" stroke-width="5" fill="none" />
      <!-- Head -->
      <rect x="74" y="80" width="12" height="18" fill="#94a3b8" />
      <ellipse cx="80" cy="68" rx="22" ry="24" fill="#cbd5e1" />
      <circle cx="71" cy="68" r="4" fill="#0f172a" />
      <circle cx="89" cy="68" r="4" fill="#0f172a" />
      <path d="M74,82 Q80,88 86,82" stroke="#0f172a" stroke-width="2.5" fill="none" />
    </svg>
  `
};

// ==========================================================================
// 3. Audio Synthesizer (Retro Web Audio FX - Zero External Dependencies)
// ==========================================================================
class RetroAudioSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playChime(freq = 587.33, duration = 0.12) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  playWhoosh() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (_) {}
  }
}

const synth = new RetroAudioSynth();

// ==========================================================================
// 4. Hawkins Cameo Theater Master Controller
// ==========================================================================
class HawkinsCameoTheater {
  constructor() {
    this.currentGuestIndex = 0;
    this.currentBeatIndex = 0;
    this.isPlaying = true;
    this.beatTimer = null;
    this.progressInterval = null;
    this.beatStartTime = 0;
    this.beatDuration = 0;

    this.container = null;
    this.guestPuppetEl = null;
    this.hostPuppetEl = null;
    this.dialogueBubbleEl = null;
    this.dialogueSpeakerEl = null;
    this.dialogueTextEl = null;
    this.progressBarEl = null;
    this.timerDisplayEl = null;
    this.playBtnEl = null;

    this.init();
  }

  init() {
    const existing = document.getElementById('hawkinsCameoTheater');
    if (existing) return;

    this.renderTheaterUI();
    this.loadScene(GUEST_ORDER[0], true);
  }

  renderTheaterUI() {
    // Find target insertion point: inside or right above the main container
    const targetParent = document.querySelector('.cameo-theater-anchor') || 
                         document.querySelector('.cameo-story-container') || 
                         document.body;

    this.container = document.createElement('section');
    this.container.id = 'hawkinsCameoTheater';
    this.container.className = 'cameo-theater-card';
    this.container.setAttribute('aria-label', 'Hawkins Cameo Animation Theater');

    this.container.innerHTML = `
      <!-- Theater Header & Character Switcher Tabs -->
      <div class="theater-top-bar">
        <div class="theater-badge-strip">
          <span class="theater-dot-rec"></span>
          <span class="theater-title-tag">HAWKINS LIVE ENCOUNTER &bull; 30s CAMEO</span>
        </div>
        <div class="theater-controls-mini">
          <button class="theater-btn-mini" id="theaterPlayToggle" title="Play / Pause Scene">⏸</button>
          <button class="theater-btn-mini" id="theaterNextGuest" title="Next Guest">⏭ Next</button>
        </div>
      </div>

      <!-- Character Guest Tabs -->
      <div class="guest-tabs-scroll" id="guestTabsList">
        ${GUEST_ORDER.map((key, idx) => `
          <button class="guest-tab-pill ${idx === 0 ? 'active' : ''}" data-guest="${key}">
            ${CAMEO_SCENES[key].badge}
          </button>
        `).join('')}
      </div>

      <!-- Dialogue Speech Box (Cleanly positioned above stage so it NEVER obscures characters) -->
      <div class="stage-dialogue-box speaker-guest" id="stageDialogueBox">
        <div class="dialogue-speaker-pill" id="dialogueSpeakerPill">🧢 Steve Harrington</div>
        <p class="dialogue-content-text" id="dialogueContentText">Loading encounter...</p>
      </div>

      <!-- Animated Stage Canvas (100% unobstructed, pristine character view) -->
      <div class="theater-stage-canvas" id="stageCanvas">
        <!-- Ambient Stage Glow & Backdrop -->
        <div class="stage-backdrop-glow"></div>
        <div class="stage-floor-light"></div>

        <!-- Left Character: The Visiting Stranger Things Guest -->
        <div class="stage-actor guest-actor" id="guestActor">
          <div class="actor-name-tag" id="guestActorTag">Steve</div>
          <div class="actor-puppet-frame" id="guestPuppetFrame"></div>
        </div>

        <!-- Stage Center Ambient Spark -->
        <div class="stage-center-ambient">
          <span class="stage-sparkle-center">✨</span>
        </div>

        <!-- Right Character: Saint Nandhish (Caricature) -->
        <div class="stage-actor host-actor" id="hostActor">
          <div class="actor-name-tag host-tag">✨ Saint Nandhish</div>
          <div class="host-divine-halo" id="hostDivineHalo"></div>
          <div class="actor-puppet-frame host-puppet">
            <img src="/assets/caricature.png" alt="Saint Nandhish" class="host-caricature-img" id="hostCaricatureImg">
          </div>
        </div>
      </div>

      <!-- 30-Second Encounter Timeline Bar -->
      <div class="theater-timeline-bar">
        <div class="timeline-track">
          <div class="timeline-fill" id="theaterProgressBar"></div>
        </div>
        <div class="timeline-meta">
          <span id="theaterTimerDisplay">00:00 / 00:30</span>
          <span class="timeline-sub">Conversing with Saint Nandhish &bull; For Shaaaw 💗</span>
        </div>
      </div>
    `;

    // Insert into DOM
    if (targetParent === document.body) {
      document.body.prepend(this.container);
    } else {
      targetParent.parentNode.insertBefore(this.container, targetParent);
    }

    // Cache DOM references
    this.guestPuppetFrame = document.getElementById('guestPuppetFrame');
    this.guestActorTag = document.getElementById('guestActorTag');
    this.guestActor = document.getElementById('guestActor');
    this.hostActor = document.getElementById('hostActor');
    this.hostDivineHalo = document.getElementById('hostDivineHalo');
    this.hostCaricatureImg = document.getElementById('hostCaricatureImg');

    this.dialogueBox = document.getElementById('stageDialogueBox');
    this.dialogueSpeakerPill = document.getElementById('dialogueSpeakerPill');
    this.dialogueContentText = document.getElementById('dialogueContentText');
    this.progressBarEl = document.getElementById('theaterProgressBar');
    this.timerDisplayEl = document.getElementById('theaterTimerDisplay');
    this.playBtnEl = document.getElementById('theaterPlayToggle');

    // Attach Event Listeners
    this.attachEvents();
  }

  attachEvents() {
    // Guest Tab Clicks
    const tabsList = document.getElementById('guestTabsList');
    if (tabsList) {
      tabsList.addEventListener('click', (e) => {
        const btn = e.target.closest('.guest-tab-pill');
        if (!btn) return;
        const guestKey = btn.getAttribute('data-guest');
        if (guestKey) {
          this.loadScene(guestKey);
        }
      });
    }

    // Play / Pause Toggle
    if (this.playBtnEl) {
      this.playBtnEl.onclick = () => {
        if (this.isPlaying) {
          this.pause();
        } else {
          this.play();
        }
      };
    }

    // Next Guest Button
    const nextBtn = document.getElementById('theaterNextGuest');
    if (nextBtn) {
      nextBtn.onclick = () => {
        this.nextScene();
      };
    }

    // Interactive Tap on Saint Nandhish
    if (this.hostActor) {
      this.hostActor.onclick = () => {
        synth.playChime(659.25, 0.15);
        this.hostActor.classList.add('actor-shake');
        setTimeout(() => this.hostActor.classList.remove('actor-shake'), 450);
        if (typeof confetti === 'function') {
          confetti({ particleCount: 20, spread: 50, origin: { x: 0.8, y: 0.4 } });
        }
      };
    }

    // Interactive Tap on Guest
    if (this.guestActor) {
      this.guestActor.onclick = () => {
        synth.playWhoosh();
        this.guestActor.classList.add('actor-jump');
        setTimeout(() => this.guestActor.classList.remove('actor-jump'), 450);
      };
    }
  }

  loadScene(guestKey, isInitial = false) {
    clearTimeout(this.beatTimer);
    clearInterval(this.progressInterval);

    const guestIdx = GUEST_ORDER.indexOf(guestKey);
    if (guestIdx !== -1) {
      this.currentGuestIndex = guestIdx;
    }

    const scene = CAMEO_SCENES[guestKey] || CAMEO_SCENES['steve'];
    this.currentBeatIndex = 0;
    this.isPlaying = true;
    if (this.playBtnEl) this.playBtnEl.textContent = '⏸';

    // Update Tab Highlights
    document.querySelectorAll('.guest-tab-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-guest') === guestKey);
    });

    // Render Character Vector Art
    if (this.guestPuppetFrame) {
      this.guestPuppetFrame.innerHTML = CHARACTER_SVGS[guestKey] || CHARACTER_SVGS['steve'];
    }
    if (this.guestActorTag) {
      this.guestActorTag.textContent = scene.name;
    }

    // Entrance Animation
    if (this.guestActor) {
      this.guestActor.className = 'stage-actor guest-actor actor-enter';
      synth.playWhoosh();
      setTimeout(() => {
        if (this.guestActor) this.guestActor.classList.remove('actor-enter');
      }, 700);
    }

    // Play First Beat
    this.playBeat(scene, 0);
  }

  playBeat(scene, beatIdx) {
    if (beatIdx >= scene.dialogues.length) {
      // Scene Completed! (~30 Seconds total)
      this.onSceneComplete();
      return;
    }

    this.currentBeatIndex = beatIdx;
    const beat = scene.dialogues[beatIdx];
    this.beatDuration = beat.duration;
    this.beatStartTime = Date.now();

    // Sound effect
    synth.playChime(beat.speaker === 'host' ? 783.99 : 523.25, 0.15);

    // Update Dialogue Box
    if (this.dialogueSpeakerPill) {
      this.dialogueSpeakerPill.textContent = beat.name;
      this.dialogueSpeakerPill.style.background = beat.speaker === 'host' ? '#fef3c7' : '#ffe4e6';
      this.dialogueSpeakerPill.style.color = beat.speaker === 'host' ? '#b45309' : '#e11d48';
    }

    if (this.dialogueContentText) {
      this.dialogueContentText.textContent = beat.text;
    }

    // Active Speaker Highlighting
    if (this.dialogueBox) {
      this.dialogueBox.className = `stage-dialogue-box active speaker-${beat.speaker}`;
    }

    if (beat.speaker === 'host') {
      if (this.hostActor) this.hostActor.classList.add('talking');
      if (this.hostDivineHalo) this.hostDivineHalo.classList.add('halo-glow-active');
      if (this.guestActor) this.guestActor.classList.remove('talking');
    } else {
      if (this.guestActor) this.guestActor.classList.add('talking');
      if (this.hostActor) this.hostActor.classList.remove('talking');
      if (this.hostDivineHalo) this.hostDivineHalo.classList.remove('halo-glow-active');
    }

    // Optional Confetti Burst
    if (beat.confetti && typeof confetti === 'function') {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { x: 0.5, y: 0.35 },
          colors: ['#e11d48', '#38bdf8', '#fbbf24', '#c084fc', '#34d399']
        });
      } catch (_) {}
    }

    // Progress Bar Animation
    this.startProgressTrack(scene, beatIdx);

    // Schedule next beat
    this.beatTimer = setTimeout(() => {
      if (this.isPlaying) {
        this.playBeat(scene, beatIdx + 1);
      }
    }, beat.duration);
  }

  startProgressTrack(scene, currentBeatIdx) {
    clearInterval(this.progressInterval);

    // Calculate total scene duration
    const totalDuration = scene.dialogues.reduce((acc, d) => acc + d.duration, 0);
    // Calculate elapsed time from previous beats
    let elapsedBefore = 0;
    for (let i = 0; i < currentBeatIdx; i++) {
      elapsedBefore += scene.dialogues[i].duration;
    }

    this.progressInterval = setInterval(() => {
      if (!this.isPlaying) return;
      const currentBeatElapsed = Date.now() - this.beatStartTime;
      const totalElapsed = Math.min(totalDuration, elapsedBefore + currentBeatElapsed);
      const pct = (totalElapsed / totalDuration) * 100;

      if (this.progressBarEl) {
        this.progressBarEl.style.width = `${pct}%`;
      }

      const secElapsed = Math.floor(totalElapsed / 1000);
      const secTotal = Math.floor(totalDuration / 1000);
      if (this.timerDisplayEl) {
        this.timerDisplayEl.textContent = `00:${secElapsed < 10 ? '0' : ''}${secElapsed} / 00:${secTotal < 10 ? '0' : ''}${secTotal}`;
      }
    }, 80);
  }

  onSceneComplete() {
    clearInterval(this.progressInterval);
    if (this.guestActor) this.guestActor.classList.remove('talking');
    if (this.hostActor) this.hostActor.classList.remove('talking');

    // Auto advance to next guest after 2 seconds
    setTimeout(() => {
      this.nextScene();
    }, 2000);
  }

  nextScene() {
    this.currentGuestIndex = (this.currentGuestIndex + 1) % GUEST_ORDER.length;
    this.loadScene(GUEST_ORDER[this.currentGuestIndex]);
  }

  pause() {
    this.isPlaying = false;
    clearTimeout(this.beatTimer);
    clearInterval(this.progressInterval);
    if (this.playBtnEl) this.playBtnEl.textContent = '▶';
    if (this.guestActor) this.guestActor.classList.remove('talking');
    if (this.hostActor) this.hostActor.classList.remove('talking');
  }

  play() {
    this.isPlaying = true;
    if (this.playBtnEl) this.playBtnEl.textContent = '⏸';
    const scene = CAMEO_SCENES[GUEST_ORDER[this.currentGuestIndex]];
    this.playBeat(scene, this.currentBeatIndex);
  }
}

// Global accessor & initializer
window.HawkinsCameoTheater = HawkinsCameoTheater;
window.initCameoTheater = function() {
  if (!window.theaterInstance) {
    window.theaterInstance = new HawkinsCameoTheater();
  }
  return window.theaterInstance;
};

// Auto start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.initCameoTheater();
});
