import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wind, 
  Brain, 
  BookOpen, 
  History, 
  ChevronRight,
  ShieldAlert,
  Scale
} from "lucide-react";
import { useAppTheme } from "../theme/AppTheme";

import { BreathworkTool } from "../components/tools/BreathworkTool";
import { GroundingTool } from "../components/tools/GroundingTool";
import { DBTTool } from "../components/tools/DBTTool";
import { ThoughtRecordTool } from "../components/tools/ThoughtRecordTool";
import { JournalTool } from "../components/tools/JournalTool";
import { ToolHistoryScreen } from "./ToolHistoryScreen";

export function ToolsScreen() {
  const { colors } = useAppTheme();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [toolParams, setToolParams] = useState<any>(null);

  const openTool = (tool: string, params?: any) => {
    setActiveTool(tool);
    setToolParams(params);
  };

  if (activeTool === "breathwork") return <BreathworkTool onBack={() => setActiveTool(null)} />;
  if (activeTool === "grounding") return <GroundingTool onBack={() => setActiveTool(null)} />;
  if (activeTool === "dbt") return <DBTTool onBack={() => setActiveTool(null)} />;
  if (activeTool === "thought-record") return <ThoughtRecordTool onBack={() => setActiveTool(null)} />;
  if (activeTool === "journal") return <JournalTool onBack={() => setActiveTool(null)} />;
  if (activeTool === "history") return <ToolHistoryScreen onBack={() => setActiveTool(null)} onResumeCBT={(id, data) => openTool('thought-record', { id, data })} />;
  
  return (
    <ScrollArea className="h-full bg-background">
      <div className="space-y-6 p-6 pb-24">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold uppercase tracking-widest opacity-40 px-1" style={{ color: colors.text }}>Wellness Tools</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card onClick={() => setActiveTool("breathwork")} className="cursor-pointer border-0 shadow-sm rounded-[24px] transition-all hover:ring-1 hover:ring-primary/30" style={{ backgroundColor: colors.surfaceAlt }}>
            <CardContent className="p-5">
              <div className="mb-4 inline-flex rounded-[18px] p-3 bg-primary/10">
                <Wind className="h-6 w-6 text-primary" />
              </div>
              <div className="font-bold text-[15px]" style={{ color: colors.text }}>Breathwork</div>
              <div className="text-[11px] font-medium opacity-60" style={{ color: colors.text }}>Box & 4-7-8 Reset</div>
            </CardContent>
          </Card>
          <Card onClick={() => setActiveTool("grounding")} className="cursor-pointer border-0 shadow-sm rounded-[24px] transition-all hover:ring-1 hover:ring-primary/30" style={{ backgroundColor: colors.surfaceAlt }}>
            <CardContent className="p-5">
              <div className="mb-4 inline-flex rounded-[18px] p-3 bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div className="font-bold text-[15px]" style={{ color: colors.text }}>Grounding</div>
              <div className="text-[11px] font-medium opacity-60" style={{ color: colors.text }}>5-4-3-2-1 Sensory</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold uppercase tracking-widest opacity-40 px-1" style={{ color: colors.text }}>Therapeutic Tools</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card onClick={() => setActiveTool("dbt")} className="cursor-pointer border-0 shadow-sm rounded-[24px] transition-all hover:ring-1 hover:ring-primary/30" style={{ backgroundColor: colors.surfaceAlt }}>
            <CardContent className="p-5">
              <div className="mb-4 inline-flex rounded-[18px] p-3 bg-orange-500/10">
                <ShieldAlert className="h-6 w-6 text-orange-500" />
              </div>
              <div className="font-bold text-[15px]" style={{ color: colors.text }}>DBT Skills</div>
              <div className="text-[11px] font-medium opacity-60" style={{ color: colors.text }}>Distress Tolerance</div>
            </CardContent>
          </Card>
          <Card onClick={() => setActiveTool("thought-record")} className="cursor-pointer border-0 shadow-sm rounded-[24px] transition-all hover:ring-1 hover:ring-primary/30" style={{ backgroundColor: colors.surfaceAlt }}>
            <CardContent className="p-5">
              <div className="mb-4 inline-flex rounded-[18px] p-3 bg-emerald-500/10">
                <Scale className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="font-bold text-[15px]" style={{ color: colors.text }}>Thought Record</div>
              <div className="text-[11px] font-medium opacity-60" style={{ color: colors.text }}>Reframe Thoughts</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold uppercase tracking-widest opacity-40 px-1" style={{ color: colors.text }}>Journaling</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Card onClick={() => setActiveTool("journal")} className="cursor-pointer border-0 shadow-sm rounded-[24px] transition-all hover:ring-1 hover:ring-primary/30" style={{ backgroundColor: colors.surfaceAlt }}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="inline-flex rounded-[18px] p-3 bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-bold text-[15px]" style={{ color: colors.text }}>Private Journal</div>
                <div className="text-[11px] font-medium opacity-60" style={{ color: colors.text }}>Reflect on your day and progress</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold uppercase tracking-widest opacity-40 px-1" style={{ color: colors.text }}>Recent Reflections</h3>
        </div>
        <Card onClick={() => setActiveTool("history")} className="cursor-pointer border-0 shadow-sm rounded-[24px] transition-all hover:ring-1 hover:ring-primary/30" style={{ backgroundColor: colors.surfaceAlt }}>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-background/50 flex items-center justify-center">
                <History className="h-6 w-6 opacity-40" style={{ color: colors.text }} />
              </div>
              <div>
                <div className="text-[15px] font-bold" style={{ color: colors.text }}>View History</div>
                <div className="text-[11px] font-medium opacity-40" style={{ color: colors.text }}>All tools & exercises</div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 opacity-30" style={{ color: colors.text }} />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
