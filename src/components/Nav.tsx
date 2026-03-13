"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex h-14 items-center justify-between border-b border-[#2A2A2E] px-4">
      <Link
        href="/"
        className="logo-shimmer font-mono text-lg font-bold tracking-wider"
      >
        GLYPH
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/duel"
          className="text-sm text-[#8B8B8B] transition-colors hover:text-[#E8E8E8]"
        >
          Duel
        </Link>
        <Link
          href="/stats"
          className="text-sm text-[#8B8B8B] transition-colors hover:text-[#E8E8E8]"
        >
          Stats
        </Link>
      </div>
    </nav>
  );
}
