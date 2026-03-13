"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Loader2 } from "lucide-react";

interface DuelLobbyProps {
  code: string;
  hostName: string;
  guestName?: string;
  mode: string;
  isHost: boolean;
}

export default function DuelLobby({
  code,
  hostName,
  guestName,
  mode,
  isHost,
}: DuelLobbyProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    const url = `${window.location.origin}/duel/${code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-primary">Duel Lobby</h1>
        <p className="text-sm text-secondary">
          {mode === "same_word" ? "Same Word" : "Pick Each Other's Words"} · Best of 3
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-secondary">Share this code with your opponent</p>
        <div className="flex items-center gap-3">
          <span className="font-mono text-3xl font-bold tracking-[0.2em] text-accent">
            {code}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copyCode}
            className="rounded-lg border border-border p-2 text-secondary hover:text-primary"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </motion.button>
        </div>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <span className="text-sm text-primary">{hostName}</span>
          <span className="text-xs text-success">Host</span>
        </div>
        {guestName ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-lg border border-success/30 bg-surface px-4 py-3"
          >
            <span className="text-sm text-primary">{guestName}</span>
            <span className="text-xs text-accent">Challenger</span>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-secondary">
            <Loader2 size={14} className="animate-spin" />
            Waiting for opponent...
          </div>
        )}
      </div>

      {isHost && guestName && (
        <p className="text-sm text-success">
          Opponent joined! The duel is starting...
        </p>
      )}
    </div>
  );
}
