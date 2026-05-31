import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { theme } from "../theme";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MOODS = [
  { label: "Very Low", emoji: "😖", color: "#F43F5E" },
  { label: "Low", emoji: "🙁", color: "#FB923C" },
  { label: "Okay", emoji: "😐", color: "#FACC15" },
  { label: "Good", emoji: "🙂", color: "#4ADE80" },
  { label: "Great", emoji: "😊", color: "#2DD4BF" },
];

export function WeeklyMoodTracker() {
  const [moods, setMoods] = useState<Record<number, number | null>>({});
  const [reflection, setReflection] = useState("");
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  const handleMoodSelect = (dayIndex: number, moodIndex: number) => {
    setMoods((prev) => ({ ...prev, [dayIndex]: moodIndex }));
  };

  const moodCount = Object.values(moods).filter(m => m !== null).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold uppercase tracking-widest opacity-60" style={{ color: theme.text }}>Weekly Mood</h3>
        <span className="text-[10px] font-bold text-primary">APR 7 - APR 13</span>
      </div>

      <Card className="glass border-0 rounded-[2rem] overflow-hidden">
        <CardContent className="p-6">
          {/* Day Selector */}
          <div className="flex justify-between mb-8">
            {DAYS.map((day, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`flex flex-col items-center gap-2 transition-all duration-300 ${selectedDay === i ? "scale-110" : "opacity-40"}`}
              >
                <span className="text-[10px] font-black">{day}</span>
                <motion.div 
                  key={moods[i]}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`h-10 w-10 rounded-2xl flex items-center justify-center text-xl transition-all ${
                    selectedDay === i ? "bg-primary/20 shadow-lg shadow-primary/10" : "bg-white/5"
                  }`}
                  style={{ 
                    border: selectedDay === i ? `1px solid ${theme.primary}40` : "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  {moods[i] !== undefined && moods[i] !== null ? MOODS[moods[i]!].emoji : "•"}
                </motion.div>
              </button>
            ))}
          </div>

          {/* Mood Selection for Selected Day */}
          <div className="space-y-4 mb-8">
            <p className="text-center text-xs font-bold opacity-60" style={{ color: theme.text }}>
              How did you feel on {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][selectedDay]}?
            </p>
            <div className="flex justify-center gap-3 relative">
              {MOODS.map((mood, index) => {
                const isSelected = moods[selectedDay] === index;
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMoodSelect(selectedDay, index)}
                    className="relative h-12 w-12 flex items-center justify-center text-2xl z-10"
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="moodHighlight"
                        className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-primary/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className={`relative z-20 transition-colors duration-300 ${isSelected ? "text-white" : "opacity-40 hover:opacity-100"}`}>
                      {mood.emoji}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Weekly Reflection */}
          <AnimatePresence>
            {moodCount >= 3 && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 pt-4 border-t border-white/5 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: theme.text }}>
                    Weekly Reflection
                  </label>
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What helped you show up for yourself this week?"
                  className="w-full rounded-2xl bg-white/5 border-0 focus:ring-1 focus:ring-primary/30 min-h-[80px] p-4 text-xs leading-relaxed placeholder:opacity-30"
                  style={{ color: theme.text }}
                />
                <Button 
                  className="w-full h-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white border-0 font-bold text-[10px] uppercase tracking-widest transition-all"
                  onClick={() => {
                    // Logic to save reflection
                    console.log("Saving reflection:", reflection);
                  }}
                >
                  Save Reflection
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
