import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, RefreshCw, Check, ArrowLeftRight, Lock } from "lucide-react";

type Tab = 'password' | 'converter' | 'base64';

const UNITS: Record<string, { label: string; to: (v: number) => string }[]> = {
  Longueur: [
    { label: 'Mètres (m)', to: v => v.toFixed(4) },
    { label: 'Pieds (ft)', to: v => (v * 3.28084).toFixed(4) },
    { label: 'Pouces (in)', to: v => (v * 39.3701).toFixed(4) },
    { label: 'Kilomètres (km)', to: v => (v / 1000).toFixed(6) },
    { label: 'Miles (mi)', to: v => (v * 0.000621371).toFixed(6) },
  ],
  Température: [
    { label: 'Celsius (°C)', to: v => v.toFixed(2) },
    { label: 'Fahrenheit (°F)', to: v => (v * 9/5 + 32).toFixed(2) },
    { label: 'Kelvin (K)', to: v => (v + 273.15).toFixed(2) },
  ],
  Poids: [
    { label: 'Kilogrammes (kg)', to: v => v.toFixed(4) },
    { label: 'Livres (lb)', to: v => (v * 2.20462).toFixed(4) },
    { label: 'Onces (oz)', to: v => (v * 35.274).toFixed(4) },
    { label: 'Grammes (g)', to: v => (v * 1000).toFixed(2) },
  ],
};

function PasswordGen() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    let chars = '';
    if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
    const arr = crypto.getRandomValues(new Uint32Array(length));
    setPassword(Array.from(arr).map(x => chars[x % chars.length]).join(''));
  };

  const copy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = () => {
    let score = 0;
    if (upper && lower) score++;
    if (numbers) score++;
    if (symbols) score++;
    if (length >= 12) score++;
    if (length >= 20) score++;
    return score;
  };

  const s = strength();
  const sLabel = ['', 'Faible', 'Faible', 'Moyen', 'Fort', 'Très fort'][s] || '';
  const sColor = ['', '#f43f5e', '#f97316', '#fbbf24', '#34d399', '#22d3ee'][s] || '#fff';

  return (
    <div className="space-y-5">
      {/* Password display */}
      <div className="relative">
        <div className="bg-black/40 border border-white/[0.08] rounded-xl p-4 font-mono text-sm text-white break-all min-h-[52px] pr-10 leading-relaxed tracking-wider">
          {password || <span className="text-gray-700">Clique sur "Générer"</span>}
        </div>
        <button onClick={copy} className="absolute top-3 right-3 text-gray-600 hover:text-white transition-colors cursor-pointer">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Strength indicator */}
      {password && (
        <div className="flex items-center gap-3">
          <div className="flex gap-1 flex-1">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= s ? sColor : 'rgba(255,255,255,0.05)' }} />
            ))}
          </div>
          <span className="text-xs font-medium" style={{ color: sColor }}>{sLabel}</span>
        </div>
      )}

      {/* Length slider */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Longueur</span>
          <span className="text-white font-mono font-medium">{length}</span>
        </div>
        <input
          type="range" min={6} max={64} value={length}
          onChange={e => setLength(+e.target.value)}
          className="w-full h-1.5 rounded-full bg-white/10 appearance-none cursor-pointer accent-rose-500"
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Majuscules', state: upper, set: setUpper },
          { label: 'Minuscules', state: lower, set: setLower },
          { label: 'Chiffres',   state: numbers, set: setNumbers },
          { label: 'Symboles',   state: symbols, set: setSymbols },
        ].map(({ label, state, set }) => (
          <button key={label} onClick={() => set(!state)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer border ${
              state ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' : 'bg-white/[0.03] border-white/[0.06] text-gray-500 hover:text-gray-300'
            }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${state ? 'bg-rose-400' : 'bg-gray-700'}`} />
            {label}
          </button>
        ))}
      </div>

      <button onClick={generate}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.25)]">
        <RefreshCw className="w-4 h-4" />
        Générer
      </button>
    </div>
  );
}

function Converter() {
  const [category, setCategory] = useState('Longueur');
  const [value, setValue] = useState('1');

  const v = parseFloat(value) || 0;
  const units = UNITS[category];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Object.keys(UNITS).map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
              category === cat ? 'bg-violet-500/20 border-violet-500/30 text-violet-300' : 'bg-white/[0.03] border-white/[0.06] text-gray-600 hover:text-gray-300'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full bg-black/40 border border-white/[0.08] rounded-xl py-3 px-4 text-white text-lg font-light placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
          placeholder="Valeur…"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">{units[0].label.split(' ')[0]}</span>
      </div>

      <div className="space-y-2">
        {units.map((unit, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <span className="text-gray-500 text-sm">{unit.label}</span>
            <span className="text-white font-mono text-sm">{isNaN(v) ? '—' : unit.to(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Base64Tool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  const output = (() => {
    try {
      return mode === 'encode' ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input)));
    } catch { return '⚠ Entrée invalide'; }
  })();

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['encode', 'decode'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
              mode === m ? 'bg-sky-500/15 border-sky-500/30 text-sky-300' : 'bg-white/[0.03] border-white/[0.06] text-gray-600 hover:text-gray-300'
            }`}>
            {m === 'encode' ? 'Encoder' : 'Décoder'}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={4}
        placeholder={mode === 'encode' ? 'Texte à encoder…' : 'Base64 à décoder…'}
        className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-3.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/40 resize-none font-mono"
      />

      <div className="flex items-start gap-2">
        <div className="flex-1 bg-black/30 border border-white/[0.06] rounded-xl p-3.5 text-sm font-mono text-gray-300 break-all min-h-[60px]">
          {output || <span className="text-gray-700">Résultat</span>}
        </div>
        <button onClick={copy} className="mt-1 text-gray-600 hover:text-white transition-colors cursor-pointer p-1">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'password',  label: 'Mot de passe', icon: Lock },
  { id: 'converter', label: 'Convertisseur', icon: ArrowLeftRight },
  { id: 'base64',    label: 'Base64',        icon: RefreshCw },
];

export const ToolsWidget = () => {
  const [tab, setTab] = useState<Tab>('password');

  return (
    <div className="w-full max-w-md mx-auto py-6 px-4">
      {/* Tab bar */}
      <div className="flex gap-2 mb-6 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              tab === t.id ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'password'  && <PasswordGen />}
          {tab === 'converter' && <Converter />}
          {tab === 'base64'    && <Base64Tool />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
