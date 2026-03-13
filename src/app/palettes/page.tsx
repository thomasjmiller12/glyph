"use client";

import { useState } from "react";

interface Palette {
  name: string;
  description: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  correct: string;
  present: string;
  absent: string;
  absentText: string;
  keyBg: string;
}

const PALETTES: Palette[] = [
  {
    name: "Warm Gold (Current)",
    description: "Dark with warm gold accent — cozy and premium",
    bg: "#0A0A0B",
    surface: "#141416",
    border: "#2A2A2E",
    text: "#E8E8E8",
    muted: "#8B8B8B",
    accent: "#D4A574",
    correct: "#6BCB77",
    present: "#D4A574",
    absent: "#3A3A3E",
    absentText: "#8B8B8B",
    keyBg: "#4A4A4E",
  },
  {
    name: "Midnight Sapphire",
    description: "Deep navy with electric blue — techy and sleek",
    bg: "#0B0E17",
    surface: "#111827",
    border: "#1E293B",
    text: "#E2E8F0",
    muted: "#94A3B8",
    accent: "#60A5FA",
    correct: "#34D399",
    present: "#60A5FA",
    absent: "#1E293B",
    absentText: "#64748B",
    keyBg: "#334155",
  },
  {
    name: "Emerald Night",
    description: "Rich dark with green jewel tones — elegant",
    bg: "#0A0F0D",
    surface: "#111C18",
    border: "#1A2E26",
    text: "#E0EDE8",
    muted: "#7DA396",
    accent: "#4ADE80",
    correct: "#4ADE80",
    present: "#FBBF24",
    absent: "#1A2E26",
    absentText: "#5B7A6E",
    keyBg: "#2D4A3E",
  },
  {
    name: "Rose Quartz",
    description: "Warm pink on dark charcoal — soft and inviting",
    bg: "#0F0A0C",
    surface: "#1A1215",
    border: "#2E2028",
    text: "#F0E4E8",
    muted: "#A3838F",
    accent: "#F472B6",
    correct: "#6BCB77",
    present: "#F472B6",
    absent: "#2E2028",
    absentText: "#8A6B76",
    keyBg: "#4A3542",
  },
  {
    name: "Arctic Ice",
    description: "Cool grays with icy blue highlights — crisp and clean",
    bg: "#0C0E12",
    surface: "#141820",
    border: "#242A36",
    text: "#E4E8EE",
    muted: "#8892A4",
    accent: "#7DD3FC",
    correct: "#86EFAC",
    present: "#7DD3FC",
    absent: "#242A36",
    absentText: "#5E6B80",
    keyBg: "#3A4256",
  },
  {
    name: "Sunset Blaze",
    description: "Fiery coral and orange — bold and energetic",
    bg: "#0D0907",
    surface: "#1A120D",
    border: "#2E1E15",
    text: "#F5E6DA",
    muted: "#B08C74",
    accent: "#FB923C",
    correct: "#6BCB77",
    present: "#FB923C",
    absent: "#2E1E15",
    absentText: "#8B7060",
    keyBg: "#4D3828",
  },
  {
    name: "Neon Cyber",
    description: "Cyberpunk magenta on near-black — vibrant and edgy",
    bg: "#08060D",
    surface: "#110E1A",
    border: "#21183A",
    text: "#EDE4F5",
    muted: "#9B8AB0",
    accent: "#D946EF",
    correct: "#4ADE80",
    present: "#D946EF",
    absent: "#21183A",
    absentText: "#6F5C88",
    keyBg: "#382A55",
  },
  {
    name: "Earth & Clay",
    description: "Terracotta and warm stone — grounded and organic",
    bg: "#0E0B08",
    surface: "#1A1510",
    border: "#2E2720",
    text: "#E8E0D4",
    muted: "#A09482",
    accent: "#C2703E",
    correct: "#7CB86A",
    present: "#C2703E",
    absent: "#2E2720",
    absentText: "#7A6E60",
    keyBg: "#4A4030",
  },
  {
    name: "Lavender Dream",
    description: "Soft purple on deep plum — whimsical and calm",
    bg: "#0B0A10",
    surface: "#14121E",
    border: "#252234",
    text: "#E8E4F0",
    muted: "#9B94B0",
    accent: "#A78BFA",
    correct: "#6BCB77",
    present: "#A78BFA",
    absent: "#252234",
    absentText: "#706A88",
    keyBg: "#3A3458",
  },
  {
    name: "Mint Fresh",
    description: "Teal/mint on deep sea — refreshing and modern",
    bg: "#080D0C",
    surface: "#0F1A18",
    border: "#182E2A",
    text: "#E0F0EC",
    muted: "#7EB0A5",
    accent: "#2DD4BF",
    correct: "#2DD4BF",
    present: "#FBBF24",
    absent: "#182E2A",
    absentText: "#5A8A7E",
    keyBg: "#264A44",
  },
  {
    name: "Crimson Edge",
    description: "Bold red accent on charcoal — intense and competitive",
    bg: "#0C0808",
    surface: "#181010",
    border: "#301818",
    text: "#F0E4E4",
    muted: "#B08888",
    accent: "#EF4444",
    correct: "#4ADE80",
    present: "#EF4444",
    absent: "#301818",
    absentText: "#8A5A5A",
    keyBg: "#4A2828",
  },
  {
    name: "Ocean Depth",
    description: "Deep aqua on dark teal — immersive and mysterious",
    bg: "#060C10",
    surface: "#0C161C",
    border: "#152838",
    text: "#D8EAF4",
    muted: "#6B9AB8",
    accent: "#22D3EE",
    correct: "#6BCB77",
    present: "#22D3EE",
    absent: "#152838",
    absentText: "#4A7890",
    keyBg: "#1E3A50",
  },
  {
    name: "Amber Glow",
    description: "Rich honey amber on espresso — luxurious warmth",
    bg: "#0D0A06",
    surface: "#18140C",
    border: "#2E2818",
    text: "#F0E8D8",
    muted: "#B0A080",
    accent: "#F59E0B",
    correct: "#4ADE80",
    present: "#F59E0B",
    absent: "#2E2818",
    absentText: "#8A7A58",
    keyBg: "#4A4020",
  },
  {
    name: "Monochrome Slate",
    description: "Pure grayscale with hint of blue — minimal and sharp",
    bg: "#0A0B0D",
    surface: "#131518",
    border: "#252830",
    text: "#E0E2E8",
    muted: "#888C96",
    accent: "#CBD5E1",
    correct: "#86EFAC",
    present: "#CBD5E1",
    absent: "#252830",
    absentText: "#5C6070",
    keyBg: "#3A3E4A",
  },
  {
    name: "Forest Canopy",
    description: "Deep woodland green — natural and serene",
    bg: "#070B08",
    surface: "#0E1610",
    border: "#182818",
    text: "#DCE8DC",
    muted: "#7AA07A",
    accent: "#6BD488",
    correct: "#6BD488",
    present: "#E8C44A",
    absent: "#182818",
    absentText: "#567856",
    keyBg: "#2A4A2A",
  },
  {
    name: "Coral Reef",
    description: "Peachy coral on deep blue-gray — tropical warmth",
    bg: "#0A0A10",
    surface: "#141420",
    border: "#242430",
    text: "#F0E8E4",
    muted: "#A09498",
    accent: "#FF8A80",
    correct: "#4ADE80",
    present: "#FF8A80",
    absent: "#242430",
    absentText: "#787080",
    keyBg: "#3A3548",
  },
  {
    name: "Royal Grape",
    description: "Deep purple on near-black — regal and dramatic",
    bg: "#0A080E",
    surface: "#15101E",
    border: "#281E3E",
    text: "#E8E0F4",
    muted: "#A090BC",
    accent: "#8B5CF6",
    correct: "#6BCB77",
    present: "#8B5CF6",
    absent: "#281E3E",
    absentText: "#6A5888",
    keyBg: "#3A2D58",
  },
  {
    name: "Solar Flare",
    description: "Bright yellow-gold on dark — radiant and bold",
    bg: "#0C0A06",
    surface: "#161410",
    border: "#2A2818",
    text: "#F0ECD8",
    muted: "#B0A878",
    accent: "#FACC15",
    correct: "#4ADE80",
    present: "#FACC15",
    absent: "#2A2818",
    absentText: "#8A8058",
    keyBg: "#4A4420",
  },
  {
    name: "Blush & Bone",
    description: "Muted pink on warm off-black — refined and delicate",
    bg: "#0E0C0B",
    surface: "#1A1716",
    border: "#2E2A28",
    text: "#EDE6E2",
    muted: "#A89A94",
    accent: "#E8A0A0",
    correct: "#6BCB77",
    present: "#E8A0A0",
    absent: "#2E2A28",
    absentText: "#887870",
    keyBg: "#48403A",
  },
  {
    name: "Lime Zest",
    description: "Electric lime on charcoal — fresh and playful",
    bg: "#090C08",
    surface: "#111610",
    border: "#1E2A18",
    text: "#E4EEE0",
    muted: "#88A880",
    accent: "#A3E635",
    correct: "#A3E635",
    present: "#FBBF24",
    absent: "#1E2A18",
    absentText: "#5E7858",
    keyBg: "#304828",
  },
  {
    name: "Ivory Light",
    description: "Light mode — cream background, dark text, warm tones",
    bg: "#FAFAF5",
    surface: "#FFFFFF",
    border: "#E0DDD5",
    text: "#1A1A18",
    muted: "#6B6B65",
    accent: "#C67B3C",
    correct: "#22863A",
    present: "#C67B3C",
    absent: "#D5D2CB",
    absentText: "#8A8880",
    keyBg: "#E8E5DD",
  },
  {
    name: "Paper White",
    description: "Clean light mode — white with blue accent — corporate clean",
    bg: "#F8F9FB",
    surface: "#FFFFFF",
    border: "#E2E4E8",
    text: "#111318",
    muted: "#6C7080",
    accent: "#3B82F6",
    correct: "#16A34A",
    present: "#3B82F6",
    absent: "#E2E4E8",
    absentText: "#9CA0AB",
    keyBg: "#E8EAEF",
  },
  {
    name: "Warm Paper",
    description: "Light mode with warm peach accent — cozy daylight",
    bg: "#FBF8F4",
    surface: "#FFFFFF",
    border: "#E8E0D8",
    text: "#1C1810",
    muted: "#7A7060",
    accent: "#E07840",
    correct: "#2D9D4E",
    present: "#E07840",
    absent: "#E0DCD5",
    absentText: "#A09888",
    keyBg: "#EDE8E0",
  },
  // ── Creative & Unusual ──
  {
    name: "Vaporwave",
    description: "Hot pink meets cyan on deep purple — retro-futuristic",
    bg: "#0D0620",
    surface: "#150C30",
    border: "#2A1850",
    text: "#F0E0FF",
    muted: "#B090D0",
    accent: "#FF6EC7",
    correct: "#00FFD1",
    present: "#FF6EC7",
    absent: "#2A1850",
    absentText: "#6A4A90",
    keyBg: "#3D2468",
  },
  {
    name: "Brutalist",
    description: "Raw concrete gray with neon orange signal — industrial",
    bg: "#1A1A1A",
    surface: "#242424",
    border: "#3A3A3A",
    text: "#D0D0D0",
    muted: "#808080",
    accent: "#FF5500",
    correct: "#00FF66",
    present: "#FF5500",
    absent: "#333333",
    absentText: "#666666",
    keyBg: "#4A4A4A",
  },
  {
    name: "Matcha Latte",
    description: "Creamy warm neutrals with matcha green — cafe aesthetic",
    bg: "#F5F0E8",
    surface: "#FFFDF8",
    border: "#DDD5C5",
    text: "#2C2820",
    muted: "#8A8070",
    accent: "#5B8A3C",
    correct: "#5B8A3C",
    present: "#D4943C",
    absent: "#E0D8CA",
    absentText: "#A09880",
    keyBg: "#E8E0D0",
  },
  {
    name: "Northern Lights",
    description: "Aurora teal-to-green on arctic dark — ethereal glow",
    bg: "#050810",
    surface: "#0A1018",
    border: "#142030",
    text: "#D0E8F0",
    muted: "#6090A8",
    accent: "#00E5A0",
    correct: "#00E5A0",
    present: "#A070FF",
    absent: "#142030",
    absentText: "#3A6080",
    keyBg: "#1A3048",
  },
  {
    name: "Blood Moon",
    description: "Deep crimson and burnt sienna on void black — ominous",
    bg: "#0A0506",
    surface: "#140A0C",
    border: "#2A1418",
    text: "#F0D0D0",
    muted: "#A06060",
    accent: "#CC3333",
    correct: "#55CC55",
    present: "#CC3333",
    absent: "#2A1418",
    absentText: "#804040",
    keyBg: "#3A1E24",
  },
  {
    name: "Bubblegum Pop",
    description: "Candy pink on soft lavender-white — cheerful and fun",
    bg: "#F8F0FA",
    surface: "#FFFFFF",
    border: "#E8D8F0",
    text: "#2A1830",
    muted: "#8870A0",
    accent: "#E040A0",
    correct: "#30B860",
    present: "#E040A0",
    absent: "#E0D5E8",
    absentText: "#A090B0",
    keyBg: "#EDE0F4",
  },
  {
    name: "Copper Patina",
    description: "Oxidized copper green with warm bronze — aged elegance",
    bg: "#080C0A",
    surface: "#101814",
    border: "#1C2E24",
    text: "#D8E8DC",
    muted: "#7AA088",
    accent: "#C08050",
    correct: "#50C878",
    present: "#C08050",
    absent: "#1C2E24",
    absentText: "#5A8068",
    keyBg: "#2A4834",
  },
  {
    name: "Tokyo Neon",
    description: "Electric blue and hot pink on jet black — nightlife energy",
    bg: "#05050A",
    surface: "#0C0C18",
    border: "#1A1A35",
    text: "#E8E0FF",
    muted: "#8080B0",
    accent: "#00AAFF",
    correct: "#00FF88",
    present: "#FF3388",
    absent: "#1A1A35",
    absentText: "#505080",
    keyBg: "#28284A",
  },
  {
    name: "Desert Sand",
    description: "Warm sandstone and sage on cream — southwestern calm",
    bg: "#F8F2E8",
    surface: "#FFFCF5",
    border: "#E0D4C0",
    text: "#3A3028",
    muted: "#907860",
    accent: "#C47838",
    correct: "#6B9E50",
    present: "#C47838",
    absent: "#E0D8C8",
    absentText: "#A89880",
    keyBg: "#EAE0D0",
  },
  {
    name: "Synthwave Sunset",
    description: "Orange-to-magenta gradient feel on deep navy — 80s vibes",
    bg: "#0A0618",
    surface: "#120C24",
    border: "#22163A",
    text: "#F0E0F0",
    muted: "#A080C0",
    accent: "#FF7744",
    correct: "#44DDAA",
    present: "#DD44AA",
    absent: "#22163A",
    absentText: "#6A4888",
    keyBg: "#30205A",
  },
  {
    name: "Ghostwriter",
    description: "Faded ink on parchment — typewriter nostalgia",
    bg: "#F0EAE0",
    surface: "#FAF6F0",
    border: "#D4CCC0",
    text: "#28241C",
    muted: "#78706A",
    accent: "#444038",
    correct: "#4A8850",
    present: "#B08840",
    absent: "#D8D0C5",
    absentText: "#98908A",
    keyBg: "#E0D8CC",
  },
  {
    name: "Electric Indigo",
    description: "Vivid indigo blue on obsidian — striking and modern",
    bg: "#08080E",
    surface: "#101018",
    border: "#1E1E35",
    text: "#E0E0F8",
    muted: "#8888B8",
    accent: "#6366F1",
    correct: "#4ADE80",
    present: "#6366F1",
    absent: "#1E1E35",
    absentText: "#5858A0",
    keyBg: "#2E2E50",
  },
  {
    name: "Campfire",
    description: "Ember orange and smoke gray — outdoors at dusk",
    bg: "#0E0A08",
    surface: "#181410",
    border: "#2E2620",
    text: "#F0E4D8",
    muted: "#A08868",
    accent: "#E86830",
    correct: "#70C070",
    present: "#E86830",
    absent: "#2E2620",
    absentText: "#7A6A58",
    keyBg: "#4A3828",
  },
  {
    name: "Frozen Berry",
    description: "Icy purple with raspberry pink accents — winter twilight",
    bg: "#0A0610",
    surface: "#140E1E",
    border: "#241838",
    text: "#E8D8F0",
    muted: "#9878B8",
    accent: "#E848A8",
    correct: "#48D8A0",
    present: "#E848A8",
    absent: "#241838",
    absentText: "#684888",
    keyBg: "#362858",
  },
  {
    name: "Solarized Dark",
    description: "Classic Solarized — eye-friendly blue-green on dark teal",
    bg: "#002B36",
    surface: "#073642",
    border: "#1A4A56",
    text: "#EEE8D5",
    muted: "#839496",
    accent: "#B58900",
    correct: "#859900",
    present: "#B58900",
    absent: "#073642",
    absentText: "#586E75",
    keyBg: "#1A4A56",
  },
  {
    name: "Dracula",
    description: "Famous Dracula theme — purple on charcoal-blue",
    bg: "#282A36",
    surface: "#2E3140",
    border: "#44475A",
    text: "#F8F8F2",
    muted: "#6272A4",
    accent: "#BD93F9",
    correct: "#50FA7B",
    present: "#FFB86C",
    absent: "#44475A",
    absentText: "#6272A4",
    keyBg: "#4A4D60",
  },
  {
    name: "Obsidian Gold",
    description: "True black with 24k gold — maximum luxury",
    bg: "#000000",
    surface: "#0A0A0A",
    border: "#1A1A1A",
    text: "#F0F0F0",
    muted: "#808080",
    accent: "#FFD700",
    correct: "#50FF50",
    present: "#FFD700",
    absent: "#1A1A1A",
    absentText: "#606060",
    keyBg: "#2A2A2A",
  },
  {
    name: "Pastel Dream",
    description: "Soft pastel rainbow on light gray — gentle and playful",
    bg: "#F4F2F6",
    surface: "#FEFEFE",
    border: "#E0DDE4",
    text: "#2A2830",
    muted: "#8884A0",
    accent: "#9B7BCC",
    correct: "#6BC09E",
    present: "#E8A87C",
    absent: "#E0DCE6",
    absentText: "#A09CB0",
    keyBg: "#E8E4EE",
  },
  {
    name: "Miami Vice",
    description: "Hot teal and flamingo pink on dark — coastal nightlife",
    bg: "#0A0C10",
    surface: "#101418",
    border: "#1A2028",
    text: "#E8F0F0",
    muted: "#6AA0A8",
    accent: "#00D4AA",
    correct: "#00D4AA",
    present: "#FF6B9D",
    absent: "#1A2028",
    absentText: "#407078",
    keyBg: "#1E3038",
  },
  {
    name: "Ink & Wash",
    description: "Sumi ink black with vermillion red — Japanese calligraphy",
    bg: "#0C0C0A",
    surface: "#161614",
    border: "#2A2A26",
    text: "#E8E4DC",
    muted: "#8A8680",
    accent: "#CC3322",
    correct: "#66AA66",
    present: "#CC3322",
    absent: "#2A2A26",
    absentText: "#6A6864",
    keyBg: "#3A3A36",
  },
];

const SAMPLE_GUESSES: { letter: string; state: "correct" | "present" | "absent" }[][] = [
  [
    { letter: "C", state: "absent" },
    { letter: "R", state: "present" },
    { letter: "A", state: "absent" },
    { letter: "N", state: "absent" },
    { letter: "E", state: "correct" },
  ],
  [
    { letter: "S", state: "absent" },
    { letter: "T", state: "correct" },
    { letter: "O", state: "absent" },
    { letter: "R", state: "present" },
    { letter: "E", state: "correct" },
  ],
];

const KEYBOARD_LETTERS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const USED_LETTERS: Record<string, "correct" | "present" | "absent"> = {
  C: "absent", R: "present", A: "absent", N: "absent", E: "correct",
  S: "absent", T: "correct", O: "absent",
};

function PaletteCard({ palette, selected, onClick }: { palette: Palette; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${
        selected ? "ring-2 ring-offset-2 ring-offset-black" : ""
      }`}
      style={{
        backgroundColor: palette.bg,
        borderColor: selected ? palette.accent : palette.border,
        ...(selected ? { ringColor: palette.accent } : {}),
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold font-mono" style={{ color: palette.text }}>
          {palette.name}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: palette.muted }}>
          {palette.description}
        </p>
      </div>

      {/* Mini Title */}
      <div className="text-center mb-3">
        <span className="font-mono text-xl font-bold tracking-tight" style={{ color: palette.text }}>
          GLYPH
        </span>
        <p className="text-[10px]" style={{ color: palette.muted }}>Five letters. One winner.</p>
      </div>

      {/* Mini Game Board */}
      <div className="flex flex-col items-center gap-1 mb-3">
        {SAMPLE_GUESSES.map((row, i) => (
          <div key={i} className="flex gap-1">
            {row.map((cell, j) => (
              <div
                key={j}
                className="flex h-9 w-9 items-center justify-center font-mono text-sm font-bold border"
                style={{
                  backgroundColor:
                    cell.state === "correct" ? palette.correct
                    : cell.state === "present" ? palette.present
                    : palette.absent,
                  borderColor:
                    cell.state === "correct" ? palette.correct
                    : cell.state === "present" ? palette.present
                    : palette.absent,
                  color: cell.state === "absent" ? palette.absentText : palette.bg,
                }}
              >
                {cell.letter}
              </div>
            ))}
          </div>
        ))}
        {/* Empty row */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, j) => (
            <div
              key={j}
              className="h-9 w-9 border-2"
              style={{ borderColor: palette.border, backgroundColor: "transparent" }}
            />
          ))}
        </div>
        {/* Current guess row */}
        <div className="flex gap-1">
          <div className="flex h-9 w-9 items-center justify-center border-2 font-mono text-sm font-bold"
            style={{ borderColor: palette.muted, color: palette.text }}>G</div>
          <div className="flex h-9 w-9 items-center justify-center border-2 font-mono text-sm font-bold"
            style={{ borderColor: palette.muted, color: palette.text }}>L</div>
          <div className="flex h-9 w-9 items-center justify-center border-2 font-mono text-sm font-bold"
            style={{ borderColor: palette.muted, color: palette.text }}>Y</div>
          <div className="h-9 w-9 border-2" style={{ borderColor: palette.border }} />
          <div className="h-9 w-9 border-2" style={{ borderColor: palette.border }} />
        </div>
      </div>

      {/* Mini Keyboard */}
      <div className="flex flex-col items-center gap-0.5 mb-4">
        {KEYBOARD_LETTERS.map((row, i) => (
          <div key={i} className="flex gap-0.5">
            {row.split("").map((key) => {
              const state = USED_LETTERS[key];
              let bg = palette.keyBg;
              let color = palette.text;
              if (state === "correct") { bg = palette.correct; color = palette.bg; }
              else if (state === "present") { bg = palette.present; color = palette.bg; }
              else if (state === "absent") { bg = palette.absent; color = palette.absentText; }
              return (
                <div
                  key={key}
                  className="flex h-6 w-5 items-center justify-center rounded-sm font-mono text-[9px] font-semibold"
                  style={{ backgroundColor: bg, color }}
                >
                  {key}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        className="w-full rounded-lg py-2.5 font-semibold text-sm transition-opacity"
        style={{ backgroundColor: palette.accent, color: palette.bg }}
      >
        Create Challenge
      </button>

      {/* Card-style button */}
      <div
        className="mt-2 rounded-lg border p-3 flex items-center justify-between"
        style={{ backgroundColor: palette.surface, borderColor: palette.border }}
      >
        <div>
          <p className="text-xs font-medium" style={{ color: palette.text }}>Join Game</p>
          <p className="text-[10px]" style={{ color: palette.muted }}>Enter a code to play</p>
        </div>
        <span style={{ color: palette.accent }}>→</span>
      </div>

      {/* Color Swatches */}
      <div className="mt-4 flex gap-1.5 flex-wrap">
        {[
          { label: "BG", color: palette.bg },
          { label: "Surface", color: palette.surface },
          { label: "Accent", color: palette.accent },
          { label: "Correct", color: palette.correct },
          { label: "Present", color: palette.present },
          { label: "Absent", color: palette.absent },
          { label: "Key", color: palette.keyBg },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-0.5">
            <div
              className="h-5 w-5 rounded-full border"
              style={{ backgroundColor: s.color, borderColor: palette.border }}
            />
            <span className="text-[8px]" style={{ color: palette.muted }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailView({ palette }: { palette: Palette }) {
  return (
    <div
      className="rounded-2xl border-2 p-8 w-full max-w-md mx-auto"
      style={{ backgroundColor: palette.bg, borderColor: palette.border }}
    >
      <div className="text-center mb-6">
        <h2 className="font-mono text-4xl font-bold tracking-tight" style={{ color: palette.text }}>
          GLYPH
        </h2>
        <p className="text-sm mt-1" style={{ color: palette.muted }}>Five letters. One winner.</p>
      </div>

      {/* Full-size board */}
      <div className="flex flex-col items-center gap-1.5 mb-6">
        {SAMPLE_GUESSES.map((row, i) => (
          <div key={i} className="flex gap-1.5">
            {row.map((cell, j) => (
              <div
                key={j}
                className="flex h-14 w-14 items-center justify-center font-mono text-xl font-bold border-2"
                style={{
                  backgroundColor:
                    cell.state === "correct" ? palette.correct
                    : cell.state === "present" ? palette.present
                    : palette.absent,
                  borderColor:
                    cell.state === "correct" ? palette.correct
                    : cell.state === "present" ? palette.present
                    : palette.absent,
                  color: cell.state === "absent" ? palette.absentText : palette.bg,
                }}
              >
                {cell.letter}
              </div>
            ))}
          </div>
        ))}
        {[0, 1].map((ri) => (
          <div key={`empty-${ri}`} className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, j) => {
              if (ri === 0 && j < 3) {
                const letters = ["G", "L", "Y"];
                return (
                  <div key={j} className="flex h-14 w-14 items-center justify-center border-2 font-mono text-xl font-bold"
                    style={{ borderColor: palette.muted, color: palette.text }}>
                    {letters[j]}
                  </div>
                );
              }
              return (
                <div key={j} className="h-14 w-14 border-2"
                  style={{ borderColor: palette.border, backgroundColor: "transparent" }} />
              );
            })}
          </div>
        ))}
        {[0, 1].map((ri) => (
          <div key={`future-${ri}`} className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-14 w-14 border-2"
                style={{ borderColor: palette.border, backgroundColor: "transparent" }} />
            ))}
          </div>
        ))}
      </div>

      {/* Full keyboard */}
      <div className="flex flex-col items-center gap-1 mb-6">
        {KEYBOARD_LETTERS.map((row, i) => (
          <div key={i} className="flex gap-1">
            {row.split("").map((key) => {
              const state = USED_LETTERS[key];
              let bg = palette.keyBg;
              let color = palette.text;
              if (state === "correct") { bg = palette.correct; color = palette.bg; }
              else if (state === "present") { bg = palette.present; color = palette.bg; }
              else if (state === "absent") { bg = palette.absent; color = palette.absentText; }
              return (
                <div
                  key={key}
                  className="flex h-11 w-8 items-center justify-center rounded-md font-mono text-xs font-bold"
                  style={{ backgroundColor: bg, color }}
                >
                  {key}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <button
          className="w-full rounded-xl py-3.5 font-semibold transition-opacity"
          style={{ backgroundColor: palette.accent, color: palette.bg }}
        >
          Create & Share
        </button>

        <div className="rounded-xl border p-4 flex items-center justify-between"
          style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
          <div>
            <p className="font-medium text-sm" style={{ color: palette.text }}>Join Game</p>
            <p className="text-xs" style={{ color: palette.muted }}>Enter a code to play a challenge</p>
          </div>
          <span className="text-lg" style={{ color: palette.accent }}>→</span>
        </div>

        <div className="rounded-xl border p-4 flex items-center justify-between"
          style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
          <div>
            <p className="font-medium text-sm" style={{ color: palette.text }}>Duel Mode</p>
            <p className="text-xs" style={{ color: palette.muted }}>Head-to-head competitive play</p>
          </div>
          <span className="text-lg" style={{ color: palette.accent }}>⚔</span>
        </div>
      </div>

      {/* Game code display */}
      <div className="mt-4 rounded-xl border p-5 text-center"
        style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
        <p className="text-[10px] uppercase tracking-wider" style={{ color: palette.muted }}>Game Code</p>
        <p className="font-mono text-3xl font-bold tracking-[0.2em] mt-1"
          style={{ color: palette.accent }}>XK7M2P</p>
      </div>

      {/* Color values */}
      <div className="mt-6 grid grid-cols-2 gap-2 text-[10px] font-mono" style={{ color: palette.muted }}>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: palette.bg }} /> bg: {palette.bg}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: palette.surface }} /> surface: {palette.surface}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: palette.accent }} /> accent: {palette.accent}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: palette.correct }} /> correct: {palette.correct}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: palette.present }} /> present: {palette.present}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: palette.absent }} /> absent: {palette.absent}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: palette.text }} /> text: {palette.text}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: palette.keyBg }} /> keyBg: {palette.keyBg}
        </div>
      </div>
    </div>
  );
}

export default function PalettesPage() {
  const [selected, setSelected] = useState<number>(0);
  const [filter, setFilter] = useState<"all" | "dark" | "light">("all");

  const filteredPalettes = PALETTES.filter((p) => {
    if (filter === "all") return true;
    const isLight = p.bg.startsWith("#F") || p.bg.startsWith("#E") || p.bg.startsWith("#D");
    return filter === "light" ? isLight : !isLight;
  });

  return (
    <div className="min-h-dvh bg-[#0A0A0B] text-[#E8E8E8]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-[#2A2A2E] bg-[#0A0A0B]/95 backdrop-blur-sm px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold">Palette Explorer</h1>
            <p className="text-sm text-[#8B8B8B]">{filteredPalettes.length} palettes — click any to preview full-size</p>
          </div>
          <div className="flex gap-2">
            {(["all", "dark", "light"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-[#D4A574] text-[#0A0A0B]"
                    : "bg-[#141416] text-[#8B8B8B] hover:text-[#E8E8E8]"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Grid of palette cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPalettes.map((palette, i) => {
              const realIndex = PALETTES.indexOf(palette);
              return (
                <PaletteCard
                  key={palette.name}
                  palette={palette}
                  selected={selected === realIndex}
                  onClick={() => setSelected(realIndex)}
                />
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="hidden xl:block w-[440px] flex-shrink-0">
            <div className="sticky top-24">
              <DetailView palette={PALETTES[selected]} />
            </div>
          </div>
        </div>

        {/* Mobile detail view */}
        <div className="xl:hidden mt-8">
          <h2 className="font-mono text-lg font-bold mb-4 text-[#8B8B8B]">
            Selected: {PALETTES[selected].name}
          </h2>
          <DetailView palette={PALETTES[selected]} />
        </div>
      </div>
    </div>
  );
}
