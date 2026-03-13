export const THEMES = ["dark", "ocean", "playful", "light"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_META: Record<Theme, { label: string; icon: string }> = {
  dark: { label: "Dark", icon: "moon" },
  ocean: { label: "Ocean", icon: "waves" },
  playful: { label: "Playful", icon: "sparkles" },
  light: { label: "Light", icon: "sun" },
};

export const STORAGE_KEY = "glyph-theme";
export const DEFAULT_THEME: Theme = "dark";
