"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Copy, Check, Users } from "lucide-react";
import Nav from "@/components/Nav";
import GameBoard from "@/components/GameBoard";
import Keyboard from "@/components/Keyboard";
import GameResult from "@/components/GameResult";
import { getSessionId } from "@/lib/session";
import { aggregateLetterStates } from "@/lib/keyboard-state";
import type { Id } from "../../../../convex/_generated/dataModel";

type JoinState = "loading" | "name_entry" | "playing" | "creator";

export default function PlayPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const sessionId = typeof window !== "undefined" ? getSessionId() : "";

  const game = useQuery(api.games.getGame, { code });
  const playerGame = useQuery(
    api.games.getPlayerGame,
    sessionId ? { gameId: game?.game?._id as Id<"games">, sessionId } : "skip"
  );

  const joinGame = useMutation(api.games.joinGame);
  const submitGuess = useMutation(api.games.submitGuess);

  const [joinState, setJoinState] = useState<JoinState>("loading");
  const [name, setName] = useState("");
  const [currentGuess, setCurrentGuess] = useState("");
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [joining, setJoining] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  const isCreator = game?.game?.creatorId === sessionId;

  // Determine join state
  useEffect(() => {
    if (!game) return;
    if (isCreator) {
      setJoinState("creator");
    } else if (playerGame?.player) {
      setJoinState("playing");
    } else {
      setJoinState("name_entry");
    }
  }, [game, playerGame, isCreator]);

  async function copyLink() {
    const url = `${window.location.origin}/play/${code}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const guesses = playerGame?.guesses ?? [];
  const isGameOver =
    playerGame?.status === "won" || playerGame?.status === "lost";
  const letterStates = aggregateLetterStates(guesses);

  // Show result modal when game ends
  useEffect(() => {
    if (isGameOver && guesses.length > 0) {
      const timer = setTimeout(() => setShowResult(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isGameOver, guesses.length]);

  const handleKey = useCallback(
    async (key: string) => {
      if (isGameOver) return;

      if (key === "backspace") {
        setCurrentGuess((g) => g.slice(0, -1));
        return;
      }

      if (key === "enter") {
        if (currentGuess.length !== 5) {
          setError("Not enough letters");
          setShaking(true);
          setShakeKey((k) => k + 1);
          setTimeout(() => { setError(""); setShaking(false); }, 1500);
          return;
        }
        if (!playerGame?.player) return;

        try {
          setError("");
          await submitGuess({
            gameId: game!.game!._id,
            playerId: playerGame.player._id,
            word: currentGuess.toLowerCase(),
            sessionId,
          });
          setCurrentGuess("");
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "";
          const friendly = msg.includes("Not a valid word")
            ? "Not in word list"
            : msg.includes("already solved")
              ? "Already solved!"
              : msg.includes("No more attempts")
                ? "No attempts left"
                : "Not in word list";
          setError(friendly);
          setShaking(true);
          setShakeKey((k) => k + 1);
          setTimeout(() => { setError(""); setShaking(false); }, 1500);
        }
        return;
      }

      if (/^[a-z]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess((g) => g + key);
      }
    },
    [currentGuess, isGameOver, playerGame, game, submitGuess, sessionId]
  );

  // Physical keyboard listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") handleKey("enter");
      else if (e.key === "Backspace") handleKey("backspace");
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toLowerCase());
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  async function handleJoin() {
    if (!name.trim()) return;
    setJoining(true);
    try {
      await joinGame({
        code,
        playerName: name.trim(),
        sessionId,
      });
      setJoinState("playing");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to join");
    } finally {
      setJoining(false);
    }
  }

  if (!game) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#0A0A0B]">
        <Nav />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-pulse text-[#8B8B8B]">Loading...</div>
        </div>
      </div>
    );
  }

  if (!game.game) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#0A0A0B]">
        <Nav />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-xl text-[#E8E8E8]">Game not found</p>
          <p className="text-sm text-[#8B8B8B]">
            This code may be invalid or the game has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#0A0A0B]">
      <Nav />

      {joinState === "creator" && (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm space-y-6 text-center"
          >
            <div>
              <h2 className="text-2xl font-bold text-[#E8E8E8]">Your Challenge</h2>
              <p className="mt-1 text-sm text-[#8B8B8B]">
                Share this link with friends to challenge them
              </p>
            </div>

            <div className="rounded-xl border border-[#2A2A2E] bg-[#141416] p-6">
              <p className="mb-1 text-xs text-[#8B8B8B]">Game Code</p>
              <p className="font-mono text-3xl font-bold tracking-[0.2em] text-[#D4A574]">
                {code}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={copyLink}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4A574] py-3 font-semibold text-[#0A0A0B] transition-opacity hover:opacity-90"
            >
              {linkCopied ? (
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

            <div className="flex items-center justify-center gap-2 text-sm text-[#8B8B8B]">
              <Users size={16} />
              <span>
                {game.playerCount} player{game.playerCount !== 1 ? "s" : ""} joined
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {joinState === "name_entry" && (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm space-y-4 text-center"
          >
            <h2 className="text-2xl font-bold text-[#E8E8E8]">
              {game.game.creatorName}&apos;s Challenge
            </h2>
            <p className="text-sm text-[#8B8B8B]">
              {game.game.creatorName} chose a word for you to guess
            </p>
            <p className="text-xs text-[#5A5A5E]">
              {game.playerCount} player{game.playerCount !== 1 ? "s" : ""} joined
            </p>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              className="w-full rounded-lg border border-[#2A2A2E] bg-[#141416] px-4 py-3 text-center text-[#E8E8E8] placeholder-[#5A5A5E] outline-none focus:border-[#D4A574]"
              maxLength={20}
              autoFocus
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={!name.trim() || joining}
              className="w-full rounded-lg bg-[#D4A574] py-3 font-semibold text-[#0A0A0B] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {joining ? "Joining..." : "Play"}
            </motion.button>
          </motion.div>
        </div>
      )}

      {joinState === "playing" && (
        <div className="flex flex-1 flex-col items-center justify-between gap-4 px-4 py-4">
          {/* Header info */}
          <div className="text-center">
            <p className="text-xs text-[#8B8B8B]">
              Challenge by {game.game.creatorName}
            </p>
          </div>

          {/* Error toast */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg bg-[#2A2A2E] px-4 py-2 text-sm text-[#E8E8E8]"
            >
              {error}
            </motion.div>
          )}

          {/* Game board */}
          <GameBoard
            key={shakeKey}
            guesses={guesses}
            currentGuess={currentGuess}
            maxAttempts={game.game.maxAttempts}
            shake={shaking}
          />

          {/* Keyboard */}
          <Keyboard
            letterStates={letterStates}
            onKey={handleKey}
            disabled={isGameOver}
          />
        </div>
      )}

      {/* Result modal */}
      {isGameOver && playerGame?.secretWord && (
        <GameResult
          show={showResult}
          won={playerGame.status === "won"}
          secretWord={playerGame.secretWord}
          guesses={guesses}
          code={code}
          maxAttempts={game.game.maxAttempts}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  );
}
