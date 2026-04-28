import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HeartPulse, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { theme } from "../theme";
import { useAuth } from "../context/AuthContext";
import { addDoc, collection, serverTimestamp, db, query, where, getCountFromServer } from "../firebase";

interface MoodCheckInProps {
  onComplete: (mood: string, intensity: number) => void;
}

export function MoodCheckIn({ onComplete }: MoodCheckInProps) {
  const { user } = useAuth();
  const [moodSelected, setMoodSelected] = useState<string | null>(null);
  const [showIntensity, setShowIntensity] = useState(false);
  const [checkInDone, setCheckInDone] = useState(false);
  const [urgeIntensity, setUrgeIntensity] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  const [cumulativeCount, setCumulativeCount] = useState<number | null>(null);

  const fetchCumulativeCount = async () => {
    if (!user) return;
    const q = query(collection(db, "checkins"), where("uid", "==", user.uid));
    const snapshot = await getCountFromServer(q);
    setCumulativeCount(snapshot.data().count);
  };

  const handleMoodSelect = (mood: string) => {
    setMoodSelected(mood);
    setShowIntensity(true);
  };

  const handleFinalize = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await addDoc(collection(db, "checkins"), {
        uid: user.uid,
        mood: moodSelected,
        intensity: urgeIntensity,
        timestamp: serverTimestamp(),
      });
      await fetchCumulativeCount();
      setCheckInDone(true);
      onComplete(moodSelected!, urgeIntensity);
    } catch (error) {
      console.error("Error saving check-in:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (checkInDone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass border-0 rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/20">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: theme.foreground }}>You showed up for yourself</h2>
            <p className="text-sm leading-relaxed mb-8 opacity-70" style={{ color: theme.foreground }}>
              Every check-in is a step forward. {cumulativeCount !== null && `You've checked in ${cumulativeCount} time${cumulativeCount === 1 ? '' : 's'} — that's ${cumulativeCount} day${cumulativeCount === 1 ? '' : 's'} you showed up for yourself.`}
            </p>
            <Button 
              variant="ghost" 
              className="rounded-2xl text-primary/70 hover:text-primary" 
              onClick={() => { setCheckInDone(false); setMoodSelected(null); setShowIntensity(false); }}
            >
              Reset
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="glass border-0 rounded-[2rem] overflow-hidden">
      <CardContent className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold" style={{ color: theme.foreground }}>How are you doing today?</h2>
          <p className="text-sm opacity-60 mt-1" style={{ color: theme.foreground }}>Take a moment to check in with yourself.</p>
        </div>

        <AnimatePresence mode="wait">
          {!showIntensity ? (
            <motion.div
              key="mood-select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-5 gap-3"
            >
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
                  className="flex flex-col items-center gap-2 rounded-2xl py-4 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{mood.label}</span>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="intensity-select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="rounded-3xl bg-white/5 p-6">
                <div className="mb-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                  <span>Need extra support?</span>
                  <span className="text-primary">{urgeIntensity}</span>
                </div>
                <Slider 
                  value={[urgeIntensity]} 
                  max={10} 
                  step={1} 
                  onValueChange={(val) => setUrgeIntensity(val[0])}
                  className="py-2"
                />
                <p className="text-[10px] opacity-50 mt-2">Adjust if you're feeling overwhelmed.</p>
              </div>
              <Button 
                onClick={handleFinalize}
                disabled={isSaving}
                className="w-full rounded-2xl bg-primary text-white font-bold h-12 transition-all"
              >
                {isSaving ? "Saving..." : "Complete Check-in"} {!isSaving && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
