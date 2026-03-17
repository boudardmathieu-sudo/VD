import React, { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, Wind, Droplets, CloudLightning, CloudSnow } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API Open-Meteo pour Niort, Deux-Sèvres (Latitude: 46.3231, Longitude: -0.4609)
    fetch('https://api.open-meteo.com/v1/forecast?latitude=46.3231&longitude=-0.4609&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&timezone=Europe%2FParis&forecast_days=1')
      .then(res => res.json())
      .then(data => {
        setWeather(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur météo:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !weather) {
    return (
      <GlassCard delay={0.2} className="flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Chargement météo (Niort)...</div>
      </GlassCard>
    );
  }

  const current = weather.current;
  const hourly = weather.hourly;
  
  // Obtenir l'icône en fonction du code météo WMO
  const getWeatherIcon = (code: number, className: string) => {
    if (code <= 3) return <Sun className={className} />;
    if (code >= 45 && code <= 48) return <Cloud className={className} />;
    if (code >= 51 && code <= 67) return <CloudRain className={className} />;
    if (code >= 71 && code <= 77) return <CloudSnow className={className} />;
    if (code >= 95) return <CloudLightning className={className} />;
    return <Cloud className={className} />;
  };
  
  // Prochaines heures
  const currentHourIndex = new Date().getHours();
  const nextHours = [1, 2, 3].map(offset => {
    const idx = currentHourIndex + offset;
    return {
      time: `${idx % 24}h`,
      temp: hourly.temperature_2m[idx],
      precip: hourly.precipitation_probability[idx],
      code: hourly.weather_code[idx]
    };
  });

  return (
    <GlassCard delay={0.2} className="flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white font-medium text-lg">Niort, FR</h3>
          <p className="text-gray-400 text-sm">Deux-Sèvres</p>
        </div>
        {getWeatherIcon(current.weather_code, "w-8 h-8 text-yellow-400")}
      </div>
      
      <div className="text-5xl font-light text-white mb-4">{Math.round(current.temperature_2m)}°C</div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Droplets className="w-4 h-4 text-blue-400" /> {current.relative_humidity_2m}%
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Wind className="w-4 h-4 text-gray-300" /> {current.wind_speed_10m} km/h
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-2">
        {nextHours.map((h, i) => (
          <div key={i} className="text-center flex flex-col items-center">
            <div className="text-gray-400 text-xs mb-1">{h.time}</div>
            {getWeatherIcon(h.code, "w-4 h-4 text-gray-300 mb-1")}
            <div className="text-white font-medium">{Math.round(h.temp)}°</div>
            <div className="text-blue-400 text-xs mt-1">{h.precip}%</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
