import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Wind, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { theme } from "../../theme";

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold tracking-wide" style={{ color: theme.foreground }}>{title}</h3>
      {action ? <button className="text-xs font-medium" style={{ color: theme.primary }}>{action}</button> : null}
    </div>
  );
}

export function BreathworkTool({ onBack }: { onBack: () => void }) {
  const [technique, setTechnique] = useState<'box' | '478'>('box');
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Hold2'>('Inhale');
  const [seconds, setSeconds] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const configs = {
    box: { inhale: 4, hold: 4, exhale: 4, hold2: 4, label: "Box Breathing (4-4-4-4)" },
    '478': { inhale: 4, hold: 7, exhale: 8, hold2: 0, label: "4-7-8 Relaxing Breath" },
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

  const getPhaseColor = () => {
    if (phase === 'Inhale') return theme.primary;
    if (phase === 'Exhale') return theme.accent;
    return theme.secondary;
  };

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
        <div className="space-y-4 mb-12">
          <SectionTitle title="Select Technique" />
          <div className="grid gap-3">
            {(['box', '478'] as const).map(t => (
              <Card 
                key={t} 
                onClick={() => { setTechnique(t); setPhase('Inhale'); setSeconds(configs[t].inhale); }}
                className={`cursor-pointer border-2 transition-all rounded-3xl ${technique === t ? 'border-primary bg-white/5' : 'border-white/5 bg-secondary'}`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="font-bold text-sm" style={{ color: theme.foreground }}>{configs[t].label}</div>
                  {technique === t && <CheckCircle2 className="h-5 w-5" style={{ color: theme.primary }} />}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-8 space-y-2">
          <h3 className="text-3xl font-bold" style={{ color: theme.foreground }}>{isActive ? phase : "Ready?"}</h3>
          <p className="text-sm" style={{ color: theme.muted }}>{isActive ? `${seconds}s remaining` : "Tap start to begin"}</p>
        </div>

        <motion.div
          animate={{
            scale: isActive ? (phase === 'Inhale' ? 1.5 : phase === 'Exhale' ? 1 : 1.5) : 1,
            backgroundColor: isActive ? getPhaseColor() : 'rgba(255,255,255,0.05)',
          }}
          transition={{
            duration: isActive ? (phase === 'Inhale' ? configs[technique].inhale : phase === 'Exhale' ? configs[technique].exhale : configs[technique].hold) : 0.5,
            ease: "easeInOut",
          }}
          className="flex h-48 w-48 items-center justify-center rounded-full shadow-2xl"
        >
          <Wind className="h-12 w-12 text-white" />
        </motion.div>

        <div className="mt-12 space-y-4 w-full max-w-xs">
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.muted }}>
            {cycles} {cycles === 1 ? 'cycle' : 'cycles'} completed
          </div>
          <Button 
            onClick={() => setIsActive(!isActive)} 
            className="w-full h-14 rounded-2xl text-lg font-bold text-background" 
            style={{ backgroundColor: theme.primary }}
          >
            {isActive ? "Pause" : "Start Session"}
          </Button>
        </div>
      </div>
    </div>
  );
}
