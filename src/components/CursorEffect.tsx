import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { setupThockAudioListener } from '../utils/soundEffects';

export default function CursorEffect() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [hasPointer, setHasPointer] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth responsive spring physics for pencil tip
  const springConfig = { stiffness: 850, damping: 36, mass: 0.15 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Trailing drawing sparkle / halo spring
  const trailX = useSpring(mouseX, { stiffness: 350, damping: 26, mass: 0.4 });
  const trailY = useSpring(mouseY, { stiffness: 350, damping: 26, mass: 0.4 });

  useEffect(() => {
    // Initialize mechanical thock audio feedback
    const cleanupAudio = setupThockAudioListener();

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setHasPointer(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setHasPointer(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    if (!mediaQuery.matches) return;

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

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      cleanupAudio();
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  if (!hasPointer) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 200ms ease' }}
    >
      {/* Trailing Drawing Halo on Interactive Elements */}
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

      {/* Stylized Pencil Cursor */}
      <motion.div
        className="absolute top-0 left-0 will-change-transform pointer-events-none origin-bottom-left"
        style={{
          x: cursorX,
          y: cursorY,
          // Shift so the very tip of the pencil is at (0, 0)
          translateX: '-2px',
          translateY: '-22px',
          rotate: isClicked ? -12 : isHovered ? -5 : 0,
          scale: isClicked ? 0.92 : isHovered ? 1.12 : 1.0,
          transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] filter"
        >
          {/* Pencil Main Body */}
          <path
            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L7.5 19.5 2 21l1.5-5.5L18.5 2.5z"
            fill="#09090b"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Wooden Sharpen Cone Line */}
          <path
            d="M15 6L18 9"
            stroke="#d4d4d8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M5 16l3 3"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Graphite Lead Tip */}
          <polygon
            points="2,21 4,19.5 3.5,17.5"
            fill="#ffffff"
          />
          {/* Eraser Top Accent */}
          <path
            d="M17 4l3 3"
            stroke="#a1a1aa"
            strokeWidth="1.2"
          />
        </svg>

        {/* Precision Tip Lead Dot */}
        <div
          className="absolute bottom-[2px] left-[2px] w-[3px] h-[3px] rounded-full bg-white shadow-[0_0_6px_#ffffff]"
        />
      </motion.div>
    </div>
  );
}
