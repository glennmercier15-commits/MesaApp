import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell } from "lucide-react";
import { theme } from "./theme";
import { CrisisFAB } from "./components/CrisisFAB";
import { MainNavigator } from "./navigation/MainNavigator";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppThemeProvider, useAppTheme } from "./theme/AppTheme";
import { LoginScreen } from "./screens/LoginScreen";
import { NotificationProvider, useNotifications } from "./context/NotificationContext";
import { NotificationCenter } from "./components/NotificationCenter";
import { SplashScreen } from "./components/SplashScreen";

import { ErrorBoundary } from "./components/ErrorBoundary";

function AppContent() {
  const { user, loading } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [showSplash, setShowSplash] = useState(true);

  if (loading || showSplash) {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-full flex-col relative bg-background">
      <div className="flex items-center justify-between px-6 py-4 bg-background z-20">
        <span className="text-lg font-bold text-foreground">Pulse Hub</span>
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

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppThemeProvider>
          <div className="flex min-h-screen items-center justify-center bg-background p-0 font-sans selection:bg-primary/30 transition-colors duration-500">
            {/* Phone Frame for Preview */}
            <div className="relative w-full h-full lg:w-[390px] lg:h-[844px] lg:rounded-[3rem] lg:border-[8px] lg:shadow-2xl overflow-hidden bg-background">
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
              
              {/* Decorative Glow on Desktop */}
              <div className="hidden lg:block absolute -inset-4 -z-10 rounded-[4rem] bg-primary/5 blur-3xl" />
            </div>
          </div>
        </AppThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
