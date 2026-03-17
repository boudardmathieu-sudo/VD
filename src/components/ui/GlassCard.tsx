import React from "react";
import { motion } from "motion/react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  accent?: "rose" | "violet" | "none";
}

export const GlassCard = ({ children, className = "", delay = 0, accent = "none" }: GlassCardProps) => {
  const accentBorder =
    accent === "rose"
      ? "border-rose-500/20"
      : accent === "violet"
      ? "border-violet-500/20"
      : "border-white/[0.06]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      className={`relative rounded-2xl border ${accentBorder} bg-white/[0.03] backdrop-blur-2xl overflow-hidden shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_20px_40px_rgba(0,0,0,0.4)] ${className}`}
    >
      {/* Top highlight line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Inner content */}
      <div className="relative z-10 p-6 h-full">
        {children}
      </div>
    </motion.div>
  );
};
