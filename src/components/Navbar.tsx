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
  Search,
  Cpu,
  ClipboardCheck,
} from 'lucide-react';
import logo from '../assets/Hireme.png';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/resume', label: 'Resume', icon: FileText },
  { path: '/interview', label: 'Interview', icon: Video },
  { path: '/jobs', label: 'Jobs', icon: Search },
  { path: '/plan', label: 'Plan', icon: ClipboardCheck },
  { path: '/dashboard', label: 'Analytics', icon: BarChart3 },
  { path: '/engine', label: 'AI Engine', icon: Cpu },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="nav-wrap">
      <nav className="nav-shell w-full transition-all">
        <div className="flex items-center justify-between h-full">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 no-underline group flex-shrink-0">
            <div className="nav-brand-mark group-hover:scale-[1.04] transition-transform duration-300">
               <img 
                src={logo} 
                alt="HireME" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[15px] font-extrabold text-white tracking-[-0.04em] leading-none">
                HIRE<span className="text-[#80a7fa]">ME</span>
              </span>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.18em] mt-1">
                Career office
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                   className={`nav-link ${isActive ? 'nav-link--active' : ''} relative px-3 py-2 rounded-lg text-[10px] lg:text-[11px] font-bold no-underline transition-all duration-300 flex items-center gap-2 ${
                     isActive ? '' : ''
                   }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-marker"
                      className="absolute bottom-0.5 left-3 right-3 h-px bg-[#80a7fa]"
                    />
                  )}
                </Link>
              );
            })}
            
          </div>

          {/* Mobile Toggle */}
          <button
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white transition-colors border border-white/10 bg-white/[0.04] cursor-pointer"
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
            className="lg:hidden absolute top-[4.9rem] left-0 right-0 rounded-xl border border-white/10 overflow-hidden origin-top shadow-2xl"
            style={{ background: 'rgba(10, 15, 30, 0.98)', backdropFilter: 'blur(20px)' }}
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
                    className="flex items-center gap-4 px-5 py-3.5 rounded-lg text-sm font-bold no-underline transition-all"
                    style={{
                      color: isActive ? '#f5f1e8' : '#9caac1',
                      background: isActive ? 'rgba(111, 151, 244, 0.14)' : 'rgba(255,255,255,0.02)',
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
    </div>
  );
}
