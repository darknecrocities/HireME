import { type ReactNode, useRef, useState } from 'react';
import {
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

/** A smooth, reliable page-level transition used by every route. */
export function PagePresence({ children }: ChildrenProps) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={location.pathname}
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.2, ease: calmEase }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

/** Reading-position scroll progress bar. */
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

/** Reveals content as it enters viewport. */
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

/** Interactive 3D physics tilt card that tilts towards the cursor with dynamic glare spotlight. */
export function TiltCard({ children, className = '' }: ChildrenProps) {
  const reduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const rotateXVal = useMotionValue(0);
  const rotateYVal = useMotionValue(0);
  const glareXVal = useMotionValue(50);
  const glareYVal = useMotionValue(50);

  // Smooth responsive spring physics for 3D rotation
  const rotateX = useSpring(rotateXVal, { stiffness: 320, damping: 22 });
  const rotateY = useSpring(rotateYVal, { stiffness: 320, damping: 22 });
  const glareX = useSpring(glareXVal, { stiffness: 300, damping: 25 });
  const glareY = useSpring(glareYVal, { stiffness: 300, damping: 25 });

  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(circle 280px at ${gx}% ${gy}%, rgba(255, 255, 255, 0.12), transparent 80%)`
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width; // 0 to 1
    const y = (event.clientY - rect.top) / rect.height; // 0 to 1

    // Tilt range of ±12 degrees
    rotateXVal.set((0.5 - y) * 16);
    rotateYVal.set((x - 0.5) * 16);
    glareXVal.set(x * 100);
    glareYVal.set(y * 100);
  };

  const handlePointerEnter = () => setIsHovered(true);

  const handlePointerLeave = () => {
    setIsHovered(false);
    rotateXVal.set(0);
    rotateYVal.set(0);
    glareXVal.set(50);
    glareYVal.set(50);
  };

  return (
    <motion.div
      data-thock="true"
      data-tilt-card="true"
      className={`relative rounded-3xl will-change-transform ${className}`}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Dynamic Cursor Spotlight Glare Overlay */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl z-20 transition-opacity duration-300"
        style={{
          background: glareBackground,
          opacity: isHovered ? 1 : 0,
        }}
      />
      <div className="relative z-10 h-full w-full" style={{ transform: 'translateZ(18px)' }}>
        {children}
      </div>
    </motion.div>
  );
}

/** Adds a small, pointer-led sense of depth to selected surfaces on fine pointers only. */
export function TiltSurface({ children, className = '' }: ChildrenProps) {
  return <TiltCard className={className}>{children}</TiltCard>;
}

/** Couples a hero/dashboard surface to scroll for restrained depth. */
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
