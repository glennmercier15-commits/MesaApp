import React, { useState } from "react";
import { motion } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserRound, 
  Heart, 
  MessageSquare, 
  Video, 
  Mic, 
  ChevronRight 
} from "lucide-react";
import { theme } from "../theme";
import { PeerChatRoom } from "../components/PeerChatRoom";
import { AnimatePresence } from "motion/react";

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold tracking-wide" style={{ color: theme.foreground }}>{title}</h3>
      {action ? <button className="text-xs font-medium" style={{ color: theme.primary }}>{action}</button> : null}
    </div>
  );
}

interface CommunityScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export function CommunityScreen({ onNavigate }: CommunityScreenProps) {
  const [activeTab, setActiveTab] = useState('support');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState("Peer Support Channel");

  return (
    <div className="relative h-full atmosphere overflow-hidden">
      <AnimatePresence>
        {isChatOpen && (
          <PeerChatRoom 
            channelName={activeChannel} 
            onBack={() => setIsChatOpen(false)} 
          />
        )}
      </AnimatePresence>

      <ScrollArea className="h-full">
        <div className="space-y-6 p-6 pb-24">
          <div className="flex gap-2 p-1.5 glass rounded-[2rem]">
            {['support', 'groups', 'events'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.2em] rounded-3xl transition-all duration-300 ${activeTab === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white/60'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {activeTab === 'support' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="glass border-0 rounded-[2rem] overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20">
                    <UserRound className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: theme.foreground }}>Peer Support</h3>
                  <p className="text-sm leading-relaxed opacity-60 mb-6" style={{ color: theme.foreground }}>
                    A moderated, anonymous space to share wins and struggles with others in recovery.
                  </p>
                  <Button 
                    onClick={() => {
                      setActiveChannel("Peer Support Channel");
                      setIsChatOpen(true);
                    }}
                    className="w-full h-14 rounded-2xl bg-primary text-white hover:bg-primary/90 border-0 font-bold text-sm"
                  >
                    Enter Peer Channel
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <SectionTitle title="Recent Wins" />
                <div className="space-y-4">
                  {[
                    { user: "Anonymous", text: "Made it through a tough weekend without using. Grateful for the breathwork tool.", time: "2h ago" },
                    { user: "RecoveryFriend", text: "Just completed my 30-day milestone! MacKay Manor team has been amazing.", time: "5h ago" },
                  ].map((post, i) => (
                    <Card key={i} className="glass border-0 rounded-[2rem] overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-primary">{post.user}</span>
                          <span className="text-[10px] font-medium opacity-40">{post.time}</span>
                        </div>
                        <p className="text-sm leading-relaxed opacity-80" style={{ color: theme.foreground }}>{post.text}</p>
                        <div className="mt-6 flex gap-6">
                          <button className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-primary transition-colors">
                            <Heart className="h-4 w-4" /> Support
                          </button>
                          <button className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-primary transition-colors">
                            <MessageSquare className="h-4 w-4" /> Reply
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'groups' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <SectionTitle title="Virtual Group Rooms" />
              <div className="grid gap-4">
                {[
                  { name: "Morning Grounding", time: "Starts in 15m", participants: 8, type: "Video" },
                  { name: "Relapse Prevention", time: "Today at 2:00 PM", participants: 12, type: "Video" },
                  { name: "ASH Stability Group", time: "Tomorrow at 10:00 AM", participants: 5, type: "Audio" },
                ].map((room) => (
                  <Card key={room.name} className="glass border-0 rounded-[2rem] overflow-hidden group hover:bg-white/10 transition-colors">
                    <CardContent className="flex items-center justify-between p-5">
                      <div className="flex items-center gap-4">
                        <div className="rounded-2xl p-4 bg-white/5 group-hover:bg-primary/20 transition-colors">
                          {room.type === 'Video' ? <Video className="h-6 w-6 text-primary" /> : <Mic className="h-6 w-6 text-primary" />}
                        </div>
                        <div>
                          <div className="font-bold text-base" style={{ color: theme.foreground }}>{room.name}</div>
                          <div className="text-[10px] font-medium opacity-40 uppercase tracking-widest mt-1">{room.time} · {room.participants} joined</div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="rounded-2xl bg-primary text-white font-bold px-6 h-11"
                        onClick={() => onNavigate('group-session', { roomName: room.name })}
                      >
                        Join
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <SectionTitle title="Community Calendar" />
              <div className="space-y-4">
                {[
                  { date: "APR 12", title: "Recovery Day Ottawa Valley", location: "Pembroke Waterfront", time: "10:00 AM" },
                  { date: "APR 15", title: "MacKay Manor Open House", location: "Renfrew Site", time: "2:00 PM" },
                  { date: "APR 20", title: "MESA Outreach Workshop", location: "Arnprior Library", time: "6:00 PM" },
                ].map((event) => (
                  <Card key={event.title} className="glass border-0 rounded-[2rem] overflow-hidden group hover:bg-white/10 transition-colors">
                    <CardContent className="flex items-center gap-5 p-5">
                      <div className="flex flex-col items-center justify-center h-16 w-16 rounded-2xl bg-white/5 border border-white/10 group-hover:border-primary/20 transition-colors">
                        <span className="text-[10px] font-bold opacity-40 leading-none uppercase tracking-widest">{event.date.split(' ')[0]}</span>
                        <span className="text-2xl font-serif font-bold text-primary leading-none mt-2">{event.date.split(' ')[1]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base" style={{ color: theme.foreground }}>{event.title}</div>
                        <div className="text-[10px] font-medium opacity-40 uppercase tracking-widest mt-1">{event.location} · {event.time}</div>
                      </div>
                      <ChevronRight className="h-5 w-5 opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: theme.primary }} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
