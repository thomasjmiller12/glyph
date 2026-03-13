"use client";

import { motion } from "framer-motion";
import LetterTile from "./LetterTile";

interface Guess {
  word: string;
  feedback: string[];
}

interface GameBoardProps {
  guesses: Guess[];
  currentGuess: string;
  maxAttempts: number;
  shake?: boolean;
}

export default function GameBoard({
  guesses,
  currentGuess,
  maxAttempts,
  shake = false,
}: GameBoardProps) {
  const rows = [];

  for (let i = 0; i < maxAttempts; i++) {
    if (i < guesses.length) {
      // Submitted guess
      const guess = guesses[i];
      rows.push(
        <div key={i} className="flex gap-1.5">
          {guess.word.split("").map((letter, j) => (
            <LetterTile
              key={j}
              letter={letter}
              state={guess.feedback[j] as "correct" | "present" | "absent"}
              delay={j * 0.15}
            />
          ))}
        </div>
      );
    } else if (i === guesses.length) {
      // Current input row — with shake animation on invalid guess
      rows.push(
        <motion.div
          key={i}
          className="flex gap-1.5"
          animate={
            shake
              ? { x: [0, -10, 10, -10, 10, -5, 5, 0] }
              : {}
          }
          transition={{ duration: 0.4 }}
        >
          {Array.from({ length: 5 }).map((_, j) => (
            <LetterTile
              key={j}
              letter={currentGuess[j] ?? ""}
              state={currentGuess[j] ? "tbd" : "empty"}
              isCurrentRow={true}
            />
          ))}
        </motion.div>
      );
    } else {
      // Empty future row
      rows.push(
        <div key={i} className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, j) => (
            <LetterTile key={j} letter="" state="empty" />
          ))}
        </div>
      );
    }
  }

  return <div className="flex flex-col items-center gap-1.5">{rows}</div>;
}
