import React, { useState } from "react";
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
  X
} from "lucide-react";
import { theme } from "../theme";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";

interface SafetyPlanScreenProps {
  onBack: () => void;
}

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold tracking-wide" style={{ color: theme.foreground }}>{title}</h3>
      {action ? <button className="text-xs font-medium" style={{ color: theme.primary }}>{action}</button> : null}
    </div>
  );
}

export function SafetyPlanScreen({ onBack }: SafetyPlanScreenProps) {
  const [sections, setSections] = useState([
    { id: 'warning', title: "Warning Signs", items: ["Feeling isolated", "Trouble sleeping", "Increased irritability"], icon: AlertTriangle },
    { id: 'coping', title: "Internal Coping Strategies", items: ["Box breathing", "Going for a walk", "Playing guitar"], icon: Wind },
    { id: 'social', title: "Social Contacts (Distraction)", items: ["Call Sarah", "Visit the library", "Coffee shop"], icon: Users },
    { id: 'professional', title: "Professional Support", items: ["MacKay Manor 24hr Line", "Jordan (Case Manager)", "Crisis Services Canada"], icon: PhoneCall },
    { id: 'environment', title: "Safe Environment", items: ["Remove triggers from home", "Stay in well-lit public spaces"], icon: ShieldCheck },
  ]);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ sectionId: string, index: number, value: string } | null>(null);
  const [newItemValue, setNewItemValue] = useState("");

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
    setEditingItem(null);
  };

  const deleteItem = (sectionId: string, itemIndex: number) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, items: s.items.filter((_, i) => i !== itemIndex) };
      }
      return s;
    }));
  };

  const addItem = (sectionId: string) => {
    if (!newItemValue.trim()) return;
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, items: [...s.items, newItemValue.trim()] };
      }
      return s;
    }));
    setNewItemValue("");
  };

  const saveEdit = () => {
    if (!editingItem) return;
    setSections(prev => prev.map(s => {
      if (s.id === editingItem.sectionId) {
        const newItems = [...s.items];
        newItems[editingItem.index] = editingItem.value.trim();
        return { ...s, items: newItems.filter(item => item.length > 0) };
      }
      return s;
    }));
    setEditingItem(null);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="p-6 pb-0">
        <button onClick={onBack} className="flex items-center text-sm font-medium mb-8 transition-opacity hover:opacity-80" style={{ color: theme.primary }}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </button>

        <Card className="border-0 shadow-sm rounded-3xl mb-8" style={{ backgroundColor: theme.softAccent }}>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5" style={{ color: theme.accent }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.accent }}>Safety Plan</span>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: theme.foreground }}>A calm plan for hard moments</h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
              Stored encrypted and shareable with your assigned MacKay Manor case manager. Update anytime.
            </p>
            <Button className="w-full h-12 rounded-2xl font-bold text-background" style={{ backgroundColor: theme.accent }}>Edit Full Plan</Button>
          </CardContent>
        </Card>
      </div>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-6 pb-24">
          <div>
            <SectionTitle title="Plan Sections" />
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div key={section.id} className="space-y-2">
                  <Card 
                    onClick={() => toggleSection(section.id)} 
                    className="border-0 shadow-sm rounded-3xl cursor-pointer transition-all hover:bg-white/10" 
                    style={{ backgroundColor: theme.secondary }}
                  >
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                          <section.icon className="h-5 w-5" style={{ color: theme.primary }} />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.muted }}>Step {index + 1}</div>
                          <div className="text-sm font-bold" style={{ color: theme.foreground }}>{section.title}</div>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedSection === section.id ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-5 w-5" style={{ color: theme.muted }} />
                      </motion.div>
                    </CardContent>
                  </Card>

                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden px-2"
                      >
                        <div className="space-y-2 py-2">
                          {section.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 group">
                              {editingItem?.sectionId === section.id && editingItem?.index === i ? (
                                <div className="flex flex-1 items-center gap-2">
                                  <Input 
                                    value={editingItem.value}
                                    onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                                    className="h-9 bg-white/5 border-white/10 rounded-xl text-sm"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                  />
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-emerald-400" onClick={saveEdit}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-red-400" onClick={() => setEditingItem(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div 
                                    className="flex-1 p-3 rounded-2xl bg-white/5 text-sm cursor-pointer hover:bg-white/10 transition-colors"
                                    onClick={() => setEditingItem({ sectionId: section.id, index: i, value: item })}
                                  >
                                    {item}
                                  </div>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10"
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
                              className="h-10 bg-white/5 border-dashed border-white/20 rounded-2xl text-sm"
                              onKeyDown={(e) => e.key === 'Enter' && addItem(section.id)}
                            />
                            <Button 
                              size="icon" 
                              className="h-10 w-10 rounded-2xl bg-primary text-background"
                              onClick={() => addItem(section.id)}
                            >
                              <Plus className="h-5 w-5" />
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

          <div>
            <SectionTitle title="Immediate Support" />
            <div className="grid gap-3">
              <Card className="border-0 shadow-sm rounded-3xl" style={{ backgroundColor: theme.secondary }}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl p-3 bg-white/5">
                      <PhoneCall className="h-5 w-5" style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: theme.foreground }}>Call Support Contact</div>
                      <div className="text-[10px] font-medium" style={{ color: theme.muted }}>Fast access to someone you trust</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5" style={{ color: theme.primary }} />
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm rounded-3xl" style={{ backgroundColor: theme.secondary }}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl p-3 bg-white/5">
                      <MapPin className="h-5 w-5" style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: theme.foreground }}>Safe Places</div>
                      <div className="text-[10px] font-medium" style={{ color: theme.muted }}>Grounding spaces you can go to</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5" style={{ color: theme.primary }} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
