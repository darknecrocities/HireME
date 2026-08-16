import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BodyLanguageScores } from '../types';
import { Eye, PersonStanding, Hand, Shield, Volume2 } from 'lucide-react';

interface Props {
  scores: BodyLanguageScores;
  isActive: boolean;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Optimal';
  if (score >= 60) return 'Steady';
  if (score >= 40) return 'Moderate';
  return 'Calibrating';
}

const BodyLanguageOverlay = memo(({ scores, isActive }: Props) => {
  if (!isActive) return null;

  const metrics = [
    { icon: Eye, label: 'Eye Contact', value: scores.eyeContact },
    { icon: PersonStanding, label: 'Posture', value: scores.posture },
    { icon: Hand, label: 'Gestures', value: scores.gestures },
    { icon: Shield, label: 'Confidence', value: scores.confidence },
    { icon: Volume2, label: 'Vocal Score', value: scores.audio },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="absolute top-4 right-4 z-20 space-y-2"
        style={{ width: '160px' }}
      >
        {/* Overall Score */}
        <div className="rounded-xl p-3 text-center transition-colors duration-500 bg-black/80 border border-white/10 backdrop-blur-xl shadow-2xl">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Overall</p>
          <p className="text-3xl font-black text-white tracking-tight">
            {scores.overall}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
            {getScoreLabel(scores.overall)}
          </p>
        </div>

        {/* Individual Metrics */}
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl p-2.5 flex items-center gap-2 bg-black/70 border border-white/10 backdrop-blur-md"
          >
            <metric.icon className="w-4 h-4 shrink-0 text-white" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-none mb-1">{metric.label}</p>
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out bg-white"
                  style={{ 
                    width: `${metric.value}%`
                  }}
                />
              </div>
            </div>
            <span className="text-xs font-bold text-white w-7 text-right">{metric.value}</span>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}, (prev, next) => {
  return Math.abs(prev.scores.overall - next.scores.overall) <= 1 &&
         Math.abs(prev.scores.eyeContact - next.scores.eyeContact) <= 1 &&
         Math.abs(prev.scores.posture - next.scores.posture) <= 1 && 
         Math.abs(prev.scores.gestures - next.scores.gestures) <= 1 &&
         Math.abs(prev.scores.audio - next.scores.audio) <= 1 &&
         prev.isActive === next.isActive;
});

export default BodyLanguageOverlay;
