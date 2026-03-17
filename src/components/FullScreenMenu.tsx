import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Home, Server, Settings,
  Timer, Calculator, CheckSquare, Wrench,
  LogOut, X, Sparkles, ChevronRight, Clock
} from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'lumy',       label: 'Lumy',           subtitle: 'IA locale — sans API, sans cloud',
    icon: Sparkles,   color: '#fbbf24',        gradient: 'from-amber-500/20 to-orange-600/10',
    border: 'border-amber-500/20', featured: true,
  },
  {
    id: 'dashboard',  label: 'Dashboard',    subtitle: 'Vue d\'ensemble',
    icon: LayoutDashboard, color: '#f43f5e', gradient: 'from-rose-500/15 to-rose-900/5',
    border: 'border-rose-500/15',
  },
  {
    id: 'home',       label: 'Maison',       subtitle: 'Appareils connectés',
    icon: Home,       color: '#a78bfa',       gradient: 'from-violet-500/15 to-violet-900/5',
    border: 'border-violet-500/15',
  },
  {
    id: 'server',     label: 'Serveur',      subtitle: 'Infrastructure',
    icon: Server,     color: '#38bdf8',       gradient: 'from-sky-500/15 to-sky-900/5',
    border: 'border-sky-500/15',
  },
  {
    id: 'pomodoro',   label: 'Pomodoro',     subtitle: 'Focus & concentration',
    icon: Timer,      color: '#fb923c',       gradient: 'from-orange-500/15 to-orange-900/5',
    border: 'border-orange-500/15',
  },
  {
    id: 'calculator', label: 'Calculette',   subtitle: 'Calculs rapides',
    icon: Calculator, color: '#34d399',       gradient: 'from-emerald-500/15 to-emerald-900/5',
    border: 'border-emerald-500/15',
  },
  {
    id: 'habits',     label: 'Habitudes',    subtitle: 'Suivi journalier',
    icon: CheckSquare, color: '#60a5fa',      gradient: 'from-blue-500/15 to-blue-900/5',
    border: 'border-blue-500/15',
  },
  {
    id: 'tools',      label: 'Outils',       subtitle: 'Utilitaires pratiques',
    icon: Wrench,     color: '#f472b6',       gradient: 'from-pink-500/15 to-pink-900/5',
    border: 'border-pink-500/15',
  },
  {
    id: 'settings',   label: 'Paramètres',   subtitle: 'Configuration',
    icon: Settings,   color: '#94a3b8',       gradient: 'from-slate-500/15 to-slate-900/5',
    border: 'border-slate-500/15',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (v: string) => void;
  onLogout: () => void;
  userName: string;
}

export const FullScreenMenu = ({ open, onClose, currentView, onViewChange, onLogout, userName }: Props) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSelect = (id: string) => {
    onViewChange(id);
    onClose();
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: 'rgba(3, 3, 7, 0.97)' }}
        >
          {/* Background aurora */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.12 }}
              transition={{ duration: 0.8 }}
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-rose-600 blur-[120px]"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.08 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600 blur-[120px]"
            />
          </div>

          {/* Header bar */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/[0.05]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <span className="text-xs font-bold text-white">LOS</span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{userName}</div>
                <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                  <Clock className="w-3 h-3" />
                  {timeStr} — {dateStr}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/[0.07] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Navigation grid */}
          <div className="relative z-10 flex-1 overflow-y-auto px-6 md:px-10 py-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-[10px] text-gray-600 font-medium tracking-widest uppercase mb-5"
            >
              Navigation
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl">
              {NAV_ITEMS.map((item, i) => {
                const isActive = currentView === item.id;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 0.1 + i * 0.04,
                      duration: 0.4,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    onClick={() => handleSelect(item.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex flex-col items-start p-5 rounded-2xl border text-left cursor-pointer transition-all overflow-hidden group ${
                      item.featured ? 'md:col-span-1' : ''
                    } ${isActive
                        ? `bg-gradient-to-br ${item.gradient} ${item.border}`
                        : 'bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                    )}

                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: item.color + '18', border: `1px solid ${item.color}25` }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>

                    {/* Text */}
                    <div className="text-sm font-semibold text-white mb-0.5">{item.label}</div>
                    <div className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors">{item.subtitle}</div>

                    {/* Arrow */}
                    <ChevronRight
                      className="absolute bottom-4 right-4 w-4 h-4 text-gray-700 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
                    />

                    {/* Featured badge */}
                    {item.featured && (
                      <div className="absolute top-3 left-3 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase"
                        style={{ background: item.color + '20', color: item.color }}>
                        IA
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Footer - logout */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative z-10 px-6 md:px-10 py-5 border-t border-white/[0.05] flex items-center justify-between"
          >
            <span className="text-gray-700 text-xs font-mono">LuminaOS v2.0.4-stable</span>
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/8 border border-rose-500/20 text-rose-400 text-sm hover:bg-rose-500/15 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
