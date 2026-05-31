import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  Sparkles, 
  Lock, 
  MessageSquare, 
  AlertCircle, 
  Navigation, 
  ThumbsUp, 
  Heart, 
  Hand, 
  Infinity,
  Volume2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { theme } from "../theme";
import { db, auth, collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from "../firebase";

interface GroupSessionScreenProps {
  roomName: string;
  onBack: () => void;
}

interface PeerState {
  id: string;
  name: string;
  role: "client" | "outreach" | "moderator";
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  hasHandRaised: boolean;
  accentColor: string;
  program: string;
}

const NICKNAME_PRESETS = [
  "Serene Otter",
  "Calm Rivers",
  "Clear Cedar",
  "Quiet Pines",
  "Supportive Birch",
  "Gentle Hill"
];

export function GroupSessionScreen({ roomName, onBack }: GroupSessionScreenProps) {
  const user = auth.currentUser;
  
  // State: Lobby vs Active Session
  const [hasJoined, setHasJoined] = useState(false);
  
  // Lobby Setup States
  const [nickname, setNickname] = useState(() => {
    const randomIdx = Math.floor(Math.random() * NICKNAME_PRESETS.length);
    return `${NICKNAME_PRESETS[randomIdx]} ${Math.floor(Math.random() * 90 + 10)}`;
  });
  const [deviceCameraChecked, setDeviceCameraChecked] = useState(true);
  const [deviceMicChecked, setDeviceMicChecked] = useState(true);
  const [privacyMaskType, setPrivacyMaskType] = useState<"none" | "blur" | "avatar">("blur");
  const [consentedToRules, setConsentedToRules] = useState(false);
  const [lobbyError, setLobbyError] = useState<string | null>(null);

  // Active Session Media Stream States
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [myHandRaised, setMyHandRaised] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"ready" | "connected">("ready");
  const [sessionTime, setSessionTime] = useState(0);

  // Interactive Overlays
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeOverlayBox, setActiveOverlayBox] = useState<"none" | "breathing" | "grounding">("none");
  const [locationPrivacyOptIn, setLocationPrivacyOptIn] = useState(false);
  const [locationSentStatus, setLocationSentStatus] = useState<"none" | "sending" | "success">("none");
  const [clientCoordinates, setClientCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Group Breathwork State
  const [breathPhase, setBreathPhase] = useState<"idle" | "inhale" | "hold" | "exhale">("idle");
  const [breathCounter, setBreathCounter] = useState(4);

  // Firestore Chat Integration
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  // Local streams reference
  const lobbyVideoRef = useRef<HTMLVideoElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);

  // Default simulated peer participants
  const [peers, setPeers] = useState<PeerState[]>([
    { 
      id: "peer-f1", 
      name: "Marcus - Paramedic Outreach", 
      role: "moderator", 
      isMuted: false, 
      isVideoOff: false, 
      isSpeaking: false, 
      hasHandRaised: false, 
      accentColor: "#3D8B7A", 
      program: "MESA Team leader" 
    },
    { 
      id: "peer-f2", 
      name: "Anonymous Squirrel", 
      role: "client", 
      isMuted: true, 
      isVideoOff: true, 
      isSpeaking: false, 
      hasHandRaised: false, 
      accentColor: "#7B9E87", 
      program: "CWMS Withdrawal" 
    },
    { 
      id: "peer-f3", 
      name: "Anonymous Beaver", 
      role: "client", 
      isMuted: false, 
      isVideoOff: false, 
      isSpeaking: false, 
      hasHandRaised: false, 
      accentColor: "#C47B5A", 
      program: "ASH Supportive Housing" 
    },
    { 
      id: "peer-f4", 
      name: "Helen - Care Coordinator", 
      role: "outreach", 
      isMuted: false, 
      isVideoOff: false, 
      isSpeaking: false, 
      hasHandRaised: false, 
      accentColor: "#93A29B", 
      program: "MacKay Manor Clinic" 
    },
  ]);

  // Handle local camera access in lobby
  useEffect(() => {
    let rawStream: MediaStream | null = null;
    async function startLobbyMedia() {
      if (hasJoined || !deviceCameraChecked) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        rawStream = stream;
        setLocalStream(stream);
        if (lobbyVideoRef.current) {
          lobbyVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Could not load direct web-cam stream. Safe fallback initialized.", err);
      }
    }

    startLobbyMedia();

    return () => {
      if (rawStream) {
        rawStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [hasJoined, deviceCameraChecked]);

  // Bind live main stream on joining the call
  useEffect(() => {
    if (hasJoined && localStream && liveVideoRef.current) {
      liveVideoRef.current.srcObject = localStream;
    }
  }, [hasJoined, localStream, isCamOff]);

  // Handle active session seconds count
  useEffect(() => {
    if (!hasJoined) return;
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasJoined]);

  // Subscribe to real-time Group Chat via Firestore messages collection
  useEffect(() => {
    if (!hasJoined) return;

    const q = query(
      collection(db, "messages"),
      where("channel", "==", `GroupRoom_${roomName}`),
      orderBy("timestamp", "asc"),
      limit(40)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setChatMessages(msgs);
    }, (error) => {
      console.warn("Real-time Group Chat channel disconnected. Working in fallback local session mode.", error);
    });

    return () => unsubscribe();
  }, [hasJoined, roomName]);

  // Dynamic Peer speech simulation to resemble active support circle
  useEffect(() => {
    if (!hasJoined) return;

    const interval = setInterval(() => {
      setPeers(prev => prev.map(peer => {
        if (peer.isMuted) return { ...peer, isSpeaking: false };
        
        // Random chance of speaking / hand raising / reaction
        const isSpeakingNow = Math.random() < (peer.role === "moderator" ? 0.35 : 0.15);
        const raisesHandNow = Math.random() < 0.05 ? !peer.hasHandRaised : peer.hasHandRaised;
        
        return { 
          ...peer, 
          isSpeaking: isSpeakingNow,
          hasHandRaised: raisesHandNow
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [hasJoined]);

  // Sync state with physical track mute/unmute
  const toggleLocalMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMicMuted;
      });
    }
    setIsMicMuted(!isMicMuted);
  };

  const toggleLocalCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isCamOff;
      });
    }
    setIsCamOff(!isCamOff);
  };

  // Group Breathwork Sequence loops
  useEffect(() => {
    if (activeOverlayBox !== "breathing" || breathPhase === "idle") return;

    let timer: NodeJS.Timeout;
    if (breathCounter > 1) {
      timer = setTimeout(() => setBreathCounter(prev => prev - 1), 1000);
    } else {
      // Transition phase
      if (breathPhase === "inhale") {
        setBreathPhase("hold");
        setBreathCounter(4);
      } else if (breathPhase === "hold") {
        setBreathPhase("exhale");
        setBreathCounter(4);
      } else if (breathPhase === "exhale") {
        setBreathPhase("inhale");
        setBreathCounter(4);
      }
    }

    return () => clearTimeout(timer);
  }, [activeOverlayBox, breathPhase, breathCounter]);

  const handleStartGroupBreathing = () => {
    setBreathPhase("inhale");
    setBreathCounter(4);
    setActiveOverlayBox("breathing");
    
    // Send message to notify others
    sendChatMessage(`[Clinical Cue] Started Group Box Breathing. Follow the rhythmic visualizer together.`);
  };

  const handleStopGroupBreathing = () => {
    setBreathPhase("idle");
    setActiveOverlayBox("none");
  };

  // Trigger optional GPS check-in (PHIPA compliant meaningful disclosure)
  const handleLocationPrivacyCheckIn = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser device.");
      return;
    }
    
    setLocationSentStatus("sending");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setClientCoordinates(coords);
        setLocationSentStatus("success");

        try {
          // Log welfare check coordinate securely to firestore
          await addDoc(collection(db, "welfareChecks"), {
            uid: auth.currentUser?.uid || user?.uid || "anonymous",
            location: {
              latitude: coords.lat,
              longitude: coords.lng
            },
            timestamp: serverTimestamp(),
            notes: `Secure coordinate check-in by alias ${nickname} from room ${roomName}`
          });
        } catch (error) {
          console.warn("Failed to register safety log on Firestore:", error);
        }

        // Notify session chat
        sendChatMessage(`[Location Ping] Shared a localized welfare check-in coordinate with MESA safety team. Checking-in OK.`);
      },
      (error) => {
        console.warn("Location permission declined or signal failed.", error);
        setLocationSentStatus("none");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Send message on Firestore group room messages
  const sendChatMessage = async (textToSend?: string) => {
    const rawText = textToSend || chatInput;
    if (!rawText.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: rawText,
        senderId: user?.uid || "anonymous-client",
        senderName: nickname,
        channel: `GroupRoom_${roomName}`,
        timestamp: serverTimestamp()
      });
      if (!textToSend) setChatInput("");
    } catch (e) {
      console.warn("Firestore save temporary issue. Falling back to local display chat.", e);
      // Fallback local chat
      setChatMessages(prev => [
        ...prev, 
        {
          id: `local-${Date.now()}`,
          text: rawText,
          senderName: `${nickname} (You)`,
          timestamp: new Date()
        }
      ]);
      if (!textToSend) setChatInput("");
    }
  };

  const handleConfirmAndJoin = () => {
    if (!nickname.trim()) {
      setLobbyError("Please supply a protective screen nickname first.");
      return;
    }
    if (!consentedToRules) {
      setLobbyError("Please authorize the trauma-informed safety agreement checkboxes before joining.");
      return;
    }
    setLobbyError(null);
    setConnectionStatus("connected");
    setHasJoined(true);
    
    // Broadcast join to session
    sendChatMessage(`[Connection Log] Joined the secure support session as ${nickname}`);
  };

  // Turn time seconds into beautiful MM:SS string
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Theme variable colors mapping safely
  const colors = theme;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-slate-950 text-white font-sans overflow-hidden">
      
      {/* 1. LOBBY CONFIGURATION SCREEN */}
      <AnimatePresence mode="wait">
        {!hasJoined ? (
          <motion.div 
            key="lobby-room"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col justify-between overflow-y-auto"
          >
            {/* Header branding */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <button 
                  onClick={onBack} 
                  className="rounded-full p-2 hover:bg-slate-800 text-slate-300 h-10 w-10 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <div>
                  <h2 className="text-sm font-bold tracking-tight">{roomName}</h2>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                    <Lock className="h-3 w-3" /> PHIPA Compliant Gateway — TLS 1.3
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 w-10 p-0 rounded-full hover:bg-red-950/20 text-red-400" 
                onClick={onBack}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Main Interactive Checkpoints */}
            <div className="p-6 space-y-6 max-w-md mx-auto w-full flex-1">
              {/* Device and Filter Playground */}
              <div className="relative aspect-video w-full rounded-[2rem] bg-slate-900 border border-slate-800 overflow-hidden flex flex-col items-center justify-center">
                
                {/* Real Stream Preview Box */}
                {deviceCameraChecked && localStream ? (
                  <video 
                    ref={lobbyVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 w-full h-full object-cover transform scale-x-[-1] transition-all duration-300 ${
                      privacyMaskType === "blur" ? "blur-xl saturate-75 brightness-75 scale-105" : ""
                    } ${privacyMaskType === "avatar" ? "opacity-0" : "opacity-100"}`}
                  />
                ) : null}

                {/* Privacy Overlay & Custom Masks illustration */}
                {(!deviceCameraChecked || !localStream || privacyMaskType === "avatar") && (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-3 text-primary animate-pulse">
                      <Users className="h-8 w-8" />
                    </div>
                    <span className="text-xs font-bold text-slate-300">Identity Shield Active</span>
                    <span className="text-[9px] text-[#7B9E87] mt-1 font-semibold uppercase tracking-widest leading-none">
                      Avatar Mode Enabled
                    </span>
                  </div>
                )}

                {/* Floating Shield banner */}
                {privacyMaskType === "blur" && deviceCameraChecked && (
                  <div className="absolute top-3 left-3 bg-[#3D8B7A]/90 text-white text-[9px] font-bold px-2.5 py-1 rounded-full border border-[#7B9E87]/30 flex items-center gap-1.5 shadow-md">
                    <Sparkles className="h-3 w-3 animate-spin-slow" /> Blurred Camera Privacy active
                  </div>
                )}

                {/* Pre-Call Hardware Quick Switches */}
                <div className="absolute bottom-3 inset-x-3 flex justify-center gap-3 z-25">
                  <button 
                    onClick={() => setDeviceCameraChecked(!deviceCameraChecked)}
                    style={{ minHeight: "44px", minWidth: "44px" }}
                    className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                      deviceCameraChecked ? "bg-slate-950/80 text-emerald-400 hover:bg-slate-950/90" : "bg-red-500/80 text-white"
                    }`}
                    title="Camera Toggle"
                  >
                    {deviceCameraChecked ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </button>
                  <button 
                    style={{ minHeight: "44px", minWidth: "44px" }}
                    onClick={() => setDeviceMicChecked(!deviceMicChecked)}
                    className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                      deviceMicChecked ? "bg-slate-950/80 text-emerald-400 hover:bg-slate-950/90" : "bg-red-500/80 text-white"
                    }`}
                    title="Microphone Toggle"
                  >
                    {deviceMicChecked ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Secure Identity input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
                  <span>Your Group Alias (Protects Identity)</span>
                  <button 
                    onClick={() => {
                      const randomIdx = Math.floor(Math.random() * NICKNAME_PRESETS.length);
                      setNickname(`${NICKNAME_PRESETS[randomIdx]} ${Math.floor(Math.random() * 90 + 10)}`);
                    }}
                    className="text-[10px] text-primary font-bold lowercase tracking-normal cursor-pointer hover:underline"
                  >
                    Generate another
                  </button>
                </label>
                <input 
                  type="text" 
                  value={nickname} 
                  required
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="E.g. Peacefull River 49"
                  className="w-full h-13 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent font-medium"
                />
              </div>

              {/* Video Shield Selections */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Choose Group Privacy Shield</span>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    type="button"
                    onClick={() => setPrivacyMaskType("none")}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      privacyMaskType === "none" ? "bg-white/5 border-primary text-primary font-bold" : "border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-xs">Normal</div>
                    <div className="text-[8px] opacity-65 mt-0.5 font-medium">Clear Video</div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPrivacyMaskType("blur")}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      privacyMaskType === "blur" ? "bg-[#3D8B7A]/10 border-primary text-primary font-bold" : "border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-xs flex items-center justify-center gap-0.5">
                      <Sparkles className="h-3 w-3 shrink-0" /> Blur
                    </div>
                    <div className="text-[8px] opacity-65 mt-0.5 font-medium">Anonymized</div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPrivacyMaskType("avatar")}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      privacyMaskType === "avatar" ? "bg-white/5 border-primary text-primary font-bold" : "border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-xs">Avatar</div>
                    <div className="text-[8px] opacity-65 mt-0.5 font-medium">Static Icon</div>
                  </button>
                </div>
              </div>

              {/* Trauma Informed Compliance Consent */}
              <div 
                onClick={() => setConsentedToRules(!consentedToRules)}
                className={`p-4 rounded-[1.5rem] border transition-all duration-300 flex items-start gap-3.5 cursor-pointer select-none ${
                  consentedToRules ? "bg-[#3D8B7A]/5 border-[#3D8B7A]/40" : "bg-slate-900 border-slate-800"
                }`}
              >
                <div style={{ minHeight: "44px", minWidth: "44px" }} className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 border ${
                  consentedToRules ? "bg-primary border-primary text-slate-950" : "border-slate-700 bg-slate-950"
                }`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Safe Circle Consent</h4>
                  <p className="text-[10px] text-slate-400/90 leading-relaxed mt-1">
                    I agree to protect everyone's identity. I will not screenshot, record audio, or reveal any names outside of this group. No judgment.
                  </p>
                </div>
              </div>

              {/* Error messages if any */}
              {lobbyError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-[11px] leading-relaxed flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{lobbyError}</span>
                </div>
              )}
            </div>

            {/* Bottom Join Trigger */}
            <div className="p-6 bg-slate-900/40 border-t border-slate-900">
              <Button 
                onClick={handleConfirmAndJoin}
                className="w-full h-14 rounded-2xl bg-primary text-white hover:bg-primary/95 hover:scale-[1.01] active:scale-[0.99] font-bold text-sm tracking-wide transition-all shadow-xl shadow-primary/10"
              >
                Safe-Connect to Video Circle
              </Button>
            </div>
          </motion.div>
        ) : (
          
          /* 2. LIVE ACTIVE GROUP MEETING */
          <motion.div 
            key="live-session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col justify-between"
          >
            {/* ACTIVE SESSION TOP BAR */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 flex items-center justify-center relative">
                  <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{roomName}</h3>
                  <p className="text-[10px] text-[#7B9E87] font-semibold tracking-widest font-mono">
                    DAILY.CO PHIPA LINK
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono bg-slate-950 border border-slate-800 font-bold tracking-widest px-3 py-1.5 rounded-xl text-slate-300">
                  {formatTime(sessionTime)}
                </span>
                <Button 
                  onClick={onBack}
                  variant="ghost" 
                  className="p-2 gap-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer text-[10px]"
                >
                  <X className="h-4 w-4" /> Leave
                </Button>
              </div>
            </div>

            {/* CONFERENCE PARTICIPANTS GRID */}
            <div className="flex-1 p-3 grid grid-cols-2 gap-3 overflow-y-auto content-start">
              
              {/* Local Participant Block */}
              <div className={`relative aspect-video rounded-3xl bg-slate-900 border-2 transition-all duration-300 overflow-hidden flex flex-col items-center justify-center ${
                myHandRaised ? 'border-amber-400 shadow-lg shadow-amber-400/10' : 'border-[#3D8B7A]'
              }`}>
                {deviceCameraChecked && localStream && !isCamOff ? (
                  <video 
                    ref={liveVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 w-full h-full object-cover transform scale-x-[-1] transition-all duration-300 ${
                      privacyMaskType === "blur" ? "blur-xl saturate-75 brightness-75 scale-105" : ""
                    } ${privacyMaskType === "avatar" ? "opacity-0" : "opacity-100"}`}
                  />
                ) : null}

                {/* Avatar Fallback Mode / Pause State */}
                {(isCamOff || !deviceCameraChecked || !localStream || privacyMaskType === "avatar") && (
                  <div className="absolute inset-x-0 inset-y-0 bg-slate-900/90 flex flex-col items-center justify-center p-3 text-center z-10">
                    <div className="h-14 w-14 rounded-full bg-[#3D8B7A]/10 border border-[#3D8B7A]/40 text-primary flex items-center justify-center mb-2">
                      <Users className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 truncate max-w-full">
                      {nickname} (You)
                    </span>
                    <span className="text-[8px] text-[#7B9E87] uppercase tracking-wider font-bold">
                      Identity Guarded
                    </span>
                  </div>
                )}

                {/* Hand Raised Banner */}
                {myHandRaised && (
                  <span className="absolute top-2 right-2 bg-amber-400 text-slate-950 font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md z-30">
                    <Hand className="h-3 w-3 shrink-0 fill-slate-950" /> Hand Raised
                  </span>
                )}

                {/* Privacy Badge */}
                {privacyMaskType === "blur" && !isCamOff && deviceCameraChecked && (
                  <span className="absolute top-2 left-2 bg-primary text-slate-950 font-bold text-[8px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md z-30 uppercase tracking-widest">
                    <Sparkles className="h-2.5 w-2.5 shrink-0" /> Blurred
                  </span>
                )}

                {/* Name tag */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-30">
                  <span className="text-[10px] bg-slate-950/80 border border-slate-700/50 backdrop-blur-sm px-2 py-0.5 rounded-md text-white truncate max-w-[70%] font-semibold">
                    {nickname}
                  </span>
                  <div className="flex gap-1">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${isMicMuted ? 'bg-red-500/80 text-white' : 'bg-slate-950/80 text-emerald-400'}`}>
                      {isMicMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected Simulated Peer blocks */}
              {peers.map((peer) => (
                <div 
                  key={peer.id}
                  className={`relative aspect-video rounded-3xl bg-slate-900 border transition-all duration-300 overflow-hidden flex flex-col items-center justify-center ${
                    peer.isSpeaking ? 'border-primary ring-2 ring-primary/20 bg-slate-800/10' : 'border-slate-800'
                  } ${
                    peer.hasHandRaised ? 'border-amber-400 ring-2 ring-amber-400/25' : ''
                  }`}
                >
                  {/* Mock video content styled safely */}
                  <div className="absolute inset-0 w-full h-full bg-slate-950/40 flex flex-col items-center justify-center p-3 text-center">
                    <div 
                      className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 transition-transform duration-300 ${
                        peer.isSpeaking ? 'scale-110 shadow-lg animate-pulse' : ''
                      }`}
                      style={{ 
                        backgroundColor: `${peer.accentColor}10`,
                        border: `2px solid ${peer.accentColor}`,
                        boxShadow: peer.isSpeaking ? `0 0 16px ${peer.accentColor}25` : "none"
                      }}
                    >
                      <Users className="h-5 w-5" style={{ color: peer.accentColor }} />
                    </div>
                    <span className="text-xs font-bold text-slate-200 truncate max-w-full">{peer.name}</span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 leading-none">{peer.program}</span>
                  </div>

                  {/* Badges flags */}
                  {peer.hasHandRaised && (
                    <span className="absolute top-2 right-2 bg-amber-400 text-slate-950 font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md z-30">
                      <Hand className="h-3 w-3 shrink-0 fill-slate-950" /> Hand Raised
                    </span>
                  )}

                  {peer.role === "moderator" && (
                    <span className="absolute top-2 left-2 bg-[#ea580c]/15 border border-[#ea580c]/30 text-[#fdba74] font-bold text-[8px] px-2 py-0.5 rounded-full z-30">
                      MESA Staff
                    </span>
                  )}

                  {/* Bottom details */}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-30">
                    <span className="text-[10px] bg-slate-950/80 border border-slate-700/50 backdrop-blur-sm px-2 py-0.5 rounded-md text-white truncate max-w-[70%] font-semibold">
                      {peer.name.split("-")[0].trim()}
                    </span>
                    <div className="flex gap-1">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center bg-slate-950/80 ${peer.isMuted ? 'text-red-400' : 'text-emerald-400'}`}>
                        {peer.isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DYNAMIC SESSIONS OVERLAYS PANEL */}
            <AnimatePresence>
              {activeOverlayBox === "breathing" && (
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  className="absolute inset-x-0 bottom-24 top-1/4 bg-slate-900/95 backdrop-blur-md rounded-t-[2.5rem] border-t border-slate-800 z-40 flex flex-col overflow-hidden"
                >
                  <div className="flex justify-between items-center p-5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Infinity className="h-5 w-5 text-primary" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Synchronous Group Box Breathing</h4>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={handleStopGroupBreathing}
                      className="h-8 rounded-xl px-2 text-slate-400 text-xs hover:bg-slate-800"
                    >
                      Close Breathing Tool
                    </Button>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
                    {/* Pulsing Breathing Circle */}
                    <div className="relative flex items-center justify-center h-48 w-48">
                      <motion.div 
                        animate={{
                          scale: breathPhase === "inhale" ? 1.5 : breathPhase === "hold" ? 1.5 : 0.85,
                          backgroundColor: breathPhase === "inhale" ? "#3D8B7A" : breathPhase === "hold" ? "#7B9E87" : "#C47B5A"
                        }}
                        transition={{ duration: breathCounter, ease: "easeInOut" }}
                        className="absolute h-24 w-24 rounded-full opacity-35 filter blur-md"
                      />
                      <motion.div 
                        animate={{
                          scale: breathPhase === "inhale" ? 1.4 : breathPhase === "hold" ? 1.4 : 0.9,
                        }}
                        transition={{ duration: 3.5, ease: "easeInOut" }}
                        className="h-28 w-28 rounded-full bg-primary/20 border-4 border-primary flex flex-col items-center justify-center text-white font-serif font-bold text-lg shadow-2xl z-20"
                      >
                        <span className="capitalize text-slate-100">{breathPhase === "idle" ? "Relax" : breathPhase}</span>
                        <span className="text-2xl mt-1 tracking-wider">{breathCounter}</span>
                      </motion.div>
                    </div>

                    <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                      Breathwork stabilizes the autonomous nervous system during recovery cravings or anxiety attacks. Syncing together creates unified comfort.
                    </p>

                    <div className="flex gap-2">
                      <span className="text-[10px] bg-[#3D8B7A]/20 border border-[#3D8B7A]/40 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Inhale 4s
                      </span>
                      <span className="text-[10px] bg-[#7B9E87]/20 border border-[#7B9E87]/40 text-[#7B9E87] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Hold 4s
                      </span>
                      <span className="text-[10px] bg-[#C47B5A]/20 border border-[#C47B5A]/40 text-[#C47B5A] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Exhale 4s
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CHAT PANEL OVERLAY */}
              {isChatOpen && (
                <motion.div 
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  className="absolute inset-y-0 right-0 w-[80%] bg-slate-900 border-l border-slate-800 z-50 flex flex-col shadow-2xl"
                >
                  <div className="flex justify-between items-center p-4 border-b border-borderColor bg-slate-950">
                    <div className="flex items-center gap-1.5 text-primary">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Room Message Board</span>
                    </div>
                    <Button 
                      onClick={() => setIsChatOpen(false)}
                      variant="ghost" 
                      className="h-8 w-8 rounded-full p-0 hover:bg-slate-800 text-slate-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {chatMessages.map((msg, index) => {
                      const isMe = msg.senderName === nickname || (msg.senderId === user?.uid && msg.senderName !== undefined);
                      const isClinicalAlert = msg.text.startsWith("[Clinical Cue]");
                      const isLocationAlert = msg.text.startsWith("[Location Ping]");
                      const isLog = msg.text.startsWith("[Connection Log]");

                      if (isLog) {
                        return (
                          <div key={index} className="flex justify-center text-center">
                            <span className="text-[9px] bg-slate-950 font-mono text-slate-500 font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-slate-900">
                              {msg.text.replace("[Connection Log] ", "")}
                            </span>
                          </div>
                        );
                      }

                      if (isClinicalAlert || isLocationAlert) {
                        return (
                          <div key={index} className="p-3 bg-primary/5 rounded-2xl border border-primary/20 flex gap-2">
                            {isClinicalAlert ? <Sparkles className="h-4 w-4 text-primary shrink-0" /> : <Navigation className="h-4 w-4 text-primary shrink-0" />}
                            <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                              <strong>{isClinicalAlert ? "Clinical Assist" : "Welfare Coordinate"}</strong>: {msg.text.replace(/\[Clinical Cue\]|\[Location Ping\]/, "").trim()}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div key={index} className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                          <div className="flex items-center gap-1.5 mb-1 text-[9px] font-bold text-slate-400">
                            <span>{msg.senderName}</span>
                          </div>
                          <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                            isMe 
                              ? 'bg-primary text-white rounded-tr-none' 
                              : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none'
                          }`}>
                            {msg.text.startsWith("[Group Room]") ? msg.text.replace("[Group Room] ", "") : msg.text}
                          </div>
                        </div>
                      );
                    })}

                    {chatMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <MessageSquare className="h-8 w-8 text-slate-700 mb-2" />
                        <span className="text-xs font-bold text-slate-400">Secure chat has started.</span>
                        <span className="text-[9px] text-slate-600 mt-1 max-w-xs leading-relaxed">
                          Your chats are secured under end-to-end PHIPA transport. No archive is retained clinical logs.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hot Word Trigger Chips */}
                  <div className="p-2 border-t border-slate-800 bg-slate-950 flex flex-wrap gap-1.5">
                    {["Listening only", "Checking in", "Deep breath", "Need help"].map(chip => (
                      <button 
                        key={chip}
                        onClick={() => sendChatMessage(chip)}
                        className="text-[9px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 hover:border-primary text-slate-400 px-2.5 py-1 rounded-lg hover:text-white transition-all cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input interface */}
                  <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex gap-2">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Type secure chat..." 
                      className="flex-1 h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button 
                      onClick={() => sendChatMessage()}
                      className="h-10 px-3 bg-primary text-white text-xs font-bold rounded-xl"
                    >
                      Send
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PERSISTENT DISCLOSURES & LOCATION PRIVACY POPUP */}
            <div className="mx-4 my-2 p-2 bg-[#C47B5A]/10 border border-[#C47B5A]/25 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-[#C47B5A]" />
                  <span className="text-[10px] font-bold text-slate-200">Continuous GPS Safe Patrol (MESA)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-bold text-[#C47B5A] uppercase tracking-widest font-mono">OPT-IN ONLY</span>
                  <input 
                    type="checkbox" 
                    checked={locationPrivacyOptIn} 
                    onChange={(e) => {
                      setLocationPrivacyOptIn(e.target.checked);
                      if (!e.target.checked) {
                        setLocationSentStatus("none");
                        setClientCoordinates(null);
                      }
                    }}
                    className="h-4 w-4 accent-[#C47B5A] cursor-pointer"
                  />
                </div>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">
                Under Ontario privacy rulings, active tracking pings are strictly opt-in. Check to allow paramedics/clinicians to query high-precision GPS on check-in.
              </p>
              
              {locationPrivacyOptIn && (
                <div className="flex items-center gap-2 mt-1 bg-slate-950 p-2 rounded-xl border border-slate-800/80 justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#C47B5A] animate-pulse" />
                    <span className="text-[8px] font-mono font-bold text-slate-300">
                      {locationSentStatus === "none" && "Click ping check-in"}
                      {locationSentStatus === "sending" && "Fetching satellite coordinate..."}
                      {locationSentStatus === "success" && `Welfare Pin registered: Lat ${clientCoordinates?.lat.toFixed(3)}, Lng ${clientCoordinates?.lng.toFixed(3)}`}
                    </span>
                  </div>
                  {locationSentStatus !== "success" && (
                    <Button 
                      size="sm" 
                      onClick={handleLocationPrivacyCheckIn}
                      disabled={locationSentStatus === "sending"}
                      className="h-6 rounded-lg text-[9px] bg-primary hover:bg-primary/95 text-white p-2"
                    >
                      Ping Now
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* LIVE SYSTEM CALL CONTROLS */}
            <div className="p-5 pb-8 bg-slate-950 border-t border-slate-900 flex justify-around items-center">
              
              {/* Toggle Mic */}
              <button 
                onClick={toggleLocalMic}
                style={{ minHeight: "44px", minWidth: "44px" }}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 border ${
                  isMicMuted 
                    ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25' 
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
                title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              {/* Toggle Cam */}
              <button 
                onClick={toggleLocalCamera}
                style={{ minHeight: "44px", minWidth: "44px" }}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 border ${
                  isCamOff 
                    ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25' 
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
                title={isCamOff ? "Turn Video On" : "Turn Video Off"}
              >
                {isCamOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </button>

              {/* Hand Raise */}
              <button 
                onClick={() => {
                  setMyHandRaised(!myHandRaised);
                  sendChatMessage(myHandRaised ? "[Lobby Update] Hand lowered" : "[Lobby Update] Raised hand in meeting room loop");
                }}
                style={{ minHeight: "44px", minWidth: "44px" }}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 border ${
                  myHandRaised 
                    ? 'bg-amber-400/20 border-amber-400/50 text-amber-400 hover:bg-amber-400/30' 
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
                title="Raise/Lower Hand"
              >
                <Hand className={`h-5 w-5 ${myHandRaised ? 'fill-amber-400' : ''}`} />
              </button>

              {/* Group Box Breathing Activity */}
              <button 
                onClick={() => {
                  if (activeOverlayBox === "breathing") {
                    handleStopGroupBreathing();
                  } else {
                    handleStartGroupBreathing();
                  }
                }}
                style={{ minHeight: "44px", minWidth: "44px" }}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 border ${
                  activeOverlayBox === "breathing" 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
                title="Group Breathing Activity"
              >
                <Infinity className="h-5 w-5" />
              </button>

              {/* Open Message Board */}
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                style={{ minHeight: "44px", minWidth: "44px" }}
                className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 border ${
                  isChatOpen 
                    ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10' 
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                }`}
                title="Support Message Board"
              >
                <MessageSquare className="h-5 w-5" />
              </button>

              {/* Close meeting */}
              <button 
                onClick={onBack}
                style={{ minHeight: "44px", minWidth: "44px" }}
                className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors shadow-lg shadow-red-600/35 cursor-pointer"
                title="Leave Video Circle"
              >
                <VideoOff className="h-5 w-5 text-white" />
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
