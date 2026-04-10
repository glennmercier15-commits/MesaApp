import React, { useState } from "react";
import { motion } from "motion/react";
import { HeartPulse, CheckCircle2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { theme } from "../theme";

interface MoodCheckInProps {
  onComplete: (mood: string, intensity: number) => void;
}

export function MoodCheckIn({ onComplete }: MoodCheckInProps) {
  const [moodSelected, setMoodSelected] = useState<string | null>(null);
  const [checkInDone, setCheckInDone] = useState(false);
  const [urgeIntensity, setUrgeIntensity] = useState(3);

  const handleMoodSelect = (mood: string) => {
    setMoodSelected(mood);
    setTimeout(() => {
      setCheckInDone(true);
      onComplete(mood, urgeIntensity);
    }, 600);
  };

  if (checkInDone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass border-0 rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/20 shadow-inner">
              <CheckCircle2 className="h-10 w-10" style={{ color: theme.primary }} />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-3" style={{ color: theme.foreground }}>Check-in complete</h2>
            <p className="text-sm leading-relaxed mb-8 opacity-60" style={{ color: theme.foreground }}>
              Thank you for showing up for yourself today. Your support team has been updated on your {moodSelected?.toLowerCase()} mood.
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-2xl glass hover:bg-white/10 text-white/70 px-6 h-10" 
              onClick={() => setCheckInDone(false)}
            >
              Update check-in
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="glass border-0 rounded-[2rem] overflow-hidden">
      <CardContent className="p-6 text-white">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Daily Pulse</p>
            <h2 className="text-2xl font-serif font-bold mt-1">How are you feeling?</h2>
          </div>
          <div className="rounded-2xl p-3 bg-white/5">
            <HeartPulse className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Low", emoji: "😔" },
            { label: "Heavy", emoji: "🌧️" },
            { label: "Okay", emoji: "😐" },
            { label: "Steady", emoji: "🌿" },
            { label: "Strong", emoji: "☀️" }
          ].map((mood) => (
            <button
              key={mood.label}
              onClick={() => handleMoodSelect(mood.label)}
              className={`flex flex-col items-center gap-2 rounded-2xl py-4 transition-all duration-300 ${moodSelected === mood.label ? 'bg-primary text-white scale-105 shadow-lg shadow-primary/20' : 'bg-white/5 hover:bg-white/10 opacity-60 hover:opacity-100'}`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">{mood.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-8 rounded-3xl bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
            <span>Urge intensity</span>
            <span className="text-primary">{urgeIntensity} / 10</span>
          </div>
          <Slider 
            value={[urgeIntensity]} 
            max={10} 
            step={1} 
            onValueChange={(val) => setUrgeIntensity(val[0])}
            className="py-2"
          />
        </div>
        <Button 
          onClick={() => handleMoodSelect("Okay")}
          className="w-full mt-6 rounded-2xl bg-white/5 hover:bg-white/10 text-primary font-bold text-[10px] uppercase tracking-[0.2em] h-12 border border-primary/20 transition-all duration-300"
        >
          <Zap className="mr-2 h-3 w-3" /> Quick Check-in (Okay)
        </Button>
      </CardContent>
    </Card>
  );
}
