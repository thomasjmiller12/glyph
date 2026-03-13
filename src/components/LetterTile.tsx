"use client";

import { motion } from "framer-motion";

type TileState = "empty" | "tbd" | "correct" | "present" | "absent";

const STATE_COLORS: Record<TileState, string> = {
  empty: "border-[#2A2A2E] bg-transparent",
  tbd: "border-[#4A4A4E] bg-transparent",
  correct: "border-[#6BCB77] bg-[#6BCB77] text-[#0A0A0B]",
  present: "border-[#D4A574] bg-[#D4A574] text-[#0A0A0B]",
  absent: "border-[#3A3A3E] bg-[#3A3A3E] text-[#8B8B8B]",
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
  const isRevealed = state !== "empty" && state !== "tbd";

  return (
    <motion.div
      className={`relative flex h-[58px] w-[58px] items-center justify-center border-2 font-mono text-2xl font-bold uppercase sm:h-[62px] sm:w-[62px] ${STATE_COLORS[state]}`}
      initial={false}
      animate={
        isCurrentRow && letter
          ? { scale: [1, 1.08, 1] }
          : isRevealed
            ? {
                rotateX: [0, 90, 0],
                transition: {
                  duration: 0.5,
                  delay,
                  times: [0, 0.5, 0.5],
                },
              }
            : {}
      }
      transition={{ duration: 0.1 }}
      style={{ perspective: 500 }}
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
