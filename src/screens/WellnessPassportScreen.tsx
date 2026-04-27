import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  ChevronLeft, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Calendar,
  Award,
  TrendingUp,
  Heart,
  Home,
  ArrowUpRight
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme/AppTheme";
import { db, collection, query, where, getDocs, onSnapshot } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

interface WellnessPassportScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function WellnessPassportScreen({ onBack, onNavigate }: WellnessPassportScreenProps) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [stats, setStats] = useState({
    checkIns: 0,
    daysSober: 0,
    curriculumWeek: 3,
    smokingCravings: 0,
    housingTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // In a real app, we'd fetch these from Firestore
    // For now, let's simulate some data and listen for check-ins
    const checkInsQuery = query(collection(db, "checkins"), where("uid", "==", user.uid));
    
    const unsubscribe = onSnapshot(checkInsQuery, (snapshot) => {
      setStats(prev => ({
        ...prev,
        checkIns: snapshot.size
      }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "checkins");
    });

    return () => unsubscribe();
  }, [user]);

  const milestones = [
    { label: "1 Week", days: 7, achieved: stats.daysSober >= 7 },
    { label: "30 Days", days: 30, achieved: stats.daysSober >= 30 },
    { label: "90 Days", days: 90, achieved: stats.daysSober >= 90 },
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="p-6 pb-0">
        <button onClick={onBack} className="flex items-center text-sm font-bold mb-8 transition-opacity hover:opacity-80" style={{ color: colors.primary }}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </button>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative h-[220px] w-full rounded-[24px] p-6 text-white shadow-2xl teal-glow primary-gradient overflow-hidden mb-8"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="h-32 w-32" />
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <span className="font-bold tracking-tight">MindBridge</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Wellness Passport</div>
          </div>
          
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">Recovery Progress</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-[32px] font-bold tabular-nums">Week {stats.curriculumWeek}</h3>
              <span className="text-[14px] opacity-60">of 12</span>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-0.5">Passport ID</p>
              <p className="text-[12px] font-mono opacity-80">{user?.uid.substring(0, 12).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-0.5">Status</p>
              <p className="text-[12px] font-bold text-emerald-300">ACTIVE RECOVERY</p>
            </div>
          </div>
        </motion.div>
      </div>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-6 pb-24">
          {/* Milestone Counter */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold uppercase tracking-widest opacity-40 px-1">Milestones</h3>
            <Card className="border-0 shadow-sm rounded-[24px] overflow-hidden" style={{ backgroundColor: colors.surfaceAlt }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold">Check-in Streak</h4>
                    <p className="text-[12px] opacity-60">You've shown up for yourself {stats.checkIns} times</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {milestones.map((m) => (
                    <div key={m.label} className={`flex flex-col items-center p-3 rounded-2xl border ${m.achieved ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-background/50 border-transparent'}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 ${m.achieved ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                        {m.achieved ? <CheckCircle2 className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Program Summaries */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold uppercase tracking-widest opacity-40 px-1">Program Status</h3>
            <div className="grid gap-3">
              <Card 
                onClick={() => onNavigate('journey')}
                className="border-0 shadow-sm rounded-[20px] cursor-pointer hover:bg-primary/5 transition-colors" 
                style={{ backgroundColor: colors.surfaceAlt }}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-[14px] p-3 bg-background/50 shadow-sm">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold">Recovery Curriculum</div>
                      <div className="text-[11px] font-medium opacity-40">Week 3: Coping Strategies</div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 opacity-30" />
                </CardContent>
              </Card>

              <Card 
                onClick={() => onNavigate('stop-smoking')}
                className="border-0 shadow-sm rounded-[20px] cursor-pointer hover:bg-primary/5 transition-colors" 
                style={{ backgroundColor: colors.surfaceAlt }}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-[14px] p-3 bg-background/50 shadow-sm">
                      <Flame className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold">STOP Smoking</div>
                      <div className="text-[11px] font-medium opacity-40">{stats.smokingCravings} cravings logged this week</div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 opacity-30" />
                </CardContent>
              </Card>

              <Card 
                onClick={() => onNavigate('housing')}
                className="border-0 shadow-sm rounded-[20px] cursor-pointer hover:bg-primary/5 transition-colors" 
                style={{ backgroundColor: colors.surfaceAlt }}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-[14px] p-3 bg-background/50 shadow-sm">
                      <Home className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold">Housing Stability (ASH)</div>
                      <div className="text-[11px] font-medium opacity-40">2 tasks pending for this week</div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 opacity-30" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Wellness Score Summary */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold uppercase tracking-widest opacity-40 px-1">Wellness Summary</h3>
            <Card className="border-0 shadow-sm rounded-[24px]" style={{ backgroundColor: colors.surfaceAlt }}>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-bold">Average Mood Score</span>
                  </div>
                  <span className="text-lg font-bold text-primary">72%</span>
                </div>
                <Progress value={72} className="h-2" />
                <p className="text-[12px] leading-relaxed opacity-60">
                  Your wellness score is calculated based on your daily check-ins, exercise completion, and program engagement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
