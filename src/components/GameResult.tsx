"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ShareButton from "./ShareButton";
import Confetti from "./Confetti";
import { generateShareText } from "@/lib/share";
import Link from "next/link";

interface Guess {
  word: string;
  feedback: string[];
}

interface GameResultProps {
  show: boolean;
  won: boolean;
  secretWord: string;
  guesses: Guess[];
  code: string;
  maxAttempts: number;
  onClose: () => void;
}

export default function GameResult({
  show,
  won,
  secretWord,
  guesses,
  code,
  maxAttempts,
  onClose,
}: GameResultProps) {
  const shareText = generateShareText(code, guesses, won, maxAttempts);

  return (
    <>
      <Confetti show={show && won} />
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-xl border border-[#2A2A2E]/80 bg-[#141416]/90 p-6 text-center shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-md"
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 text-[#8B8B8B] transition-colors hover:text-[#E8E8E8]"
              >
                <X size={20} />
              </button>

              <h2 className="mb-1 text-2xl font-bold text-[#E8E8E8]">
                {won ? "Brilliant!" : "So Close!"}
              </h2>
              <p className="mb-4 text-sm text-[#8B8B8B]">
                {won
                  ? `You got it in ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}!`
                  : `The word was `}
                {!won && (
                  <span className="font-mono font-bold uppercase text-[#D4A574]">
                    {secretWord}
                  </span>
                )}
              </p>

              <div className="mb-6 flex justify-center">
                <ShareButton text={shareText} />
              </div>

              <div className="flex justify-center gap-3">
                <Link
                  href="/"
                  className="rounded-lg border border-[#2A2A2E] px-4 py-2 text-sm text-[#8B8B8B] transition-all hover:border-[#D4A574]/60 hover:text-[#E8E8E8] hover:shadow-[0_0_12px_rgba(212,165,116,0.1)]"
                >
                  New Challenge
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
