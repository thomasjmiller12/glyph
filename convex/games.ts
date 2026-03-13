import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { isValidWord, computeFeedback } from "./words";

/**
 * Generate a random 6-character alphanumeric code (uppercase).
 */
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // omit ambiguous 0/O, 1/I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── Mutations ────────────────────────────────────────────────────────────

export const createGame = mutation({
  args: {
    creatorName: v.string(),
    secretWord: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { creatorName, secretWord, sessionId }) => {
    const word = secretWord.toLowerCase().trim();

    if (word.length !== 5) {
      throw new Error("Secret word must be exactly 5 letters.");
    }
    if (!isValidWord(word)) {
      throw new Error("Secret word is not in the valid word list.");
    }

    // Generate a unique code (retry on unlikely collision)
    let code = generateCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await ctx.db
        .query("games")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      if (!existing) break;
      code = generateCode();
    }

    const now = Date.now();
    const gameId = await ctx.db.insert("games", {
      code,
      secretWord: word,
      creatorName,
      creatorId: sessionId,
      maxAttempts: 6,
      status: "active",
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
      createdAt: now,
    });

    // Create a player entry for the creator
    await ctx.db.insert("players", {
      gameId,
      sessionId,
      name: creatorName,
      joinedAt: now,
    });

    return { code };
  },
});

export const joinGame = mutation({
  args: {
    code: v.string(),
    playerName: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { code, playerName, sessionId }) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();

    if (!game) {
      throw new Error("Game not found.");
    }
    if (game.status !== "active") {
      throw new Error("This game is no longer active.");
    }

    // Check if player already joined
    const existing = await ctx.db
      .query("players")
      .withIndex("by_game_session", (q) =>
        q.eq("gameId", game._id).eq("sessionId", sessionId)
      )
      .first();

    if (existing) {
      return { gameId: game._id, playerId: existing._id };
    }

    const playerId = await ctx.db.insert("players", {
      gameId: game._id,
      sessionId,
      name: playerName,
      joinedAt: Date.now(),
    });

    return { gameId: game._id, playerId };
  },
});

export const submitGuess = mutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
    word: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { gameId, playerId, word, sessionId }) => {
    const guess = word.toLowerCase().trim();

    // Validate game
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found.");
    if (game.status !== "active") throw new Error("Game is no longer active.");

    // Validate player
    const player = await ctx.db.get(playerId);
    if (!player) throw new Error("Player not found.");
    if (player.gameId !== gameId) throw new Error("Player does not belong to this game.");
    if (player.sessionId !== sessionId) throw new Error("Session mismatch.");

    // Validate word
    if (guess.length !== 5) throw new Error("Guess must be exactly 5 letters.");
    if (!isValidWord(guess)) throw new Error("Not a valid word.");

    // Check existing guesses for this player
    const playerGuesses = await ctx.db
      .query("guesses")
      .withIndex("by_game_player", (q) =>
        q.eq("gameId", gameId).eq("playerId", playerId)
      )
      .collect();

    // Check if player already solved or exhausted attempts
    const alreadySolved = playerGuesses.some(
      (g) => g.feedback.every((f) => f === "correct")
    );
    if (alreadySolved) throw new Error("You already solved this word!");

    if (playerGuesses.length >= game.maxAttempts) {
      throw new Error("No more attempts remaining.");
    }

    // Compute feedback
    const feedback = computeFeedback(guess, game.secretWord);
    const isCorrect = feedback.every((f) => f === "correct");
    const guessNumber = playerGuesses.length + 1;

    await ctx.db.insert("guesses", {
      gameId,
      playerId,
      word: guess,
      feedback,
      guessNumber,
      createdAt: Date.now(),
    });

    // Determine if this player is done
    const playerDone = isCorrect || guessNumber >= game.maxAttempts;

    // Check if all players are done
    let isGameOver = false;
    if (playerDone) {
      const allPlayers = await ctx.db
        .query("players")
        .withIndex("by_game", (q) => q.eq("gameId", gameId))
        .collect();

      let allDone = true;
      for (const p of allPlayers) {
        if (p._id === playerId) continue; // current player is done
        const pGuesses = await ctx.db
          .query("guesses")
          .withIndex("by_game_player", (q) =>
            q.eq("gameId", gameId).eq("playerId", p._id)
          )
          .collect();
        const pSolved = pGuesses.some((g) =>
          g.feedback.every((f) => f === "correct")
        );
        const pExhausted = pGuesses.length >= game.maxAttempts;
        if (!pSolved && !pExhausted) {
          allDone = false;
          break;
        }
      }

      if (allDone) {
        await ctx.db.patch(gameId, { status: "completed" });
        isGameOver = true;
      }
    }

    return { feedback, isCorrect, isGameOver };
  },
});

// ── Queries ──────────────────────────────────────────────────────────────

export const getGame = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();

    if (!game) return { game: null, playerCount: 0 };

    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", game._id))
      .collect();

    // Return game info WITHOUT the secret word
    return {
      game: {
        _id: game._id,
        code: game.code,
        creatorName: game.creatorName,
        maxAttempts: game.maxAttempts,
        status: game.status,
        expiresAt: game.expiresAt,
        createdAt: game.createdAt,
      },
      playerCount: players.length,
    };
  },
});

export const getPlayerGame = query({
  args: {
    gameId: v.id("games"),
    sessionId: v.string(),
  },
  handler: async (ctx, { gameId, sessionId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) return null;

    const player = await ctx.db
      .query("players")
      .withIndex("by_game_session", (q) =>
        q.eq("gameId", gameId).eq("sessionId", sessionId)
      )
      .first();

    if (!player) return null;

    const guesses = await ctx.db
      .query("guesses")
      .withIndex("by_game_player", (q) =>
        q.eq("gameId", gameId).eq("playerId", player._id)
      )
      .collect();

    const solved = guesses.some((g) =>
      g.feedback.every((f) => f === "correct")
    );
    const exhausted = guesses.length >= game.maxAttempts;
    const playerDone = solved || exhausted;

    // Only reveal secret word if the player is done
    const secretWord = playerDone ? game.secretWord : undefined;
    const status = solved ? "won" : exhausted ? "lost" : "playing";

    return {
      player: {
        _id: player._id,
        name: player.name,
        joinedAt: player.joinedAt,
      },
      guesses: guesses.map((g) => ({
        word: g.word,
        feedback: g.feedback,
        guessNumber: g.guessNumber,
      })),
      status,
      secretWord,
    };
  },
});
