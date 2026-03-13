"use client";

interface StatsCardProps {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
  duelsPlayed: number;
  duelsWon: number;
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-2xl font-bold text-primary">{value}</span>
      <span className="text-xs text-secondary">{label}</span>
    </div>
  );
}

export default function StatsCard({
  gamesPlayed,
  gamesWon,
  currentStreak,
  maxStreak,
  guessDistribution,
  duelsPlayed,
  duelsWon,
}: StatsCardProps) {
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const maxDist = Math.max(...guessDistribution, 1);

  return (
    <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-surface p-6">
      <div className="grid grid-cols-4 gap-2">
        <StatBox label="Played" value={gamesPlayed} />
        <StatBox label="Win %" value={`${winRate}%`} />
        <StatBox label="Streak" value={currentStreak} />
        <StatBox label="Max" value={maxStreak} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-secondary">Guess Distribution</h3>
        <div className="space-y-1">
          {guessDistribution.map((count, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 text-right font-mono text-xs text-secondary">
                {i + 1}
              </span>
              <div
                className="flex h-5 min-w-[20px] items-center justify-end rounded-sm bg-accent px-1.5"
                style={{ width: `${Math.max(8, (count / maxDist) * 100)}%` }}
              >
                <span className="font-mono text-xs font-bold text-background">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {duelsPlayed > 0 && (
        <div className="border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-medium text-secondary">Duels</h3>
          <div className="grid grid-cols-2 gap-2">
            <StatBox label="Played" value={duelsPlayed} />
            <StatBox label="Won" value={duelsWon} />
          </div>
        </div>
      )}
    </div>
  );
}
