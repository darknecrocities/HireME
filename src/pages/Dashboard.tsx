import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Award, Target, Brain, ShieldCheck, Smile } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { useFirestore } from '../hooks/useFirestore';
import ScoreCard from '../components/ScoreCard';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { getSessions, loading } = useFirestore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgScore: 0,
    bestScore: 0,
    improvement: 0
  });

  useEffect(() => {
    const fetch = async () => {
      const data = await getSessions();
      setSessions(data);
    };
    fetch();
  }, [getSessions]);

  useEffect(() => {
    if (sessions.length > 0) {
      const scores = sessions.map((s: any) => 
        s.type === 'interview' ? s.aiAnalysis.interviewScore : s.aiAnalysis.resumeScore
      ).filter((s: any) => s !== undefined);
      
      const total = sessions.length;
      const avg = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / (scores.length || 1));
      const best = Math.max(...scores.map(s => Number(s) || 0));
      const improvement = total > 1 ? (Number(scores[0]) || 0) - (Number(scores[scores.length - 1]) || 0) : 0;
      setStats({ totalSessions: total, avgScore: avg, bestScore: best, improvement });
    }
  }, [sessions]);

  const chartData = sessions.slice().reverse().map((s: any, i: number) => ({
    name: `Sess ${i + 1}`,
    score: s.type === 'interview' ? s.aiAnalysis.interviewScore : s.aiAnalysis.resumeScore,
    eye: s.bodyLanguage.eyeContactScore,
    posture: s.bodyLanguage.postureScore,
    gesture: s.bodyLanguage.gesturesScore,
  }));

  const emotionData = Object.entries(
    sessions.reduce((acc: any, s: any) => {
      const emo = s.bodyLanguage?.detectedEmotion || 'Neutral';
      acc[emo] = (acc[emo] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Brain className="w-12 h-12 text-blue-500 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Syncing Neural Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-20 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4 text-[9px] font-black tracking-widest uppercase border border-blue-500/20 bg-blue-500/5 text-blue-400">
              <ShieldCheck className="w-3 h-3" /> Secure Access: AK-PRJ-001
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter mb-2">NEURAL <span className="gradient-text">ANALYTICS</span></h1>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-slate-500">Performance Control</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl"
          >
            <Calendar className="w-5 h-5 text-slate-500" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase">Last Sync</span>
              <span className="text-xs font-bold text-white uppercase">{new Date().toLocaleDateString()}</span>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <ScoreCard label="TOTAL SESSIONS" value={stats.totalSessions} maxValue={50} icon={BarChart3} color="blue" />
          <ScoreCard label="NEURAL AVERAGE" value={stats.avgScore} maxValue={100} icon={Target} color="violet" />
          <ScoreCard label="PEAK PERFORMANCE" value={stats.bestScore} maxValue={100} icon={Award} color="emerald" />
          <ScoreCard label="GROWTH CURVE" value={Number(stats.improvement)} maxValue={20} icon={TrendingUp} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 glass-card p-10 border-white/5"
          >
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              Neural Score Projection
            </h3>
            <div className="h-64 sm:h-80 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={4} dot={{ fill: '#3b82f6', r: 6 }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} animationDuration={2000} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 glass-card p-10 border-white/5"
          >
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-10 flex items-center gap-2">
              <Smile className="w-4 h-4 text-blue-500" />
              Emotional Quotient
            </h3>
            <div className="h-48 sm:h-60 w-full mb-6 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emotionData.length > 0 ? emotionData : [{ name: 'Neutral', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {(emotionData.length > 0 ? emotionData : [{ name: 'Neutral', value: 1 }]).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {emotionData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name}
                  </div>
                  <span className="text-[10px] font-black text-white">{entry.value as number}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* History List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-12 glass-card p-10 border-white/5 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Historical Session Logs</h3>
              <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest px-3 py-1 rounded bg-blue-500/10">Full Archive</div>
            </div>
            <div className="space-y-4">
              {sessions.map((session: any, idx: number) => (
                <div key={session.id} className="group flex flex-col sm:flex-row items-center justify-between p-6 rounded-3xl bg-white/2 hover:bg-white/5 border border-white/5 transition-all">
                  <div className="flex items-center gap-6 mb-4 sm:mb-0">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 font-black text-lg border border-blue-500/20">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">
                        {session.type === 'interview' ? `${session.employerIndustry} Interview` : 'Resume Analysis'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(session.startTime).toLocaleDateString()}</p>
                        <span className="text-white/10">•</span>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{(session.bodyLanguage?.detectedEmotion as string) || 'Stable'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                      <span className="text-xl font-black text-white">{session.type === 'interview' ? session.aiAnalysis.interviewScore : session.aiAnalysis.resumeScore}</span>
                      <span className="text-[9px] font-black text-slate-600 uppercase">Neural Score</span>
                    </div>
                    <div className="hidden sm:flex flex-col items-center">
                      <div className="flex gap-1 h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${session.type === 'interview' ? session.aiAnalysis.interviewScore : session.aiAnalysis.resumeScore}%` }} />
                      </div>
                      <span className="text-[8px] font-black text-slate-700 mt-2 uppercase">Integrity</span>
                    </div>
                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${(session.type === 'interview' ? session.aiAnalysis.interviewScore : session.aiAnalysis.resumeScore) >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {(session.type === 'interview' ? session.aiAnalysis.interviewScore : session.aiAnalysis.resumeScore) >= 80 ? 'Elite' : 'Stable'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
