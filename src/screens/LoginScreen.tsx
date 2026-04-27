import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { theme } from "../theme";
import { useAuth } from "../context/AuthContext";

export function LoginScreen() {
  const { signIn } = useAuth();

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center atmosphere">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8 flex flex-col items-center"
      >
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white/20 backdrop-blur-md shadow-xl">
          <span className="text-4xl">🧠</span>
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight" style={{ color: theme.text }}>MindfulYou</h1>
        <p className="text-sm font-medium" style={{ color: theme.textMuted }}>mental health and wellness</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-xs space-y-4"
      >
        <Input placeholder="Email" className="rounded-2xl bg-white/50 border-0 h-12" />
        <Input type="password" placeholder="Password" className="rounded-2xl bg-white/50 border-0 h-12" />
        <Button 
          className="w-full h-12 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg"
        >
          LOG IN
        </Button>
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="ghost" size="icon" onClick={signIn}>G</Button>
          <Button variant="ghost" size="icon">f</Button>
          <Button variant="ghost" size="icon"></Button>
        </div>
        <p className="text-xs mt-4" style={{ color: theme.textMuted }}>
          New? <a href="#" className="font-bold text-primary">CREATE ACCOUNT</a>
        </p>
      </motion.div>
    </div>
  );
}
