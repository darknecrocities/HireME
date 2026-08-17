import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { setupThockAudioListener } from '../utils/soundEffects';
import {
  getExperienceSettings,
  type ExperienceSettings,
} from '../utils/experienceSettings';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'circle' | 'spark' | 'ring' | 'diamond';
  life: number;
  maxLife: number;
}

export default function CursorEffect() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [hasPointer, setHasPointer] = useState(false);
  const [settings, setSettings] = useState<ExperienceSettings>(getExperienceSettings());

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth responsive spring physics
  const springConfig = { stiffness: 850, damping: 36, mass: 0.15 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Trailing halo spring
  const trailX = useSpring(mouseX, { stiffness: 350, damping: 26, mass: 0.4 });
  const trailY = useSpring(mouseY, { stiffness: 350, damping: 26, mass: 0.4 });

  // Dynamic Click Particles Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const nextParticleId = useRef(0);

  useEffect(() => {
    // Initialize audio feedback
    const cleanupAudio = setupThockAudioListener();

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setHasPointer(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setHasPointer(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    const handleSettingsUpdate = (e: Event) => {
      const custom = e as CustomEvent<ExperienceSettings>;
      if (custom.detail) {
        setSettings(custom.detail);
      }
    };
    window.addEventListener('hireme_experience_update', handleSettingsUpdate);

    // Click particle spawner
    const spawnParticles = (clientX: number, clientY: number) => {
      if (settings.particleTheme === 'none') return;

      const count =
        settings.particleIntensity === 'low'
          ? 8
          : settings.particleIntensity === 'high'
          ? 24
          : 14;

      const theme = settings.particleTheme;
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = 2.0 + Math.random() * 4.5;
        const maxLife = 24 + Math.random() * 16;

        let shape: 'circle' | 'spark' | 'ring' | 'diamond' = 'circle';
        let color = '#ffffff';

        if (theme === 'sparks') {
          shape = Math.random() > 0.4 ? 'spark' : 'circle';
          color = Math.random() > 0.5 ? '#ffffff' : '#d4d4d8';
        } else if (theme === 'cyber_rings') {
          shape = 'ring';
          color = Math.random() > 0.5 ? '#38bdf8' : '#ffffff';
        } else if (theme === 'stardust') {
          shape = 'diamond';
          color = Math.random() > 0.5 ? '#f4f4f5' : '#a1a1aa';
        } else if (theme === 'minimal') {
          shape = 'circle';
          color = 'rgba(255, 255, 255, 0.7)';
        }

        newParticles.push({
          id: nextParticleId.current++,
          x: clientX,
          y: clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: shape === 'ring' ? 8 + Math.random() * 8 : 2.5 + Math.random() * 2.5,
          color,
          shape,
          life: maxLife,
          maxLife,
        });
      }

      particlesRef.current.push(...newParticles);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('select') ||
          target.closest('.cursor-pointer') ||
          target.closest('[role="button"]') ||
          target.closest('.surface-hover') ||
          target.closest('.glass-card')
        );
        setIsHovered(isInteractive);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      spawnParticles(e.clientX, e.clientY);
    };

    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Particle Animation Loop
    let animId: number;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const handleWindowResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleWindowResize);

    const renderParticles = () => {
      animId = requestAnimationFrame(renderParticles);
      const cvs = canvasRef.current;
      if (!cvs) return;
      const ctx = cvs.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, cvs.width, cvs.height);

      if (particlesRef.current.length === 0) return;

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.life -= 1;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;

        if (p.shape === 'ring') {
          const currentRadius = p.size * (1 + (1 - alpha) * 1.5);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5 * alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.shape === 'diamond') {
          ctx.fillStyle = p.color;
          const sz = p.size * alpha;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - sz);
          ctx.lineTo(p.x + sz, p.y);
          ctx.lineTo(p.x, p.y + sz);
          ctx.lineTo(p.x - sz, p.y);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'spark') {
          ctx.fillStyle = p.color;
          const len = 5 * alpha;
          ctx.fillRect(p.x - 1, p.y - len, 2, len * 2);
          ctx.fillRect(p.x - len, p.y - 1, len * 2, 2);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };

    renderParticles();

    return () => {
      cleanupAudio();
      cancelAnimationFrame(animId);
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('hireme_experience_update', handleSettingsUpdate);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleWindowResize);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY, settings.particleTheme, settings.particleIntensity]);

  // If native cursor selected or touch device, render particle canvas only
  if (settings.cursorType === 'native' || !hasPointer) {
    return (
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[99999]"
      />
    );
  }

  return (
    <>
      {/* Click Particles Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[99998]"
      />

      {/* Interactive Custom Cursor System */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden"
        style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 200ms ease' }}
      >
        {/* Trailing Drawing Halo */}
        <motion.div
          className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform pointer-events-none"
          style={{
            x: trailX,
            y: trailY,
            width: isHovered ? 36 : 14,
            height: isHovered ? 36 : 14,
            backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
            border: isHovered ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
            scale: isClicked ? 0.8 : 1,
            transition: 'width 200ms ease, height 200ms ease, background-color 200ms ease, border 200ms ease',
          }}
        />

        {/* Dynamic Cursor Renderer Based on Selection */}
        <motion.div
          className="absolute top-0 left-0 will-change-transform pointer-events-none select-none"
          style={{
            x: cursorX,
            y: cursorY,
            rotate: settings.cursorType === 'pencil' ? (isClicked ? -12 : isHovered ? -5 : 0) : 0,
            scale: isClicked ? 0.92 : 1,
            transformOrigin: settings.cursorType === 'pencil' ? '0px 0px' : 'center center',
          }}
        >
          {/* 1. STYLIZED GRAPHITE PENCIL CURSOR */}
          {settings.cursorType === 'pencil' && (
            <div className="relative filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
              <svg
                width="34"
                height="34"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
              >
                {/* Graphite Lead Tip (Origin at 0, 0) */}
                <polygon points="0,0 6,1.8 1.8,6" fill="#18181b" stroke="#ffffff" strokeWidth="0.8" />
                {/* Sharpened Cedar Wood Cone */}
                <polygon points="1.8,6 6,1.8 12.5,8.2 8.2,12.5" fill="#d4d4d8" />
                {/* Precision Obsidian Pencil Body */}
                <polygon points="8.2,12.5 12.5,8.2 24.5,20.2 20.2,24.5" fill="#09090b" stroke="#ffffff" strokeWidth="0.8" />
                {/* Beveled Facet Line */}
                <line x1="10.3" y1="10.3" x2="22.3" y2="22.3" stroke="#27272a" strokeWidth="1.2" />
                {/* Titanium Ferrule Band */}
                <polygon points="20.2,24.5 24.5,20.2 26.8,22.5 22.5,26.8" fill="#e4e4e7" stroke="#ffffff" strokeWidth="0.8" />
                {/* Architectural Pure White Eraser */}
                <polygon points="22.5,26.8 26.8,22.5 29.5,25.2 25.2,29.5" fill="#ffffff" />
              </svg>
            </div>
          )}

          {/* 2. CYBER PRECISION CROSSHAIR */}
          {settings.cursorType === 'crosshair' && (
            <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <div
                className={`w-6 h-6 border border-white/60 rounded-full flex items-center justify-center transition-all ${
                  isHovered ? 'scale-125 border-white rotate-45' : ''
                }`}
              >
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
              <div className="absolute w-8 h-[1px] bg-white/40" />
              <div className="absolute h-8 w-[1px] bg-white/40" />
            </div>
          )}

          {/* 3. MINIMAL AURORA GLOW ORB */}
          {settings.cursorType === 'glow_orb' && (
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.9)] transition-all ${
                  isHovered ? 'scale-150 shadow-[0_0_24px_rgba(255,255,255,1)]' : ''
                }`}
              />
            </div>
          )}

          {/* 4. TACTICAL LASER DOT */}
          {settings.cursorType === 'laser' && (
            <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444]" />
              {isHovered && (
                <div className="absolute w-6 h-6 rounded-full border border-red-500/50 animate-ping" />
              )}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
