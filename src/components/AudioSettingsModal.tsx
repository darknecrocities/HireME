import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  getAudioSettings,
  saveSettings,
  previewSoundProfile,
  SWITCH_PROFILES,
  type SoundProfile,
  type SoundSettings,
} from '../utils/soundEffects';

const CATEGORIES = ['All', 'Linear', 'Tactile', 'Clicky', 'Silent', 'Vintage / Hall Effect', 'Special'];

export default function AudioSettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<SoundSettings>(getAudioSettings());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setSettings(getAudioSettings());
  }, [isOpen]);

  const handleSelectProfile = (profile: SoundProfile) => {
    const updated = { ...settings, profile };
    setSettings(updated);
    saveSettings(updated);
    if (profile !== 'mute') {
      previewSoundProfile(profile);
    }
  };

  const handleVolumeChange = (vol: number) => {
    const updated = { ...settings, volume: vol };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleToggleHover = () => {
    const updated = { ...settings, hoverEnabled: !settings.hoverEnabled };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleToggleClick = () => {
    const updated = { ...settings, clickEnabled: !settings.clickEnabled };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleReset = () => {
    const defaults: SoundSettings = {
      profile: 'oil_king',
      volume: 0.8,
      hoverEnabled: true,
      clickEnabled: true,
    };
    setSettings(defaults);
    saveSettings(defaults);
    previewSoundProfile('oil_king');
  };

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
        aria-label="Open Audio & Switch Settings"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        data-thock="true"
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/20 text-white shadow-[0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-colors cursor-pointer group flex items-center gap-2.5"
      >
        <div className="relative flex items-center justify-center">
          {settings.profile === 'mute' || settings.volume === 0 ? (
            <VolumeX className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          ) : (
            <Volume2 className="w-4 h-4 text-white animate-pulse" />
          )}
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-300 group-hover:text-white pr-1 hidden sm:inline">
          Switch: {activeSwitch ? activeSwitch.name.split(' ')[0] : 'Custom'}
        </span>
      </motion.button>

      {/* Settings Modal Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 14 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              className="relative w-full max-w-2xl max-h-[90vh] rounded-[28px] bg-zinc-950 border border-white/15 p-6 sm:p-8 shadow-2xl z-10 text-white flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                      Mechanical Switch SFX Lab
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                        16 Profiles
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Real-time synthesized acoustic profiles of legendary mechanical switches
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

              {/* Search & Category Filter Bar */}
              <div className="py-4 space-y-3 flex-shrink-0 border-b border-white/10">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search switches by name, sound tag, or characteristic..."
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

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      data-thock="true"
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-white text-black shadow-md'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Switch Grid */}
              <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-2 max-h-[340px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredSwitches.map((s) => {
                    const isSelected = settings.profile === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleSelectProfile(s.id)}
                        data-thock="true"
                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between group ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-xl'
                            : 'bg-zinc-900/50 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-white/25'
                        }`}
                      >
                        <div className="pr-2">
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

                          <p className="text-xs font-extrabold tracking-tight leading-tight">
                            {s.name}
                          </p>
                          <p
                            className={`text-[10px] mt-1 leading-snug ${
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

              {/* Volume & Toggles Controls Footer */}
              <div className="pt-4 border-t border-white/10 flex-shrink-0 space-y-4">
                {settings.profile !== 'mute' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-400">
                        Volume Output
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
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                    />

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <button
                        onClick={handleToggleHover}
                        data-thock="true"
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                          settings.hoverEnabled
                            ? 'bg-white/10 border-white/25 text-white'
                            : 'bg-zinc-900/40 border-white/5 text-zinc-500'
                        }`}
                      >
                        <span className="text-xs font-bold">Hover Sounds</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            settings.hoverEnabled ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {settings.hoverEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      <button
                        onClick={handleToggleClick}
                        data-thock="true"
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                          settings.clickEnabled
                            ? 'bg-white/10 border-white/25 text-white'
                            : 'bg-zinc-900/40 border-white/5 text-zinc-500'
                        }`}
                      >
                        <span className="text-xs font-bold">Click Sounds</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            settings.clickEnabled ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {settings.clickEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleReset}
                    data-thock="true"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to Oil King
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    data-thock="true"
                    className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-extrabold uppercase tracking-wider hover:bg-zinc-200 transition-colors cursor-pointer"
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
