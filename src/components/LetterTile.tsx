"use client";

import { motion } from "framer-motion";
import { useThemeColors } from "@/lib/theme-colors";

type TileState = "empty" | "tbd" | "correct" | "present" | "absent";

const STATE_COLORS: Record<TileState, string> = {
  empty: "border-border bg-transparent",
  tbd: "border-tile-tbd-border bg-transparent",
  correct: "border-success bg-success text-background",
  present: "border-warning bg-warning text-background",
  absent: "border-error bg-error text-error-text",
};

interface LetterTileProps {
  letter: string;
  state: TileState;
  delay?: number;
  isCurrentRow?: boolean;
}

export default function LetterTile({
  letter,
  state,
  delay = 0,
  isCurrentRow = false,
}: LetterTileProps) {
  const colors = useThemeColors();
  const isRevealed = state !== "empty" && state !== "tbd";

  const glowMap: Record<TileState, string> = {
    empty: "",
    tbd: "",
    correct: `0 0 14px ${colors.successGlow}, 0 0 4px ${colors.successGlow}`,
    present: `0 0 14px ${colors.warningGlow}, 0 0 4px ${colors.warningGlow}`,
    absent: "",
  };
  const glow = glowMap[state];

  return (
    <motion.div
      className={`relative flex h-[58px] w-[58px] items-center justify-center border-2 font-mono text-2xl font-bold uppercase sm:h-[62px] sm:w-[62px] ${STATE_COLORS[state]} ${
        isCurrentRow && !letter ? "tile-active-empty" : ""
      }`}
      initial={false}
      animate={
        isCurrentRow && letter
          ? { scale: [1, 1.1, 1], borderColor: colors.accentHover }
          : isRevealed
            ? {
                rotateX: [0, 90, 0],
                boxShadow: ["0 0 0px transparent", "0 0 20px rgba(255,255,255,0.3)", glow || "0 0 0px transparent"],
                transition: {
                  duration: 0.5,
                  delay,
                  times: [0, 0.5, 0.5],
                },
              }
            : {}
      }
      transition={{ duration: 0.1 }}
      style={{
        perspective: 500,
        boxShadow: isRevealed ? glow : undefined,
      }}
    >
      <motion.span
        animate={
          isRevealed
            ? {
                opacity: [1, 0, 1],
                transition: { duration: 0.5, delay, times: [0, 0.45, 0.55] },
              }
            : {}
        }
      >
        {letter}
      </motion.span>
    </motion.div>
  );
}
