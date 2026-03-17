import React, { useState, useEffect } from "react";
import { Activity, Wifi, Download, Upload } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { motion } from "motion/react";

export const NetworkMonitorWidget = () => {
  const [ping, setPing] = useState(12);
  const [download, setDownload] = useState(850);
  const [upload, setUpload] = useState(420);

  useEffect(() => {
    const interval = setInterval(() => {
      setPing(prev => Math.max(8, Math.min(40, prev + (Math.random() * 6 - 3))));
      setDownload(prev => Math.max(100, Math.min(950, prev + (Math.random() * 100 - 50))));
      setUpload(prev => Math.max(50, Math.min(500, prev + (Math.random() * 50 - 25))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard delay={0.9} className="flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-cyan-400" />
          <h3 className="text-white font-medium text-lg">Réseau</h3>
        </div>
        <div className="flex items-center gap-2 text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
          <Wifi className="w-3 h-3" />
          Connecté
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {/* Ping */}
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-400">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Ping</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-mono">{ping.toFixed(0)}</span>
            <span className="text-xs text-gray-500">ms</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Download */}
          <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500/20">
              <motion.div className="h-full bg-cyan-400" animate={{ width: `${(download/1000)*100}%` }} transition={{ duration: 0.5 }} />
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="text-xs">Descendant</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold text-white font-mono">{download.toFixed(0)}</span>
              <span className="text-xs text-gray-500">Mbps</span>
            </div>
          </div>

          {/* Upload */}
          <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500/20">
              <motion.div className="h-full bg-purple-400" animate={{ width: `${(upload/1000)*100}%` }} transition={{ duration: 0.5 }} />
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Upload className="w-4 h-4 text-purple-400" />
              <span className="text-xs">Ascendant</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold text-white font-mono">{upload.toFixed(0)}</span>
              <span className="text-xs text-gray-500">Mbps</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
