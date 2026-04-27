import React from "react";
import { motion } from "motion/react";
import { 
  Wifi, 
  Battery, 
  Signal, 
} from "lucide-react";
import { theme } from "./theme";
import { CrisisFAB } from "./components/CrisisFAB";
import { MainNavigator } from "./navigation/MainNavigator";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppThemeProvider, useAppTheme } from "./theme/AppTheme";
import { LoginScreen } from "./screens/LoginScreen";
import { NotificationProvider, useNotifications } from "./context/NotificationContext";
import { NotificationCenter } from "./components/NotificationCenter";
import { Bell } from "lucide-react";

import { ErrorBoundary } from "./components/ErrorBoundary";

function AppContent() {
  const { user, loading } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-full flex-col relative bg-background">
      <div className="flex items-center justify-between px-6 py-4 bg-background z-20">
        <span className="text-lg font-bold text-foreground">MindBridge</span>
        <NotificationBell onClick={() => setIsNotificationsOpen(true)} />
      </div>
      <div className="flex-1 overflow-hidden relative">
        <MainNavigator />
        <CrisisFAB />
      </div>

      <NotificationCenter 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </div>
  );
}

function NotificationBell({ onClick }: { onClick: () => void }) {
  const { unreadCount } = useNotifications();
  
  return (
    <button 
      onClick={onClick}
      className="relative rounded-full p-2 transition-colors hover:bg-white/5"
      style={{ color: theme.muted }}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-background">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { isDark } = useAppTheme();
  return (
    <div className={`relative mx-auto h-[844px] w-[390px] overflow-hidden rounded-[3rem] border-[8px] ${isDark ? 'border-[#162044]' : 'border-[#EEF1F6]'} bg-background shadow-2xl ring-1 ring-black/5`}>
      {/* Notch */}
      <div className={`absolute left-1/2 top-0 z-50 h-7 w-32 -translate-x-1/2 rounded-b-3xl ${isDark ? 'bg-[#162044]' : 'bg-[#EEF1F6]'}`} />
      
      {/* Status Bar */}
      <div className="absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-8 pt-3 text-[12px] font-semibold opacity-60">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <Signal className="h-3.5 w-3.5" />
          <Wifi className="h-3.5 w-3.5" />
          <Battery className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Content */}
      <div className="h-full">
        {children}
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-1.5 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-foreground/10" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppThemeProvider>
          <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans selection:bg-primary/30 transition-colors duration-500">
            <div className="flex w-full max-w-5xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
              
              {/* App Info Panel */}
              <div className="hidden w-full max-w-sm space-y-6 lg:block">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">MindBridge</h1>
                  <p className="text-lg opacity-60 leading-relaxed text-foreground">
                    Community Mental Health & Recovery Companion for Renfrew County.
                  </p>
                </div>
          
          <div className="space-y-4 rounded-3xl bg-white/5 p-6 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium opacity-80 text-foreground">PHIPA Compliant System</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium opacity-80 text-foreground">MESA Outreach Integrated</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium opacity-80 text-foreground">Offline-First Architecture</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
            <p className="text-xs font-medium leading-relaxed" style={{ color: theme.primary }}>
              This application is a trauma-informed digital extension of MacKay Manor's core services.
            </p>
          </div>
        </div>

        {/* Interactive Phone */}
        <div className="relative">
          <PhoneFrame>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </PhoneFrame>
          
          {/* Decorative Glow */}
          <div className="absolute -inset-4 -z-10 rounded-[4rem] bg-primary/5 blur-3xl" />
        </div>

        {/* Mobile Info (Visible only on small screens) */}
        <div className="text-center lg:hidden">
          <h1 className="text-2xl font-bold text-foreground">MindBridge</h1>
          <p className="text-sm opacity-60 text-foreground">Recovery Companion</p>
        </div>
      </div>
    </div>
        </AppThemeProvider>
    </NotificationProvider>
  </AuthProvider>
);
}
