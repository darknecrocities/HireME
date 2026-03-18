import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Video, BarChart3, ArrowRight, Sparkles, Brain, ShieldCheck, CheckCircle2 } from 'lucide-react';

/* ─── Data ─── */
const features = [
  {
    icon: FileText,
    title: 'RESUME OPTIMIZER',
    description: 'Advanced neural analysis for ATS keyword matching and STAR method achievement mapping.',
    path: '/resume',
  },
  {
    icon: Video,
    title: 'VIRTUAL INTERVIEW',
    description: 'AI-driven behavioral practice with multi-point body language tracking and live mesh projection.',
    path: '/interview',
  },
  {
    icon: BarChart3,
    title: 'NEURAL ANALYTICS',
    description: 'Comprehensive performance breakdown across 20+ non-verbal and semantic metrics.',
    path: '/dashboard',
  },
];

const steps = [
  { step: '01', title: 'SYNCHRONIZE', desc: 'Input your target role and resume to calibrate our neural AI engine to your specific career path.' },
  { step: '02', title: 'SIMULATE', desc: 'Engage in a high-fidelity interview session with real-time body language and audio monitoring.' },
  { step: '03', title: 'EVOLVE', desc: 'Receive a comprehensive breakdown of your performance with actionable STAR-method improvements.' },
];

const capabilities = [
  { t: 'Multi-Point Mesh', d: 'Tracking 468 landmarks for micro-expression analysis.' },
  { t: 'STAR Alignment', d: 'Automated achievement mapping to top-tier hiring standards.' },
  { t: 'Gemini 3.1 Edge', d: 'Ultra-fast semantic processing for real-time feedback loop.' },
  { t: 'Privacy First', d: 'On-device biometric processing ensures data sovereignty.' },
];

/* ─── Animations ─── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const } },
};

/* ─── Shared section header ─── */
function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="text-center mb-20">
      <p className="text-sm font-black text-blue-500 uppercase tracking-[0.4em] mb-4">{label}</p>
      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{title}</h2>
    </div>
  );
}

/* ─── Page ─── */
export default function Home() {
  return (
    <div className="w-full max-w-full flex flex-col items-center overflow-hidden">

      {/* ═══════════════════  HERO  ═══════════════════ */}
      <section className="relative w-full overflow-hidden flex flex-col items-center justify-center px-6 py-40 md:py-56">
        {/* glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-900/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto w-full text-center space-y-10">
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]"
            style={{ background: 'rgba(30,58,138,0.2)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}
          >
            <ShieldCheck className="w-4 h-4" />
            Personal Edition
          </motion.div>

          {/* title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tighter"
          >
            THE FUTURE OF
            <br />
            <span className="gradient-text">INTERVIEWING</span>
          </motion.h1>

          {/* subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base font-bold uppercase tracking-[0.2em] max-w-2xl mx-auto text-slate-500 leading-relaxed"
          >
            Next-generation AI coaching platform designed for elite career preparation.
            Real-time neural tracking meets Gemini-powered expert guidance.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4"
          >
            <Link
              to="/interview"
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-3xl text-white font-black text-xs uppercase tracking-[0.3em] overflow-hidden no-underline transition-all hover:scale-105 min-w-[240px]"
              style={{ background: '#3b82f6' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">INITIATE TRAIN</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/resume"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] no-underline border border-white/10 text-white hover:bg-white/5 transition-all min-w-[240px]"
            >
              OPTIMIZE PROFILE
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════  HOW IT WORKS  ═══════════════ */}
      <section className="w-full px-6 py-32 md:py-40 border-t border-white/5 bg-gradient-to-b from-black to-blue-950/10">
        <div className="max-w-7xl mx-auto w-full space-y-24">
          <SectionHeader label="The Protocol" title="HOW IT WORKS" />

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* connector line */}
            <div className="absolute top-10 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-900/40 to-transparent hidden md:block" />

            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-black border-2 border-blue-600/30 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.1)]">
                  <span className="text-xl font-black text-blue-500">{s.step}</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">{s.title}</h3>
                <p className="text-xs font-bold uppercase tracking-widest leading-loose text-slate-500 max-w-xs">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════  CORE MODULES  ═══════════════ */}
      <section className="w-full px-6 py-32 md:py-40 border-t border-white/5">
        <div className="max-w-7xl mx-auto w-full space-y-24">
          <SectionHeader label="Execution Suite" title="CORE MODULES" />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp}>
                <Link
                  to={f.path}
                  className="flex flex-col items-center text-center glass-card-hover p-12 h-full no-underline border-white/5 group space-y-6"
                >
                  <div
                    className="w-16 h-16 rounded-3xl flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <f.icon className="w-8 h-8 text-white group-hover:text-blue-500 transition-colors" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">{f.title}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest leading-loose text-slate-500 opacity-70 group-hover:opacity-100 transition-opacity">
                    {f.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-blue-500">
                    ACCESS MODULE <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════  NEURAL ARCHITECTURE  ════════════ */}
      <section className="w-full px-6 py-32 md:py-40 border-t border-white/5">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-20">
          {/* left text */}
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div>
              <p className="text-sm font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Neural Architecture</p>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                PRECISION COACHING FOR THE DIGITAL AGE
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {capabilities.map((c, i) => (
                <div key={i} className="space-y-2 flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest">{c.t}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{c.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* right visual */}
          <div className="flex-1 w-full max-w-xl">
            <div className="relative aspect-video rounded-3xl overflow-hidden glass-card border-blue-500/20 p-1 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-600/10 animate-pulse" />
              <Brain className="w-32 h-32 text-blue-500/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] mb-4">System Online</span>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="w-1/3 h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════  FOOTER  ═════════════════ */}
      <footer className="w-full border-t border-white/5 bg-black py-16 px-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center md:flex-row md:items-start justify-between gap-10">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">
                HIRE<span className="text-blue-500">ME</span>
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Personal Edition</p>
          </div>

          <div className="flex gap-12 text-[10px] font-black text-slate-500 tracking-[.25em] uppercase">
            <span className="hover:text-white transition-colors cursor-pointer">Security Suite</span>
            <span className="hover:text-white transition-colors cursor-pointer">Neural Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Gemini Edge</span>
          </div>

          <p className="text-[9px] font-black text-slate-700 tracking-widest flex items-center gap-2 uppercase">
            Built for Excellence <Sparkles className="w-3 h-3 text-blue-500" /> 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
