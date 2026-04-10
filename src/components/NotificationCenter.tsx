import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  X, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  Info,
  CheckCircle2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { theme } from "../theme";
import { useNotifications } from "../context/NotificationContext";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap = {
  session: Calendar,
  message: MessageSquare,
  milestone: Sparkles,
  system: Info,
};

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, markAsRead, requestPermission, permission } = useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute inset-0 z-[60] flex flex-col bg-background"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 p-4" style={{ backgroundColor: theme.secondary }}>
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                <Bell className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: theme.foreground }}>Notifications</h2>
            </div>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-white/5" style={{ color: theme.muted }}>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Permission Banner */}
          {permission === 'default' && (
            <div className="m-4 rounded-2xl p-4 border border-primary/20 bg-primary/5">
              <p className="text-xs font-medium mb-3" style={{ color: theme.foreground }}>
                Enable push notifications to stay updated on your sessions and messages.
              </p>
              <Button 
                onClick={requestPermission}
                className="w-full h-10 rounded-xl bg-primary text-background font-bold text-xs"
              >
                Enable Notifications
              </Button>
            </div>
          )}

          {/* List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-3 py-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 rounded-full p-6 bg-white/5">
                    <Bell className="h-10 w-10 opacity-20" style={{ color: theme.muted }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: theme.muted }}>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = iconMap[n.type] || Info;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative flex gap-4 rounded-3xl p-4 border transition-colors ${
                        n.read ? 'bg-white/5 border-white/5' : 'bg-white/10 border-primary/20'
                      }`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        n.read ? 'bg-white/5' : 'bg-primary/20'
                      }`}>
                        <Icon className="h-5 w-5" style={{ color: n.read ? theme.muted : theme.primary }} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold" style={{ color: theme.foreground }}>{n.title}</h4>
                          {!n.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: theme.muted }}>{n.body}</p>
                        <p className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.2)" }}>Just now</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer Action */}
          <div className="p-4 pb-8">
            <Button 
              variant="ghost" 
              className="w-full h-12 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10"
              onClick={() => notifications.forEach(n => markAsRead(n.id))}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark all as read
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
