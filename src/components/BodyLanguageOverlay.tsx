import { motion } from 'framer-motion';
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

export default function BodyLanguageOverlay({ scores, isActive }: Props) {
  if (!isActive) return null;

  const metrics = [
    { icon: Eye, label: 'Eye Contact', value: scores.eyeContact },
    { icon: PersonStanding, label: 'Posture', value: scores.posture },
    { icon: Hand, label: 'Gestures', value: scores.gestures },
    { icon: Shield, label: 'Confidence', value: scores.confidence },
    { icon: Volume2, label: 'Vocal Score', value: scores.audio },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 z-20 space-y-2"
      style={{ width: '160px' }}
    >
      {/* Overall Score */}
      <div className="rounded-xl p-3 text-center"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-xs text-slate-400 mb-1">Overall</p>
        <p className="text-3xl font-black" style={{ color: getScoreColor(scores.overall) }}>
          {scores.overall}
        </p>
        <p className="text-xs font-medium" style={{ color: getScoreColor(scores.overall) }}>
          {getScoreLabel(scores.overall)}
        </p>
      </div>

      {/* Individual Metrics */}
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-xl p-2.5 flex items-center gap-2"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <metric.icon className="w-4 h-4 shrink-0" style={{ color: getScoreColor(metric.value) }} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-500 leading-none mb-1">{metric.label}</p>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: getScoreColor(metric.value) }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
          <span className="text-xs font-bold text-white w-7 text-right">{metric.value}</span>
        </div>
      ))}
    </motion.div>
  );
}
