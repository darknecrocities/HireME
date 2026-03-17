import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Video, BarChart3, ArrowRight, Sparkles, Brain, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'RESUME OPTIMIZER',
    description: 'Advanced neural analysis for ATS keyword matching and STAR method achievement mapping.',
    color: '#3b82f6',
    path: '/resume',
  },
  {
    icon: Video,
    title: 'VIRTUAL INTERVIEW',
    description: 'AI-driven behavioral practice with multi-point body language tracking and live mesh projection.',
    color: '#1e40af',
    path: '/interview',
  },
  {
    icon: BarChart3,
    title: 'NEURAL ANALYTICS',
    description: 'Comprehensive performance breakdown across 20+ non-verbal and semantic metrics.',
    color: '#10b981',
    path: '/dashboard',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const } },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-40 px-4">
        {/* Strict dark blue glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-10 text-[10px] font-black uppercase tracking-[0.3em]"
            style={{ background: 'rgba(30, 58, 138, 0.2)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}
          >
            <ShieldCheck className="w-4 h-4" />
            Personal Edition
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-tight mb-8 tracking-tighter"
          >
            THE FUTURE OF
            <br />
            <span className="gradient-text">INTERVIEWING</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base font-bold uppercase tracking-[0.2em] max-w-2xl mx-auto mb-12 text-slate-500 leading-relaxed"
          >
            Next-generation AI coaching platform designed for elite career preparation. 
            Real-time neural tracking meets Gemini-powered expert guidance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/interview"
              className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-3xl text-white font-black text-xs uppercase tracking-[0.3em] overflow-hidden no-underline transition-all hover:scale-105"
              style={{ background: '#3b82f6' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">INITIATE TRAIN</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/resume"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] no-underline border border-white/10 text-white hover:bg-white/5 transition-all"
            >
              OPTIMIZE PROFILE
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="px-4 py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={item}>
                <Link
                  to={feature.path}
                  className="block glass-card-hover p-12 h-full no-underline border-white/5 group"
                >
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-8 border border-white/10 group-hover:border-blue-500/50 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <feature.icon className="w-8 h-8 text-white group-hover:text-blue-500 transition-colors" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest leading-loose text-slate-500 mb-8 opacity-70 group-hover:opacity-100 transition-opacity">
                    {feature.description}
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

      {/* Corporate Branding Footer */}
      <footer className="border-t border-white/5 bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">HIRE<span className="text-blue-500">ME</span></span>
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
