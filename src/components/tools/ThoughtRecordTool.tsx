import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  ChevronLeft,
  Save,
  Loader2,
  Info,
  Scale,
  MessageSquare,
  Smile,
  Zap,
  RefreshCw
} from "lucide-react";
import { useAppTheme } from "../../theme/AppTheme";
import { db, collection, addDoc, serverTimestamp } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";

export function ThoughtRecordTool({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<'form' | 'summary'>('form');
  const [formData, setFormData] = useState({
    situation: "",
    automaticThought: "",
    emotion: "",
    evidence: "",
    balancedThought: "",
  });

  const steps = [
    { 
      key: 'situation', 
      label: 'Situation', 
      prompt: 'What happened? Describe the event briefly.', 
      placeholder: 'e.g., I missed a meeting...', 
      desc: "Focus on the facts of what triggered the thought.",
      icon: MessageSquare
    },
    { 
      key: 'automaticThought', 
      label: 'Automatic Thought', 
      prompt: 'What went through your mind?', 
      placeholder: 'e.g., I am failing at this...', 
      desc: "Write down the first thought that came to you.",
      icon: Zap
    },
    { 
      key: 'emotion', 
      label: 'Emotion', 
      prompt: 'How did it make you feel? (0-100)', 
      placeholder: 'e.g., Anxiety (80)', 
      desc: "Identify the feeling and its intensity.",
      icon: Smile
    },
    { 
      key: 'evidence', 
      label: 'Evidence', 
      prompt: 'What facts support or challenge this thought?', 
      placeholder: 'e.g., I have been on time for 20 other meetings...', 
      desc: "Look for objective facts, not just feelings.",
      icon: Scale
    },
    { 
      key: 'balancedThought', 
      label: 'Balanced Thought', 
      prompt: 'How can you reframe this more realistically?', 
      placeholder: 'e.g., I made a mistake, but I am still capable...', 
      desc: "Create a more helpful, realistic perspective.",
      icon: RefreshCw
    },
  ];

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "thoughtRecords"), {
        ...formData,
        uid: user.uid,
        timestamp: serverTimestamp(),
        type: 'thought-record'
      });
      setView('summary');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "thoughtRecords");
    } finally {
      setIsSaving(false);
    }
  };

  if (view === 'summary') {
    return (
      <div className="flex h-full flex-col p-6 bg-background">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold" style={{ color: colors.text }}>Thought Recorded</h2>
          <button onClick={onBack} className="text-sm font-bold" style={{ color: colors.primary }}>Done</button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-6 pb-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-3xl p-6 text-center"
              style={{ backgroundColor: colors.surfaceAlt }}
            >
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
              <div className="font-bold text-lg" style={{ color: colors.text }}>Perspective Shifted</div>
              <div className="text-xs opacity-60" style={{ color: colors.text }}>You've successfully reframed your thought.</div>
            </motion.div>
            {steps.map(s => (
              <div key={s.key} className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: colors.text }}>{s.label}</div>
                <div className="text-sm font-medium p-4 rounded-2xl border border-white/5" style={{ backgroundColor: colors.surfaceAlt, color: colors.text }}>
                  {(formData as any)[s.key] || "No entry"}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="pt-4">
          <Button onClick={onBack} className="w-full h-14 rounded-2xl font-bold text-white primary-gradient">Return to Tools</Button>
        </div>
      </div>
    );
  }

  const CurrentIcon = steps[step].icon;

  return (
    <div className="flex h-full flex-col p-6 bg-background">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="rounded-full p-2 transition-colors hover:bg-white/5" style={{ color: colors.primary }}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 mx-4">
          <Progress value={((step + 1) / steps.length) * 100} className="h-1.5" />
        </div>
        <div className="text-[10px] font-bold opacity-40" style={{ color: colors.text }}>{step + 1}/{steps.length}</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col"
        >
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <CurrentIcon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: colors.text }}>{steps[step].label}</h2>
            </div>
            <p className="text-sm opacity-60" style={{ color: colors.text }}>{steps[step].prompt}</p>
            <div className="rounded-2xl p-4 flex gap-3 items-start" style={{ backgroundColor: colors.surfaceAlt }}>
              <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p className="text-[10px] leading-relaxed opacity-60" style={{ color: colors.text }}>{steps[step].desc}</p>
            </div>
          </div>

          <div className="flex-1">
            <textarea 
              className="w-full h-48 rounded-3xl border-0 p-6 shadow-sm focus:outline-none text-lg text-white placeholder:text-white/20 resize-none focus-visible:ring-1 focus-visible:ring-primary/30"
              style={{ backgroundColor: colors.surfaceAlt }}
              placeholder={steps[step].placeholder}
              value={(formData as any)[steps[step].key]}
              onChange={(e) => setFormData({...formData, [steps[step].key]: e.target.value})}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col gap-3 mt-4">
        <div className="flex gap-3">
          {step > 0 && (
            <Button onClick={() => setStep(s => s - 1)} variant="outline" className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 text-white/80">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          <Button 
            disabled={!(formData as any)[steps[step].key].trim() || isSaving}
            onClick={() => step === steps.length - 1 ? handleSave() : setStep(s => s + 1)}
            className="flex-1 h-14 rounded-2xl font-bold text-white primary-gradient shadow-lg"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (step === steps.length - 1 ? "Complete Record" : "Next Step")}
          </Button>
        </div>
      </div>
    </div>
  );
}
