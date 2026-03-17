import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Brain, Cpu, ChevronRight, Bell, Trash2, MemoryStick, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'lumy';
  content: string;
  ts: number;
  intent?: string;
  commands?: any[];
}

interface FridayWidgetProps {
  userName: string;
  onNavigate?: (view: string) => void;
}

const SUGGESTIONS = [
  'Bilan du jour',
  'Mes habitudes',
  'Lance un Pomodoro',
  'Donne-moi un conseil',
  'Tu te souviens de quoi ?',
  'Quelle heure est-il ?',
];

function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const boldLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    if (line.startsWith('**') && line.endsWith('**')) {
      return <div key={i} className="font-semibold text-white mb-1" dangerouslySetInnerHTML={{ __html: boldLine }} />;
    }
    if (line.startsWith('•') || line.startsWith('-')) {
      return <div key={i} className="pl-3 text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: boldLine }} />;
    }
    if (line.trim() === '') return <div key={i} className="h-1.5" />;
    return <div key={i} className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: boldLine }} />;
  });
}

export const FridayWidget = ({ userName, onNavigate }: FridayWidgetProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'lumy',
      content: `Systèmes actifs, ${userName}. Je suis **Lumy** — votre intelligence personnelle intégrée à LuminaOS.\n\nJe mémorise tout ce que vous faites et me dites. Aucune donnée ne sort de votre système. Comment puis-je vous assister ?`,
      ts: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [memoryCount, setMemoryCount] = useState(0);
  const [reminders, setReminders] = useState<any[]>([]);
  const [facts, setFacts] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    fetch('/api/friday/memory')
      .then(r => r.json())
      .then(d => {
        setMemoryCount(d.memoryCount || 0);
        setReminders(d.reminders?.filter((r: any) => !r.done) || []);
        setFacts(d.facts || {});
      }).catch(() => {});
  }, []);

  const getHabitsFromStorage = () => {
    try {
      const raw = localStorage.getItem('lumina_habits');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };

  const getPomodoroSessions = () => {
    try {
      return parseInt(sessionStorage.getItem('lumina_pomodoro_sessions') || '0');
    } catch { return 0; }
  };

  const sendMessage = async (text: string) => {
    const msg = text.trim();
    if (!msg) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const habits = getHabitsFromStorage();
      const now = new Date();
      const res = await fetch('/api/friday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          context: {
            userName,
            time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            date: now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            habits: habits.map((h: any) => ({
              name: h.name,
              completedToday: h.completedDates?.includes(new Date().toDateString()),
              streak: h.streak || 0,
            })),
            pomodoroSessions: getPomodoroSessions(),
          }
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMemoryCount(data.memoryCount || memoryCount + 2);

      const lumyMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'lumy',
        content: data.reply || 'Désolé, aucune réponse générée.',
        ts: Date.now(),
        intent: data.intent,
        commands: data.commands,
      };
      setMessages(prev => [...prev, lumyMsg]);

      fetch('/api/friday/memory').then(r => r.json()).then(d => {
        setFacts(d.facts || {});
        setReminders(d.reminders?.filter((r: any) => !r.done) || []);
      });
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'lumy',
        content: `Erreur système : ${e.message}`,
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const factLabels: Record<string, string> = { age: 'Âge', metier: 'Métier', ville: 'Ville', aime: 'Aime' };
  const knownFacts = Object.entries(facts);

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4" style={{ minHeight: '70vh' }}>

      {/* Left panel — Lumy info & memory */}
      <div className="md:w-72 flex-shrink-0 flex flex-col gap-3">

        {/* Lumy Identity Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-start gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-amber-400/30 blur-md"
              />
              <motion.div
                animate={{ boxShadow: ['0 0 10px rgba(251,191,36,0.2)', '0 0 25px rgba(251,191,36,0.5)', '0 0 10px rgba(251,191,36,0.2)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <div>
              <div className="text-white font-semibold text-lg leading-tight">Lumy</div>
              <div className="text-[11px] text-gray-600 leading-snug mt-0.5">Intelligence Personnelle<br/>LuminaOS v2.0</div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400">EN LIGNE — LOCAL</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MemoryStick className="w-3.5 h-3.5" />
                Mémoire
              </div>
              <span className="text-xs font-mono text-amber-400">{memoryCount} échanges</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Brain className="w-3.5 h-3.5" />
                Faits connus
              </div>
              <span className="text-xs font-mono text-amber-400">{knownFacts.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Bell className="w-3.5 h-3.5" />
                Rappels actifs
              </div>
              <span className="text-xs font-mono text-amber-400">{reminders.length}</span>
            </div>
          </div>
        </div>

        {/* Profil mémorisé */}
        {knownFacts.length > 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-[11px] font-mono text-gray-600 uppercase tracking-widest mb-3">Profil mémorisé</div>
            <div className="space-y-2">
              {knownFacts.map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{factLabels[key] || key}</span>
                  <span className="text-xs text-gray-300 font-medium truncate max-w-28 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rappels actifs */}
        {reminders.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
            <div className="text-[11px] font-mono text-amber-500/70 uppercase tracking-widest mb-3">Rappels</div>
            <div className="space-y-2">
              {reminders.slice(0, 4).map((r: any) => (
                <div key={r.id} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                  <div>
                    <div className="text-xs text-gray-300">{r.text}</div>
                    <div className="text-[10px] text-gray-600">{new Date(r.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions desktop */}
        <div className="hidden md:block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="text-[11px] font-mono text-gray-600 uppercase tracking-widest mb-3">Suggestions</div>
          <div className="space-y-1">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="w-full text-left text-xs text-gray-500 hover:text-white hover:bg-white/[0.04] px-3 py-2 rounded-lg transition-all flex items-center justify-between group cursor-pointer">
                {s}
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — conversation */}
      <div className="flex-1 flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">Conversation avec Lumy</span>
            <span className="text-[10px] font-mono text-gray-700 bg-white/[0.03] px-2 py-0.5 rounded-md">100% LOCAL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-gray-600">SANS API — SANS CLOUD</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.role === 'lumy'
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}>
                {msg.role === 'lumy' ? <Sparkles className="w-3.5 h-3.5" /> : userName[0].toUpperCase()}
              </div>

              {/* Bubble */}
              <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-rose-500/15 border border-rose-500/20 text-white rounded-tr-md'
                  : 'bg-amber-500/[0.06] border border-amber-500/[0.12] rounded-tl-md'
              }`}>
                {msg.role === 'lumy' ? (
                  <div className="space-y-0.5">{parseMarkdown(msg.content)}</div>
                ) : (
                  <span className="text-white">{msg.content}</span>
                )}

                {/* Intent badge */}
                {msg.intent && msg.intent !== 'UNKNOWN' && (
                  <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">{msg.intent}</span>
                    <span className="text-[9px] text-gray-700">{new Date(msg.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-amber-500/[0.06] border border-amber-500/[0.12] rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      className="w-1.5 h-1.5 rounded-full bg-amber-400"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Suggestions mobile */}
        <div className="md:hidden flex-shrink-0 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {SUGGESTIONS.slice(0, 4).map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className="flex-shrink-0 text-xs text-gray-500 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap">
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-4 border-t border-white/[0.04]">
          <div className="flex gap-3 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Parlez à Lumy…"
              disabled={loading}
              className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-amber-500/40 focus:bg-white/[0.06] transition-all disabled:opacity-50"
            />
            <motion.button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center hover:bg-amber-500/30 transition-all disabled:opacity-30 cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
