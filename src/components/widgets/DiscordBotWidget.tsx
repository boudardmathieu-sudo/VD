import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Activity, Server, AlertTriangle } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

export const DiscordBotWidget = () => {
  const [botData, setBotData] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBotStatus = async () => {
    try {
      const res = await fetch('/api/discord/status');
      const data = await res.json();
      if (data.connected) {
        setBotData(data);
        setError(null);
      } else {
        setBotData(null);
        if (data.error) setError(data.error);
      }

      const configRes = await fetch('/api/config');
      const configData = await configRes.json();
      setWebhookUrl(configData.discordWebhook || null);
    } catch (e) {
      console.error("Erreur Discord:", e);
    }
  };

  useEffect(() => {
    fetchBotStatus();
    const interval = setInterval(fetchBotStatus, 30000); // Actualiser toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !webhookUrl) return;
    
    setIsSending(true);
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          username: botData?.username || "LuminaOS Panel",
          avatar_url: botData?.avatar || "https://ui-avatars.com/api/?name=Lumina+OS&background=f43f5e&color=fff"
        })
      });

      if (res.ok) {
        setMessage("");
      } else {
        alert("Erreur: Le Webhook Discord semble invalide.");
      }
    } catch (error) {
      alert("Erreur réseau lors de l'envoi au Webhook Discord.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <GlassCard delay={0.5} className="md:col-span-2 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-[#5865F2]" />
          <h3 className="text-white font-medium text-lg">Bot Discord</h3>
        </div>
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${botData ? 'bg-[#5865F2]/20 border-[#5865F2]/50 text-[#5865F2]' : 'bg-gray-500/20 border-gray-500/50 text-gray-400'}`}>
          <div className={`w-2 h-2 rounded-full ${botData ? 'bg-[#5865F2] animate-pulse' : 'bg-gray-500'}`} />
          {botData ? 'En ligne' : 'Hors ligne'}
        </div>
      </div>

      {!botData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-black/20 rounded-xl border border-white/5 mb-4">
          <AlertTriangle className="w-8 h-8 text-rose-400 mb-3" />
          <p className="text-white font-medium mb-1">Bot non configuré</p>
          <p className="text-sm text-gray-400">
            {error === 'Token invalide' 
              ? "Le token renseigné est invalide." 
              : "Veuillez renseigner le Token de votre bot dans les paramètres."}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 bg-black/20 rounded-xl p-4 border border-white/5 mb-6">
            {botData.avatar ? (
              <img src={botData.avatar} alt="Bot Avatar" className="w-12 h-12 rounded-full border border-white/10" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-xl">
                {botData.username.charAt(0)}
              </div>
            )}
            <div>
              <h4 className="text-white font-medium text-lg">{botData.username}</h4>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Server className="w-4 h-4" />
                  <span>{botData.serverCount} Serveur{botData.serverCount > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-emerald-400">
                  <Activity className="w-4 h-4" />
                  <span>API Connectée</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            {!webhookUrl ? (
              <p className="text-xs text-rose-400 mb-2">⚠️ Configurez une URL de Webhook dans les paramètres pour envoyer des messages.</p>
            ) : (
              <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Envoyer un message en tant que ${botData.username}...`}
                  className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#5865F2]/50 transition-colors"
                  disabled={isSending}
                />
                <button 
                  type="submit"
                  disabled={!message.trim() || isSending}
                  className="bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-white/10 disabled:text-gray-500 text-white px-4 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </GlassCard>
  );
};
