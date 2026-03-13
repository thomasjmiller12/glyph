"use client";

import { motion } from "framer-motion";

interface RoundResult {
  roundNumber: number;
  hostGuesses: number;
  guestGuesses: number;
  status: string;
}

interface DuelScoreboardProps {
  hostName: string;
  guestName: string;
  rounds: RoundResult[];
  currentRound: number;
  totalRounds: number;
}

function ScoreDot({ result, isCurrent }: { result?: RoundResult; isCurrent: boolean }) {
  if (!result || result.status === "pending" || result.status === "picking") {
    return (
      <div
        className={`h-3 w-3 rounded-full border ${
          isCurrent ? "border-accent" : "border-error"
        }`}
      />
    );
  }
  if (result.status !== "completed") {
    return (
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="h-3 w-3 rounded-full bg-accent"
      />
    );
  }
  return <div className="h-3 w-3 rounded-full bg-success" />;
}

export default function DuelScoreboard({
  hostName,
  guestName,
  rounds,
  currentRound,
  totalRounds,
}: DuelScoreboardProps) {
  const hostTotal = rounds
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.hostGuesses, 0);
  const guestTotal = rounds
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.guestGuesses, 0);

  return (
    <div className="flex items-center gap-6 rounded-xl border border-border bg-surface p-4">
      <div className="flex-1 text-center">
        <p className="text-sm font-medium text-primary">{hostName}</p>
        <p className="font-mono text-2xl font-bold text-accent">{hostTotal}</p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-xs text-secondary">Round {currentRound}/{totalRounds}</p>
        <div className="flex gap-1.5">
          {Array.from({ length: totalRounds }, (_, i) => (
            <ScoreDot
              key={i}
              result={rounds[i]}
              isCurrent={i + 1 === currentRound}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 text-center">
        <p className="text-sm font-medium text-primary">{guestName}</p>
        <p className="font-mono text-2xl font-bold text-accent">{guestTotal}</p>
      </div>
    </div>
  );
}
