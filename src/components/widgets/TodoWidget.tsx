import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, Circle, CheckCircle2 } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export const TodoWidget = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('lumina_todos');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Vérifier les logs du serveur', completed: false },
      { id: '2', text: 'Mettre à jour LuminaOS', completed: true },
      { id: '3', text: 'Sauvegarder la base de données', completed: false }
    ];
  });
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    localStorage.setItem('lumina_todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([{ id: Date.now().toString(), text: newTodo, completed: false }, ...todos]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <GlassCard delay={0.7} className="flex flex-col md:col-span-2">
      <div className="flex items-center gap-3 mb-4">
        <CheckSquare className="w-6 h-6 text-emerald-400" />
        <h3 className="text-white font-medium text-lg">Tâches</h3>
      </div>

      <form onSubmit={addTodo} className="mb-4 flex gap-2">
        <input 
          type="text" 
          placeholder="Nouvelle tâche..." 
          value={newTodo} 
          onChange={e => setNewTodo(e.target.value)} 
          className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-emerald-500/50" 
        />
        <button type="submit" disabled={!newTodo.trim()} className="bg-emerald-500/20 text-emerald-400 px-3 rounded-xl hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-2 overflow-y-auto max-h-[200px] pr-1 custom-scrollbar">
        {todos.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">Aucune tâche pour le moment.</p>
        ) : (
          todos.map(todo => (
            <div key={todo.id} className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${todo.completed ? 'bg-white/5 border-transparent' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
              <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleTodo(todo.id)}>
                {todo.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" /> : <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                <span className={`text-sm transition-all ${todo.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{todo.text}</span>
              </div>
              <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all ml-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
};
