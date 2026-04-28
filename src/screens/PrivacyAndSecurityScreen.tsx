import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, MapPin, Eye, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { addDoc, collection, serverTimestamp, db } from "../firebase";
import { theme } from "../theme";

interface PrivacyAndSecurityScreenProps {
  onBack: () => void;
}

export function PrivacyAndSecurityScreen({ onBack }: PrivacyAndSecurityScreenProps) {
  const [patrolMode, setPatrolMode] = useState(false);
  const { user } = useAuth();

  const togglePatrolMode = async (enabled: boolean) => {
    setPatrolMode(enabled);
    if (!user) return;
    
    // Server-side compliance logging
    try {
        await addDoc(collection(db, "compliance_logs"), {
            uid: user.uid,
            action: enabled ? "patrol_mode_enabled" : "patrol_mode_disabled",
            timestamp: serverTimestamp(),
        });
    } catch (e) {
        console.error("Compliance logging failed", e);
    }
  };

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="flex items-center p-6 border-b border-white/5">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-2xl font-serif font-bold" style={{ color: theme.foreground }}>Privacy & Security</h2>
      </div>
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold flex items-center gap-2" style={{ color: theme.foreground }}>
              <MapPin className="h-5 w-5 text-primary" /> Location Tracking
            </h3>
            <p className="text-sm opacity-60">
              Control how your location is shared for welfare checks and patrol sweeps.
            </p>
          </div>

          <div className="p-5 rounded-[2rem] glass flex items-center justify-between">
            <div>
              <span className="font-bold block" style={{ color: theme.foreground }}>Enable Patrol Mode</span>
              <span className="text-[10px] font-medium opacity-40 uppercase tracking-widest block mt-1">Background pings every 5 min.</span>
            </div>
            <Switch 
              checked={patrolMode}
              onCheckedChange={togglePatrolMode}
            />
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs leading-relaxed">
            <strong>Disclosure:</strong> Continuous tracking without explicit, ongoing disclosure is high-risk. By enabling Patrol Mode, you consent to background location pings while active. A persistent notification will appear while active.
          </div>

          <div className="pt-6 border-t border-white/5">
              <h3 className="font-bold flex items-center gap-2 mb-4" style={{ color: theme.foreground }}>
                  <ShieldCheck className="h-5 w-5 text-primary" /> Data Usage
              </h3>
              <p className="text-sm opacity-60">
                  Your data is compliant with PHIPA/PIPEDA and stored with AES-256 encryption.
              </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
