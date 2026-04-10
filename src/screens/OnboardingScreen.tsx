import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Heart, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { theme } from "../theme";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: "Welcome to MindBridge",
      description: "A trauma-informed companion for your recovery journey in Renfrew County.",
      icon: Heart,
      color: theme.primary
    },
    {
      title: "Secure & Private",
      description: "Your data is PHIPA-compliant and encrypted. You control what you share with your care team.",
      icon: Shield,
      color: theme.primary
    },
    {
      title: "Recovery at Your Pace",
      description: "Tools for grounding, CBT, and tracking milestones without the pressure of streaks.",
      icon: Sparkles,
      color: theme.primary
    }
  ];

  const next = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-col items-center"
        >
          <div className="mb-12 rounded-[2.5rem] p-8 bg-white/5 shadow-2xl">
            {React.createElement(slides[step].icon, { 
              className: "h-16 w-16", 
              style: { color: slides[step].color } 
            })}
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: theme.foreground }}>{slides[step].title}</h1>
          <p className="text-lg leading-relaxed mb-12" style={{ color: theme.muted }}>{slides[step].description}</p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-auto w-full space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-primary' : 'w-2 bg-white/10'}`} 
            />
          ))}
        </div>
        <Button 
          onClick={next} 
          className="w-full h-16 rounded-2xl text-lg font-bold text-background" 
          style={{ backgroundColor: theme.primary }}
        >
          {step === slides.length - 1 ? "Get Started" : "Continue"}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
