import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, CheckCircle2, AlertCircle, Loader2, RotateCcw, Target, Award } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import type { ResumeAnalysisResult } from '../types';

export default function ResumeOptimizer() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState<ResumeAnalysisResult | null>(null);
  const { loading, getResumeAnalysis } = useAI();

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) return;
    const data = await getResumeAnalysis(resumeText, jobDescription);
    setResults(data);
  };

  const reset = () => {
    setResults(null);
    setResumeText('');
    setJobDescription('');
  };

  return (
    <div className="min-h-screen px-4 py-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-[10px] font-black tracking-widest uppercase"
            style={{ background: 'rgba(30, 58, 138, 0.4)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
            <Award className="w-3.5 h-3.5" />
            Neural Achievement Matrix v4.0
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">
            PRO<span className="gradient-text">FILE</span> OPTIMIZER
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
            Arron Kian Parejas Personal Edition
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className="glass-card p-10 border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Source Document</h2>
                </div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="PASTE YOUR RESUME TEXT HERE..."
                  className="w-full h-80 px-6 py-5 rounded-3xl text-sm font-bold text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                  style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
                />
              </div>

              <div className="flex flex-col gap-8">
                <div className="glass-card p-10 border-white/5 flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/20">
                      <Target className="w-4 h-4 text-violet-400" />
                    </div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Target Objective</h2>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="PASTE TARGET JOB DESCRIPTION..."
                    className="w-full h-52 px-6 py-5 rounded-3xl text-sm font-bold text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !resumeText || !jobDescription}
                  className="w-full flex items-center justify-center gap-3 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.02] disabled:opacity-30 disabled:grayscale"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  {loading ? 'CALIBRATING...' : 'CALIBRATE PROFILE'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Score Header */}
              <div className="glass-card p-12 border-white/5 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_20px_#3b82f6]" />
                
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <motion.circle
                      cx="64" cy="64" r="60" fill="none" stroke="#3b82f6" strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 60}
                      initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                      animate={{ strokeDashoffset: (2 * Math.PI * 60) * (1 - results.score / 100) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white tracking-tighter">{results.score}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PTS</span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">NEURAL MATCH {results.score >= 80 ? 'EXCELLENT' : 'CALIBRATED'}</h2>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">MATCH QUALITY ANALYSIS COMPLETED</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {results.missingKeywords.map(kw => (
                      <span key={kw} className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                        MISSING: {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={reset}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10 border-none cursor-pointer"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>

              {/* Feedbacks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-10 border-white/5">
                  <div className="flex items-center gap-3 mb-8">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Achievement Mapping</h3>
                  </div>
                  <div className="space-y-4">
                    {results.suggestions.map((s, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-xs font-bold text-slate-400 italic mb-2">Original Context</p>
                        <p className="text-xs text-white leading-relaxed font-medium">{s.original}</p>
                        <div className="my-4 border-t border-emerald-500/20" />
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Sparkles className="w-3 h-3" /> Optimized Neural Output
                        </p>
                        <p className="text-sm text-emerald-400 leading-relaxed font-bold">{s.improved}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-10 border-white/5">
                  <div className="flex items-center gap-3 mb-8">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">STAR Feedback Loop</h3>
                  </div>
                  <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                    <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
                      {results.starFeedback}
                    </p>
                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        Protocol: Arron Kian v4.0.1
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(x => (
                          <div key={x} className={`w-1.5 h-1.5 rounded-full ${x <= 4 ? 'bg-blue-500' : 'bg-white/10'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
