"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import GameBoard from "@/components/GameBoard";
import Keyboard from "@/components/Keyboard";
import DuelLobby from "@/components/DuelLobby";
import DuelScoreboard from "@/components/DuelScoreboard";
import { getSessionId } from "@/lib/session";
import { aggregateLetterStates } from "@/lib/keyboard-state";

interface LocalGuess {
  word: string;
  feedback: string[];
}

export default function DuelGamePage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const sessionId = typeof window !== "undefined" ? getSessionId() : "";

  const duel = useQuery(api.duels.getDuel, { code });
  const joinDuel = useMutation(api.duels.joinDuel);
  const submitDuelGuess = useMutation(api.duels.submitDuelGuess);
  const pickWord = useMutation(api.duels.pickWord);

  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [currentGuess, setCurrentGuess] = useState("");
  const [pickingWord, setPickingWord] = useState("");
  const [error, setError] = useState("");

  // Track guesses client-side per round (keyed by round number)
  const [guessHistory, setGuessHistory] = useState<Record<number, LocalGuess[]>>({});
  const [roundDone, setRoundDone] = useState<Record<number, boolean>>({});

  const isHost = duel?.duel?.hostId === sessionId;
  const isGuest = duel?.duel?.guestId === sessionId;
  const isPlayer = isHost || isGuest;
  const currentRound = duel?.duel?.currentRound ?? 0;
  const isDuelOver = duel?.duel?.status === "completed";

  const myGuesses = guessHistory[currentRound] ?? [];
  const letterStates = aggregateLetterStates(myGuesses);
  const isRoundOver = roundDone[currentRound] ?? false;

  const currentRoundData = duel?.rounds?.find(
    (r) => r.roundNumber === currentRound
  );
  const isPicking = currentRoundData?.status === "picking";

  // Reset guesses when round changes
  const prevRound = useRef(currentRound);
  useEffect(() => {
    if (currentRound !== prevRound.current) {
      prevRound.current = currentRound;
      setCurrentGuess("");
    }
  }, [currentRound]);

  const handleKey = useCallback(
    async (key: string) => {
      if (isRoundOver || isDuelOver || !duel?.duel) return;

      if (key === "backspace") {
        setCurrentGuess((g) => g.slice(0, -1));
        return;
      }

      if (key === "enter") {
        if (currentGuess.length !== 5) {
          setError("Not enough letters");
          setTimeout(() => setError(""), 1500);
          return;
        }
        try {
          setError("");
          const result = await submitDuelGuess({
            duelId: duel.duel._id,
            roundNumber: currentRound,
            word: currentGuess.toLowerCase(),
            sessionId,
          });
          // Store guess locally
          setGuessHistory((prev) => ({
            ...prev,
            [currentRound]: [
              ...(prev[currentRound] ?? []),
              { word: currentGuess.toLowerCase(), feedback: result.feedback },
            ],
          }));
          if (result.playerDone) {
            setRoundDone((prev) => ({ ...prev, [currentRound]: true }));
          }
          setCurrentGuess("");
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Invalid word");
          setTimeout(() => setError(""), 2000);
        }
        return;
      }

      if (/^[a-z]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess((g) => g + key);
      }
    },
    [currentGuess, isRoundOver, isDuelOver, duel, submitDuelGuess, sessionId, currentRound]
  );

  // Physical keyboard — only active during playing phase
  const isPlayingPhase = isPlayer && duel?.duel?.status === "active" && !isPicking;
  useEffect(() => {
    if (!isPlayingPhase) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") handleKey("enter");
      else if (e.key === "Backspace") handleKey("backspace");
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toLowerCase());
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey, isPlayingPhase]);

  async function handleJoin() {
    if (!name.trim()) return;
    setJoining(true);
    try {
      await joinDuel({ code, guestName: name.trim(), sessionId });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to join");
    } finally {
      setJoining(false);
    }
  }

  async function handlePickWord() {
    if (pickingWord.length !== 5 || !duel?.duel) return;
    try {
      await pickWord({
        duelId: duel.duel._id,
        roundNumber: currentRound,
        word: pickingWord.toLowerCase(),
        sessionId,
      });
      setPickingWord("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid word");
      setTimeout(() => setError(""), 2000);
    }
  }

  const roundsForScoreboard = (duel?.rounds ?? []).map((r) => ({
    roundNumber: r.roundNumber,
    hostGuesses: r.hostGuesses,
    guestGuesses: r.guestGuesses,
    status: r.status,
  }));

  if (!duel) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#0A0A0B]">
        <Nav />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-pulse text-[#8B8B8B]">Loading...</div>
        </div>
      </div>
    );
  }

  if (!duel.duel) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#0A0A0B]">
        <Nav />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-xl text-[#E8E8E8]">Duel not found</p>
        </div>
      </div>
    );
  }

  // Not yet a player - show join form
  if (!isPlayer && duel.duel.status === "waiting") {
    return (
      <div className="flex min-h-dvh flex-col bg-[#0A0A0B]">
        <Nav />
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm space-y-4 text-center"
          >
            <h2 className="text-2xl font-bold text-[#E8E8E8]">
              {duel.duel.hostName}&apos;s Duel
            </h2>
            <p className="text-sm text-[#8B8B8B]">
              {duel.duel.mode === "same_word" ? "Same Word" : "Pick Words"} · Best of 3
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
              {joining ? "Joining..." : "Accept Duel"}
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Waiting for opponent (host view)
  if (duel.duel.status === "waiting" && isHost) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#0A0A0B]">
        <Nav />
        <DuelLobby
          code={code}
          hostName={duel.duel.hostName}
          mode={duel.duel.mode}
          isHost={true}
        />
      </div>
    );
  }

  // Duel completed
  if (isDuelOver) {
    const hostTotal = roundsForScoreboard.reduce((s, r) => s + r.hostGuesses, 0);
    const guestTotal = roundsForScoreboard.reduce((s, r) => s + r.guestGuesses, 0);
    const winner =
      hostTotal < guestTotal
        ? duel.duel.hostName
        : hostTotal > guestTotal
          ? duel.duel.guestName
          : "Tie";

    return (
      <div className="flex min-h-dvh flex-col bg-[#0A0A0B]">
        <Nav />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
          <h2 className="text-3xl font-bold text-[#E8E8E8]">Duel Complete!</h2>
          <DuelScoreboard
            hostName={duel.duel.hostName}
            guestName={duel.duel.guestName ?? "Guest"}
            rounds={roundsForScoreboard}
            currentRound={duel.duel.totalRounds}
            totalRounds={duel.duel.totalRounds}
          />
          <p className="text-xl font-bold text-[#D4A574]">
            {winner === "Tie" ? "It's a tie!" : `${winner} wins!`}
          </p>
        </div>
      </div>
    );
  }

  // Picking phase
  if (isPicking) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#0A0A0B]">
        <Nav />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
          <DuelScoreboard
            hostName={duel.duel.hostName}
            guestName={duel.duel.guestName ?? "Guest"}
            rounds={roundsForScoreboard}
            currentRound={currentRound}
            totalRounds={duel.duel.totalRounds}
          />
          <div className="text-center">
            <h2 className="mb-2 text-xl font-bold text-[#E8E8E8]">Pick a Word</h2>
            <p className="text-sm text-[#8B8B8B]">
              Choose a 5-letter word for your opponent to solve
            </p>
          </div>
          <input
            type="text"
            placeholder="Pick a word"
            value={pickingWord}
            onChange={(e) =>
              setPickingWord(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 5))
            }
            className="w-full max-w-xs rounded-lg border border-[#2A2A2E] bg-[#141416] px-4 py-3 font-mono text-center text-2xl uppercase tracking-widest text-[#E8E8E8] placeholder-[#5A5A5E] outline-none focus:border-[#D4A574]"
            maxLength={5}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handlePickWord}
            disabled={pickingWord.length !== 5}
            className="rounded-lg bg-[#D4A574] px-8 py-3 font-semibold text-[#0A0A0B] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Submit Word
          </motion.button>
        </div>
      </div>
    );
  }

  // Playing phase
  return (
    <div className="flex min-h-dvh flex-col bg-[#0A0A0B]">
      <Nav />
      <div className="flex flex-1 flex-col items-center justify-between gap-4 px-4 py-4">
        <DuelScoreboard
          hostName={duel.duel.hostName}
          guestName={duel.duel.guestName ?? "Guest"}
          rounds={roundsForScoreboard}
          currentRound={currentRound}
          totalRounds={duel.duel.totalRounds}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-[#2A2A2E] px-4 py-2 text-sm text-[#E8E8E8]"
          >
            {error}
          </motion.div>
        )}

        {isRoundOver ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[#8B8B8B]">Waiting for opponent to finish...</p>
          </div>
        ) : (
          <>
            <GameBoard guesses={myGuesses} currentGuess={currentGuess} maxAttempts={6} />
            <Keyboard
              letterStates={letterStates}
              onKey={handleKey}
              disabled={isRoundOver}
            />
          </>
        )}
      </div>
    </div>
  );
}
