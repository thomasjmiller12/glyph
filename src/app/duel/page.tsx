"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import { getSessionId } from "@/lib/session";

export default function DuelPage() {
  const router = useRouter();
  const createDuel = useMutation(api.duels.createDuel);

  const [view, setView] = useState<"home" | "create" | "join">("home");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"same_word" | "pick_words">("same_word");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await createDuel({
        hostName: name.trim(),
        sessionId: getSessionId(),
        mode,
      });
      router.push(`/duel/${result.code}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create duel");
    } finally {
      setLoading(false);
    }
  }

  function handleJoin() {
    if (!joinCode.trim()) return;
    router.push(`/duel/${joinCode.trim().toUpperCase()}`);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#0A0A0B]">
      <Nav />
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-[#E8E8E8]">Duel Mode</h1>
            <p className="text-sm text-[#8B8B8B]">
              Head-to-head. 3 rounds. Fewest guesses wins.
            </p>
          </div>

          {view === "home" && (
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setView("create")}
                className="flex w-full items-center justify-between rounded-xl border border-[#2A2A2E] bg-[#141416] p-4 text-left transition-colors hover:border-[#D4A574]"
              >
                <div>
                  <p className="font-medium text-[#E8E8E8]">Create Duel</p>
                  <p className="text-sm text-[#8B8B8B]">Start a new duel and invite an opponent</p>
                </div>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setView("join")}
                className="flex w-full items-center justify-between rounded-xl border border-[#2A2A2E] bg-[#141416] p-4 text-left transition-colors hover:border-[#D4A574]"
              >
                <div>
                  <p className="font-medium text-[#E8E8E8]">Join Duel</p>
                  <p className="text-sm text-[#8B8B8B]">Enter a code to join an existing duel</p>
                </div>
              </motion.button>
            </div>
          )}

          {view === "create" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <button onClick={() => { setView("home"); setError(""); }} className="text-sm text-[#8B8B8B] hover:text-[#E8E8E8]">
                ← Back
              </button>
              <h2 className="text-xl font-bold text-[#E8E8E8]">Create Duel</h2>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[#2A2A2E] bg-[#141416] px-4 py-3 text-[#E8E8E8] placeholder-[#5A5A5E] outline-none focus:border-[#D4A574]"
                maxLength={20}
              />

              <div className="space-y-2">
                <p className="text-sm text-[#8B8B8B]">Game Mode</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode("same_word")}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                      mode === "same_word"
                        ? "border-[#D4A574] bg-[#D4A574]/10 text-[#E8E8E8]"
                        : "border-[#2A2A2E] bg-[#141416] text-[#8B8B8B]"
                    }`}
                  >
                    <p className="font-medium">Same Word</p>
                    <p className="text-xs opacity-70">Both solve the same word</p>
                  </button>
                  <button
                    onClick={() => setMode("pick_words")}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                      mode === "pick_words"
                        ? "border-[#D4A574] bg-[#D4A574]/10 text-[#E8E8E8]"
                        : "border-[#2A2A2E] bg-[#141416] text-[#8B8B8B]"
                    }`}
                  >
                    <p className="font-medium">Pick Words</p>
                    <p className="text-xs opacity-70">Choose words for each other</p>
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                className="w-full rounded-lg bg-[#D4A574] py-3 font-semibold text-[#0A0A0B] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Duel"}
              </motion.button>
            </motion.div>
          )}

          {view === "join" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <button onClick={() => { setView("home"); setError(""); }} className="text-sm text-[#8B8B8B] hover:text-[#E8E8E8]">
                ← Back
              </button>
              <h2 className="text-xl font-bold text-[#E8E8E8]">Join Duel</h2>
              <input
                type="text"
                placeholder="Enter duel code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6))}
                className="w-full rounded-lg border border-[#2A2A2E] bg-[#141416] px-4 py-3 font-mono text-center text-2xl uppercase tracking-[0.3em] text-[#E8E8E8] placeholder-[#5A5A5E] outline-none focus:border-[#D4A574]"
                maxLength={6}
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleJoin}
                disabled={joinCode.length < 4}
                className="w-full rounded-lg bg-[#D4A574] py-3 font-semibold text-[#0A0A0B] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Join
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
