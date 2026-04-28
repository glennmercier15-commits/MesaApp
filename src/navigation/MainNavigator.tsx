import React, { useState } from "react";
import { motion } from "motion/react";
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
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { GroupSessionScreen } from "../screens/GroupSessionScreen";
import { MeditationScreen } from "../screens/MeditationScreen";
import { WellnessPassportScreen } from "../screens/WellnessPassportScreen";
import { PrivacyAndSecurityScreen } from "../screens/PrivacyAndSecurityScreen";
import { EventCalendarScreen } from "../screens/EventCalendarScreen";
import { BreathworkTool } from "../components/tools/BreathworkTool";
import { DBTTool } from "../components/tools/DBTTool";
import { ThoughtRecordTool } from "../components/tools/ThoughtRecordTool";
import { JournalTool } from "../components/tools/JournalTool";
import { GroundingTool } from "../components/tools/GroundingTool";

function BottomNav({ current, onChange }: { current: string; onChange: (tab: string) => void }) {
  const items = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'safety', label: 'Safety', icon: Shield },
    { key: 'tools', label: 'Tools', icon: Sparkles },
    { key: 'sessions', label: 'Activity', icon: CalendarDays },
    { key: 'community', label: 'Groups', icon: Users },
    { key: 'profile', label: 'Profile', icon: UserRound },
  ];

  return (
    <div className="absolute inset-x-0 bottom-0 h-[72px] bg-card border-t border-border flex items-center justify-around px-2 pb-safe">
      {items.map((item) => {
        const Icon = item.icon;
        const active = current === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200"
          >
            <div className={`transition-all duration-200 ${active ? 'scale-110' : 'scale-100'}`}>
              <Icon 
                className="h-5 w-5" 
                style={{ 
                  color: active ? 'var(--primary)' : 'var(--muted-foreground)',
                  strokeWidth: active ? 2.5 : 2
                }} 
              />
            </div>
            <span 
              className="text-[10px] font-medium tracking-tight"
              style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)' }}
            >
              {item.label}
            </span>
            {active && (
              <motion.div 
                layoutId="activeTab"
                className="absolute top-0 h-0.5 w-8 bg-primary rounded-full"
              />
            )}
          </button>
        );
      })}
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
  if (subScreen === 'edit-profile') return <EditProfileScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'group-session') return <GroupSessionScreen roomName={screenParams?.roomName || "Group Session"} onBack={() => setSubScreen(null)} />;
  if (subScreen === 'meditation') return <MeditationScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'wellness-passport') return <WellnessPassportScreen onBack={() => setSubScreen(null)} onNavigate={navigate} />;
  if (subScreen === 'event-calendar') return <EventCalendarScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'privacy-and-security') return <PrivacyAndSecurityScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'breathwork') return <BreathworkTool onBack={() => setSubScreen(null)} />;
  if (subScreen === 'dbt') return <DBTTool onBack={() => setSubScreen(null)} />;
  if (subScreen === 'thought-record') return <ThoughtRecordTool onBack={() => setSubScreen(null)} />;
  if (subScreen === 'journal') return <JournalTool onBack={() => setSubScreen(null)} />;
  if (subScreen === 'grounding') return <GroundingTool onBack={() => setSubScreen(null)} />;

  const screens = {
    home: <HomeScreen onNavigate={navigate} />,
    safety: <SafetyPlanScreen onBack={() => setTab('home')} />,
    tools: <ToolsScreen />,
    sessions: <SessionsScreen onNavigate={navigate} />,
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
