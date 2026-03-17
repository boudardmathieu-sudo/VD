import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Home, Server, Settings,
  Timer, Calculator, CheckSquare, Wrench,
  LogOut, X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard, color: '#f43f5e' },
  { id: 'home',       label: 'Maison',     icon: Home,            color: '#a78bfa' },
  { id: 'server',     label: 'Serveur',    icon: Server,          color: '#38bdf8' },
  { id: 'pomodoro',   label: 'Pomodoro',   icon: Timer,           color: '#fb923c' },
  { id: 'calculator', label: 'Calculette', icon: Calculator,      color: '#34d399' },
  { id: 'habits',     label: 'Habitudes',  icon: CheckSquare,     color: '#fbbf24' },
  { id: 'settings',   label: 'Paramètres', icon: Settings,        color: '#94a3b8' },
];

const RADIUS = 130;
const START_ANGLE = 205;
const END_ANGLE   = 335;

function getPos(index: number, total: number) {
  const angle = START_ANGLE + (index / (total - 1)) * (END_ANGLE - START_ANGLE);
  const rad   = (angle * Math.PI) / 180;
  return {
    x: Math.cos(rad) * RADIUS,
    y: Math.sin(rad) * RADIUS,
  };
}

interface ArcMenuProps {
  currentView: string;
  onViewChange: (v: string) => void;
  onLogout: () => void;
}

export const ArcMenu = ({ currentView, onViewChange, onLogout }: ArcMenuProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) window.addEventListener('keydown', (e) => e.key === 'Escape' && close());
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  const handleSelect = (id: string) => {
    onViewChange(id);
    setOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Arc container */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">

        {/* Arc items */}
        <AnimatePresence>
          {open && NAV_ITEMS.map((item, i) => {
            const { x, y } = getPos(i, NAV_ITEMS.length);
            const isActive = currentView === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                animate={{ opacity: 1, x, y, scale: 1 }}
                exit={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 28,
                  delay: i * 0.035,
                }}
                style={{ position: 'absolute', top: 0, left: 0, translateX: '-50%', translateY: '-50%' }}
              >
                <button
                  onClick={() => handleSelect(item.id)}
                  className="relative flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  {/* Icon bubble */}
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.92 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      isActive
                        ? 'bg-white/15 ring-2 ring-white/30'
                        : 'bg-[#111115]/90 border border-white/10'
                    }`}
                    style={isActive ? { boxShadow: `0 0 20px ${item.color}60` } : {}}
                  >
                    <item.icon
                      className="w-5 h-5"
                      style={{ color: isActive ? item.color : '#9ca3af' }}
                    />
                  </motion.div>
                  {/* Label */}
                  <span
                    className="text-[10px] font-medium tracking-wide whitespace-nowrap bg-black/70 px-1.5 py-0.5 rounded-md"
                    style={{ color: isActive ? item.color : '#9ca3af' }}
                  >
                    {item.label}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Logout button (left of center when open) */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.3 }}
              animate={{ opacity: 1, y: -155, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.3 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28, delay: 0.28 }}
              style={{ position: 'absolute', top: 0, left: 0, translateX: '-50%', translateY: '-50%' }}
            >
              <button
                onClick={handleLogout}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.92 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-rose-500/15 border border-rose-500/30 shadow-lg"
                >
                  <LogOut className="w-5 h-5 text-rose-400" />
                </motion.div>
                <span className="text-[10px] font-medium text-rose-400 bg-black/70 px-1.5 py-0.5 rounded-md">
                  Quitter
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center button */}
        <motion.button
          onClick={() => setOpen(!open)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center justify-center cursor-pointer"
        >
          {/* Outer glow ring */}
          <motion.div
            animate={open
              ? { scale: 1.5, opacity: 0 }
              : { scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }
            }
            transition={open
              ? { duration: 0.3 }
              : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
            }
            className="absolute w-14 h-14 rounded-full bg-rose-500/20"
          />

          {/* Main button */}
          <div className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-all duration-300 ${
            open
              ? 'bg-white/10 border-2 border-white/20'
              : 'bg-gradient-to-br from-rose-500 to-violet-600 border-2 border-white/20'
          }`}>
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X className="w-5 h-5 text-white" />
                </motion.div>
              ) : (
                <motion.div key="logo" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <span className="text-sm font-bold text-white tracking-tight">
                    L<span className="font-light opacity-80">OS</span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </div>
    </>
  );
};
