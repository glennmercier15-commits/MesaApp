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
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { useAppTheme } from "../theme/AppTheme";
import { cn } from "../lib/utils";
import { Accordion } from "../components/Accordion";
import { SafetyPlan } from "../types";
import { subscribeSafetyPlan, saveSafetyPlan } from "../services/safetyPlanService";

interface SafetyPlanProps {
  onBack: () => void;
}

const SECTIONS = [
  { id: 'warningSigns', title: "Warning Signs", icon: AlertTriangle, step: 1 },
  { id: 'copingStrategies', title: "Coping Strategies", icon: Wind, step: 2 },
  { id: 'supportContacts', title: "Support Contacts", icon: Users, step: 3 },
  { id: 'environmentSafety', title: "Safe Environment", icon: ShieldCheck, step: 4 },
] as const;

export function SafetyPlanScreen({ onBack }: SafetyPlanProps) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<SafetyPlan | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // State for adding new items or editing existing ones.
  // For simplicity, we'll keep editing state generic.
  const [editingItem, setEditingItem] = useState<{ sectionId: string; index: number; value: any } | null>(null);
  const [newItemValue, setNewItemValue] = useState("");
  const [showConfirmShare, setShowConfirmShare] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeSafetyPlan(
      user.uid,
      (plan) => {
        setPlan(plan);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `safetyPlans/${user.uid}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const saveCurrentPlan = async (updatedPlan: SafetyPlan) => {
    if (!user) return;
    setSaving(true);
    try {
      await saveSafetyPlan(user.uid, {
        warningSigns: updatedPlan.warningSigns,
        copingStrategies: updatedPlan.copingStrategies,
        supportContacts: updatedPlan.supportContacts,
        environmentSafety: updatedPlan.environmentSafety,
        sharedWithCaseManager: updatedPlan.sharedWithCaseManager,
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
    setNewItemValue("");
    setValidationError(null);
  };

  const sharePlan = async () => {
    if (!user || !plan) return;
    setSharing(true);
    try {
      await saveSafetyPlan(user.uid, {
        ...plan,
        sharedWithCaseManager: true,
      });
      setShowConfirmShare(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `safetyPlans/${user.uid}`);
    } finally {
      setSharing(false);
    }
  };

  const deleteItem = (sectionId: string, itemIndex: number) => {
    if (!plan) return;
    
    let updatedPlan = { ...plan };
    
    if (sectionId === 'supportContacts') {
        const newContacts = [...plan.supportContacts];
        newContacts.splice(itemIndex, 1);
        updatedPlan.supportContacts = newContacts;
    } else if (sectionId === 'warningSigns') {
        const newSigns = [...plan.warningSigns];
        newSigns.splice(itemIndex, 1);
        updatedPlan.warningSigns = newSigns;
    } else if (sectionId === 'copingStrategies') {
        const newStrategies = [...plan.copingStrategies];
        newStrategies.splice(itemIndex, 1);
        updatedPlan.copingStrategies = newStrategies;
    }
    
    setPlan(updatedPlan);
    saveCurrentPlan(updatedPlan);
  };

  const addItem = (sectionId: 'warningSigns' | 'copingStrategies' | 'supportContacts') => {
    if (!newItemValue.trim() || !plan) return;
    
    let updatedPlan = { ...plan };

    if (sectionId === 'supportContacts') {
        // For simplicity, just adding a placeholder contact. 
        // Need a more robust UI for adding full contacts later.
        updatedPlan.supportContacts = [...plan.supportContacts, { name: newItemValue.trim(), relation: "Friend", phone: "000-000-0000" }];
    } else if (sectionId === 'warningSigns') {
        updatedPlan.warningSigns = [...plan.warningSigns, newItemValue.trim()];
    } else if (sectionId === 'copingStrategies') {
        updatedPlan.copingStrategies = [...plan.copingStrategies, newItemValue.trim()];
    }
    
    setPlan(updatedPlan);
    setNewItemValue("");
    saveCurrentPlan(updatedPlan);
  };

  const saveEdit = () => {
    if (!editingItem || !plan) return;
    const sectionId = editingItem.sectionId;
    const newItems = [...(sectionId === 'supportContacts' ? plan.supportContacts : (plan as any)[sectionId])];
    newItems[editingItem.index] = editingItem.value;
    const updatedPlan = { ...plan, [sectionId]: newItems };
    setPlan(updatedPlan);
    setEditingItem(null);
    saveCurrentPlan(updatedPlan);
  };

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
              {SECTIONS.map((section) => (
                <Accordion
                  key={section.id}
                  title={section.title}
                  icon={section.icon}
                  step={section.step}
                  isOpen={expandedSection === section.id}
                  onToggle={() => toggleSection(section.id)}
                >
                  {expandedSection === section.id && plan && (
                    <div className="space-y-3 pt-4 px-1 pb-4">
                      {section.id === 'supportContacts' ? (
                        plan.supportContacts.map((contact, i) => (
                           <div key={i} className="flex items-center justify-between p-4 rounded-[16px] bg-surfaceAlt text-sm border border-transparent">
                             <div>
                               <p className="font-bold">{contact.name}</p>
                               <p className="text-[12px] opacity-70">{contact.relation} • {contact.phone}</p>
                             </div>
                             <Button size="icon" variant="ghost" className="text-danger hover:bg-danger/10 rounded-xl" onClick={() => deleteItem(section.id, i)}>
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                        ))
                      ) : section.id === 'environmentSafety' ? (
                        <div className="p-1">
                          <Input 
                            value={plan.environmentSafety}
                            onChange={(e) => setPlan({ ...plan, environmentSafety: e.target.value })}
                            onBlur={() => saveCurrentPlan(plan)}
                            className="bg-surfaceAlt border-0 rounded-[12px]"
                            placeholder="Describe your safe environment..."
                          />
                        </div>
                      ) : (
                        (plan as any)[section.id].map((item: string, i: number) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-[16px] bg-surfaceAlt text-[14px] font-medium border border-transparent">
                            <p>{item}</p>
                            <Button size="icon" variant="ghost" className="text-danger hover:bg-danger/10 rounded-xl" onClick={() => deleteItem(section.id, i)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                      
                      {section.id !== 'environmentSafety' && (
                        <div className="pt-2">
                          <Input 
                            placeholder={`Add to ${section.title}...`}
                            value={newItemValue}
                            onChange={(e: any) => {setNewItemValue(e.target.value); setValidationError(null)}}
                            onKeyDown={(e: any) => e.key === 'Enter' && addItem(section.id as any)}
                            className="h-12 bg-transparent border-dashed border-border rounded-[16px]"
                          />
                        </div>
                      )}
                    </div>
                  )}
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
  );
}
