"use client";

import Nav from "@/components/Nav";
import StatsCard from "@/components/StatsCard";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getSessionId } from "@/lib/session";

export default function StatsPage() {
  const sessionId = typeof window !== "undefined" ? getSessionId() : "";
  const stats = useQuery(api.stats.getStats, sessionId ? { sessionId } : "skip");

  return (
    <div className="flex min-h-dvh flex-col bg-[#0A0A0B]">
      <Nav />
      <main className="flex flex-1 flex-col items-center px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-[#E8E8E8]">Your Stats</h1>
        {stats ? (
          <StatsCard
            gamesPlayed={stats.gamesPlayed}
            gamesWon={stats.gamesWon}
            currentStreak={stats.currentStreak}
            maxStreak={stats.maxStreak}
            guessDistribution={stats.guessDistribution}
            duelsPlayed={stats.duelsPlayed}
            duelsWon={stats.duelsWon}
          />
        ) : (
          <div className="text-center">
            <p className="text-[#8B8B8B]">No stats yet. Play some games!</p>
          </div>
        )}
      </main>
    </div>
  );
}
