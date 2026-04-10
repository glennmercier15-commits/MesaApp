import React, { useState } from "react";
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
  ChevronLeft 
} from "lucide-react";
import { theme } from "../../theme";

export function GroundingTool({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<string[][]>([
    ["", "", "", "", ""],
    ["", "", "", ""],
    ["", "", ""],
    ["", ""],
    [""],
  ]);

  const steps = [
    { n: 5, t: "Things you can see", i: <Eye className="h-6 w-6" />, color: theme.primary },
    { n: 4, t: "Things you can touch", i: <Hand className="h-6 w-6" />, color: theme.secondary },
    { n: 3, t: "Things you can hear", i: <Ear className="h-6 w-6" />, color: theme.accent },
    { n: 2, t: "Things you can smell", i: <Waves className="h-6 w-6" />, color: theme.primary },
    { n: 1, t: "Thing you can taste", i: <Moon className="h-6 w-6" />, color: theme.accent },
  ];

  const handleInputChange = (idx: number, val: string) => {
    const newInputs = [...inputs];
    newInputs[step][idx] = val;
    setInputs(newInputs);
  };

  const isStepComplete = inputs[step].every(i => i.trim().length > 0);

  if (step === 5) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-primary">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: theme.foreground }}>Well Done</h2>
        <p className="text-sm mb-8" style={{ color: theme.muted }}>You've successfully grounded yourself in the present moment. Take a deep breath.</p>
        <Button onClick={onBack} className="w-full h-14 rounded-2xl text-background font-bold" style={{ backgroundColor: theme.primary }}>Back to Tools</Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="rounded-full p-2 transition-colors hover:bg-white/5" style={{ color: theme.primary }}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 w-6 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-white/10'}`} />
          ))}
        </div>
        <div className="w-10" />
      </div>

      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl" style={{ backgroundColor: theme.soft }}>
            {steps[step].i}
          </div>
          <h2 className="text-2xl font-bold" style={{ color: theme.foreground }}>{steps[step].n} {steps[step].t}</h2>
        </div>
        <p className="text-sm" style={{ color: theme.muted }}>Take your time. Notice the details around you.</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 pb-8">
          {inputs[step].map((val, idx) => (
            <Input 
              key={idx}
              placeholder={`Item ${idx + 1}...`}
              value={val}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              className="h-14 rounded-2xl border-0 bg-white/5 shadow-sm text-white placeholder:text-white/20"
            />
          ))}
        </div>
      </ScrollArea>

      <Button 
        disabled={!isStepComplete}
        onClick={() => setStep(s => s + 1)}
        className="w-full h-14 rounded-2xl mt-4 transition-all font-bold text-background"
        style={{ backgroundColor: isStepComplete ? theme.primary : 'rgba(255,255,255,0.05)', color: isStepComplete ? theme.background : 'rgba(255,255,255,0.2)' }}
      >
        Next Step
      </Button>
    </div>
  );
}
