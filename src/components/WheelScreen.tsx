import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedBackground } from "./AnimatedBackground";
import { SpinWheel } from "./SpinWheel";
import { ChallengeModal } from "./ChallengeModal";
import { challengeCategories } from "@/data/challenges";
import { pickRandom } from "@/lib/utils";
import { rejectSpinner, saveSpinnerResult, startSpin } from "@/lib/api";
import type { SpinResult } from "@/types";

const RESULT_DELAY_MS = 3000;

interface WheelScreenProps {
  sessionId: string;
  onProceed: (result: SpinResult) => void;
  onFailed: () => void;
}

export function WheelScreen({ sessionId, onProceed, onFailed }: WheelScreenProps) {
  const [spinning, setSpinning] = useState(false);
  const [settledIndex, setSettledIndex] = useState<number | null>(null);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSpinStart = useCallback(() => {
    setSpinning(true);
    setSettledIndex(null);
    void startSpin(sessionId).catch((err) => console.error("startSpin failed", err));
  }, [sessionId]);

  const handleSettled = useCallback((index: number) => {
    const category = challengeCategories[index]!;
    const spinResult: SpinResult = { category, task: pickRandom(category.tasks), index };
    setSpinning(false);
    setSettledIndex(index);
    setResult(spinResult);
    window.setTimeout(() => setShowModal(true), RESULT_DELAY_MS);
  }, []);

  const handleProceed = useCallback(() => {
    if (!result) return;
    void saveSpinnerResult(sessionId, result.category.label, result.task).catch((err) =>
      console.error("saveSpinnerResult failed", err),
    );
    onProceed(result);
  }, [sessionId, result, onProceed]);

  const handleFailed = useCallback(() => {
    if (result) {
      void rejectSpinner(sessionId, result.category.label, result.task).catch((err) =>
        console.error("rejectSpinner failed", err),
      );
    }
    onFailed();
  }, [sessionId, result, onFailed]);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-16">
      <AnimatedBackground particleCount={18} />

      {/* result light pulse */}
      <AnimatePresence>
        {settledIndex !== null && !showModal && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              background: "radial-gradient(circle at 50% 45%, var(--gold-bright), transparent 60%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative z-10 mb-10 text-center"
        initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="display text-gold text-[clamp(2rem,6vw,3.6rem)] leading-none">
          Your Task Awaits
        </h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          Spin the wheel and discover your Bigg Boss challenge.
        </p>
      </motion.div>

      <div className="relative z-10">
        <SpinWheel
          spinning={spinning}
          settledIndex={settledIndex}
          disabled={settledIndex !== null}
          onSpinStart={handleSpinStart}
          onSettled={handleSettled}
        />
      </div>

      <AnimatePresence>
        {settledIndex !== null && result && (
          <motion.p
            key="selected"
            className="display relative z-10 mt-8 text-center text-primary text-[clamp(1.1rem,3vw,1.6rem)]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {result.category.label}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && result && (
          <ChallengeModal result={result} onProceed={handleProceed} onFailed={handleFailed} />
        )}
      </AnimatePresence>
    </section>
  );
}
