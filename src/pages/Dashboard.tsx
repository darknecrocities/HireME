import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Award, Target, Brain, ShieldCheck, Smile } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { useFirestore } from '../hooks/useFirestore';
import ScoreCard from '../components/ScoreCard';

const MONO_COLORS = ['#ffffff', '#d4d4d8', '#a1a1aa', '#71717a', '#3f3f46'];

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
      <div className="page-shell flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Brain className="w-12 h-12 text-white animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Loading Analytics Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell relative overflow-hidden flex flex-col items-center text-white">
      <div className="page-frame">
        {/* Header */}
        <div className="page-intro page-intro--wide flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="eyebrow mb-5">
              <ShieldCheck className="w-3.5 h-3.5 text-white" /> Performance Intelligence
            </div>
            <h1 className="page-title mb-2">Career <span className="title-accent">Analytics</span></h1>
            <p className="page-lede">A clear record of your practice, progress, and strongest performance metrics.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 bg-zinc-900/80 border border-white/10 p-4 rounded-2xl backdrop-blur-xl"
          >
            <Calendar className="w-5 h-5 text-zinc-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Last Synced</span>
              <span className="text-xs font-bold text-white uppercase">{new Date().toLocaleDateString()}</span>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <ScoreCard label="TOTAL SESSIONS" value={stats.totalSessions} maxValue={50} icon={BarChart3} />
          <ScoreCard label="COMPOSITE AVERAGE" value={stats.avgScore} maxValue={100} icon={Target} />
          <ScoreCard label="PEAK PERFORMANCE" value={stats.bestScore} maxValue={100} icon={Award} />
          <ScoreCard label="GROWTH CURVE" value={Number(stats.improvement)} maxValue={20} icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 glass-card p-8 sm:p-10 border-white/10 bg-zinc-900/60"
          >
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              Performance Progression
            </h3>
            <div className="h-64 sm:h-80 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#09090b', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '0.75rem', color: '#ffffff' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#ffffff" strokeWidth={3} dot={{ fill: '#ffffff', r: 4 }} activeDot={{ r: 7, stroke: '#09090b', strokeWidth: 2 }} animationDuration={900} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Communication Insights Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 glass-card p-8 sm:p-10 border-white/10 bg-zinc-900/60"
          >
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-10 flex items-center gap-2">
              <Smile className="w-4 h-4 text-white" />
              Communication Insights
            </h3>
            <div className="h-48 sm:h-60 w-full mb-6 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={150}>
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
                      <Cell key={`cell-${index}`} fill={MONO_COLORS[index % MONO_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#09090b', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '0.75rem', color: '#ffffff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {emotionData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MONO_COLORS[index % MONO_COLORS.length] }} />
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
            className="lg:col-span-12 glass-card p-8 sm:p-10 border-white/10 bg-zinc-900/60 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Historical Session Logs</h3>
              <div className="text-[9px] font-black text-white uppercase tracking-widest px-3 py-1 rounded bg-white/10 border border-white/10">Full Archive</div>
            </div>
            <div className="space-y-4">
              {sessions.map((session: any, idx: number) => (
                <div key={session.id ?? `${session.startTime ?? session.createdAt ?? 'session'}-${idx}`} className="group flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 transition-all">
                  <div className="flex items-center gap-6 mb-4 sm:mb-0">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-black text-lg border border-white/15">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">
                        {session.type === 'interview' ? `${session.employerIndustry} Interview` : 'Resume Analysis'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{new Date(session.startTime).toLocaleDateString()}</p>
                        <span className="text-white/10">•</span>
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Hire: {session.aiAnalysis?.hiringProbability || 0}%</p>
                          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Conf: {session.aiAnalysis?.confidenceScore || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                      <span className="text-xl font-black text-white">{session.type === 'interview' ? session.aiAnalysis.interviewScore : session.aiAnalysis.resumeScore}</span>
                      <span className="text-[9px] font-black text-zinc-400 uppercase">Overall Score</span>
                    </div>
                    <div className="hidden sm:flex flex-col items-center">
                      <div className="flex gap-1 h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                        <div className="bg-white h-full" style={{ width: `${session.type === 'interview' ? session.aiAnalysis.interviewScore : session.aiAnalysis.resumeScore}%` }} />
                      </div>
                      <span className="text-[8px] font-black text-zinc-500 mt-2 uppercase">Score Consistency</span>
                    </div>
                    <div className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/10 text-white border border-white/10">
                      {(session.type === 'interview' ? session.aiAnalysis.interviewScore : session.aiAnalysis.resumeScore) >= 80 ? 'Optimal' : 'Developing'}
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
