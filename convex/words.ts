import { internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { ANSWER_WORDS, VALID_GUESSES } from "./wordlist";

// Combined set for quick lookup
const ALL_VALID_WORDS = new Set([
  ...ANSWER_WORDS,
  ...VALID_GUESSES,
]);

/**
 * Check whether a word is a valid 5-letter guess.
 */
export function isValidWord(word: string): boolean {
  return ALL_VALID_WORDS.has(word.toLowerCase());
}

/**
 * Return a random answer word.
 */
export function getRandomAnswerWord(): string {
  const idx = Math.floor(Math.random() * ANSWER_WORDS.length);
  return ANSWER_WORDS[idx];
}

/**
 * Compute Wordle-style feedback for a guess against a secret word.
 * Returns an array of "correct" | "present" | "absent" for each letter.
 *
 * Handles duplicate letters properly:
 *  1. First pass: mark exact positional matches as "correct" and consume those secret letters.
 *  2. Second pass: for remaining guess letters, if the letter exists in the unconsumed secret
 *     letters, mark "present" and consume it; otherwise mark "absent".
 */
export function computeFeedback(guess: string, secret: string): string[] {
  const g = guess.toLowerCase().split("");
  const s = secret.toLowerCase().split("");
  const feedback: string[] = new Array(5).fill("absent");
  const secretRemaining: (string | null)[] = [...s];

  // First pass: exact matches
  for (let i = 0; i < 5; i++) {
    if (g[i] === s[i]) {
      feedback[i] = "correct";
      secretRemaining[i] = null; // consumed
    }
  }

  // Second pass: present but wrong position
  for (let i = 0; i < 5; i++) {
    if (feedback[i] === "correct") continue;
    const idx = secretRemaining.indexOf(g[i]);
    if (idx !== -1) {
      feedback[i] = "present";
      secretRemaining[idx] = null; // consumed
    }
  }

  return feedback;
}

// ── Convex internal queries ──────────────────────────────────────────────

export const validate = internalQuery({
  args: { word: v.string() },
  handler: async (_ctx, { word }) => {
    return isValidWord(word);
  },
});

export const getRandomWord = internalQuery({
  args: {},
  handler: async () => {
    return getRandomAnswerWord();
  },
});
