import { motion } from "framer-motion";
import { ASSETS } from "@/lib/assets";
import { formatPhone } from "@/lib/utils";
import type { Participant } from "@/types";

interface EntryCouponProps {
  participant: Participant | null;
  code: string;
}

export function EntryCoupon({ participant, code }: EntryCouponProps) {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-xl"
      initial={{ opacity: 0, y: 40, rotateX: 25 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 900 }}
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-primary/50 px-6 py-8 sm:px-10"
        style={{
          background:
            "linear-gradient(150deg, oklch(0.22 0.02 60), oklch(0.13 0.012 60)), radial-gradient(circle at 20% 0%, color-mix(in oklab, var(--gold) 20%, transparent), transparent 55%)",
          boxShadow: "var(--shadow-gold), var(--shadow-deep)",
        }}
      >
        {/* perforation notches */}
        <span className="absolute -left-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-background" />
        <span className="absolute -right-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-background" />

        <div className="flex items-center justify-between gap-4">
          <img
            src="/images/bb-eye.png"
            alt="Bigg Boss"
            className="h-9 w-auto object-contain sm:h-11"
          />
          <p className="display text-right text-xs tracking-[0.35em] text-primary sm:text-sm">
            Entry Coupon
          </p>
        </div>

        <div className="my-6 border-t border-dashed border-primary/40" />

        <p className="text-xs tracking-[0.35em] text-muted-foreground">COUPON CODE</p>
        <p className="display mt-2 text-gold text-[clamp(1.8rem,6vw,2.8rem)] leading-none">
          {code}
        </p>

        <div className="mt-7 grid grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-[0.65rem] tracking-[0.3em] text-muted-foreground">NAME</p>
            <p className="mt-1 truncate text-sm text-foreground sm:text-base">
              {participant?.name || "Common Man"}
            </p>
          </div>
          <div>
            <p className="text-[0.65rem] tracking-[0.3em] text-muted-foreground">PHONE</p>
            <p className="mt-1 text-sm text-foreground sm:text-base">
              {participant ? formatPhone(participant.phone) : "—"}
            </p>
          </div>
        </div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-1/2 h-[200%] w-1/4 rotate-12"
          style={{
            background: "linear-gradient(100deg, transparent, oklch(1 0 0 / 28%), transparent)",
          }}
          initial={{ left: "-30%" }}
          animate={{ left: ["-30%", "130%"] }}
          transition={{
            duration: 2,
            delay: 1,
            repeat: Infinity,
            repeatDelay: 3.5,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
}
