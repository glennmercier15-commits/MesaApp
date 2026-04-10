import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Home, 
  CheckCircle2, 
  ClipboardList, 
  Star 
} from "lucide-react";
import { theme } from "../theme";

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold tracking-wide" style={{ color: theme.foreground }}>{title}</h3>
      {action ? <button className="text-xs font-medium" style={{ color: theme.primary }}>{action}</button> : null}
    </div>
  );
}

export function HousingScreen() {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4 pb-24">
        <Card className="border-0 shadow-sm rounded-3xl" style={{ backgroundColor: theme.softAccent }}>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Home className="h-4 w-4" style={{ color: theme.accent }} />
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color: theme.accent }}>ASH Integration</span>
            </div>
            <div className="mb-1 text-lg font-bold" style={{ color: theme.foreground }}>Housing Stability</div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              Tracking your rent supplements and lease milestones.
            </p>
          </CardContent>
        </Card>

        <SectionTitle title="Stability Checklist" />
        <div className="space-y-2">
          {[
            { label: "Rent payment confirmed", done: true },
            { label: "Utility bill review", done: false },
            { label: "Monthly lease check-in", done: false },
          ].map((task) => (
            <div key={task.label} className="flex items-center gap-3 rounded-[2rem] p-3 shadow-sm border border-white/5" style={{ backgroundColor: theme.secondary }}>
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-white/10'}`}>
                {task.done && <CheckCircle2 className="h-4 w-4 text-white" />}
              </div>
              <span className="text-sm font-medium" style={{ color: theme.foreground }}>{task.label}</span>
            </div>
          ))}
        </div>

        <SectionTitle title="Life Skills Library" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Meal Planning", icon: ClipboardList },
            { title: "Budgeting 101", icon: Star },
          ].map((item) => (
            <Card key={item.title} className="border-0 shadow-sm rounded-3xl" style={{ backgroundColor: theme.secondary }}>
              <CardContent className="p-4">
                <div className="mb-3 inline-flex rounded-2xl p-3" style={{ backgroundColor: theme.soft }}>
                  <item.icon className="h-5 w-5" style={{ color: theme.primary }} />
                </div>
                <div className="font-bold text-sm" style={{ color: theme.foreground }}>{item.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <SectionTitle title="Case Manager Tasks" />
        <Card className="border-0 shadow-sm rounded-3xl" style={{ backgroundColor: theme.secondary }}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 rounded-2xl overflow-hidden">
                <AvatarFallback className="rounded-2xl" style={{ backgroundColor: theme.soft, color: theme.primary }}>JL</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: theme.foreground }}>Jordan Lewis assigned:</div>
                <p className="mt-1 text-xs italic leading-relaxed" style={{ color: theme.muted }}>"Please upload a photo of your utility receipt for the rent supplement review."</p>
                <Button className="mt-3 h-11 w-full rounded-2xl bg-white/5 border-white/10 text-white/80 font-bold" variant="outline">Upload Receipt</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
