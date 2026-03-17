import React, { useState, useEffect } from "react";
import { Music, Play, Pause, SkipForward, SkipBack, LogIn, AlertCircle } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { User } from "../../App";

export const SpotifyWidget = ({ currentUser }: { currentUser: User }) => {
  const [connected, setConnected] = useState(false);
  const [playerData, setPlayerData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayer = async () => {
    try {
      const res = await fetch(`/api/spotify/player?username=${currentUser.username}`);
      const data = await res.json();
      setConnected(data.connected);
      if (data.connected && data.data) {
        setPlayerData(data.data);
      } else {
        setPlayerData(null);
      }
    } catch (e) {
      console.error("Spotify fetch error", e);
    }
  };

  useEffect(() => {
    fetchPlayer();
    const interval = setInterval(fetchPlayer, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SPOTIFY_AUTH_SUCCESS') {
        fetchPlayer();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async () => {
    try {
      const res = await fetch(`/api/spotify/auth-url?username=${currentUser.username}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      window.open(data.url, 'spotify_auth', 'width=600,height=700');
    } catch (e) {
      setError("Erreur de connexion au serveur");
    }
  };

  const handleControl = async (action: string) => {
    await fetch('/api/spotify/player/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser.username, action })
    });
    setTimeout(fetchPlayer, 500); // Refresh shortly after
  };

  return (
    <GlassCard delay={0.6} className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Music className="w-6 h-6 text-green-400" />
          <h3 className="text-white font-medium text-lg">Spotify</h3>
        </div>
        {connected && (
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Connecté" />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {error ? (
          <div className="text-center p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <AlertCircle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        ) : !connected ? (
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4">Connectez votre compte Spotify pour contrôler votre musique.</p>
            <button 
              onClick={handleConnect}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 mx-auto cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Connecter Spotify
            </button>
          </div>
        ) : playerData && playerData.item ? (
          <div className="flex flex-col items-center">
            <img 
              src={playerData.item.album.images[0]?.url} 
              alt="Album Art" 
              className="w-24 h-24 rounded-xl shadow-lg mb-4"
            />
            <h4 className="text-white font-medium text-center line-clamp-1 w-full">{playerData.item.name}</h4>
            <p className="text-gray-400 text-sm text-center line-clamp-1 w-full mb-4">
              {playerData.item.artists.map((a: any) => a.name).join(', ')}
            </p>
            
            <div className="flex items-center gap-4">
              <button onClick={() => handleControl('previous')} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <SkipBack className="w-6 h-6" />
              </button>
              <button 
                onClick={() => handleControl(playerData.is_playing ? 'pause' : 'play')} 
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
              >
                {playerData.is_playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
              <button onClick={() => handleControl('next')} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm">
            <p>Aucune musique en cours de lecture.</p>
            <p className="text-xs mt-1">Ouvrez Spotify sur un de vos appareils et lancez un titre.</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
