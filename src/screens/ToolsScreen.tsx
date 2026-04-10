import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wind, 
  Brain, 
  ClipboardList, 
  BookOpen, 
  History, 
  ChevronRight 
} from "lucide-react";
import { theme } from "../theme";

// These would ideally be in their own files too, but for now I'll keep them here or move them later
// if the wireframe specifically asks for them. The wireframe only lists ToolsScreen.js.

import { BreathworkTool } from "../components/tools/BreathworkTool";
import { GroundingTool } from "../components/tools/GroundingTool";
import { CBTTool } from "../components/tools/CBTTool";
import { JournalTool } from "../components/tools/JournalTool";

export function ToolsScreen() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  if (activeTool === "breathwork") return <BreathworkTool onBack={() => setActiveTool(null)} />;
  if (activeTool === "grounding") return <GroundingTool onBack={() => setActiveTool(null)} />;
  if (activeTool === "cbt") return <CBTTool onBack={() => setActiveTool(null)} />;
  if (activeTool === "journal") return <JournalTool onBack={() => setActiveTool(null)} />;
  
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4 pb-24">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide" style={{ color: theme.foreground }}>Wellness Tools</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card onClick={() => setActiveTool("breathwork")} className="cursor-pointer border-0 shadow-sm rounded-3xl transition-all hover:ring-1 hover:ring-primary/30" style={{ backgroundColor: theme.secondary }}>
            <CardContent className="p-4">
              <div className="mb-3 inline-flex rounded-2xl p-3" style={{ backgroundColor: theme.soft }}>
                <Wind className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div className="font-bold text-sm" style={{ color: theme.foreground }}>Breathwork</div>
              <div className="text-[10px] font-medium" style={{ color: theme.muted }}>Box & 4-7-8 Reset</div>
            </CardContent>
          </Card>
          <Card onClick={() => setActiveTool("grounding")} className="cursor-pointer border-0 shadow-sm rounded-3xl transition-all hover:ring-1 hover:ring-primary/30" style={{ backgroundColor: theme.secondary }}>
            <CardContent className="p-4">
              <div className="mb-3 inline-flex rounded-2xl p-3" style={{ backgroundColor: theme.soft }}>
                <Brain className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div className="font-bold text-sm" style={{ color: theme.foreground }}>Grounding</div>
              <div className="text-[10px] font-medium" style={{ color: theme.muted }}>5-4-3-2-1 Sensory</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide" style={{ color: theme.foreground }}>CBT & Journaling</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card onClick={() => setActiveTool("cbt")} className="cursor-pointer border-0 shadow-sm rounded-3xl transition-all hover:ring-1 hover:ring-primary/30" style={{ backgroundColor: theme.secondary }}>
            <CardContent className="p-4">
              <div className="mb-3 inline-flex rounded-2xl p-3" style={{ backgroundColor: theme.softAccent }}>
                <ClipboardList className="h-5 w-5" style={{ color: theme.accent }} />
              </div>
              <div className="font-bold text-sm" style={{ color: theme.foreground }}>CBT Records</div>
              <div className="text-[10px] font-medium" style={{ color: theme.muted }}>Reframe Thoughts</div>
            </CardContent>
          </Card>
          <Card onClick={() => setActiveTool("journal")} className="cursor-pointer border-0 shadow-sm rounded-3xl transition-all hover:ring-1 hover:ring-primary/30" style={{ backgroundColor: theme.secondary }}>
            <CardContent className="p-4">
              <div className="mb-3 inline-flex rounded-2xl p-3" style={{ backgroundColor: theme.soft }}>
                <BookOpen className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div className="font-bold text-sm" style={{ color: theme.foreground }}>Journal</div>
              <div className="text-[10px] font-medium" style={{ color: theme.muted }}>Private Reflections</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide" style={{ color: theme.foreground }}>Recent Reflections</h3>
        </div>
        <Card className="border-0 shadow-sm rounded-3xl" style={{ backgroundColor: theme.secondary }}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                <History className="h-5 w-5" style={{ color: theme.muted }} />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: theme.foreground }}>View History</div>
                <div className="text-[10px] font-medium" style={{ color: theme.muted }}>All tools & exercises</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4" style={{ color: theme.muted }} />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
