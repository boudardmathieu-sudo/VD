import React, { useState, useEffect } from "react";
import { Home, Lightbulb, Power, Link as LinkIcon } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { User } from "../../App";

export const SmartHomeWidget = ({ currentUser }: { currentUser: User }) => {
  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState({
    salon: true,
    chambre: false,
    bureau: true,
    tv: false
  });

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(data => {
      if (data && data.googleHomeConnected !== undefined) {
        setConnected(data.googleHomeConnected);
      }
    });
  }, []);

  const toggleDevice = (key: keyof typeof devices) => {
    setDevices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const connectGoogleHome = async () => {
    if (currentUser.role !== 'admin') return;
    const newState = !connected;
    setConnected(newState);
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleHomeConnected: newState })
    });
  };

  return (
    <GlassCard delay={0.4} className="md:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Home className="w-6 h-6 text-rose-400" />
          <h3 className="text-white font-medium text-lg">Maison Connectée</h3>
        </div>
        
        {currentUser.role === 'admin' ? (
          <button 
            onClick={connectGoogleHome}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${connected ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
          >
            <LinkIcon className="w-3 h-3" />
            {connected ? 'Google Home Lié' : 'Lier Google Home'}
          </button>
        ) : (
          connected && (
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border bg-blue-500/20 border-blue-500/50 text-blue-300">
              <LinkIcon className="w-3 h-3" />
              Google Home Lié
            </div>
          )
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { id: 'salon', label: 'Salon', icon: Lightbulb },
          { id: 'chambre', label: 'Chambre', icon: Lightbulb },
          { id: 'bureau', label: 'Bureau', icon: Lightbulb },
          { id: 'tv', label: 'TV', icon: Power },
        ].map((device) => {
          const isActive = devices[device.id as keyof typeof devices];
          const Icon = device.icon;
          return (
            <button
              key={device.id}
              onClick={() => toggleDevice(device.id as keyof typeof devices)}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border cursor-pointer ${
                isActive 
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.2)]' 
                  : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-rose-400' : 'text-gray-500'}`} />
              <span className="text-sm font-medium">{device.label}</span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
};
