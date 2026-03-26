"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";

export default function DuelChat({
  duelId,
  sessionId,
}: {
  duelId: Id<"duels">;
  sessionId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = useQuery(api.duelMessages.getMessages, { duelId }) ?? [];
  const sendMessage = useMutation(api.duelMessages.sendMessage);

  const unreadCount = isOpen ? 0 : Math.max(0, messages.length - lastSeenCount);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setLastSeenCount(messages.length);
      inputRef.current?.focus();
    }
  }, [isOpen, messages.length]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    try {
      await sendMessage({ duelId, sessionId, body: trimmed });
    } catch {
      // silent
    }
  }, [input, duelId, sessionId, sendMessage]);

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface shadow-lg transition-all hover:bg-border active:scale-90"
          aria-label="Open chat"
        >
          <MessageCircle className="h-5 w-5 text-accent" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-5 right-5 z-40 flex max-h-[50vh] w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl sm:w-72"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <h3 className="text-sm font-semibold text-primary">Chat</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-secondary transition-colors hover:text-primary"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-2"
              role="log"
              aria-live="polite"
            >
              {messages.length === 0 && (
                <p className="py-6 text-center text-xs text-secondary">
                  No messages yet
                </p>
              )}
              {messages.map((msg) => {
                const isMe = msg.sessionId === sessionId;
                return (
                  <div key={msg._id} className="min-w-0">
                    <span className={`text-xs font-semibold ${isMe ? "text-accent" : "text-secondary"}`}>
                      {isMe ? "You" : msg.playerName}
                    </span>
                    <p className="text-sm leading-snug text-primary">{msg.body}</p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-border px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                maxLength={200}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-primary outline-none placeholder:text-placeholder focus:border-accent"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="rounded-lg p-1.5 text-accent transition-colors hover:bg-accent/10 disabled:opacity-30"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
