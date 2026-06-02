import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  Hand, 
  Ear, 
  Waves, 
  Moon, 
  CheckCircle2, 
  ChevronLeft,
  Loader2,
  Info
} from "lucide-react";
import { theme } from "../../theme";
import { db, collection, addDoc } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { CalmingAnimation } from "./CalmingAnimation";

export function GroundingTool({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [inputs, setInputs] = useState<string[][]>([
    ["", "", "", "", ""],
    ["", "", "", ""],
    ["", "", ""],
    ["", ""],
    [""],
  ]);

  const steps = [
    { key: 'see', n: 5, t: "Things you can see", i: <Eye className="h-6 w-6" />, color: theme.primary, desc: "Look around you and identify 5 distinct objects." },
    { key: 'touch', n: 4, t: "Things you can touch", i: <Hand className="h-6 w-6" />, color: theme.secondary, desc: "Notice the texture of your clothes, the chair, or your skin." },
    { key: 'hear', n: 3, t: "Things you can hear", i: <Ear className="h-6 w-6" />, color: theme.accent, desc: "Listen for distant sounds or the hum of electronics." },
    { key: 'smell', n: 2, t: "Things you can smell", i: <Waves className="h-6 w-6" />, color: theme.primary, desc: "Can you notice any scents in the air or on your person?" },
    { key: 'taste', n: 1, t: "Thing you can taste", i: <Moon className="h-6 w-6" />, color: theme.accent, desc: "Focus on the taste in your mouth or take a sip of water." },
  ];

  const handleInputChange = (idx: number, val: string) => {
    const newInputs = [...inputs];
    newInputs[step][idx] = val;
    setInputs(newInputs);
  };

  const isStepComplete = inputs[step].every(i => i.trim().length > 0);

  const handleNext = async () => {
    if (step < 4) {
      setStep(s => s + 1);
    } else {
      await handleFinish();
    }
  };

  const handleFinish = async () => {
    if (user) {
      setIsSaving(true);
      try {
        const responses = {
          see: inputs[0],
          touch: inputs[1],
          hear: inputs[2],
          smell: inputs[3],
          taste: inputs[4],
        };
        await addDoc(collection(db, "groundingSessions"), {
          uid: user.uid,
          timestamp: new Date().toISOString(),
          responses
        });
        setIsComplete(true);
      } catch (error) {
        console.error("Error saving grounding session:", error);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <CheckCircle2 className="h-10 w-10" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: theme.foreground }}>Well Done</h2>
        <p className="text-sm mb-8 opacity-60" style={{ color: theme.foreground }}>
          You've successfully grounded yourself in the present moment. Take a deep breath and notice how you feel.
        </p>
        <Button 
          onClick={onBack} 
          className="w-full h-14 rounded-2xl text-background font-bold shadow-lg" 
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
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map(s => (
            <div 
              key={s} 
              className={`h-1.5 w-6 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-white/10'}`} 
            />
          ))}
        </div>
        <div className="w-10" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col"
        >
          <div className="mb-8 space-y-3">
            <CalmingAnimation />
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-[2rem] shadow-inner" style={{ backgroundColor: theme.soft }}>
                {steps[step].i}
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: theme.foreground }}>{steps[step].n} {steps[step].t}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: theme.foreground }}>Step {step + 1} of 5</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 flex gap-3 items-start">
              <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p className="text-xs leading-relaxed opacity-60" style={{ color: theme.foreground }}>{steps[step].desc}</p>
            </div>
          </div>

          <ScrollArea className="flex-1 -mx-2 px-2">
            <div className="space-y-3 pb-8">
              {inputs[step].map((val, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Input 
                    placeholder={`Item ${idx + 1}...`}
                    value={val}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    className="h-14 rounded-2xl border-0 bg-white/5 shadow-sm text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-primary/30"
                  />
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </motion.div>
      </AnimatePresence>

      <div className="pt-4">
        <Button 
          disabled={!isStepComplete || isSaving}
          onClick={handleNext}
          className="w-full h-14 rounded-2xl transition-all font-bold text-background shadow-lg"
          style={{ 
            backgroundColor: isStepComplete ? theme.primary : 'rgba(255,255,255,0.05)', 
            color: isStepComplete ? theme.background : 'rgba(255,255,255,0.2)' 
          }}
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (step === 4 ? "Complete Exercise" : "Next Step")}
        </Button>
      </div>
    </div>
  );
}
