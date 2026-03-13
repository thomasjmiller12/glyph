"use client";

import { useMemo } from "react";
import { useTheme } from "@/components/ThemeProvider";

export interface ThemeColors {
  background: string;
  surface: string;
  border: string;
  primary: string;
  secondary: string;
  accent: string;
  accentHover: string;
  accentGlow: string;
  success: string;
  successGlow: string;
  warning: string;
  warningGlow: string;
  error: string;
  errorText: string;
  keyBg: string;
  particle: string;
  confetti: string[];
}

function readVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function useThemeColors(): ThemeColors {
  const { theme } = useTheme();

  return useMemo(() => {
    if (typeof window === "undefined") {
      return {
        background: "#0A0A0B", surface: "#141416", border: "#2A2A2E",
        primary: "#E8E8E8", secondary: "#8B8B8B", accent: "#D4A574",
        accentHover: "rgba(212, 165, 116, 0.6)", accentGlow: "rgba(212, 165, 116, 0.15)",
        success: "#6BCB77", successGlow: "rgba(107, 203, 119, 0.45)",
        warning: "#D4A574", warningGlow: "rgba(212, 165, 116, 0.45)",
        error: "#3A3A3E", errorText: "#8B8B8B", keyBg: "#4A4A4E",
        particle: "rgba(212, 165, 116, 0.6)",
        confetti: ["#6BCB77", "#D4A574", "#E8E8E8", "#f0d4a8", "#8BD5E8", "#8B8B8B"],
      };
    }
    return {
      background: readVar("--color-background"),
      surface: readVar("--color-surface"),
      border: readVar("--color-border"),
      primary: readVar("--color-primary"),
      secondary: readVar("--color-secondary"),
      accent: readVar("--color-accent"),
      accentHover: readVar("--color-accent-hover"),
      accentGlow: readVar("--color-accent-glow"),
      success: readVar("--color-success"),
      successGlow: readVar("--color-success-glow"),
      warning: readVar("--color-warning"),
      warningGlow: readVar("--color-warning-glow"),
      error: readVar("--color-error"),
      errorText: readVar("--color-error-text"),
      keyBg: readVar("--color-key-bg"),
      particle: readVar("--color-particle"),
      confetti: [
        readVar("--color-confetti-1"),
        readVar("--color-confetti-2"),
        readVar("--color-confetti-3"),
        readVar("--color-confetti-4"),
        readVar("--color-confetti-5"),
        readVar("--color-confetti-6"),
      ],
    };
  }, [theme]);
}
