import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function WelcomeLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
    >
      <div className="relative">
        {/* Deep blue glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-900/20 blur-[100px] rounded-full" />
        
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10 w-24 h-24 flex items-center justify-center drop-shadow-[0_0_50px_rgba(59,130,246,0.5)]"
        >
          <img src="/mediapipe-assets/HireMeLogo.png" alt="HireME Logo" className="w-20 h-20 rounded-3xl object-contain" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-12 text-center"
      >
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
          HIRE<span className="text-blue-500">ME</span>
        </h1>
        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium tracking-widest uppercase">
          <Sparkles className="w-4 h-4 text-blue-400" />
          By TAIM TEAM
        </div>
      </motion.div>

      <div className="absolute bottom-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="w-full h-full bg-blue-500"
        />
      </div>
    </motion.div>
  );
}
