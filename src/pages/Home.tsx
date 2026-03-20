import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText,
  Video,
  BarChart3,
  ArrowRight,
  Sparkles,
  Brain,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import logo from '../assets/Hireme.png';

/* ─── Data ─── */
const features = [
  {
    icon: FileText,
    title: 'Resume Optimizer',
    description:
      'Advanced AI analysis for ATS keyword matching and STAR method achievement mapping.',
    path: '/resume',
  },
  {
    icon: Video,
    title: 'Virtual Interview',
    description:
      'AI-driven behavioral practice with real-time body language tracking and performance feedback.',
    path: '/interview',
  },
  {
    icon: BarChart3,
    title: 'Career Analytics',
    description:
      'Comprehensive performance breakdown across 20+ communication and semantic metrics.',
    path: '/dashboard',
  },
];

const steps = [
  {
    step: '01',
    title: 'Personalize',
    desc: 'Input your target role and resume to customize our AI tools to your specific career path.',
  },
  {
    step: '02',
    title: 'Practice',
    desc: 'Engage in a realistic interview simulation with real-time body language and audio feedback.',
  },
  {
    step: '03',
    title: 'Improve',
    desc: 'Receive a structured breakdown of your performance with actionable STAR-method insights.',
  },
];

const capabilities = [
  { t: 'Interactive Analysis', d: 'Advanced tracking of non-verbal cues for comprehensive feedback.' },
  { t: 'STAR Integration', d: 'Automated achievement mapping to professional hiring standards.' },
  { t: 'Gemini AI Insights', d: 'Instant semantic analysis for real-time improvements.' },
  { t: 'Privacy Focused', d: 'On-device data processing ensures your information remains secure.' },
];

/* ─── Animations ─── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

function SectionHeader({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      <p className="text-xs md:text-sm font-bold text-blue-400 uppercase tracking-[0.32em] mb-4">
        {label}
      </p>
      <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-sm md:text-base text-slate-400 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function GlassPanel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.28)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#030817] text-white">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-blue-700/15 blur-[140px]" />
        <div className="absolute top-[38rem] right-[-10rem] h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[110px]" />
        <div className="absolute bottom-0 left-[-8rem] h-[320px] w-[320px] rounded-full bg-blue-600/10 blur-[110px]" />
      </div>

      {/* HERO */}
      <section className="relative px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="mx-auto max-w-7xl">
          <GlassPanel className="overflow-hidden px-8 py-12 md:px-14 md:py-16">
            <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-300"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Personal Edition
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl"
                >
                  Land your next job with
                  <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    AI-powered career preparation
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="mt-6 max-w-2xl text-base leading-8 text-slate-300"
                >
                  HireME helps you optimize your resume, practice interviews,
                  and understand your performance through intelligent feedback
                  designed for modern hiring.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="mt-8 flex flex-col gap-4 sm:flex-row"
                >
                  <Link
                    to="/resume"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-7 py-4 text-sm font-bold text-white transition hover:bg-blue-400 no-underline"
                  >
                    Optimize Resume
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/interview"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10 no-underline"
                  >
                    Practice Interview
                  </Link>
                </motion.div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step 1</p>
                    <p className="mt-2 text-sm font-semibold text-white">Upload your resume</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step 2</p>
                    <p className="mt-2 text-sm font-semibold text-white">Get AI feedback</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step 3</p>
                    <p className="mt-2 text-sm font-semibold text-white">Practice with confidence</p>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
              >
                <GlassPanel className="p-6">
                  <div className="rounded-[24px] border border-blue-400/15 bg-gradient-to-br from-blue-500/10 to-transparent p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20">
                        <Brain className="h-6 w-6 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">HireME</p>
                        <p className="text-xs text-slate-400">Career Development Platform</p>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-[#081124] p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Resume Readiness
                        </p>
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div className="h-full w-[82%] rounded-full bg-blue-400" />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-[#081124] p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Interview Confidence
                        </p>
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div className="h-full w-[74%] rounded-full bg-cyan-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-white/10 bg-[#081124] p-4">
                          <p className="text-2xl font-bold text-white">20+</p>
                          <p className="mt-1 text-xs text-slate-400">Performance metrics</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-[#081124] p-4">
                          <p className="text-2xl font-bold text-white">AI</p>
                          <p className="mt-1 text-xs text-slate-400">Real-time feedback engine</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            </div>
          </GlassPanel>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="px-6 pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.02] px-6 py-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Built for resume optimization, AI interview practice, and performance analytics
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="Core Modules"
            title="Everything you need to prepare smarter"
            subtitle="Explore the main tools inside HireME and start with the one that matches your current goal."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp}>
                <Link to={f.path} className="block h-full no-underline">
                  <GlassPanel className="group h-full p-8 transition hover:-translate-y-1 hover:border-blue-400/30">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
                      <f.icon className="h-7 w-7" />
                    </div>

                    <h3 className="mt-6 text-2xl font-bold tracking-tight text-white">
                      {f.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-slate-400">
                      {f.description}
                    </p>

                    <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-300">
                      Open module
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </GlassPanel>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="How It Works"
            title="A guided flow from preparation to improvement"
            subtitle="The platform is designed to help users know what to do first and what to do next."
          />

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <GlassPanel className="h-full p-8">
                  <p className="text-sm font-bold tracking-[0.25em] text-blue-400">{s.step}</p>
                  <h3 className="mt-4 text-2xl font-bold text-white">{s.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{s.desc}</p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES & START HERE */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-stretch gap-10 lg:grid-cols-2">
            <GlassPanel className="p-8 md:p-10 flex flex-col h-full">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
                Why Choose HireME
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                Professional coaching for the modern hiring landscape
              </h2>
              <p className="mt-6 text-sm leading-7 text-slate-400">
                Our platform combines semantic analysis, interview simulation,
                and detailed performance insights to help users prepare with
                more clarity and confidence.
              </p>

              <div className="mt-8 space-y-6">
                {capabilities.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 text-blue-400" />
                      <div>
                        <p className="font-semibold text-white">{c.t}</p>
                        <p className="mt-1 text-sm text-slate-400">{c.d}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-8 md:p-10 flex flex-col h-full">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
                  Start Here
                </p>
                <h3 className="mt-4 text-3xl font-bold text-white">
                  New to the platform?
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Begin with the Resume Optimizer, then continue to Interview Practice,
                  and finally review your analytics on the dashboard.
                </p>

                <div className="mt-8 space-y-4">
                  <Link
                    to="/resume"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white no-underline transition hover:bg-white/10"
                  >
                    <span className="font-medium">Start with Resume Optimizer</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/interview"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white no-underline transition hover:bg-white/10"
                  >
                    <span className="font-medium">Continue to Virtual Interview</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/dashboard"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white no-underline transition hover:bg-white/10"
                  >
                    <span className="font-medium">Review Career Analytics</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
            </GlassPanel>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <GlassPanel className="px-8 py-12 md:px-14 md:py-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
              Ready to begin
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              Prepare with confidence using AI-guided tools
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400">
              Build a stronger resume, sharpen your interview skills, and
              understand your performance through one connected experience.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/resume"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-500 px-7 py-4 text-sm font-bold text-white no-underline transition hover:bg-blue-400"
              >
                Get Started
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-bold text-white no-underline transition hover:bg-white/10"
              >
                View Dashboard
              </Link>
            </div>
          </GlassPanel>
        </div>
      </section>

      {/* ═══════════════════  FOOTER  ═════════════════ */}
      <footer className="w-full border-t border-white/5 bg-black py-16 px-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center md:flex-row md:items-start justify-between gap-10">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center overflow-hidden">
                <img src={logo} alt="HireMe" className="w-7 h-7 object-contain" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                HIRE<span className="text-blue-400">ME</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-[300px] text-center md:text-left">
              AI-powered interview coaching and resume optimization designed for the modern hiring landscape.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400 uppercase tracking-widest font-bold">
            <Link to="/resume" className="no-underline text-inherit hover:text-white transition-colors">Resume</Link>
            <Link to="/interview" className="no-underline text-inherit hover:text-white transition-colors">Interview</Link>
            <Link to="/jobs" className="no-underline text-inherit hover:text-white transition-colors">Jobs</Link>
            <Link to="/dashboard" className="no-underline text-inherit hover:text-white transition-colors">Analytics</Link>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="flex items-center gap-2 text-sm text-slate-500 uppercase tracking-tighter font-black">
              Built for excellence <Sparkles className="h-4 w-4 text-blue-400" /> 2026
            </p>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
              V1.0.4-STABLE • SECURE & PRIVATE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}