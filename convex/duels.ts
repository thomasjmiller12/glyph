import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { isValidWord, computeFeedback, getRandomAnswerWord } from "./words";

const MAX_GUESSES_PER_ROUND = 6;

/**
 * Generate a random 6-character alphanumeric code (uppercase).
 */
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── Mutations ────────────────────────────────────────────────────────────

export const createDuel = mutation({
  args: {
    hostName: v.string(),
    sessionId: v.string(),
    mode: v.union(v.literal("same_word"), v.literal("pick_words")),
    totalRounds: v.optional(v.number()),
  },
  handler: async (ctx, { hostName, sessionId, mode, totalRounds }) => {
    let code = generateCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await ctx.db
        .query("duels")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      if (!existing) break;
      code = generateCode();
    }

    const now = Date.now();
    await ctx.db.insert("duels", {
      code,
      mode,
      hostId: sessionId,
      hostName,
      totalRounds: totalRounds ?? 3,
      currentRound: 0,
      status: "waiting",
      createdAt: now,
    });

    return { code };
  },
});

export const joinDuel = mutation({
  args: {
    code: v.string(),
    guestName: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { code, guestName, sessionId }) => {
    const duel = await ctx.db
      .query("duels")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();

    if (!duel) throw new Error("Duel not found.");
    if (duel.status !== "waiting") throw new Error("This duel is no longer accepting players.");
    if (duel.hostId === sessionId) throw new Error("You cannot join your own duel.");

    // Update duel with guest info and set active
    await ctx.db.patch(duel._id, {
      guestId: sessionId,
      guestName,
      status: "active",
      currentRound: 1,
    });

    // Create the first round
    const now = Date.now();
    if (duel.mode === "same_word") {
      const secretWord = getRandomAnswerWord();
      await ctx.db.insert("duel_rounds", {
        duelId: duel._id,
        roundNumber: 1,
        secretWord,
        hostGuesses: 0,
        guestGuesses: 0,
        status: "both_playing",
        createdAt: now,
      });
    } else {
      // pick_words mode: both players need to pick words
      await ctx.db.insert("duel_rounds", {
        duelId: duel._id,
        roundNumber: 1,
        hostGuesses: 0,
        guestGuesses: 0,
        status: "picking",
        createdAt: now,
      });
    }

    return { duelId: duel._id };
  },
});

export const pickWord = mutation({
  args: {
    duelId: v.id("duels"),
    roundNumber: v.number(),
    word: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { duelId, roundNumber, word, sessionId }) => {
    const picked = word.toLowerCase().trim();
    if (picked.length !== 5) throw new Error("Word must be exactly 5 letters.");
    if (!isValidWord(picked)) throw new Error("Not a valid word.");

    const duel = await ctx.db.get(duelId);
    if (!duel) throw new Error("Duel not found.");
    if (duel.status !== "active") throw new Error("Duel is not active.");

    const round = await ctx.db
      .query("duel_rounds")
      .withIndex("by_duel_round", (q) =>
        q.eq("duelId", duelId).eq("roundNumber", roundNumber)
      )
      .first();

    if (!round) throw new Error("Round not found.");
    if (round.status !== "picking") throw new Error("This round is not in the picking phase.");

    const isHost = duel.hostId === sessionId;
    const isGuest = duel.guestId === sessionId;
    if (!isHost && !isGuest) throw new Error("You are not in this duel.");

    const updates: Record<string, unknown> = {};

    if (isHost) {
      if (round.pickedByHost) throw new Error("You already picked a word.");
      updates.pickedByHost = picked;
    } else {
      if (round.pickedByGuest) throw new Error("You already picked a word.");
      updates.pickedByGuest = picked;
    }

    // Check if both have now picked
    const hostPicked = isHost ? picked : round.pickedByHost;
    const guestPicked = isGuest ? picked : round.pickedByGuest;

    if (hostPicked && guestPicked) {
      // In pick_words mode, each player solves the word the OTHER player picked.
      // The "secret word" for the round is set to the guest's pick (host solves it),
      // and we store both. The guess submission logic will use the correct word per player.
      updates.secretWord = guestPicked; // host solves guest's word
      updates.status = "both_playing";
    }

    await ctx.db.patch(round._id, updates);
    return { bothPicked: !!(hostPicked && guestPicked) };
  },
});

export const submitDuelGuess = mutation({
  args: {
    duelId: v.id("duels"),
    roundNumber: v.number(),
    word: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { duelId, roundNumber, word, sessionId }) => {
    const guess = word.toLowerCase().trim();
    if (guess.length !== 5) throw new Error("Guess must be exactly 5 letters.");
    if (!isValidWord(guess)) throw new Error("Not a valid word.");

    const duel = await ctx.db.get(duelId);
    if (!duel) throw new Error("Duel not found.");
    if (duel.status !== "active") throw new Error("Duel is not active.");

    const isHost = duel.hostId === sessionId;
    const isGuest = duel.guestId === sessionId;
    if (!isHost && !isGuest) throw new Error("You are not in this duel.");

    const round = await ctx.db
      .query("duel_rounds")
      .withIndex("by_duel_round", (q) =>
        q.eq("duelId", duelId).eq("roundNumber", roundNumber)
      )
      .first();

    if (!round) throw new Error("Round not found.");
    if (round.status === "picking" || round.status === "pending" || round.status === "completed") {
      throw new Error("This round is not in a playing phase.");
    }

    // Determine which secret word this player is solving
    let targetWord: string;
    if (duel.mode === "same_word") {
      if (!round.secretWord) throw new Error("Round secret word not set.");
      targetWord = round.secretWord;
    } else {
      // pick_words: host solves guest's word, guest solves host's word
      if (isHost) {
        if (!round.pickedByGuest) throw new Error("Opponent hasn't picked a word yet.");
        targetWord = round.pickedByGuest;
      } else {
        if (!round.pickedByHost) throw new Error("Opponent hasn't picked a word yet.");
        targetWord = round.pickedByHost;
      }
    }

    // Get current guess count for this player
    const currentGuesses = isHost ? round.hostGuesses : round.guestGuesses;
    if (currentGuesses >= MAX_GUESSES_PER_ROUND) {
      throw new Error("No more attempts remaining this round.");
    }

    // Compute feedback
    const feedback = computeFeedback(guess, targetWord);
    const isCorrect = feedback.every((f) => f === "correct");
    const newGuessCount = currentGuesses + 1;

    // We store duel guesses in the guesses table using a composite approach.
    // Create a virtual "player" identifier from duel context.
    // For simplicity, store directly in the duel_rounds via guess count, and
    // use a separate storage pattern. We'll create game + player entries for
    // duel rounds to reuse the guesses table.

    // Actually, let's store duel guesses using a convention: we create a "games"
    // entry per duel round is too heavy. Instead, let's just track guess count
    // in the round and return feedback. The client can track guess history locally,
    // and we validate server-side via guess counts.

    // Update guess count and store guess history
    const roundUpdates: Record<string, unknown> = {};
    if (isHost) {
      roundUpdates.hostGuesses = newGuessCount;
      roundUpdates.hostGuessWords = [...(round.hostGuessWords ?? []), guess];
      roundUpdates.hostGuessFeedback = [...(round.hostGuessFeedback ?? []), feedback];
    } else {
      roundUpdates.guestGuesses = newGuessCount;
      roundUpdates.guestGuessWords = [...(round.guestGuessWords ?? []), guess];
      roundUpdates.guestGuessFeedback = [...(round.guestGuessFeedback ?? []), feedback];
    }

    // Determine if this player is done
    const playerDone = isCorrect || newGuessCount >= MAX_GUESSES_PER_ROUND;

    // Determine if opponent is done
    const opponentGuesses = isHost ? round.guestGuesses : round.hostGuesses;
    // We need to check if opponent solved — we can infer from status or track separately.
    // For simplicity, let's track completion via round status transitions.

    if (playerDone) {
      const hostDone = isHost
        ? true
        : round.hostGuesses >= MAX_GUESSES_PER_ROUND || round.status === "guest_playing";
      const guestDone = isGuest
        ? true
        : round.guestGuesses >= MAX_GUESSES_PER_ROUND || round.status === "host_playing";

      if (hostDone && guestDone) {
        roundUpdates.status = "completed";

        // Check if we need to start the next round or complete the duel
        if (roundNumber >= duel.totalRounds) {
          // Duel is over — determine winner
          // Collect all rounds to compute scores
          const allRounds = await ctx.db
            .query("duel_rounds")
            .withIndex("by_duel", (q) => q.eq("duelId", duelId))
            .collect();

          let hostScore = 0;
          let guestScore = 0;
          for (const r of allRounds) {
            const rHostGuesses = r._id === round._id ? (isHost ? newGuessCount : r.hostGuesses) : r.hostGuesses;
            const rGuestGuesses = r._id === round._id ? (isGuest ? newGuessCount : r.guestGuesses) : r.guestGuesses;
            // Lower guesses = better. Player who used fewer guesses wins the round.
            if (rHostGuesses < rGuestGuesses) hostScore++;
            else if (rGuestGuesses < rHostGuesses) guestScore++;
            // tie = no point
          }

          const winnerId =
            hostScore > guestScore
              ? duel.hostId
              : guestScore > hostScore
                ? duel.guestId
                : undefined; // tie

          await ctx.db.patch(duelId, {
            status: "completed",
            currentRound: roundNumber,
            winnerId,
          });
        } else {
          // Start next round
          const nextRound = roundNumber + 1;
          await ctx.db.patch(duelId, { currentRound: nextRound });

          const now = Date.now();
          if (duel.mode === "same_word") {
            const nextWord = getRandomAnswerWord();
            await ctx.db.insert("duel_rounds", {
              duelId,
              roundNumber: nextRound,
              secretWord: nextWord,
              hostGuesses: 0,
              guestGuesses: 0,
              status: "both_playing",
              createdAt: now,
            });
          } else {
            await ctx.db.insert("duel_rounds", {
              duelId,
              roundNumber: nextRound,
              hostGuesses: 0,
              guestGuesses: 0,
              status: "picking",
              createdAt: now,
            });
          }
        }
      } else {
        // One player done, other still playing
        if (isHost) {
          roundUpdates.status = "guest_playing";
        } else {
          roundUpdates.status = "host_playing";
        }
      }
    }

    await ctx.db.patch(round._id, roundUpdates);

    return {
      feedback,
      isCorrect,
      guessNumber: newGuessCount,
      playerDone,
      targetWord: playerDone ? targetWord : undefined,
    };
  },
});

// ── Queries ──────────────────────────────────────────────────────────────

export const getDuel = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const duel = await ctx.db
      .query("duels")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();

    if (!duel) return { duel: null, rounds: [] };

    const rounds = await ctx.db
      .query("duel_rounds")
      .withIndex("by_duel", (q) => q.eq("duelId", duel._id))
      .collect();

    return {
      duel: {
        _id: duel._id,
        code: duel.code,
        mode: duel.mode,
        hostId: duel.hostId,
        hostName: duel.hostName,
        guestId: duel.guestId,
        guestName: duel.guestName,
        totalRounds: duel.totalRounds,
        currentRound: duel.currentRound,
        status: duel.status,
        createdAt: duel.createdAt,
      },
      rounds: rounds.map((r) => ({
        roundNumber: r.roundNumber,
        status: r.status,
        hostGuesses: r.hostGuesses,
        guestGuesses: r.guestGuesses,
        myGuesses: [] as { word: string; feedback: string[] }[],
        myStatus: r.status === "completed" ? "completed" : "playing",
      })),
    };
  },
});

export const getDuelRound = query({
  args: {
    duelId: v.id("duels"),
    roundNumber: v.number(),
    sessionId: v.string(),
  },
  handler: async (ctx, { duelId, roundNumber, sessionId }) => {
    const duel = await ctx.db.get(duelId);
    if (!duel) return null;

    const round = await ctx.db
      .query("duel_rounds")
      .withIndex("by_duel_round", (q) =>
        q.eq("duelId", duelId).eq("roundNumber", roundNumber)
      )
      .first();

    if (!round) return null;

    const isHost = duel.hostId === sessionId;
    const isGuest = duel.guestId === sessionId;
    if (!isHost && !isGuest) return null;

    const myGuesses = isHost ? round.hostGuesses : round.guestGuesses;
    const myDone =
      myGuesses >= MAX_GUESSES_PER_ROUND ||
      round.status === "completed" ||
      (isHost && round.status === "guest_playing") ||
      (isGuest && round.status === "host_playing");

    // Show opponent progress only if round is completed
    const opponentGuesses = round.status === "completed"
      ? (isHost ? round.guestGuesses : round.hostGuesses)
      : undefined;

    // Determine the target word for this player
    let targetWord: string | undefined;
    if (myDone || round.status === "completed") {
      if (duel.mode === "same_word") {
        targetWord = round.secretWord ?? undefined;
      } else {
        targetWord = isHost
          ? round.pickedByGuest ?? undefined
          : round.pickedByHost ?? undefined;
      }
    }

    // Show picked words only after picking phase
    let myPickedWord: string | undefined;
    if (round.status !== "picking") {
      myPickedWord = isHost
        ? round.pickedByHost ?? undefined
        : round.pickedByGuest ?? undefined;
    }

    // Opponent's feedback (colors only, no words) — available live during play
    const opponentFeedback = isHost
      ? (round.guestGuessFeedback ?? [])
      : (round.hostGuessFeedback ?? []);

    return {
      roundNumber: round.roundNumber,
      status: round.status,
      myGuesses,
      opponentGuesses,
      myDone,
      targetWord,
      myPickedWord,
      hasPicked: isHost ? !!round.pickedByHost : !!round.pickedByGuest,
      opponentFeedback,
    };
  },
});

export const getDuelResults = query({
  args: { duelId: v.id("duels") },
  handler: async (ctx, { duelId }) => {
    const duel = await ctx.db.get(duelId);
    if (!duel) return null;

    const rounds = await ctx.db
      .query("duel_rounds")
      .withIndex("by_duel", (q) => q.eq("duelId", duelId))
      .collect();

    let hostScore = 0;
    let guestScore = 0;

    const roundResults = rounds.map((r) => {
      let roundWinner: string | undefined;
      if (r.status === "completed") {
        if (r.hostGuesses < r.guestGuesses) {
          hostScore++;
          roundWinner = duel.hostId;
        } else if (r.guestGuesses < r.hostGuesses) {
          guestScore++;
          roundWinner = duel.guestId;
        }
        // tie: no winner
      }

      return {
        roundNumber: r.roundNumber,
        secretWord: r.secretWord,
        pickedByHost: r.pickedByHost,
        pickedByGuest: r.pickedByGuest,
        hostGuesses: r.hostGuesses,
        guestGuesses: r.guestGuesses,
        hostGuessWords: r.hostGuessWords ?? [],
        hostGuessFeedback: r.hostGuessFeedback ?? [],
        guestGuessWords: r.guestGuessWords ?? [],
        guestGuessFeedback: r.guestGuessFeedback ?? [],
        status: r.status,
        roundWinner,
      };
    });

    return {
      _id: duel._id,
      hostName: duel.hostName,
      guestName: duel.guestName,
      hostId: duel.hostId,
      guestId: duel.guestId,
      totalRounds: duel.totalRounds,
      status: duel.status,
      winnerId: duel.winnerId,
      hostScore,
      guestScore,
      rounds: roundResults,
    };
  },
});
