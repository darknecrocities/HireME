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
        <div className="flex items-center justify-between h-full px-1">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 no-underline group flex-shrink-0">
            <div className="nav-brand-mark group-hover:scale-[1.05] group-hover:border-white/40 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.08)]">
              <img 
                src={logo} 
                alt="HireME" 
                className="w-6 h-6 object-contain filter brightness-125"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[15px] font-extrabold text-white tracking-[-0.03em] leading-none">
                HIRE<span className="text-zinc-400">ME</span>
              </span>
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">
                Career Office
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1 bg-black/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold no-underline transition-all duration-200 flex items-center gap-2 z-10 ${
                    isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-xl bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.06)] -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* AI Engine Status Pill */}
          <div className="hidden xl:flex items-center">
            <Link
              to="/engine"
              className="group flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-bold tracking-wider hover:bg-white/[0.08] hover:border-white/25 transition-all no-underline shadow-[0_0_15px_rgba(255,255,255,0.04)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span className="text-zinc-400 group-hover:text-white transition-colors">AI Active</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            className="lg:hidden p-2.5 rounded-xl text-zinc-400 hover:text-white transition-colors border border-white/10 bg-white/[0.04] cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute top-[4.75rem] left-0 right-0 rounded-2xl border border-white/10 overflow-hidden origin-top shadow-2xl backdrop-blur-2xl"
              style={{ background: 'rgba(9, 9, 11, 0.96)' }}
            >
              <div className="p-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold no-underline transition-all ${
                        isActive
                          ? 'text-white bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
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
