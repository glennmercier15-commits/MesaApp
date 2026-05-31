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
import { Accordion } from "../components/Accordion";
import { BiometricVerification } from "../components/BiometricVerification";

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
  
  // Sensitive area security check states
  const [isSecureVerified, setIsSecureVerified] = useState(false);
  const sensitiveLockEnabled = localStorage.getItem("biometric_sensitive_areas") === "true";

  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<SafetyPlanData>(DEFAULT_PLAN);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ sectionId: keyof SafetyPlanData, index: number, value: string } | null>(null);
  const [newItemValue, setNewItemValue] = useState("");
  const [showConfirmShare, setShowConfirmShare] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [validationError, setValidationError] = useState<{ sectionId: string; message: string } | null>(null);
  const [editValidationError, setEditValidationError] = useState<string | null>(null);

  const handleNewItemChange = (val: string) => {
    setNewItemValue(val);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleEditChange = (val: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, value: val });
    }
    if (editValidationError) {
      setEditValidationError(null);
    }
  };

  const sharePlan = async () => {
    if (!user) return;
    setSharing(true);
    try {
      const planRef = doc(db, 'safetyPlans', user.uid);
      await setDoc(planRef, {
        ...plan,
        uid: user.uid,
        updatedAt: new Date().toISOString(),
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
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `safetyPlans/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
    setEditingItem(null);
    setNewItemValue("");
    setValidationError(null);
    setEditValidationError(null);
  };

  const deleteItem = (sectionId: keyof SafetyPlanData, itemIndex: number) => {
    const newItems = plan[sectionId].filter((_, i) => i !== itemIndex);
    const updatedPlan = { ...plan, [sectionId]: newItems };
    setPlan(updatedPlan);
    setValidationError(null);
    setEditValidationError(null);
    savePlan(updatedPlan);
  };

  const addItem = (sectionId: keyof SafetyPlanData) => {
    if (!newItemValue.trim()) {
      setValidationError({
        sectionId,
        message: "Please enter a value before adding."
      });
      return;
    }
    setValidationError(null);
    const newItems = [...plan[sectionId], newItemValue.trim()];
    const updatedPlan = { ...plan, [sectionId]: newItems };
    setPlan(updatedPlan);
    setNewItemValue("");
    savePlan(updatedPlan);
  };

  const saveEdit = () => {
    if (!editingItem) return;
    if (!editingItem.value.trim()) {
      setEditValidationError("The item value cannot be empty.");
      return;
    }
    setEditValidationError(null);
    const sectionId = editingItem.sectionId;
    const newItems = [...plan[sectionId]];
    newItems[editingItem.index] = editingItem.value.trim();
    const updatedPlan = { ...plan, [sectionId]: newItems };
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

  return (
    <div className="relative h-full bg-background overflow-hidden">
      {loading ? (
        <div className="flex h-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
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
                <Accordion
                  key={section.id}
                  title={section.title}
                  icon={section.icon}
                  step={section.step}
                  isOpen={expandedSection === section.id}
                  onToggle={() => toggleSection(section.id)}
                >
                  {plan[section.id].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                      {editingItem?.sectionId === section.id && editingItem?.index === i ? (
                        <div className="flex flex-1 flex-col gap-1.5 animate-fadeIn">
                          <div className="flex items-center gap-2">
                            <Input 
                              value={editingItem.value}
                              onChange={(e) => handleEditChange(e.target.value)}
                              className={cn(
                                "h-11 bg-surfaceAlt rounded-[12px] text-[14px] w-full",
                                editValidationError ? "border-danger ring-1 ring-danger" : "border-primary/20"
                              )}
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                            />
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-success hover:bg-success/10 shrink-0" onClick={saveEdit}>
                              <Check className="h-5 w-5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-danger hover:bg-danger/10 shrink-0" onClick={() => { setEditingItem(null); setEditValidationError(null); }}>
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                          {editValidationError && (
                            <span className="text-[12px] font-semibold text-danger px-1 animate-fadeIn">
                              {editValidationError}
                            </span>
                          )}
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
                  
                  <div className="flex flex-col gap-1.5 pt-2">
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Add new item..."
                        value={newItemValue}
                        onChange={(e) => handleNewItemChange(e.target.value)}
                        className={cn(
                          "h-12 bg-transparent border-dashed rounded-[16px] text-[14px] w-full",
                          validationError?.sectionId === section.id ? "border-danger ring-1 ring-danger" : "border-border"
                        )}
                        onKeyDown={(e) => e.key === 'Enter' && addItem(section.id)}
                      />
                      <Button 
                        size="icon" 
                        className="h-12 w-12 rounded-[16px] primary-gradient border-0 text-white shadow-lg shrink-0"
                        onClick={() => addItem(section.id)}
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>
                    {validationError?.sectionId === section.id && (
                      <span className="text-[12px] font-semibold text-danger px-1 animate-fadeIn">
                        {validationError.message}
                      </span>
                    )}
                  </div>
                </Accordion>
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
      )}

      {/* Verification Overlay */}
      <AnimatePresence>
        {sensitiveLockEnabled && !isSecureVerified && (
          <motion.div
            key="safety-plan-verification-overlay"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%", transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
            className="absolute inset-0 z-50 bg-background"
          >
            <BiometricVerification 
              sensitiveArea="Safety Plan"
              onVerifySuccess={() => setIsSecureVerified(true)}
              onCancel={onBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
