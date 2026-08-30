import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { AnimatedBackground } from "./AnimatedBackground";
import { CoinFlip } from "./CoinFlip";
import { GoldConfetti } from "./GoldConfetti";
import { isValidIndianMobile } from "@/lib/utils";
import { declineClaim, registerClaim, saveCoinResult, startCoin } from "@/lib/api";
import { playSound } from "@/lib/sound";
import type { CoinFace } from "@/types";

interface CoinScreenProps {
  sessionId: string;
  onFinish: () => void;
  onFormVisibleChange?: (visible: boolean) => void;
}

export function CoinScreen({ sessionId, onFinish, onFormVisibleChange }: CoinScreenProps) {
  const [face, setFace] = useState<CoinFace | null>(null);
  const [claimLink, setClaimLink] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    onFormVisibleChange?.(face === "success" && !claimLink);
  }, [face, claimLink, onFormVisibleChange]);

  // Decides the outcome server-side (minute-based coupon-quota pacing)
  // *before* the coin animates, so the coin visually lands on the face that
  // matches the real, already-decided result.
  const handleFlipStart = useCallback(async (): Promise<CoinFace> => {
    const { user } = await startCoin(sessionId);
    return user.coinResult === "win" ? "success" : "retry";
  }, [sessionId]);

  const handleResult = useCallback(
    (result: CoinFace) => {
      setFace(result);
      if (result === "success") playSound("win-celebration");
      saveCoinResult(sessionId).catch((err) => console.error("saveCoinResult failed", err));
    },
    [sessionId],
  );

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await declineClaim(sessionId);
    } catch (err) {
      console.error("declineClaim failed", err);
    } finally {
      setCancelling(false);
      onFinish();
    }
  };

  const handleClaimSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextNameError = name.trim() ? null : "Name is required.";
    const nextPhoneError = isValidIndianMobile(phone)
      ? null
      : "Enter a valid 10-digit Indian mobile number.";
    setNameError(nextNameError);
    setPhoneError(nextPhoneError);
    if (nextNameError || nextPhoneError) return;

    setSubmitting(true);
    try {
      const { claimToken } = await registerClaim(sessionId, name.trim(), phone.replace(/\D/g, ""));
      setClaimLink(`${window.location.origin}/bcm/?token=${claimToken}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-20">
      <AnimatedBackground particleCount={16} />

      <AnimatePresence mode="wait">
        {!face ? (
          <motion.div
            key="coin"
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="display text-gold text-center text-[clamp(2rem,6vw,3.6rem)] leading-none">
              One Last Chance
            </h1>
            <p className="mt-4 max-w-md text-center text-sm text-muted-foreground sm:text-base">
              Flip the Bigg Boss coin and reveal your fate.
            </p>
            <div className="mt-16">
              <CoinFlip
                onResult={handleResult}
                onFlipStart={handleFlipStart}
                locked={face !== null}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            className="relative z-10 flex w-full flex-col items-center"
            initial={{ opacity: 0, scale: 0.92, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {face === "success" ? (
              claimLink ? (
                <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10 px-2 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
                  <GoldConfetti count={70} mode="fall" />
                  <GoldConfetti count={44} mode="burst" />
                  <div className="max-w-md text-center lg:text-left">
                    <h1 className="display text-gold text-[clamp(2.2rem,7vw,4.2rem)] leading-none">
                      Congratulations!
                    </h1>
                    <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                      We have sent a link to your mobile number.
                    </p>
                    <button
                      type="button"
                      onClick={onFinish}
                      className="btn-gold mt-8 w-full px-10 py-4 text-sm sm:w-auto sm:text-base"
                    >
                      Close
                    </button>
                  </div>
                  <img
                    src={import.meta.env.BASE_URL + "images/mobile-how-it-works.png"}
                    alt="How it works"
                    className="w-full max-w-xs sm:max-w-sm"
                  />
                </div>
              ) : (
                <>
                  <GoldConfetti count={70} mode="fall" />
                  <GoldConfetti count={44} mode="burst" />
                  <h1 className="display text-gold text-center text-[clamp(2.2rem,7vw,4.2rem)] leading-none">
                    Congratulations!
                  </h1>
                  <p className="mt-4 max-w-md text-center text-sm text-muted-foreground sm:text-base">
                    Bigg Boss Task Entry Coupon.
                  </p>
                  <form onSubmit={handleClaimSubmit} noValidate className="mt-10 w-full max-w-md">
                    <label
                      htmlFor="coin-name"
                      className="text-xs tracking-[0.25em] text-muted-foreground"
                    >
                      NAME <span className="text-primary">*</span>
                    </label>
                    <input
                      id="coin-name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setNameError(null);
                      }}
                      placeholder="Enter your name"
                      maxLength={60}
                      autoComplete="name"
                      aria-invalid={Boolean(nameError)}
                      className="mt-3 w-full rounded-xl border border-input bg-card/60 px-5 py-4 text-base text-foreground outline-none backdrop-blur transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--gold)_18%,transparent)]"
                    />
                    {nameError && <p className="mt-2 text-sm text-destructive">{nameError}</p>}

                    <label
                      htmlFor="coin-phone"
                      className="mt-6 block text-xs tracking-[0.25em] text-muted-foreground"
                    >
                      PHONE NUMBER <span className="text-primary">*</span>
                    </label>
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-input bg-card/60 px-5 py-4 backdrop-blur transition-all focus-within:border-primary focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--gold)_18%,transparent)]">
                      <span className="text-base text-primary">+91</span>
                      <input
                        id="coin-phone"
                        value={phone}
                        inputMode="numeric"
                        type="tel"
                        autoComplete="tel"
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                          setPhoneError(null);
                        }}
                        placeholder="Enter your phone number"
                        className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60"
                        aria-invalid={Boolean(phoneError)}
                      />
                    </div>
                    {phoneError && <p className="mt-2 text-sm text-destructive">{phoneError}</p>}
                    <p className="mt-3 text-xs text-muted-foreground">
                      We&apos;ll send a consent letter to you for approval. Once approved, your
                      entry coupon will be displayed.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={submitting || cancelling}
                        className="btn-ghost-gold flex-1 px-10 py-4 text-sm sm:text-base"
                      >
                        {cancelling ? "Please wait…" : "Cancel"}
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || cancelling}
                        className="btn-gold flex-1 px-10 py-4 text-sm sm:text-base"
                      >
                        {submitting ? "Please wait…" : "Submit"}
                      </button>
                    </div>
                  </form>
                </>
              )
            ) : (
              <>
                <motion.div
                  className="pointer-events-none absolute inset-0 -z-10"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 40%, color-mix(in oklab, var(--gold) 16%, transparent), transparent 65%)",
                  }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <h1 className="display text-gold text-center text-[clamp(1.9rem,6vw,3.4rem)] leading-none">
                  Better Luck Next Time
                </h1>
                <p className="mt-5 max-w-lg text-center text-sm text-muted-foreground sm:text-base">
                  Thank you for taking on the Bigg Boss Challenge.
                </p>

                <button
                  type="button"
                  onClick={onFinish}
                  className="btn-gold mt-12 px-14 py-4 text-sm sm:text-base"
                >
                  OK
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
