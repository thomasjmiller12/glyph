"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#6BCB77", "#D4A574", "#E8E8E8", "#8B8B8B"];

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
}

export default function Confetti({ show }: { show: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!show) return;
    const p: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.3,
      rotation: Math.random() * 360,
      size: 4 + Math.random() * 6,
    }));
    setParticles(p);
    const timer = setTimeout(() => setParticles([]), 2500);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: -20, x: `${p.x}vw`, rotate: 0 }}
          animate={{
            opacity: 0,
            y: "100vh",
            rotate: p.rotation + 360,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2 + Math.random(),
            delay: p.delay,
            ease: "easeIn",
          }}
          className="pointer-events-none fixed top-0 z-50"
          style={{
            width: p.size,
            height: p.size * 1.5,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </AnimatePresence>
  );
}
