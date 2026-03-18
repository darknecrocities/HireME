import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, UserPlus, LogIn, ArrowLeft, Sparkles, User, Calendar, Briefcase } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [bday, setBday] = useState('');
  const [occupation, setOccupation] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else if (mode === 'signup') {
        if (!fullName || !bday) throw new Error("Please fill in all profile fields");
        await signup(email, password, { fullName, bday, occupation });
        navigate('/dashboard');
      } else {
        await resetPassword(email);
        alert('Check your email for password reset instructions!');
        setMode('login');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden px-4 py-20">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/5 blur-[200px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Brand Section */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-[10px] font-black tracking-widest uppercase"
            style={{ background: 'rgba(30, 58, 138, 0.4)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}
          >
            <ShieldCheck className="w-4 h-4" />
            Neural Security Protocol Active
          </motion.div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">HIRE<span className="gradient-text">ME</span></h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Identity Authentication Gateway</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-10 relative overflow-hidden border-blue-900/30">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
              className="space-y-8"
            >
              <div className="text-left">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  {mode === 'login' ? 'System Access' : mode === 'signup' ? 'Create Identity' : 'Restore Link'}
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                  {mode === 'login' ? 'Please provide your credentials' : mode === 'signup' ? 'Join the neural ecosystem' : 'Enter your registered email'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                          type="text"
                          required
                          placeholder="FULL_NAME"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-white uppercase tracking-widest placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                        />
                      </div>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                          type="date"
                          required
                          value={bday}
                          onChange={(e) => setBday(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-white uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono appearance-none"
                          style={{ colorScheme: 'dark' }}
                        />
                        {!bday && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700 uppercase tracking-widest pointer-events-none">Birthday</span>}
                      </div>
                      <div className="relative group">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <select
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-white uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono appearance-none cursor-pointer"
                        >
                          <option value="Student">Student</option>
                          <option value="Professional">Professional</option>
                          <option value="Freelancer">Freelancer</option>
                          <option value="Entrepreneur">Entrepreneur</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </motion.div>
                  )}

                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="EMAIL_ADDRESS"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-white uppercase tracking-widest placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                    />
                  </div>
                  
                  {mode !== 'forgot' && (
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="password"
                        required
                        placeholder="SECURITY_PASSWORD"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                      />
                    </div>
                  )}
                </div>

                {localError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-black text-rose-500 uppercase text-center tracking-widest"
                  >
                    Error: {localError}
                  </motion.p>
                )}

                <button
                  disabled={loading}
                  className="w-full group relative flex items-center justify-center gap-3 py-5 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-[0.3em] overflow-hidden hover:scale-[1.02] transition-all disabled:opacity-50"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10" />
                  {mode === 'login' ? <LogIn className="w-4 h-4" /> : mode === 'signup' ? <UserPlus className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  {loading ? 'PROCESSING...' : mode === 'login' ? 'AUTHORIZE ACCESS' : mode === 'signup' ? 'REGISTER ENTITY' : 'INITIATE RECOVERY'}
                </button>
              </form>

              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                {mode === 'login' ? (
                  <>
                    <button
                      onClick={() => setMode('signup')}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-400 text-center transition-colors cursor-pointer"
                    >
                      New Entity? <span className="text-blue-500 underline decoration-2 underline-offset-4">Create Profile</span>
                    </button>
                    <button
                      onClick={() => setMode('forgot')}
                      className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-400 text-center transition-colors cursor-pointer"
                    >
                      Lost Access? Lost Recovery Link
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setMode('login')}
                    className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to System Login
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <p className="mt-8 text-center text-[8px] font-black text-slate-700 uppercase tracking-[0.5em]">
          End-to-End Neural Encryption Enabled • V1.0.4-STABLE
        </p>
      </motion.div>
    </div>
  );
}
