import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Flame, CheckCircle2, Circle, Trophy } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  doneToday: boolean;
  streak: number;
  lastDone: string; // date string
}

const COLORS = ['#f43f5e','#fb923c','#fbbf24','#34d399','#38bdf8','#a78bfa'];
const EMOJIS = ['💪','📚','🏃','💧','🧘','🎯','🍎','🌙','✍️','🎨'];

const today = () => new Date().toISOString().slice(0, 10);

function loadHabits(): Habit[] {
  try {
    const data = localStorage.getItem('lumina_habits');
    if (!data) return [];
    const habits: Habit[] = JSON.parse(data);
    // Reset doneToday if it's a new day
    return habits.map(h => ({
      ...h,
      doneToday: h.lastDone === today() ? h.doneToday : false,
    }));
  } catch { return []; }
}

function saveHabits(habits: Habit[]) {
  localStorage.setItem('lumina_habits', JSON.stringify(habits));
}

export const HabitWidget = () => {
  const [habits, setHabits] = useState<Habit[]>(loadHabits);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('💪');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [adding, setAdding] = useState(false);

  const doneCount = habits.filter(h => h.doneToday).length;
  const allDone = habits.length > 0 && doneCount === habits.length;

  const update = (updated: Habit[]) => {
    setHabits(updated);
    saveHabits(updated);
  };

  const toggle = (id: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    update(habits.map(h => {
      if (h.id !== id) return h;
      const nowDone = !h.doneToday;
      const streak = nowDone
        ? (h.lastDone === yStr || h.lastDone === today() ? h.streak + (h.doneToday ? 0 : 1) : 1)
        : Math.max(0, h.streak - 1);
      return { ...h, doneToday: nowDone, streak, lastDone: today() };
    }));
  };

  const addHabit = () => {
    if (!newName.trim()) return;
    const habit: Habit = {
      id: Date.now().toString(),
      name: newName.trim(),
      emoji: newEmoji,
      color: newColor,
      doneToday: false,
      streak: 0,
      lastDone: '',
    };
    update([...habits, habit]);
    setNewName('');
    setAdding(false);
  };

  const remove = (id: string) => update(habits.filter(h => h.id !== id));

  return (
    <div className="w-full max-w-md mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Mes habitudes</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {allDone && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-xl"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Parfait !</span>
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      {habits.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{doneCount}/{habits.length} complétées</span>
            <span>{Math.round((doneCount / habits.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 to-violet-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${habits.length > 0 ? (doneCount / habits.length) * 100 : 0}%` }}
              transition={{ ease: 'easeOut', duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Habit list */}
      <div className="space-y-2.5 mb-5">
        <AnimatePresence>
          {habits.map(habit => (
            <motion.div
              key={habit.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                habit.doneToday
                  ? 'bg-white/[0.04] border-white/5'
                  : 'bg-black/20 border-white/[0.06]'
              }`}
            >
              <button onClick={() => toggle(habit.id)} className="cursor-pointer flex-shrink-0">
                {habit.doneToday
                  ? <CheckCircle2 className="w-6 h-6" style={{ color: habit.color }} />
                  : <Circle className="w-6 h-6 text-gray-600 hover:text-gray-400 transition-colors" />
                }
              </button>

              <span className="text-xl">{habit.emoji}</span>

              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium transition-all ${habit.doneToday ? 'text-gray-400 line-through' : 'text-white'}`}>
                  {habit.name}
                </span>
              </div>

              {habit.streak > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: habit.color + '18' }}>
                  <Flame className="w-3 h-3" style={{ color: habit.color }} />
                  <span className="text-xs font-semibold" style={{ color: habit.color }}>{habit.streak}</span>
                </div>
              )}

              <button onClick={() => remove(habit.id)} className="text-gray-700 hover:text-rose-400 transition-colors cursor-pointer ml-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {habits.length === 0 && !adding && (
          <div className="text-center py-10 text-gray-600 text-sm">
            <div className="text-3xl mb-3">🎯</div>
            <p>Aucune habitude pour l'instant.</p>
            <p className="text-xs mt-1 text-gray-700">Ajoutes-en une pour commencer !</p>
          </div>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-3"
          >
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHabit()}
              placeholder="Nom de l'habitude…"
              className="w-full bg-black/30 border border-white/[0.08] rounded-xl py-2.5 px-3.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setNewEmoji(e)}
                  className={`text-xl rounded-lg p-1.5 transition-all cursor-pointer ${newEmoji === e ? 'bg-white/15 ring-1 ring-white/30' : 'hover:bg-white/8'}`}>
                  {e}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)}
                  className={`w-6 h-6 rounded-full cursor-pointer transition-all ${newColor === c ? 'ring-2 ring-offset-1 ring-offset-black ring-white/50 scale-110' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={addHabit}
                className="flex-1 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm font-medium hover:bg-rose-500/30 transition-all cursor-pointer">
                Ajouter
              </button>
              <button onClick={() => setAdding(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition-all cursor-pointer">
                Annuler
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="w-full py-3 rounded-xl border border-dashed border-white/10 text-gray-600 text-sm hover:border-white/20 hover:text-gray-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nouvelle habitude
        </button>
      )}
    </div>
  );
};
