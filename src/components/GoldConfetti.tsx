import { useMemo } from "react";
import { motion } from "framer-motion";

interface GoldConfettiProps {
  count?: number;
  /** "burst" radiates from centre, "fall" rains from the top */
  mode?: "burst" | "fall";
}

export function GoldConfetti({ count = 60, mode = "burst" }: GoldConfettiProps) {
  const pieces = useMemo(() => {
    let s = 91;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: count }, () => ({
      angle: rand() * Math.PI * 2,
      distance: 120 + rand() * 420,
      left: rand() * 100,
      size: 4 + rand() * 8,
      delay: rand() * (mode === "fall" ? 1.6 : 0.35),
      duration: 1.4 + rand() * 1.6,
      rotate: -240 + rand() * 480,
      warm: rand() > 0.5,
    }));
  }, [count, mode]);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-[2px]"
          style={{
            left: mode === "fall" ? `${p.left}%` : "50%",
            top: mode === "fall" ? "-5%" : "50%",
            width: p.size,
            height: p.size * 1.8,
            background: p.warm ? "var(--gold-bright)" : "var(--ember)",
            boxShadow: "0 0 12px color-mix(in oklab, var(--gold) 70%, transparent)",
          }}
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
          animate={
            mode === "fall"
              ? { opacity: [0, 1, 0], y: ["0vh", "110vh"], rotate: p.rotate }
              : {
                  opacity: [0, 1, 0],
                  x: Math.cos(p.angle) * p.distance,
                  y: Math.sin(p.angle) * p.distance + 120,
                  rotate: p.rotate,
                }
          }
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
