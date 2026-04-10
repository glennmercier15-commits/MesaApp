import React from "react";
import { motion } from "motion/react";
import { ChevronLeft, Video, Mic, Users, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { theme } from "../theme";

interface GroupSessionScreenProps {
  roomName: string;
  onBack: () => void;
}

export function GroupSessionScreen({ roomName, onBack }: GroupSessionScreenProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5" style={{ backgroundColor: theme.secondary }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-full p-2 hover:bg-white/5" style={{ color: theme.primary }}>
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-sm font-bold" style={{ color: theme.foreground }}>{roomName}</h2>
            <div className="flex items-center gap-1 text-[10px] font-medium" style={{ color: theme.muted }}>
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              PHIPA Compliant Video
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 text-red-400 hover:bg-red-400/10" onClick={onBack}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Video Grid Placeholder */}
      <div className="flex-1 p-4 grid grid-cols-2 grid-rows-3 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
              <Users className="h-6 w-6" style={{ color: theme.muted }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.muted }}>Peer {i}</span>
            <div className="absolute bottom-2 left-2 flex gap-1">
              <div className="h-4 w-4 rounded-full bg-black/40 flex items-center justify-center">
                <Mic className="h-2 w-2 text-white" />
              </div>
            </div>
          </div>
        ))}
        
        {/* Self View */}
        <div className="rounded-3xl bg-secondary border-2 border-primary flex flex-col items-center justify-center relative overflow-hidden">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Users className="h-6 w-6" style={{ color: theme.primary }} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.primary }}>You (Anonymous)</span>
          <div className="absolute bottom-2 left-2 flex gap-1">
            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
              <Mic className="h-2 w-2 text-background" />
            </div>
            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
              <Video className="h-2 w-2 text-background" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 pb-10 flex justify-center gap-6" style={{ backgroundColor: theme.secondary }}>
        <button className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
          <Mic className="h-6 w-6 text-white" />
        </button>
        <button className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
          <Video className="h-6 w-6 text-white" />
        </button>
        <button className="h-14 w-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors" onClick={onBack}>
          <PhoneCall className="h-6 w-6 text-white rotate-[135deg]" />
        </button>
      </div>
    </div>
  );
}

import { PhoneCall } from "lucide-react";
