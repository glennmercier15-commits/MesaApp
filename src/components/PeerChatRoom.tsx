import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  ChevronLeft, 
  ShieldCheck, 
  Info,
  User
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { theme } from "../theme";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

interface PeerChatRoomProps {
  channelName: string;
  onBack: () => void;
}

export function PeerChatRoom({ channelName, onBack }: PeerChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "Peer 42", text: "Welcome to the group! This is a safe space.", timestamp: "10:00 AM", isMe: false },
    { id: "2", sender: "Peer 15", text: "Thanks, glad to be here. Just taking it one day at a time.", timestamp: "10:05 AM", isMe: false },
    { id: "3", sender: "Peer 88", text: "Anyone have tips for managing cravings in the evening?", timestamp: "10:12 AM", isMe: false },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      sender: "Me (Anonymous)",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages([...messages, msg]);
    setNewMessage("");
  };

  return (
    <motion.div 
      initial={{ x: "100%" }} 
      animate={{ x: 0 }} 
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 flex flex-col bg-background"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 p-4" style={{ backgroundColor: theme.secondary }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-full p-2 hover:bg-white/5" style={{ color: theme.primary }}>
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-sm font-bold" style={{ color: theme.foreground }}>{channelName}</h2>
            <div className="flex items-center gap-1 text-[10px] font-medium" style={{ color: theme.muted }}>
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              Moderated & Anonymous
            </div>
          </div>
        </div>
        <button className="rounded-full p-2 hover:bg-white/5" style={{ color: theme.muted }}>
          <Info className="h-5 w-5" />
        </button>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium" style={{ color: theme.muted }}>
              Today
            </div>
          </div>

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
            >
              <div className="mb-1 flex items-center gap-1 px-1">
                {!msg.isMe && <User className="h-3 w-3" style={{ color: theme.primary }} />}
                <span className="text-[10px] font-bold" style={{ color: theme.muted }}>
                  {msg.sender}
                </span>
              </div>
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.isMe 
                    ? "bg-primary text-background rounded-tr-none" 
                    : "bg-white/5 text-foreground rounded-tl-none border border-white/5"
                }`}
              >
                {msg.text}
              </div>
              <span className="mt-1 px-1 text-[9px] font-medium" style={{ color: theme.muted }}>
                {msg.timestamp}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-white/5 p-4 pb-8" style={{ backgroundColor: theme.secondary }}>
        <div className="flex items-center gap-2">
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message anonymously..."
            className="h-12 rounded-2xl border-0 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-primary"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="h-12 w-12 rounded-2xl p-0"
            style={{ backgroundColor: newMessage.trim() ? theme.primary : "rgba(255,255,255,0.05)" }}
          >
            <Send className={`h-5 w-5 ${newMessage.trim() ? "text-background" : "text-white/20"}`} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
