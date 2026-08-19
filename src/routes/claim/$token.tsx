import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { GoldConfetti } from "@/components/GoldConfetti";
import { EntryCoupon } from "@/components/EntryCoupon";
import { ASSETS } from "@/lib/assets";
import { acceptClaim, getClaim, type ClaimInfo } from "@/lib/api";

export const Route = createFileRoute("/claim/$token")({
  head: () => ({
    meta: [{ title: "Bigg Boss Season 10 — Claim Your Coupon" }],
  }),
  component: ClaimPage,
});

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; info: ClaimInfo };

function ClaimPage() {
  const { token } = Route.useParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getClaim(token)
      .then((info) => {
        if (cancelled) return;
        setState({ status: "ready", info });
        if (info.claimAccepted) setCouponCode(info.couponCode);
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Link not found.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await acceptClaim(token);
      setCouponCode(result.couponCode);
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Could not submit. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-16">
      <AnimatedBackground particleCount={16} />

      <motion.div
        className="relative z-10 mb-8"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <img src={ASSETS.logo} alt="Bigg Boss Season 10" className="h-16 w-auto object-contain" />
      </motion.div>

      {state.status === "loading" && (
        <p className="relative z-10 text-sm text-muted-foreground">Loading…</p>
      )}

      {state.status === "error" && (
        <p className="relative z-10 text-center text-sm text-destructive">{state.message}</p>
      )}

      {state.status === "ready" && !couponCode && (
        <motion.div
          className="relative z-10 w-full max-w-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs tracking-[0.35em] text-primary">YOUR CHALLENGE</p>
          <h1 className="display mt-4 text-gold text-[clamp(1.6rem,5vw,2.4rem)] leading-tight">
            {state.info.wheelCategory}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">{state.info.wheelTask}</p>

          {state.info.name && (
            <p className="mt-6 text-sm text-foreground">
              Participant: <span className="text-primary">{state.info.name}</span>
            </p>
          )}

          <label className="mt-8 flex items-center justify-center gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="size-5 accent-primary"
            />
            I Accept
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!accepted || submitting}
            className="btn-gold mt-8 w-full px-10 py-4 text-sm sm:text-base"
          >
            {submitting ? "Please wait…" : "Submit"}
          </button>
        </motion.div>
      )}

      {couponCode && (
        <motion.div
          className="relative z-10 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <GoldConfetti count={60} mode="fall" />
          <h1 className="display text-gold text-center text-[clamp(2rem,6vw,3rem)] leading-none">
            Congratulations!
          </h1>
          <div className="mt-8">
            <EntryCoupon
              participant={
                state.status === "ready" ? { name: state.info.name ?? "", phone: "" } : null
              }
              code={couponCode}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}
