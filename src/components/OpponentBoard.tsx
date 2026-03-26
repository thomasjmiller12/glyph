"use client";

import { motion } from "framer-motion";

interface OpponentBoardProps {
  opponentName: string;
  words: string[];
  feedback: string[][];
  maxAttempts: number;
  pickedWord?: string;
  alwaysVisible?: boolean;
}

const FEEDBACK_COLOR: Record<string, string> = {
  correct: "border-success bg-success text-background",
  present: "border-warning bg-warning text-background",
  absent: "border-error bg-error text-error-text",
};

export default function OpponentBoard({
  opponentName,
  words,
  feedback,
  maxAttempts,
  pickedWord,
  alwaysVisible = false,
}: OpponentBoardProps) {
  return (
    <div className={`${alwaysVisible ? "flex" : "hidden lg:flex"} flex-col items-center gap-2`}>
      <p className="text-xs text-secondary font-medium">{opponentName}</p>
      {pickedWord && (
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          solving: {pickedWord}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {Array.from({ length: maxAttempts }, (_, i) => {
          const word = words[i];
          const guessFeedback = feedback[i];
          if (word && guessFeedback) {
            return (
              <motion.div
                key={i}
                className="flex gap-0.5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {word.split("").map((letter, j) => (
                  <div
                    key={j}
                    className={`flex h-7 w-7 items-center justify-center border font-mono text-xs font-bold uppercase ${FEEDBACK_COLOR[guessFeedback[j]] ?? "border-border bg-transparent"}`}
                  >
                    {letter}
                  </div>
                ))}
              </motion.div>
            );
          }
          return (
            <div key={i} className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, j) => (
                <div
                  key={j}
                  className="h-7 w-7 border border-border/30"
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
