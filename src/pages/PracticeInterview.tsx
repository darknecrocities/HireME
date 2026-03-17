import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Mic, MicOff, Clock, CheckCircle2, Send, Sparkles, StopCircle, Eye, Scan, Target } from 'lucide-react';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { useAI } from '../hooks/useAI';
import { useFirestore } from '../hooks/useFirestore';
import BodyLanguageOverlay from '../components/BodyLanguageOverlay';
import type { InterviewMessage } from '../types';

export default function PracticeInterview() {
  const { videoRef, canvasRef, scores, isActive, showMesh, emotion, gesture, start, stop, toggleMesh } = useMediaPipe();
  const { loading: aiLoading, getInterviewQuestion, getFeedback } = useAI();
  const { saveSession } = useFirestore();

  const [role, setRole] = useState('Software Engineer');
  const [industry, setIndustry] = useState('Technology');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [timer, setTimer] = useState(0);
  const [star, setStar] = useState({ situation: false, task: false, action: false, result: false });
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isListening, setIsListening] = useState(false);

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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startSession = async () => {
    setSessionStarted(true);
    setMessages([]);
    setTimer(0);
    setShowFeedback(false);
    setFeedback('');
    setStar({ situation: false, task: false, action: false, result: false });

    await start();
    const question = await getInterviewQuestion(role, '', `Industry: ${industry}`);
    setMessages([{ role: 'ai', content: question, timestamp: new Date() }]);
  };

  const endSession = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stop();

    const fb = await getFeedback(
      { eyeContact: scores.eyeContact, posture: scores.posture, gestures: scores.gestures },
      `${role} interview in ${industry}`
    );

    // Save session to Firestore
    await saveSession({
      userId: 'demo-user', // In a real app, get from Auth
      type: 'interview',
      employerIndustry: industry,
      startTime: new Date(Date.now() - timer * 1000),
      endTime: new Date(),
      aiAnalysis: {
        interviewScore: scores.overall,
        STARCompleteness: star
      },
      bodyLanguage: {
        eyeContactScore: scores.eyeContact,
        postureScore: scores.posture,
        gesturesScore: scores.gestures,
        crucialMoments: [],
        detectedEmotion: emotion,
        detectedGesture: gesture
      },
      feedback: fb
    });

    setFeedback(fb);
    setShowFeedback(true);
  };

  const sendAnswer = useCallback(async () => {
    if (!userInput.trim() || aiLoading) return;
    const answer = userInput.trim();
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', content: answer, timestamp: new Date() }]);
    const question = await getInterviewQuestion(role, answer, `Industry: ${industry}`);
    setMessages(prev => [...prev, { role: 'ai', content: question, timestamp: new Date() }]);
  }, [userInput, aiLoading, role, industry, getInterviewQuestion]);

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
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      setUserInput(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-[10px] font-black tracking-widest uppercase"
            style={{ background: 'rgba(30, 58, 138, 0.4)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
            <Target className="w-3.5 h-3.5" />
            AI Interview Engine Powered by Gemini
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            PRACTICE <span className="gradient-text">SESSION</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Personal Edition
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!sessionStarted ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto glass-card p-10 border-blue-900/20"
            >
              <h2 className="text-xl font-black text-white mb-8 border-b border-white/5 pb-4">Session Parameters</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Goal Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Target Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
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
          ) : (
            <motion.div
              key="session"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Media Container (7 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10" style={{ background: '#000', aspectRatio: '16/9' }}>
                  {/* The interactive canvas replaces the video if mesh is on */}
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-full object-cover"
                    style={{ display: isActive ? 'block' : 'none' }}
                  />
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ display: !isActive ? 'block' : 'none', transform: 'scaleX(-1)' }}
                  />
                  
                  <BodyLanguageOverlay scores={scores} isActive={isActive} />

                  <div className="absolute top-6 left-6 flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/5">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-black text-white">{formatTime(timer)}</span>
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600/20 backdrop-blur-md border border-blue-500/30">
                        <Scan className="w-4 h-4 text-blue-400 animate-pulse" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Neural Link Active</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                      Security Protocol v1.0.4
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">LIVE REC</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleMesh}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${showMesh ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      <Eye className="w-4 h-4" />
                      {showMesh ? 'Disable AI Mesh' : 'Enable AI Mesh'}
                    </button>
                    <button
                      onClick={toggleListening}
                      className={`p-3 rounded-2xl transition-all ${isListening ? 'bg-rose-600/20 border-rose-500/50' : 'bg-white/5 border-white/10'}`}
                      style={{ border: '1px solid', cursor: 'pointer' }}
                    >
                      {isListening ? <MicOff className="w-5 h-5 text-rose-500" /> : <Mic className="w-5 h-5 text-slate-400" />}
                    </button>
                  </div>
                  
                  <button
                    onClick={endSession}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/60 transition-all"
                    style={{ cursor: 'pointer' }}
                  >
                    <StopCircle className="w-5 h-5" />
                    Terminate Session
                  </button>
                </div>
              </div>

              {/* Chat Column (4 cols) */}
              <div className="lg:col-span-4 flex flex-col glass-card border-white/5" style={{ height: '600px' }}>
                <div className="p-5 border-b border-white/5 bg-white/5">
                  <h3 className="text-xs font-black text-white tracking-widest uppercase">STAR Analysis Panel</h3>
                  <div className="flex gap-2 mt-4">
                    {(['situation', 'task', 'action', 'result'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStar(prev => ({ ...prev, [s]: !prev[s] }))}
                        className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all ${star[s] ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-500'}`}
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        <CheckCircle2 className={`w-3 h-3 ${star[s] ? 'text-black' : 'text-slate-700'}`} />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
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
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') sendAnswer(); }}
                      placeholder={isListening ? 'LISTENING_STREAM...' : 'TYPE RESPONSE...'}
                      className="flex-1 px-5 py-4 rounded-2xl text-[10px] font-black text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 uppercase tracking-widest"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    />
                    <button
                      onClick={sendAnswer}
                      disabled={!userInput.trim() || aiLoading}
                      className="p-4 rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/40 transition-all hover:scale-105 disabled:opacity-20"
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Feedback Overlay */}
                <AnimatePresence>
                  {showFeedback && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/95 backdrop-blur-2xl">
                      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass-card p-10 max-w-lg w-full text-center border-blue-900/30">
                        <Sparkles className="w-12 h-12 mx-auto mb-6 text-blue-400" />
                        <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Session Debrief</h3>
                        <p className="text-[10px] font-black tracking-[.4em] text-slate-500 mb-8 underline decoration-blue-500 decoration-2 underline-offset-8">Neural Analysis Engine</p>
                        
                        <div className="grid grid-cols-3 gap-4 mb-8">
                          {[{ l: 'EYE', v: scores.eyeContact }, { l: 'POSTURE', v: scores.posture }, { l: 'HANDS', v: scores.gestures }].map(s => (
                            <div key={s.l} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                              <p className="text-2xl font-black text-white">{s.v}</p>
                              <p className="text-[9px] font-black text-slate-500 tracking-widest">{s.l}</p>
                            </div>
                          ))}
                        </div>

                        <div className="text-left rounded-3xl p-6 bg-blue-950/20 border border-blue-500/20 mb-8">
                          <p className="text-[9px] font-black text-blue-400 tracking-widest mb-3 uppercase">Neural Feedback Summary</p>
                          <p className="text-sm font-bold text-slate-300 leading-relaxed italic">"{feedback}"</p>
                        </div>

                        <button onClick={() => setSessionStarted(false)} className="w-full py-5 rounded-3xl bg-white text-black font-black text-xs uppercase tracking-[.2em] hover:scale-[1.02] transition-all">CLOSE COMMAND</button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
