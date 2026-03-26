"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RoundData {
  roundNumber: number;
  secretWord?: string;
  pickedByHost?: string;
  pickedByGuest?: string;
  hostGuesses: number;
  guestGuesses: number;
  hostGuessWords: string[];
  hostGuessFeedback: string[][];
  guestGuessWords: string[];
  guestGuessFeedback: string[][];
  roundWinner?: string;
}

interface DuelRecapProps {
  hostName: string;
  guestName: string;
  hostId: string;
  rounds: RoundData[];
  mode: "same_word" | "pick_words";
}

const FEEDBACK_COLOR: Record<string, string> = {
  correct: "border-success bg-success text-background",
  present: "border-warning bg-warning text-background",
  absent: "border-error bg-error text-error-text",
};

function RecapTile({ letter, feedback }: { letter: string; feedback: string }) {
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center border font-mono text-sm font-bold uppercase sm:h-9 sm:w-9 sm:text-base ${FEEDBACK_COLOR[feedback] ?? "border-border bg-transparent"}`}
    >
      {letter}
    </div>
  );
}

function PlayerGuesses({
  name,
  words,
  feedback,
  isWinner,
}: {
  name: string;
  words: string[];
  feedback: string[][];
  isWinner: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className={`text-xs font-medium ${isWinner ? "text-accent" : "text-secondary"}`}>
        {name} {isWinner && " - Won"}
      </p>
      {words.map((word, i) => (
        <div key={i} className="flex gap-0.5">
          {word.split("").map((letter, j) => (
            <RecapTile key={j} letter={letter} feedback={feedback[i]?.[j] ?? "absent"} />
          ))}
        </div>
      ))}
      {words.length === 0 && (
        <p className="text-xs text-secondary italic">No guesses</p>
      )}
    </div>
  );
}

export default function DuelRecap({
  hostName,
  guestName,
  hostId,
  rounds,
  mode,
}: DuelRecapProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="w-full max-w-2xl">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-left transition-colors hover:bg-border/30"
      >
        <span className="text-sm font-semibold text-primary">Game Recap</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="text-secondary"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-6 pt-4">
              {rounds.map((round) => {
                const targetWord =
                  mode === "same_word"
                    ? round.secretWord
                    : undefined;
                const hostTarget =
                  mode === "pick_words" ? round.pickedByGuest : round.secretWord;
                const guestTarget =
                  mode === "pick_words" ? round.pickedByHost : round.secretWord;
                const hostWon = round.roundWinner === hostId;
                const guestWon = round.roundWinner !== undefined && round.roundWinner !== hostId;

                return (
                  <div
                    key={round.roundNumber}
                    className="rounded-lg border border-border bg-surface/50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-primary">
                        Round {round.roundNumber}
                      </h4>
                      <span className="font-mono text-xs text-secondary uppercase">
                        {mode === "same_word"
                          ? targetWord
                          : `${hostName}: ${hostTarget} / ${guestName}: ${guestTarget}`}
                      </span>
                    </div>

                    <div className="flex justify-around gap-4">
                      <PlayerGuesses
                        name={hostName}
                        words={round.hostGuessWords}
                        feedback={round.hostGuessFeedback}
                        isWinner={hostWon}
                      />
                      <div className="w-px bg-border" />
                      <PlayerGuesses
                        name={guestName}
                        words={round.guestGuessWords}
                        feedback={round.guestGuessFeedback}
                        isWinner={guestWon}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
