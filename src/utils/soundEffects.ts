/**
 * Mechanical Keyboard Switch Acoustic Synthesizer Engine (Web Audio API)
 * Features 16 distinct switch profiles modeled after real-world enthusiast switches:
 * Linear, Tactile, Clicky, Silent, and Vintage/Electro-Capacitive.
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

export type SoundSettings = ExperienceSettings;

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

  gain.gain.setValueAtTime((isClick ? 0.32 : 0.2) * vol, now);
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

/** 2. Holy Panda (Crisp Snappy Tactile Pop) */
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

/** 3. Gazzew Boba U4T (Dense Creamy Thock) */
function synthBobaU4T(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 210 : 260) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(32, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.3 : 0.19) * vol, now);
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

/** 4. Gateron Milky Yellow (Warm Buttery Clack) */
function synthMilkyYellow(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 280 : 330) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.035);

  gain.gain.setValueAtTime((isClick ? 0.25 : 0.16) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(850, now);
  filter.Q.setValueAtTime(1.8, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);

  osc.start(now);
  osc.stop(now + 0.05);
}

/** 5. Alpaca V2 (Crisp High-Pitched Linear) */
function synthAlpaca(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 380 : 440) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);

  gain.gain.setValueAtTime((isClick ? 0.26 : 0.17) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(240, now);

  osc.connect(filter);
  filter.connect(gain);
  connectToBus(ctx, gain);

  osc.start(now);
  osc.stop(now + 0.045);
}

/** 6. Cherry MX Blue (Click Jacket Sharp Snap) */
function synthMXBlue(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;

  const oscClick = ctx.createOscillator();
  const gainClick = ctx.createGain();
  oscClick.type = 'square';
  oscClick.frequency.setValueAtTime((isClick ? 1850 : 2100) * (1 + rand), now);
  oscClick.frequency.exponentialRampToValueAtTime(800, now + 0.012);
  gainClick.gain.setValueAtTime(0.2 * vol, now);
  gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  const oscThud = ctx.createOscillator();
  const gainThud = ctx.createGain();
  oscThud.type = 'sine';
  oscThud.frequency.setValueAtTime((isClick ? 240 : 280) * (1 + rand), now + 0.006);
  oscThud.frequency.exponentialRampToValueAtTime(50, now + 0.04);
  gainThud.gain.setValueAtTime(0.22 * vol, now + 0.006);
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

/** 7. Kailh Box Navy (Thick Click-Bar Crack) */
function synthBoxNavy(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;

  const oscClick = ctx.createOscillator();
  const gainClick = ctx.createGain();
  oscClick.type = 'triangle';
  oscClick.frequency.setValueAtTime((isClick ? 1400 : 1600) * (1 + rand), now);
  oscClick.frequency.exponentialRampToValueAtTime(300, now + 0.015);
  gainClick.gain.setValueAtTime(0.3 * vol, now);
  gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  const oscSub = ctx.createOscillator();
  const gainSub = ctx.createGain();
  oscSub.type = 'sine';
  oscSub.frequency.setValueAtTime(180, now + 0.004);
  oscSub.frequency.exponentialRampToValueAtTime(35, now + 0.045);
  gainSub.gain.setValueAtTime(0.26 * vol, now + 0.004);
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

/** 8. Kailh Box White (Delicate High-Pitch Click-Bar) */
function synthBoxWhite(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 2400 : 2800) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.016);

  gain.gain.setValueAtTime((isClick ? 0.24 : 0.16) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.028);
}

/** 9. Topre 45g (Electro-Capacitive Rubber Dome Thock) */
function synthTopre(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 140 : 170) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(25, now + 0.055);

  gain.gain.setValueAtTime((isClick ? 0.35 : 0.22) * vol, now);
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

/** 10. IBM Model M Buckling Spring (Vintage Steel Spring Resonant Strike) */
function synthBucklingSpring(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;

  const oscPing = ctx.createOscillator();
  const gainPing = ctx.createGain();
  oscPing.type = 'sawtooth';
  oscPing.frequency.setValueAtTime((isClick ? 1150 : 1300) * (1 + rand), now);
  oscPing.frequency.exponentialRampToValueAtTime(450, now + 0.035);
  gainPing.gain.setValueAtTime(0.2 * vol, now);
  gainPing.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  const oscBarrel = ctx.createOscillator();
  const gainBarrel = ctx.createGain();
  oscBarrel.type = 'triangle';
  oscBarrel.frequency.setValueAtTime((isClick ? 260 : 310) * (1 + rand), now + 0.005);
  oscBarrel.frequency.exponentialRampToValueAtTime(40, now + 0.045);
  gainBarrel.gain.setValueAtTime(0.28 * vol, now + 0.005);
  gainBarrel.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1100, now);
  filter.Q.setValueAtTime(2.8, now);

  oscPing.connect(filter);
  filter.connect(gainPing);
  oscBarrel.connect(gainBarrel);

  connectToBus(ctx, gainPing);
  connectToBus(ctx, gainBarrel);

  oscPing.start(now);
  oscPing.stop(now + 0.07);
  oscBarrel.start(now + 0.005);
  oscBarrel.stop(now + 0.075);
}

/** 11. Cherry MX Brown */
function synthMXBrown(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 290 : 340) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.03);

  gain.gain.setValueAtTime((isClick ? 0.22 : 0.14) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.045);
}

/** 12. Cherry MX Red */
function synthMXRed(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 310 : 360) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.025);

  gain.gain.setValueAtTime((isClick ? 0.2 : 0.13) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.04);
}

/** 13. Cherry MX Black */
function synthMXBlack(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime((isClick ? 180 : 220) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.27 : 0.17) * vol, now);
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

/** 14. Durock Silent Linear */
function synthSilentLinear(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.04;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 120 : 150) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(20, now + 0.025);

  gain.gain.setValueAtTime((isClick ? 0.14 : 0.09) * vol, now);
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

/** 15. Zealios V2 67g */
function synthZealios(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime((isClick ? 460 : 520) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.03);

  gain.gain.setValueAtTime((isClick ? 0.23 : 0.15) * vol, now);
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

/** 16. Organic Bubble Pop */
function synthBubble(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.08;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime((isClick ? 320 : 400) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(isClick ? 850 : 1050, now + 0.04);

  gain.gain.setValueAtTime((isClick ? 0.32 : 0.2) * vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  connectToBus(ctx, gain);
  osc.start(now);
  osc.stop(now + 0.055);
}

/** 17. Cyberpunk SciFi Pulse */
function synthSciFi(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime((isClick ? 1400 : 1700) * (1 + rand), now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);

  gain.gain.setValueAtTime((isClick ? 0.19 : 0.12) * vol, now);
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

/** 18. Vintage Typewriter */
function synthTypewriter(ctx: AudioContext, now: number, vol: number, isClick = false) {
  const rand = (Math.random() - 0.5) * 0.06;

  const oscMetal = ctx.createOscillator();
  const gainMetal = ctx.createGain();
  oscMetal.type = 'square';
  oscMetal.frequency.setValueAtTime((isClick ? 2200 : 2500) * (1 + rand), now);
  oscMetal.frequency.exponentialRampToValueAtTime(400, now + 0.015);
  gainMetal.gain.setValueAtTime(0.2 * vol, now);
  gainMetal.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

  const oscPlaten = ctx.createOscillator();
  const gainPlaten = ctx.createGain();
  oscPlaten.type = 'triangle';
  oscPlaten.frequency.setValueAtTime(320 * (1 + rand), now + 0.005);
  oscPlaten.frequency.exponentialRampToValueAtTime(60, now + 0.045);
  gainPlaten.gain.setValueAtTime(0.28 * vol, now + 0.005);
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
// PLAYBACK DISPATCHER
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
  const vol = isPreview ? Math.max(settings.volume, 0.8) : settings.volume;
  if (vol <= 0) return;

  if (isClick) {
    triggerHaptic('light');
  }

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
