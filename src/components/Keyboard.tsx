"use client";

import { motion } from "framer-motion";
import { Delete } from "lucide-react";
import type { LetterState } from "@/lib/keyboard-state";

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
];

const STATE_COLORS: Record<LetterState | "unused", string> = {
  unused: "bg-[#4A4A4E] text-[#E8E8E8]",
  correct: "bg-[#6BCB77] text-[#0A0A0B]",
  present: "bg-[#D4A574] text-[#0A0A0B]",
  absent: "bg-[#2A2A2E] text-[#5A5A5E]",
};

interface KeyboardProps {
  letterStates: Record<string, LetterState>;
  onKey: (key: string) => void;
  disabled?: boolean;
}

export default function Keyboard({
  letterStates,
  onKey,
  disabled = false,
}: KeyboardProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((key) => {
            const isSpecial = key === "enter" || key === "backspace";
            const state = letterStates[key] ?? "unused";
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.92 }}
                onClick={() => onKey(key)}
                disabled={disabled}
                className={`flex h-[52px] items-center justify-center rounded-md font-mono text-sm font-semibold uppercase transition-colors sm:h-[56px] ${
                  isSpecial
                    ? "w-[52px] bg-[#4A4A4E] text-[#E8E8E8] sm:w-[65px]"
                    : `w-[32px] sm:w-[40px] ${STATE_COLORS[state]}`
                } ${disabled ? "opacity-50" : ""}`}
              >
                {key === "backspace" ? (
                  <Delete size={18} />
                ) : key === "enter" ? (
                  "↵"
                ) : (
                  key
                )}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
