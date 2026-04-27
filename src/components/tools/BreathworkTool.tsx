import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wind, ChevronLeft, CheckCircle2, Info, History, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { theme } from "../../theme";
import { db, collection, addDoc } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold tracking-wide" style={{ color: theme.foreground }}>{title}</h3>
      {action ? <button className="text-xs font-medium" style={{ color: theme.primary }}>{action}</button> : null}
    </div>
  );
}

export function BreathworkTool({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [technique, setTechnique] = useState<'box' | '478'>('box');
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Hold2'>('Inhale');
  const [seconds, setSeconds] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const configs = {
    box: { 
      inhale: 4, 
      hold: 4, 
      exhale: 4, 
      hold2: 4, 
      label: "Box Breathing",
      desc: "Equal parts inhale, hold, exhale, hold. Great for focus and resetting the nervous system."
    },
    '478': { 
      inhale: 4, 
      hold: 7, 
      exhale: 8, 
      hold2: 0, 
      label: "4-7-8 Relaxing Breath",
      desc: "Inhale for 4, hold for 7, exhale for 8. Specifically designed to reduce anxiety and aid sleep."
    },
  };

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            if (technique === 'box') {
              if (phase === 'Inhale') { setPhase('Hold'); return configs.box.hold; }
              if (phase === 'Hold') { setPhase('Exhale'); return configs.box.exhale; }
              if (phase === 'Exhale') { setPhase('Hold2'); return configs.box.hold2; }
              if (phase === 'Hold2') { 
                setPhase('Inhale'); 
                setCycles(c => c + 1);
                return configs.box.inhale; 
              }
            } else {
              if (phase === 'Inhale') { setPhase('Hold'); return configs['478'].hold; }
              if (phase === 'Hold') { setPhase('Exhale'); return configs['478'].exhale; }
              if (phase === 'Exhale') { 
                setPhase('Inhale'); 
                setCycles(c => c + 1);
                return configs['478'].inhale; 
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase, technique]);

  const handleFinish = async () => {
    if (cycles > 0 && user) {
      setIsSaving(true);
      try {
        await addDoc(collection(db, "breathworkSessions"), {
          uid: user.uid,
          technique,
          cycles,
          timestamp: new Date().toISOString()
        });
        setIsComplete(true);
      } catch (error) {
        console.error("Error saving breathwork session:", error);
      } finally {
        setIsSaving(false);
        setIsActive(false);
      }
    } else {
      onBack();
    }
  };

  const getPhaseColor = () => {
    if (phase === 'Inhale') return theme.primary;
    if (phase === 'Exhale') return theme.accent;
    return theme.secondary;
  };

  if (isComplete) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 rounded-full bg-primary/10 p-6"
        >
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </motion.div>
        <h2 className="mb-2 text-2xl font-bold" style={{ color: theme.foreground }}>Session Complete</h2>
        <p className="mb-8 text-sm opacity-60" style={{ color: theme.foreground }}>
          You completed {cycles} {cycles === 1 ? 'cycle' : 'cycles'} of {configs[technique].label}. 
          Take a moment to notice how you feel.
        </p>
        <Button 
          onClick={onBack} 
          className="w-full h-14 rounded-2xl font-bold text-background" 
          style={{ backgroundColor: theme.primary }}
        >
          Back to Tools
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="rounded-full p-2 transition-colors hover:bg-white/5" style={{ color: theme.primary }}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-lg font-bold" style={{ color: theme.foreground }}>Breathwork</h2>
        <div className="w-10" />
      </div>

      {!isActive && (
        <ScrollArea className="flex-1">
          <div className="space-y-6 mb-12">
            <div>
              <SectionTitle title="Select Technique" />
              <div className="grid gap-3">
                {(['box', '478'] as const).map(t => (
                  <Card 
                    key={t} 
                    onClick={() => { setTechnique(t); setPhase('Inhale'); setSeconds(configs[t].inhale); }}
                    className={`cursor-pointer border-2 transition-all rounded-3xl ${technique === t ? 'border-primary bg-white/5' : 'border-white/5 bg-secondary'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-sm" style={{ color: theme.foreground }}>{configs[t].label}</div>
                        {technique === t && <CheckCircle2 className="h-5 w-5" style={{ color: theme.primary }} />}
                      </div>
                      <p className="text-[10px] leading-relaxed opacity-60" style={{ color: theme.foreground }}>{configs[t].desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 flex gap-3 items-start">
              <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p className="text-[10px] leading-relaxed opacity-60" style={{ color: theme.foreground }}>
                Breathing exercises help regulate your nervous system. Try to find a quiet space and sit comfortably.
              </p>
            </div>
          </div>
        </ScrollArea>
      )}

      {isActive && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-12 space-y-2">
            <motion.h3 
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold" 
              style={{ color: theme.foreground }}
            >
              {phase}
            </motion.h3>
            <p className="text-lg font-medium tabular-nums" style={{ color: theme.muted }}>{seconds}s</p>
          </div>

          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{
                scale: phase === 'Inhale' ? 1.5 : phase === 'Exhale' ? 1 : 1.5,
                backgroundColor: getPhaseColor(),
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: phase === 'Inhale' ? configs[technique].inhale : phase === 'Exhale' ? configs[technique].exhale : configs[technique].hold,
                ease: "easeInOut",
              }}
              className="flex h-48 w-48 items-center justify-center rounded-full shadow-2xl"
            >
              <Wind className="h-12 w-12 text-white" />
            </motion.div>
            
            {/* Outer Ring */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute h-64 w-64 rounded-full border border-white/10"
            />
          </div>

          <div className="mt-16 space-y-4 w-full max-w-xs">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: theme.muted }}>
              <History className="h-3 w-3" />
              {cycles} {cycles === 1 ? 'cycle' : 'cycles'} completed
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setIsActive(false)} 
                variant="outline"
                className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-white font-bold"
              >
                Pause
              </Button>
              <Button 
                onClick={handleFinish} 
                disabled={isSaving}
                className="flex-1 h-14 rounded-2xl font-bold text-background" 
                style={{ backgroundColor: theme.primary }}
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Finish"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isActive && !isComplete && (
        <div className="pt-4">
          <Button 
            onClick={() => setIsActive(true)} 
            className="w-full h-14 rounded-2xl text-lg font-bold text-background" 
            style={{ backgroundColor: theme.primary }}
          >
            Start Session
          </Button>
        </div>
      )}
    </div>
  );
}
