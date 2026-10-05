import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberLogo } from '../common/CyberLogo';

interface BootSequenceProps {
  onComplete: () => void;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [showAccessGranted, setShowAccessGranted] = useState(false);

  const bootLogs = [
    "INITIALIZING CYBERNEXUS CORE...",
    "LOADING SECURITY ENGINE...",
    "INITIALIZING TELEMETRY...",
    "CONNECTING TO EVENT BUS...",
    "LOADING THREAT INTELLIGENCE...",
    "INITIALIZING NEXUS AI...",
    "VERIFYING SYSTEM INTEGRITY...",
    "SECURITY CORE: ONLINE"
  ];

  useEffect(() => {
    if (stepIndex < bootLogs.length) {
      const timer = setTimeout(() => {
        setStepIndex(prev => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      // Trigger ACCESS GRANTED animation
      const accessTimer = setTimeout(() => {
        setShowAccessGranted(true);
      }, 300);
      return () => clearTimeout(accessTimer);
    }
  }, [stepIndex]);

  useEffect(() => {
    if (showAccessGranted) {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 1800);
      return () => clearTimeout(finishTimer);
    }
  }, [showAccessGranted, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#030609] scanlines flex flex-col items-center justify-center p-6 font-mono-tech select-none">
      {/* Cyber Grid background */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* Terminal Container Box */}
      <div className="relative w-full max-w-xl bg-[#070B11]/90 border border-[#00E5FF]/40 rounded-lg p-8 shadow-[0_0_50px_rgba(0,229,255,0.15)] flex flex-col items-center">
        {/* Header Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <CyberLogo size="xl" showText={true} showTagline={true} />
        </motion.div>

        {/* Boot Terminal Log Sequence */}
        <div className="w-full bg-[#030609] border border-[#17232E] rounded p-4 h-48 overflow-y-auto mb-6 flex flex-col gap-1.5 text-xs text-[#7F95A5]">
          {bootLogs.slice(0, stepIndex).map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-[#00E5FF] font-bold">[+]</span>
              <span className={index === bootLogs.length - 1 ? "text-[#22C55E] font-bold" : "text-[#E6F1F5]"}>
                {log}
              </span>
            </motion.div>
          ))}
          {stepIndex < bootLogs.length && (
            <div className="flex items-center gap-2 text-[#00E5FF] animate-pulse">
              <span>[&gt;]</span>
              <span>_</span>
            </div>
          )}
        </div>

        {/* Glowing Green ACCESS GRANTED Announcement */}
        <AnimatePresence>
          {showAccessGranted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full text-center"
            >
              <div className="inline-block border-2 border-[#22C55E] bg-[#22C55E]/10 px-8 py-3 rounded text-2xl font-black tracking-widest text-[#22C55E] shadow-[0_0_30px_rgba(34,197,94,0.5)] glow-green">
                ACCESS GRANTED_
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 text-[11px] text-[#465663] uppercase tracking-widest">
        CYBERNEXUS AUTONOMOUS DEFENSE PLATFORM &bull; SECURE ENGINE v1.0
      </div>
    </div>
  );
};
