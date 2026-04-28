import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Wind, 
  Users, 
  PhoneCall, 
  ShieldCheck, 
  MapPin,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { useAuth } from "../context/AuthContext";
import { db, doc, setDoc, onSnapshot } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { useAppTheme } from "../theme/AppTheme";
import { cn } from "../lib/utils";

interface SafetyPlanScreenProps {
  onBack: () => void;
}

interface SafetyPlanData {
  warningSigns: string[];
  copingStrategies: string[];
  socialContacts: string[];
  professionalSupport: string[];
  safeEnvironment: string[];
}

const DEFAULT_PLAN: SafetyPlanData = {
  warningSigns: [],
  copingStrategies: [],
  socialContacts: [],
  professionalSupport: [],
  safeEnvironment: [],
};

export function SafetyPlanScreen({ onBack }: SafetyPlanScreenProps) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<SafetyPlanData>(DEFAULT_PLAN);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ sectionId: keyof SafetyPlanData, index: number, value: string } | null>(null);
  const [newItemValue, setNewItemValue] = useState("");
  const [showConfirmShare, setShowConfirmShare] = useState(false);
  const [sharing, setSharing] = useState(false);

  const sharePlan = async () => {
    if (!user) return;
    setSharing(true);
    try {
      const planRef = doc(db, 'safetyPlans', user.uid);
      await setDoc(planRef, {
        sharedWithCaseManager: true,
        sharedAt: new Date().toISOString()
      }, { merge: true });
      setShowConfirmShare(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `safetyPlans/${user.uid}`);
    } finally {
      setSharing(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const planRef = doc(db, 'safetyPlans', user.uid);
    
    const unsubscribe = onSnapshot(planRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPlan({
          warningSigns: data.warningSigns || [],
          copingStrategies: data.copingStrategies || [],
          socialContacts: data.socialContacts || [],
          professionalSupport: data.professionalSupport || [],
          safeEnvironment: data.safeEnvironment || [],
        });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `safetyPlans/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  const savePlan = async (updatedPlan: SafetyPlanData) => {
    if (!user) return;
    setSaving(true);
    try {
      const planRef = doc(db, 'safetyPlans', user.uid);
      await setDoc(planRef, {
        ...updatedPlan,
        uid: user.uid,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `safetyPlans/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
    setEditingItem(null);
  };

  const deleteItem = (sectionId: keyof SafetyPlanData, itemIndex: number) => {
    const newItems = plan[sectionId].filter((_, i) => i !== itemIndex);
    const updatedPlan = { ...plan, [sectionId]: newItems };
    setPlan(updatedPlan);
    savePlan(updatedPlan);
  };

  const addItem = (sectionId: keyof SafetyPlanData) => {
    if (!newItemValue.trim()) return;
    const newItems = [...plan[sectionId], newItemValue.trim()];
    const updatedPlan = { ...plan, [sectionId]: newItems };
    setPlan(updatedPlan);
    setNewItemValue("");
    savePlan(updatedPlan);
  };

  const saveEdit = () => {
    if (!editingItem) return;
    const sectionId = editingItem.sectionId;
    const newItems = [...plan[sectionId]];
    newItems[editingItem.index] = editingItem.value.trim();
    const updatedPlan = { ...plan, [sectionId]: newItems.filter(item => item.length > 0) };
    setPlan(updatedPlan);
    setEditingItem(null);
    savePlan(updatedPlan);
  };

  const sections = [
    { id: 'warningSigns', title: "Warning Signs", icon: AlertTriangle, step: 1 },
    { id: 'copingStrategies', title: "Internal Coping Strategies", icon: Wind, step: 2 },
    { id: 'socialContacts', title: "Social Contacts (Distraction)", icon: Users, step: 3 },
    { id: 'professionalSupport', title: "Professional Support", icon: PhoneCall, step: 4 },
    { id: 'safeEnvironment', title: "Safe Environment", icon: ShieldCheck, step: 5 },
  ] as const;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="p-6 pb-0">
        <button onClick={onBack} className="flex items-center text-sm font-bold mb-8 transition-opacity hover:opacity-80" style={{ color: colors.primary }}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </button>

        <Card className="border-0 shadow-xl rounded-[24px] mb-8 overflow-hidden primary-gradient text-white">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Shield className="h-24 w-24" />
            </div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Safety Plan</span>
            </div>
            <h3 className="text-[22px] font-bold mb-2">A calm plan for hard moments</h3>
            <p className="text-[13px] leading-relaxed opacity-70 mb-4 max-w-[80%]">
              Stored encrypted and shareable with your assigned MacKay Manor case manager.
            </p>
            <Button 
                onClick={() => setShowConfirmShare(true)}
                className="flex items-center gap-2 bg-white/20 text-white hover:bg-white/30 border-0 rounded-[12px] text-[13px] font-bold h-10 px-4"
            >
                <Share2 className="h-4 w-4" /> Share Plan
            </Button>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest opacity-50 mt-4">
              <Check className="h-3 w-3" />
              Trauma-Informed Support
            </div>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {showConfirmShare && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
            >
                <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="bg-background rounded-[24px] p-6 w-full max-w-sm space-y-4 shadow-2xl border border-white/10"
                >
                    <h3 className="text-xl font-bold">Securely Share Plan</h3>
                    <p className="text-sm opacity-70 leading-relaxed">
                        This action will share your safety plan with your assigned MacKay Manor case manager. 
                        It will be encrypted in transit and at rest.
                    </p>
                    <div className="flex gap-2 pt-2">
                        <Button variant="ghost" className="flex-1 rounded-[16px]" onClick={() => setShowConfirmShare(false)}>Cancel</Button>
                        <Button className="flex-1 rounded-[16px] primary-gradient text-white border-0" onClick={sharePlan} disabled={sharing}>
                            {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm & Share'}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-6 pb-24">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[14px] font-bold uppercase tracking-widest opacity-40">Plan Sections</h3>
              {saving && <span className="text-[10px] font-bold text-primary animate-pulse uppercase tracking-widest">Saving...</span>}
            </div>
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.id} className="space-y-2">
                  <Card 
                    onClick={() => toggleSection(section.id)} 
                    className={cn(
                      "border-0 shadow-sm rounded-[20px] cursor-pointer transition-all duration-300",
                      expandedSection === section.id ? "ring-2 ring-primary/20" : "hover:bg-primary/5"
                    )} 
                    style={{ backgroundColor: colors.surfaceAlt }}
                  >
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-background/50 shadow-sm">
                          <section.icon className="h-6 w-6" style={{ color: colors.primary }} />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Step {section.step}</div>
                          <div className="text-[15px] font-bold" style={{ color: colors.text }}>{section.title}</div>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedSection === section.id ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-5 w-5 opacity-30" />
                      </motion.div>
                    </CardContent>
                  </Card>

                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden px-1"
                      >
                        <div className="space-y-2 py-3">
                          {plan[section.id].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 group">
                              {editingItem?.sectionId === section.id && editingItem?.index === i ? (
                                <div className="flex flex-1 items-center gap-2">
                                  <Input 
                                    value={editingItem.value}
                                    onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                                    className="h-11 bg-surfaceAlt border-primary/20 rounded-[12px] text-[14px]"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                  />
                                  <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-success" onClick={saveEdit}>
                                    <Check className="h-5 w-5" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-danger" onClick={() => setEditingItem(null)}>
                                    <X className="h-5 w-5" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div 
                                    className="flex-1 p-4 rounded-[16px] bg-surfaceAlt text-[14px] font-medium cursor-pointer hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10"
                                    onClick={() => setEditingItem({ sectionId: section.id, index: i, value: item })}
                                  >
                                    {item}
                                  </div>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 text-danger hover:bg-danger/10 transition-all"
                                    onClick={() => deleteItem(section.id, i)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          ))}
                          
                          <div className="flex items-center gap-2 pt-2">
                            <Input 
                              placeholder="Add new item..."
                              value={newItemValue}
                              onChange={(e) => setNewItemValue(e.target.value)}
                              className="h-12 bg-transparent border-dashed border-border rounded-[16px] text-[14px]"
                              onKeyDown={(e) => e.key === 'Enter' && addItem(section.id)}
                            />
                            <Button 
                              size="icon" 
                              className="h-12 w-12 rounded-[16px] primary-gradient border-0 text-white shadow-lg"
                              onClick={() => addItem(section.id)}
                            >
                              <Plus className="h-6 w-6" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-bold uppercase tracking-widest opacity-40 px-1">Immediate Support</h3>
            <div className="grid gap-3">
              <a href="tel:18669992727" className="block">
                <Card className="border-0 shadow-sm rounded-[20px] hover:bg-primary/5 transition-colors cursor-pointer" style={{ backgroundColor: colors.surfaceAlt }}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-[14px] p-3 bg-background/50 shadow-sm">
                        <PhoneCall className="h-5 w-5" style={{ color: colors.primary }} />
                      </div>
                      <div>
                        <div className="text-[15px] font-bold" style={{ color: colors.text }}>Call MacKay Manor 24hr</div>
                        <div className="text-[11px] font-medium opacity-40">Immediate recovery support</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-30" />
                  </CardContent>
                </Card>
              </a>
              <Card className="border-0 shadow-sm rounded-[20px] hover:bg-primary/5 transition-colors cursor-pointer" style={{ backgroundColor: colors.surfaceAlt }}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-[14px] p-3 bg-background/50 shadow-sm">
                      <MapPin className="h-5 w-5" style={{ color: colors.primary }} />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold" style={{ color: colors.text }}>Safe Places</div>
                      <div className="text-[11px] font-medium opacity-40">Grounding spaces in Renfrew County</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-30" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
