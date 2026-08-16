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
    const searchQuery = customQuery || query || 'Software Engineer';
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
    <div className="page-shell text-white relative overflow-hidden flex flex-col items-center">
      <div className="page-frame relative z-10">
        {/* Header */}
        <div className="page-intro mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="eyebrow mb-5"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            AI-Enhanced Job Feed
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="page-title mb-4"
          >
            Discover your <span className="title-accent">Next Role</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="page-lede mb-8"
          >
            A focused job desk, shaped by your preparation and preferences.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex p-1 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl mb-8"
          >
            <button
              onClick={() => setView('search')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer ${
                view === 'search' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              Job Search
            </button>
            <button
              onClick={() => setView('saved')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer ${
                view === 'saved' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4" />
              Saved Jobs
            </button>
          </motion.div>
        </div>

        {/* Recommendations */}
        <AnimatePresence>
          {view === 'search' && recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-6">
                <BrainCircuit className="w-4 h-4 text-white" />
                <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Recommended Roles</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((rec, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleSearch(undefined, rec.title)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-xl p-5 hover:border-white/30 text-left group transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                        <Rocket className="w-4 h-4" />
                      </div>
                      <Sparkles className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-sm font-black text-white mb-1 uppercase tracking-tight">{rec.title}</h3>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase leading-relaxed line-clamp-2">{rec.reason}</p>
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
              className="rounded-[28px] border border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-2xl mb-12 p-8"
            >
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                <div className="md:col-span-4 space-y-2 text-left">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                    <Briefcase className="w-3 h-3 text-white" /> Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="Software Engineer, Product Designer..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                  />
                </div>
                <div className="md:col-span-3 space-y-2 text-left">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                    <MapPin className="w-3 h-3 text-white" /> Location
                  </label>
                  <input
                    type="text"
                    placeholder="New York, San Francisco, Remote..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                  />
                </div>
                <div className="md:col-span-2 space-y-2 text-left">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                    <Globe2 className="w-3 h-3 text-white" /> Mode
                  </label>
                  <button
                    type="button"
                    onClick={() => setRemote(!remote)}
                    className={`w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.18em] transition-all border cursor-pointer ${
                      remote ? 'bg-white text-black border-white shadow-lg font-black' : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5" />
                      {remote ? 'Remote' : 'All Roles'}
                    </div>
                  </button>
                </div>
                <div className="md:col-span-3 space-y-2 text-left">
                  <label className="text-[10px] font-bold text-transparent uppercase tracking-[0.2em] hidden md:flex items-center gap-2 mb-2 select-none">
                    Action
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search Jobs
                  </button>
                </div>
              </form>

              {limitReached && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-zinc-800 border border-white/20 text-zinc-300 text-[10px] font-black uppercase tracking-widest"
                >
                  Daily Search Limit Reached (10/10). Please wait for reset.
                </motion.div>
              )}
              {error && (
                <div className="mt-6 p-4 rounded-xl bg-zinc-800 border border-white/20 text-zinc-300 text-[10px] font-black uppercase tracking-widest">
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
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-4 border-white/20 shadow-2xl flex items-center gap-3 bg-black/90 backdrop-blur-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
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
                    className="rounded-[28px] border border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-xl p-8 group hover:border-white/30 transition-all mb-6"
                  >
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform text-white">
                        <Building2 className="w-7 h-7" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-lg font-black text-white uppercase tracking-tight">{job.job_title}</h3>
                          {job.remote && (
                            <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-white text-[8px] font-black uppercase tracking-widest">
                              Remote
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-zinc-400 text-[11px] font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-white" /> {job.company_name}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-zinc-500" /> {(job.location && job.location.toLowerCase() !== 'no fetch') ? job.location : 'Remote/Global'}</span>
                          <span className="flex items-center gap-1.5"><Globe2 className="w-3.5 h-3.5 text-zinc-400" /> {job.platform}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-zinc-500" /> {new Date(job.posted_at).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.technologies?.slice(0, 5).map(tech => (
                            <span key={tech} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-[8px] font-black uppercase tracking-tighter">
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
                          className="flex-1 md:w-40 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 no-underline shadow-md"
                        >
                          Apply <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleSaveToggle(job)}
                          className={`flex-1 md:w-40 py-3 rounded-xl border transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer ${
                            savedJobIds.has(job.id) 
                            ? 'bg-zinc-800 border-white/30 text-white' 
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${savedJobIds.has(job.id) ? 'fill-white text-white' : ''}`} />
                          {savedJobIds.has(job.id) ? 'Saved' : 'Save Job'}
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
                    className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-dashed border-white/10"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-6 flex items-center justify-center border border-white/5 text-zinc-500">
                      <Star className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-400 uppercase tracking-widest">No saved paths found</h3>
                    <p className="text-zinc-500 text-xs font-bold mt-2 uppercase">Your curated career nodes will appear here</p>
                  </motion.div>
                );
              }

              if (initialSearchDone && !loading) {
                return (
                  <motion.div
                    key="empty-search"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-dashed border-white/10"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-6 flex items-center justify-center border border-white/5 text-zinc-500">
                      <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-400 uppercase tracking-widest">No matching jobs found</h3>
                    <p className="text-zinc-500 text-xs font-bold mt-2 uppercase">Try adjusting your filters for better results</p>
                  </motion.div>
                );
              }

              if (!loading) {
                return (
                  <div key="placeholders" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3].map(item => (
                      <div key={item} className="rounded-[28px] border border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-xl p-10 text-left group">
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-6 text-white">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Job Opportunities</h4>
                        <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-[0.1em]">Search roles matching your professional profile.</p>
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
