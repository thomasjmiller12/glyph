"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DuelTimerProps {
  endTime: number; // timestamp in ms
  onExpire?: () => void;
}

export default function DuelTimer({ endTime, onExpire }: DuelTimerProps) {
  const [remaining, setRemaining] = useState(
    Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 200);
    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  const totalSeconds = Math.max(1, Math.ceil((endTime - Date.now()) / 1000) + remaining);
  const fraction = remaining / Math.max(totalSeconds, 1);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference * (1 - Math.min(1, fraction));

  const color =
    remaining <= 10 ? "#ef4444" : remaining <= 30 ? "#D4A574" : "#E8E8E8";

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg width="80" height="80" className="-rotate-90">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="#2A2A2E"
          strokeWidth="3"
        />
        <motion.circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          animate={remaining <= 10 ? { opacity: [1, 0.5, 1] } : {}}
          transition={
            remaining <= 10
              ? { duration: 0.5, repeat: Infinity }
              : {}
          }
        />
      </svg>
      <span
        className="absolute font-mono text-lg font-bold"
        style={{ color }}
      >
        {remaining}
      </span>
    </div>
  );
}
