import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText,
  Video,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  Compass,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Layers,
  Play,
  Pause,
} from 'lucide-react';
import logo from '../assets/Hireme.png';
import BoyAvatarCanvas from '../components/Avatar3D/BoyAvatarCanvas';
import { TiltCard } from '../components/Motion';

const modules = [
  {
    icon: FileText,
    tag: 'MODULE 01',
    title: 'Resume Optimizer',
    description:
      'Precision semantic keyword extraction, STAR achievement transformation, and verified ATS alignment scoring.',
    path: '/resume',
  },
  {
    icon: Video,
    tag: 'MODULE 02',
    title: 'Virtual Interview',
    description:
      'Real-time computer vision body language tracking, vocal stability analysis, and STAR structured feedback.',
    path: '/interview',
  },
  {
    icon: Compass,
    tag: 'MODULE 03',
    title: 'Career Operating Plan',
    description:
      'Guided milestone pipelines, structured follow-up composers, and targeted focus execution blocks.',
    path: '/plan',
  },
  {
    icon: Briefcase,
    tag: 'MODULE 04',
    title: 'Smart Job Search',
    description:
      'Resonance-filtered job feed aligned with your rehearsal benchmarks and resume readiness score.',
    path: '/jobs',
  },
  {
    icon: BarChart3,
    tag: 'MODULE 05',
    title: 'Performance Analytics',
    description:
      'Multi-session progression trends, communication composure breakdown, and verifiable metric logs.',
    path: '/dashboard',
  },
  {
    icon: Cpu,
    tag: 'MODULE 06',
    title: 'Local AI Engine',
    description:
      'Air-gapped on-device neural processing ensuring complete candidate privacy and zero latency.',
    path: '/engine',
  },
];

const capabilities = [
  {
    title: 'Spatial Computer Vision',
    desc: 'Continuous non-verbal tracking assessing eye contact, posture alignment, and communicative composure.',
  },
  {
    title: 'STAR Method Synthesis',
    desc: 'Automatic extraction and restructuring of your achievements into high-signal interview evidence.',
  },
  {
    title: 'Zero-Cloud Privacy',
    desc: 'Local Ollama engine ensures your resume, audio, and video never leave your workstation.',
  },
  {
    title: 'Multi-Role Calibrations',
    desc: 'Industry-tailored criteria spanning technology, finance, consulting, healthcare, and engineering.',
  },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Home() {
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHoveredCarousel, setIsHoveredCarousel] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  // Scroll Parallax transforms
  const heroAvatarY = useTransform(scrollY, [0, 800], [0, 80]);
  const heroAvatarScale = useTransform(scrollY, [0, 800], [1, 0.94]);

  // Automatic Carousel Looping (2s interval, pauses on hover)
  useEffect(() => {
    if (viewMode !== 'carousel' || !isAutoPlay || isHoveredCarousel) return;

    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev < modules.length - 1 ? prev + 1 : 0));
    }, 2000);

    return () => clearInterval(timer);
  }, [viewMode, isAutoPlay, isHoveredCarousel]);

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : modules.length - 1));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => (prev < modules.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="home-page min-h-screen w-full overflow-x-hidden text-white bg-black selection:bg-white selection:text-black">
      {/* ═════════════════════  HERO SECTION (PARALLAX 3D STAGE)  ═════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[88vh] flex items-center px-6 sm:px-10 lg:px-16 pt-24 pb-20 overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-white/[0.02] via-transparent to-transparent opacity-60" />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (Typography & CTAs) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] leading-[1.06] text-white"
            >
              Master your next role with{' '}
              <span className="text-zinc-400">intelligent preparation.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg leading-relaxed text-zinc-400 max-w-xl font-medium"
            >
              HireME pairs local artificial intelligence with spatial computer vision 
              to sharpen your resume, rehearse realistic interviews, and measure your real-time 
              communication composure.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <Link
                to="/resume"
                data-thock="true"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-[0.18em] transition-all duration-200 hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.2)] no-underline active:scale-[0.98]"
              >
                Optimize Resume
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/interview"
                data-thock="true"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white font-extrabold text-xs uppercase tracking-[0.18em] transition-all duration-200 backdrop-blur-xl no-underline active:scale-[0.98]"
              >
                Practice Interview
              </Link>
            </motion.div>

            {/* Performance Indicators Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-14 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-md"
            >
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">99.4%</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mt-1">STAR Accuracy</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">20+</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mt-1">Telemetry Metrics</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">0ms</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mt-1">Cloud Latency</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column (Scroll-Parallax 3D Boy Avatar Floating Stage) */}
          <motion.div
            style={{ y: heroAvatarY, scale: heroAvatarScale }}
            className="lg:col-span-5 h-[460px] sm:h-[540px] lg:h-[600px] w-full relative flex items-center justify-center"
          >
            <BoyAvatarCanvas className="w-full h-full" />
          </motion.div>
        </div>
      </section>

      {/* ═════════════════════  ARCHITECTURAL MODULES (CAROUSEL & GRID MODES)  ═════════════════════ */}
      <section className="px-6 sm:px-10 lg:px-16 py-28 border-t border-white/10 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Section Header with View Mode Switcher */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-zinc-500 mb-3">
                Architectural Modules
              </p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white">
                Everything required to win the offer.
              </h2>
            </div>

            {/* Controls Bar: Carousel / Grid Switcher & Prev/Next Arrows */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-zinc-900/80 p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
                <button
                  onClick={() => setViewMode('carousel')}
                  data-thock="true"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'carousel'
                      ? 'bg-white text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Carousel</span>
                  {isAutoPlay && (
                    <span className="relative flex h-1.5 w-1.5 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setViewMode('grid')}
                  data-thock="true"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'grid'
                      ? 'bg-white text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
              </div>

              {viewMode === 'carousel' && (
                <div className="flex items-center gap-1.5">
                  {/* Auto-Play Pause / Play Toggle */}
                  <button
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    data-thock="true"
                    aria-label={isAutoPlay ? 'Pause Carousel Auto-Loop' : 'Resume Carousel Auto-Loop'}
                    className={`p-2 rounded-xl border text-white cursor-pointer transition-colors ${
                      isAutoPlay
                        ? 'bg-zinc-900/80 hover:bg-zinc-800 border-white/10 text-white'
                        : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                    }`}
                  >
                    {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handlePrev}
                    data-thock="true"
                    aria-label="Previous Module"
                    className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleNext}
                    data-thock="true"
                    aria-label="Next Module"
                    className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* View Mode: Interactive 3D Carousel View */}
          {viewMode === 'carousel' ? (
            <div
              className="relative py-4"
              onMouseEnter={() => setIsHoveredCarousel(true)}
              onMouseLeave={() => setIsHoveredCarousel(false)}
            >
              {/* Active Card Showcase (3-Card Panoramic Stack) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0, 1, 2].map((offset) => {
                  const itemIndex = (carouselIndex + offset) % modules.length;
                  const m = modules[itemIndex];
                  const isPrimary = offset === 0;

                  return (
                    <motion.div
                      key={`${m.title}-${itemIndex}`}
                      layout
                      initial={{ opacity: 0, scale: 0.94, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full"
                    >
                      <TiltCard className="h-full">
                        <Link to={m.path} className="group block h-full no-underline">
                          <div
                            className={`h-full p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between shadow-2xl ${
                              isPrimary
                                ? 'bg-zinc-900/90 border-white/30 hover:border-white/50'
                                : 'bg-zinc-950/60 border-white/10 hover:border-white/20 hover:bg-zinc-900/40'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-8">
                                <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-zinc-400 uppercase">
                                  {m.tag}
                                </span>
                                <div
                                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
                                    isPrimary
                                      ? 'bg-white text-black border-white'
                                      : 'bg-white/[0.04] border-white/10 text-white group-hover:bg-white group-hover:text-black'
                                  }`}
                                >
                                  <m.icon className="w-5 h-5" />
                                </div>
                              </div>

                              <h3 className="text-xl font-extrabold text-white tracking-tight group-hover:text-white transition-colors">
                                {m.title}
                              </h3>

                              <p className="mt-3 text-sm text-zinc-400 leading-relaxed font-normal">
                                {m.description}
                              </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">
                              <span>Launch module</span>
                              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      </TiltCard>
                    </motion.div>
                  );
                })}
              </div>

              {/* Carousel Pagination Progress Dots */}
              <div className="mt-10 flex items-center justify-center gap-2">
                {modules.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    data-thock="true"
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      carouselIndex === idx ? 'w-8 bg-white' : 'w-2 bg-zinc-800 hover:bg-zinc-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* View Mode: Structured Grid View */
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {modules.map((m) => (
                <motion.div key={m.title} variants={fadeUp} className="h-full">
                  <TiltCard className="h-full">
                    <Link to={m.path} className="group block h-full no-underline">
                      <div className="h-full p-8 rounded-3xl bg-zinc-950/80 border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between hover:bg-zinc-900/60 shadow-xl">
                        <div>
                          <div className="flex items-center justify-between mb-8">
                            <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
                              {m.tag}
                            </span>
                            <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-300">
                              <m.icon className="w-5 h-5" />
                            </div>
                          </div>

                          <h3 className="text-xl font-extrabold text-white tracking-tight group-hover:text-white transition-colors">
                            {m.title}
                          </h3>

                          <p className="mt-3 text-sm text-zinc-400 leading-relaxed font-normal">
                            {m.description}
                          </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">
                          <span>Launch module</span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ═════════════════════  CAPABILITIES SECTION  ═════════════════════ */}
      <section className="px-6 sm:px-10 lg:px-16 py-28 border-t border-white/10 relative z-10 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-zinc-500 mb-3">
                Proprietary Foundations
              </p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white leading-tight">
                Designed for high-standard hiring rounds.
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-zinc-400 font-medium">
                Modern competitive interviews demand concrete situational evidence, measured delivery, and disciplined execution.
              </p>

              <div className="mt-10">
                <Link
                  to="/plan"
                  data-thock="true"
                  className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white hover:text-zinc-300 transition-colors no-underline group"
                >
                  Explore Operating Plan
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {capabilities.map((c, i) => (
                <TiltCard key={i} className="h-full">
                  <div
                    className="h-full p-8 rounded-3xl bg-black/60 border border-white/10 hover:border-white/20 transition-all shadow-xl cursor-pointer capability-card"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <h4 className="text-base font-extrabold text-white tracking-tight">
                      {c.title}
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      {c.desc}
                    </p>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════  CALL TO ACTION  ═════════════════════ */}
      <section className="px-6 sm:px-10 lg:px-16 py-28 border-t border-white/10 relative z-10 bg-black text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-zinc-500 mb-4">
            Private & Instant Rehearsal
          </p>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-[-0.04em] text-white">
            Begin your next preparation session.
          </h2>
          <p className="mt-6 text-base text-zinc-400 max-w-xl mx-auto font-medium">
            No subscription requirements or cloud credentials needed for on-device coaching.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/resume"
              data-thock="true"
              className="px-9 py-4 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-[0.18em] transition hover:bg-zinc-200 no-underline shadow-lg cursor-pointer"
            >
              Start Resume Analysis
            </Link>
            <Link
              to="/dashboard"
              data-thock="true"
              className="px-9 py-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white font-extrabold text-xs uppercase tracking-[0.18em] transition no-underline cursor-pointer"
            >
              View Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* ═════════════════════  FOOTER  ═════════════════════ */}
      <footer className="w-full border-t border-white/10 py-16 px-6 sm:px-10 lg:px-16 bg-black text-white">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                <img src={logo} alt="HireME" className="w-5 h-5 object-contain filter brightness-125" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                HIRE<span className="text-zinc-400">ME</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-[280px] text-center md:text-left leading-relaxed">
              Autonomous career intelligence & interview coaching designed for modern hiring.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-zinc-400 uppercase tracking-widest font-bold">
            <Link to="/resume" data-thock="true" className="no-underline text-inherit hover:text-white transition-colors">Resume</Link>
            <Link to="/interview" data-thock="true" className="no-underline text-inherit hover:text-white transition-colors">Interview</Link>
            <Link to="/jobs" data-thock="true" className="no-underline text-inherit hover:text-white transition-colors">Jobs</Link>
            <Link to="/plan" data-thock="true" className="no-underline text-inherit hover:text-white transition-colors">Plan</Link>
            <Link to="/dashboard" data-thock="true" className="no-underline text-inherit hover:text-white transition-colors">Analytics</Link>
            <Link to="/engine" data-thock="true" className="no-underline text-inherit hover:text-white transition-colors">AI Engine</Link>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1.5">
            <p className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider font-bold">
              Precision Engineering <Sparkles className="h-3.5 w-3.5 text-white" /> 2026
            </p>
            <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.2em]">
              V2.0-STABLE • OBSIDIAN MONOCHROME
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
