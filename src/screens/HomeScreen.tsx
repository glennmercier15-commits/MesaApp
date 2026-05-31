import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "../lib/utils";
import { 
  Menu,
  Bell,
  PlayCircle,
  Sparkles,
  Flame,
  BookOpen,
  Shield,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme/AppTheme";
import { WeeklyMoodTracker } from "../components/WeeklyMoodTracker";
import { db, collection, addDoc, serverTimestamp } from "../firebase";
import { GlassCard } from "../components/UIKit";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [mood, setMood] = useState(5);
  const [craving, setCraving] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const firstName = user?.displayName?.split(' ')[0] || "Alex";

  const handleMoodSubmit = async () => {
    if (!user) return;
    
    // Ensure values are numbers before proceeding
    const safeMood = typeof mood === 'number' ? mood : 5;
    const safeCraving = typeof craving === 'number' ? craving : 0;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "checkins"), {
        uid: user.uid,
        mood: safeMood,
        craving: safeCraving,
        timestamp: serverTimestamp(),
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "checkins");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodEmoji = (val: number) => {
    if (val <= 2) return "😔"; // Very Low
    if (val <= 4) return "🙁"; // Low
    if (val <= 6) return "😐"; // Okay
    if (val <= 8) return "🙂"; // Good
    return "😊"; // Great
  };

  const getCravingLevel = (val: number) => {
    if (val === 0) return "No Cravings";
    if (val <= 3) return "Mild - Easily Managed";
    if (val <= 6) return "Moderate - Taking Notice";
    if (val <= 9) return "Strong - Need Coping";
    return "Intense - Seeking Support";
  };

  return (
    <div className="h-full atmosphere overflow-hidden">
      <ScrollArea className="h-full">
        <div className="space-y-6 p-6 pb-24">
          {/* Top Nav */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" style={{ color: colors.text }}><Menu className="h-6 w-6" /></Button>
            <Button variant="ghost" size="icon" style={{ color: colors.text }}><Bell className="h-6 w-6" /></Button>
          </div>

          {/* Greeting & Mood */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold uppercase tracking-widest opacity-40" style={{ color: colors.text }}>Welcome back,</p>
                <h2 className="text-[24px] font-bold" style={{ color: colors.text }}>{firstName}</h2>
              </div>
              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20">
                <img 
                  src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Wellness Card (Credit Card Style) */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('wellness-passport')}
              className="relative h-[200px] w-full rounded-[24px] p-6 text-white shadow-2xl teal-glow primary-gradient overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="h-32 w-32" />
              </div>
              <div className="flex justify-between items-start mb-8 gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span className="font-bold tracking-tight text-[15px]">Pulse Hub</span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-60 text-right leading-tight max-w-[100px]">
                  Wellness Passport
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">Current Mood Score</p>
                <h3 className="text-[32px] font-bold tabular-nums">{mood}%</h3>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-60 mb-0.5">Member Since</p>
                  <p className="text-[12px] font-semibold">APR 2024</p>
                </div>
                <div className="h-8 w-12 rounded-md bg-white/10 flex items-center justify-center">
                  <div className="flex -space-x-2">
                    <div className="h-4 w-4 rounded-full bg-white/40" />
                    <div className="h-4 w-4 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-[13px] font-bold uppercase tracking-widest opacity-40" style={{ color: colors.text }}>Daily Wellness Pulse</p>
                <AnimatePresence>
                  {showSuccess && (
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[11px] font-bold text-emerald-500 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Logged
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              
              <Card className="border-0 shadow-sm rounded-[24px]" style={{ backgroundColor: colors.surfaceAlt }}>
                <CardContent className="p-6 space-y-8">
                  {/* Mood Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-[15px] font-medium" style={{ color: colors.text }}>How's your mood?</p>
                      <span className="text-2xl flex items-center gap-2">
                        <span className="text-sm font-bold opacity-60" style={{ color: colors.text }}>{mood}/10</span>
                        <span>{getMoodEmoji(mood)}</span>
                      </span>
                    </div>
                    <div className="flex justify-between gap-1 w-full overflow-x-auto py-1 no-scrollbar">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const isSelected = mood === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setMood(num)}
                            className={cn(
                              "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border shrink-0",
                              isSelected 
                                ? "text-white scale-110 shadow-md ring-2 ring-primary/20" 
                                : "hover:bg-primary/5 active:scale-95"
                            )}
                            style={{
                              backgroundColor: isSelected ? colors.primary : `${colors.surfaceAlt}80`,
                              borderColor: isSelected ? colors.primary : `${colors.text}15`,
                              color: isSelected ? "#fff" : colors.text,
                            }}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-35" style={{ color: colors.text }}>
                      <span>Heavy</span>
                      <span>Light</span>
                    </div>
                  </div>

                  {/* Craving Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end gap-2 flex-wrap">
                      <p className="text-[15px] font-medium" style={{ color: colors.text }}>Any cravings today?</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                          {getCravingLevel(craving)}
                        </span>
                        <span className="text-sm font-bold opacity-60" style={{ color: colors.text }}>({craving}/10)</span>
                      </div>
                    </div>
                    <div className="flex justify-between gap-1 w-full overflow-x-auto py-1 no-scrollbar">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const isSelected = craving === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setCraving(num)}
                            className={cn(
                              "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border shrink-0",
                              isSelected 
                                ? "text-white scale-110 shadow-md ring-2 ring-primary/20" 
                                : "hover:bg-primary/5 active:scale-95"
                            )}
                            style={{
                              backgroundColor: isSelected ? colors.primary : `${colors.surfaceAlt}80`,
                              borderColor: isSelected ? colors.primary : `${colors.text}15`,
                              color: isSelected ? "#fff" : colors.text,
                            }}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-35" style={{ color: colors.text }}>
                      <span>Peaceful</span>
                      <span>Distressed</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleMoodSubmit}
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl primary-gradient border-0 text-white font-bold shadow-xl transition-all active:scale-[0.98]"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Check-in"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Daily Quote */}
          <GlassCard title="Daily Quote">
            <p className="italic text-sm leading-relaxed" style={{ color: colors.textMuted }}>
              "Recovery is not a race. It's a journey of showing up for yourself, one day at a time."
            </p>
          </GlassCard>

          {/* Today's Practices */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold uppercase tracking-widest opacity-40 px-1" style={{ color: colors.text }}>Quick Actions</h3>
              <Button variant="ghost" size="sm" className="text-[12px] font-bold text-primary">View All</Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: "Meditation", icon: PlayCircle, screen: "meditation" },
                { name: "Journal", icon: BookOpen, screen: "journal" },
                { name: "Breathe", icon: Flame, screen: "breathwork" },
                { name: "Grounding", icon: Sparkles, screen: "grounding" },
              ].map((practice) => (
                <div key={practice.name} className="flex flex-col items-center gap-2">
                  <motion.div 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onNavigate(practice.screen)}
                    className="h-14 w-14 rounded-[16px] flex items-center justify-center cursor-pointer shadow-sm transition-all hover:shadow-md"
                    style={{ backgroundColor: colors.surfaceAlt }}
                  >
                    <practice.icon className="h-6 w-6" style={{ color: colors.primary }} />
                  </motion.div>
                  <p className="text-[11px] font-bold opacity-60 text-center" style={{ color: colors.text }}>{practice.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Mood Tracker */}
          <WeeklyMoodTracker />
        </div>
      </ScrollArea>
    </div>
  );
}
