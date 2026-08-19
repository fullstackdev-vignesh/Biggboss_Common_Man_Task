import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GoldConfetti } from "./GoldConfetti";
import type { SpinResult } from "@/types";

interface ChallengeModalProps {
  result: SpinResult;
  onProceed: () => void;
  onFailed: () => void;
}

export function ChallengeModal({ result, onProceed, onFailed }: ChallengeModalProps) {
  const proceedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    proceedRef.current?.focus();
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-title"
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
      <GoldConfetti count={40} mode="burst" />

      <motion.div
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-primary/40 p-8 text-center sm:p-14"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.2 0.02 60), oklch(0.12 0.012 60) 70%), radial-gradient(circle at 50% 0%, color-mix(in oklab, var(--gold) 18%, transparent), transparent 60%)",
          boxShadow:
            "var(--shadow-deep), 0 0 80px -30px color-mix(in oklab, var(--gold) 60%, transparent)",
        }}
        initial={{ opacity: 0, scale: 0.86, y: 40, filter: "blur(16px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs tracking-[0.45em] text-muted-foreground sm:text-sm">YOUR CATEGORY</p>
        <motion.h2
          id="challenge-title"
          className="display mt-3 text-gold text-[clamp(2.4rem,8vw,5rem)] leading-none"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {result.category.label}
        </motion.h2>

        <div className="mx-auto my-8 h-px w-40 bg-gradient-to-r from-transparent via-primary to-transparent" />

        <p className="text-xs tracking-[0.45em] text-muted-foreground sm:text-sm">YOUR CHALLENGE</p>
        <motion.p
          className="mx-auto mt-5 max-w-2xl text-[clamp(1.4rem,3.6vw,2.3rem)] font-semibold leading-snug text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
        >
          {result.task}
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <button
            ref={proceedRef}
            type="button"
            onClick={onProceed}
            className="btn-gold w-full px-10 py-4 text-sm sm:w-auto sm:text-base"
          >
            Proceed to Next Stage
          </button>
          <button
            type="button"
            onClick={onFailed}
            className="btn-ghost-gold w-full px-10 py-4 text-sm sm:w-auto sm:text-base"
          >
            Failed
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
