import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard, Settings, Server, Home, LogOut,
  Timer, Calculator, CheckSquare, Wrench, Sparkles
} from 'lucide-react';
import logo from '../assets/logo.png';

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard, color: '#f43f5e' },
  { id: 'lumy',       label: 'Lumy',         icon: Sparkles,        color: '#fbbf24' },
  { id: 'home',       label: 'Maison',       icon: Home,            color: '#a78bfa' },
  { id: 'server',     label: 'Serveur',      icon: Server,          color: '#38bdf8' },
  { id: 'pomodoro',   label: 'Pomodoro',     icon: Timer,           color: '#fb923c' },
  { id: 'habits',     label: 'Habitudes',    icon: CheckSquare,     color: '#60a5fa' },
  { id: 'calculator', label: 'Calculette',   icon: Calculator,      color: '#34d399' },
  { id: 'tools',      label: 'Outils',       icon: Wrench,          color: '#f472b6' },
  { id: 'settings',   label: 'Paramètres',   icon: Settings,        color: '#94a3b8' },
];

interface SidebarProps {
  currentView: string;
  onViewChange: (v: string) => void;
  onLogout: () => void;
}

export const Sidebar = ({ currentView, onViewChange, onLogout }: SidebarProps) => {
  return (
    <div className="flex flex-col w-56 h-full bg-[#08080c]/95 border-r border-white/[0.05] backdrop-blur-2xl z-50 py-5 px-3">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-7">
        <img src={logo} alt="LuminaOS" className="w-8 h-8 object-contain" />
        <div>
          <span className="text-sm font-semibold text-white tracking-tight">
            Lumina<span className="text-rose-400 font-light">OS</span>
          </span>
          <div className="text-[9px] text-gray-700 font-mono tracking-widest uppercase">v2.0.4</div>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-2 mb-2">
        <span className="text-[10px] text-gray-600 font-medium tracking-widest uppercase">Navigation</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          const isActive = currentView === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 + 0.05 }}
              className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
                isActive
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: item.color + '18', border: `1px solid ${item.color}28` }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <item.icon
                className="relative w-4 h-4 flex-shrink-0"
                style={{ color: isActive ? item.color : undefined }}
              />
              <span className="relative">{item.label}</span>
              {isActive && (
                <div className="relative ml-auto w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="mt-2 flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:text-rose-400 hover:bg-rose-500/8 text-sm font-medium transition-all cursor-pointer border border-transparent hover:border-rose-500/15"
      >
        <LogOut className="w-4 h-4 flex-shrink-0" />
        <span>Déconnexion</span>
      </button>
    </div>
  );
};
