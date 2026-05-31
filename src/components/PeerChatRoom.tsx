import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  ChevronLeft, 
  ShieldCheck, 
  Info,
  User as UserIcon,
  Video
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { theme } from "../theme";
import { 
  db, 
  auth, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  limit 
} from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { PeerVideoCall } from "./PeerVideoCall";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  isMe: boolean;
}

interface PeerChatRoomProps {
  channelName: string;
  onBack: () => void;
}

export function PeerChatRoom({ channelName, onBack }: PeerChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [anonymousName, setAnonymousName] = useState("");
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = auth.currentUser;

  // Generate or retrieve anonymous name
  useEffect(() => {
    const savedName = sessionStorage.getItem("anonymousName");
    if (savedName) {
      setAnonymousName(savedName);
    } else {
      const randomId = Math.floor(Math.random() * 1000);
      const newName = `Peer ${randomId}`;
      sessionStorage.setItem("anonymousName", newName);
      setAnonymousName(newName);
    }
  }, []);

  // Listen for messages
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "messages"),
      where("channel", "==", channelName),
      orderBy("timestamp", "asc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isMe: doc.data().senderId === user.uid
      })) as Message[];
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "messages");
    });

    return () => unsubscribe();
  }, [channelName, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage;
    setNewMessage(""); // Clear input early for UX

    try {
      await addDoc(collection(db, "messages"), {
        text: messageText,
        senderId: user.uid,
        senderName: anonymousName,
        channel: channelName,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "messages");
    }
  };

  const handleInitializeVideoCall = async () => {
    if (!user) return;
    setIsVideoCallActive(true);
    try {
      await addDoc(collection(db, "messages"), {
        text: `[Anonymous Call] ${anonymousName} started a secure peer-support video session. Join to connect anonymously.`,
        senderId: user.uid,
        senderName: anonymousName,
        channel: channelName,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.warn("Failed to post video invite:", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        <div className="flex items-center gap-2">
          {/* Start Video Support Call Option */}
          <button 
            onClick={handleInitializeVideoCall}
            title="Start secure anonymous video session"
            className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-primary hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <Video className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-primary">{anonymousName}</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 pb-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium" style={{ color: theme.muted }}>
              Recovery Support Space
            </div>
          </div>

          {messages.map((msg, index) => {
            const isFirstInGroup = index === 0 || messages[index - 1].senderId !== msg.senderId;
            const showTimestamp = index === messages.length - 1 || 
                                messages[index + 1].senderId !== msg.senderId ||
                                (msg.timestamp && messages[index + 1].timestamp && 
                                 Math.abs(msg.timestamp.seconds - messages[index + 1].timestamp.seconds) > 300);

            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"} ${isFirstInGroup ? "mt-4" : "mt-1"}`}
              >
                {isFirstInGroup && (
                  <div className="mb-1 flex items-center gap-1 px-1">
                    {!msg.isMe && <UserIcon className="h-3 w-3" style={{ color: theme.primary }} />}
                    <span className="text-[10px] font-bold" style={{ color: theme.muted }}>
                      {msg.isMe ? "You" : msg.senderName}
                    </span>
                  </div>
                )}
                {/* Special Video Invite Styling */}
                {msg.text.includes("[Anonymous Call]") || msg.text.includes("[Support Video Call]") || msg.text.includes("[Video Support Call]") ? (
                  <div className={`max-w-[85%] rounded-[1.5rem] p-4 border border-[#3D8B7A]/40 shadow-sm ${
                    msg.isMe ? "bg-[#3D8B7A]/10 text-white" : "bg-white/5 text-foreground"
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="relative">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-ping" />
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Video className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white tracking-wide">Secure Video Call</div>
                        <div className="text-[9px] text-[#7B9E87] uppercase font-bold tracking-widest font-mono">PHIPA Shield Active</div>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-85 mb-3" style={{ color: theme.foreground }}>
                      {msg.text.replace(/\[Support Video Call\]|\[Video Support Call\]|\[Anonymous Call\]/, "").trim()}
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => setIsVideoCallActive(true)}
                      className="w-full h-8 rounded-xl bg-primary hover:bg-primary/90 text-slate-950 font-bold text-[11px]"
                    >
                      Join Secure Video Call
                    </Button>
                  </div>
                ) : (
                  <div 
                    className={`max-w-[80%] px-4 py-2 text-sm shadow-sm transition-all duration-300 ${
                      msg.isMe 
                        ? `bg-primary text-white ${isFirstInGroup ? "rounded-2xl rounded-tr-none" : "rounded-2xl"}` 
                        : `bg-white/5 text-foreground border border-white/5 ${isFirstInGroup ? "rounded-2xl rounded-tl-none" : "rounded-2xl"}`
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
                {showTimestamp && (
                  <span className="mt-1 px-1 text-[9px] font-medium opacity-40" style={{ color: theme.muted }}>
                    {formatTime(msg.timestamp)}
                  </span>
                )}
              </div>
            );
          })}
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
            className="h-12 w-12 rounded-2xl p-0 transition-all duration-300"
            style={{ backgroundColor: newMessage.trim() ? theme.primary : "rgba(255,255,255,0.05)" }}
          >
            <Send className={`h-5 w-5 ${newMessage.trim() ? "text-white" : "text-white/20"}`} />
          </Button>
        </div>
      </div>

      {/* Inline Video Call Overlay Window */}
      <AnimatePresence>
        {isVideoCallActive && (
          <PeerVideoCall 
            roomName="Peer Support Video Call" 
            anonymousName={anonymousName} 
            onClose={() => setIsVideoCallActive(false)} 
            onSendMessage={async (inputText) => {
              if (!user) return;
              try {
                await addDoc(collection(db, "messages"), {
                  text: inputText,
                  senderId: user.uid,
                  senderName: anonymousName,
                  channel: channelName,
                  timestamp: serverTimestamp()
                });
              } catch (error) {
                console.warn("Failed to forward video chat message to Firestore:", error);
              }
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
