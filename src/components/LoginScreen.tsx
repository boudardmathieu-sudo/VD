import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User as UserIcon, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { User as UserType } from "../App";

export const LoginScreen = ({ onLogin }: { onLogin: (u: UserType) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch('/api/users');
      const storedUsers = await res.json();
      const user = storedUsers.find((u: any) => u.username === username && u.password === password);

      if (user) {
        onLogin({ username: user.username, role: user.role });
      } else {
        setError("Identifiants incorrects");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm px-4 z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-violet-500/10 border border-rose-500/20 mb-5 shadow-[0_0_40px_rgba(244,63,94,0.15)]"
          >
            <span className="text-2xl font-bold text-white">
              L<span className="text-rose-400 font-light">OS</span>
            </span>
          </motion.div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Lumina<span className="text-rose-400 font-light">OS</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1.5">Connexion à votre espace</p>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Top line */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          <form onSubmit={handleSubmit} className="p-7 space-y-4">
            {/* Username field */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium tracking-wide uppercase pl-1">
                Utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-gray-600" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  className="w-full bg-black/30 border border-white/[0.08] rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/40 transition-all"
                  placeholder="Votre nom d'utilisateur"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium tracking-wide uppercase pl-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-600" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full bg-black/30 border border-white/[0.08] rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/40 transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-2.5"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full mt-2 relative group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-600 to-violet-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-violet-600 text-white font-medium py-3 rounded-xl text-sm transition-transform group-hover:scale-[1.01] group-active:scale-[0.99]">
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
