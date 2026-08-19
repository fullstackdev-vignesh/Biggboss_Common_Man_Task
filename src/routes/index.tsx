import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ExperienceProvider, useExperience } from "@/hooks/useExperience";
import { PageTransition } from "@/components/PageTransition";
import { SplashScreen } from "@/components/SplashScreen";
import { WheelScreen } from "@/components/WheelScreen";
import { CoinScreen } from "@/components/CoinScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bigg Boss Season 10 — Common Man Task" },
      {
        name: "description",
        content:
          "Step into the spotlight: spin the Bigg Boss wheel, take on your Common Man Task and flip the coin for an entry coupon.",
      },
      { property: "og:title", content: "Bigg Boss Season 10 — Common Man Task" },
      {
        property: "og:description",
        content:
          "Spin the wheel, take on your challenge and flip the Bigg Boss coin for your entry coupon.",
      },
    ],
  }),
  component: () => (
    <ExperienceProvider>
      <Experience />
    </ExperienceProvider>
  ),
});

function Experience() {
  const { stage, sessionId, spinResult, entering, enterTask, setSpinResult, proceedToCoin, reset } =
    useExperience();
  const [failing, setFailing] = useState(false);

  const handleFailed = () => {
    setFailing(true);
    window.setTimeout(() => {
      setFailing(false);
      reset();
    }, 1600);
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-background">
      <AnimatePresence mode="wait">
        {stage === "splash" && (
          <PageTransition key="splash">
            <SplashScreen onEnter={enterTask} entering={entering} />
          </PageTransition>
        )}
        {stage === "wheel" && sessionId && (
          <PageTransition key="wheel">
            <WheelScreen
              sessionId={sessionId}
              onProceed={(result) => {
                setSpinResult(result);
                proceedToCoin();
              }}
              onFailed={handleFailed}
            />
          </PageTransition>
        )}
        {stage === "coin" && sessionId && spinResult && (
          <PageTransition key="coin">
            <CoinScreen sessionId={sessionId} onFinish={reset} />
          </PageTransition>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {failing && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center bg-background/95 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className="display text-center text-primary/80 text-[clamp(1.3rem,4vw,2.2rem)]"
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7 }}
            >
              Task Closed — Thank You For Playing
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
