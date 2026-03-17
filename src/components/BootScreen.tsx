import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf } from 'lucide-react';

const BOOT_LINES = [
  { text: 'Chargement du noyau LuminaOS…', delay: 300 },
  { text: 'Initialisation des modules système…', delay: 700 },
  { text: 'Démarrage de Lumy Intelligence Core…', delay: 1100 },
  { text: 'Connexion aux services locaux…', delay: 1500 },
  { text: 'Lumy en ligne — prête.', delay: 1900, highlight: true },
];

export const BootScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(prev => [...prev, i]), line.delay));
    });

    const progressStart = 400;
    const progressDuration = 2000;
    const steps = 80;
    for (let s = 0; s <= steps; s++) {
      timers.push(
        setTimeout(
          () => setProgress(Math.round((s / steps) * 100)),
          progressStart + (progressDuration / steps) * s
        )
      );
    }

    timers.push(
      setTimeout(() => {
        setExiting(true);
        setTimeout(onComplete, 600);
      }, 2700)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(12px)' }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06060a]"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.18, scale: 1.4 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-rose-600 blur-[120px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.1, scale: 1.2 }}
              transition={{ duration: 2.5, delay: 0.3, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-700 blur-[100px]"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-sm px-8">

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col items-center gap-5"
            >
              <div className="relative flex items-center justify-center w-24 h-24 overflow-hidden rounded-full">
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl"
                />
                <motion.div
                  initial={{ y: -80, opacity: 0, rotate: -20 }}
                  animate={{ 
                    y: [-80, 80], 
                    opacity: [0, 1, 1, 0], 
                    rotate: [-20, 20, -20, 20],
                    x: [0, 20, -20, 10]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="relative text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                >
                  <Leaf size={48} strokeWidth={1.5} />
                </motion.div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white tracking-tight">
                  Lumina<span className="text-rose-400 font-light">OS</span>
                </div>
                <div className="text-[11px] font-mono text-gray-600 tracking-[0.25em] uppercase mt-1">
                  Personal Dashboard System
                </div>
              </div>
            </motion.div>

            {/* Boot lines */}
            <div className="w-full space-y-2">
              {BOOT_LINES.map((line, i) => (
                <AnimatePresence key={i}>
                  {visibleLines.includes(i) && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`text-[12px] font-mono flex items-center gap-2 ${
                        line.highlight ? 'text-emerald-400' : 'text-gray-600'
                      }`}
                    >
                      <span className={`text-[10px] ${line.highlight ? 'text-emerald-500' : 'text-rose-500/60'}`}>
                        {line.highlight ? '◆' : '›'}
                      </span>
                      {line.text}
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full"
            >
              <div className="flex justify-between text-[10px] font-mono text-gray-700 mb-2">
                <span className="tracking-widest">DÉMARRAGE</span>
                <span className="text-rose-400">{progress}%</span>
              </div>
              <div className="h-[2px] w-full bg-white/[0.06] overflow-hidden rounded-full">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #be123c, #f43f5e, #a855f7)',
                    boxShadow: '0 0 10px rgba(244,63,94,0.6)',
                    transition: 'width 0.05s linear',
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
