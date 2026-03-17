import React, { useState, useEffect } from "react";
import { Link as LinkIcon, Plus, Trash2, ExternalLink, Globe } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { User } from "../../App";

export const QuickLinksWidget = ({ currentUser }: { currentUser: User }) => {
  const [links, setLinks] = useState<{name: string, url: string}[]>(() => {
    const saved = localStorage.getItem('lumina_quicklinks');
    return saved ? JSON.parse(saved) : [
      { name: "Router", url: "http://192.168.1.1" },
      { name: "GitHub", url: "https://github.com" },
      { name: "YouTube", url: "https://youtube.com" },
      { name: "Proxmox", url: "https://192.168.1.100:8006" }
    ];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    localStorage.setItem('lumina_quicklinks', JSON.stringify(links));
  }, [links]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) return;
    let finalUrl = newUrl;
    if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;
    setLinks([...links, { name: newName, url: finalUrl }]);
    setNewName("");
    setNewUrl("");
    setIsAdding(false);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  return (
    <GlassCard delay={0.5} className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-blue-400" />
          <h3 className="text-white font-medium text-lg">Raccourcis</h3>
        </div>
        {currentUser.role === 'admin' && (
          <button onClick={() => setIsAdding(!isAdding)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {isAdding && currentUser.role === 'admin' && (
        <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-2">
          <input type="text" placeholder="Nom (ex: NAS)" value={newName} onChange={e => setNewName(e.target.value)} className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500/50" />
          <input type="text" placeholder="URL (ex: 192.168.1.50)" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500/50" />
          <button type="submit" className="bg-blue-500/20 text-blue-300 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors">Ajouter</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto max-h-[220px] pr-1 custom-scrollbar">
        {links.map((link, i) => (
          <div key={i} className="group relative flex items-center justify-between bg-black/20 hover:bg-white/5 border border-white/5 rounded-xl p-3 transition-colors">
            <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 overflow-hidden flex-1">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-3 h-3 text-gray-300" />
              </div>
              <span className="text-sm text-gray-200 truncate">{link.name}</span>
            </a>
            {currentUser.role === 'admin' && (
              <button onClick={() => removeLink(i)} className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all bg-[#1a1a1a]">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
