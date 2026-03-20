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
  LogOut,
  Zap,
  Search,
  User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import logo from '../assets/Hireme.png';

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
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1100px]">
      <nav className="w-full h-16 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md bg-white/[0.03] px-6 transition-all">
        <div className="flex items-center justify-between h-full">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 no-underline group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 overflow-hidden flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-all duration-500">
               <img 
                src={logo} 
                alt="HireME" 
                className="w-7 h-7 object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[17px] font-black text-white tracking-tighter leading-none mt-1">
                HIRE<span className="text-blue-500">ME</span>
              </span>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-0.5">
                by TAIM TEAM
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                   className={`relative px-4 py-2 rounded-full text-[10px] lg:text-[11px] font-bold no-underline transition-all duration-300 uppercase tracking-widest flex items-center gap-2 ${
                     isActive ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                   }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                    />
                  )}
                </Link>
              );
            })}
            
            <div className="w-[1px] h-6 bg-white/10 mx-2" />
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">{profile?.occupation || 'Entity'}</span>
                    <span className="text-[10px] font-bold text-white max-w-[100px] truncate">{profile?.fullName || user.email}</span>
                  </div>
                  <button 
                    onClick={() => logout()}
                    className="p-2 rounded-full border border-white/10 bg-[#030817] text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#030817] border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)] text-white text-[10px] font-bold tracking-[0.2em] transition-all hover:bg-blue-900/40 no-underline">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  LOG IN / SIGN UP
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="md:hidden absolute top-[76px] left-0 right-0 rounded-[24px] border border-white/10 overflow-hidden origin-top shadow-2xl"
            style={{ background: 'rgba(5, 10, 24, 0.95)', backdropFilter: 'blur(20px)' }}
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
                  LOG IN / SIGN UP
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
    </div>
  );
}
