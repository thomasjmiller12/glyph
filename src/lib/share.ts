const EMOJI_MAP: Record<string, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛",
};

export function generateEmojiGrid(
  guesses: { feedback: string[] }[]
): string {
  return guesses
    .map((g) => g.feedback.map((f) => EMOJI_MAP[f] ?? "⬛").join(""))
    .join("\n");
}

export function generateShareText(
  code: string,
  guesses: { feedback: string[] }[],
  won: boolean,
  maxAttempts: number
): string {
  const score = won ? `${guesses.length}/${maxAttempts}` : `X/${maxAttempts}`;
  const grid = generateEmojiGrid(guesses);
  return `Glyph ${score}\n\n${grid}\n\nPlay: ${typeof window !== "undefined" ? window.location.origin : ""}/play/${code}`;
}

export async function shareResult(text: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return true;
    } catch {
      // User cancelled or not supported
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
