import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Lock, 
  Plus 
} from "lucide-react";
import { theme } from "../theme";

const messages = [
  {
    id: 1,
    name: "Jordan Lewis",
    role: "Therapist",
    snippet: "You handled yesterday with a lot of honesty. Let's build on that.",
    time: "2m",
    unread: true,
  },
  {
    id: 2,
    name: "MESA Outreach",
    role: "Support Team",
    snippet: "We can help with transport for your appointment tomorrow.",
    time: "1h",
    unread: false,
  },
  {
    id: 3,
    name: "Peer Circle",
    role: "Community",
    snippet: "Tonight's grounding group starts at 7:00 PM.",
    time: "4h",
    unread: false,
  },
];

export function MessagesScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input className="rounded-2xl border-0 bg-white/5 pl-9 shadow-sm text-white" placeholder="Search messages" />
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 pb-24">
        <div className="mb-4 rounded-3xl p-4" style={{ backgroundColor: theme.soft }}>
          <div className="mb-1 flex items-center gap-2 text-sm font-medium" style={{ color: theme.primary }}>
            <Lock className="h-4 w-4" /> Encrypted async chat
          </div>
          <p className="text-sm" style={{ color: theme.foreground }}>
            Messages are protected and designed for low-pressure support between sessions.
          </p>
        </div>
        <div className="space-y-3">
          {messages.map((message) => (
            <Card key={message.id} className="border-0 shadow-sm rounded-3xl" style={{ backgroundColor: theme.secondary }}>
              <CardContent className="flex items-start gap-3 p-4">
                <Avatar className="rounded-2xl overflow-hidden">
                  <AvatarFallback className="rounded-2xl" style={{ backgroundColor: theme.soft, color: theme.primary }}>
                    {message.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-sm" style={{ color: theme.foreground }}>{message.name}</div>
                      <div className="text-[10px] font-medium" style={{ color: theme.muted }}>{message.role}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {message.unread ? <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.primary }} /> : null}
                      <span className="text-[10px] font-medium" style={{ color: theme.muted }}>{message.time}</span>
                    </div>
                  </div>
                  <p className="truncate text-xs" style={{ color: theme.muted }}>{message.snippet}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      <div className="absolute bottom-24 right-6">
        <Button className="h-14 w-14 rounded-full shadow-lg text-background" style={{ backgroundColor: theme.primary }}>
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
