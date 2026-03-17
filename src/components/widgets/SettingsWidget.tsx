import React, { useState, useEffect } from "react";
import { Settings, Layout, Users, Plus, Trash2, MessageSquare, Save } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { User } from "../../App";

export const SettingsWidget = ({ currentUser }: { currentUser: User }) => {
  const [style, setStyle] = useState("toast");
  
  const [users, setUsers] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [discordToken, setDiscordToken] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [savedConfig, setSavedConfig] = useState(false);

  useEffect(() => {
    if (currentUser.role === 'admin') {
      fetch('/api/users').then(r => r.json()).then(setUsers);
      fetch('/api/config').then(r => r.json()).then(data => {
        if (data.discordBotToken) setDiscordToken(data.discordBotToken);
        if (data.discordWebhook) setDiscordWebhook(data.discordWebhook);
      });
    }
  }, [currentUser]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;
    
    if (newUsername.toLowerCase() === 'mat') {
      alert("Ce nom d'utilisateur est réservé.");
      return;
    }

    const newUser = { username: newUsername, password: newPassword, role: "user" };
    
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });

    setUsers([...users, newUser]);
    setNewUsername("");
    setNewPassword("");
  };

  const handleDeleteUser = async (usernameToDelete: string) => {
    if (usernameToDelete === 'Mat') return; 
    
    await fetch(`/api/users/${usernameToDelete}`, { method: 'DELETE' });
    setUsers(users.filter(u => u.username !== usernameToDelete));
  };

  const saveDiscordConfig = async () => {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordBotToken: discordToken, discordWebhook: discordWebhook })
    });
    setSavedConfig(true);
    setTimeout(() => setSavedConfig(false), 3000);
  };

  return (
    <div className="space-y-6">
      <GlassCard delay={0.1} className="flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-gray-400" />
          <h3 className="text-white font-medium text-lg">Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <Layout className="w-4 h-4" /> Style d'affichage
            </label>
            <select 
              value={style} 
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-black/20 text-white text-sm border border-white/10 rounded-lg p-2 outline-none cursor-pointer"
            >
              <option value="toast">Toast (En haut à droite)</option>
              <option value="modal">Modal (Au centre)</option>
              <option value="banner">Bannière (En haut)</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {currentUser.role === 'admin' && (
        <>
          <GlassCard delay={0.15} className="flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-[#5865F2]" />
              <h3 className="text-white font-medium text-lg">Configuration Discord</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Token du Bot (Pour les statistiques)</label>
                <input 
                  type="password" 
                  value={discordToken}
                  onChange={(e) => setDiscordToken(e.target.value)}
                  placeholder="MTE2..." 
                  className="w-full bg-black/20 text-white text-sm border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#5865F2]/50"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">URL du Webhook (Pour envoyer des messages)</label>
                <input 
                  type="password" 
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..." 
                  className="w-full bg-black/20 text-white text-sm border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#5865F2]/50"
                />
              </div>
              <button 
                onClick={saveDiscordConfig}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {savedConfig ? "Sauvegardé !" : "Sauvegarder la configuration"}
              </button>
            </div>
          </GlassCard>

          <GlassCard delay={0.2} className="flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-rose-400" />
              <h3 className="text-white font-medium text-lg">Gestion des Utilisateurs</h3>
            </div>
            
            <div className="space-y-6">
              <form onSubmit={handleAddUser} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nom d'utilisateur" 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="flex-1 bg-black/20 text-white text-sm border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-rose-500/50"
                />
                <input 
                  type="password" 
                  placeholder="Mot de passe" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 bg-black/20 text-white text-sm border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-rose-500/50"
                />
                <button 
                  type="submit"
                  disabled={!newUsername.trim() || !newPassword.trim()}
                  className="bg-rose-500 hover:bg-rose-600 disabled:bg-white/10 disabled:text-gray-500 text-white px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Ajouter</span>
                </button>
              </form>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Comptes enregistrés</label>
                <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
                  {users.map((u, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 ${index !== users.length - 1 ? 'border-b border-white/5' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${u.role === 'admin' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 text-gray-300'}`}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{u.username}</p>
                          <p className="text-gray-500 text-xs">{u.role === 'admin' ? 'Administrateur' : 'Utilisateur standard'}</p>
                        </div>
                      </div>
                      
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => handleDeleteUser(u.username)}
                          className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
};
