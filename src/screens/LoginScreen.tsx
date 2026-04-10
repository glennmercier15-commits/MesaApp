import React from "react";
import { motion } from "motion/react";
import { Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { theme } from "../theme";
import { useAuth } from "../context/AuthContext";

export function LoginScreen() {
  const { signIn } = useAuth();

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-background">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] shadow-2xl" style={{ backgroundColor: theme.soft }}>
          <Shield className="h-12 w-12" style={{ color: theme.primary }} />
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight" style={{ color: theme.foreground }}>MindBridge</h1>
        <p className="text-sm font-medium" style={{ color: theme.muted }}>Community Mental Health & Recovery Companion</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-xs space-y-4"
      >
        <Button 
          onClick={signIn}
          className="w-full h-14 rounded-2xl bg-primary text-background font-bold text-lg hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          <LogIn className="mr-2 h-5 w-5" /> Sign In with Google
        </Button>
        <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: theme.muted }}>
          Secure · PHIPA Compliant · Renfrew County
        </p>
      </motion.div>

      <div className="absolute bottom-10 text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.muted }}>
        MacKay Manor Inc. © 2026
      </div>
    </div>
  );
}
