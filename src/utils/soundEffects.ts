/**
 * Mechanical Keyboard Switch Acoustic Synthesizer Engine (Web Audio API)
 * Features 38 distinct switch profiles modeled after real-world enthusiast switches:
 * Linear, Tactile, Clicky, Silent, Vintage/Electro-Capacitive, Magnetic Hall-Effect, and Sci-Fi/Special.
 * Plus Procedural Ambient Soundscapes and Real-Time AnalyserNode for audio visualization.
 */

import {
  getExperienceSettings,
  saveExperienceSettings,
  triggerHaptic,
  type ExperienceSettings,
  type AmbientType,
} from './experienceSettings';

export type SoundProfile =
  | 'oil_king'
  | 'holy_panda'
  | 'boba_u4t'
  | 'milky_yellow'
  | 'alpaca'
  | 'mx_red'
  | 'mx_black'
  | 'silent_alpaca'
  | 'mx_brown'
  | 'zealios'
  | 'topre'
  | 'buckling_spring'
  | 'mx_blue'
  | 'box_navy'
  | 'box_white'
  | 'wooting_lekker'
  | 'creamsicle'
  | 'banana_split'
  | 'tangerine'
  | 'gateron_ink_black'
  | 'boba_black_u4'
  | 'aqua_king'
  | 'drop_halo_true'
  | 'kailh_box_jade'
  | 'matias_click'
  | 'beam_spring'
  | 'gateron_cj'
  | 'durock_t1'
  | 'epomaker_wisteria'
  | 'akko_jelly_black'
  | 'outemu_silent_peach'
  | 'space_cadet'
  | 'laser_clack'
  | 'mechanical_calculator'
  | 'quantum_relay'
  | 'bubble'
  | 'scifi'
  | 'typewriter'
  | 'mute';

export type SoundSettings = ExperienceSettings;

export interface SwitchMeta {
  id: SoundProfile;
  name: string;
  category: 'Linear' | 'Tactile' | 'Clicky' | 'Silent' | 'Vintage / Hall Effect' | 'Special';
  desc: string;
  tag: string;
}

export const SWITCH_PROFILES: SwitchMeta[] = [
  // Linear
  {
    id: 'oil_king',
    name: 'Gateron Oil King',
    category: 'Linear',
    desc: 'Deep, heavy, factory-lubed ultra-thocky bottom out.',
    tag: 'Deep Thock',
  },
  {
    id: 'gateron_ink_black',
    name: 'Gateron Ink Black V2',
    category: 'Linear',
    desc: 'Smoky transparent housing with deep bassy bottom-out acoustic.',
    tag: 'Smoky Bass',
  },
  {
    id: 'creamsicle',
    name: 'NK Creamsicle',
    category: 'Linear',
    desc: 'POM Cream stem in Tangerine housing for sharp marbly clack.',
    tag: 'Marbly Clack',
  },
  {
    id: 'banana_split',
    name: 'C3 Banana Split (Macho)',
    category: 'Linear',
    desc: 'Buttery nylon/polycarbonate blend with distinctive creamy pop.',
    tag: 'Creamy Pop',
  },
  {
    id: 'tangerine',
    name: 'C3 Tangerine 67g',
    category: 'Linear',
    desc: 'High-pitched crisp UHMWPE housing clack with rapid pop.',
    tag: 'Crisp High-Pitch',
  },
  {
    id: 'aqua_king',
    name: 'Everglide Aqua King',
    category: 'Linear',
    desc: 'Pure clear polycarbonate housing with solid glassy acoustic.',
    tag: 'Glassy Clack',
  },
  {
    id: 'gateron_cj',
    name: 'Gateron CJ (China Jam)',
    category: 'Linear',
    desc: 'Snappy smooth POM stem with bright distinctive clack.',
    tag: 'Snappy POM',
  },
  {
    id: 'epomaker_wisteria',
    name: 'Epomaker Wisteria',
    category: 'Linear',
    desc: 'Pastel fast-actuation switch with hollow wood-like thock.',
    tag: 'Woody Thock',
  },
  {
    id: 'akko_jelly_black',
    name: 'Akko CS Jelly Black',
    category: 'Linear',
    desc: 'Dustproof stem with stiff spring and crisp modern landing.',
    tag: 'Stiff Clack',
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

  // Tactile
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
    id: 'durock_t1',
    name: 'Durock T1 (Koala)',
    category: 'Tactile',
    desc: 'Aggressive smokey tactile bump with loud solid bottom.',
    tag: 'Sharp D-Bump',
  },
  {
    id: 'drop_halo_true',
    name: 'Drop Halo True',
    category: 'Tactile',
    desc: 'High tactile bump with progressive heavy spring bounce.',
    tag: 'Heavy Spring',
  },
  {
    id: 'zealios',
    name: 'Zealios V2 67g',
    category: 'Tactile',
    desc: 'Ultra-crisp elevated tactile snap with metallic leaf resonance.',
    tag: 'Sharp Tactile',
  },
  {
    id: 'mx_brown',
    name: 'Cherry MX Brown',
    category: 'Tactile',
    desc: 'Lightweight subtle bump with gentle tactile feel.',
    tag: 'Subtle Tactile',
  },

  // Clicky
  {
    id: 'kailh_box_jade',
    name: 'Kailh Box Jade',
    category: 'Clicky',
    desc: 'Thick click-bar with crisp, explosive gunshot-like snap.',
    tag: 'Gunshot Click',
  },
  {
    id: 'box_navy',
    name: 'Kailh Box Navy',
    category: 'Clicky',
    desc: 'Heavy thick click-bar explosive acoustic crack and deep bottom.',
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
    id: 'matias_click',
    name: 'Matias / Alps Click',
    category: 'Clicky',
    desc: 'Legendary Alps leaf click with hollow metallic chime.',
    tag: 'Alps Chime',
  },
  {
    id: 'mx_blue',
    name: 'Cherry MX Blue',
    category: 'Clicky',
    desc: 'Loud, distinct click-jacket snap with sharp metallic actuation.',
    tag: 'Click Jacket',
  },

  // Silent
  {
    id: 'boba_black_u4',
    name: 'Gazzew Boba U4 Silent',
    category: 'Silent',
    desc: 'Silicone cushioned tactile bump with ultra-deep stealth thud.',
    tag: 'Silent Tactile',
  },
  {
    id: 'outemu_silent_peach',
    name: 'Outemu Silent Peach V2',
    category: 'Silent',
    desc: 'Whisper-quiet silicone pad landing for silent work sessions.',
    tag: 'Whisper Peach',
  },
  {
    id: 'silent_alpaca',
    name: 'Durock Silent Linear',
    category: 'Silent',
    desc: 'Muted stealth dampener with soft cushioned landing.',
    tag: 'Stealth Mute',
  },

  // Vintage & Hall Effect
  {
    id: 'wooting_lekker',
    name: 'Wooting Lekker Hall Effect',
    category: 'Vintage / Hall Effect',
    desc: 'Frictionless magnetic Hall-Effect linear with soft magnetic chime.',
    tag: 'Magnetic Hall',
  },
  {
    id: 'beam_spring',
    name: 'IBM 5251 Beam Spring',
    category: 'Vintage / Hall Effect',
    desc: '1970s holy grail with magnetic solenoid punch and beam click.',
    tag: 'Solenoid Beam',
  },
  {
    id: 'space_cadet',
    name: 'Symbolics Space Cadet',
    category: 'Vintage / Hall Effect',
    desc: '1980s LISP machine inductive switch with heavy acoustic punch.',
    tag: 'LISP Inductive',
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

  // Special & Sci-Fi
  {
    id: 'laser_clack',
    name: 'Sanwa Arcade Microswitch',
    category: 'Special',
    desc: 'Instant snappy Japanese arcade push-button slap.',
    tag: 'Arcade Snap',
  },
  {
    id: 'mechanical_calculator',
    name: 'Curta Mechanical Gear',
    category: 'Special',
    desc: 'Precision vintage gear ratchet click with brass ring chime.',
    tag: 'Brass Ratchet',
  },
  {
    id: 'quantum_relay',
    name: 'Quantum Computing Relay',
    category: 'Special',
    desc: 'Plasma-charged subatomic acoustic tick with micro-reverb.',
    tag: 'Plasma Relay',
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

let audioCtx: AudioContext | null = null;
let analyserNode: AnalyserNode | null = null;
let lastHoverSoundTime = 0;
let lastHoveredElement: Element | null = null;

export function getAudioSettings(): ExperienceSettings {
  return getExperienceSettings();
}

export function saveSettings(settings: Partial<ExperienceSettings>) {
  saveExperienceSettings(settings);
}

export function getAudioContext(): AudioContext | null {
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

export function getAudioAnalyser(): AnalyserNode | null {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (!analyserNode) {
    analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.75;
  }
  return analyserNode;
}

/** Direct connect to destination + analyser node for 100% reliable audio output */
function connectToBus(ctx: AudioContext, node: AudioNode) {
  try {
    node.connect(ctx.destination);
    const analyser = getAudioAnalyser();
    if (analyser) {
      node.connect(analyser);
    }
  } catch {}
}

// ══════════════════════════════════════════════════════════════════════
// 38 SWITCH SYNTHESIS ALGORITHMS
// ══════════════════════════════════════════════════════════════════════

/** 1. Gateron Oil King (Ultra Deep Lubed Thock) */
function synthOilKing(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const baseFreq = (isClick ? 165 : 200) * (1 + rand);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = isClick ? 'sine' : 'triangle';
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(28, now + 0.045);

  gain.gain.setValueAtTime((isClick ? 0.34 : 0.22) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (isClick ? 0.065 : 0.05));

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(isClick ? 580 : 700, now);
  filter.Q.setValueAtTime(3.2, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.07);
}

/** 2. Gateron Ink Black V2 (Smoky Bass Thock) */
function synthInkBlack(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 145 : 180) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(22, now + 0.05);

  gain.gain.setValueAtTime((isClick ? 0.36 : 0.24) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(420, now);
  filter.Q.setValueAtTime(4.2, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.07);
}

/** 3. NK Creamsicle (Marbly High-Pitched Pop) */
function synthCreamsicle(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 420 : 490) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(95, now + 0.035);

  gain.gain.setValueAtTime((isClick ? 0.32 : 0.2) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1450, now);
  filter.Q.setValueAtTime(2.5, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** 4. C3 Banana Split / Macho (Creamy Pop) */
function synthBananaSplit(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 240 : 290) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.3 : 0.18) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(780, now);
  filter.Q.setValueAtTime(2.8, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 5. C3 Tangerine 67g (Crisp UHMWPE Clack) */
function synthTangerine(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime((isClick ? 480 : 540) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.03);

  gain.gain.setValueAtTime((isClick ? 0.28 : 0.18) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(320, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.045);
}

/** 6. Everglide Aqua King (Glassy Polycarbonate Clack) */
function synthAquaKing(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime((isClick ? 520 : 580) * (1 + rand), now);
  osc1.frequency.exponentialRampToValueAtTime(110, now + 0.03);
  gain1.gain.setValueAtTime(0.25 * vol, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const oscGlass = ctx.createOscillator();
  const gainGlass = ctx.createGain();
  oscGlass.type = 'sine';
  oscGlass.frequency.setValueAtTime(2100, now);
  oscGlass.frequency.exponentialRampToValueAtTime(700, now + 0.015);
  gainGlass.gain.setValueAtTime(0.12 * vol, now);
  gainGlass.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  osc1.connect(gain1);
  oscGlass.connect(gainGlass);
  connectToBus(ctx, gain1);
  connectToBus(ctx, gainGlass);
  osc1.start(now);
  osc1.stop(now + 0.045);
  oscGlass.start(now);
  oscGlass.stop(now + 0.025);
}

/** 7. Gateron CJ (China Jam Snappy POM) */
function synthGateronCJ(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 440 : 500) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(85, now + 0.035);

  gain.gain.setValueAtTime((isClick ? 0.3 : 0.19) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.Q.setValueAtTime(1.8, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** 8. Epomaker Wisteria (Woody Hollow Thock) */
function synthWisteria(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 270 : 320) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.32 : 0.2) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(640, now);
  filter.Q.setValueAtTime(3.5, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 9. Akko CS Jelly Black (Stiff Crisp Landing) */
function synthJellyBlack(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 310 : 370) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(65, now + 0.035);

  gain.gain.setValueAtTime((isClick ? 0.3 : 0.18) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** 10. Holy Panda (Crisp Snappy Tactile Pop) */
function synthHolyPanda(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const bumpFreq = (isClick ? 320 : 380) * (1 + rand);

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(bumpFreq, now);
  osc1.frequency.exponentialRampToValueAtTime(140, now + 0.015);
  gain1.gain.setValueAtTime(0.24 * vol, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime((isClick ? 190 : 230) * (1 + rand), now + 0.01);
  osc2.frequency.exponentialRampToValueAtTime(45, now + 0.05);
  gain2.gain.setValueAtTime(0.28 * vol, now + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + (isClick ? 0.06 : 0.045));

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(isClick ? 950 : 1100, now);
  filter.Q.setValueAtTime(2.2, now);

  osc1.connect(gain1);
  osc2.connect(filter);
  filter.connect(gain2);

  connectToBus(ctx, gain1);
  connectToBus(ctx, gain2);

  osc1.start(now);
  osc1.stop(now + 0.03);
  osc2.start(now + 0.008);
  osc2.stop(now + 0.065);
}

/** 11. Gazzew Boba U4T (Dense Creamy Thock) */
function synthBobaU4T(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 210 : 260) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(32, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.32 : 0.2) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(isClick ? 460 : 540, now);
  filter.Q.setValueAtTime(4.0, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);

  osc.start(now);
  osc.stop(now + 0.06);
}

/** 12. Durock T1 / Koala (Sharp Tactile D-Bump) */
function synthDurockT1(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime((isClick ? 360 : 420) * (1 + rand), now);
  osc1.frequency.exponentialRampToValueAtTime(150, now + 0.02);
  gain1.gain.setValueAtTime(0.22 * vol, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(175, now + 0.01);
  osc2.frequency.exponentialRampToValueAtTime(38, now + 0.045);
  gain2.gain.setValueAtTime(0.28 * vol, now + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  osc1.connect(gain1);
  osc2.connect(gain2);
  connectToBus(ctx, gain1);
  connectToBus(ctx, gain2);
  osc1.start(now);
  osc1.stop(now + 0.035);
  osc2.start(now + 0.01);
  osc2.stop(now + 0.06);
}

/** 13. Drop Halo True (Heavy Spring Progressive Tactile) */
function synthHaloTrue(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 340 : 390) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.3 : 0.19) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 14. Kailh Box Jade (Gunshot Clickbar) */
function synthBoxJade(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const oscClick = ctx.createOscillator();
  const gainClick = ctx.createGain();
  oscClick.type = 'triangle';
  oscClick.frequency.setValueAtTime((isClick ? 2200 : 2500) * (1 + rand), now);
  oscClick.frequency.exponentialRampToValueAtTime(450, now + 0.014);
  gainClick.gain.setValueAtTime(0.35 * vol, now);
  gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

  const oscThud = ctx.createOscillator();
  const gainThud = ctx.createGain();
  oscThud.type = 'sine';
  oscThud.frequency.setValueAtTime(210, now + 0.003);
  oscThud.frequency.exponentialRampToValueAtTime(35, now + 0.045);
  gainThud.gain.setValueAtTime(0.26 * vol, now + 0.003);
  gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  oscClick.connect(gainClick);
  oscThud.connect(gainThud);
  connectToBus(ctx, gainClick);
  connectToBus(ctx, gainThud);
  oscClick.start(now);
  oscClick.stop(now + 0.028);
  oscThud.start(now + 0.003);
  oscThud.stop(now + 0.06);
}

/** 15. Matias / Alps Click (Vintage Alps Hollow Chime) */
function synthMatiasClick(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const oscChime = ctx.createOscillator();
  const gainChime = ctx.createGain();
  oscChime.type = 'square';
  oscChime.frequency.setValueAtTime((isClick ? 1750 : 1950) * (1 + rand), now);
  oscChime.frequency.exponentialRampToValueAtTime(600, now + 0.02);
  gainChime.gain.setValueAtTime(0.22 * vol, now);
  gainChime.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  const oscBody = ctx.createOscillator();
  const gainBody = ctx.createGain();
  oscBody.type = 'triangle';
  oscBody.frequency.setValueAtTime(270, now + 0.005);
  oscBody.frequency.exponentialRampToValueAtTime(45, now + 0.05);
  gainBody.gain.setValueAtTime(0.25 * vol, now + 0.005);
  gainBody.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1300, now);
  filter.Q.setValueAtTime(3.0, now);

  oscChime.connect(filter);
  filter.connect(gainChime);
  oscBody.connect(gainBody);
  connectToBus(ctx, gainChime);
  connectToBus(ctx, gainBody);

  oscChime.start(now);
  oscChime.stop(now + 0.04);
  oscBody.start(now + 0.005);
  oscBody.stop(now + 0.065);
}

/** 16. Wooting Lekker (Magnetic Hall Effect) */
function synthWootingLekker(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 240 : 280) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.038);

  gain.gain.setValueAtTime((isClick ? 0.3 : 0.18) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(850, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 17. IBM 5251 Beam Spring (1970s Solenoid Beam Strike) */
function synthBeamSpring(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  // Solenoid heavy punch
  const oscSolenoid = ctx.createOscillator();
  const gainSolenoid = ctx.createGain();
  oscSolenoid.type = 'triangle';
  oscSolenoid.frequency.setValueAtTime((isClick ? 130 : 160) * (1 + rand), now);
  oscSolenoid.frequency.exponentialRampToValueAtTime(25, now + 0.06);
  gainSolenoid.gain.setValueAtTime((isClick ? 0.35 : 0.22) * vol, now);
  gainSolenoid.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

  // Beam metallic click
  const oscBeam = ctx.createOscillator();
  const gainBeam = ctx.createGain();
  oscBeam.type = 'square';
  oscBeam.frequency.setValueAtTime((isClick ? 980 : 1100) * (1 + rand), now);
  oscBeam.frequency.exponentialRampToValueAtTime(380, now + 0.025);
  gainBeam.gain.setValueAtTime((isClick ? 0.24 : 0.16) * vol, now);
  gainBeam.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  oscSolenoid.connect(gainSolenoid);
  oscBeam.connect(gainBeam);
  connectToBus(ctx, gainSolenoid);
  connectToBus(ctx, gainBeam);
  oscSolenoid.start(now);
  oscSolenoid.stop(now + 0.08);
  oscBeam.start(now);
  oscBeam.stop(now + 0.045);
}

/** 18. Symbolics Space Cadet (1980s LISP Inductive) */
function synthSpaceCadet(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime((isClick ? 850 : 950) * (1 + rand), now);
  osc1.frequency.exponentialRampToValueAtTime(240, now + 0.025);
  gain1.gain.setValueAtTime((isClick ? 0.22 : 0.14) * vol, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(isClick ? 160 : 190, now + 0.005);
  osc2.frequency.exponentialRampToValueAtTime(30, now + 0.05);
  gain2.gain.setValueAtTime((isClick ? 0.3 : 0.18) * vol, now + 0.005);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc1.connect(gain1);
  osc2.connect(gain2);
  connectToBus(ctx, gain1);
  connectToBus(ctx, gain2);
  osc1.start(now);
  osc1.stop(now + 0.04);
  osc2.start(now + 0.005);
  osc2.stop(now + 0.065);
}

/** 19. Sanwa Arcade Microswitch (Arcade Snap) */
function synthArcadeSanwa(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const oscSnap = ctx.createOscillator();
  const gainSnap = ctx.createGain();
  oscSnap.type = 'square';
  oscSnap.frequency.setValueAtTime((isClick ? 1250 : 1400) * (1 + rand), now);
  oscSnap.frequency.exponentialRampToValueAtTime(280, now + 0.015);
  gainSnap.gain.setValueAtTime((isClick ? 0.28 : 0.18) * vol, now);
  gainSnap.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

  const oscCap = ctx.createOscillator();
  const gainCap = ctx.createGain();
  oscCap.type = 'triangle';
  oscCap.frequency.setValueAtTime(isClick ? 300 : 340, now + 0.003);
  oscCap.frequency.exponentialRampToValueAtTime(45, now + 0.035);
  gainCap.gain.setValueAtTime((isClick ? 0.25 : 0.16) * vol, now + 0.003);
  gainCap.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  oscSnap.connect(gainSnap);
  oscCap.connect(gainCap);
  connectToBus(ctx, gainSnap);
  connectToBus(ctx, gainCap);
  oscSnap.start(now);
  oscSnap.stop(now + 0.03);
  oscCap.start(now + 0.003);
  oscCap.stop(now + 0.05);
}

/** 20. Curta Mechanical Calculator (Brass Ratchet Click) */
function synthMechanicalCalculator(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const oscBell = ctx.createOscillator();
  const gainBell = ctx.createGain();
  oscBell.type = 'sine';
  oscBell.frequency.setValueAtTime((isClick ? 3200 : 3600) * (1 + rand), now);
  oscBell.frequency.exponentialRampToValueAtTime(1600, now + 0.03);
  gainBell.gain.setValueAtTime((isClick ? 0.2 : 0.12) * vol, now);
  gainBell.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const oscGear = ctx.createOscillator();
  const gainGear = ctx.createGain();
  oscGear.type = 'sawtooth';
  oscGear.frequency.setValueAtTime(isClick ? 420 : 480, now);
  oscGear.frequency.exponentialRampToValueAtTime(80, now + 0.02);
  gainGear.gain.setValueAtTime((isClick ? 0.26 : 0.16) * vol, now);
  gainGear.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  oscBell.connect(gainBell);
  oscGear.connect(gainGear);
  connectToBus(ctx, gainBell);
  connectToBus(ctx, gainGear);
  oscBell.start(now);
  oscBell.stop(now + 0.06);
  oscGear.start(now);
  oscGear.stop(now + 0.035);
}

/** 21. Quantum Computing Relay (Plasma Tick) */
function synthQuantumRelay(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 3800 : 4200) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(240, now + 0.022);

  gain.gain.setValueAtTime((isClick ? 0.28 : 0.18) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2400, now);
  filter.Q.setValueAtTime(4.0, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.04);
}

/** 22. Gazzew Boba Black U4 (Silent Tactile) */
function synthBobaBlackU4(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 110 : 135) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(18, now + 0.025);

  gain.gain.setValueAtTime((isClick ? 0.16 : 0.09) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(220, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.035);
}

/** 23. Outemu Silent Peach V2 (Whisper Peach) */
function synthSilentPeach(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 95 : 120) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(15, now + 0.022);

  gain.gain.setValueAtTime((isClick ? 0.13 : 0.08) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.032);
}

/** 24. Gateron Milky Yellow */
function synthMilkyYellow(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 280 : 330) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.035);

  gain.gain.setValueAtTime((isClick ? 0.26 : 0.17) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(850, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** 25. Alpaca V2 */
function synthAlpaca(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 380 : 440) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);

  gain.gain.setValueAtTime((isClick ? 0.28 : 0.18) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.045);
}

/** 26. Cherry MX Blue */
function synthMXBlue(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const oscClick = ctx.createOscillator();
  const gainClick = ctx.createGain();
  oscClick.type = 'square';
  oscClick.frequency.setValueAtTime((isClick ? 1850 : 2100) * (1 + rand), now);
  oscClick.frequency.exponentialRampToValueAtTime(800, now + 0.012);
  gainClick.gain.setValueAtTime(0.22 * vol, now);
  gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  const oscThud = ctx.createOscillator();
  const gainThud = ctx.createGain();
  oscThud.type = 'sine';
  oscThud.frequency.setValueAtTime((isClick ? 240 : 280) * (1 + rand), now + 0.006);
  oscThud.frequency.exponentialRampToValueAtTime(50, now + 0.04);
  gainThud.gain.setValueAtTime(0.24 * vol, now + 0.006);
  gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  oscClick.connect(gainClick);
  oscThud.connect(gainThud);
  connectToBus(ctx, gainClick);
  connectToBus(ctx, gainThud);
  oscClick.start(now);
  oscClick.stop(now + 0.025);
  oscThud.start(now + 0.006);
  oscThud.stop(now + 0.055);
}

/** 27. Kailh Box Navy */
function synthBoxNavy(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const oscClick = ctx.createOscillator();
  const gainClick = ctx.createGain();
  oscClick.type = 'triangle';
  oscClick.frequency.setValueAtTime((isClick ? 1400 : 1600) * (1 + rand), now);
  oscClick.frequency.exponentialRampToValueAtTime(300, now + 0.015);
  gainClick.gain.setValueAtTime(0.32 * vol, now);
  gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  const oscSub = ctx.createOscillator();
  const gainSub = ctx.createGain();
  oscSub.type = 'sine';
  oscSub.frequency.setValueAtTime(180, now + 0.004);
  oscSub.frequency.exponentialRampToValueAtTime(35, now + 0.045);
  gainSub.gain.setValueAtTime(0.28 * vol, now + 0.004);
  gainSub.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  oscClick.connect(gainClick);
  oscSub.connect(gainSub);
  connectToBus(ctx, gainClick);
  connectToBus(ctx, gainSub);
  oscClick.start(now);
  oscClick.stop(now + 0.03);
  oscSub.start(now + 0.004);
  oscSub.stop(now + 0.06);
}

/** 28. Kailh Box White */
function synthBoxWhite(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 2400 : 2800) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.016);

  gain.gain.setValueAtTime((isClick ? 0.25 : 0.17) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.028);
}

/** 29. Topre 45g (Electro-Capacitive Thock) */
function synthTopre(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 140 : 170) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(25, now + 0.055);

  gain.gain.setValueAtTime((isClick ? 0.36 : 0.24) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (isClick ? 0.075 : 0.06));

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(380, now);
  filter.Q.setValueAtTime(5.0, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.08);
}

/** 30. IBM Model M Buckling Spring */
function synthBucklingSpring(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const oscPing = ctx.createOscillator();
  const gainPing = ctx.createGain();
  oscPing.type = 'sawtooth';
  oscPing.frequency.setValueAtTime((isClick ? 1150 : 1300) * (1 + rand), now);
  oscPing.frequency.exponentialRampToValueAtTime(450, now + 0.035);
  gainPing.gain.setValueAtTime(0.22 * vol, now);
  gainPing.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  const oscBarrel = ctx.createOscillator();
  const gainBarrel = ctx.createGain();
  oscBarrel.type = 'triangle';
  oscBarrel.frequency.setValueAtTime((isClick ? 260 : 310) * (1 + rand), now + 0.005);
  oscBarrel.frequency.exponentialRampToValueAtTime(40, now + 0.045);
  gainBarrel.gain.setValueAtTime(0.3 * vol, now + 0.005);
  gainBarrel.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

  oscPing.connect(gainPing);
  oscBarrel.connect(gainBarrel);
  connectToBus(ctx, gainPing);
  connectToBus(ctx, gainBarrel);
  oscPing.start(now);
  oscPing.stop(now + 0.07);
  oscBarrel.start(now + 0.005);
  oscBarrel.stop(now + 0.075);
}

/** 31. Cherry MX Brown */
function synthMXBrown(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 290 : 340) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.03);

  gain.gain.setValueAtTime((isClick ? 0.24 : 0.15) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.045);
}

/** 32. Cherry MX Red */
function synthMXRed(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 310 : 360) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.025);

  gain.gain.setValueAtTime((isClick ? 0.22 : 0.14) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.04);
}

/** 33. Cherry MX Black */
function synthMXBlack(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 180 : 220) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.29 : 0.18) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(620, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 34. Durock Silent Linear */
function synthSilentLinear(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 120 : 150) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(20, now + 0.025);

  gain.gain.setValueAtTime((isClick ? 0.15 : 0.09) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(280, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.035);
}

/** 35. Zealios V2 67g */
function synthZealios(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime((isClick ? 460 : 520) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.03);

  gain.gain.setValueAtTime((isClick ? 0.25 : 0.16) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1300, now);
  filter.Q.setValueAtTime(3.5, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.045);
}

/** 36. Organic Bubble Pop */
function synthBubble(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.08;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 320 : 400) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(isClick ? 850 : 1050, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.34 : 0.22) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 37. Cyberpunk SciFi Pulse */
function synthSciFi(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime((isClick ? 1400 : 1700) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);

  gain.gain.setValueAtTime((isClick ? 0.22 : 0.14) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2400, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 38. Vintage Typewriter */
function synthTypewriter(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const oscMetal = ctx.createOscillator();
  const gainMetal = ctx.createGain();
  oscMetal.type = 'square';
  oscMetal.frequency.setValueAtTime((isClick ? 2200 : 2500) * (1 + rand), now);
  oscMetal.frequency.exponentialRampToValueAtTime(400, now + 0.015);
  gainMetal.gain.setValueAtTime(0.22 * vol, now);
  gainMetal.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

  const oscPlaten = ctx.createOscillator();
  const gainPlaten = ctx.createGain();
  oscPlaten.type = 'triangle';
  oscPlaten.frequency.setValueAtTime(320 * (1 + rand), now + 0.005);
  oscPlaten.frequency.exponentialRampToValueAtTime(60, now + 0.045);
  gainPlaten.gain.setValueAtTime(0.3 * vol, now + 0.005);
  gainPlaten.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  oscMetal.connect(gainMetal);
  oscPlaten.connect(gainPlaten);
  connectToBus(ctx, gainMetal);
  connectToBus(ctx, gainPlaten);
  oscMetal.start(now);
  oscMetal.stop(now + 0.025);
  oscPlaten.start(now + 0.005);
  oscPlaten.stop(now + 0.06);
}

// ══════════════════════════════════════════════════════════════════════
// PROCEDURAL AMBIENT SOUNDSCAPES
// ══════════════════════════════════════════════════════════════════════

let ambientNodes: {
  sources: AudioNode[];
  gain: GainNode;
  cleanup: () => void;
} | null = null;

export function stopAmbientSoundscape() {
  if (ambientNodes) {
    try {
      ambientNodes.cleanup();
    } catch {}
    ambientNodes = null;
  }
}

export function setAmbientVolume(vol: number) {
  if (ambientNodes && ambientNodes.gain) {
    ambientNodes.gain.gain.setTargetAtTime(vol * 0.18, (getAudioContext()?.currentTime || 0) + 0.01, 0.1);
  }
}

export function startAmbientSoundscape(type: AmbientType, volume: number = 0.4) {
  stopAmbientSoundscape();
  if (type === 'off') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume * 0.18, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const sources: AudioNode[] = [];

  if (type === 'lofi_rain') {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    whiteNoise.start();
    sources.push(whiteNoise);
  } else if (type === 'server_drone') {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(60, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(120, ctx.currentTime);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.5, ctx.currentTime);

    osc1.connect(droneGain);
    osc2.connect(droneGain);
    droneGain.connect(masterGain);

    osc1.start();
    osc2.start();
    sources.push(osc1, osc2);
  } else if (type === 'binaural_alpha') {
    const merger = ctx.createChannelMerger(2);

    const oscL = ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(432, ctx.currentTime);

    const oscR = ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(442, ctx.currentTime);

    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(masterGain);

    oscL.start();
    oscR.start();
    sources.push(oscL, oscR);
  } else if (type === 'cozy_coffee') {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.05;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    noise.connect(filter);
    filter.connect(masterGain);
    noise.start();
    sources.push(noise);
  }

  ambientNodes = {
    sources,
    gain: masterGain,
    cleanup: () => {
      sources.forEach((s) => {
        try {
          if ('stop' in s && typeof (s as any).stop === 'function') (s as any).stop();
          s.disconnect();
        } catch {}
      });
      masterGain.disconnect();
    },
  };
}

// ══════════════════════════════════════════════════════════════════════
// PLAYBACK DISPATCHER (All 38 Sound Profiles)
// ══════════════════════════════════════════════════════════════════════

export function playSwitchSound(profile: SoundProfile, isClick = false, isPreview = false) {
  if (profile === 'mute') return;

  const settings = getExperienceSettings();
  if (!isPreview) {
    if (isClick && !settings.clickEnabled) return;
    if (!isClick && !settings.hoverEnabled) return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const vol = isPreview ? Math.max(settings.volume, 0.85) : settings.volume;
  if (vol <= 0) return;

  if (isClick) {
    triggerHaptic('light');
  }

  switch (profile) {
    case 'oil_king':
      synthOilKing(ctx, now, vol, isClick);
      break;
    case 'gateron_ink_black':
      synthInkBlack(ctx, now, vol, isClick);
      break;
    case 'creamsicle':
      synthCreamsicle(ctx, now, vol, isClick);
      break;
    case 'banana_split':
      synthBananaSplit(ctx, now, vol, isClick);
      break;
    case 'tangerine':
      synthTangerine(ctx, now, vol, isClick);
      break;
    case 'aqua_king':
      synthAquaKing(ctx, now, vol, isClick);
      break;
    case 'gateron_cj':
      synthGateronCJ(ctx, now, vol, isClick);
      break;
    case 'epomaker_wisteria':
      synthWisteria(ctx, now, vol, isClick);
      break;
    case 'akko_jelly_black':
      synthJellyBlack(ctx, now, vol, isClick);
      break;
    case 'holy_panda':
      synthHolyPanda(ctx, now, vol, isClick);
      break;
    case 'boba_u4t':
      synthBobaU4T(ctx, now, vol, isClick);
      break;
    case 'durock_t1':
      synthDurockT1(ctx, now, vol, isClick);
      break;
    case 'drop_halo_true':
      synthHaloTrue(ctx, now, vol, isClick);
      break;
    case 'kailh_box_jade':
      synthBoxJade(ctx, now, vol, isClick);
      break;
    case 'matias_click':
      synthMatiasClick(ctx, now, vol, isClick);
      break;
    case 'wooting_lekker':
      synthWootingLekker(ctx, now, vol, isClick);
      break;
    case 'beam_spring':
      synthBeamSpring(ctx, now, vol, isClick);
      break;
    case 'space_cadet':
      synthSpaceCadet(ctx, now, vol, isClick);
      break;
    case 'laser_clack':
      synthArcadeSanwa(ctx, now, vol, isClick);
      break;
    case 'mechanical_calculator':
      synthMechanicalCalculator(ctx, now, vol, isClick);
      break;
    case 'quantum_relay':
      synthQuantumRelay(ctx, now, vol, isClick);
      break;
    case 'boba_black_u4':
      synthBobaBlackU4(ctx, now, vol, isClick);
      break;
    case 'outemu_silent_peach':
      synthSilentPeach(ctx, now, vol, isClick);
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
  const settings = getExperienceSettings();
  playSwitchSound(overrideProfile || settings.profile, false, false);
}

export function playClickSound(overrideProfile?: SoundProfile) {
  const settings = getExperienceSettings();
  playSwitchSound(overrideProfile || settings.profile, true, false);
}

export function previewSoundProfile(profile: SoundProfile) {
  playSwitchSound(profile, true, true);
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

  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };

  const handlePointerOver = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactive = target.closest(INTERACTIVE_SELECTOR);

    if (interactive && interactive !== lastHoveredElement) {
      lastHoveredElement = interactive;
      const now = performance.now();
      if (now - lastHoverSoundTime > 35) {
        lastHoverSoundTime = now;
        playHoverSound();
      }
    }
  };

  const handlePointerDown = (e: MouseEvent | TouchEvent) => {
    unlockAudio();
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (interactive) {
      playClickSound();
    }
  };

  window.addEventListener('mouseover', handlePointerOver, { passive: true });
  window.addEventListener('mousedown', handlePointerDown, { passive: true });
  window.addEventListener('touchstart', handlePointerDown, { passive: true });
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  return () => {
    window.removeEventListener('mouseover', handlePointerOver);
    window.removeEventListener('mousedown', handlePointerDown);
    window.removeEventListener('touchstart', handlePointerDown);
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
}
