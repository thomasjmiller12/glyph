"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { shareResult } from "@/lib/share";

interface ShareButtonProps {
  text: string;
  label?: string;
}

export default function ShareButton({
  text,
  label = "Share Result",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const success = await shareResult(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95, boxShadow: "0 0 24px var(--color-accent-glow)" }}
      onClick={handleShare}
      className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-semibold text-background transition-all hover:opacity-90 hover:shadow-[0_0_18px_var(--color-accent-glow)]"
    >
      {copied ? (
        <>
          <Check size={18} />
          Copied!
        </>
      ) : (
        <>
          <Copy size={18} />
          {label}
        </>
      )}
    </motion.button>
  );
}
