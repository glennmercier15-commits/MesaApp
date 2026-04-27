import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  Headphones, 
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { theme } from "../theme";

interface Meditation {
  id: string;
  title: string;
  duration: number; // in seconds
  description: string;
  category: string;
  prompts: { time: number; text: string }[];
}

const MEDITATIONS: Meditation[] = [
  {
    id: "1",
    title: "Morning Clarity",
    duration: 300,
    description: "Start your day with focus and intention.",
    category: "Morning",
    prompts: [
      { time: 0, text: "Find a comfortable seated position..." },
      { time: 10, text: "Gently close your eyes..." },
      { time: 30, text: "Take a deep breath in through your nose..." },
      { time: 40, text: "And slowly out through your mouth..." },
      { time: 60, text: "Notice the weight of your body on the chair..." },
      { time: 120, text: "Let go of any tension in your shoulders..." },
      { time: 180, text: "Visualize a bright light filling your mind..." },
      { time: 240, text: "Set one positive intention for today..." },
      { time: 280, text: "Slowly bring your awareness back..." },
      { time: 295, text: "Open your eyes when you're ready." },
    ]
  },
  {
    id: "2",
    title: "Stress Release",
    duration: 600,
    description: "Let go of the day's tension and find peace.",
    category: "Anxiety",
    prompts: [
      { time: 0, text: "Allow yourself to arrive in this moment..." },
      { time: 15, text: "Scan your body for any areas of tightness..." },
      { time: 60, text: "Imagine each breath softening those areas..." },
      { time: 120, text: "You are safe. You are present." },
      { time: 300, text: "Watch your thoughts pass by like clouds..." },
      { time: 540, text: "Carry this stillness with you..." },
    ]
  },
  {
    id: "3",
    title: "Deep Sleep Prep",
    duration: 900,
    description: "Prepare your mind and body for restful sleep.",
    category: "Sleep",
    prompts: [
      { time: 0, text: "Lie down comfortably in your bed..." },
      { time: 20, text: "Feel the support of the mattress beneath you..." },
      { time: 60, text: "Slow, rhythmic breathing..." },
      { time: 300, text: "Relaxing every muscle from toes to head..." },
    ]
  }
];

export function MeditationScreen({ onBack }: { onBack: () => void }) {
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeLeft === 0 && isPlaying) {
        setIsPlaying(false);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (selectedMeditation) {
      const elapsed = selectedMeditation.duration - timeLeft;
      const prompt = [...selectedMeditation.prompts]
        .reverse()
        .find(p => p.time <= elapsed);
      if (prompt) setCurrentPrompt(prompt.text);
    }
  }, [timeLeft, selectedMeditation]);

  const startMeditation = (meditation: Meditation) => {
    setSelectedMeditation(meditation);
    setTimeLeft(meditation.duration);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = selectedMeditation 
    ? ((selectedMeditation.duration - timeLeft) / selectedMeditation.duration) * 100 
    : 0;

  if (selectedMeditation) {
    return (
      <div className="flex h-full flex-col bg-background p-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => { setSelectedMeditation(null); setIsPlaying(false); }} className="rounded-full p-2 transition-colors hover:bg-white/5" style={{ color: theme.primary }}>
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4" style={{ color: theme.primary }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.muted }}>Guided Session</span>
          </div>
          <button onClick={() => setIsMuted(!isMuted)} className="rounded-full p-2 transition-colors hover:bg-white/5" style={{ color: theme.muted }}>
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative mb-12 flex h-64 w-64 items-center justify-center">
            {/* Progress Ring */}
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-white/5"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke={theme.primary}
                strokeWidth="4"
                strokeDasharray="753.98"
                animate={{ strokeDashoffset: 753.98 * (1 - progress / 100) }}
                transition={{ duration: 1, ease: "linear" }}
                strokeLinecap="round"
              />
            </svg>

            {/* Animated Glow */}
            <motion.div
              animate={{
                scale: isPlaying ? [1, 1.1, 1] : 1,
                opacity: isPlaying ? [0.3, 0.6, 0.3] : 0.3,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute h-48 w-48 rounded-full blur-3xl"
              style={{ backgroundColor: theme.primary }}
            />

            <div className="z-10 space-y-1">
              <div className="text-4xl font-bold tabular-nums" style={{ color: theme.foreground }}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.muted }}>
                Remaining
              </div>
            </div>
          </div>

          <div className="mb-12 min-h-[80px] px-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentPrompt}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-medium italic leading-relaxed"
                style={{ color: theme.foreground }}
              >
                "{currentPrompt}"
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-8">
            <button 
              onClick={() => setTimeLeft(selectedMeditation.duration)}
              className="rounded-full p-4 transition-all hover:bg-white/5"
              style={{ color: theme.muted }}
            >
              <RotateCcw className="h-6 w-6" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-transform active:scale-95"
              style={{ backgroundColor: theme.primary }}
            >
              {isPlaying ? <Pause className="h-8 w-8 text-background fill-current" /> : <Play className="h-8 w-8 text-background fill-current ml-1" />}
            </button>
            <div className="w-14" /> {/* Spacer for balance */}
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white/5 p-4 text-center">
          <h3 className="text-sm font-bold" style={{ color: theme.foreground }}>{selectedMeditation.title}</h3>
          <p className="text-[10px] font-medium" style={{ color: theme.muted }}>{selectedMeditation.category} • {Math.round(selectedMeditation.duration / 60)} min</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="rounded-full p-2 transition-colors hover:bg-white/5" style={{ color: theme.primary }}>
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-bold" style={{ color: theme.foreground }}>Guided Meditation</h2>
          <div className="w-10" />
        </div>

        <div className="mb-8 space-y-2">
          <h3 className="text-2xl font-bold" style={{ color: theme.foreground }}>Find your calm</h3>
          <p className="text-sm opacity-60" style={{ color: theme.foreground }}>Choose a session to begin your practice.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <div className="space-y-4">
          {MEDITATIONS.map((meditation) => (
            <Card 
              key={meditation.id} 
              onClick={() => startMeditation(meditation)}
              className="group cursor-pointer border-0 bg-secondary transition-all hover:ring-1 hover:ring-primary/30 rounded-[2rem] overflow-hidden"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-primary">
                        {meditation.category}
                      </span>
                      <span className="text-[10px] font-medium opacity-40" style={{ color: theme.foreground }}>
                        {Math.round(meditation.duration / 60)} min
                      </span>
                    </div>
                    <h4 className="text-base font-bold" style={{ color: theme.foreground }}>{meditation.title}</h4>
                    <p className="text-xs opacity-60 line-clamp-2" style={{ color: theme.foreground }}>{meditation.description}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3 group-hover:bg-primary/10 transition-colors">
                    <Play className="h-5 w-5 text-primary fill-current" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="pt-4">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-60" style={{ color: theme.foreground }}>Quick Exercises</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 bg-white/5 rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <p className="text-[10px] font-bold uppercase">5-Min Reset</p>
              </Card>
              <Card className="border-0 bg-white/5 rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <p className="text-[10px] font-bold uppercase">Body Scan</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
