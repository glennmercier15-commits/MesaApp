import React, { useState } from "react";
import { 
  Home, 
  Sparkles, 
  CalendarDays, 
  UserRound, 
  Users,
  Shield
} from "lucide-react";
import { theme } from "../theme";
import { HomeScreen } from "../screens/HomeScreen";
import { ToolsScreen } from "../screens/ToolsScreen";
import { SessionsScreen } from "../screens/SessionsScreen";
import { CommunityScreen } from "../screens/CommunityScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { StopSmokingScreen } from "../screens/StopSmokingScreen";
import { JourneyScreen } from "../screens/JourneyScreen";
import { SafetyPlanScreen } from "../screens/SafetyPlanScreen";
import { WelfareCheckScreen } from "../screens/WelfareCheckScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { GroupSessionScreen } from "../screens/GroupSessionScreen";

function BottomNav({ current, onChange }: { current: string; onChange: (tab: string) => void }) {
  const items = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'safety', label: 'Safety', icon: Shield },
    { key: 'tools', label: 'Tools', icon: Sparkles },
    { key: 'sessions', label: 'Sessions', icon: CalendarDays },
    { key: 'community', label: 'Community', icon: Users },
    { key: 'profile', label: 'Profile', icon: UserRound },
  ];

  return (
    <div className="absolute inset-x-4 bottom-6 rounded-[2.5rem] glass p-2 shadow-2xl">
      <div className="grid grid-cols-6 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className="flex h-14 flex-col items-center justify-center gap-1.5 rounded-[2rem] px-1 transition-all duration-300"
              style={{
                backgroundColor: active ? theme.primary : 'transparent',
                color: active ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                boxShadow: active ? `0 8px 20px ${theme.primary}40` : 'none'
              }}
            >
              <Icon className={`h-4 w-4 ${active ? 'scale-110' : 'scale-100'} transition-transform`} />
              <span className="text-[8px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MainNavigator() {
  const [tab, setTab] = useState('home');
  const [subScreen, setSubScreen] = useState<string | null>(null);
  const [screenParams, setScreenParams] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  const navigate = (screen: string, params?: any) => {
    setSubScreen(screen);
    setScreenParams(params);
  };

  if (subScreen === 'safety-plan') return <SafetyPlanScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'stop-smoking') return <StopSmokingScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'journey') return <JourneyScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'welfare-check') return <WelfareCheckScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'edit-profile') return <EditProfileScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'group-session') return <GroupSessionScreen roomName={screenParams?.roomName || "Group Session"} onBack={() => setSubScreen(null)} />;

  const screens = {
    home: <HomeScreen onNavigate={navigate} />,
    safety: <SafetyPlanScreen onBack={() => setTab('home')} />,
    tools: <ToolsScreen />,
    sessions: <SessionsScreen />,
    community: <CommunityScreen onNavigate={navigate} />,
    profile: <ProfileScreen onNavigate={navigate} />,
  };

  return (
    <div className="relative h-full bg-background">
      {(screens as any)[tab]}
      <BottomNav current={tab} onChange={(t) => {
        setTab(t);
        setSubScreen(null);
      }} />
    </div>
  );
}
