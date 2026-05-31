import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  ShieldCheck, 
  ShieldAlert,
  Sparkles,
  Users,
  Grid,
  Maximize2,
  Lock,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { theme } from "../theme";
import { Button } from "@/components/ui/button";

interface PeerVideoCallProps {
  roomName: string;
  anonymousName: string;
  onClose: () => void;
  onSendMessage?: (text: string) => void;
}

interface PeerState {
  id: string;
  name: string;
  avatarColor: string;
  isStaff: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  stage: string;
}

export function PeerVideoCall({ roomName, anonymousName, onClose, onSendMessage }: PeerVideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isPrivacyMaskActive, setIsPrivacyMaskActive] = useState(false);
  
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "securing" | "connected">("connecting");
  const [micVolume, setMicVolume] = useState(0);
  
  const [isMiniChatOpen, setIsMiniChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: "Sarah (MESA Moderator)", text: "Welcome to tonight's peer check-in. This is a trauma-informed, safe space.", time: "14:05" },
    { sender: "System", text: "End-to-end PHIPA video bridge secured.", time: "14:05" }
  ]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated peer participants based on MESA program focus areas
  const [peers, setPeers] = useState<PeerState[]>([
    { 
      id: "peer-1", 
      name: "Sarah M.", 
      avatarColor: "#3D8B7A", 
      isStaff: true, 
      isMuted: false, 
      isVideoOff: false, 
      isSpeaking: false,
      stage: "MESA Outreach Worker" 
    },
    { 
      id: "peer-2", 
      name: "Anonymous Peer A", 
      avatarColor: "#7B9E87", 
      isStaff: false, 
      isMuted: true, 
      isVideoOff: true, 
      isSpeaking: false,
      stage: "CWMS (Withdrawal Mgmt)" 
    },
    { 
      id: "peer-3", 
      name: "Anonymous Peer B", 
      avatarColor: "#C47B5A", 
      isStaff: false, 
      isMuted: false, 
      isVideoOff: false, 
      isSpeaking: false,
      stage: "ASH (Supportive Housing)" 
    }
  ]);

  // Request user camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        activeStream = stream;
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Could not access camera/microphone directly, falling back to simulated visuals.", err);
      }
    }

    setupCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update video element source if Cam toggled or stream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      if (isCamOff) {
        localVideoRef.current.srcObject = null;
      } else {
        localVideoRef.current.srcObject = localStream;
      }
    }
  }, [isCamOff, localStream]);

  // Connection sequence & duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    const conTimer1 = setTimeout(() => {
      setConnectionStatus("securing");
    }, 1200);

    const conTimer2 = setTimeout(() => {
      setConnectionStatus("connected");
    }, 2800);

    return () => {
      clearInterval(timer);
      clearTimeout(conTimer1);
      clearTimeout(conTimer2);
    };
  }, []);

  // Simulate speaking activities of Peers to make video room dynamic
  useEffect(() => {
    if (connectionStatus !== "connected") return;

    const interval = setInterval(() => {
      setPeers(prev => prev.map(p => {
        // Staff speaks often, Anonymous Peer B speaks sometimes, Peer A is muted
        if (p.isMuted) return { ...p, isSpeaking: false };
        
        const speakingChance = p.isStaff ? 0.35 : 0.15;
        const isSpeakingNow = Math.random() < speakingChance;
        return { ...p, isSpeaking: isSpeakingNow };
      }));
    }, 4500);

    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Simulate mic volume activity when user is not muted
  useEffect(() => {
    if (isMicMuted) {
      setMicVolume(0);
      return;
    }

    const interval = setInterval(() => {
      // Simulate speaking or background room noise
      setMicVolume(Math.floor(Math.random() * 40) + 10);
    }, 300);

    return () => clearInterval(interval);
  }, [isMicMuted]);

  // Format call duration to MM:SS
  const formatDuration = (sec: number) => {
    const mm = Math.floor(sec / 60).toString().padStart(2, "0");
    const ss = (sec % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMicMuted;
      });
    }
    setIsMicMuted(!isMicMuted);
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isCamOff;
      });
    }
    setIsCamOff(!isCamOff);
  };

  const handleSendMiniMessage = () => {
    if (!chatInput.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add to local chat list
    const updatedMsgs = [...chatMessages, { sender: `${anonymousName} (You)`, text: chatInput, time: timeStr }];
    setChatMessages(updatedMsgs);
    
    // Distribute to Firestore chat database if callback is configured
    if (onSendMessage) {
      onSendMessage(`[Support Video Call] ${chatInput}`);
    }
    
    setChatInput("");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-50 flex flex-col bg-slate-950 text-white font-sans overflow-hidden"
    >
      {/* Top Security & Connection Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            {connectionStatus === "connecting" && "Initializing encrypted gateway..."}
            {connectionStatus === "securing" && "Securing and verifying credentials..."}
            {connectionStatus === "connected" && "PHIPA Link Secure — TLS 1.3"}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
          <Lock className="h-3 w-3" /> Anonymous Peer-Support Call
        </div>
      </div>

      {/* Call Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900/30">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-white">{roomName}</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">
            You are signed in as <span className="font-bold text-primary">{anonymousName}</span> (Identity Protected)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-medium tracking-widest bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200">
            {formatDuration(callDuration)}
          </span>
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      </div>

      {/* Main Video/Grid Space */}
      <div className="flex-1 p-3 grid grid-cols-2 grid-rows-2 gap-3 min-h-[300px] overflow-y-auto">
        
        {/* Self Video Card with Local Media Stream */}
        <div className="relative rounded-3xl bg-slate-900 border-2 border-primary/50 overflow-hidden flex flex-col items-center justify-center group shadow-2xl">
          <AnimatePresence mode="wait">
            {!isCamOff && localStream ? (
              <motion.div 
                key="cam-active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full"
              >
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover transform scale-x-[-1] transition-all duration-300 ${
                    isPrivacyMaskActive ? "blur-xl saturate-50 brightness-75 scale-105" : ""
                  }`}
                  id="local-media-stream"
                />
              </motion.div>
            ) : (
              <motion.div 
                key="cam-disabled"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center p-4 text-center z-10"
              >
                <div 
                  className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-3 animate-pulse"
                >
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <span className="text-xs font-bold text-slate-300">{anonymousName} (You)</span>
                <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Camera Paused</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy Blur Floating Shield Indicator */}
          {isPrivacyMaskActive && !isCamOff && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-brand-primary bg-[#3D8B7A]/90 text-white text-[9px] font-bold px-2 py-1 rounded-full border border-[#7B9E87]/30 shadow-md">
              <Sparkles className="h-2.5 w-2.5 animate-spin-slow" /> Privacy Shield Active
            </div>
          )}

          {/* Bottom Labels */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <span className="text-[10px] bg-slate-950/80 font-bold px-2.5 py-1 rounded-full border border-slate-800 text-white">
              {anonymousName}
            </span>
            <div className="flex gap-1.5">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center ${isMicMuted ? 'bg-red-500/80' : 'bg-slate-950/80'} border border-slate-800`}>
                {isMicMuted ? <MicOff className="h-3 w-3 text-white" /> : <Mic className="h-3 w-3 text-emerald-400" />}
              </div>
              {!isMicMuted && (
                <div className="h-6 w-12 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center gap-1 px-1.5">
                  <div className="bg-primary h-2 w-1.5 rounded-full" style={{ opacity: micVolume > 15 ? 1 : 0.3 }} />
                  <div className="bg-primary h-3 w-1.5 rounded-full" style={{ opacity: micVolume > 30 ? 1 : 0.3 }} />
                  <div className="bg-primary h-2.5 w-1.5 rounded-full" style={{ opacity: micVolume > 20 ? 1 : 0.3 }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Other connected Peers */}
        {peers.map((peer) => (
          <div 
            key={peer.id} 
            className={`relative rounded-3xl bg-slate-900 border transition-all duration-300 overflow-hidden flex flex-col items-center justify-center ${
              peer.isSpeaking ? 'border-primary ring-2 ring-primary/20 bg-slate-800/20' : 'border-slate-800'
            }`}
          >
            {/* Mock Camera Feed with Pulse waves */}
            <div className="absolute inset-0 w-full h-full bg-slate-900/50 flex flex-col items-center justify-center p-3 text-center">
              <div 
                className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 ${
                  peer.isSpeaking ? 'scale-110 shadow-lg' : ''
                }`}
                style={{ 
                  backgroundColor: `${peer.avatarColor}15`, 
                  border: `2px solid ${peer.avatarColor}`,
                  boxShadow: peer.isSpeaking ? `0 0 20px ${peer.avatarColor}35` : "none"
                }}
              >
                <Users className="h-7 w-7" style={{ color: peer.avatarColor }} />
              </div>
              <span className="text-xs font-bold text-slate-200">{peer.name}</span>
              <span className="text-[10px] text-slate-500 mt-1 font-semibold uppercase tracking-widest">{peer.stage}</span>
            </div>

            {/* Speaking Status Ring */}
            {peer.isSpeaking && (
              <div className="absolute inset-0 border border-primary/40 rounded-3xl pointer-events-none animate-ping" style={{ animationDuration: '3s' }} />
            )}

            {/* Bottom Labels */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
              <div className="flex gap-1">
                {peer.isStaff && (
                  <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 font-bold px-2 py-0.5 rounded-full">
                    MESA Staff
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center bg-slate-950/80 border border-slate-800`}>
                  {peer.isMuted ? <MicOff className="h-3 w-3 text-red-400" /> : <Mic className="h-3 w-3 text-emerald-400" />}
                </div>
                {!peer.isMuted && peer.isSpeaking && (
                  <div className="h-6 w-12 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center gap-1 px-1.5 animate-pulse">
                    <div className="bg-emerald-400 h-2 w-1.5 rounded-full" />
                    <div className="bg-emerald-400 h-3 w-1.5 rounded-full" />
                    <div className="bg-emerald-400 h-2 w-1.5 rounded-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Interactive Mini-Chat Overlay Panel */}
      <AnimatePresence>
        {isMiniChatOpen && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute inset-x-0 bottom-24 top-1/3 bg-slate-900 border-t border-slate-800 z-40 rounded-t-[2.5rem] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Session Quick Group Chat</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 rounded-full text-slate-400 text-xs px-3 hover:bg-slate-800"
                onClick={() => setIsMiniChatOpen(false)}
              >
                Hide
              </Button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="flex flex-col gap-1 items-start max-w-[90%]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">{msg.sender}</span>
                    <span className="text-[9px] text-slate-600">{msg.time}</span>
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-none px-3 py-2 text-xs leading-relaxed text-slate-100">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick message input */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMiniMessage()}
                placeholder="Message securely here..." 
                className="flex-1 h-11 bg-slate-900 border border-slate-800 px-4 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button 
                onClick={handleSendMiniMessage}
                className="h-11 rounded-xl bg-primary text-slate-950 hover:bg-primary/90 font-bold text-xs px-4"
              >
                Send
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safety Warning/Compliance Banner */}
      <div className="mx-4 my-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-2.5">
        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
        <p className="text-[9px] text-amber-200/90 leading-tight">
          <strong>Need distress support immediately?</strong> Double-tap any screen or click the Crisis FAB to reach Mackay Manor 24hr line. No logs are saved.
        </p>
      </div>

      {/* Control Tools Panel */}
      <div className="p-6 pb-9 bg-slate-950 border-t border-slate-900 flex justify-around items-center">
        {/* Toggle Microphone */}
        <button 
          onClick={toggleMic}
          className={`h-14 w-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 border ${
            isMicMuted 
              ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' 
              : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
          }`}
          title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* Toggle Camera */}
        <button 
          onClick={toggleCamera}
          className={`h-14 w-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 border ${
            isCamOff 
              ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' 
              : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
          }`}
          title={isCamOff ? "Turn Video On" : "Turn Video Off"}
        >
          {isCamOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </button>

        {/* privacy background/blur mask shield - highly custom trauma informed feature! */}
        <button 
          onClick={() => setIsPrivacyMaskActive(!isPrivacyMaskActive)}
          disabled={isCamOff}
          className={`h-14 w-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 border ${
            isCamOff ? 'opacity-40 cursor-not-allowed' : ''
          } ${
            isPrivacyMaskActive 
              ? 'bg-[#3D8B7A] border-[#7B9E87] text-white' 
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
          title="Toggle Privacy Blur Shield"
        >
          <Sparkles className="h-5 w-5" />
        </button>

        {/* Toggle Chat Overlaid View */}
        <button 
          onClick={() => setIsMiniChatOpen(!isMiniChatOpen)}
          className={`h-14 w-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 border ${
            isMiniChatOpen 
              ? 'bg-primary/20 border-primary/30 text-primary' 
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
          title="Toggle Quick Chat overlay"
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        {/* Leave/Hangup */}
        <button 
          onClick={onClose}
          className="h-14 w-14 rounded-full bg-red-600 flex flex-col items-center justify-center shadow-lg shadow-red-500/20 hover:bg-red-700 transition-colors"
          title="End Video Room Call"
        >
          <PhoneOff className="h-5 w-5 text-white" />
        </button>
      </div>
    </motion.div>
  );
}
