import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ASSETS } from "@/lib/assets";

interface BiggBossEyeProps {
  /** px size of the mark */
  size?: number;
  /** force the eye closed (used while a spin kicks off) */
  forceClosed?: boolean;
  /** gold reaction pulse, e.g. when the wheel settles */
  pulse?: boolean;
  /** blink on an idle interval */
  idleBlink?: boolean;
  className?: string;
}

export function BiggBossEye({
  size = 140,
  forceClosed = false,
  pulse = false,
  idleBlink = true,
  className,
}: BiggBossEyeProps) {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (!idleBlink) return;
    const id = window.setInterval(() => {
      setBlinking(true);
      window.setTimeout(() => setBlinking(false), 620);
    }, 6500);
    return () => window.clearInterval(id);
  }, [idleBlink]);

  const closed = forceClosed || blinking;

  return (
    <div
      className={`relative grid place-items-center ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-[-28%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--gold) 45%, transparent), transparent 62%)",
        }}
        animate={
          pulse ? { opacity: [0.4, 1, 0.5], scale: [1, 1.25, 1.05] } : { opacity: [0.3, 0.6, 0.3] }
        }
        transition={{ duration: pulse ? 1.2 : 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.img
        src={import.meta.env.BASE_URL + "images/bb-eye.png"}
        alt="Bigg Boss eye"
        draggable={false}
        className="relative w-full select-none object-contain drop-shadow-[0_10px_30px_oklch(0_0_0/0.7)]"
        animate={{
          scaleY: closed ? 0.08 : 1,
          filter: closed ? "brightness(0.65)" : "brightness(1)",
        }}
        transition={{ duration: 0.32, ease: "easeInOut" }}
      />
    </div>
  );
}
