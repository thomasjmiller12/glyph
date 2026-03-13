"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Share2 } from "lucide-react";
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
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      className="flex items-center gap-2 rounded-lg bg-[#D4A574] px-5 py-2.5 font-semibold text-[#0A0A0B] transition-opacity hover:opacity-90"
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
