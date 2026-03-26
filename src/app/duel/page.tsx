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
  const [pressureTimer, setPressureTimer] = useState(false);
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
        pressureTimer,
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
    <div className="flex min-h-dvh flex-col bg-background">
      <Nav />
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-primary">Duel Mode</h1>
            <p className="text-sm text-secondary">
              Head-to-head. 3 rounds. Fewest guesses wins.
            </p>
          </div>

          {view === "home" && (
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setView("create")}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-accent"
              >
                <div>
                  <p className="font-medium text-primary">Create Duel</p>
                  <p className="text-sm text-secondary">Start a new duel and invite an opponent</p>
                </div>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setView("join")}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-accent"
              >
                <div>
                  <p className="font-medium text-primary">Join Duel</p>
                  <p className="text-sm text-secondary">Enter a code to join an existing duel</p>
                </div>
              </motion.button>
            </div>
          )}

          {view === "create" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <button onClick={() => { setView("home"); setError(""); }} className="text-sm text-secondary hover:text-primary">
                ← Back
              </button>
              <h2 className="text-xl font-bold text-primary">Create Duel</h2>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-primary placeholder-placeholder outline-none focus:border-accent"
                maxLength={20}
              />

              <div className="space-y-2">
                <p className="text-sm text-secondary">Game Mode</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode("same_word")}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                      mode === "same_word"
                        ? "border-accent bg-accent/10 text-primary"
                        : "border-border bg-surface text-secondary"
                    }`}
                  >
                    <p className="font-medium">Same Word</p>
                    <p className="text-xs opacity-70">Both solve the same word</p>
                  </button>
                  <button
                    onClick={() => setMode("pick_words")}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                      mode === "pick_words"
                        ? "border-accent bg-accent/10 text-primary"
                        : "border-border bg-surface text-secondary"
                    }`}
                  >
                    <p className="font-medium">Pick Words</p>
                    <p className="text-xs opacity-70">Choose words for each other</p>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setPressureTimer(!pressureTimer)}
                className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors ${
                  pressureTimer
                    ? "border-accent bg-accent/10 text-primary"
                    : "border-border bg-surface text-secondary"
                }`}
              >
                <div>
                  <p className="font-medium">Pressure Timer</p>
                  <p className="text-xs opacity-70">60s countdown once someone finishes</p>
                </div>
                <div
                  className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
                    pressureTimer ? "bg-accent" : "bg-border"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-primary transition-transform ${
                      pressureTimer ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>

              {error && <p className="text-sm text-red-400">{error}</p>}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                className="w-full rounded-lg bg-accent py-3 font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Duel"}
              </motion.button>
            </motion.div>
          )}

          {view === "join" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <button onClick={() => { setView("home"); setError(""); }} className="text-sm text-secondary hover:text-primary">
                ← Back
              </button>
              <h2 className="text-xl font-bold text-primary">Join Duel</h2>
              <input
                type="text"
                placeholder="Enter duel code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6))}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-center text-2xl uppercase tracking-[0.3em] text-primary placeholder-placeholder outline-none focus:border-accent"
                maxLength={6}
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleJoin}
                disabled={joinCode.length < 4}
                className="w-full rounded-lg bg-accent py-3 font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
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
