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
          isCurrent ? "border-[#D4A574]" : "border-[#3A3A3E]"
        }`}
      />
    );
  }
  if (result.status !== "completed") {
    return (
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="h-3 w-3 rounded-full bg-[#D4A574]"
      />
    );
  }
  return <div className="h-3 w-3 rounded-full bg-[#6BCB77]" />;
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
    <div className="flex items-center gap-6 rounded-xl border border-[#2A2A2E] bg-[#141416] p-4">
      {/* Host */}
      <div className="flex-1 text-center">
        <p className="text-sm font-medium text-[#E8E8E8]">{hostName}</p>
        <p className="font-mono text-2xl font-bold text-[#D4A574]">{hostTotal}</p>
      </div>

      {/* Round dots */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs text-[#8B8B8B]">Round {currentRound}/{totalRounds}</p>
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

      {/* Guest */}
      <div className="flex-1 text-center">
        <p className="text-sm font-medium text-[#E8E8E8]">{guestName}</p>
        <p className="font-mono text-2xl font-bold text-[#D4A574]">{guestTotal}</p>
      </div>
    </div>
  );
}
