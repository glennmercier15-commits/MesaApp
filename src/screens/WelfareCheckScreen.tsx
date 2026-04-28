import React, { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Navigation, ShieldCheck, AlertTriangle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { theme } from "../theme";
import { locationService } from "../services/locationService";
import { useAuth } from "../context/AuthContext";
import { addDoc, collection, serverTimestamp, db } from "../firebase";

interface WelfareCheckScreenProps {
  onBack: () => void;
}

export function WelfareCheckScreen({ onBack }: WelfareCheckScreenProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'locating' | 'sent' | 'error'>('idle');
  const [isPatrolMode, setIsPatrolMode] = useState(false);

  const handleCheckIn = async () => {
    if (!user) return;
    setStatus('locating');
    
    try {
      const position = await locationService.getCurrentPosition() as any;
      
      await addDoc(collection(db, "welfareChecks"), {
        uid: user.uid,
        location: {
          latitude: position.latitude,
          longitude: position.longitude,
        },
        timestamp: serverTimestamp(),
        type: 'snapshot'
      });
      
      setStatus('sent');
    } catch (error) {
      console.error("Error sending location snapshot:", error);
      setStatus('error');
    }
  };

  const togglePatrolMode = () => {
    if (isPatrolMode) {
      locationService.stopBackgroundPatrol();
    } else {
      locationService.startBackgroundPatrol();
    }
    setIsPatrolMode(!isPatrolMode);
  };

  return (
    <div className="flex h-full flex-col p-6 bg-background">
      <button onClick={onBack} className="flex items-center text-sm font-medium mb-8 transition-opacity hover:opacity-80" style={{ color: theme.primary }}>
        <ChevronLeft className="mr-1 h-4 w-4" /> Back
      </button>

      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold" style={{ color: theme.foreground }}>Welfare Check</h2>
        <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
          Submit a one-time GPS snapshot or enable Patrol Mode for active sweeps in Renfrew County.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {status === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 w-full">
            <div className="mx-auto h-32 w-32 rounded-full bg-white/5 flex items-center justify-center shadow-2xl">
              <MapPin className="h-12 w-12" style={{ color: theme.primary }} />
            </div>
            <div className="space-y-4">
              <Card className="border-0 shadow-sm rounded-3xl" style={{ backgroundColor: theme.secondary }}>
                <CardContent className="p-4 flex items-start gap-3 text-left">
                  <ShieldCheck className="h-5 w-5 mt-0.5" style={{ color: theme.primary }} />
                  <div>
                    <div className="text-sm font-bold" style={{ color: theme.foreground }}>PHIPA Compliant</div>
                    <div className="text-xs" style={{ color: theme.muted }}>
                      {isPatrolMode 
                        ? "Patrol Mode ACTIVE: Background tracking 5min pings enabled."
                        : "Only a single snapshot is sent. No continuous tracking."}
                    </div>
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
              <Button 
                onClick={togglePatrolMode}
                variant="outline"
                className={`w-full h-16 rounded-2xl text-lg font-bold border-2 ${isPatrolMode ? 'border-amber-500 text-amber-500' : 'border-white/10'}`}
              >
                {isPatrolMode ? 'Stop Patrol Mode' : 'Start Patrol Mode'}
              </Button>
              {isPatrolMode && (
                <div className="flex items-center justify-center gap-2 text-amber-500 text-xs font-bold animate-pulse mt-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  PERSISTENT TRACKING ACTIVE
                </div>
              )}
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
        {status === 'error' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
            <div className="mx-auto h-32 w-32 rounded-full bg-red-500/10 flex items-center justify-center shadow-2xl">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-red-500">Error Sending Location</h3>
              <p className="text-sm" style={{ color: theme.muted }}>Please check your connection and try again.</p>
            </div>
            <Button 
              onClick={() => setStatus('idle')}
              variant="outline"
              className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-white/80 font-bold" 
            >
              Try Again
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
