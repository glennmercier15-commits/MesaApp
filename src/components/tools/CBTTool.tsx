import React, { useState, useEffect } from "react";
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
  History
} from "lucide-react";
import { theme } from "../../theme";
import { db, collection, addDoc, updateDoc, doc, serverTimestamp } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

export function CBTTool({ onBack, initialData, recordId }: { onBack: () => void; initialData?: any; recordId?: string }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(recordId || null);
  const [formData, setFormData] = useState({
    situation: initialData?.situation || "",
    automaticThought: initialData?.automaticThought || "",
    emotion: initialData?.emotion || "",
    evidence: initialData?.evidence || "",
    balancedThought: initialData?.balancedThought || "",
  });
  const [view, setView] = useState<'form' | 'summary'>('form');

  const steps = [
    { key: 'situation', label: 'Situation', prompt: 'What happened? Describe the event briefly.', placeholder: 'e.g., I missed a meeting...', desc: "Focus on the facts of what triggered the thought." },
    { key: 'automaticThought', label: 'Automatic Thought', prompt: 'What went through your mind?', placeholder: 'e.g., I am failing at this...', desc: "Write down the first thought that came to you." },
    { key: 'emotion', label: 'Emotion', prompt: 'How did it make you feel? (0-100)', placeholder: 'e.g., Anxiety (80)', desc: "Identify the feeling and its intensity." },
    { key: 'evidence', label: 'Evidence', prompt: 'What facts support or challenge this thought?', placeholder: 'e.g., I have been on time for 20 other meetings...', desc: "Look for objective facts, not just feelings." },
    { key: 'balancedThought', label: 'Balanced Thought', prompt: 'How can you reframe this more realistically?', placeholder: 'e.g., I made a mistake, but I am still capable...', desc: "Create a more helpful, realistic perspective." },
  ];

  const handleSave = async (status: 'draft' | 'completed') => {
    if (!user) return;
    setIsSaving(true);
    try {
      const data = {
        ...formData,
        uid: user.uid,
        status,
        updatedAt: new Date().toISOString()
      };

      if (currentRecordId) {
        await updateDoc(doc(db, "cbtRecords", currentRecordId), data);
      } else {
        const docRef = await addDoc(collection(db, "cbtRecords"), data);
        setCurrentRecordId(docRef.id);
      }

      if (status === 'completed') {
        setView('summary');
      } else {
        // Just show a temporary success state or toast if we had one
        // For now, we'll just stay on the form but maybe show a visual cue
      }
    } catch (error) {
      console.error("Error saving CBT record:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (view === 'summary') {
    return (
      <div className="flex h-full flex-col p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold" style={{ color: theme.foreground }}>Record Saved</h2>
          <button onClick={onBack} className="text-sm font-bold" style={{ color: theme.primary }}>Done</button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-6 pb-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-3xl bg-white/5 p-6 text-center"
            >
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3" style={{ color: theme.primary }} />
              <div className="font-bold text-lg" style={{ color: theme.foreground }}>Thought Reframed</div>
              <div className="text-xs opacity-60" style={{ color: theme.foreground }}>This record is saved to your history.</div>
            </motion.div>
            {steps.map(s => (
              <div key={s.key} className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: theme.foreground }}>{s.label}</div>
                <div className="text-sm font-medium p-4 rounded-2xl bg-secondary border border-white/5" style={{ color: theme.foreground }}>
                  {(formData as any)[s.key]}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="pt-4">
          <Button onClick={() => { setFormData({situation:"", automaticThought:"", emotion:"", evidence:"", balancedThought:""}); setStep(0); setView('form'); setCurrentRecordId(null); }} className="w-full h-14 rounded-2xl font-bold text-background" style={{ backgroundColor: theme.primary }}>New Record</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="rounded-full p-2 transition-colors hover:bg-white/5" style={{ color: theme.primary }}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 mx-4">
          <Progress value={((step + 1) / steps.length) * 100} className="h-1.5 bg-white/10" />
        </div>
        <div className="text-[10px] font-bold opacity-40" style={{ color: theme.foreground }}>{step + 1}/{steps.length}</div>
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
            <h2 className="text-2xl font-bold" style={{ color: theme.foreground }}>{steps[step].label}</h2>
            <p className="text-sm opacity-60" style={{ color: theme.foreground }}>{steps[step].prompt}</p>
            <div className="rounded-2xl bg-white/5 p-4 flex gap-3 items-start">
              <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p className="text-[10px] leading-relaxed opacity-60" style={{ color: theme.foreground }}>{steps[step].desc}</p>
            </div>
          </div>

          <div className="flex-1">
            <textarea 
              className="w-full h-48 rounded-3xl border-0 bg-white/5 p-6 shadow-sm focus:outline-none text-lg text-white placeholder:text-white/20 resize-none focus-visible:ring-1 focus-visible:ring-primary/30"
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
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            variant="outline"
            className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-white/80 font-bold flex gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Progress
          </Button>
        </div>
        
        <Button 
          disabled={!(formData as any)[steps[step].key].trim() || isSaving}
          onClick={() => step === steps.length - 1 ? handleSave('completed') : setStep(s => s + 1)}
          className="w-full h-14 rounded-2xl font-bold text-background shadow-lg"
          style={{ 
            backgroundColor: (formData as any)[steps[step].key].trim() ? theme.primary : 'rgba(255,255,255,0.05)', 
            color: (formData as any)[steps[step].key].trim() ? theme.background : 'rgba(255,255,255,0.2)' 
          }}
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (step === steps.length - 1 ? "Complete & Save" : "Next Step")}
        </Button>
      </div>
    </div>
  );
}
