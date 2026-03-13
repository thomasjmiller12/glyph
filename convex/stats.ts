import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Mutations ────────────────────────────────────────────────────────────

export const recordGameResult = mutation({
  args: {
    sessionId: v.string(),
    won: v.boolean(),
    guessCount: v.number(),
  },
  handler: async (ctx, { sessionId, won, guessCount }) => {
    // Find user by session — look up any player record with this sessionId that
    // has a linked userId.
    const player = await ctx.db
      .query("players")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();

    if (!player?.userId) {
      // No linked user account; skip stats recording.
      return null;
    }

    const userId = player.userId;
    const existing = await ctx.db
      .query("stats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();

    if (existing) {
      const gamesPlayed = existing.gamesPlayed + 1;
      const gamesWon = existing.gamesWon + (won ? 1 : 0);
      const currentStreak = won ? existing.currentStreak + 1 : 0;
      const maxStreak = Math.max(existing.maxStreak, currentStreak);

      // Update guess distribution (index 0 = solved in 1 guess, etc.)
      const guessDistribution = [...existing.guessDistribution];
      if (won && guessCount >= 1 && guessCount <= 6) {
        while (guessDistribution.length < guessCount) {
          guessDistribution.push(0);
        }
        guessDistribution[guessCount - 1]++;
      }

      // Recalculate average guesses
      const totalGuessesFromDist = guessDistribution.reduce(
        (sum, count, idx) => sum + count * (idx + 1),
        0
      );
      const totalWins = guessDistribution.reduce((sum, count) => sum + count, 0);
      const averageGuesses = totalWins > 0 ? totalGuessesFromDist / totalWins : 0;

      await ctx.db.patch(existing._id, {
        gamesPlayed,
        gamesWon,
        currentStreak,
        maxStreak,
        guessDistribution,
        averageGuesses,
        lastPlayedAt: now,
      });
    } else {
      const guessDistribution = [0, 0, 0, 0, 0, 0];
      if (won && guessCount >= 1 && guessCount <= 6) {
        guessDistribution[guessCount - 1] = 1;
      }

      await ctx.db.insert("stats", {
        userId,
        gamesPlayed: 1,
        gamesWon: won ? 1 : 0,
        currentStreak: won ? 1 : 0,
        maxStreak: won ? 1 : 0,
        guessDistribution,
        averageGuesses: won ? guessCount : 0,
        duelsPlayed: 0,
        duelsWon: 0,
        lastPlayedAt: now,
      });
    }
  },
});

export const recordDuelResult = mutation({
  args: {
    sessionId: v.string(),
    won: v.boolean(),
  },
  handler: async (ctx, { sessionId, won }) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();

    if (!player?.userId) {
      return null;
    }

    const userId = player.userId;
    const existing = await ctx.db
      .query("stats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        duelsPlayed: existing.duelsPlayed + 1,
        duelsWon: existing.duelsWon + (won ? 1 : 0),
        lastPlayedAt: now,
      });
    } else {
      await ctx.db.insert("stats", {
        userId,
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0],
        averageGuesses: 0,
        duelsPlayed: 1,
        duelsWon: won ? 1 : 0,
        lastPlayedAt: now,
      });
    }
  },
});

// ── Queries ──────────────────────────────────────────────────────────────

export const getStats = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    // Find a player with this sessionId that has a linked userId
    const player = await ctx.db
      .query("players")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();

    if (!player?.userId) {
      return null;
    }

    const stats = await ctx.db
      .query("stats")
      .withIndex("by_user", (q) => q.eq("userId", player.userId!))
      .first();

    if (!stats) return null;

    return {
      gamesPlayed: stats.gamesPlayed,
      gamesWon: stats.gamesWon,
      currentStreak: stats.currentStreak,
      maxStreak: stats.maxStreak,
      guessDistribution: stats.guessDistribution,
      averageGuesses: stats.averageGuesses,
      duelsPlayed: stats.duelsPlayed,
      duelsWon: stats.duelsWon,
      lastPlayedAt: stats.lastPlayedAt,
      winRate: stats.gamesPlayed > 0
        ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
        : 0,
    };
  },
});
