import { useState } from "react";
import { motion } from "framer-motion";
import { ASSETS } from "@/lib/assets";
import { playSound } from "@/lib/sound";
import type { CoinFace } from "@/types";

const FLIP_DURATION = 6; // seconds
const FULL_FLIPS = 4;

const IDLE_SPIN_DURATION = 20;

interface CoinFlipProps {
  onResult: (face: CoinFace) => void;
  /** Fires when the button is tapped — must resolve to the server-decided
   * outcome (minute-based coupon-quota pacing) before the flip animates, so
   * the coin visually lands on the face that matches the real result. */
  onFlipStart: () => Promise<CoinFace>;
  /** true once a flip has happened — the coin can never be flipped twice */
  locked: boolean;
}

const faceBase =
  "absolute inset-0 grid place-items-center rounded-full [backface-visibility:hidden] overflow-hidden";

export function CoinFlip({ onResult, onFlipStart, locked }: CoinFlipProps) {
  const [rotateX, setRotateX] = useState(50);
  const [flipping, setFlipping] = useState(false);
  const [deciding, setDeciding] = useState(false);

  const flip = async () => {
    if (flipping || deciding || locked) return;
    setDeciding(true);
    let face: CoinFace;
    try {
      face = await onFlipStart();
    } catch (err) {
      console.error("Could not decide coin outcome", err);
      face = "retry";
    }
    setDeciding(false);
    setFlipping(true);
    playSound("coin-spin");
    setRotateX(FULL_FLIPS * 360 + (face === "success" ? 0 : 180));
    window.setTimeout(() => {
      setFlipping(false);
      onResult(face);
    }, FLIP_DURATION * 1000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative grid place-items-center" style={{ perspective: 1200 }}>
        {/* <motion.div
          className="relative aspect-square w-[min(64vw,300px)]"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateX, y: flipping ? [-0, -70, -70, 0] : 0 }}
          transition={{
            rotateX: { duration: FLIP_DURATION, ease: [0.2, 0.7, 0.15, 1] },
            y: { duration: FLIP_DURATION, ease: "easeInOut", times: [0, 0.2, 0.7, 1] },
          }}
        > */}
        <motion.div
          className="relative aspect-square w-[min(64vw,300px)]"
          style={{ transformStyle: "preserve-3d" }}
          // animate={{
          //   rotateX: flipping ? rotateX : [rotateX, rotateX + 360],
          //   y: flipping ? [-0, -70, -70, 0] : 0,
          // }}
          // transition={{
          //   rotateX: flipping
          //     ? { duration: FLIP_DURATION, ease: [0.2, 0.7, 0.15, 1] }
          //     : { duration: 7, repeat: Infinity, ease: "linear" },
          //   y: { duration: FLIP_DURATION, ease: "easeInOut", times: [0, 0.2, 0.7, 1] },
          // }}
           animate={{
            rotateX: flipping ? rotateX : [rotateX, rotateX + 360],
            y: flipping ? [-0, -70, -70, 0] : 0,
          }}
          transition={{
            rotateX: flipping
              ? { duration: FLIP_DURATION, ease: [0.2, 0.7, 0.15, 1] }
              : { duration: IDLE_SPIN_DURATION, repeat: Infinity, ease: "linear" },
            y: { duration: FLIP_DURATION, ease: "easeInOut", times: [0, 0.2, 0.7, 1] },
          }}
        >
          {/* success face */}
          <div
            className={faceBase}
            style={{
              background:
                "radial-gradient(circle at 32% 25%, oklch(0.95 0.09 92), oklch(0.72 0.14 78) 45%, oklch(0.5 0.12 62) 100%)",
              boxShadow:
                "inset 0 0 0 8px color-mix(in oklab, var(--gold-deep) 80%, black), inset 0 10px 30px oklch(1 0 0 / 0.35)",
            }}
          >
            <img
              src={import.meta.env.BASE_URL + "images/bb-eye.png"}
              alt="Bigg Boss"
              className="w-[62%] object-contain opacity-90 mix-blend-luminosity"
            />
          </div>

          {/* retry face */}
          <div
            className={faceBase}
            style={{
              transform: "rotateX(180deg)",
              background:
                "radial-gradient(circle at 32% 25%, oklch(0.7 0.03 70), oklch(0.42 0.03 62) 50%, oklch(0.26 0.02 60) 100%)",
              boxShadow:
                "inset 0 0 0 8px oklch(0.3 0.02 60), inset 0 10px 30px oklch(1 0 0 / 0.18)",
            }}
          >
            <span className="display px-6 text-center text-sm text-primary/80 sm:text-base">
              Try Again
            </span>
          </div>

          {/* reflective sweep */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(115deg, transparent 35%, oklch(1 0 0 / 22%) 48%, transparent 60%)",
              transform: "translateZ(1px)",
            }}
          />
        </motion.div>

        {/* ground shadow */}
        <motion.div
          className="absolute -bottom-10 h-5 w-[min(48vw,200px)] rounded-full"
          style={{ background: "radial-gradient(ellipse, oklch(0 0 0 / 70%), transparent 70%)" }}
          animate={{
            scaleX: flipping ? [1, 0.6, 0.6, 1] : 1,
            opacity: flipping ? [0.8, 0.35, 0.35, 0.8] : 0.8,
          }}
          transition={{ duration: FLIP_DURATION, ease: "easeInOut", times: [0, 0.2, 0.7, 1] }}
        />
        {/* halo */}
        <motion.div
          className="pointer-events-none absolute inset-[-30%] -z-10 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--gold) 30%, transparent), transparent 65%)",
          }}
          animate={{ opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <button
        type="button"
        onClick={() => void flip()}
        disabled={flipping || deciding || locked}
        className="btn-gold mt-20 px-10 py-4 text-sm sm:px-14 sm:py-5 sm:text-base"
      >
        {deciding ? "Please wait…" : flipping ? "Flipping…" : "Flip the Coin"}
      </button>
    </div>
  );
}
