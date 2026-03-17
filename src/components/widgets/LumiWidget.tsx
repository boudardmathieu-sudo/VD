import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, RefreshCw, Cpu } from 'lucide-react';

interface Message {
  role: 'user' | 'lumi';
  content: string;
  ts: number;
}

const SUGGESTIONS = [
  "Comment améliorer ma productivité ?",
  "Conseille-moi une routine journalière",
  "Explique-moi la technique Pomodoro",
  "Aide-moi à organiser mes habitudes",
  "Quel est le meilleur moment pour travailler ?",
  "Quelles sont tes capacités ?",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          className="w-1.5 h-1.5 rounded-full bg-amber-400"
        />
      ))}
    </div>
  );
}

export const LumiWidget = ({ userName }: { userName: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput('');
    setError('');

    const userMsg: Message = { role: 'user', content: msg, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'lumi' ? 'assistant' : 'user',
        content: m.content,
      }));

      const res = await fetch('/api/lumi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          context: {
            userName,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
          },
        }),
      });

      if (!res.ok) throw new Error('Réponse serveur invalide');
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'lumi', content: data.reply, ts: Date.now() }]);
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion à LUMI');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const clearChat = () => { setMessages([]); setError(''); };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto h-[calc(100vh-200px)] min-h-[500px]">
      {/* LUMI header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          {/* Animated LUMI avatar */}
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-amber-400 blur-md"
            />
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">LUMI</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20 font-bold tracking-widest">IA PERSONNELLE</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              En ligne — LuminaOS v2.0.4
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-white/5">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {/* Empty state */}
        {messages.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center py-10"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl mb-5"
            >
              ✨
            </motion.div>
            <h3 className="text-white font-semibold text-lg mb-1">Bonjour, {userName}</h3>
            <p className="text-gray-500 text-sm max-w-xs mb-8">
              Je suis LUMI, votre IA personnelle intégrée à LuminaOS. Comment puis-je vous aider ?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <motion.div
            key={msg.ts}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
              msg.role === 'lumi'
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md'
                : 'bg-white/10 border border-white/10 text-gray-300'
            }`}>
              {msg.role === 'lumi' ? <Sparkles className="w-3.5 h-3.5" /> : userName[0].toUpperCase()}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-white/[0.06] border border-white/[0.08] text-white rounded-tr-sm'
                : 'bg-amber-500/8 border border-amber-500/15 text-gray-200 rounded-tl-sm'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-gray-600 text-right' : 'text-amber-600'}`}>
                {msg.role === 'lumi' ? '⚡ LUMI' : 'Vous'} · {new Date(msg.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-amber-500/8 border border-amber-500/15 rounded-2xl rounded-tl-sm px-4 py-3">
              <TypingDots />
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-2.5 ml-10">
            ⚠ {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="relative">
        <div className="flex gap-2 items-end bg-white/[0.03] border border-white/[0.08] rounded-2xl p-2 focus-within:border-amber-500/30 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Demandez quelque chose à LUMI…"
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-700 focus:outline-none resize-none px-2 py-1.5 max-h-32"
            style={{ scrollbarWidth: 'none' }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: input.trim() && !loading ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'rgba(255,255,255,0.05)' }}
          >
            {loading
              ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Cpu className="w-4 h-4 text-amber-400" /></motion.div>
              : <Send className="w-4 h-4 text-white" />
            }
          </motion.button>
        </div>
        <div className="text-[10px] text-gray-700 text-center mt-2">
          Entrée pour envoyer · Shift+Entrée pour nouvelle ligne
        </div>
      </div>
    </div>
  );
};
