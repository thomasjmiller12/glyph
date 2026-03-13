"use client";

const PARTICLES = [
  { left: "8%", bottom: "-5%", size: 3, duration: "18s", delay: "0s", anim: "particleFloat1" },
  { left: "22%", bottom: "-8%", size: 2, duration: "22s", delay: "3s", anim: "particleFloat2" },
  { left: "38%", bottom: "-3%", size: 2.5, duration: "20s", delay: "7s", anim: "particleFloat3" },
  { left: "55%", bottom: "-6%", size: 3, duration: "24s", delay: "2s", anim: "particleFloat1" },
  { left: "70%", bottom: "-4%", size: 2, duration: "19s", delay: "5s", anim: "particleFloat2" },
  { left: "85%", bottom: "-7%", size: 2.5, duration: "21s", delay: "1s", anim: "particleFloat3" },
  { left: "15%", bottom: "-9%", size: 2, duration: "25s", delay: "9s", anim: "particleFloat1" },
  { left: "45%", bottom: "-2%", size: 3, duration: "23s", delay: "4s", anim: "particleFloat2" },
  { left: "62%", bottom: "-8%", size: 2, duration: "17s", delay: "6s", anim: "particleFloat3" },
  { left: "92%", bottom: "-5%", size: 2.5, duration: "20s", delay: "8s", anim: "particleFloat1" },
  { left: "3%", bottom: "-6%", size: 2, duration: "26s", delay: "11s", anim: "particleFloat2" },
  { left: "78%", bottom: "-3%", size: 3, duration: "22s", delay: "10s", anim: "particleFloat3" },
];

export default function AmbientParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            backgroundColor: "var(--color-particle)",
            animation: `${p.anim} ${p.duration} ${p.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}
