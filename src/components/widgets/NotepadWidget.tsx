import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

export const NotepadWidget = () => {
  const [note, setNote] = useState(() => localStorage.getItem("zima_note") || "");

  useEffect(() => {
    localStorage.setItem("zima_note", note);
  }, [note]);

  return (
    <GlassCard delay={0.5} className="flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-6 h-6 text-blue-400" />
        <h3 className="text-white font-medium text-lg">Bloc-notes</h3>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Écrivez quelque chose ici... (sauvegardé automatiquement)"
        className="flex-1 w-full bg-black/20 border border-white/5 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none min-h-[150px]"
      />
    </GlassCard>
  );
};
