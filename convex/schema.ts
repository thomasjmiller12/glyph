import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    code: v.string(),
    secretWord: v.string(),
    creatorName: v.string(),
    creatorId: v.string(),
    maxAttempts: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("expired")),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_creator", ["creatorId"])
    .index("by_status", ["status"]),

  players: defineTable({
    gameId: v.id("games"),
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
    name: v.string(),
    joinedAt: v.number(),
  })
    .index("by_game", ["gameId"])
    .index("by_session", ["sessionId"])
    .index("by_game_session", ["gameId", "sessionId"]),

  guesses: defineTable({
    gameId: v.id("games"),
    playerId: v.id("players"),
    word: v.string(),
    feedback: v.array(v.string()),
    guessNumber: v.number(),
    createdAt: v.number(),
  })
    .index("by_game_player", ["gameId", "playerId"])
    .index("by_player", ["playerId"]),

  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    authProvider: v.optional(v.string()),
    createdAt: v.number(),
  }),

  stats: defineTable({
    userId: v.id("users"),
    gamesPlayed: v.number(),
    gamesWon: v.number(),
    currentStreak: v.number(),
    maxStreak: v.number(),
    guessDistribution: v.array(v.number()),
    averageGuesses: v.number(),
    duelsPlayed: v.number(),
    duelsWon: v.number(),
    lastPlayedAt: v.number(),
  }).index("by_user", ["userId"]),

  duels: defineTable({
    code: v.string(),
    mode: v.union(v.literal("same_word"), v.literal("pick_words")),
    hostId: v.string(),
    hostName: v.string(),
    guestId: v.optional(v.string()),
    guestName: v.optional(v.string()),
    totalRounds: v.number(),
    currentRound: v.number(),
    status: v.union(
      v.literal("waiting"),
      v.literal("active"),
      v.literal("completed")
    ),
    winnerId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_status", ["status"])
    .index("by_host", ["hostId"]),

  duel_rounds: defineTable({
    duelId: v.id("duels"),
    roundNumber: v.number(),
    secretWord: v.optional(v.string()),
    pickedByHost: v.optional(v.string()),
    pickedByGuest: v.optional(v.string()),
    hostGuesses: v.number(),
    guestGuesses: v.number(),
    status: v.union(
      v.literal("picking"),
      v.literal("pending"),
      v.literal("host_playing"),
      v.literal("guest_playing"),
      v.literal("both_playing"),
      v.literal("completed")
    ),
    createdAt: v.number(),
  })
    .index("by_duel", ["duelId"])
    .index("by_duel_round", ["duelId", "roundNumber"]),
});
