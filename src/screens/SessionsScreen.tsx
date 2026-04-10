import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Users, 
  Calendar, 
  Plus, 
  CheckCircle, 
  ChevronRight 
} from "lucide-react";
import { theme } from "../theme";

export function SessionsScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'book' | 'history'>('upcoming');

  const upcomingSessions = [
    { id: 1, type: "Individual Counseling", provider: "Dr. Sarah Miller", date: "Tomorrow, 2:00 PM", status: "Confirmed", icon: User },
    { id: 2, type: "Group Recovery", provider: "MESA Team", date: "Friday, 10:00 AM", status: "Upcoming", icon: Users },
  ];

  const pastSessions = [
    { id: 3, type: "Intake Assessment", provider: "MacKay Manor", date: "Oct 12, 2023", status: "Completed" },
    { id: 4, type: "Wellness Check", provider: "MESA Team", date: "Oct 05, 2023", status: "Completed" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-4">
        <div className="flex rounded-2xl bg-white/5 p-1">
          {(['upcoming', 'book', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 rounded-xl py-2 text-[10px] font-bold uppercase tracking-widest transition ${activeTab === t ? 'bg-white/10 text-primary shadow-sm' : 'text-white/40'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4 pb-24">
          {activeTab === 'upcoming' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold tracking-wide" style={{ color: theme.foreground }}>Next Sessions</h3>
              {upcomingSessions.map((session) => (
                <Card key={session.id} className="border-0 shadow-sm rounded-3xl" style={{ backgroundColor: theme.secondary }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl p-2 bg-white/5">
                          <session.icon className="h-4 w-4" style={{ color: theme.primary }} />
                        </div>
                        <div>
                          <div className="text-sm font-bold" style={{ color: theme.foreground }}>{session.type}</div>
                          <div className="text-[10px]" style={{ color: theme.muted }}>{session.provider}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest h-5 px-1.5 border-primary/30 text-primary">
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-3 w-3" style={{ color: theme.muted }} />
                      <span className="text-xs font-medium" style={{ color: theme.muted }}>{session.date}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 h-10 rounded-xl text-background font-bold" style={{ backgroundColor: theme.primary }}>Join Room</Button>
                      <Button variant="outline" className="flex-1 h-10 rounded-xl border-white/10 bg-white/5 text-white/80">Reschedule</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'book' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wide" style={{ color: theme.foreground }}>Book a Session</h3>
              <Card className="border-0 shadow-sm rounded-3xl" style={{ backgroundColor: theme.secondary }}>
                <CardContent className="p-5 space-y-5">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.muted }}>Select Service</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Individual", "Group", "CWMS", "ASH Support"].map(s => (
                        <button key={s} className="rounded-xl border border-white/10 p-3 text-left hover:border-primary transition-colors bg-white/5">
                          <div className="text-xs font-bold" style={{ color: theme.foreground }}>{s}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full h-12 rounded-2xl text-background font-bold" style={{ backgroundColor: theme.primary }}>Confirm Booking</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold tracking-wide" style={{ color: theme.foreground }}>Past Sessions</h3>
              {pastSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-[2rem] p-4 shadow-sm border border-white/5" style={{ backgroundColor: theme.secondary }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: theme.foreground }}>{session.type}</div>
                      <div className="text-[10px]" style={{ color: theme.muted }}>{session.provider} • {session.date}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-white/5">
                    <ChevronRight className="h-4 w-4" style={{ color: theme.muted }} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
