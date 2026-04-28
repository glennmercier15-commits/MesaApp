import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Shield, 
  Flame, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  Bell, 
  Lock,
  Moon,
  Sun,
  Camera
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme/AppTheme";
import { theme as themeTokens } from "../theme";
import { Switch } from "@/components/ui/switch";
import { storage, ref, uploadBytes, getDownloadURL } from "../firebase";

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { user, logout, updateUserPhotoURL } = useAuth();
  const { mode, toggleTheme } = useAppTheme();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const initials = user?.displayName?.split(' ').map(n => n[0]).join('') || '??';

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateUserPhotoURL(photoURL);
    }
  };

  return (
    <div className="h-full atmosphere overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />
      <ScrollArea className="h-full">
        <div className="space-y-8 p-6 pb-24">
          <div className="flex flex-col items-center pt-8">
            <div className="relative mb-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-32 w-32 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/5">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ""} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="rounded-[3rem] text-3xl font-serif font-bold" style={{ backgroundColor: themeTokens.soft, color: themeTokens.primary }}>
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-serif font-bold text-center" style={{ color: themeTokens.foreground }}>{user?.displayName || "Anonymous User"}</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('edit-profile')}
              className="mt-2 text-primary hover:text-primary/80 font-bold text-xs"
            >
              Edit Profile
            </Button>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mt-2 opacity-40">Client · Renfrew County</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 opacity-40">Your Tools</h3>
            <div className="space-y-3">
              {[
                { label: "My Safety Plan", sub: "Encrypted & Secure", icon: Shield, screen: 'safety-plan' },
                { label: "STOP Smoking Log", sub: "NRT & Craving Tracking", icon: Flame, screen: 'stop-smoking' },
              ].map((item) => (
                <Card key={item.label} onClick={() => onNavigate(item.screen)} className="glass border-0 rounded-[2rem] overflow-hidden cursor-pointer group hover:bg-white/10 transition-colors">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl p-3 bg-white/5 group-hover:bg-primary/20 transition-colors">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: themeTokens.foreground }}>{item.label}</div>
                        <div className="text-[10px] font-medium opacity-40 uppercase tracking-widest mt-1">{item.sub}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: themeTokens.primary }} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 opacity-40">Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-5 rounded-[2rem] glass">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl p-3 bg-white/5">
                    {mode === 'dark' ? <Moon className="h-5 w-5 opacity-40" /> : <Sun className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold block" style={{ color: themeTokens.foreground }}>{mode === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    <span className="text-[10px] font-medium opacity-40 uppercase tracking-widest">{mode === 'dark' ? 'Midnight Palette' : 'Sky Blue Palette'}</span>
                  </div>
                </div>
                <Switch 
                  checked={mode === 'light'} 
                  onCheckedChange={toggleTheme}
                />
              </div>

              {[
                { label: "Notifications", icon: Bell },
                { label: "Privacy & Security", icon: Lock, screen: 'privacy-and-security' },
              ].map(item => (
                <div 
                    key={item.label} 
                    className="flex items-center justify-between p-5 rounded-[2rem] glass cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => item.screen && onNavigate(item.screen)}
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl p-3 bg-white/5">
                      <item.icon className="h-5 w-5 opacity-40" />
                    </div>
                    <span className="text-sm font-bold" style={{ color: themeTokens.foreground }}>{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-20" />
                </div>
              ))}
            </div>
          </div>

          <Button 
            variant="ghost" 
            onClick={logout}
            className="w-full h-16 rounded-[2rem] glass text-red-400 hover:text-red-500 hover:bg-red-500/10 font-bold text-sm"
          >
            <LogOut className="mr-3 h-5 w-5" /> Sign Out
          </Button>

          <div className="text-center space-y-2 pb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-20">Pulse Hub v1.0.0</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-20">PHIPA Compliant · Renfrew County</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
