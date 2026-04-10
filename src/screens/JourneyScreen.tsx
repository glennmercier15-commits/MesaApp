import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  ChevronLeft, 
  CheckCircle2, 
  Lock, 
  ChevronRight 
} from "lucide-react";
import { theme } from "../theme";

interface JourneyScreenProps {
  onBack: () => void;
}

export function JourneyScreen({ onBack }: JourneyScreenProps) {
  const curriculum = [
    { week: 1, title: "Foundations of Recovery", status: "completed" },
    { week: 2, title: "Coping with Cravings", status: "completed" },
    { week: 3, title: "Coping Strategies", status: "current" },
    { week: 4, title: "Stages of Recovery", status: "locked" },
    { week: 5, title: "Relapse Prevention", status: "locked" },
    { week: 6, title: "Emotional Regulation", status: "locked" },
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="p-6 pb-0">
        <button onClick={onBack} className="flex items-center text-sm font-medium mb-8 transition-opacity hover:opacity-80" style={{ color: theme.primary }}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </button>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/5">
              <BookOpen className="h-6 w-6" style={{ color: theme.primary }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: theme.foreground }}>Your Journey</h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
            MacKay Manor's 12-week recovery curriculum. Track your progress through each stage.
          </p>
        </div>

        <Card className="border-0 shadow-sm rounded-3xl mb-8" style={{ backgroundColor: theme.secondary }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.primary }}>Overall Progress</span>
              <span className="text-lg font-bold" style={{ color: theme.primary }}>25%</span>
            </div>
            <Progress value={25} className="h-2 bg-white/5" />
            <p className="mt-3 text-[10px] font-medium text-center" style={{ color: theme.muted }}>
              3 of 12 weeks completed
            </p>
          </CardContent>
        </Card>
      </div>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-3 pb-24">
          {curriculum.map((item) => (
            <Card 
              key={item.week} 
              className={`border-0 shadow-sm rounded-3xl transition-all ${item.status === 'locked' ? 'opacity-50' : 'hover:bg-white/5'}`} 
              style={{ backgroundColor: theme.secondary }}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.status === 'completed' ? 'bg-emerald-500/10' : item.status === 'current' ? 'bg-primary/10' : 'bg-white/5'}`}>
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : item.status === 'current' ? (
                      <span className="text-lg font-bold" style={{ color: theme.primary }}>{item.week}</span>
                    ) : (
                      <Lock className="h-5 w-5" style={{ color: theme.muted }} />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.muted }}>Week {item.week}</div>
                    <div className="text-sm font-bold" style={{ color: theme.foreground }}>{item.title}</div>
                  </div>
                </div>
                {item.status !== 'locked' && <ChevronRight className="h-5 w-5" style={{ color: theme.muted }} />}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
