import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BiggBossEye } from "./BiggBossEye";
import { WheelPointer } from "./WheelPointer";
import { challengeCategories } from "@/data/challenges";
import { playSound } from "@/lib/sound";

const SEGMENTS = challengeCategories.length; // 8
const SEGMENT_ANGLE = 360 / SEGMENTS;
const FULL_SPINS = 6;
const SPIN_DURATION = 6; // seconds

interface SpinWheelProps {
  /** Fired as soon as the wheel physically stops on `index`. */
  onSettled: (index: number) => void;
  disabled?: boolean;
  spinning: boolean;
  onSpinStart: (index: number) => void;
  settledIndex: number | null;
}

export function SpinWheel({
  onSettled,
  onSpinStart,
  spinning,
  settledIndex,
  disabled,
}: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [eyeClosed, setEyeClosed] = useState(false);
  const rotationRef = useRef(0);

  const conic = useMemo(() => {
    const stops = challengeCategories.map((_, i) => {
      const from = i * SEGMENT_ANGLE;
      const to = from + SEGMENT_ANGLE;
      const color =
        i % 2 === 0
          ? "color-mix(in oklab, var(--crimson) 72%, black)"
          : "color-mix(in oklab, var(--charcoal) 88%, var(--gold-deep))";
      return `${color} ${from}deg ${to}deg`;
    });
    return `conic-gradient(from ${-SEGMENT_ANGLE / 2}deg, ${stops.join(", ")})`;
  }, []);

  const handleSpin = () => {
    if (spinning || disabled) return;
    const index = Math.floor(Math.random() * SEGMENTS);
    const base = rotationRef.current;
    const currentMod = ((base % 360) + 360) % 360;
    const target = (360 - index * SEGMENT_ANGLE) % 360;
    let delta = target - currentMod;
    if (delta < 0) delta += 360;
    const next = base + FULL_SPINS * 360 + delta;
    rotationRef.current = next;
    setRotation(next);
    onSpinStart(index);
    setEyeClosed(true);
    window.setTimeout(() => setEyeClosed(false), 700);
    playSound("wheel-spin");
    window.setTimeout(() => {
      playSound("result-reveal");
      onSettled(index);
    }, SPIN_DURATION * 1000);
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative aspect-square w-[min(86vw,520px)]">
        <WheelPointer active={spinning || settledIndex !== null} />

        {/* metallic outer rim */}
        <div
          className="absolute inset-0 rounded-full p-[3%]"
          style={{
            background: "var(--gradient-gold)",
            boxShadow:
              "0 0 0 1px oklch(1 0 0 / 20%), 0 40px 90px -30px oklch(0 0 0 / 0.9), inset 0 0 40px oklch(0 0 0 / 0.5)",
          }}
        >
          <div className="relative size-full overflow-hidden rounded-full">
            <motion.div
              className="size-full rounded-full"
              style={{ background: conic }}
              animate={{ rotate: rotation }}
              transition={{ duration: SPIN_DURATION, ease: [0.12, 0.72, 0.02, 1] }}
            >
              {/* fine gold separators + labels */}
              {challengeCategories.map((category, i) => (
                <div
                  key={category.id}
                  className="absolute inset-0"
                  style={{ transform: `rotate(${i * SEGMENT_ANGLE}deg)` }}
                >
                  <div
                    className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 origin-bottom"
                    style={{
                      background:
                        "linear-gradient(to bottom, color-mix(in oklab, var(--gold) 85%, transparent), transparent)",
                      transform: `translateX(-50%) rotate(${-SEGMENT_ANGLE / 2}deg)`,
                      transformOrigin: "bottom center",
                    }}
                  />
                  <span
                    className="display absolute left-1/2 top-[7%] -translate-x-1/2 text-[clamp(0.7rem,2.4vw,1.05rem)] text-primary-foreground"
                    style={{
                      color:
                        i % 2 === 0
                          ? "color-mix(in oklab, var(--gold-bright) 92%, white)"
                          : "color-mix(in oklab, var(--gold-bright) 80%, white)",
                      textShadow: "0 2px 8px oklch(0 0 0 / 0.8)",
                    }}
                  >
                    {category.label}
                  </span>
                </div>
              ))}

              {/* inner depth + reflection */}
              <div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 32% 22%, oklch(1 0 0 / 16%), transparent 46%), radial-gradient(circle, transparent 52%, oklch(0 0 0 / 55%) 100%)",
                }}
              />
            </motion.div>

            {/* selected segment highlight */}
            {settledIndex !== null && (
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(from ${-SEGMENT_ANGLE / 2}deg, color-mix(in oklab, var(--gold) 55%, transparent) 0deg ${SEGMENT_ANGLE}deg, transparent ${SEGMENT_ANGLE}deg 360deg)`,
                }}
                animate={{ opacity: [0, 0.9, 0.35, 0.9] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* illuminated markers */}
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="pointer-events-none absolute inset-0"
                style={{ transform: `rotate(${i * 15}deg)` }}
              >
                <span
                  className="absolute left-1/2 top-[1.5%] size-1.5 -translate-x-1/2 rounded-full"
                  style={{ background: "var(--gold-bright)", boxShadow: "0 0 8px var(--gold)" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* static centre with the Bigg Boss eye */}
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <div
            className="grid aspect-square w-[34%] place-items-center rounded-full"
            style={{
              background: "radial-gradient(circle, oklch(0.2 0.02 60), oklch(0.1 0.01 60))",
              boxShadow:
                "0 0 0 3px color-mix(in oklab, var(--gold) 70%, transparent), 0 16px 40px -12px oklch(0 0 0 / 0.9)",
            }}
          >
            <BiggBossEye
              size={128}
              className="w-[78%]"
              forceClosed={eyeClosed}
              idleBlink={!spinning}
              pulse={settledIndex !== null}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSpin}
        disabled={spinning || disabled}
        className="btn-gold mt-10 px-10 py-4 text-sm sm:px-14 sm:py-5 sm:text-base"
      >
        {spinning ? "Spinning…" : "Spin the Wheel"}
      </button>
    </div>
  );
}
