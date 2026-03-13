export type LetterState = "correct" | "present" | "absent" | "unused";

const PRIORITY: Record<LetterState, number> = {
  correct: 3,
  present: 2,
  absent: 1,
  unused: 0,
};

export function aggregateLetterStates(
  guesses: { word: string; feedback: string[] }[]
): Record<string, LetterState> {
  const states: Record<string, LetterState> = {};
  for (const { word, feedback } of guesses) {
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      const state = feedback[i] as LetterState;
      const current = states[letter] ?? "unused";
      if (PRIORITY[state] > PRIORITY[current]) {
        states[letter] = state;
      }
    }
  }
  return states;
}
