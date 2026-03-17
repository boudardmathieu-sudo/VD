import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Cpu, HardDrive, Activity, Server, Link as LinkIcon, Check, X, AlertTriangle } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { User } from "../../App";

export const SystemStatsWidget = ({ currentUser }: { currentUser: User }) => {
  const [cpu, setCpu] = useState(12);
  const [ram, setRam] = useState(45);
  const [storage, setStorage] = useState({ used: 2.1, total: 4.0 });
  
  const [zimaIp, setZimaIp] = useState("");
  const [connected, setConnected] = useState(false);
  
  const [showIpInput, setShowIpInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(data => {
      if (data && data.zimaIp) {
        setZimaIp(data.zimaIp);
        setConnected(true);
      }
    });
  }, []);

  useEffect(() => {
    let sysTimer: number;

    if (connected && zimaIp) {
      const fetchRealData = async () => {
        try {
          // Utilisation du proxy backend pour contourner le CORS
          const res = await fetch(`/api/zimaos?ip=${encodeURIComponent(zimaIp)}`);
          
          if (res.ok) {
            const data = await res.json();
            if (data && data.data) {
              const cpuPercent = data.data.cpu?.percent ?? data.data.cpu?.usage ?? 0;
              const memUsed = data.data.mem?.used ?? 0;
              const memTotal = data.data.mem?.total ?? 1;
              const diskUsed = (data.data.disk?.used ?? 0) / (1024 ** 4);
              const diskTotal = (data.data.disk?.total ?? 1) / (1024 ** 4);

              setCpu(cpuPercent);
              setRam((memUsed / memTotal) * 100);
              if (diskTotal > 0) {
                setStorage({ used: diskUsed, total: diskTotal });
              }
              setError(null);
            }
          } else {
            setError("Erreur API ZimaOS");
          }
        } catch (e) {
          setError("Erreur réseau (IP injoignable)");
          setCpu(0);
          setRam(0);
        }
      };

      fetchRealData();
      sysTimer = window.setInterval(fetchRealData, 2000);
    } else {
      setError(null);
      sysTimer = window.setInterval(() => {
        setCpu(prev => Math.max(5, Math.min(95, prev + (Math.random() * 10 - 5))));
        setRam(prev => Math.max(20, Math.min(80, prev + (Math.random() * 4 - 2))));
      }, 2000);
    }

    return () => clearInterval(sysTimer);
  }, [connected, zimaIp]);

  const handleConnect = async () => {
    if (currentUser.role !== 'admin') return;
    if (zimaIp.trim() !== "") {
      setConnected(true);
      setShowIpInput(false);
      setError(null);
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zimaIp })
      });
    }
  };

  const handleDisconnect = async () => {
    if (currentUser.role !== 'admin') return;
    setConnected(false);
    setZimaIp("");
    setError(null);
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zimaIp: "" })
    });
  };

  return (
    <GlassCard delay={0.3} className="md:col-span-2 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Server className="w-6 h-6 text-purple-400" />
          <h3 className="text-white font-medium text-lg">État du Système</h3>
        </div>
        
        <div className="flex items-center">
          {currentUser.role === 'admin' ? (
            <>
              {!connected && !showIpInput && (
                <button 
                  onClick={() => setShowIpInput(true)}
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3" />
                  Lier ZimaOS
                </button>
              )}

              {showIpInput && !connected && (
                <div className="flex items-center gap-2 bg-black/40 p-1 rounded-full border border-white/10">
                  <input 
                    type="text" 
                    placeholder="IP (ex: 192.168.1.100)" 
                    value={zimaIp}
                    onChange={(e) => setZimaIp(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                    className="bg-transparent text-white text-xs px-2 py-1 outline-none w-32 placeholder-gray-600"
                    autoFocus
                  />
                  <button onClick={handleConnect} className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full hover:bg-emerald-500/40 cursor-pointer">
                    <Check className="w-3 h-3" />
                  </button>
                  <button onClick={() => setShowIpInput(false)} className="p-1 bg-rose-500/20 text-rose-400 rounded-full hover:bg-rose-500/40 cursor-pointer mr-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {connected && (
                <button 
                  onClick={handleDisconnect}
                  className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                    error 
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' 
                      : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  }`}
                  title={`Connecté à ${zimaIp} (Cliquez pour déconnecter)`}
                >
                  {error ? <AlertTriangle className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                  {error ? 'Erreur de liaison' : 'ZimaOS Connecté'}
                </button>
              )}
            </>
          ) : (
            connected && (
              <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
                error 
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' 
                  : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
              }`}>
                {error ? <AlertTriangle className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                {error ? 'Erreur de liaison' : 'ZimaOS Connecté'}
              </div>
            )
          )}
        </div>
      </div>
      
      <div className="space-y-5 relative">
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl border border-rose-500/20">
            <div className="text-center p-4">
              <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <p className="text-sm text-rose-300 font-medium">{error}</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                Le proxy n'arrive pas à joindre l'IP ZimaOS.
              </p>
            </div>
          </div>
        )}

        {/* CPU */}
        <div className={error ? 'opacity-30 blur-sm' : ''}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-400 flex items-center gap-2"><Cpu className="w-4 h-4" /> CPU</span>
            <span className="text-white font-mono">{cpu.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5 relative">
            <motion.div 
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full"
              animate={{ width: `${cpu}%` }}
              transition={{ ease: "linear", duration: connected ? 0.5 : 2 }}
            />
            {!error && (
              <motion.div 
                className="absolute top-0 left-0 bottom-0 bg-white/30 rounded-full"
                animate={{ width: `${cpu}%`, opacity: [0, 0.6, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              />
            )}
          </div>
        </div>

        {/* RAM */}
        <div className={error ? 'opacity-30 blur-sm' : ''}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-400 flex items-center gap-2"><Activity className="w-4 h-4" /> RAM</span>
            <span className="text-white font-mono">{ram.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5 relative">
            <motion.div 
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              animate={{ width: `${ram}%` }}
              transition={{ ease: "linear", duration: connected ? 0.5 : 2 }}
            />
            {!error && (
              <motion.div 
                className="absolute top-0 left-0 bottom-0 bg-white/30 rounded-full"
                animate={{ width: `${ram}%`, opacity: [0, 0.4, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
            )}
          </div>
        </div>

        {/* Storage */}
        <div className={error ? 'opacity-30 blur-sm' : ''}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-400 flex items-center gap-2"><HardDrive className="w-4 h-4" /> Stockage</span>
            <span className="text-white font-mono">{storage.used.toFixed(1)} TB / {storage.total.toFixed(1)} TB</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5 relative">
            <motion.div 
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" 
              animate={{ width: `${(storage.used/storage.total)*100}%` }}
              transition={{ ease: "linear", duration: 0.5 }}
            />
            {!error && (
              <motion.div 
                className="absolute top-0 left-0 bottom-0 bg-white/30 rounded-full"
                animate={{ width: `${(storage.used/storage.total)*100}%`, opacity: [0, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              />
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
