"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#6BCB77", "#D4A574", "#E8E8E8", "#f0d4a8", "#8BD5E8", "#8B8B8B"];

type ParticleShape = "rect" | "circle" | "diamond";

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
  shape: ParticleShape;
  drift: number;
}

export default function Confetti({ show }: { show: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!show) return;

    // Screen flash
    setFlash(true);
    const flashTimer = setTimeout(() => setFlash(false), 400);

    const shapes: ParticleShape[] = ["rect", "circle", "diamond"];
    const p: Particle[] = Array.from({ length: 70 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      rotation: Math.random() * 360,
      size: 4 + Math.random() * 7,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      drift: (Math.random() - 0.5) * 120,
    }));
    setParticles(p);
    const timer = setTimeout(() => setParticles([]), 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(flashTimer);
    };
  }, [show]);

  return (
    <>
      {/* Win flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-50"
            style={{
              background: "radial-gradient(circle at 50% 40%, rgba(212, 165, 116, 0.3) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Confetti particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: -20, x: `${p.x}vw`, rotate: 0, scale: 1 }}
            animate={{
              opacity: [1, 1, 0],
              y: "100vh",
              x: `calc(${p.x}vw + ${p.drift}px)`,
              rotate: p.rotation + 360 + (Math.random() > 0.5 ? 180 : 0),
              scale: [1, 1, 0.4],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2.2 + Math.random() * 1.2,
              delay: p.delay,
              ease: "easeIn",
              opacity: { times: [0, 0.7, 1] },
              scale: { times: [0, 0.8, 1] },
            }}
            className="pointer-events-none fixed top-0 z-50"
            style={{
              width: p.size,
              height: p.shape === "circle" ? p.size : p.size * 1.5,
              backgroundColor: p.color,
              borderRadius: p.shape === "circle" ? "50%" : p.shape === "diamond" ? "2px" : "1px",
              transform: p.shape === "diamond" ? "rotate(45deg)" : undefined,
              boxShadow: `0 0 6px ${p.color}40`,
            }}
          />
        ))}
      </AnimatePresence>
    </>
  );
}
