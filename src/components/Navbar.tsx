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
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/resume', label: 'Resume', icon: FileText },
  { path: '/interview', label: 'Interview', icon: Video },
  { path: '/dashboard', label: 'Analytics', icon: BarChart3 },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(30px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter leading-none">
                HIRE<span className="text-blue-500">ME</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                BY TAIM TEAM
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-5 py-2.5 rounded-xl text-sm font-semibold no-underline transition-all duration-300"
                  style={{ 
                    color: isActive ? '#fff' : '#94a3b8',
                    background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent'
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute -bottom-[1px] left-4 right-4 h-[2px] bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                    />
                  )}
                </Link>
              );
            })}
            
            <div className="w-px h-6 bg-white/10 mx-4" />
            
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
              <ShieldCheck className="w-4 h-4" />
              VERIFIED AI
            </button>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
