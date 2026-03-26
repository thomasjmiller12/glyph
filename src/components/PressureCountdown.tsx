"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PressureCountdownProps {
  deadline: number;
  label?: string;
}

export default function PressureCountdown({ deadline, label }: PressureCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [deadline]);

  const isUrgent = secondsLeft <= 10;

  return (
    <motion.div
      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-sm font-bold ${
        isUrgent
          ? "bg-red-500/20 text-red-400"
          : "bg-accent/10 text-accent"
      }`}
      animate={isUrgent ? { scale: [1, 1.03, 1] } : {}}
      transition={isUrgent ? { duration: 1, repeat: Infinity } : {}}
    >
      <span className="text-lg">{secondsLeft}s</span>
      <span className="text-xs font-normal opacity-70">
        {label ?? "remaining"}
      </span>
    </motion.div>
  );
}
