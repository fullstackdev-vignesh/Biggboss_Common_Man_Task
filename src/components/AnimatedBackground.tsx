import { useMemo } from "react";
import { motion } from "framer-motion";

interface Particle {
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  opacity: number;
}

function buildParticles(count: number, seed: number): Particle[] {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: count }, () => ({
    left: rand() * 100,
    size: 1.5 + rand() * 3.5,
    delay: rand() * 12,
    duration: 12 + rand() * 14,
    drift: -40 + rand() * 80,
    opacity: 0.2 + rand() * 0.5,
  }));
}

interface AnimatedBackgroundProps {
  /** Number of drifting gold motes. Keep low on dense screens. */
  particleCount?: number;
  /** Adds sweeping light rays behind the content. */
  rays?: boolean;
}

export function AnimatedBackground({ particleCount = 26, rays = true }: AnimatedBackgroundProps) {
  const particles = useMemo(() => buildParticles(particleCount, 4321), [particleCount]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden stage-bg grain vignette">
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-[-20%] h-[70vh] w-[70vh] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--gold) 26%, transparent), transparent 65%)",
        }}
        animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-[-25%] left-1/2 h-[60vh] w-[95vw] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, color-mix(in oklab, var(--ember) 22%, transparent), transparent 70%)",
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      {rays && (
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-[-40%] h-[140vh] w-[140vh] origin-top -translate-x-1/2 opacity-30"
          style={{
            background:
              "conic-gradient(from 200deg, transparent 0deg, color-mix(in oklab, var(--gold) 22%, transparent) 14deg, transparent 30deg, transparent 160deg, color-mix(in oklab, var(--gold) 16%, transparent) 176deg, transparent 196deg)",
            maskImage: "radial-gradient(circle at 50% 0%, black 10%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 0%, black 10%, transparent 70%)",
          }}
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute bottom-[-6vh] rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: "var(--gold-bright)",
            boxShadow: "0 0 10px color-mix(in oklab, var(--gold) 80%, transparent)",
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: ["0vh", "-110vh"], x: [0, p.drift], opacity: [0, p.opacity, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}
