import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, Coffee, Brain, SkipForward } from "lucide-react";

const MODES = {
  work:       { label: "Focus",       duration: 25 * 60, color: '#f43f5e', bg: 'from-rose-500/20 to-rose-900/5' },
  shortBreak: { label: "Pause courte", duration: 5 * 60,  color: '#34d399', bg: 'from-emerald-500/20 to-emerald-900/5' },
  longBreak:  { label: "Pause longue", duration: 15 * 60, color: '#38bdf8', bg: 'from-sky-500/20 to-sky-900/5' },
};
type ModeKey = keyof typeof MODES;

function beep(freq: number, duration: number) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export const PomodoroWidget = () => {
  const [mode, setMode] = useState<ModeKey>('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [notification, setNotification] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const m = MODES[mode];
  const total = m.duration;
  const progress = 1 - timeLeft / total;
  const circumference = 2 * Math.PI * 108;

  const switchMode = useCallback((newMode: ModeKey) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setNotification('');
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            beep(880, 0.3);
            setTimeout(() => beep(1100, 0.3), 350);
            setTimeout(() => beep(1320, 0.5), 700);
            if (mode === 'work') {
              setSessions(s => s + 1);
              setNotification('Bravo ! Prends une pause.');
            } else {
              setNotification('C\'est reparti !');
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto py-8 px-4">
      {/* Mode tabs */}
      <div className="flex gap-2 mb-10">
        {(Object.keys(MODES) as ModeKey[]).map(key => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              mode === key
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-300'
            }`}
            style={mode === key ? { background: MODES[key].color + '22', color: MODES[key].color, border: `1px solid ${MODES[key].color}40` } : { border: '1px solid transparent' }}
          >
            {MODES[key].label}
          </button>
        ))}
      </div>

      {/* Circle timer */}
      <div className="relative flex items-center justify-center mb-10">
        <svg width="240" height="240" className="-rotate-90">
          {/* Track */}
          <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          {/* Progress */}
          <motion.circle
            cx="120" cy="120" r="108"
            fill="none"
            stroke={m.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transition={{ ease: 'linear', duration: 0.5 }}
            style={{ filter: `drop-shadow(0 0 8px ${m.color}80)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center">
          <motion.div
            key={`${mm}:${ss}`}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            className="text-6xl font-thin text-white tracking-tighter tabular-nums"
          >
            {mm}<span className="text-gray-500">:</span>{ss}
          </motion.div>
          <div className="text-sm font-medium mt-2" style={{ color: m.color }}>
            {m.label}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {sessions} session{sessions !== 1 ? 's' : ''} aujourd'hui
          </div>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: m.color + '20', border: `1px solid ${m.color}30` }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => { switchMode(mode); }}
          className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setRunning(r => !r); setNotification(''); }}
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all"
          style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}99)`, boxShadow: `0 0 30px ${m.color}40` }}
        >
          {running ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
        </motion.button>

        <button
          onClick={() => {
            const next: ModeKey = mode === 'work'
              ? (sessions > 0 && sessions % 4 === 0 ? 'longBreak' : 'shortBreak')
              : 'work';
            switchMode(next);
          }}
          className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Session dots */}
      <div className="flex gap-2 mt-8">
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full transition-all"
            style={{
              background: sessions > i ? m.color : 'rgba(255,255,255,0.08)',
              boxShadow: sessions > i ? `0 0 8px ${m.color}80` : 'none'
            }}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-2">Après 4 sessions → pause longue</p>
    </div>
  );
};
