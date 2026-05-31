import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, ShieldAlert, X } from "lucide-react";
import { useAppTheme } from "../theme/AppTheme";

export function CrisisFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useAppTheme();

  const crisisLinks = [
    { name: "Emergency Dispatch", number: "911", desc: "For immediate, life-threatening danger", danger: true },
    { name: "MacKay Crisis Line", number: "613-432-4946", desc: "Available 24/7 for local crisis support" },
    { name: "Crisis Services Canada", number: "1-833-456-4566", desc: "Available 24/7 for national help" },
  ];

  return (
    <motion.div 
      drag
      dragMomentum={false}
      dragConstraints={{ left: -310, right: 10, top: -650, bottom: 20 }}
      className="absolute bottom-24 right-6 z-[100] flex flex-col items-end gap-3"
      role="region"
      aria-label="Crisis Services Access"
    >
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {crisisLinks.map((link, index) => (
              <motion.a
                key={link.number}
                href={`tel:${link.number.replace(/-/g, "")}`}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border pointer-events-auto ${
                  link.danger 
                    ? "bg-red-600 border-red-500 text-white" 
                    : "bg-white border-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                }`}
                aria-label={`Call ${link.name}: ${link.desc}`}
              >
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider">{link.name}</p>
                  <p className="text-[10px] opacity-70">{link.desc}</p>
                </div>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  link.danger ? "bg-white/20" : "bg-red-50 dark:bg-red-900/30 text-red-600"
                }`}>
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        whileDrag={{ cursor: "grabbing" }}
        className="h-14 w-14 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
        style={{ backgroundColor: "#8B3D3D" }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Open emergency crisis resources"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <ShieldAlert className="h-6 w-6 text-white" />
              <span className="text-[8px] font-bold text-white uppercase tracking-tighter mt-0.5">Crisis</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Pulse effect when closed */}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-white"
          />
        )}
      </motion.button>
    </motion.div>
  );
}
