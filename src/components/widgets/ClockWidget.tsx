import React, { useState, useEffect } from "react";
import { Clock as ClockIcon, Bell } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

export const ClockWidget = () => {
  const [time, setTime] = useState(new Date());
  const [timezone, setTimezone] = useState("Europe/Paris");
  const [alarms, setAlarms] = useState<{time: string, active: boolean}[]>([]);
  const [newAlarm, setNewAlarm] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addAlarm = () => {
    if (newAlarm && !alarms.find(a => a.time === newAlarm)) {
      setAlarms([...alarms, { time: newAlarm, active: true }]);
      setNewAlarm("");
    }
  };

  const timeString = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: timezone });
  
  return (
    <GlassCard delay={0.1} className="flex flex-col py-6">
      <div className="flex justify-between items-center mb-4">
        <ClockIcon className="w-6 h-6 text-rose-400" />
        <select 
          value={timezone} 
          onChange={(e) => setTimezone(e.target.value)}
          className="bg-black/20 text-white text-xs border border-white/10 rounded-lg p-1 outline-none cursor-pointer"
        >
          <option value="Europe/Paris">Paris</option>
          <option value="America/New_York">New York</option>
          <option value="Asia/Tokyo">Tokyo</option>
          <option value="Europe/London">Londres</option>
        </select>
      </div>
      
      <div className="text-5xl font-light text-white tracking-tighter mb-2 text-center">
        {timeString}
      </div>
      <div className="text-gray-400 font-medium tracking-wide uppercase text-sm text-center mb-6">
        {time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: timezone })}
      </div>

      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-white">Alarmes</span>
        </div>
        <div className="flex gap-2 mb-3">
          <input 
            type="time" 
            value={newAlarm}
            onChange={(e) => setNewAlarm(e.target.value)}
            className="bg-black/20 text-white text-sm border border-white/10 rounded-lg p-1.5 flex-1 outline-none"
          />
          <button onClick={addAlarm} className="bg-rose-500/20 text-rose-300 px-3 rounded-lg text-sm hover:bg-rose-500/40 cursor-pointer">+</button>
        </div>
        <div className="space-y-2 max-h-20 overflow-y-auto pr-1">
          {alarms.length === 0 && <p className="text-xs text-gray-500 italic">Aucune alarme</p>}
          {alarms.map((alarm, i) => (
            <div key={i} className="flex justify-between items-center text-sm bg-black/20 p-2 rounded-lg border border-white/5">
              <span className="text-white">{alarm.time}</span>
              <input 
                type="checkbox" 
                checked={alarm.active} 
                onChange={() => {
                  const newAlarms = [...alarms];
                  newAlarms[i].active = !newAlarms[i].active;
                  setAlarms(newAlarms);
                }}
                className="accent-rose-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};
