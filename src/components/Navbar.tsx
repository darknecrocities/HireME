import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  FileText,
  Video,
  BarChart3,
  Menu,
  X,
  Sparkles,
  User,
  LogOut,
  Zap,
  Search
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/resume', label: 'Resume', icon: FileText },
  { path: '/interview', label: 'Interview', icon: Video },
  { path: '/jobs', label: 'Jobs', icon: Search },
  { path: '/dashboard', label: 'Analytics', icon: BarChart3 },
  { path: '/pricing', label: 'Pricing', icon: Zap },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { profile } = useProfile();

  return (
    <nav className="sticky top-0 w-full z-50 border-b border-white/5"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(30px)', height: 'var(--nav-h)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-4 no-underline group flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-all duration-500">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-tighter leading-none">
                HIRE<span className="text-blue-500">ME</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">
                PREMIUM AI ENGINE
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2 lg:gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                   className="relative px-3 lg:px-5 py-2.5 rounded-xl text-[10px] lg:text-[11px] font-black no-underline transition-all duration-300 uppercase tracking-widest"
                   style={{ 
                    color: isActive ? '#fff' : '#475569',
                    background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent'
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute -bottom-[1px] left-4 right-4 h-[2px] bg-blue-500 shadow-[0_0_15px_#3b82f6]"
                    />
                  )}
                </Link>
              );
            })}
            
            <div className="w-px h-8 bg-white/10 mx-2 lg:mx-4" />
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{profile?.occupation || 'Digital Entity'}</span>
                    <span className="text-[10px] font-bold text-white max-w-[150px] truncate">{profile?.fullName || user.email}</span>
                  </div>
                  <button 
                    onClick={() => logout()}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-[10px] font-black tracking-[0.2em] hover:bg-blue-600/10 transition-all border border-blue-500/30">
                    <User className="w-3.5 h-3.5 text-blue-400 group-hover:animate-pulse" />
                    JOIN SYSTEM
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white transition-colors border-none bg-white/5 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="md:hidden border-t border-white/5 overflow-hidden origin-top"
            style={{ background: 'rgba(0, 0, 0, 0.98)' }}
          >
            <div className="px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-bold no-underline transition-all"
                    style={{
                      color: isActive ? '#3b82f6' : '#94a3b8',
                      background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              
              {!user && (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black text-blue-500 bg-blue-500/10 no-underline"
                >
                  <User className="w-5 h-5" />
                  JOIN SYSTEM
                </Link>
              )}
              
              {user && (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black text-rose-500 bg-rose-500/10 border-none text-left cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  LOGOUT
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
