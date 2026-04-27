import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Wind, Brain, ClipboardList, BookOpen, Loader2, Calendar, History, ShieldAlert, Scale } from "lucide-react";
import { useAppTheme } from "../theme/AppTheme";
import { db, collection, query, where, orderBy, onSnapshot } from "../firebase";
import { useAuth } from "../context/AuthContext";

export function ToolHistoryScreen({ onBack, onResumeCBT }: { onBack: () => void; onResumeCBT?: (id: string, data: any) => void }) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const breathworkQuery = query(
      collection(db, "breathworkSessions"),
      where("uid", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const groundingQuery = query(
      collection(db, "groundingSessions"),
      where("uid", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const thoughtQuery = query(
      collection(db, "thoughtRecords"),
      where("uid", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const dbtQuery = query(
      collection(db, "dbtRecords"),
      where("uid", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    let breathworkDocs: any[] = [];
    let groundingDocs: any[] = [];
    let thoughtDocs: any[] = [];
    let dbtDocs: any[] = [];

    const updateSessions = () => {
      const allSessions = [...breathworkDocs, ...groundingDocs, ...thoughtDocs, ...dbtDocs].sort((a, b) => {
        const timeA = new Date(a.timestamp?.toDate ? a.timestamp.toDate() : a.timestamp).getTime();
        const timeB = new Date(b.timestamp?.toDate ? b.timestamp.toDate() : b.timestamp).getTime();
        return timeB - timeA;
      });
      setSessions(allSessions);
      setLoading(false);
    };

    const unsubBreathwork = onSnapshot(breathworkQuery, (snapshot) => {
      breathworkDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'breathwork',
        ...doc.data(),
        date: doc.data().timestamp ? new Date(doc.data().timestamp.toDate ? doc.data().timestamp.toDate() : doc.data().timestamp).toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Recent'
      }));
      updateSessions();
    });

    const unsubGrounding = onSnapshot(groundingQuery, (snapshot) => {
      groundingDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'grounding',
        ...doc.data(),
        date: doc.data().timestamp ? new Date(doc.data().timestamp.toDate ? doc.data().timestamp.toDate() : doc.data().timestamp).toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Recent'
      }));
      updateSessions();
    });

    const unsubThought = onSnapshot(thoughtQuery, (snapshot) => {
      thoughtDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'thought-record',
        ...doc.data(),
        date: doc.data().timestamp ? new Date(doc.data().timestamp.toDate ? doc.data().timestamp.toDate() : doc.data().timestamp).toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Recent'
      }));
      updateSessions();
    });

    const unsubDBT = onSnapshot(dbtQuery, (snapshot) => {
      dbtDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'dbt',
        ...doc.data(),
        date: doc.data().timestamp ? new Date(doc.data().timestamp.toDate ? doc.data().timestamp.toDate() : doc.data().timestamp).toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Recent'
      }));
      updateSessions();
    });

    return () => {
      unsubBreathwork();
      unsubGrounding();
      unsubThought();
      unsubDBT();
    };
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'breathwork': return <Wind className="h-5 w-5 text-primary" />;
      case 'grounding': return <Brain className="h-5 w-5 text-primary" />;
      case 'thought-record': return <Scale className="h-5 w-5 text-emerald-500" />;
      case 'dbt': return <ShieldAlert className="h-5 w-5 text-orange-500" />;
      case 'journal': return <BookOpen className="h-5 w-5 text-primary" />;
      default: return <Calendar className="h-5 w-5 opacity-40" />;
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case 'breathwork': return 'Breathing Exercise';
      case 'grounding': return '5-4-3-2-1 Grounding';
      case 'thought-record': return 'Thought Record';
      case 'dbt': return 'DBT Skills Log';
      case 'journal': return 'Journal Entry';
      default: return type;
    }
  };

  const getSubtitle = (session: any) => {
    if (session.type === 'breathwork') {
      return `${session.cycles} cycles of ${session.technique === 'box' ? 'Box Breathing' : '4-7-8'}`;
    }
    if (session.type === 'grounding') {
      return 'Completed sensory awareness session';
    }
    if (session.type === 'thought-record') {
      return `Reframed: ${session.balancedThought?.substring(0, 30)}...`;
    }
    if (session.type === 'dbt') {
      return `Mindfulness: ${session.mindfulness?.substring(0, 30)}...`;
    }
    return '';
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="rounded-full p-2 transition-colors hover:bg-white/5" style={{ color: colors.primary }}>
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-bold" style={{ color: colors.text }}>Activity History</h2>
          <div className="w-10" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-6 pb-24">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center opacity-40">
              <History className="h-12 w-12 mx-auto mb-4" />
              <p className="text-sm">No activity recorded yet.</p>
            </div>
          ) : (
            sessions.map(session => (
              <Card 
                key={session.id} 
                className="border-0 rounded-[24px] overflow-hidden"
                style={{ backgroundColor: colors.surfaceAlt }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-background/50 flex items-center justify-center shrink-0">
                    {getIcon(session.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold" style={{ color: colors.text }}>
                        {getTitle(session.type)}
                      </span>
                      <span className="text-[10px] opacity-40" style={{ color: colors.text }}>{session.date}</span>
                    </div>
                    <p className="text-[10px] opacity-60 truncate" style={{ color: colors.text }}>
                      {getSubtitle(session)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
