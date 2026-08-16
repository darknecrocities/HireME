/**
 * Mechanical Keyboard Switch Acoustic Synthesizer Engine (Web Audio API)
 * Features 16 distinct switch profiles modeled after real-world enthusiast switches:
 * Linear, Tactile, Clicky, Silent, and Vintage/Electro-Capacitive.
 */

export type SoundProfile =
  | 'oil_king'
  | 'holy_panda'
  | 'boba_u4t'
  | 'milky_yellow'
  | 'mx_blue'
  | 'box_navy'
  | 'box_white'
  | 'topre'
  | 'buckling_spring'
  | 'mx_brown'
  | 'mx_red'
  | 'mx_black'
  | 'alpaca'
  | 'silent_alpaca'
  | 'zealios'
  | 'bubble'
  | 'scifi'
  | 'typewriter'
  | 'mute';

export interface SoundSettings {
  profile: SoundProfile;
  volume: number; // 0.0 to 1.0
  hoverEnabled: boolean;
  clickEnabled: boolean;
}

export interface SwitchMeta {
  id: SoundProfile;
  name: string;
  category: 'Linear' | 'Tactile' | 'Clicky' | 'Silent' | 'Vintage / Hall Effect' | 'Special';
  desc: string;
  tag: string;
}

export const SWITCH_PROFILES: SwitchMeta[] = [
  {
    id: 'oil_king',
    name: 'Gateron Oil King',
    category: 'Linear',
    desc: 'Deep, heavy, factory-lubed ultra-thocky bottom out.',
    tag: 'Deep Thock',
  },
  {
    id: 'holy_panda',
    name: 'Holy Panda',
    category: 'Tactile',
    desc: 'Snappy tactile bump with explosive rounded bottom-out pop.',
    tag: 'Poppy Tactile',
  },
  {
    id: 'boba_u4t',
    name: 'Gazzew Boba U4T',
    category: 'Tactile',
    desc: 'Dense, creamy acoustic signature with distinct D-bump.',
    tag: 'Creamy Thock',
  },
  {
    id: 'milky_yellow',
    name: 'Gateron Milky Yellow',
    category: 'Linear',
    desc: 'Warm, buttery smooth nylon-housing clack.',
    tag: 'Buttery Smooth',
  },
  {
    id: 'alpaca',
    name: 'Alpaca V2',
    category: 'Linear',
    desc: 'Crisp, high-pitched poppy linear clack.',
    tag: 'Crisp Clack',
  },
  {
    id: 'mx_red',
    name: 'Cherry MX Red',
    category: 'Linear',
    desc: 'Lightweight linear glide with subtle switch rattle.',
    tag: 'Classic Linear',
  },
  {
    id: 'mx_black',
    name: 'Cherry MX Black',
    category: 'Linear',
    desc: 'Heavy vintage stem resistance with deep solid housing landing.',
    tag: 'Heavy Vintage',
  },
  {
    id: 'silent_alpaca',
    name: 'Durock Silent Linear',
    category: 'Silent',
    desc: 'Muted stealth dampener with soft cushioned landing.',
    tag: 'Stealth Mute',
  },
  {
    id: 'mx_brown',
    name: 'Cherry MX Brown',
    category: 'Tactile',
    desc: 'Lightweight subtle bump with gentle tactile feel.',
    tag: 'Subtle Tactile',
  },
  {
    id: 'zealios',
    name: 'Zealios V2 67g',
    category: 'Tactile',
    desc: 'Ultra-crisp elevated tactile snap with metallic leaf resonance.',
    tag: 'Sharp Tactile',
  },
  {
    id: 'topre',
    name: 'Topre 45g Electro-Capacitive',
    category: 'Vintage / Hall Effect',
    desc: 'Pillowy rubber-dome thock with deep hollow bottom-out pop.',
    tag: 'Capacitive Thock',
  },
  {
    id: 'buckling_spring',
    name: 'IBM Model M Buckling Spring',
    category: 'Vintage / Hall Effect',
    desc: 'Resonant steel spring buckling ping and heavy barrel strike.',
    tag: 'Vintage Steel',
  },
  {
    id: 'mx_blue',
    name: 'Cherry MX Blue',
    category: 'Clicky',
    desc: 'Loud, distinct click-jacket snap with sharp metallic actuation.',
    tag: 'Click Jacket',
  },
  {
    id: 'box_navy',
    name: 'Kailh Box Navy',
    category: 'Clicky',
    desc: 'Thick click-bar explosive acoustic crack and deep bottom.',
    tag: 'Thick Clickbar',
  },
  {
    id: 'box_white',
    name: 'Kailh Box White',
    category: 'Clicky',
    desc: 'Delicate, sharp click-bar chime with ultra-crisp pitch.',
    tag: 'Crisp Clickbar',
  },
  {
    id: 'typewriter',
    name: 'Vintage Typewriter',
    category: 'Special',
    desc: 'Mechanical steel lever strike on ribbon.',
    tag: 'Steel Hammer',
  },
  {
    id: 'bubble',
    name: 'Bubble Pebble',
    category: 'Special',
    desc: 'Organic wooden pebble / water pop.',
    tag: 'Organic Pop',
  },
  {
    id: 'scifi',
    name: 'Cyberpunk Pulse',
    category: 'Special',
    desc: 'Futuristic holographic laser blip.',
    tag: 'Hologram',
  },
  {
    id: 'mute',
    name: 'Mute / Silent',
    category: 'Special',
    desc: 'Disable all sound effects.',
    tag: 'Off',
  },
];

const DEFAULT_SETTINGS: SoundSettings = {
  profile: 'oil_king',
  volume: 0.8,
  hoverEnabled: true,
  clickEnabled: true,
};

let audioCtx: AudioContext | null = null;
let lastHoverSoundTime = 0;
let lastHoveredElement: Element | null = null;
let currentSettings: SoundSettings = loadSettings();

function loadSettings(): SoundSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem('hireme_sfx_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old 'thock' key to 'oil_king'
      if (parsed.profile === 'thock') parsed.profile = 'oil_king';
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Partial<SoundSettings>) {
  currentSettings = { ...currentSettings, ...settings };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('hireme_sfx_settings', JSON.stringify(currentSettings));
    } catch {}
  }
}

export function getAudioSettings(): SoundSettings {
  return { ...currentSettings };
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// ══════════════════════════════════════════════════════════════════════
// SWITCH SYNTHESIS ALGORITHMS
// ══════════════════════════════════════════════════════════════════════

/** 1. Gateron Oil King (Ultra Deep Lubed Thock) */
function synthOilKing(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const baseFreq = (isClick ? 165 : 200) * (1 + rand);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = isClick ? 'sine' : 'triangle';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(isClick ? 28 : 38, now + 0.045);

  gain.gain.setValueAtTime((isClick ? 0.28 : 0.17) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (isClick ? 0.065 : 0.05));

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(isClick ? 580 : 700, now);
  filter.Q.setValueAtTime(3.2, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.07);
}

/** 2. Holy Panda (Crisp Snappy Tactile Pop) */
function synthHolyPanda(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const bumpFreq = (isClick ? 320 : 380) * (1 + rand);

  // Tactile Bump
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(bumpFreq, now);
  osc1.frequency.exponentialRampToValueAtTime(65, now + 0.035);

  gain1.gain.setValueAtTime((isClick ? 0.22 : 0.14) * vol, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  // Pop transient
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(1100 * (1 + rand), now);
  osc2.frequency.exponentialRampToValueAtTime(220, now + 0.015);
  gain2.gain.setValueAtTime(0.12 * vol, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.045);
  osc2.start(now);
  osc2.stop(now + 0.02);
}

/** 3. Boba U4T (Creamy Dense Thock) */
function synthBobaU4T(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const baseFreq = (isClick ? 210 : 250) * (1 + rand);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(42, now + 0.038);

  gain.gain.setValueAtTime((isClick ? 0.24 : 0.15) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(820, now);
  filter.Q.setValueAtTime(2.2, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 4. Gateron Milky Yellow (Warm Nylon Butter) */
function synthMilkyYellow(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const baseFreq = (isClick ? 240 : 290) * (1 + rand);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.032);

  gain.gain.setValueAtTime((isClick ? 0.2 : 0.13) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(950, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.045);
}

/** 5. Alpaca V2 (High-Pitched Crisp Clack) */
function synthAlpaca(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const baseFreq = (isClick ? 420 : 520) * (1 + rand);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.026);

  gain.gain.setValueAtTime((isClick ? 0.22 : 0.15) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1300, now);
  filter.Q.setValueAtTime(1.5, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.035);
}

/** 6. Cherry MX Blue (Click Jacket Snap) */
function synthMXBlue(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;

  // Sharp click jacket
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  clickOsc.type = 'square';
  clickOsc.frequency.setValueAtTime((isClick ? 1800 : 2200) * (1 + rand), now);
  clickOsc.frequency.exponentialRampToValueAtTime(320, now + 0.015);

  clickGain.gain.setValueAtTime((isClick ? 0.18 : 0.12) * vol, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(900, now);

  clickOsc.connect(filter);
  filter.connect(clickGain);
  clickGain.connect(ctx.destination);

  // Bottom out body
  const bodyOsc = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  bodyOsc.type = 'triangle';
  bodyOsc.frequency.setValueAtTime(340, now + 0.006);
  bodyOsc.frequency.exponentialRampToValueAtTime(60, now + 0.035);
  bodyGain.gain.setValueAtTime(0.12 * vol, now + 0.006);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  bodyOsc.connect(bodyGain);
  bodyGain.connect(ctx.destination);

  clickOsc.start(now);
  clickOsc.stop(now + 0.022);
  bodyOsc.start(now + 0.006);
  bodyOsc.stop(now + 0.045);
}

/** 7. Kailh Box Navy (Thick Clickbar Crack) */
function synthBoxNavy(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime((isClick ? 1500 : 1900) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.022);

  gain.gain.setValueAtTime((isClick ? 0.26 : 0.18) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.Q.setValueAtTime(3.5, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.035);
}

/** 8. Kailh Box White (Crisp Clickbar Chime) */
function synthBoxWhite(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime((isClick ? 2400 : 2800) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(380, now + 0.014);

  gain.gain.setValueAtTime((isClick ? 0.16 : 0.11) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1200, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.022);
}

/** 9. Topre 45g (Electro-Capacitive Dome Pop) */
function synthTopre(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const baseFreq = (isClick ? 140 : 175) * (1 + rand);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.055);

  gain.gain.setValueAtTime((isClick ? 0.3 : 0.19) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(480, now);
  filter.Q.setValueAtTime(4.0, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.07);
}

/** 10. IBM Model M Buckling Spring (Steel Spring Ping) */
function synthBucklingSpring(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;

  // Spring Ping Resonance
  const pingOsc = ctx.createOscillator();
  const pingGain = ctx.createGain();
  pingOsc.type = 'sine';
  pingOsc.frequency.setValueAtTime((isClick ? 2800 : 3200) * (1 + rand), now);
  pingGain.gain.setValueAtTime(0.12 * vol, now);
  pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  // Heavy barrel strike
  const strikeOsc = ctx.createOscillator();
  const strikeGain = ctx.createGain();
  strikeOsc.type = 'triangle';
  strikeOsc.frequency.setValueAtTime(450, now);
  strikeOsc.frequency.exponentialRampToValueAtTime(50, now + 0.04);
  strikeGain.gain.setValueAtTime((isClick ? 0.25 : 0.16) * vol, now);
  strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  pingOsc.connect(pingGain);
  pingGain.connect(ctx.destination);
  strikeOsc.connect(strikeGain);
  strikeGain.connect(ctx.destination);

  pingOsc.start(now);
  pingOsc.stop(now + 0.08);
  strikeOsc.start(now);
  strikeOsc.stop(now + 0.05);
}

/** 11. Cherry MX Brown (Light Tactile Bump) */
function synthMXBrown(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 320 : 390) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.028);

  gain.gain.setValueAtTime((isClick ? 0.18 : 0.12) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.04);
}

/** 12. Cherry MX Red (Light Classic Linear) */
function synthMXRed(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 340 : 410) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.026);

  gain.gain.setValueAtTime((isClick ? 0.16 : 0.11) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.036);
}

/** 13. Cherry MX Black (Heavy Vintage Landing) */
function synthMXBlack(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 190 : 230) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(36, now + 0.042);

  gain.gain.setValueAtTime((isClick ? 0.25 : 0.16) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(650, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 14. Durock Silent Linear (Stealth Whispered Landing) */
function synthSilentLinear(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 130 : 160) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.025);

  gain.gain.setValueAtTime((isClick ? 0.12 : 0.08) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(380, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.035);
}

/** 15. Zealios V2 67g (Sharp Tactile Snap) */
function synthZealios(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 680 : 820) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.02);

  gain.gain.setValueAtTime((isClick ? 0.22 : 0.14) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1600, now);
  filter.Q.setValueAtTime(2.0, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.03);
}

/** 16. Bubble / Pebble */
function synthBubble(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.1;
  const startFreq = (isClick ? 380 : 540) * (1 + rand);
  const endFreq = (isClick ? 850 : 1200) * (1 + rand);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.035);

  gain.gain.setValueAtTime(0.18 * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** 17. Cyberpunk Sci-Fi */
function synthSciFi(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  const freq = isClick ? 1400 : 1800;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(isClick ? 280 : 420, now + 0.04);

  gain.gain.setValueAtTime(0.08 * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(isClick ? 1200 : 1600, now);
  filter.Q.setValueAtTime(4.0, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** 18. Vintage Typewriter */
function synthTypewriter(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.08;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime((isClick ? 750 : 1100) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.02);

  gain.gain.setValueAtTime((isClick ? 0.15 : 0.1) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(450, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.03);
}

/** Dispatcher to play selected switch sound */
function playSwitchSound(profile: SoundProfile, isClick: boolean) {
  if (profile === 'mute' || currentSettings.volume <= 0) return;
  if (!isClick && !currentSettings.hoverEnabled) return;
  if (isClick && !currentSettings.clickEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const vol = currentSettings.volume;

  switch (profile) {
    case 'oil_king':
      synthOilKing(ctx, now, vol, isClick);
      break;
    case 'holy_panda':
      synthHolyPanda(ctx, now, vol, isClick);
      break;
    case 'boba_u4t':
      synthBobaU4T(ctx, now, vol, isClick);
      break;
    case 'milky_yellow':
      synthMilkyYellow(ctx, now, vol, isClick);
      break;
    case 'alpaca':
      synthAlpaca(ctx, now, vol, isClick);
      break;
    case 'mx_blue':
      synthMXBlue(ctx, now, vol, isClick);
      break;
    case 'box_navy':
      synthBoxNavy(ctx, now, vol, isClick);
      break;
    case 'box_white':
      synthBoxWhite(ctx, now, vol, isClick);
      break;
    case 'topre':
      synthTopre(ctx, now, vol, isClick);
      break;
    case 'buckling_spring':
      synthBucklingSpring(ctx, now, vol, isClick);
      break;
    case 'mx_brown':
      synthMXBrown(ctx, now, vol, isClick);
      break;
    case 'mx_red':
      synthMXRed(ctx, now, vol, isClick);
      break;
    case 'mx_black':
      synthMXBlack(ctx, now, vol, isClick);
      break;
    case 'silent_alpaca':
      synthSilentLinear(ctx, now, vol, isClick);
      break;
    case 'zealios':
      synthZealios(ctx, now, vol, isClick);
      break;
    case 'bubble':
      synthBubble(ctx, now, vol, isClick);
      break;
    case 'scifi':
      synthSciFi(ctx, now, vol, isClick);
      break;
    case 'typewriter':
      synthTypewriter(ctx, now, vol, isClick);
      break;
  }
}

export function playHoverSound(overrideProfile?: SoundProfile) {
  playSwitchSound(overrideProfile || currentSettings.profile, false);
}

export function playClickSound(overrideProfile?: SoundProfile) {
  playSwitchSound(overrideProfile || currentSettings.profile, true);
}

export function previewSoundProfile(profile: SoundProfile) {
  playSwitchSound(profile, false);
}

const INTERACTIVE_SELECTOR = [
  'button',
  'a',
  'input',
  'textarea',
  'select',
  '.cursor-pointer',
  '[role="button"]',
  '.glass-card',
  '.tilt-surface',
  '.tilt-card',
  '[data-thock="true"]',
  '[data-tilt-card="true"]',
  '.surface',
  '.nav-brand-mark',
  '.score-card',
  '.module-card',
  '.capability-card',
].join(', ');

export function setupThockAudioListener() {
  if (typeof window === 'undefined') return () => {};

  const handlePointerOver = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactive = target.closest(INTERACTIVE_SELECTOR);

    if (interactive && interactive !== lastHoveredElement) {
      lastHoveredElement = interactive;
      const now = performance.now();
      if (now - lastHoverSoundTime > 40) {
        lastHoverSoundTime = now;
        playHoverSound();
      }
    }
  };

  const handlePointerDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactive = target.closest(INTERACTIVE_SELECTOR);

    if (interactive) {
      playClickSound();
    }
  };

  const handlePointerOut = (e: MouseEvent) => {
    if (e.relatedTarget && lastHoveredElement) {
      const related = e.relatedTarget as HTMLElement;
      if (!related.closest || !related.closest(lastHoveredElement.nodeName)) {
        lastHoveredElement = null;
      }
    } else {
      lastHoveredElement = null;
    }
  };

  window.addEventListener('mouseover', handlePointerOver, { passive: true });
  window.addEventListener('mousedown', handlePointerDown, { passive: true });
  window.addEventListener('mouseout', handlePointerOut, { passive: true });

  return () => {
    window.removeEventListener('mouseover', handlePointerOver);
    window.removeEventListener('mousedown', handlePointerDown);
    window.removeEventListener('mouseout', handlePointerOut);
  };
}
