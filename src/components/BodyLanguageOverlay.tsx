import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BodyLanguageScores } from '../types';
import { Eye, PersonStanding, Hand, Shield, Volume2 } from 'lucide-react';

interface Props {
  scores: BodyLanguageScores;
  isActive: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#f43f5e';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Great';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
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
        <div className="rounded-xl p-3 text-center transition-colors duration-500"
          style={{ 
            background: 'rgba(0,0,0,0.7)', 
            backdropFilter: 'blur(12px)', 
            border: '1px solid rgba(255,255,255,0.1)' 
          }}>
          <p className="text-xs text-slate-400 mb-1">Overall</p>
          <p className="text-3xl font-black transition-colors duration-500" style={{ color: getScoreColor(scores.overall) }}>
            {scores.overall}
          </p>
          <p className="text-xs font-medium transition-colors duration-500" style={{ color: getScoreColor(scores.overall) }}>
            {getScoreLabel(scores.overall)}
          </p>
        </div>

        {/* Individual Metrics */}
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl p-2.5 flex items-center gap-2"
            style={{ 
              background: 'rgba(0,0,0,0.6)', 
              backdropFilter: 'blur(10px)', 
              border: '1px solid rgba(255,255,255,0.08)' 
            }}
          >
            <metric.icon className="w-4 h-4 shrink-0 transition-colors duration-500" style={{ color: getScoreColor(metric.value) }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 leading-none mb-1">{metric.label}</p>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    background: getScoreColor(metric.value),
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
  // Only re-render if scores change by more than 1 point to reduce flicker and re-renders
  return Math.abs(prev.scores.overall - next.scores.overall) <= 1 &&
         Math.abs(prev.scores.eyeContact - next.scores.eyeContact) <= 1 &&
         Math.abs(prev.scores.posture - next.scores.posture) <= 1 && 
         Math.abs(prev.scores.gestures - next.scores.gestures) <= 1 &&
         Math.abs(prev.scores.audio - next.scores.audio) <= 1 &&
         prev.isActive === next.isActive;
});

export default BodyLanguageOverlay;
