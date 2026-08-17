/**
 * HireME Experience Settings & Customization Hub Store
 * Unified state management for mechanical switches, procedural ambient soundscapes,
 * interactive cursor modes, click particle physics, 3D avatar styling, and haptic feedback.
 */

import { type SoundProfile } from './soundEffects';

export type CursorType = 'pencil' | 'crosshair' | 'glow_orb' | 'laser' | 'native';
export type ParticleTheme = 'sparks' | 'cyber_rings' | 'stardust' | 'minimal' | 'none';
export type ParticleIntensity = 'low' | 'medium' | 'high';
export type PlateType = 'pom' | 'fr4' | 'brass' | 'gasket';
export type AmbientType = 'off' | 'lofi_rain' | 'cozy_coffee' | 'server_drone' | 'binaural_alpha';
export type AvatarHoodieStyle = 'noir' | 'graphite' | 'arctic' | 'emerald';
export type AvatarLighting = 'studio' | 'cyber' | 'noir_rim';

export interface ExperienceSettings {
  // Mechanical Switch SFX
  profile: SoundProfile;
  volume: number; // 0.0 to 1.0
  hoverEnabled: boolean;
  clickEnabled: boolean;
  plate: PlateType;

  // Ambient Focus Soundscapes
  ambientType: AmbientType;
  ambientVolume: number; // 0.0 to 1.0

  // Visuals & Cursor
  cursorType: CursorType;
  particleTheme: ParticleTheme;
  particleIntensity: ParticleIntensity;
  backgroundFx: boolean;

  // 3D Avatar Customization
  avatarGlasses: boolean;
  avatarHoodie: AvatarHoodieStyle;
  avatarLighting: AvatarLighting;

  // Zen & Accessibility
  zenMode: boolean;
  hapticsEnabled: boolean;
}

export const DEFAULT_EXPERIENCE_SETTINGS: ExperienceSettings = {
  profile: 'oil_king',
  volume: 0.8,
  hoverEnabled: true,
  clickEnabled: true,
  plate: 'pom',

  ambientType: 'off',
  ambientVolume: 0.4,

  cursorType: 'pencil',
  particleTheme: 'sparks',
  particleIntensity: 'medium',
  backgroundFx: true,

  avatarGlasses: true,
  avatarHoodie: 'noir',
  avatarLighting: 'studio',

  zenMode: false,
  hapticsEnabled: true,
};

const STORAGE_KEY = 'hireme_experience_settings_v2';
let currentSettings: ExperienceSettings = loadExperienceSettings();

export function loadExperienceSettings(): ExperienceSettings {
  if (typeof window === 'undefined') return DEFAULT_EXPERIENCE_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_EXPERIENCE_SETTINGS, ...parsed };
    }
  } catch {}
  return DEFAULT_EXPERIENCE_SETTINGS;
}

export function saveExperienceSettings(settings: Partial<ExperienceSettings>) {
  currentSettings = { ...currentSettings, ...settings };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
      window.dispatchEvent(
        new CustomEvent('hireme_experience_update', { detail: currentSettings })
      );
    } catch {}
  }
}

export function getExperienceSettings(): ExperienceSettings {
  return { ...currentSettings };
}

/** Trigger light mobile haptic feedback if supported */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof window === 'undefined' || !currentSettings.hapticsEnabled) return;
  try {
    if ('vibrate' in navigator) {
      if (type === 'light') navigator.vibrate(8);
      else if (type === 'medium') navigator.vibrate(16);
      else if (type === 'heavy') navigator.vibrate([12, 24, 12]);
    }
  } catch {}
}
