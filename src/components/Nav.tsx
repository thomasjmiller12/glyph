"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Moon, Waves, Sparkles, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { THEMES, THEME_META, type Theme } from "@/lib/theme";

const ICONS: Record<Theme, typeof Moon> = {
  dark: Moon,
  ocean: Waves,
  playful: Sparkles,
  light: Sun,
};

export default function Nav() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const Icon = ICONS[theme];

  return (
    <nav className="flex h-14 items-center justify-between border-b border-border px-4">
      <Link
        href="/"
        className="logo-shimmer font-mono text-lg font-bold tracking-wider"
      >
        GLYPH
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/duel"
          className="text-sm text-secondary transition-colors hover:text-primary"
        >
          Duel
        </Link>
        <Link
          href="/stats"
          className="text-sm text-secondary transition-colors hover:text-primary"
        >
          Stats
        </Link>

        {/* Theme Switcher */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-secondary transition-colors hover:text-accent"
            aria-label="Switch theme"
          >
            <Icon size={18} />
          </button>

          {open && (
            <div className="absolute right-0 top-10 z-50 min-w-[140px] rounded-lg border border-border bg-surface p-1 shadow-lg">
              {THEMES.map((t) => {
                const TIcon = ICONS[t];
                const isActive = t === theme;
                return (
                  <button
                    key={t}
                    onClick={() => { setTheme(t); setOpen(false); }}
                    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "text-accent"
                        : "text-secondary hover:text-primary"
                    }`}
                  >
                    <TIcon size={15} />
                    {THEME_META[t].label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
