import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, CheckCircle2, AlertCircle, Loader2, RotateCcw, Target, Award, Upload, Download, Mail, Phone, MapPin, Linkedin, ExternalLink } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { useUsageLimit } from '../hooks/useUsageLimit';
import { Link } from 'react-router-dom';
import type { ResumeAnalysisResult, EnhancedResume } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const TypewriterText = ({ text, delay = 20 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = React.useState('');
  
  React.useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return <span>{displayText}</span>;
};

export default function ResumeOptimizer() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState<ResumeAnalysisResult | null>(null);
  const [enhancedResume, setEnhancedResume] = useState<EnhancedResume | null>(null);
  const [activeTab, setActiveTab] = useState<'analyze' | 'enhance'>('analyze');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const { loading, getResumeAnalysis, getEnhancedResume } = useAI();
  const { hasReachedLimit, incrementUsage } = useUsageLimit();

  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleAnalyze = async () => {
    if (hasReachedLimit('resume')) return;
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Neural scan requires both resume data and job description.');
      return;
    }
    setError(null);
    try {
      const data = await getResumeAnalysis(resumeText, jobDescription);
      if (data) setResults(data);
      incrementUsage('resume');
    } catch (err: any) {
      const msg = err?.message || '';
      const retryMatch = msg.match(/retry in (\d+)/i);
      if (retryMatch) {
        setCooldown(parseInt(retryMatch[1]));
        setError(`Quota limit reached. Please retry in ${retryMatch[1]}s.`);
      } else {
        setError('Neural analysis failed. Please check your API quota.');
      }
      setResults(null);
    }
  };

  // Removed handleGetVerdict as per request

  const handleEnhance = async () => {
    if (hasReachedLimit('resume')) return;
    if (!resumeText.trim()) {
      setError('Neural enhancement requires resume data.');
      return;
    }
    setError(null);
    try {
      const data = await getEnhancedResume(resumeText, jobDescription);
      if (data) setEnhancedResume(data);
      incrementUsage('resume');
    } catch (err: any) {
      const msg = err?.message || '';
      const retryMatch = msg.match(/retry in (\d+)/i);
      if (retryMatch) {
        setCooldown(parseInt(retryMatch[1]));
        setError(`Quota limit reached. Please retry in ${retryMatch[1]}s.`);
      } else {
        setError('Neural enhancement failed. Please check your API quota.');
      }
      setEnhancedResume(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      setIsExtracting(true);
      setError(null);
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const typedarray = new Uint8Array(reader.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
          }
          setResumeText(fullText);
          setIsExtracting(false);
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        setError('Failed to extract text from PDF. Please paste manually.');
        setIsExtracting(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setResumeText(e.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleDownloadPDF = () => {
    if (!enhancedResume) return;

    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Helper for thick lines
    const addLine = (yPos: number) => {
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
    };

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(15, 23, 42);
    doc.text(enhancedResume.personalInfo.name.toUpperCase(), margin, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const contactInfo = [
      enhancedResume.personalInfo.email,
      enhancedResume.personalInfo.phone,
      enhancedResume.personalInfo.location,
      enhancedResume.personalInfo.linkedin
    ].filter(Boolean).join("  |  ");
    doc.text(contactInfo, margin, y);
    y += 15;

    // Summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text("PROFESSIONAL SUMMARY", margin, y);
    y += 4;
    addLine(y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(enhancedResume.summary, pageWidth - (margin * 2));
    doc.text(summaryLines, margin, y);
    y += (summaryLines.length * 6) + 15;

    // Experience
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text("PROFESSIONAL EXPERIENCE", margin, y);
    y += 4;
    addLine(y);
    y += 10;

    enhancedResume.experience.forEach((exp: any) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(exp.role, margin, y);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(exp.duration, pageWidth - margin, y, { align: "right" });
      y += 6;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235);
      doc.text(exp.company, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(exp.location, pageWidth - margin, y, { align: "right" });
      y += 8;

      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      exp.bullets.forEach((bullet: string) => {
        const bulletLines = doc.splitTextToSize(`\u2022  ${bullet}`, pageWidth - (margin * 2) - 5);
        doc.text(bulletLines, margin + 5, y);
        y += (bulletLines.length * 5.5);
      });
      y += 8;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Education
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text("EDUCATION", margin, y);
    y += 4;
    addLine(y);
    y += 10;

    enhancedResume.education.forEach((edu: any) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(edu.degree, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(edu.duration, pageWidth - margin, y, { align: "right" });
      y += 6;
      doc.text(edu.school + " | " + edu.location, margin, y);
      y += 12;
    });

    // Skills
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text("SKILLS & COMMANDS", margin, y);
    y += 4;
    addLine(y);
    y += 10;

    enhancedResume.skills.forEach((skillSet: any) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(skillSet.category + ": ", margin, y);
      
      const categoryWidth = doc.getTextWidth(skillSet.category + ": ");
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text(skillSet.items.join(", "), margin + categoryWidth, y);
      y += 6;
    });

    doc.save(`${enhancedResume.personalInfo.name.replace(/\s+/g, "_")}_Enhanced_Resume.pdf`);
  };

  const reset = () => {
    setResults(null);
    setEnhancedResume(null);
    setResumeText('');
    setJobDescription('');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#030817] text-white pt-36 pb-20 px-6 relative overflow-hidden">
      {hasReachedLimit('resume') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg p-10 rounded-[40px] bg-white/[0.03] border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] backdrop-blur-2xl text-center"
          >
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                <Sparkles className="w-10 h-10 text-blue-400" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase">Neural Trial Ended</h2>
            <p className="text-slate-400 font-medium text-sm leading-relaxed mb-10">
              You've reached the 1-use limit for guest entities. To unlock unlimited neural optimization and save your progress, upgrade to the full system.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/pricing"
                className="py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                View Tiers
              </Link>
              <Link
                to="/auth"
                className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Sign Up
              </Link>
            </div>
          </motion.div>
        </div>
      )}
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-blue-700/15 blur-[140px]" />
        <div className="absolute top-[38rem] right-[-10rem] h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[110px]" />
        <div className="absolute bottom-0 left-[-8rem] h-[320px] w-[320px] rounded-full bg-blue-600/10 blur-[110px]" />
      </div>
      
      <div className="max-w-[1400px] mx-auto relative z-10 w-full flex-1 flex flex-col items-center justify-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-300 mb-6">
            <Award className="w-4 h-4" />
            Neural Achievement Matrix v4.0
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl mb-4">
            PRO<span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">FILE</span> OPTIMIZER
          </h1>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 mx-auto max-w-lg p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4" /> {error}
            </motion.div>
          )}
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Smart Validator Edition
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!results && !enhancedResume ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-5xl space-y-8"
            >
              {/* Tab Toggle */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
                  {(['analyze', 'enhance'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === tab 
                          ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab === 'analyze' && <Target className="w-3.5 h-3.5 inline mr-2" />}
                      {tab === 'enhance' && <Sparkles className="w-3.5 h-3.5 inline mr-2" />}
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.28)] p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600/30 transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      Upload PDF
                      <input type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">Source Document</h2>
                  </div>
                  
                  {isExtracting ? (
                    <div className="w-full h-80 flex flex-col items-center justify-center space-y-4 rounded-3xl bg-black/40 border border-white/5">
                      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Extraction in Progress...</p>
                    </div>
                  ) : (
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="PASTE YOUR RESUME TEXT OR UPLOAD A PDF..."
                      className="w-full h-80 px-6 py-5 rounded-[20px] text-sm font-bold text-slate-300 placeholder:text-slate-500 bg-[#081124] border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-8">
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.28)] p-10 flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/20">
                        <Target className="w-4 h-4 text-violet-400" />
                      </div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-widest">Target Objective</h2>
                    </div>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="PASTE TARGET JOB DESCRIPTION..."
                      className="w-full h-52 px-6 py-5 rounded-[20px] text-sm font-bold text-slate-300 placeholder:text-slate-500 bg-[#081124] border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                    />
                  </div>

                  <button
                    onClick={activeTab === 'analyze' ? handleAnalyze : handleEnhance}
                    disabled={loading || !resumeText || (activeTab === 'analyze' && !jobDescription)}
                    className="w-full flex items-center justify-center gap-3 py-6 rounded-[28px] bg-blue-500 font-bold text-sm uppercase tracking-[0.2em] text-white transition hover:bg-blue-400 disabled:opacity-50 disabled:hover:bg-blue-500 shadow-lg"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    {loading ? 'CALIBRATING...' : `ACTIVATE NEURAL ${activeTab.toUpperCase()}`}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : results ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-6xl space-y-8"
            >
              {/* Score Header */}
              <div className="rounded-[28px] border border-blue-500/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.28)] p-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
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
                    {results.missingKeywords.map((kw: string) => (
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
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.28)] p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Achievement Mapping</h3>
                  </div>
                  <div className="space-y-4">
                    {results.suggestions.map((s: any, i: number) => (
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

                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.28)] p-10">
                  {error && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20 mb-8">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{cooldown > 0 ? `Neural Cooldown: ${cooldown}s remaining...` : error}</p>
                    </div>
                  )}
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
          ) : enhancedResume ? (
            <motion.div
              key="enhanced"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-5xl space-y-8"
            >
              <div className="flex justify-between items-center bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl">
                <div className="flex gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20 text-blue-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest mb-1">Enhanced Neural Template</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Optimized & Rendered by Gemini</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleDownloadPDF} className="px-8 py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button onClick={reset} className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Resume Preview */}
              <div className="bg-white p-12 rounded-[2rem] shadow-2xl text-slate-900 font-['Inter'] relative overflow-hidden">
                <div className="max-w-4xl mx-auto space-y-10">
                  {/* Header */}
                  <header className="text-center space-y-4 border-b-2 border-slate-100 pb-10">
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase">{enhancedResume.personalInfo.name}</h1>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-bold text-slate-500">
                      <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600" /> {enhancedResume.personalInfo.email}</span>
                      <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-600" /> {enhancedResume.personalInfo.phone}</span>
                      <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600" /> {enhancedResume.personalInfo.location}</span>
                      {enhancedResume.personalInfo.linkedin && (
                        <span className="flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-600" /> {enhancedResume.personalInfo.linkedin}</span>
                      )}
                      {enhancedResume.personalInfo.website && (
                        <span className="flex items-center gap-2"><ExternalLink className="w-4 h-4 text-blue-600" /> {enhancedResume.personalInfo.website}</span>
                      )}
                    </div>
                  </header>

                  {/* Summary */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] whitespace-nowrap">Professional Summary</h3>
                      <div className="h-[2px] w-full bg-blue-600/10" />
                    </div>
                    <p className="text-base leading-relaxed text-slate-700 font-medium">
                      <TypewriterText text={enhancedResume.summary} />
                    </p>
                  </section>

                  {/* Experience */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-4">
                      <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] whitespace-nowrap">Professional Experience</h3>
                      <div className="h-[2px] w-full bg-blue-600/10" />
                    </div>
                    <div className="space-y-10">
                      {enhancedResume.experience.map((exp: any, i: number) => (
                        <div key={i} className="space-y-4">
                          <div className="flex justify-between items-baseline">
                            <h4 className="text-xl font-black text-slate-900 tracking-tight">{exp.role}</h4>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{exp.duration}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-black text-blue-600 uppercase tracking-widest">
                            <span>{exp.company}</span>
                            <span className="text-slate-400">{exp.location}</span>
                          </div>
                          <ul className="grid grid-cols-1 gap-3">
                            {exp.bullets.map((bullet: string, bi: number) => (
                              <li key={bi} className="text-[13px] leading-relaxed text-slate-600 flex gap-4">
                                <span className="text-blue-600 font-black mt-0.5">•</span>
                                <span className="font-medium">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Skills Grid */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-4">
                      <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] whitespace-nowrap">Core Architecture (Skills)</h3>
                      <div className="h-[2px] w-full bg-blue-600/10" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
                      {enhancedResume.skills.map((skill: any, si: number) => (
                        <div key={si} className="space-y-3">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">{skill.category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {skill.items.map((item: string, ii: number) => (
                              <span key={ii} className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-wider">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Education */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-4">
                      <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] whitespace-nowrap">Foundation (Education)</h3>
                      <div className="h-[2px] w-full bg-blue-600/10" />
                    </div>
                    <div className="space-y-6">
                      {enhancedResume.education.map((edu: any, ei: number) => (
                        <div key={ei} className="flex justify-between items-baseline group">
                          <div className="space-y-1">
                            <h4 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">{edu.degree}</h4>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{edu.school}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-900 mb-1">{edu.duration}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{edu.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
