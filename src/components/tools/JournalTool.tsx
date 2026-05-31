import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  ChevronLeft, 
  RefreshCw, 
  Trash2, 
  Share2, 
  Lock, 
  Plus,
  Loader2
} from "lucide-react";
import { theme } from "../../theme";
import { 
  db, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { BiometricVerification } from "../BiometricVerification";

export function JournalTool({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  
  // Sensitive folder verification hook state
  const [isSecureVerified, setIsSecureVerified] = useState(false);
  const sensitiveLockEnabled = localStorage.getItem("biometric_sensitive_areas") === "true";

  const [view, setView] = useState<'list' | 'editor' | 'viewer'>('list');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [promptIdx, setPromptIdx] = useState(0);

  const prompts = [
    "What is one thing that felt manageable today, even if it was small?",
    "How did you show up for yourself this morning?",
    "What sensory detail brought you comfort today?",
    "If you could say one kind thing to your past self, what would it be?",
  ];

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "journals"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate?.()?.toLocaleDateString() || "Just now"
      }));
      setEntries(docs);
      setLoading(false);
    }, (error) => {
      console.error("Journal Snapshot Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!user || !currentEntry.text.trim()) return;

    const wordCount = currentEntry.text.trim().split(/\s+/).length;

    try {
      if (currentEntry.id) {
        const entryRef = doc(db, "journals", currentEntry.id);
        await updateDoc(entryRef, {
          text: currentEntry.text,
          shared: currentEntry.shared,
          wordCount
        });
      } else {
        await addDoc(collection(db, "journals"), {
          uid: user.uid,
          text: currentEntry.text,
          shared: currentEntry.shared,
          createdAt: new Date().toISOString(), // Using string for now to match rules validation if needed, or use serverTimestamp
          wordCount
        });
      }
      setView('list');
    } catch (error) {
      console.error("Error saving journal entry:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "journals", id));
      setView('list');
    } catch (error) {
      console.error("Error deleting journal entry:", error);
    }
  };

  return (
    <div className="relative h-full bg-background overflow-hidden">
      {view === 'editor' ? (
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setView('list')} className="rounded-full p-2 transition-colors hover:bg-white/5" style={{ color: theme.primary }}>
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">SHARE WITH THERAPIST</span>
              <button 
                onClick={() => setCurrentEntry({...currentEntry, shared: !currentEntry.shared})}
                className={`h-6 w-11 rounded-full p-1 transition-colors ${currentEntry.shared ? 'bg-primary' : 'bg-white/10'}`}
              >
                <div className={`h-4 w-4 rounded-full bg-white transition-transform ${currentEntry.shared ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-2xl bg-white/5 italic text-xs flex justify-between items-start gap-4" style={{ color: theme.muted }}>
            <span>"{prompts[promptIdx]}"</span>
            <button onClick={() => setPromptIdx((promptIdx + 1) % prompts.length)} className="p-1 hover:text-primary transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <textarea 
            className="flex-1 w-full rounded-3xl border-0 bg-white/5 p-6 shadow-sm focus:outline-none text-lg text-white placeholder:text-white/20 resize-none"
            placeholder="Start writing..."
            value={currentEntry.text}
            onChange={(e) => setCurrentEntry({...currentEntry, text: e.target.value})}
          />

          <Button onClick={handleSave} className="w-full h-14 rounded-2xl mt-4 font-bold text-background" style={{ backgroundColor: theme.primary }}>
            Save Entry
          </Button>
        </div>
      ) : view === 'viewer' ? (
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setView('list')} className="rounded-full p-2 transition-colors hover:bg-white/5" style={{ color: theme.primary }}>
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="text-[10px] font-bold" style={{ color: theme.muted }}>{currentEntry.date}</div>
            <button onClick={() => handleDelete(currentEntry.id)} className="p-2 text-red-400 hover:text-red-500 transition-colors">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-4 pb-8">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.primary }}>
                {currentEntry.shared ? <><Share2 className="h-3 w-3" /> SHARED WITH CARE TEAM</> : <><Lock className="h-3 w-3" /> PRIVATE ENTRY</>}
              </div>
              <p className="text-lg leading-relaxed whitespace-pre-wrap" style={{ color: theme.foreground }}>{currentEntry.text}</p>
            </div>
          </ScrollArea>
          <Button onClick={() => setView('editor')} variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-white/80 font-bold">Edit Entry</Button>
        </div>
      ) : (
        <div className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="rounded-full p-2 transition-colors hover:bg-white/5" style={{ color: theme.primary }}>
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-bold" style={{ color: theme.foreground }}>Journal</h2>
            <button onClick={() => { setCurrentEntry({ text: "", shared: false }); setView('editor'); }} className="rounded-full p-2 transition-colors hover:bg-primary/20" style={{ backgroundColor: theme.soft, color: theme.primary }}>
              <Plus className="h-6 w-6" />
            </button>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-3 pb-24">
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : entries.length === 0 ? (
                <div className="py-12 text-center" style={{ color: theme.muted }}>
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No entries yet. Start your first reflection.</p>
                </div>
              ) : (
                entries.map(entry => (
                  <Card key={entry.id} onClick={() => { setCurrentEntry(entry); setView('viewer'); }} className="cursor-pointer border-0 shadow-sm rounded-3xl transition-all hover:ring-1 hover:ring-primary/30" style={{ backgroundColor: theme.secondary }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.muted }}>{entry.date}</div>
                        {entry.shared && <Share2 className="h-3 w-3" style={{ color: theme.primary }} />}
                      </div>
                      <p className="text-sm line-clamp-2 mb-3" style={{ color: theme.foreground }}>{entry.text}</p>
                      <div className="text-[10px] font-medium" style={{ color: theme.muted }}>{entry.wordCount} words</div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Verification Overlay */}
      <AnimatePresence>
        {sensitiveLockEnabled && !isSecureVerified && (
          <motion.div
            key="journal-verification-overlay"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%", transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
            className="absolute inset-0 z-50 bg-background"
          >
            <BiometricVerification 
              sensitiveArea="Private Journal"
              onVerifySuccess={() => setIsSecureVerified(true)}
              onCancel={onBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
