"use client";

import LetterTile from "./LetterTile";

interface Guess {
  word: string;
  feedback: string[];
}

interface GameBoardProps {
  guesses: Guess[];
  currentGuess: string;
  maxAttempts: number;
  isRevealing?: number; // index of row currently revealing
}

export default function GameBoard({
  guesses,
  currentGuess,
  maxAttempts,
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
      // Current input row
      rows.push(
        <div key={i} className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, j) => (
            <LetterTile
              key={j}
              letter={currentGuess[j] ?? ""}
              state={currentGuess[j] ? "tbd" : "empty"}
              isCurrentRow={true}
            />
          ))}
        </div>
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
