import React, { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Navigation, ShieldCheck, AlertTriangle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { theme } from "../theme";

interface WelfareCheckScreenProps {
  onBack: () => void;
}

export function WelfareCheckScreen({ onBack }: WelfareCheckScreenProps) {
  const [status, setStatus] = useState<'idle' | 'locating' | 'sent'>('idle');

  const handleCheckIn = () => {
    setStatus('locating');
    setTimeout(() => {
      setStatus('sent');
    }, 2000);
  };

  return (
    <div className="flex h-full flex-col p-6 bg-background">
      <button onClick={onBack} className="flex items-center text-sm font-medium mb-8 transition-opacity hover:opacity-80" style={{ color: theme.primary }}>
        <ChevronLeft className="mr-1 h-4 w-4" /> Back
      </button>

      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold" style={{ color: theme.foreground }}>Welfare Check</h2>
        <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
          Submit a one-time GPS snapshot to your outreach team. This is used for safety sweeps in Renfrew County.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {status === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8">
            <div className="mx-auto h-32 w-32 rounded-full bg-white/5 flex items-center justify-center shadow-2xl">
              <MapPin className="h-12 w-12" style={{ color: theme.primary }} />
            </div>
            <div className="space-y-4">
              <Card className="border-0 shadow-sm rounded-3xl" style={{ backgroundColor: theme.secondary }}>
                <CardContent className="p-4 flex items-start gap-3 text-left">
                  <ShieldCheck className="h-5 w-5 mt-0.5" style={{ color: theme.primary }} />
                  <div>
                    <div className="text-sm font-bold" style={{ color: theme.foreground }}>PHIPA Compliant</div>
                    <div className="text-xs" style={{ color: theme.muted }}>Only a single snapshot is sent. No continuous tracking.</div>
                  </div>
                </CardContent>
              </Card>
              <Button 
                onClick={handleCheckIn}
                className="w-full h-16 rounded-2xl text-lg font-bold text-background" 
                style={{ backgroundColor: theme.primary }}
              >
                Send Location Snapshot
              </Button>
            </div>
          </motion.div>
        )}

        {status === 'locating' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full border-4 border-primary/20 animate-ping absolute inset-0" />
              <div className="h-32 w-32 rounded-full bg-white/5 flex items-center justify-center relative z-10">
                <Navigation className="h-12 w-12 animate-pulse" style={{ color: theme.primary }} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold" style={{ color: theme.foreground }}>Locating...</h3>
              <p className="text-sm" style={{ color: theme.muted }}>Capturing GPS coordinates for MESA team.</p>
            </div>
          </motion.div>
        )}

        {status === 'sent' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
            <div className="mx-auto h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center shadow-2xl">
              <ShieldCheck className="h-16 w-16" style={{ color: theme.primary }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold" style={{ color: theme.foreground }}>Snapshot Sent</h3>
              <p className="text-sm" style={{ color: theme.muted }}>Your location has been logged with the outreach team.</p>
            </div>
            <Button 
              onClick={onBack}
              variant="outline"
              className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-white/80 font-bold" 
            >
              Return to Home
            </Button>
          </motion.div>
        )}
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-500" />
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-500 uppercase tracking-widest">Emergency</div>
            <p className="text-[10px] leading-relaxed" style={{ color: theme.muted }}>
              If you are in immediate danger, please use the Crisis Bar or call 911 directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
