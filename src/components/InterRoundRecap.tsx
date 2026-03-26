"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface InterRoundRecapProps {
  roundNumber: number;
  targetWord: string;
  myName: string;
  opponentName: string;
  myGuessWords: string[];
  myGuessFeedback: string[][];
  opponentGuessWords: string[];
  opponentGuessFeedback: string[][];
  onDone: () => void;
}

const FEEDBACK_COLOR: Record<string, string> = {
  correct: "bg-success",
  present: "bg-warning",
  absent: "bg-error",
};

function MiniBoard({
  name,
  words,
  feedback,
  guessCount,
}: {
  name: string;
  words: string[];
  feedback: string[][];
  guessCount: number;
}) {
  const solved = feedback[feedback.length - 1]?.every((f) => f === "correct");
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-xs font-semibold text-secondary">{name}</p>
      {words.map((word, i) => (
        <motion.div
          key={i}
          className="flex gap-0.5"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {word.split("").map((letter, j) => (
            <div
              key={j}
              className={`flex h-7 w-7 items-center justify-center font-mono text-xs font-bold uppercase sm:h-8 sm:w-8 sm:text-sm ${FEEDBACK_COLOR[feedback[i]?.[j] ?? "absent"] ?? "bg-border"} text-background`}
            >
              {letter}
            </div>
          ))}
        </motion.div>
      ))}
      <p className={`text-xs font-medium ${solved ? "text-success" : "text-error"}`}>
        {solved ? `Solved in ${guessCount}` : "Failed"}
      </p>
    </div>
  );
}

export default function InterRoundRecap({
  roundNumber,
  targetWord,
  myName,
  opponentName,
  myGuessWords,
  myGuessFeedback,
  opponentGuessWords,
  opponentGuessFeedback,
  onDone,
}: InterRoundRecapProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          onDone();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-1 flex-col items-center justify-center gap-4 px-4"
    >
      <h3 className="text-lg font-bold text-primary">
        Round {roundNumber} Recap
      </h3>
      <p className="font-mono text-sm uppercase tracking-widest text-accent">
        {targetWord}
      </p>

      <div className="flex gap-6 sm:gap-10">
        <MiniBoard
          name={myName}
          words={myGuessWords}
          feedback={myGuessFeedback}
          guessCount={myGuessWords.length}
        />
        <div className="w-px self-stretch bg-border" />
        <MiniBoard
          name={opponentName}
          words={opponentGuessWords}
          feedback={opponentGuessFeedback}
          guessCount={opponentGuessWords.length}
        />
      </div>

      <p className="text-xs text-secondary">
        Next round in {countdown}s
      </p>
    </motion.div>
  );
}
