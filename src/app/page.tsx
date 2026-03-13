"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { ArrowRight, Swords, Plus, Copy, Check } from "lucide-react";
import Nav from "@/components/Nav";
import { getSessionId } from "@/lib/session";

export default function Home() {
  const router = useRouter();
  const createGame = useMutation(api.games.createGame);

  const [mode, setMode] = useState<"home" | "create" | "join" | "created">("home");
  const [name, setName] = useState("");
  const [word, setWord] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    if (!name.trim() || !word.trim()) return;
    if (word.length !== 5) {
      setError("Word must be exactly 5 letters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await createGame({
        creatorName: name.trim(),
        secretWord: word.toLowerCase().trim(),
        sessionId: getSessionId(),
      });
      setCreatedCode(result.code);
      setMode("created");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create game");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/play/${createdCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleJoin() {
    if (!joinCode.trim()) return;
    router.push(`/play/${joinCode.trim().toUpperCase()}`);
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
          {/* Hero */}
          <div className="mb-12 text-center">
            <h1 className="logo-shimmer mb-2 font-mono text-5xl font-bold tracking-tight">
              GLYPH
            </h1>
            <p className="text-lg text-[#8B8B8B]">Five letters. One winner.</p>
          </div>

          {mode === "home" && (
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode("create")}
                className="group flex w-full items-center justify-between rounded-xl border border-[#2A2A2E] bg-[#141416] p-4 text-left transition-all duration-300 hover:border-[#D4A574]/60 hover:shadow-[0_0_20px_rgba(212,165,116,0.12)]"
              >
                <div>
                  <p className="font-medium text-[#E8E8E8]">Create Challenge</p>
                  <p className="text-sm text-[#8B8B8B]">
                    Pick a word for your friends to guess
                  </p>
                </div>
                <Plus size={20} className="text-[#D4A574] transition-transform duration-300 group-hover:scale-110" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode("join")}
                className="group flex w-full items-center justify-between rounded-xl border border-[#2A2A2E] bg-[#141416] p-4 text-left transition-all duration-300 hover:border-[#D4A574]/60 hover:shadow-[0_0_20px_rgba(212,165,116,0.12)]"
              >
                <div>
                  <p className="font-medium text-[#E8E8E8]">Join Game</p>
                  <p className="text-sm text-[#8B8B8B]">
                    Enter a code to play a challenge
                  </p>
                </div>
                <ArrowRight size={20} className="text-[#D4A574] transition-transform duration-300 group-hover:translate-x-0.5" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/duel")}
                className="group flex w-full items-center justify-between rounded-xl border border-[#2A2A2E] bg-[#141416] p-4 text-left transition-all duration-300 hover:border-[#D4A574]/60 hover:shadow-[0_0_20px_rgba(212,165,116,0.12)]"
              >
                <div>
                  <p className="font-medium text-[#E8E8E8]">Duel Mode</p>
                  <p className="text-sm text-[#8B8B8B]">
                    Head-to-head competitive play
                  </p>
                </div>
                <Swords size={20} className="text-[#D4A574] transition-transform duration-300 group-hover:scale-110" />
              </motion.button>
            </div>
          )}

          {mode === "create" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <button
                onClick={() => { setMode("home"); setError(""); }}
                className="text-sm text-[#8B8B8B] hover:text-[#E8E8E8]"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold text-[#E8E8E8]">Create Challenge</h2>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[#2A2A2E] bg-[#141416] px-4 py-3 text-[#E8E8E8] placeholder-[#5A5A5E] outline-none focus:border-[#D4A574]"
                maxLength={20}
              />
              <input
                type="text"
                placeholder="Pick a 5-letter word"
                value={word}
                onChange={(e) => setWord(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 5))}
                className="w-full rounded-lg border border-[#2A2A2E] bg-[#141416] px-4 py-3 font-mono uppercase tracking-widest text-[#E8E8E8] placeholder-[#5A5A5E] outline-none focus:border-[#D4A574]"
                maxLength={5}
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={loading || !name.trim() || word.length !== 5}
                className="w-full rounded-lg bg-[#D4A574] py-3 font-semibold text-[#0A0A0B] transition-all hover:opacity-90 hover:shadow-[0_0_18px_rgba(212,165,116,0.3)] disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create & Share"}
              </motion.button>
            </motion.div>
          )}

          {mode === "join" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <button
                onClick={() => { setMode("home"); setError(""); }}
                className="text-sm text-[#8B8B8B] hover:text-[#E8E8E8]"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold text-[#E8E8E8]">Join Game</h2>
              <input
                type="text"
                placeholder="Enter game code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6))}
                className="w-full rounded-lg border border-[#2A2A2E] bg-[#141416] px-4 py-3 font-mono text-center text-2xl uppercase tracking-[0.3em] text-[#E8E8E8] placeholder-[#5A5A5E] outline-none focus:border-[#D4A574]"
                maxLength={6}
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleJoin}
                disabled={joinCode.length < 4}
                className="w-full rounded-lg bg-[#D4A574] py-3 font-semibold text-[#0A0A0B] transition-all hover:opacity-90 hover:shadow-[0_0_18px_rgba(212,165,116,0.3)] disabled:opacity-50"
              >
                Join
              </motion.button>
            </motion.div>
          )}
          {mode === "created" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div>
                <h2 className="text-xl font-bold text-[#E8E8E8]">Challenge Created!</h2>
                <p className="mt-1 text-sm text-[#8B8B8B]">
                  Share this link with your friends
                </p>
              </div>

              <div className="rounded-xl border border-[#2A2A2E] bg-[#141416] p-6">
                <p className="mb-1 text-xs text-[#8B8B8B]">Game Code</p>
                <p className="font-mono text-3xl font-bold tracking-[0.2em] text-[#D4A574]">
                  {createdCode}
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={copyLink}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4A574] py-3 font-semibold text-[#0A0A0B] transition-all hover:opacity-90 hover:shadow-[0_0_18px_rgba(212,165,116,0.3)]"
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy Challenge Link
                  </>
                )}
              </motion.button>

              <button
                onClick={() => {
                  setMode("home");
                  setWord("");
                  setCreatedCode("");
                }}
                className="text-sm text-[#8B8B8B] hover:text-[#E8E8E8]"
              >
                ← Create Another
              </button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
