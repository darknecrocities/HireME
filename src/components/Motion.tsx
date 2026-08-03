import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useLocation } from 'react-router-dom';

type ChildrenProps = {
  children: ReactNode;
  className?: string;
};

const calmEase = [0.22, 1, 0.36, 1] as const;

/** A page-level transition used by every route. It intentionally stays short. */
export function PagePresence({ children }: ChildrenProps) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: calmEase }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** A thin, non-interactive reading-position cue for long career workflows. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      className="scroll-progress"
      style={{ scaleX: reduceMotion ? 0 : scaleX }}
    />
  );
}

/** Reveals meaningful content as it enters the reading path; no repeating motion. */
export function Reveal({ children, className = '' }: ChildrenProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.52, ease: calmEase }}
    >
      {children}
    </motion.div>
  );
}

/** Adds a small, pointer-led sense of depth to selected surfaces on fine pointers only. */
export function TiltSurface({ children, className = '' }: ChildrenProps) {
  const reduceMotion = useReducedMotion();
  const [canTilt, setCanTilt] = useState(false);
  const rotateXValue = useMotionValue(0);
  const rotateYValue = useMotionValue(0);
  const glareXValue = useMotionValue(50);
  const glareYValue = useMotionValue(50);
  const rotateX = useSpring(rotateXValue, { stiffness: 220, damping: 24 });
  const rotateY = useSpring(rotateYValue, { stiffness: 220, damping: 24 });
  const glareX = useSpring(glareXValue, { stiffness: 180, damping: 28 });
  const glareY = useSpring(glareYValue, { stiffness: 180, damping: 28 });
  const glareLeft = useTransform(glareX, (value) => `${value}%`);
  const glareTop = useTransform(glareY, (value) => `${value}%`);

  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanTilt(query.matches && !reduceMotion);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [reduceMotion]);

  const reset = () => {
    rotateXValue.set(0);
    rotateYValue.set(0);
    glareXValue.set(50);
    glareYValue.set(50);
  };

  return (
    <motion.div
      className={`tilt-surface ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      onPointerMove={(event) => {
        if (!canTilt) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        rotateXValue.set((0.5 - y) * 4);
        rotateYValue.set((x - 0.5) * 4);
        glareXValue.set(x * 100);
        glareYValue.set(y * 100);
      }}
      onPointerLeave={reset}
    >
      <motion.span
        aria-hidden="true"
        className="tilt-surface__glare"
        style={{ left: glareLeft, top: glareTop }}
      />
      {children}
    </motion.div>
  );
}

/** Couples a hero/dashboard surface to scroll for restrained depth, not spectacle. */
export function ScrollDepth({ children, className = '' }: ChildrenProps) {
  const target = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -34]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 3]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.985]);

  return (
    <motion.div
      ref={target}
      className={`scroll-depth ${className}`}
      style={reduceMotion ? undefined : { y, rotateX, scale, transformPerspective: 1300 }}
    >
      {children}
    </motion.div>
  );
}
