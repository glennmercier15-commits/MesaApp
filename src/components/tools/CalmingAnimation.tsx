import React from "react";
import { motion } from "motion/react";
import { theme } from "../../theme";

export function CalmingAnimation() {
  return (
    <div className="flex items-center justify-center h-48 w-full">
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="w-32 h-32 rounded-full blur-2xl"
        style={{ backgroundColor: theme.primary }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="w-24 h-24 rounded-full absolute"
        style={{ backgroundColor: theme.primary }}
      />
    </div>
  );
}
