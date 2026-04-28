import React from 'react';
import { motion } from 'motion/react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#F7F5F2]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => setTimeout(onComplete, 2000)}
    >
      <motion.img
        src="/assets/logo.png"
        alt="Pulse Hub Logo"
        className="w-48 h-48 object-contain"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </motion.div>
  );
};
