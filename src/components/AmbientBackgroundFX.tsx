import { useEffect, useRef, useState } from 'react';
import { getExperienceSettings, type ExperienceSettings } from '../utils/experienceSettings';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
}

export default function AmbientBackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [settings, setSettings] = useState<ExperienceSettings>(getExperienceSettings());

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<ExperienceSettings>;
      if (custom.detail) {
        setSettings(custom.detail);
      }
    };
    window.addEventListener('hireme_experience_update', handleUpdate);
    return () => window.removeEventListener('hireme_experience_update', handleUpdate);
  }, []);

  useEffect(() => {
    if (!settings.backgroundFx) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate constellation nodes
    const starCount = Math.min(Math.floor((width * height) / 28000), 45);
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      const baseAlpha = 0.12 + Math.random() * 0.22;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: 0.8 + Math.random() * 1.2,
        alpha: baseAlpha,
        baseAlpha,
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);

      // Draw constellation connections
      for (let i = 0; i < stars.length; i++) {
        const s1 = stars[i];
        s1.x += s1.vx;
        s1.y += s1.vy;

        if (s1.x < 0) s1.x = width;
        if (s1.x > width) s1.x = 0;
        if (s1.y < 0) s1.y = height;
        if (s1.y > height) s1.y = 0;

        // Mouse proximity brightening
        const dxMouse = mouseX - s1.x;
        const dyMouse = mouseY - s1.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 180) {
          s1.alpha = s1.baseAlpha + (1 - distMouse / 180) * 0.5;
        } else {
          s1.alpha = s1.baseAlpha;
        }

        // Draw star dot
        ctx.fillStyle = `rgba(255, 255, 255, ${s1.alpha})`;
        ctx.beginPath();
        ctx.arc(s1.x, s1.y, s1.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby stars with subtle architectural lines
        for (let j = i + 1; j < stars.length; j++) {
          const s2 = stars[j];
          const dx = s1.x - s2.x;
          const dy = s1.y - s2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.08 * (s1.alpha + s2.alpha);
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.stroke();
          }
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [settings.backgroundFx]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Dynamic Background Constellation Canvas */}
      {settings.backgroundFx && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
        />
      )}

      {/* Subtle Aurora Ambient Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-white/[0.015] via-transparent to-transparent opacity-80 pointer-events-none" />
    </div>
  );
}
