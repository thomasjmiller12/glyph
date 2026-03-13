import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ~200 common 5-letter answer words. The full Wordle answer list has ~2,300 words;
// expand this array later for full coverage.
const ANSWER_WORDS: string[] = [
  "about", "above", "abuse", "actor", "acute", "admit", "adopt", "adult", "after", "again",
  "agent", "agree", "ahead", "alarm", "album", "alert", "alien", "align", "alike", "alive",
  "alley", "allow", "alone", "along", "alter", "among", "angel", "anger", "angle", "angry",
  "anime", "ankle", "apart", "apple", "apply", "arena", "argue", "arise", "armor", "array",
  "aside", "asset", "attic", "avoid", "awake", "award", "aware", "baker", "basic", "basis",
  "beach", "beard", "beast", "began", "begin", "being", "below", "bench", "berry", "birth",
  "black", "blade", "blame", "blank", "blast", "blaze", "bleed", "blend", "bless", "blind",
  "block", "blood", "bloom", "blown", "blues", "blunt", "board", "boast", "bonus", "boost",
  "bound", "brain", "brand", "brave", "bread", "break", "breed", "brick", "brief", "bring",
  "broad", "broke", "brook", "brown", "brush", "build", "bunch", "burst", "buyer", "cabin",
  "cable", "candy", "carry", "catch", "cause", "chain", "chair", "chalk", "champ", "chaos",
  "charm", "chart", "chase", "cheap", "cheat", "check", "cheek", "cheer", "chess", "chest",
  "chief", "child", "chill", "chord", "chunk", "civic", "claim", "class", "clean", "clear",
  "clerk", "click", "cliff", "climb", "cling", "clock", "clone", "close", "cloth", "cloud",
  "coach", "coast", "color", "comet", "comic", "coral", "count", "court", "cover", "crack",
  "craft", "crane", "crash", "crazy", "cream", "creek", "crime", "crisp", "cross", "crowd",
  "crown", "crude", "crush", "curve", "cycle", "daily", "dance", "debut", "decay", "delay",
  "demon", "depot", "depth", "derby", "devil", "diary", "dirty", "ditch", "dodge", "doubt",
  "dough", "draft", "drain", "drama", "drank", "drape", "dream", "dress", "drift", "drill",
  "drink", "drive", "drove", "dying", "eager", "early", "earth", "eight", "elder", "elect",
  "elite", "empty", "enemy", "enjoy", "enter", "entry", "equal", "error", "essay", "event",
  "every", "exact", "exile", "exist", "extra", "faint", "faith", "fancy", "fatal", "fault",
  "feast", "fence", "fever", "fiber", "field", "fifth", "fifty", "fight", "final", "first",
  "fixed", "flame", "flash", "fleet", "flesh", "float", "flood", "floor", "flour", "fluid",
  "flute", "focus", "force", "forge", "forth", "found", "frame", "frank", "fraud", "fresh",
  "front", "frost", "froze", "fruit", "funny", "ghost", "giant", "given", "glass", "globe",
  "gloom", "glory", "glyph", "going", "grace", "grade", "grain", "grand", "grant", "grape",
  "grasp", "grass", "grave", "great", "greed", "green", "greet", "grief", "grind", "groan",
  "groom", "gross", "group", "grown", "guard", "guess", "guide", "guilt", "habit", "happy",
  "harsh", "haste", "haunt", "heart", "heavy", "hence", "honor", "horse", "hotel", "house",
  "human", "humor", "ideal", "image", "imply", "index", "indie", "inner", "input", "irony",
  "issue", "ivory", "jewel", "joint", "joker", "judge", "juice", "juicy", "karma", "knack",
  "kneel", "knife", "knock", "known", "label", "labor", "laser", "later", "laugh", "layer",
  "learn", "lease", "leave", "legal", "lemon", "level", "light", "limit", "linen", "liver",
  "lobby", "local", "lodge", "logic", "loose", "lover", "lower", "loyal", "lunar",
  "lunch", "magic", "major", "manor", "maple", "march", "marry", "match", "mayor", "media",
  "mercy", "merit", "metal", "might", "minor", "minus", "model", "money", "month", "moral",
  "motor", "mount", "mouse", "mouth", "movie", "music", "naive", "nerve", "never", "night",
  "noble", "noise", "north", "noted", "novel", "nurse", "nylon",
];

// ~500 additional valid guess words (not answers, but accepted guesses).
// The full valid-guess list has ~10,000 words; expand later.
const EXTRA_VALID_GUESSES: string[] = [
  "aahed", "aalii", "abaci", "aback", "abaft", "abase", "abash", "abate", "abbey", "abbot",
  "abhor", "abide", "abler", "abode", "abort", "abyss", "acorn", "acrid", "adage", "added",
  "adder", "adept", "adieu", "adlib", "admin", "adore", "adorn", "aegis", "afoot", "afoul",
  "agape", "agate", "agave", "aging", "aglow", "agony", "aider", "aired", "aisle", "algae",
  "alibi", "allot", "alloy", "aloft", "alpha", "altar", "amber", "amble", "amend", "amiss",
  "amity", "amour", "ample", "amply", "amuse", "angst", "annex", "annoy", "antic", "anvil",
  "aorta", "apnea", "appro", "aptly", "arbor", "ardor", "areal", "atoll", "atone", "audio",
  "audit", "augur", "aunty", "avian", "avoid", "await", "awash", "awful", "axiom", "azure",
  "badge", "badly", "bagel", "baggy", "baked", "balmy", "banal", "banjo", "barge", "baron",
  "basal", "basin", "batch", "baton", "bayou", "beady", "beaks", "beams", "beans", "bears",
  "beech", "beefy", "befit", "began", "belle", "belly", "belts", "bends", "berth", "bezel",
  "bible", "bicep", "bikes", "bilge", "bills", "bingo", "biome", "birch", "bison", "bitty",
  "blare", "bleak", "bleat", "bliss", "blitz", "bloat", "blobs", "bloke", "blond", "blown",
  "bluff", "blurb", "blurt", "blush", "boggy", "bolts", "bonds", "boned", "bones", "books",
  "booth", "boots", "borax", "bored", "borne", "boron", "bossy", "botch", "bowed", "bowel",
  "boxer", "brace", "braid", "brake", "brash", "brass", "brawn", "braze", "bride", "brine",
  "brink", "briny", "brisk", "brits", "broil", "brood", "broth", "brunt", "budge", "buggy",
  "bugle", "bulge", "bulky", "bully", "bumpy", "bunny", "burns", "burps", "bushy", "bylaw",
  "cabal", "cache", "cadet", "cairn", "camel", "cameo", "campo", "canal", "canny", "canoe",
  "caper", "cards", "cargo", "carve", "caste", "caulk", "cease", "cedar", "celeb", "cells",
  "cents", "chafe", "chaff", "chant", "chaps", "chard", "chasm", "chewy", "chick", "chide",
  "china", "chips", "choke", "chomp", "chose", "churn", "cider", "cigar", "cinch", "circa",
  "clack", "clamp", "clams", "clang", "clank", "clash", "clasp", "clave", "claws", "cleat",
  "clerk", "clips", "cloak", "clomp", "clops", "clots", "clout", "clove", "clown", "clubs",
  "cluck", "clued", "clues", "clump", "clung", "coals", "cobra", "cocoa", "coils", "coins",
  "cokes", "colon", "combo", "comma", "conch", "condo", "cones", "cooky", "coped", "copse",
  "cores", "corgi", "corny", "couch", "cough", "could", "coupe", "coups", "covet", "cramp",
  "crank", "crass", "crate", "crave", "crawl", "craze", "creak", "credo", "creed", "creep",
  "creme", "crepe", "crest", "crick", "cried", "cries", "croak", "crock", "crone", "crony",
  "crook", "crops", "croup", "cruds", "cruel", "crumb", "cubic", "cumin", "cupid", "curly",
  "curry", "curse", "cushy", "cutie", "cyber", "cynic", "daddy", "daffy", "dally", "dated",
  "deals", "dealt", "death", "debit", "decal", "decor", "decoy", "decry", "deeds", "deity",
  "delta", "delve", "denim", "dense", "desks", "deter", "detox", "deuce", "diced", "digit",
  "dills", "dimly", "dinar", "diner", "dingy", "diode", "dirge", "disco", "ditto", "ditzy",
  "divan", "diver", "dizzy", "dodge", "dodgy", "dogma", "doing", "dolls", "donor", "donut",
  "dopey", "doses", "dotty", "dowdy", "dowel", "downs", "draco", "drags", "draky", "drawl",
  "drawn", "draws", "dread", "dried", "drier", "drily", "drool", "droop", "drops", "dross",
  "druid", "drums", "drunk", "dryer", "dryly", "ducal", "duchy", "dully", "dummy", "dumps",
  "dunce", "dunes", "dunks", "duped", "dusty", "dwarf", "dwell", "dwelt", "ebbed", "ebony",
  "edged", "edict", "eight", "elfin", "elide", "elope", "elude", "email", "ember", "emcee",
  "emoji", "emote", "ended", "endow", "enema", "enact", "ensue", "envoy", "epoch", "equip",
  "erase", "erode", "erupt", "ether", "ethic", "evade", "evict", "evoke", "ewoks", "exalt",
  "excel", "exert", "expat", "expel",
];

// Combined set for quick lookup
const ALL_VALID_WORDS = new Set([
  ...ANSWER_WORDS,
  ...EXTRA_VALID_GUESSES,
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
