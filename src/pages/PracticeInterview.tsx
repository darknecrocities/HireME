import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Mic, MicOff, Clock, CheckCircle2, Send, Sparkles, StopCircle, Eye, Target } from 'lucide-react';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { useAI } from '../hooks/useAI';
import { useAuth } from '../hooks/useAuth';
import { useUsageLimit } from '../hooks/useUsageLimit';
import { useFirestore } from '../hooks/useFirestore';
import { useAudioAnalysis } from '../hooks/useAudioAnalysis';
import BodyLanguageOverlay from '../components/BodyLanguageOverlay';
import type { InterviewMessage } from '../types';
import { Link } from 'react-router-dom';

export default function PracticeInterview() {
  const { user } = useAuth();
  const { hasReachedLimit, incrementUsage } = useUsageLimit();
  const { videoRef, canvasRef, scores, isActive, showMesh, emotion, gesture, start, stop, toggleMesh } = useMediaPipe();
  const { loading: aiLoading, getInterviewQuestion, getFullSessionAnalysis } = useAI();
  const { saveSession } = useFirestore();

  const [role, setRole] = useState('Software Engineer');
  const [industry, setIndustry] = useState('Technology');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [timer, setTimer] = useState(0);
  const [star, setStar] = useState({ situation: false, task: false, action: false, result: false });
  const [feedback, setFeedback] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<{ question: string; answer: string }[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  
  const { audioScore } = useAudioAnalysis(sessionStarted && !showFeedback);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (sessionStarted && !showFeedback) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sessionStarted, showFeedback]);

  useEffect(() => {
    if (sessionStarted && !showFeedback) {
      scores.audio = audioScore;
    }
  }, [audioScore, sessionStarted, showFeedback, scores]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startSession = async () => {
    if (hasReachedLimit('interview')) return;
    setSessionStarted(true);
    setMessages([]);
    setTimer(0);
    setShowFeedback(false);
    setFeedback(null);
    setStar({ situation: false, task: false, action: false, result: false });
    setTranscript([]);
    setQuestionCount(1);

    await start();
    const question = await getInterviewQuestion(role, '', `Industry: ${industry}`, 1);
    setMessages([{ role: 'ai', content: question, timestamp: new Date() }]);
  };

  const endSession = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stop();

    const analysis = await getFullSessionAnalysis(
      transcript,
      { eyeContact: scores.eyeContact, posture: scores.posture, gestures: scores.gestures, confidence: scores.confidence, audio: scores.audio },
      `${role} in ${industry}`
    );

    await saveSession({
      userId: user?.uid || 'guest',
      type: 'interview',
      employerIndustry: industry,
      startTime: new Date(Date.now() - timer * 1000),
      endTime: new Date(),
      aiAnalysis: {
        interviewScore: analysis?.overallScore || scores.overall,
        hiringProbability: analysis?.hiringProbability || 0,
        confidenceScore: analysis?.confidenceScore || scores.confidence,
        improvementChecklist: analysis?.improvementChecklist || [],
        STARCompleteness: star,
        technicalFeedback: analysis?.technicalFeedback || '',
        bodyLanguageFeedback: analysis?.bodyLanguageFeedback || '',
        vocalFeedback: analysis?.vocalFeedback || '',
        top3JobRecommendations: analysis?.top3JobRecommendations || []
      },
      bodyLanguage: {
        eyeContactScore: scores.eyeContact,
        postureScore: scores.posture,
        gesturesScore: scores.gestures,
        crucialMoments: [],
        detectedEmotion: emotion,
        detectedGesture: gesture,
        confidenceScore: scores.confidence,
        audioScore: scores.audio
      },
      feedback: analysis?.summary || 'Session complete',
      fullAnalysis: analysis
    });

    setFeedback(analysis);
    setShowFeedback(true);
    incrementUsage('interview');
    setTimeout(() => {
      document.getElementById('analysis-report')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendAnswer = useCallback(async () => {
    if (!userInput.trim() || aiLoading) return;
    const answer = userInput.trim();
    const currentQuestion = messages[messages.length - 1].content;
    
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', content: answer, timestamp: new Date() }]);
    setTranscript(prev => [...prev, { question: currentQuestion, answer }]);

    if (questionCount < 3) {
      const nextCount = questionCount + 1;
      setQuestionCount(nextCount);
      const question = await getInterviewQuestion(role, answer, `Industry: ${industry}`, nextCount);
      setMessages(prev => [...prev, { role: 'ai', content: question, timestamp: new Date() }]);
    } else {
      setMessages(prev => [...prev, { role: 'ai', content: "Great! We've covered the core topics. Click 'Complete Session' below to see your full neural analysis report.", timestamp: new Date() }]);
    }
  }, [userInput, aiLoading, role, industry, getInterviewQuestion, messages, questionCount]);

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      let transcriptText = '';
      for (let i = 0; i < event.results.length; i++) transcriptText += event.results[i][0].transcript;
      setUserInput(transcriptText);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  return (
    <div className="flex-1 w-full px-4 py-12 flex flex-col items-center justify-center relative overflow-hidden">
      {hasReachedLimit('interview') && (
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
            <h2 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase">Practice Limit Reached</h2>
            <p className="text-slate-400 font-medium text-sm leading-relaxed mb-10">
              You've completed your 1-use guest trial. Secure your data and unlock unlimited AI-powered interview practice by joining the HireME system.
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
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-900/20 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col items-center justify-center">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-[10px] font-black tracking-widest uppercase"
            style={{ background: 'rgba(30, 58, 138, 0.4)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
            <Target className="w-3.5 h-3.5" />
            AI Interview Engine Powered by Gemini
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            PRACTICE <span className="gradient-text">SESSION</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Personal Edition</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!sessionStarted ? (
            <div key="setup" className="w-full flex items-center justify-center py-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-2xl glass-card p-10 border-blue-900/20 shadow-2xl"
              >
                <h2 className="text-xl font-black text-white mb-8 border-b border-white/5 pb-4">Session Parameters</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Goal Role</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Target Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-mono"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      {['Technology', 'Finance', 'Healthcare', 'Consulting', 'Marketing', 'Education'].map(i => (
                        <option key={i} value={i} style={{ background: '#000' }}>{i}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={startSession}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-3xl text-white font-black text-base transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(37,99,235,0.3)]"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', border: 'none', cursor: 'pointer' }}
                  >
                    <Video className="w-5 h-5" />
                    INITIATE AI SESSION
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div key="session" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
              {/* Main Session Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10" style={{ background: '#000', aspectRatio: '16/9' }}>
                    <canvas ref={canvasRef} className="w-full h-full object-cover" style={{ display: isActive ? 'block' : 'none' }} />
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ display: !isActive ? 'block' : 'none', transform: 'scaleX(-1)' }} />
                    <BodyLanguageOverlay scores={scores} isActive={isActive} />
                    <div className="absolute top-6 left-6 flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/5">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-black text-white">{formatTime(timer)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <button onClick={toggleMesh} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${showMesh ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`} style={{ border: 'none', cursor: 'pointer' }}>
                        <Eye className="w-4 h-4" /> {showMesh ? 'Disable AI Mesh' : 'Enable AI Mesh'}
                      </button>
                      <button onClick={toggleListening} className={`p-3 rounded-2xl transition-all ${isListening ? 'bg-rose-600/20 border-rose-500/50' : 'bg-white/5 border-white/10'}`} style={{ border: '1px solid', cursor: 'pointer' }}>
                        {isListening ? <MicOff className="w-5 h-5 text-rose-500" /> : <Mic className="w-5 h-5 text-slate-400" />}
                      </button>
                    </div>
                    <button onClick={endSession} className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all ${questionCount >= 3 ? 'bg-blue-600 shadow-lg shadow-blue-900/40' : 'bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/60'}`} style={{ cursor: 'pointer' }}>
                      {questionCount >= 3 ? <Sparkles className="w-5 h-5" /> : <StopCircle className="w-5 h-5" />} {questionCount >= 3 ? 'Complete Session' : 'Terminate Session'}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col glass-card border-white/5" style={{ height: '600px' }}>
                  <div className="p-5 border-b border-white/5 bg-white/5">
                    <h3 className="text-xs font-black text-white tracking-widest uppercase">STAR Analysis Panel</h3>
                    <div className="flex gap-2 mt-4">
                      {(['situation', 'task', 'action', 'result'] as const).map((s) => (
                        <button key={s} onClick={() => setStar(prev => ({ ...prev, [s]: !prev[s] }))} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all ${star[s] ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-500'}`} style={{ border: 'none', cursor: 'pointer' }}>
                          <CheckCircle2 className={`w-3 h-3 ${star[s] ? 'text-black' : 'text-slate-700'}`} /> {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] rounded-2xl px-5 py-4 text-xs font-bold leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/10'}`}>
                          {msg.role === 'ai' && <div className="text-[10px] font-black text-blue-400 mb-2 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-3 h-3" /> Digital Coach</div>}
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}
                    {aiLoading && <div className="flex gap-1 p-4"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" /><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-75" /><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-150" /></div>}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-4 bg-black/40">
                    <div className="flex items-center gap-2">
                      <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendAnswer(); }} placeholder={isListening ? 'LISTENING_STREAM...' : 'TYPE RESPONSE...'} className="flex-1 px-5 py-4 rounded-2xl text-[10px] font-black text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 uppercase tracking-widest font-mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }} />
                      <button onClick={sendAnswer} disabled={!userInput.trim() || aiLoading} className="p-4 rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/40 transition-all hover:scale-105 disabled:opacity-20" style={{ border: 'none', cursor: 'pointer' }}>
                        <Send className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Report Section */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-12 space-y-8" id="analysis-report">
                    <div className="glass-card p-10 border-blue-900/30">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-4">
                          <Sparkles className="w-10 h-10 text-blue-400" />
                          <div className="text-left">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Neural Session Debrief</h3>
                            <p className="text-[10px] font-black tracking-[.4em] text-slate-500 uppercase">AI Diagnostic Report</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <p className="text-sm font-black text-emerald-500 underline decoration-2 underline-offset-4">{feedback?.hiringProbability || 0}%</p>
                            <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase">Hire Probability</p>
                          </div>
                          <div className="px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                            <p className="text-sm font-black text-amber-500 underline decoration-2 underline-offset-4">{feedback?.confidenceScore || scores.confidence}</p>
                            <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase">Confidence Score</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {[
                          { l: 'EYE CONTACT', v: scores.eyeContact, c: 'text-blue-400' },
                          { l: 'POSTURE', v: scores.posture, c: 'text-violet-400' },
                          { l: 'GESTURES', v: scores.gestures, c: 'text-rose-400' },
                          { l: 'VOCAL', v: scores.audio, c: 'text-indigo-400' }
                        ].map(s => (
                          <div key={s.l} className="p-6 rounded-3xl bg-white/2 border border-white/5 text-center">
                            <p className={`text-3xl font-black ${s.c} mb-1`}>{s.v}</p>
                            <p className="text-[9px] font-black text-slate-600 tracking-widest uppercase">{s.l}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                        <div className="md:col-span-2 rounded-3xl p-8 bg-blue-950/20 border border-blue-500/10">
                          <p className="text-xs font-black text-blue-400 tracking-[0.2em] mb-4 uppercase">Neural Feedback Summary</p>
                          <p className="text-base font-bold text-slate-300 leading-relaxed italic">"{feedback?.summary || feedback?.feedback || 'Analyzing session data...'}"</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                            <div>
                              <p className="text-[10px] font-black text-emerald-500 tracking-widest mb-2 uppercase">Strengths</p>
                              <ul className="space-y-1">
                                {(feedback?.strengths || []).map((s: string, i: number) => (
                                  <li key={i} className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" /> {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-rose-500 tracking-widest mb-2 uppercase">Areas to Polished</p>
                              <ul className="space-y-1">
                                {(feedback?.improvements || []).map((s: string, i: number) => (
                                  <li key={i} className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-rose-500" /> {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-3xl p-8 bg-emerald-950/10 border border-emerald-500/10">
                          <p className="text-xs font-black text-emerald-400 tracking-[0.2em] mb-4 uppercase">Improvement Checklist</p>
                          <ul className="space-y-4">
                            {(feedback?.improvementChecklist || ['Processing actionable insights...']).slice(0, 4).map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="rounded-3xl p-8 bg-violet-950/10 border border-violet-500/10 text-left">
                        <p className="text-xs font-black text-violet-400 tracking-[0.2em] mb-6 uppercase">Career Guidance: Target Roles</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {(feedback?.top3JobRecommendations || []).map((job: any, i: number) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/2 border border-white/5 hover:border-violet-500/30 transition-all">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-lg bg-violet-600/20 flex items-center justify-center text-violet-400 font-bold text-xs ring-1 ring-violet-500/20">{i + 1}</div>
                                <h4 className="text-sm font-black text-white uppercase">{job.title}</h4>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed italic">"{job.reason}"</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-12 flex justify-center">
                        <button onClick={() => { setSessionStarted(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-10 py-5 rounded-3xl bg-white text-black font-black text-xs uppercase tracking-[.2em] hover:scale-[1.05] transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] cursor-pointer">
                          RETURN TO READY STATE
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
