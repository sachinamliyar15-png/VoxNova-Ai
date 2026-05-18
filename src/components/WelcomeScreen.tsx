import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/10">
          <Mic className="text-white w-12 h-12" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-display font-bold tracking-tighter text-zinc-900 flex flex-col items-center">
            <div>VOX<span className="text-emerald-500">NOVA</span></div>
            <div className="text-xl text-zinc-400 font-medium tracking-tight mt-1 text-center">Text to Speech</div>
          </h1>
        </div>

        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          onAnimationComplete={() => setTimeout(onComplete, 500)}
          className="h-1 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        />
      </motion.div>

      <div className="absolute bottom-12 text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
        Professional Studio Grade TTS
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;
