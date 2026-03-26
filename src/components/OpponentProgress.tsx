"use client";

import { motion } from "framer-motion";

interface OpponentProgressProps {
  opponentName: string;
  feedback: string[][]; // array of guess feedback (each is 5 colors)
  maxAttempts: number;
}

const COLOR_MAP: Record<string, string> = {
  correct: "bg-success",
  present: "bg-warning",
  absent: "bg-error",
};

export default function OpponentProgress({
  opponentName,
  feedback,
  maxAttempts,
}: OpponentProgressProps) {
  return (
    <div className="hidden lg:flex flex-col items-center gap-2">
      <p className="text-xs text-secondary font-medium">{opponentName}</p>
      <div className="flex flex-col gap-1">
        {Array.from({ length: maxAttempts }, (_, i) => {
          const guessFeedback = feedback[i];
          if (guessFeedback) {
            return (
              <motion.div
                key={i}
                className="flex gap-0.5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {guessFeedback.map((f, j) => (
                  <div
                    key={j}
                    className={`h-3 w-3 rounded-sm ${COLOR_MAP[f] ?? "bg-border"}`}
                  />
                ))}
              </motion.div>
            );
          }
          return (
            <div key={i} className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, j) => (
                <div
                  key={j}
                  className="h-3 w-3 rounded-sm border border-border/30"
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
