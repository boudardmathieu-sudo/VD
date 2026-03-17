import React, { useState, useEffect } from "react";
import { Newspaper, RefreshCw, ExternalLink } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

export const NewsWidget = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Utilisation de rss2json pour convertir le flux RSS de France 24 en JSON
      const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.france24.com/fr/rss');
      const data = await res.json();
      if (data.items) {
        setNews(data.items.slice(0, 4));
      }
    } catch (e) {
      console.error("Erreur actualités:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard delay={0.5} className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Newspaper className="w-6 h-6 text-blue-400" />
          <h3 className="text-white font-medium text-lg">Actualités</h3>
        </div>
        <button onClick={fetchNews} className={`p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {news.length === 0 && !loading ? (
          <p className="text-gray-500 text-sm text-center py-4">Impossible de charger les actualités.</p>
        ) : (
          news.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noreferrer" className="block p-3 bg-black/20 border border-white/5 rounded-xl hover:bg-white/5 hover:border-white/10 transition-all group">
              <h4 className="text-sm text-white font-medium line-clamp-2 mb-1 group-hover:text-blue-300 transition-colors">{item.title}</h4>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(item.pubDate).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))
        )}
      </div>
    </GlassCard>
  );
};
