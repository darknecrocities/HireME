import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, UserPlus, LogIn, ArrowLeft, Sparkles, User, Calendar, Briefcase, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/Hireme.png';

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
  
  const { login, signup, resetPassword, loginWithGoogle } = useAuth();
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLocalError(null);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Google authentication failed');
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
            Secure Authentication Active
          </motion.div>
          
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-3xl bg-blue-600/10 p-4 border border-blue-500/20 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
              <img src={logo} alt="HireMe" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Account Portal</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Identity Verification Service</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-10 relative overflow-hidden border-blue-900/30">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
          
          <Link 
            to="/"
            className="absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </Link>
          
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
                  {mode === 'login' ? 'System Access' : mode === 'signup' ? 'Create Account' : 'Restore Link'}
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                  {mode === 'login' ? 'Please provide your credentials' : mode === 'signup' ? 'Join our career platform' : 'Enter your registered email'}
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
                  {loading ? 'PROCESSING...' : mode === 'login' ? 'AUTHORIZE ACCESS' : mode === 'signup' ? 'CREATE ACCOUNT' : 'INITIATE RECOVERY'}
                </button>

                {(mode === 'login' || mode === 'signup') && (
                  <>
                    <div className="relative flex items-center gap-4 my-2">
                       <div className="h-[1px] flex-1 bg-white/5" />
                      <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">OR</span>
                      <div className="h-[1px] flex-1 bg-white/5" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full group relative flex items-center justify-center gap-3 py-4 rounded-2xl bg-black border border-white/5 text-white text-xs font-black uppercase tracking-[0.3em] overflow-hidden hover:bg-white/5 transition-all disabled:opacity-50"
                      style={{ cursor: 'pointer' }}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.14-4.53z"
                        />
                      </svg>
                      {loading ? 'PROCESSING...' : 'CONTINUE WITH GOOGLE'}
                    </button>
                  </>
                )}
              </form>

              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                {mode === 'login' ? (
                  <>
                    <button
                      onClick={() => setMode('signup')}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-400 text-center transition-colors cursor-pointer"
                    >
                      New User? <span className="text-blue-500 underline decoration-2 underline-offset-4">Create Profile</span>
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
          End-to-End Secure Encryption Active • V1.0.4-STABLE
        </p>
      </motion.div>
    </div>
  );
}
