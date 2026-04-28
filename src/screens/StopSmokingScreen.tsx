import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Flame, 
  ChevronLeft, 
  History, 
  CheckCircle2 
} from "lucide-react";
import { theme } from "../theme";

interface StopSmokingScreenProps {
  onBack: () => void;
}

export function StopSmokingScreen({ onBack }: StopSmokingScreenProps) {
  const { user } = useAuth();
  const [intensity, setIntensity] = useState(5);
  const [nrtUsed, setNrtUsed] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;

    const logsQuery = query(
      collection(db, "stopSmokingLogs"),
      where("uid", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "stopSmokingLogs");
    });

    return () => unsubscribe();
  }, [user]);

  const handleLog = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, "stopSmokingLogs"), {
        uid: user.uid,
        intensity,
        nrtUsed,
        timestamp: serverTimestamp(),
      });
      setIsLogged(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "stopSmokingLogs");
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="p-6">
        <button onClick={onBack} className="flex items-center text-sm font-medium mb-8 transition-opacity hover:opacity-80" style={{ color: theme.primary }}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </button>

        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/5">
              <Flame className="h-6 w-6" style={{ color: theme.primary }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: theme.foreground }}>STOP Smoking Log</h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
            Track your tobacco cravings and NRT usage. This data helps your counselor tailor your support.
          </p>
        </div>

        {isLogged ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold" style={{ color: theme.foreground }}>Craving Logged</h3>
            <p className="text-sm" style={{ color: theme.muted }}>Great job using your tools. Returning home...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-0 shadow-sm rounded-3xl" style={{ backgroundColor: theme.secondary }}>
              <CardContent className="p-6 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold" style={{ color: theme.foreground }}>Craving Intensity</label>
                    <span className="text-lg font-bold" style={{ color: theme.primary }}>{intensity} / 10</span>
                  </div>
                  <Slider 
                    value={[intensity]} 
                    max={10} 
                    step={1} 
                    onValueChange={(val) => setIntensity(val[0])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.muted }}>
                    <span>Mild</span>
                    <span>Severe</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold" style={{ color: theme.foreground }}>NRT Used?</div>
                    <div className="text-xs" style={{ color: theme.muted }}>Nicotine Replacement Therapy</div>
                  </div>
                  <Switch checked={nrtUsed} onCheckedChange={setNrtUsed} />
                </div>

                <Button 
                  onClick={handleLog}
                  className="w-full h-14 rounded-2xl text-lg font-bold text-background" 
                  style={{ backgroundColor: theme.primary }}
                >
                  Log Craving
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: theme.muted }}>Recent History</h3>
              <div className="space-y-2">
                {history.map((log: any, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <History className="h-4 w-4" style={{ color: theme.muted }} />
                      <div className="text-xs font-medium" style={{ color: theme.foreground }}>
                        {log.timestamp?.toDate().toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold" style={{ color: theme.primary }}>LVL {log.intensity}</span>
                      {log.nrtUsed && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-emerald-500">NRT</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
