"use client";

import { motion } from "framer-motion";
import { Delete } from "lucide-react";
import type { LetterState } from "@/lib/keyboard-state";
import { useThemeColors } from "@/lib/theme-colors";

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "backspace"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m", "enter"],
];

const STATE_COLORS: Record<LetterState | "unused", string> = {
  unused: "bg-key-bg text-primary",
  correct: "bg-success text-background",
  present: "bg-warning text-background",
  absent: "bg-border text-placeholder",
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
  const colors = useThemeColors();

  const glowMap: Record<LetterState | "unused", string | undefined> = {
    unused: undefined,
    correct: `0 0 10px ${colors.successGlow}, 0 0 3px ${colors.successGlow}`,
    present: `0 0 10px ${colors.warningGlow}, 0 0 3px ${colors.warningGlow}`,
    absent: undefined,
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((key) => {
            const isSpecial = key === "enter" || key === "backspace";
            const state = letterStates[key] ?? "unused";
            const glow = isSpecial ? undefined : glowMap[state];
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.92 }}
                onClick={() => onKey(key)}
                disabled={disabled}
                className={`flex h-[52px] items-center justify-center rounded-md font-mono text-sm font-semibold uppercase transition-all duration-200 sm:h-[56px] ${
                  isSpecial
                    ? "w-[52px] bg-key-bg text-primary sm:w-[65px]"
                    : `w-[32px] sm:w-[40px] ${STATE_COLORS[state]}`
                } ${disabled ? "opacity-50" : ""}`}
                style={{ boxShadow: glow }}
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
