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
  Brain,
  ShieldAlert,
  Heart,
  Users
} from "lucide-react";
import { useAppTheme } from "../../theme/AppTheme";
import { db, collection, addDoc, serverTimestamp } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";

export function DBTTool({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<'form' | 'summary'>('form');
  const [formData, setFormData] = useState({
    mindfulness: "",
    emotions: "",
    distressTolerance: "",
    interpersonal: "",
    urges: 50,
  });

  const steps = [
    { 
      key: 'mindfulness', 
      label: 'Mindfulness', 
      prompt: 'What was your primary focus today?', 
      placeholder: 'e.g., Practiced Wise Mind during a stressful call...', 
      desc: "Mindfulness helps you stay present and non-judgmental.",
      icon: Brain
    },
    { 
      key: 'emotions', 
      label: 'Emotion Regulation', 
      prompt: 'What emotions did you experience?', 
      placeholder: 'e.g., Felt intense sadness but used opposite action...', 
      desc: "Identify emotions and check if they fit the facts.",
      icon: Heart
    },
    { 
      key: 'distressTolerance', 
      label: 'Distress Tolerance', 
      prompt: 'Did you use any crisis survival skills?', 
      placeholder: 'e.g., Used TIPP (Cold Water) to calm down...', 
      desc: "Skills to get through a crisis without making it worse.",
      icon: ShieldAlert
    },
    { 
      key: 'interpersonal', 
      label: 'Interpersonal', 
      prompt: 'How did you manage interactions?', 
      placeholder: 'e.g., Used DEAR MAN to ask for a day off...', 
      desc: "Skills for maintaining relationships and self-respect.",
      icon: Users
    },
  ];

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "dbtRecords"), {
        ...formData,
        uid: user.uid,
        timestamp: serverTimestamp(),
        type: 'dbt-diary-card'
      });
      setView('summary');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "dbtRecords");
    } finally {
      setIsSaving(false);
    }
  };

  if (view === 'summary') {
    return (
      <div className="flex h-full flex-col p-6 bg-background">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold" style={{ color: colors.text }}>DBT Entry Saved</h2>
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
              <div className="font-bold text-lg" style={{ color: colors.text }}>Skills Logged</div>
              <div className="text-xs opacity-60" style={{ color: colors.text }}>Great job practicing your skills today.</div>
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
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (step === steps.length - 1 ? "Complete Entry" : "Next Step")}
          </Button>
        </div>
      </div>
    </div>
  );
}
