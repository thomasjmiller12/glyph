import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    duelId: v.id("duels"),
    sessionId: v.string(),
    body: v.string(),
  },
  handler: async (ctx, { duelId, sessionId, body }) => {
    const trimmed = body.trim();
    if (!trimmed || trimmed.length > 200) return;

    const duel = await ctx.db.get(duelId);
    if (!duel) throw new Error("Duel not found");

    const isHost = duel.hostId === sessionId;
    const isGuest = duel.guestId === sessionId;
    if (!isHost && !isGuest) throw new Error("Not a player in this duel");

    const playerName = isHost ? duel.hostName : (duel.guestName ?? "Guest");

    await ctx.db.insert("duel_messages", {
      duelId,
      sessionId,
      playerName,
      body: trimmed,
      createdAt: Date.now(),
    });
  },
});

export const getMessages = query({
  args: { duelId: v.id("duels") },
  handler: async (ctx, { duelId }) => {
    const messages = await ctx.db
      .query("duel_messages")
      .withIndex("by_duel_time", (q) => q.eq("duelId", duelId))
      .order("desc")
      .take(50);

    return messages.reverse();
  },
});
