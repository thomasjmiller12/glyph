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
import OpponentProgress from "@/components/OpponentProgress";
import DuelRecap from "@/components/DuelRecap";
import InterRoundRecap from "@/components/InterRoundRecap";
import OpponentBoard from "@/components/OpponentBoard";
import DuelChat from "@/components/DuelChat";
import PressureCountdown from "@/components/PressureCountdown";
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
  const duelId = duel?.duel?._id;
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

  // Inter-round recap state
  const [recapRound, setRecapRound] = useState<number | null>(null);

  const isHost = duel?.duel?.hostId === sessionId;
  const isGuest = duel?.duel?.guestId === sessionId;
  const isPlayer = isHost || isGuest;
  const currentRound = duel?.duel?.currentRound ?? 0;
  const isDuelOver = duel?.duel?.status === "completed";

  // Live round data for opponent progress
  const roundData = useQuery(
    api.duels.getDuelRound,
    duelId && currentRound > 0 && isPlayer
      ? { duelId, roundNumber: currentRound, sessionId }
      : "skip"
  );

  // Previous round data for inter-round recap
  const prevRoundData = useQuery(
    api.duels.getDuelRound,
    duelId && recapRound && isPlayer
      ? { duelId, roundNumber: recapRound, sessionId }
      : "skip"
  );

  // Full results for recap when duel is over
  const duelResults = useQuery(
    api.duels.getDuelResults,
    duelId && isDuelOver ? { duelId } : "skip"
  );

  const myGuesses = guessHistory[currentRound] ?? [];
  const letterStates = aggregateLetterStates(myGuesses);
  const isRoundOver = roundDone[currentRound] ?? false;

  const currentRoundData = duel?.rounds?.find(
    (r) => r.roundNumber === currentRound
  );
  const isPicking = currentRoundData?.status === "picking";
  const isPickWords = duel?.duel?.mode === "pick_words";
  const myPickedWord = roundData?.myPickedWord;

  // When round changes, trigger inter-round recap
  const prevRoundRef = useRef(currentRound);
  useEffect(() => {
    if (currentRound !== prevRoundRef.current) {
      const prev = prevRoundRef.current;
      prevRoundRef.current = currentRound;
      setCurrentGuess("");
      // Show recap of the just-completed round (only if it was a real round)
      if (prev > 0 && currentRound > prev) {
        setRecapRound(prev);
      }
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
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
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
      <div className="flex min-h-dvh flex-col bg-background">
        <Nav />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-pulse text-secondary">Loading...</div>
        </div>
      </div>
    );
  }

  if (!duel.duel) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <Nav />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-xl text-primary">Duel not found</p>
        </div>
      </div>
    );
  }

  // Not yet a player - show join form
  if (!isPlayer && duel.duel.status === "waiting") {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <Nav />
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm space-y-4 text-center"
          >
            <h2 className="text-2xl font-bold text-primary">
              {duel.duel.hostName}&apos;s Duel
            </h2>
            <p className="text-sm text-secondary">
              {duel.duel.mode === "same_word" ? "Same Word" : "Pick Words"} · Best of 3
              {duel.duel.pressureTimer && " · Pressure Timer"}
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
              className="w-full rounded-lg bg-accent py-3 font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
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
      <div className="flex min-h-dvh flex-col bg-background">
        <Nav />
        <DuelLobby
          code={code}
          hostName={duel.duel.hostName}
          mode={duel.duel.mode}
          isHost={true}
          pressureTimer={duel.duel.pressureTimer}
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
      <div className="flex min-h-dvh flex-col bg-background">
        <Nav />
        <div className="flex flex-1 flex-col items-center gap-6 px-4 pt-8 pb-8">
          <h2 className="text-3xl font-bold text-primary">Duel Complete!</h2>
          <DuelScoreboard
            hostName={duel.duel.hostName}
            guestName={duel.duel.guestName ?? "Guest"}
            rounds={roundsForScoreboard}
            currentRound={duel.duel.totalRounds}
            totalRounds={duel.duel.totalRounds}
          />
          <p className="text-xl font-bold text-accent">
            {winner === "Tie" ? "It's a tie!" : `${winner} wins!`}
          </p>
          {duelResults && (
            <DuelRecap
              hostName={duelResults.hostName}
              guestName={duelResults.guestName ?? "Guest"}
              hostId={duelResults.hostId}
              rounds={duelResults.rounds}
              mode={duel.duel.mode}
            />
          )}
        </div>
        {duelId && <DuelChat duelId={duelId} sessionId={sessionId} />}
      </div>
    );
  }

  // Picking phase
  if (isPicking) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
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
            <h2 className="mb-2 text-xl font-bold text-primary">Pick a Word</h2>
            <p className="text-sm text-secondary">
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
            className="w-full max-w-xs rounded-lg border border-border bg-surface px-4 py-3 font-mono text-center text-2xl uppercase tracking-widest text-primary placeholder-placeholder outline-none focus:border-accent"
            maxLength={5}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handlePickWord}
            disabled={pickingWord.length !== 5}
            className="rounded-lg bg-accent px-8 py-3 font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Submit Word
          </motion.button>
        </div>
        {duelId && <DuelChat duelId={duelId} sessionId={sessionId} />}
      </div>
    );
  }

  const opponentName = isHost ? (duel.duel.guestName ?? "Guest") : duel.duel.hostName;
  const myName = isHost ? duel.duel.hostName : (duel.duel.guestName ?? "Guest");

  // Inter-round recap screen
  if (recapRound && prevRoundData?.status === "completed" && !isDuelOver) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <Nav />
        <DuelScoreboard
          hostName={duel.duel.hostName}
          guestName={duel.duel.guestName ?? "Guest"}
          rounds={roundsForScoreboard}
          currentRound={currentRound}
          totalRounds={duel.duel.totalRounds}
        />
        <InterRoundRecap
          roundNumber={recapRound}
          targetWord={prevRoundData.targetWord ?? "?????"}
          myName={myName}
          opponentName={opponentName}
          myGuessWords={prevRoundData.myGuessWords ?? []}
          myGuessFeedback={prevRoundData.myGuessFeedback ?? []}
          opponentGuessWords={prevRoundData.opponentGuessWords ?? []}
          opponentGuessFeedback={prevRoundData.opponentGuessFeedback ?? []}
          onDone={() => setRecapRound(null)}
        />
        {duelId && <DuelChat duelId={duelId} sessionId={sessionId} />}
      </div>
    );
  }

  // Playing phase
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Nav />
      <div className="flex flex-1 flex-col items-center px-2 pb-2 pt-2 sm:px-4 sm:pb-4">
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
            className="mt-1 rounded-lg bg-border px-4 py-2 text-sm text-primary"
          >
            {error}
          </motion.div>
        )}

        {isRoundOver ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <p className="text-secondary">Waiting for opponent to finish...</p>
            {roundData?.pressureDeadline && (
              <PressureCountdown deadline={roundData.pressureDeadline} label="for opponent" />
            )}
            <div className="flex items-start gap-8">
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-xs font-medium text-secondary">{myName}</p>
                <GameBoard guesses={myGuesses} currentGuess="" maxAttempts={6} />
              </div>
              {isPickWords && roundData?.opponentGuessWordsLive && roundData.opponentFeedback ? (
                <OpponentBoard
                  opponentName={opponentName}
                  words={roundData.opponentGuessWordsLive}
                  feedback={roundData.opponentFeedback}
                  maxAttempts={6}
                  pickedWord={myPickedWord}
                  alwaysVisible
                />
              ) : roundData?.opponentFeedback && roundData.opponentFeedback.length > 0 ? (
                <OpponentProgress
                  opponentName={opponentName}
                  feedback={roundData.opponentFeedback}
                  maxAttempts={6}
                  alwaysVisible
                />
              ) : null}
            </div>
          </div>
        ) : (
          <>
            {roundData?.pressureDeadline && !isRoundOver && (
              <PressureCountdown deadline={roundData.pressureDeadline} label="remaining" />
            )}
            <div className="flex flex-1 items-center justify-center gap-8">
              <GameBoard guesses={myGuesses} currentGuess={currentGuess} maxAttempts={6} />
              {isPickWords && roundData?.opponentGuessWordsLive && roundData.opponentFeedback ? (
                <OpponentBoard
                  opponentName={opponentName}
                  words={roundData.opponentGuessWordsLive}
                  feedback={roundData.opponentFeedback}
                  maxAttempts={6}
                  pickedWord={myPickedWord}
                />
              ) : roundData?.opponentFeedback && (
                <OpponentProgress
                  opponentName={opponentName}
                  feedback={roundData.opponentFeedback}
                  maxAttempts={6}
                />
              )}
            </div>
            {myPickedWord && isPickWords && (
              <p className="mt-1 text-xs text-secondary">
                You picked: <span className="font-mono uppercase tracking-widest text-accent">{myPickedWord}</span>
              </p>
            )}
            <div className="mt-auto flex w-full justify-center pt-2">
              <Keyboard
                letterStates={letterStates}
                onKey={handleKey}
                disabled={isRoundOver}
              />
            </div>
          </>
        )}
      </div>
      {duelId && <DuelChat duelId={duelId} sessionId={sessionId} />}
    </div>
  );
}
