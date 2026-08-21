import { motion } from "framer-motion";
import { toast } from "sonner";
import { AnimatedBackground } from "./AnimatedBackground";
import { ASSETS } from "@/lib/assets";

export function SplashScreen({
  onEnter,
  entering,
}: {
  onEnter: () => Promise<{ ok: true } | { ok: false; message: string }>;
  entering: boolean;
}) {
  const handleEnter = async () => {
    const result = await onEnter();
    if (!result.ok) toast.error(result.message);
  };
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <AnimatedBackground particleCount={30} />

      {/* expanding golden rings inspired by the Bigg Boss eye */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.div
          className="ring-spin-slow absolute aspect-square w-[min(88vw,660px)] rounded-full border border-primary/25"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ borderStyle: "dashed" }}
        />
        <motion.div
          className="ring-spin-reverse absolute aspect-square w-[min(72vw,520px)] rounded-full border-2 border-primary/40"
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="absolute aspect-square w-[min(56vw,400px)] rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--gold) 22%, transparent), transparent 68%)",
          }}
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.98, 1.06, 0.98] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-[min(90vw,720px)]"
        initial={{ opacity: 0, scale: 0.82, filter: "blur(18px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src={import.meta.env.BASE_URL + "images/bb-logo.png"}
          alt="Bigg Boss Season 10"
          draggable={false}
          className="w-full select-none object-contain drop-shadow-[0_30px_70px_oklch(0_0_0/0.75)]"
        />
        {/* light sweep across the logo */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            className="absolute -top-1/2 h-[200%] w-1/3 rotate-12"
            style={{
              background: "linear-gradient(100deg, transparent, oklch(1 0 0 / 40%), transparent)",
            }}
            initial={{ left: "-40%" }}
            animate={{ left: ["-40%", "130%"] }}
            transition={{
              duration: 1.6,
              delay: 1.35,
              repeat: Infinity,
              repeatDelay: 4.5,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>

      <motion.button
        type="button"
        onClick={handleEnter}
        disabled={entering}
        className="btn-gold relative z-10 mt-10 px-10 py-4 text-sm sm:px-14 sm:py-5 sm:text-base"
        initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {entering ? "Please wait…" : "Enter the Task"}
      </motion.button>
    </section>
  );
}
