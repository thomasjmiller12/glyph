"use client";

import { motion } from "framer-motion";
import { Delete } from "lucide-react";
import type { LetterState } from "@/lib/keyboard-state";
import { useThemeColors } from "@/lib/theme-colors";

const ROW1 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
const ROW2 = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];
const ROW3 = ["z", "x", "c", "v", "b", "n", "m"];

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

  function renderKey(key: string) {
    const state = letterStates[key] ?? "unused";
    const glow = glowMap[state];
    return (
      <motion.button
        key={key}
        whileTap={{ scale: 0.92 }}
        onClick={() => onKey(key)}
        disabled={disabled}
        className={`flex h-[52px] flex-1 items-center justify-center rounded-md font-mono text-sm font-semibold uppercase transition-all duration-200 sm:h-[58px] sm:text-base ${STATE_COLORS[state]} ${disabled ? "opacity-50" : ""}`}
        style={{ boxShadow: glow }}
      >
        {key}
      </motion.button>
    );
  }

  return (
    <div className="flex w-full max-w-[500px] flex-col gap-1.5 px-1.5">
      {/* Row 1: Q-P */}
      <div className="flex gap-[5px]">
        {ROW1.map(renderKey)}
      </div>

      {/* Row 2: A-L with half-key spacers */}
      <div className="flex gap-[5px] px-[5%]">
        {ROW2.map(renderKey)}
      </div>

      {/* Row 3: Enter + Z-M + Backspace */}
      <div className="flex gap-[5px]">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onKey("enter")}
          disabled={disabled}
          className={`flex h-[52px] flex-[1.5] items-center justify-center rounded-md bg-accent text-xs font-bold uppercase text-background transition-all duration-200 sm:h-[58px] sm:text-sm ${disabled ? "opacity-50" : ""}`}
        >
          Enter
        </motion.button>

        {ROW3.map(renderKey)}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onKey("backspace")}
          disabled={disabled}
          className={`flex h-[52px] flex-[1.5] items-center justify-center rounded-md bg-key-bg text-primary transition-all duration-200 sm:h-[58px] ${disabled ? "opacity-50" : ""}`}
        >
          <Delete size={20} />
        </motion.button>
      </div>
    </div>
  );
}
