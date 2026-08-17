import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Sliders,
  X,
  Check,
  RotateCcw,
  Search,
  Sparkles,
  Play,
  Pause,
  CloudRain,
  Coffee,
  Server,
  Radio,
  MousePointer,
  Keyboard,
  Eye,
  Smartphone,
  Activity,
} from 'lucide-react';
import {
  SWITCH_PROFILES,
  previewSoundProfile,
  playClickSound,
  getAudioAnalyser,
  startAmbientSoundscape,
  stopAmbientSoundscape,
  setAmbientVolume,
  type SoundProfile,
} from '../utils/soundEffects';
import {
  getExperienceSettings,
  saveExperienceSettings,
  triggerHaptic,
  type ExperienceSettings,
  type CursorType,
  type ParticleTheme,
  type AmbientType,
  type AvatarHoodieStyle,
  type AvatarLighting,
} from '../utils/experienceSettings';

const CATEGORIES = ['All', 'Linear', 'Tactile', 'Clicky', 'Silent', 'Vintage / Hall Effect', 'Special'];

export default function AudioSettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'switches' | 'playground' | 'ambient' | 'visuals' | 'avatar'>('switches');
  const [settings, setSettings] = useState<ExperienceSettings>(getExperienceSettings());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Typing Playground State
  const [testText, setTestText] = useState('');
  const [keystrokes, setKeystrokes] = useState(0);
  const [wpm, setWpm] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  // Audio Equalizer Canvas Ref
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setSettings(getExperienceSettings());
  }, [isOpen]);

  const updateSettings = (partial: Partial<ExperienceSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveExperienceSettings(updated);
  };

  const handleSelectProfile = (profile: SoundProfile) => {
    updateSettings({ profile });
    if (profile !== 'mute') {
      previewSoundProfile(profile);
    }
  };

  // Ambient soundscape handling
  const handleToggleAmbient = (type: AmbientType) => {
    const nextType = settings.ambientType === type ? 'off' : type;
    updateSettings({ ambientType: nextType });
    if (nextType === 'off') {
      stopAmbientSoundscape();
    } else {
      startAmbientSoundscape(nextType, settings.ambientVolume);
    }
  };

  const handleAmbientVolumeChange = (vol: number) => {
    updateSettings({ ambientVolume: vol });
    setAmbientVolume(vol);
  };

  // Typing speed test keypress
  const handleTypingInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTestText(val);
    setKeystrokes((prev) => prev + 1);
    playClickSound();

    if (!startTimeRef.current && val.length > 0) {
      startTimeRef.current = Date.now();
    }

    if (startTimeRef.current) {
      const minutes = (Date.now() - startTimeRef.current) / 60000;
      if (minutes > 0.02) {
        const words = val.trim().split(/\s+/).filter(Boolean).length;
        setWpm(Math.round(words / minutes));
      }
    }
  };

  const resetPlayground = () => {
    setTestText('');
    setKeystrokes(0);
    setWpm(0);
    startTimeRef.current = null;
  };

  // Real-time Audio Visualizer animation loop
  useEffect(() => {
    if (!isOpen || (activeTab !== 'playground' && activeTab !== 'switches')) return;

    let animId: number;
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = getAudioAnalyser();

    const render = () => {
      animId = requestAnimationFrame(render);
      if (!canvas || !ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (!analyser) {
        // Draw idle wave
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        for (let x = 0; x < width; x += 4) {
          const y = height / 2 + Math.sin(x * 0.05 + Date.now() * 0.003) * 2;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (height * 0.85);

        // Modern white/zinc architectural audio bars
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, activeTab]);

  const filteredSwitches = SWITCH_PROFILES.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeSwitch = SWITCH_PROFILES.find((s) => s.id === settings.profile);

  return (
    <>
      {/* Floating Settings Launcher Button */}
      <motion.button
        aria-label="Open Experience & Audio Customizer"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        data-thock="true"
        className="fixed bottom-6 right-6 z-50 p-3 sm:p-3.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-colors cursor-pointer group flex items-center gap-2.5"
      >
        <div className="relative flex items-center justify-center">
          {settings.profile === 'mute' || settings.volume === 0 ? (
            <VolumeX className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          ) : (
            <Volume2 className="w-4 h-4 text-white animate-pulse" />
          )}
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-300 group-hover:text-white pr-1 hidden sm:inline">
          Customizer
        </span>
        {settings.ambientType !== 'off' && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        )}
      </motion.button>

      {/* Responsive Customizer Modal Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Box (Mobile Slide-Up Drawer + Desktop Centered Modal) */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] rounded-t-[28px] sm:rounded-[28px] bg-zinc-950 border border-white/15 p-4 sm:p-6 md:p-8 shadow-2xl z-10 text-white flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                      Experience & SFX Hub
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10 hidden sm:inline">
                        38 Switches • 10+ Features
                      </span>
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-zinc-400">
                      Mechanical switches, acoustic tuning, ambient soundscapes & visual effects
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  data-thock="true"
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tab Bar (Horizontally scrollable on mobile) */}
              <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar border-b border-white/10 flex-shrink-0">
                {[
                  { id: 'switches', label: 'Switches & Audio', icon: Volume2 },
                  { id: 'playground', label: 'Typing HUD', icon: Activity },
                  { id: 'ambient', label: 'Ambient Focus', icon: CloudRain },
                  { id: 'visuals', label: 'Cursor & FX', icon: MousePointer },
                  { id: 'avatar', label: 'Avatar 3D', icon: Eye },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      data-thock="true"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                        isActive
                          ? 'bg-white text-black shadow-md'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ════════════════════════════════════════════════════════════ */}
              {/* TAB 1: SWITCHES & SFX LAB */}
              {/* ════════════════════════════════════════════════════════════ */}
              {activeTab === 'switches' && (
                <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 16 switches by name, sound tag, or feel..."
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        data-thock="true"
                        className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-white text-black shadow-md'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Responsive Switch Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredSwitches.map((s) => {
                      const isSelected = settings.profile === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => handleSelectProfile(s.id)}
                          data-thock="true"
                          className={`text-left p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between group ${
                            isSelected
                              ? 'bg-white text-black border-white shadow-xl'
                              : 'bg-zinc-900/50 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-white/25'
                          }`}
                        >
                          <div className="pr-2 min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-[8px] font-mono font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-black/10 text-black' : 'bg-white/10 text-zinc-300'
                                }`}
                              >
                                {s.tag}
                              </span>
                              <span className={`text-[9px] font-bold ${isSelected ? 'text-zinc-600' : 'text-zinc-500'}`}>
                                {s.category}
                              </span>
                            </div>

                            <p className="text-xs font-extrabold tracking-tight truncate">
                              {s.name}
                            </p>
                            <p
                              className={`text-[10px] mt-1 line-clamp-2 leading-snug ${
                                isSelected ? 'text-zinc-700' : 'text-zinc-400'
                              }`}
                            >
                              {s.desc}
                            </p>
                          </div>

                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-white/10 group-hover:border-white/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-zinc-500 group-hover:text-white transition-colors">
                              <Sparkles className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════ */}
              {/* TAB 2: TYPING HUD & REAL-TIME AUDIO OSCILLOSCOPE */}
              {/* ════════════════════════════════════════════════════════════ */}
              {activeTab === 'playground' && (
                <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
                  {/* Real-time Web Audio Visualizer */}
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-400 uppercase flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        Acoustic Frequency Spectrum
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500">
                        {activeSwitch?.name || 'Oil King'} Active
                      </span>
                    </div>
                    <canvas
                      ref={visualizerCanvasRef}
                      width={600}
                      height={64}
                      className="w-full h-16 rounded-xl bg-black/60 border border-white/5"
                    />
                  </div>

                  {/* Mechanical Keyboard Typing Sandbox */}
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Keyboard className="w-3.5 h-3.5" />
                          Typing Sound Test & Speed Arena
                        </h4>
                        <p className="text-[10px] text-zinc-400">
                          Type below to test mechanical keystrokes at speed
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-mono font-extrabold text-white">{wpm} WPM</div>
                          <div className="text-[9px] text-zinc-500">{keystrokes} Keys</div>
                        </div>
                        <button
                          onClick={resetPlayground}
                          data-thock="true"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      value={testText}
                      onChange={handleTypingInput}
                      placeholder="Start typing anything here (e.g. 'The quick brown fox jumps over the lazy dog') to feel the switch thock acoustics..."
                      className="w-full p-3 bg-black/70 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-colors resize-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════ */}
              {/* TAB 3: PROCEDURAL AMBIENT SOUNDSCAPES */}
              {/* ════════════════════════════════════════════════════════════ */}
              {activeTab === 'ambient' && (
                <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
                  <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-white/10">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Procedural ambient audio synthesized entirely in real-time. Designed to induce flow state and focus during technical preparation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: 'lofi_rain' as AmbientType,
                        name: 'Lo-Fi Rain & Thunder',
                        desc: 'Procedural pink noise with low-frequency soothing resonance.',
                        icon: CloudRain,
                      },
                      {
                        id: 'cozy_coffee' as AmbientType,
                        name: 'Cozy Coffee House',
                        desc: 'Warm multi-oscillator murmur and filtered cafe atmosphere.',
                        icon: Coffee,
                      },
                      {
                        id: 'server_drone' as AmbientType,
                        name: 'Deep Server Room',
                        desc: '60Hz & 120Hz tuned cooling server drone for deep concentration.',
                        icon: Server,
                      },
                      {
                        id: 'binaural_alpha' as AmbientType,
                        name: 'Binaural Alpha Waves (432Hz)',
                        desc: '10Hz alpha differential beat for study and cognitive focus.',
                        icon: Radio,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isPlaying = settings.ambientType === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleToggleAmbient(item.id)}
                          data-thock="true"
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                            isPlaying
                              ? 'bg-white text-black border-white shadow-xl'
                              : 'bg-zinc-900/60 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900'
                          }`}
                        >
                          <div className="pr-2">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Icon className="w-4 h-4" />
                              <span className="text-xs font-extrabold">{item.name}</span>
                            </div>
                            <p
                              className={`text-[10px] leading-snug ${
                                isPlaying ? 'text-zinc-700' : 'text-zinc-400'
                              }`}
                            >
                              {item.desc}
                            </p>
                          </div>

                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isPlaying ? 'bg-black text-white' : 'bg-white/10 text-white'
                            }`}
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {settings.ambientType !== 'off' && (
                    <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                          Ambient Layer Volume
                        </span>
                        <span className="font-mono font-bold text-white">
                          {Math.round(settings.ambientVolume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.ambientVolume}
                        onChange={(e) => handleAmbientVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════ */}
              {/* TAB 4: VISUALS, CURSOR & PARTICLE EFFECTS */}
              {/* ════════════════════════════════════════════════════════════ */}
              {activeTab === 'visuals' && (
                <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
                  {/* Cursor Switcher */}
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <MousePointer className="w-4 h-4 text-white" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                        Interactive Pointer Style
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'pencil' as CursorType, label: 'Graphite Pencil', desc: 'Stylized pencil with write tilt' },
                        { id: 'crosshair' as CursorType, label: 'Cyber Crosshair', desc: 'Precision rotating ticks' },
                        { id: 'glow_orb' as CursorType, label: 'Aurora Glow', desc: 'Minimal expanding orb' },
                        { id: 'laser' as CursorType, label: 'Tactical Laser', desc: 'Precision pulsing red dot' },
                        { id: 'native' as CursorType, label: 'Native Pointer', desc: 'Standard operating system' },
                      ].map((c) => {
                        const isCur = settings.cursorType === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => updateSettings({ cursorType: c.id })}
                            data-thock="true"
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                              isCur
                                ? 'bg-white text-black border-white shadow-md'
                                : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <p className="text-xs font-bold">{c.label}</p>
                            <p className={`text-[9px] mt-0.5 truncate ${isCur ? 'text-zinc-600' : 'text-zinc-500'}`}>
                              {c.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Click Particle Burst Engine */}
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-white" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                        Click Particle Burst Engine
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'sparks' as ParticleTheme, label: 'Sparks' },
                        { id: 'cyber_rings' as ParticleTheme, label: 'Cyber Rings' },
                        { id: 'stardust' as ParticleTheme, label: 'Stardust' },
                        { id: 'none' as ParticleTheme, label: 'Disabled' },
                      ].map((pt) => {
                        const isPt = settings.particleTheme === pt.id;
                        return (
                          <button
                            key={pt.id}
                            onClick={() => updateSettings({ particleTheme: pt.id })}
                            data-thock="true"
                            className={`p-2.5 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                              isPt
                                ? 'bg-white text-black border-white shadow-md'
                                : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {pt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Haptics & Mobile Vibrations */}
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-white" />
                      <div>
                        <p className="text-xs font-bold text-white">Haptic Physical Feedback</p>
                        <p className="text-[10px] text-zinc-400">Tactile screen vibration on mobile interactions</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        updateSettings({ hapticsEnabled: !settings.hapticsEnabled });
                        triggerHaptic('medium');
                      }}
                      data-thock="true"
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase cursor-pointer transition-all ${
                        settings.hapticsEnabled ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {settings.hapticsEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════ */}
              {/* TAB 5: 3D AVATAR STUDIO */}
              {/* ════════════════════════════════════════════════════════════ */}
              {activeTab === 'avatar' && (
                <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
                  {/* Glasses Toggle */}
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Titanium Glasses</p>
                      <p className="text-[10px] text-zinc-400">Toggle student round-hex refractive lenses</p>
                    </div>

                    <button
                      onClick={() => updateSettings({ avatarGlasses: !settings.avatarGlasses })}
                      data-thock="true"
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase cursor-pointer transition-all ${
                        settings.avatarGlasses ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {settings.avatarGlasses ? 'Visible' : 'Hidden'}
                    </button>
                  </div>

                  {/* Hoodie Color Palette */}
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                      Student Hoodie Color
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'noir' as AvatarHoodieStyle, label: 'Obsidian Noir', color: '#141417' },
                        { id: 'graphite' as AvatarHoodieStyle, label: 'Cyber Steel', color: '#27272a' },
                        { id: 'arctic' as AvatarHoodieStyle, label: 'Arctic Snow', color: '#e4e4e7' },
                        { id: 'emerald' as AvatarHoodieStyle, label: 'Emerald Mint', color: '#064e3b' },
                      ].map((h) => {
                        const isSel = settings.avatarHoodie === h.id;
                        return (
                          <button
                            key={h.id}
                            onClick={() => updateSettings({ avatarHoodie: h.id })}
                            data-thock="true"
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                              isSel
                                ? 'bg-white text-black border-white shadow-md'
                                : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: h.color }} />
                            <span className="text-xs font-bold truncate">{h.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Studio Lighting Style */}
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                      Studio Lighting Rig
                    </span>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'studio' as AvatarLighting, label: 'Soft Studio' },
                        { id: 'cyber' as AvatarLighting, label: 'Cyberpunk Glow' },
                        { id: 'noir_rim' as AvatarLighting, label: 'High Contrast' },
                      ].map((l) => {
                        const isL = settings.avatarLighting === l.id;
                        return (
                          <button
                            key={l.id}
                            onClick={() => updateSettings({ avatarLighting: l.id })}
                            data-thock="true"
                            className={`p-2.5 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                              isL
                                ? 'bg-white text-black border-white shadow-md'
                                : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {l.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════ */}
              {/* MODAL FOOTER CONTROLS */}
              {/* ════════════════════════════════════════════════════════════ */}
              <div className="pt-3 sm:pt-4 border-t border-white/10 flex-shrink-0 space-y-3">
                {/* Volume & Toggles (Visible on Switches Tab) */}
                {activeTab === 'switches' && settings.profile !== 'mute' && (
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-400">
                        Switch Master Volume
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        {Math.round(settings.volume * 100)}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.volume}
                      onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                    />

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => updateSettings({ hoverEnabled: !settings.hoverEnabled })}
                        data-thock="true"
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                          settings.hoverEnabled
                            ? 'bg-white/10 border-white/25 text-white'
                            : 'bg-zinc-900/40 border-white/5 text-zinc-500'
                        }`}
                      >
                        <span className="text-xs font-bold">Hover Thocks</span>
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${settings.hoverEnabled ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                          {settings.hoverEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      <button
                        onClick={() => updateSettings({ clickEnabled: !settings.clickEnabled })}
                        data-thock="true"
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                          settings.clickEnabled
                            ? 'bg-white/10 border-white/25 text-white'
                            : 'bg-zinc-900/40 border-white/5 text-zinc-500'
                        }`}
                      >
                        <span className="text-xs font-bold">Click Thocks</span>
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${settings.clickEnabled ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                          {settings.clickEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      updateSettings({
                        profile: 'oil_king',
                        volume: 0.8,
                        hoverEnabled: true,
                        clickEnabled: true,
                        cursorType: 'pencil',
                        particleTheme: 'sparks',
                        ambientType: 'off',
                        avatarGlasses: true,
                        avatarHoodie: 'noir',
                        avatarLighting: 'studio',
                      });
                      previewSoundProfile('oil_king');
                    }}
                    data-thock="true"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Defaults
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    data-thock="true"
                    className="px-6 py-2 rounded-full bg-white text-black text-xs font-extrabold uppercase tracking-wider hover:bg-zinc-200 transition-colors cursor-pointer shadow-lg"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
