import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ScoreCardProps {
  label: string;
  value: number;
  maxValue?: number;
  icon: LucideIcon;
  color?: string;
  delay?: number;
  compact?: boolean;
}

export default function ScoreCard({ label, value, maxValue = 100, icon: Icon, delay = 0, compact = false }: ScoreCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);

  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();
    const timer = setTimeout(() => {
      const animate = () => {
        const elapsed = Date.now() - startTime - delay * 1000;
        if (elapsed < 0) {
          requestAnimationFrame(animate);
          return;
        }
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setDisplayValue(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [value, delay]);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.4 }}
        className="glass-card metric-card p-4 flex items-center gap-3 border-white/10"
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-400 truncate">{label}</p>
          <p className="text-lg font-bold text-white">{displayValue}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card metric-card group transition-all duration-300 p-6 border-white/10 hover:border-white/25 shadow-xl"
    >
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/10 text-white border border-white/10">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="text-2xl font-bold text-white">{displayValue}<span className="text-sm text-zinc-500 font-normal">/{maxValue}</span></p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full overflow-hidden bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: delay + 0.3, duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-zinc-400 to-white shadow-[0_0_10px_rgba(255,255,255,0.4)]"
          />
        </div>
      </div>
    </motion.div>
  );
}
