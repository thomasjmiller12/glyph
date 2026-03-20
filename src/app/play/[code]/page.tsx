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

  // Physical keyboard listener — only active during gameplay
  useEffect(() => {
    if (joinState !== "playing") return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") handleKey("enter");
      else if (e.key === "Backspace") handleKey("backspace");
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toLowerCase());
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey, joinState]);

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
      <div className="flex min-h-dvh flex-col bg-background">
        <Nav />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-pulse text-secondary">Loading...</div>
        </div>
      </div>
    );
  }

  if (!game.game) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <Nav />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-xl text-primary">Game not found</p>
          <p className="text-sm text-secondary">
            This code may be invalid or the game has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Nav />

      {joinState === "creator" && (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm space-y-6 text-center"
          >
            <div>
              <h2 className="text-2xl font-bold text-primary">Your Challenge</h2>
              <p className="mt-1 text-sm text-secondary">
                Share this link with friends to challenge them
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6">
              <p className="mb-1 text-xs text-secondary">Game Code</p>
              <p className="font-mono text-3xl font-bold tracking-[0.2em] text-accent">
                {code}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={copyLink}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 font-semibold text-background transition-all hover:opacity-90 hover:shadow-[0_0_18px_var(--color-accent-glow)]"
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

            <div className="flex items-center justify-center gap-2 text-sm text-secondary">
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
            <h2 className="text-2xl font-bold text-primary">
              {game.game.creatorName}&apos;s Challenge
            </h2>
            <p className="text-sm text-secondary">
              {game.game.creatorName} chose a word for you to guess
            </p>
            <p className="text-xs text-placeholder">
              {game.playerCount} player{game.playerCount !== 1 ? "s" : ""} joined
            </p>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-center text-primary placeholder-placeholder outline-none focus:border-accent"
              maxLength={20}
              autoFocus
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={!name.trim() || joining}
              className="w-full rounded-lg bg-accent py-3 font-semibold text-background transition-all hover:opacity-90 hover:shadow-[0_0_18px_var(--color-accent-glow)] disabled:opacity-50"
            >
              {joining ? "Joining..." : "Play"}
            </motion.button>
          </motion.div>
        </div>
      )}

      {joinState === "playing" && (
        <div className="flex flex-1 flex-col items-center px-2 pb-2 pt-2 sm:px-4 sm:pb-4">
          {/* Header info */}
          <div className="mb-1 text-center">
            <p className="text-xs text-secondary">
              Challenge by {game.game.creatorName}
            </p>
          </div>

          {/* Error toast */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-1 rounded-lg border border-error/50 bg-border/80 px-4 py-2 text-sm text-primary shadow-[0_0_12px_rgba(0,0,0,0.3)] backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Game board — centered in remaining space */}
          <div className="flex flex-1 items-center">
            <GameBoard
              key={shakeKey}
              guesses={guesses}
              currentGuess={currentGuess}
              maxAttempts={game.game.maxAttempts}
              shake={shaking}
            />
          </div>

          {/* Keyboard — pinned to bottom */}
          <div className="mt-auto flex w-full justify-center pt-2">
            <Keyboard
              letterStates={letterStates}
              onKey={handleKey}
              disabled={isGameOver}
            />
          </div>
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
