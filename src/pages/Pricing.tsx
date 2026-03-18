import { motion } from 'framer-motion';
import { Check, X, Sparkles, Zap, Shield, ZapOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const tiers = [
  {
    name: 'GUEST_PROTO',
    price: 'FREE',
    description: 'Entry-level trial for casual testing.',
    features: [
      { name: 'AI Resume Optimization', limit: '1 Use Only', included: true },
      { name: 'AI Interview Practice', limit: '1 Use Only', included: true },
      { name: 'Real-time Analytics', included: false },
      { name: 'Personal Session History', included: false },
      { name: 'Advanced STAR Analysis', included: false },
      { name: 'Custom Job Targeting', included: false },
    ],
    cta: 'CONTINUE AS GUEST',
    link: '/',
    highlight: false,
    icon: ZapOff
  },
  {
    name: 'NEURAL_ENTITY',
    price: 'AUTHENTICATED',
    description: 'Unleash the full power of HiroME intelligence.',
    features: [
      { name: 'AI Resume Optimization', limit: 'UNLIMITED', included: true },
      { name: 'AI Interview Practice', limit: 'UNLIMITED', included: true },
      { name: 'Real-time Analytics', included: true },
      { name: 'Personal Session History', included: true },
      { name: 'Advanced STAR Analysis', included: true },
      { name: 'Custom Job Targeting', included: true },
    ],
    cta: 'JOIN NEURAL NETWORK',
    link: '/auth',
    highlight: true,
    icon: Sparkles
  }
];

export default function Pricing() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-var(--nav-h))] bg-black py-20 px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
          >
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Access Protocols</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 uppercase"
          >
            SELECT YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">IDENTITY TIER</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 max-w-2xl mx-auto text-sm font-medium leading-relaxed"
          >
            Whether you're exploring the interface or ready to optimize your career at scale, choose the tier that matches your professional trajectory.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className={`relative group rounded-3xl p-[1px] ${tier.highlight ? 'bg-gradient-to-b from-blue-500/40 to-violet-500/40' : 'bg-white/5'}`}
            >
              <div className="relative h-full bg-[#050505] rounded-[23px] overflow-hidden p-8 flex flex-col">
                {/* Card Glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${tier.highlight ? 'from-blue-600/5 to-violet-600/5' : 'from-white/5 to-transparent'}`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mb-2">{tier.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white tracking-tighter">{tier.price}</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tier.highlight ? 'bg-blue-600 shadow-[0_0_20px_#3b82f6]' : 'bg-white/5 border border-white/10'}`}>
                      <tier.icon className={`w-6 h-6 ${tier.highlight ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-400 mb-8 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="space-y-4 mb-10 flex-grow">
                    {tier.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center justify-between group/feat">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${feature.included ? 'bg-green-500/10' : 'bg-rose-500/10'}`}>
                            {feature.included ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <X className="w-3 h-3 text-rose-400" />
                            )}
                          </div>
                          <span className={`text-[11px] font-bold tracking-wide ${feature.included ? 'text-slate-300' : 'text-slate-600'}`}>
                            {feature.name}
                          </span>
                        </div>
                        {feature.limit && (
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded bg-white/5 border border-white/5 uppercase tracking-widest ${feature.limit === 'UNLIMITED' ? 'text-blue-400 border-blue-500/20' : 'text-slate-500'}`}>
                            {feature.limit}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <Link 
                    to={tier.link}
                    className={`block w-full py-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                      tier.highlight 
                      ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:scale-[1.02]' 
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                    } ${user && tier.link === '/auth' ? 'pointer-events-none opacity-50 bg-green-500/10 text-green-500 border-green-500/20 shadow-none' : ''}`}
                  >
                    {user && tier.link === '/auth' ? 'CURRENTLY ACTIVE' : tier.cta}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold text-slate-500 tracking-wide">
              All tiers include global CDN delivery, security audits, and neural network updates.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
