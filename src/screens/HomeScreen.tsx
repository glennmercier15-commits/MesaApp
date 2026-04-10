import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Flame, 
  BookOpen, 
  PlayCircle, 
  Check, 
  ChevronRight 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { theme } from "../theme";
import { MoodCheckIn } from "../components/MoodCheckIn";
import { db, collection, addDoc, serverTimestamp } from "../firebase";

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

const exercises = [
  { name: "CBT Thought Record", icon: PlayCircle, length: "5 min" },
  { name: "Box Breathing", icon: PlayCircle, length: "2 min" },
  { name: "4-7-8 Reset", icon: PlayCircle, length: "3 min" },
];

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold tracking-wide" style={{ color: theme.foreground }}>{title}</h3>
      {action ? <button className="text-xs font-medium" style={{ color: theme.primary }}>{action}</button> : null}
    </div>
  );
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { user } = useAuth();
  const [checkInCount, setCheckInCount] = useState(30);
  const firstName = user?.displayName?.split(' ')[0] || "there";

  const sendTestNotification = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        uid: user.uid,
        title: "New Message",
        body: "Your case manager Jordan sent you a new message regarding your session.",
        type: "message",
        timestamp: serverTimestamp(),
        read: false
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  };

  return (
    <div className="h-full atmosphere overflow-hidden">
      <ScrollArea className="h-full">
        <div className="space-y-6 p-6 pb-24">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-serif font-bold tracking-tight" style={{ color: theme.foreground }}>Good morning, {firstName}</h2>
              <p className="text-sm font-medium opacity-60" style={{ color: theme.foreground }}>Your recovery journey is unique to you.</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={sendTestNotification}
              className="rounded-2xl h-12 w-12 glass hover:bg-white/10"
            >
              <Sparkles className="h-5 w-5" style={{ color: theme.primary }} />
            </Button>
          </div>

          <MoodCheckIn onComplete={() => setCheckInCount(prev => prev + 1)} />

          <div className="grid grid-cols-2 gap-4">
            <Card className="glass border-0 rounded-[2rem] overflow-hidden">
              <CardContent className="p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20">
                  <Sparkles className="h-5 w-5" style={{ color: theme.primary }} />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold font-serif" style={{ color: theme.foreground }}>{checkInCount}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Check-ins</p>
                </div>
                <p className="text-[10px] mt-2 leading-relaxed opacity-40">Days of showing up for yourself.</p>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-[2rem] overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform" style={{ backgroundColor: theme.accent }} onClick={() => onNavigate('stop-smoking')}>
              <CardContent className="p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-1 text-white">
                  <p className="text-2xl font-bold font-serif">2 urges</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">STOP Smoking</p>
                </div>
                <p className="text-[10px] mt-2 leading-relaxed opacity-60">1 NRT patch used today.</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <SectionTitle title="Next Session" action="View all" />
            <Card className="glass border-0 rounded-[2rem] overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center font-serif text-xl font-bold" style={{ color: theme.primary }}>JL</div>
                    <div>
                      <h4 className="font-bold text-base" style={{ color: theme.foreground }}>Jordan Lewis</h4>
                      <p className="text-xs opacity-60">Recovery Coaching · 3:30 PM</p>
                    </div>
                  </div>
                  <Badge className="rounded-full px-3 py-1 bg-primary/20 text-primary border-0 text-[10px] font-bold uppercase tracking-wider">Confirmed</Badge>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 rounded-2xl h-12 bg-primary text-white font-bold text-sm hover:bg-primary/90">Join Session</Button>
                  <Button variant="ghost" className="rounded-2xl h-12 glass text-white/80 text-sm px-6">Details</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <SectionTitle title="Housing Stability" />
            <Card className="glass border-0 rounded-[2rem] overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { label: "Rent Payment (April)", done: true },
                    { label: "Utility Bill Review", done: false },
                    { label: "Weekly Grocery Shop", done: true },
                  ].map((task) => (
                    <div key={task.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${task.done ? 'bg-primary border-primary' : 'border-white/10'}`}>
                          {task.done && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${task.done ? 'opacity-30 line-through' : 'opacity-80'}`}>{task.label}</span>
                      </div>
                      {!task.done && <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10">Mark Done</Button>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <SectionTitle title="Guided Exercises" action="Browse" />
            <div className="grid gap-3">
              {exercises.map((exercise) => (
                <Card key={exercise.name} className="glass border-0 rounded-3xl hover:bg-white/10 transition-colors cursor-pointer group">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl p-3 bg-white/5 group-hover:bg-primary/20 transition-colors">
                        <exercise.icon className="h-5 w-5" style={{ color: theme.primary }} />
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: theme.foreground }}>{exercise.name}</div>
                        <div className="text-[10px] font-medium opacity-40 uppercase tracking-widest">{exercise.length}</div>
                      </div>
                    </div>
                    <PlayCircle className="h-6 w-6 opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: theme.primary }} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
