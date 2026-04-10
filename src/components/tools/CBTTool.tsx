import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  ChevronLeft 
} from "lucide-react";
import { theme } from "../../theme";

export function CBTTool({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    situation: "",
    automaticThought: "",
    emotion: "",
    evidence: "",
    balancedThought: "",
  });
  const [view, setView] = useState<'form' | 'summary'>('form');

  const steps = [
    { key: 'situation', label: 'Situation', prompt: 'What happened? Describe the event briefly.', placeholder: 'e.g., I missed a meeting...' },
    { key: 'automaticThought', label: 'Automatic Thought', prompt: 'What went through your mind?', placeholder: 'e.g., I am failing at this...' },
    { key: 'emotion', label: 'Emotion', prompt: 'How did it make you feel? (0-100)', placeholder: 'e.g., Anxiety (80)' },
    { key: 'evidence', label: 'Evidence', prompt: 'What facts support or challenge this thought?', placeholder: 'e.g., I have been on time for 20 other meetings...' },
    { key: 'balancedThought', label: 'Balanced Thought', prompt: 'How can you reframe this more realistically?', placeholder: 'e.g., I made a mistake, but I am still capable...' },
  ];

  const handleComplete = () => {
    setView('summary');
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
            <div className="rounded-3xl bg-white/5 p-6 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3" style={{ color: theme.primary }} />
              <div className="font-bold text-lg" style={{ color: theme.foreground }}>Thought Reframed</div>
              <div className="text-sm" style={{ color: theme.muted }}>Stored locally & ready for sync</div>
            </div>
            {steps.map(s => (
              <div key={s.key} className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.muted }}>{s.label}</div>
                <div className="text-sm font-medium p-4 rounded-2xl bg-secondary border border-white/5" style={{ color: theme.foreground }}>
                  {(formData as any)[s.key]}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Button onClick={() => { setFormData({situation:"", automaticThought:"", emotion:"", evidence:"", balancedThought:""}); setStep(0); setView('form'); }} className="w-full h-14 rounded-2xl font-bold text-background" style={{ backgroundColor: theme.primary }}>New Record</Button>
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
        <div className="text-[10px] font-bold" style={{ color: theme.muted }}>{step + 1}/{steps.length}</div>
      </div>

      <div className="mb-8 space-y-2">
        <h2 className="text-2xl font-bold" style={{ color: theme.foreground }}>{steps[step].label}</h2>
        <p className="text-sm" style={{ color: theme.muted }}>{steps[step].prompt}</p>
      </div>

      <div className="flex-1">
        <textarea 
          className="w-full h-48 rounded-3xl border-0 bg-white/5 p-6 shadow-sm focus:outline-none text-lg text-white placeholder:text-white/20 resize-none"
          placeholder={steps[step].placeholder}
          value={(formData as any)[steps[step].key]}
          onChange={(e) => setFormData({...formData, [steps[step].key]: e.target.value})}
        />
      </div>

      <div className="flex gap-3 mt-4">
        {step > 0 && (
          <Button onClick={() => setStep(s => s - 1)} variant="outline" className="h-14 w-20 rounded-2xl border-white/10 bg-white/5 text-white/80">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        <Button 
          disabled={!(formData as any)[steps[step].key].trim()}
          onClick={() => step === steps.length - 1 ? handleComplete() : setStep(s => s + 1)}
          className="flex-1 h-14 rounded-2xl font-bold text-background"
          style={{ backgroundColor: (formData as any)[steps[step].key].trim() ? theme.primary : 'rgba(255,255,255,0.05)', color: (formData as any)[steps[step].key].trim() ? theme.background : 'rgba(255,255,255,0.2)' }}
        >
          {step === steps.length - 1 ? "Save Record" : "Next"}
        </Button>
      </div>
    </div>
  );
}
