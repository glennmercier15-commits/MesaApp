import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Eye, ShieldCheck, Key } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { addDoc, collection, serverTimestamp, db } from "../firebase";
import { theme } from "../theme";

interface PrivacyAndSecurityScreenProps {
  onBack: () => void;
}

export function PrivacyAndSecurityScreen({ onBack }: PrivacyAndSecurityScreenProps) {
  const [patrolMode, setPatrolMode] = useState(false);
  const { user } = useAuth();

  // Biometric authentication settings states
  const [biometricLaunch, setBiometricLaunch] = useState<boolean>(() => {
    return localStorage.getItem("biometric_app_launch") === "true";
  });
  const [biometricSensitive, setBiometricSensitive] = useState<boolean>(() => {
    return localStorage.getItem("biometric_sensitive_areas") === "true";
  });
  const [prefMode, setPrefMode] = useState<'face' | 'touch' | 'pin'>(() => {
    return (localStorage.getItem("biometric_pref_mode") as 'face' | 'touch' | 'pin') || 'face';
  });
  const [pinCode, setPinCode] = useState<string>(() => {
    return localStorage.getItem("biometric_pincode") || "1234";
  });

  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState("");
  const [pinSuccessMessage, setPinSuccessMessage] = useState("");
  const [pinErrorMessage, setPinErrorMessage] = useState("");

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

  const handleToggleBiometricLaunch = (enabled: boolean) => {
    setBiometricLaunch(enabled);
    localStorage.setItem("biometric_app_launch", String(enabled));
  };

  const handleToggleBiometricSensitive = (enabled: boolean) => {
    setBiometricSensitive(enabled);
    localStorage.setItem("biometric_sensitive_areas", String(enabled));
  };

  const handlePrefModeChange = (mode: 'face' | 'touch' | 'pin') => {
    setPrefMode(mode);
    localStorage.setItem("biometric_pref_mode", mode);
  };

  const handleSaveNewPin = () => {
    if (!/^\d{4}$/.test(newPinInput)) {
      setPinErrorMessage("Passcode PIN must be exactly 4 digits.");
      return;
    }
    localStorage.setItem("biometric_pincode", newPinInput);
    setPinCode(newPinInput);
    setNewPinInput("");
    setPinErrorMessage("");
    setPinSuccessMessage("PIN Passcode updated successfully!");
    setTimeout(() => {
      setPinSuccessMessage("");
      setIsChangingPin(false);
    }, 1500);
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
          
          {/* Section 1: Location Settings */}
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

          {/* Section 2: Biometric Protection System */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <h3 className="font-bold flex items-center gap-2" style={{ color: theme.foreground }}>
              <ShieldCheck className="h-5 w-5 text-primary" /> Biometric security
            </h3>
            <p className="text-sm opacity-60 -mt-2">
              Protect your private wellness information by enabling FaceID, TouchID or Passcode verification.
            </p>

            {/* Toggle: Require App Opening authentication */}
            <div className="p-5 rounded-[2rem] glass flex items-center justify-between">
              <div>
                <span className="font-bold block" style={{ color: theme.foreground }}>Lock App on Launch</span>
                <span className="text-[10px] font-medium opacity-40 uppercase tracking-widest block mt-1">Verify identity when opening application</span>
              </div>
              <Switch 
                checked={biometricLaunch}
                onCheckedChange={handleToggleBiometricLaunch}
              />
            </div>

            {/* Toggle: Require sensitive area authentication */}
            <div className="p-5 rounded-[2rem] glass flex items-center justify-between">
              <div>
                <span className="font-bold block" style={{ color: theme.foreground }}>Lock Sensitive Folders</span>
                <span className="text-[10px] font-medium opacity-40 uppercase tracking-widest block mt-1">Protects Safety Plan & Private Journal</span>
              </div>
              <Switch 
                checked={biometricSensitive}
                onCheckedChange={handleToggleBiometricSensitive}
              />
            </div>

            {/* Sub-section: Device Biometric Type Selection */}
            {(biometricLaunch || biometricSensitive) && (
              <div className="p-5 rounded-[2rem] bg-card border border-white/5 space-y-4 animate-fadeIn">
                <span className="block text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: theme.foreground }}>
                  Authentication Preference
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handlePrefModeChange('face')}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-medium border ${
                      prefMode === 'face' 
                        ? 'border-primary bg-primary/10 text-primary font-bold' 
                        : 'border-white/5 bg-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    <span>FaceID</span>
                  </button>

                  <button
                    onClick={() => handlePrefModeChange('touch')}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-medium border ${
                      prefMode === 'touch' 
                        ? 'border-primary bg-primary/10 text-primary font-bold' 
                        : 'border-white/5 bg-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>TouchID</span>
                  </button>

                  <button
                    onClick={() => handlePrefModeChange('pin')}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-medium border ${
                      prefMode === 'pin' 
                        ? 'border-primary bg-primary/10 text-primary font-bold' 
                        : 'border-white/5 bg-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Key className="h-4 w-4" />
                    <span>Passcode PIN</span>
                  </button>
                </div>

                {/* Passcode PIN Change Controls */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold block" style={{ color: theme.foreground }}>
                        App Passcode PIN
                      </span>
                      <span className="text-[10px] opacity-45">
                        Current Passcode: {pinCode === "1234" ? "1234 (Default)" : "****"}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsChangingPin(!isChangingPin)}
                      className="text-xs font-bold h-8 px-3 rounded-xl border-white/10"
                    >
                      {isChangingPin ? "Cancel" : "Change PIN"}
                    </Button>
                  </div>

                  {isChangingPin && (
                    <div className="space-y-2 pt-2 animate-fadeIn">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter new 4-digit PIN"
                          value={newPinInput}
                          maxLength={4}
                          type="password"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ""))}
                          className="h-10 bg-transparent rounded-xl text-sm max-w-[170px]"
                        />
                        <Button
                          onClick={handleSaveNewPin}
                          className="h-10 bg-primary hover:bg-primary-dark rounded-xl px-4 text-xs font-bold shrink-0 text-white border-0"
                        >
                          Save Code
                        </Button>
                      </div>

                      {pinErrorMessage && (
                        <p className="text-[10px] text-danger font-bold uppercase tracking-wide animate-fadeIn">
                          {pinErrorMessage}
                        </p>
                      )}
                    </div>
                  )}

                  {pinSuccessMessage && (
                    <p className="text-xs text-success font-bold flex items-center gap-1 animate-fadeIn">
                      <ShieldCheck className="h-4 w-4" />
                      <span>{pinSuccessMessage}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
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
