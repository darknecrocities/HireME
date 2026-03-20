import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, Star, ExternalLink, Loader2, Sparkles, Building2, Clock, Globe2, BrainCircuit, Rocket } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useJobSearch, type Job } from '../hooks/useJobSearch';
import { useFirestore } from '../hooks/useFirestore';

export default function JobListing() {
  const { user } = useAuth();
  const { searchJobs, saveJob, unsaveJob, getSavedJobs, loading, error, limitReached } = useJobSearch();
  const { getSessions } = useFirestore();
  
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [initialSearchDone, setInitialSearchDone] = useState(false);
  const [recommendations, setRecommendations] = useState<{ title: string; reason: string }[]>([]);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [view, setView] = useState<'search' | 'saved'>('search');
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  const fetchSavedJobsList = async () => {
    if (!user) return;
    const saved = await getSavedJobs();
    setSavedJobs(saved);
  };

  useEffect(() => {
    if (view === 'saved') {
      fetchSavedJobsList();
    }
  }, [view, user]);

  useEffect(() => {
    if (saveFeedback) {
      const timer = setTimeout(() => setSaveFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveFeedback]);

  useEffect(() => {
    const fetchSavedAndRecs = async () => {
      if (!user) return;
      
      // Fetch saved jobs
      const saved = await getSavedJobs();
      setSavedJobIds(new Set(saved.map(j => j.id)));

      // Fetch latest interview recommendations
      const sessions = await getSessions();
      const latestInterview = sessions
        .filter(s => s.type === 'interview' && s.aiAnalysis?.top3JobRecommendations)
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
      
      if (latestInterview?.aiAnalysis?.top3JobRecommendations) {
        setRecommendations(latestInterview.aiAnalysis.top3JobRecommendations);
      }
    };
    fetchSavedAndRecs();
  }, [user, getSessions]);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = customQuery || query || 'Software Engineer'; // Default if empty
    const results = await searchJobs({ query: searchQuery, location, remote });
    setJobs(results);
    setInitialSearchDone(true);
    if (customQuery) setQuery(customQuery);
  };

  const handleSaveToggle = async (job: Job) => {
    if (!user) {
      setSaveFeedback('Please sign in to save jobs');
      return;
    }
    
    if (savedJobIds.has(job.id)) {
      await unsaveJob(job.id);
      setSavedJobIds(prev => {
        const next = new Set(prev);
        next.delete(job.id);
        return next;
      });
      setSaveFeedback('Job choice removed');
    } else {
      await saveJob(job);
      setSavedJobIds(prev => new Set(prev).add(job.id));
      setSaveFeedback('Job node synced to profile');
    }
    
    if (view === 'saved') {
      await fetchSavedJobsList();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030817] text-white pt-36 pb-20 px-6 relative overflow-hidden flex flex-col items-center">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Enhanced Neural Job Feed
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl mb-4"
          >
            PIONEER YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">PATHWAY</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-12"
          >
            Search jobs with high-fidelity filtering
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl mb-8"
          >
            <button
              onClick={() => setView('search')}
              className={`flex items-center gap-2 px-6 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${
                view === 'search' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              Neural Search
            </button>
            <button
              onClick={() => setView('saved')}
              className={`flex items-center gap-2 px-6 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${
                view === 'saved' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4" />
              Saved Paths
            </button>
          </motion.div>
        </div>

        {/* Profile Resonance (Recommendations) */}
        <AnimatePresence>
          {view === 'search' && recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-6">
                <BrainCircuit className="w-4 h-4 text-blue-400" />
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Resonance Matches</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((rec, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleSearch(undefined, rec.title)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-[28px] border border-blue-500/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-5 hover:border-blue-500/40 text-left group transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                        <Rocket className="w-4 h-4 text-blue-400" />
                      </div>
                      <Sparkles className="w-3 h-3 text-blue-500/40 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h3 className="text-sm font-black text-white mb-1 uppercase tracking-tight">{rec.title}</h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed line-clamp-2">{rec.reason}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Panel */}
        <AnimatePresence mode="wait">
          {view === 'search' && (
            <motion.div
              key="search-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.28)] mb-12 p-8"
            >
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-5 space-y-2 text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                    <Briefcase className="w-3 h-3" /> Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="Software Engineer, Product Designer..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-[#081124] border border-white/10 rounded-xl px-5 py-4 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="md:col-span-4 space-y-2 text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                    <MapPin className="w-3 h-3" /> Location
                  </label>
                  <input
                    type="text"
                    placeholder="New York, San Francisco, Remote..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#081124] border border-white/10 rounded-xl px-5 py-4 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="md:col-span-3">
                  <div className="flex items-center gap-4 mb-3">
                    <button
                      type="button"
                      onClick={() => setRemote(!remote)}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${
                        remote ? 'bg-[#081124] border-blue-500 border-2 text-white' : 'bg-transparent border-white/10 text-slate-500 hover:text-white hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Globe2 className="w-3.5 h-3.5" />
                        Remote
                      </div>
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Execute Search
                  </button>
                </div>
              </form>

              {limitReached && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest"
                >
                  Daily Search Limit Reached (10/10). Please wait for reset.
                </motion.div>
              )}
              {error && (
                <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest">
                  {error}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {saveFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-4 border-blue-500/30 shadow-[0_20px_50px_rgba(37,99,235,0.2)] flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{saveFeedback}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Area */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {(() => {
              const displayJobs = view === 'search' ? jobs : savedJobs;
              
              if (displayJobs.length > 0) {
                return displayJobs.map((job, i) => (
                  <motion.div
                    key={`${view}-${job.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-8 group hover:border-blue-500/30 transition-all mb-6"
                  >
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="w-14 h-14 rounded-2xl bg-blue-900/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Building2 className="w-7 h-7 text-blue-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-lg font-black text-white uppercase tracking-tight">{job.job_title}</h3>
                          {job.remote && (
                            <span className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                              Remote Optimized
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-blue-500" /> {job.company_name}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location || 'Global'}</span>
                          <span className="flex items-center gap-1.5"><Globe2 className="w-3.5 h-3.5 text-blue-400/50" /> {job.platform}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /> {new Date(job.posted_at).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.technologies?.slice(0, 5).map(tech => (
                            <span key={tech} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[8px] font-black uppercase tracking-tighter">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 md:w-40 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          Applications <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleSaveToggle(job)}
                          className={`flex-1 md:w-40 py-3 rounded-xl border transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                            savedJobIds.has(job.id) 
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${savedJobIds.has(job.id) ? 'fill-rose-400' : ''}`} />
                          {savedJobIds.has(job.id) ? 'Saved' : 'Save Path'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ));
              }

              if (view === 'saved' && !loading) {
                return (
                  <motion.div
                    key="empty-saved"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 bg-white/2 rounded-3xl border border-dashed border-white/10"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-6 flex items-center justify-center border border-white/5">
                      <Star className="w-8 h-8 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">No saved paths found</h3>
                    <p className="text-slate-600 text-xs font-bold mt-2 uppercase">Your curated career nodes will appear here</p>
                  </motion.div>
                );
              }

              if (initialSearchDone && !loading) {
                return (
                  <motion.div
                    key="empty-search"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 bg-white/2 rounded-3xl border border-dashed border-white/10"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-6 flex items-center justify-center border border-white/5">
                      <Search className="w-8 h-8 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">No matching nodes found</h3>
                    <p className="text-slate-600 text-xs font-bold mt-2 uppercase">Try adjusting your filters for better resonance</p>
                  </motion.div>
                );
              }

              if (!loading) {
                return (
                  <div key="placeholders" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3].map(item => (
                      <div key={item} className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-10 text-left group">
                        <div className="w-10 h-10 rounded-xl bg-blue-900/20 border border-blue-500/20 flex items-center justify-center mb-6">
                          <Target className="w-5 h-5 text-blue-500" />
                        </div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Neural Recommendation</h4>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.1em]">Search roles matching your neural profile.</p>
                      </div>
                    ))}
                  </div>
                );
              }

              return null;
            })()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Target({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
