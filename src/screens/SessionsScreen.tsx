import React, { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Users, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  ChevronRight,
  LayoutList,
  CalendarDays,
  ChevronLeft,
  Clock,
  Video
} from "lucide-react";
import { useAppTheme } from "../theme/AppTheme";
import { motion } from "motion/react";

export function SessionsScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'book' | 'history'>('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const upcomingSessions = useMemo(() => [
    { id: 1, type: "Individual Counseling", provider: "Dr. Sarah Miller", date: "2026-04-12T14:00:00", status: "Confirmed", icon: User },
    { id: 2, type: "Group Recovery", provider: "MESA Team", date: "2026-04-14T10:00:00", status: "Upcoming", icon: Users },
    { id: 5, type: "Wellness Check", provider: "MESA Team", date: "2026-04-15T11:00:00", status: "Confirmed", icon: User },
    { id: 6, type: "ASH Support", provider: "Outreach Worker", date: "2026-04-20T15:30:00", status: "Confirmed", icon: User },
    { id: 7, type: "Relapse Prevention", provider: "Clinical Lead", date: "2026-04-20T10:00:00", status: "Upcoming", icon: Users },
  ], []);

  const pastSessions = [
    { id: 3, type: "Intake Assessment", provider: "MacKay Manor", date: "Oct 12, 2023", status: "Completed" },
    { id: 4, type: "Wellness Check", provider: "MESA Team", date: "Oct 05, 2023", status: "Completed" },
  ];

  // Calendar Logic
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(month, year);
    const offset = firstDayOfMonth(month, year);
    const prevMonthDays = daysInMonth(month - 1, year);
    
    const days: { date: Date; currentMonth: boolean }[] = [];
    
    // Previous month days
    for (let i = offset - 1; i >= 0; i--) {
      days.push({ 
        date: new Date(year, month - 1, prevMonthDays - i), 
        currentMonth: false 
      });
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({ 
        date: new Date(year, month, i), 
        currentMonth: true 
      });
    }
    
    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ 
        date: new Date(year, month + 1, i), 
        currentMonth: false 
      });
    }
    
    return days;
  }, [currentMonth]);

  const selectedDateSessions = upcomingSessions.filter(s => {
    const sDate = new Date(s.date);
    return sDate.getDate() === selectedDate.getDate() && 
           sDate.getMonth() === selectedDate.getMonth() && 
           sDate.getFullYear() === selectedDate.getFullYear();
  });

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="px-6 pt-6">
        <div className="flex rounded-2xl bg-white/5 p-1 border border-white/5 shadow-inner">
          {(['upcoming', 'book', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === t ? 'bg-primary text-white shadow-lg' : 'text-white/40'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6 pb-24">
          {activeTab === 'upcoming' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold uppercase tracking-widest opacity-40 px-1" style={{ color: colors.text }}>
                  {viewMode === 'list' ? 'Schedule' : 'Calendar'}
                </h3>
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white/10 text-primary shadow-sm' : 'text-white/40'}`}
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'calendar' ? 'bg-white/10 text-primary shadow-sm' : 'text-white/40'}`}
                  >
                    <CalendarDays className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <Card key={session.id} className="border-0 shadow-sm rounded-[24px]" style={{ backgroundColor: colors.surfaceAlt }}>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="rounded-[18px] p-3 bg-primary/10">
                              <session.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="text-[15px] font-bold" style={{ color: colors.text }}>{session.type}</div>
                              <div className="text-[11px] font-medium opacity-60" style={{ color: colors.text }}>{session.provider}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-primary/20 text-primary">
                            {session.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-5 px-1 opacity-60">
                          <CalendarIcon className="h-3.5 w-3.5" style={{ color: colors.primary }} />
                          <span className="text-[13px] font-medium" style={{ color: colors.text }}>
                            {new Date(session.date).toLocaleString([], { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <Button className="flex-1 h-12 rounded-2xl text-white font-bold primary-gradient shadow-lg">
                            <Video className="h-4 w-4 mr-2" />
                            Join Session
                          </Button>
                          <Button variant="ghost" className="flex-1 h-12 rounded-2xl bg-white/5 text-white/60 font-medium">Reschedule</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button 
                    onClick={() => onNavigate('event-calendar')}
                    variant="outline" 
                    className="w-full h-12 rounded-2xl border-dashed border-primary/20 text-primary font-bold"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    View Community Events
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <Card className="border-0 shadow-xl rounded-[32px] overflow-hidden" style={{ backgroundColor: colors.surfaceAlt }}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-bold" style={{ color: colors.text }}>
                          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h4>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 text-center mb-4">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                          <span key={d} className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{d}</span>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((d, i) => {
                          const hasSessions = upcomingSessions.some(s => isSameDay(new Date(s.date), d.date));
                          const isSelected = isSameDay(d.date, selectedDate);
                          const isToday = isSameDay(d.date, new Date());
                          
                          return (
                            <button 
                              key={i} 
                              onClick={() => setSelectedDate(d.date)}
                              className={`aspect-square flex flex-col items-center justify-center rounded-2xl text-xs transition-all duration-200 relative group
                                ${!d.currentMonth ? 'opacity-20' : ''}
                                ${isSelected ? 'bg-primary text-white scale-110 shadow-lg z-10' : 'hover:bg-white/10'}
                              `}
                              style={{ 
                                color: isSelected ? 'white' : colors.text,
                                border: isToday && !isSelected ? `1.5px solid ${colors.primary}` : 'none'
                              }}
                            >
                              <span className="font-bold">{d.date.getDate()}</span>
                              {hasSessions && !isSelected && (
                                <div className="absolute bottom-2 h-1 w-1 rounded-full bg-primary" />
                              )}
                              {hasSessions && isSelected && (
                                <div className="absolute bottom-2 h-1 w-1 rounded-full bg-white" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[12px] font-bold uppercase tracking-widest opacity-40" style={{ color: colors.text }}>
                        {isSameDay(selectedDate, new Date()) ? "Today's" : selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} Sessions
                      </p>
                    </div>
                    {selectedDateSessions.length === 0 ? (
                      <div className="py-12 text-center rounded-[24px] border border-dashed border-white/10 opacity-40">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-3 opacity-20" />
                        <p className="text-xs font-medium">No sessions scheduled for this day</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedDateSessions.map(s => (
                          <motion.div 
                            layoutId={s.id.toString()}
                            key={s.id} 
                            className="flex items-center gap-4 p-5 rounded-[24px] border border-white/5 transition-all hover:bg-white/5"
                            style={{ backgroundColor: colors.surfaceAlt }}
                          >
                            <div className="rounded-2xl p-3 bg-background/50">
                              <s.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-[15px] font-bold truncate" style={{ color: colors.text }}>{s.type}</div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase opacity-40">
                                  <Clock className="h-3 w-3" />
                                  {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              <div className="text-[12px] font-medium opacity-60" style={{ color: colors.text }}>{s.provider}</div>
                            </div>
                            <ChevronRight className="h-4 w-4 opacity-20" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'book' && (
            <div className="space-y-6">
              <h3 className="text-[14px] font-bold uppercase tracking-widest opacity-40 px-1" style={{ color: colors.text }}>Request Booking</h3>
              <Card className="border-0 shadow-sm rounded-[32px]" style={{ backgroundColor: colors.surfaceAlt }}>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40" style={{ color: colors.text }}>Select Support Area</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { title: "Individual", sub: "Recovery Work" },
                        { title: "Group", sub: "Peer Support" },
                        { title: "CWMS", sub: "Med Management" },
                        { title: "ASH Support", sub: "Housing Stability" }
                      ].map(s => (
                        <button key={s.title} className="rounded-3xl border border-white/5 p-4 text-left hover:border-primary/50 transition-all bg-background/50 group">
                          <div className="text-[14px] font-bold mb-1 group-hover:text-primary transition-colors" style={{ color: colors.text }}>{s.title}</div>
                          <div className="text-[10px] opacity-40 font-medium">{s.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full h-14 rounded-[20px] text-white font-bold primary-gradient shadow-lg">Submit Request</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-[14px] font-bold uppercase tracking-widest opacity-40 px-1" style={{ color: colors.text }}>Activity History</h3>
              <div className="space-y-3">
                {pastSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-[24px] p-5 shadow-sm border border-white/5 group hover:bg-white/5 transition-colors" style={{ backgroundColor: colors.surfaceAlt }}>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <div className="text-[15px] font-bold" style={{ color: colors.text }}>{session.type}</div>
                        <div className="text-[11px] font-medium opacity-40" style={{ color: colors.text }}>{session.provider} • {session.date}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: colors.text }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
