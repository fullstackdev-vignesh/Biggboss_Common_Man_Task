import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, MapPin, Phone as PhoneIcon, User as UserIcon } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { GoldConfetti } from "@/components/GoldConfetti";
import { EntryCoupon } from "@/components/EntryCoupon";
import { cn, formatPhone } from "@/lib/utils";
import {
  acceptClaim,
  declineClaimLink,
  getClaim,
  type ClaimInfo,
  type ClaimLocation,
} from "@/lib/api";
import {
  CONSENT_CONFIRMATION_TEXT,
  CONSENT_INTRO,
  CONSENT_SECTIONS,
} from "@/data/confessionConsent";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "expired"; name: string | null }
  | { status: "ready"; info: ClaimInfo };

type Outcome =
  { kind: "accepted"; couponCode: string; at: string } | { kind: "declined"; at: string };

type LocationStatus = "requesting" | "granted" | "denied" | "unavailable";

async function reverseGeocode(location: ClaimLocation): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=16`,
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { display_name?: string };
    return body.display_name ?? null;
  } catch {
    return null;
  }
}

function useAutoLocation() {
  const [status, setStatus] = useState<LocationStatus>("requesting");
  const [location, setLocation] = useState<ClaimLocation | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  return { status, location };
}

/** Reverse-geocodes the location captured when the coin-win form was
 * submitted (`detailsLocationLat/Lng`) — shown as the claim page's LOCATION
 * field so it reflects where the form was filled in, not where the link
 * happens to be opened. */
function useDetailsAddress(lat: number | null, lng: number | null) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (lat === null || lng === null) {
      setAddress(null);
      return;
    }
    let cancelled = false;
    void reverseGeocode({ lat, lng }).then((result) => {
      if (!cancelled) setAddress(result);
    });
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return address;
}

function formatStamp(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return `${date}\n${time}`;
}

export function ClaimConsentFlow({ token }: { token: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const { location } = useAutoLocation();
  const detailsAddress = useDetailsAddress(
    state.status === "ready" ? state.info.detailsLocationLat : null,
    state.status === "ready" ? state.info.detailsLocationLng : null,
  );

  useEffect(() => {
    let cancelled = false;
    getClaim(token)
      .then((info) => {
        if (cancelled) return;
        if (info.expired) {
          setState({ status: "expired", name: info.name });
          return;
        }
        setState({ status: "ready", info });
        if (info.claimAccepted) {
          setOutcome({
            kind: "accepted",
            couponCode: info.couponCode ?? "",
            at: info.claimAcceptedAt ?? "",
          });
        } else if (info.claimLinkDeclined) {
          setOutcome({ kind: "declined", at: info.claimLinkDeclinedAt ?? "" });
        }
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

  const handleFailure = (err: unknown) => {
    const message = err instanceof Error ? err.message : "Could not submit. Please try again.";
    if (message.toLowerCase().includes("expired")) {
      setState((prev) =>
        prev.status === "ready" ? { status: "expired", name: prev.info.name } : prev,
      );
    } else {
      setState({ status: "error", message });
    }
  };

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      const result = await acceptClaim(token, location ?? undefined);
      setOutcome({
        kind: "accepted",
        couponCode: result.couponCode,
        at: new Date().toISOString(),
      });
    } catch (err) {
      handleFailure(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setSubmitting(true);
    try {
      await declineClaimLink(token, location ?? undefined);
      setOutcome({ kind: "declined", at: new Date().toISOString() });
    } catch (err) {
      handleFailure(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-8 sm:py-14">
      <AnimatedBackground particleCount={16} />

      {state.status === "loading" && (
        <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-6">
          <img
            src={import.meta.env.BASE_URL + "images/bb-logo.png"}
            alt="Bigg Boss Season 10"
            className="h-24 w-auto object-contain sm:h-28"
          />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      )}

      {state.status === "error" && (
        <div className="relative z-10 flex min-h-[70vh] items-center justify-center">
          <p className="text-center text-sm text-destructive">{state.message}</p>
        </div>
      )}

      {state.status === "expired" && (
        <div className="relative z-10 flex min-h-[70vh] items-center justify-center">
          <ExpiredCard name={state.name} />
        </div>
      )}

      {state.status === "ready" && (
        <motion.div
          className="relative z-10 mx-auto w-full max-w-6xl"
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="relative overflow-hidden rounded-2xl border border-primary/50 px-5 py-6 sm:px-8 sm:py-8"
            style={{
              background:
                "linear-gradient(150deg, oklch(0.22 0.02 60), oklch(0.13 0.012 60)), radial-gradient(circle at 20% 0%, color-mix(in oklab, var(--gold) 20%, transparent), transparent 55%)",
              boxShadow: "var(--shadow-gold), var(--shadow-deep)",
            }}
          >
            <span className="pointer-events-none absolute -left-px -top-px size-8 rounded-tl-2xl border-l-2 border-t-2 border-primary" />
            <span className="pointer-events-none absolute -bottom-px -right-px size-8 rounded-br-2xl border-b-2 border-r-2 border-primary" />

            <div className="text-center">
              <img
                src={import.meta.env.BASE_URL + "images/bb-logo.png"}
                alt="Bigg Boss Season 10"
                className="mx-auto h-24 w-auto object-contain sm:h-28"
              />
              <p className="mt-5 text-xs tracking-[0.3em] text-primary sm:text-sm">
                BIGG BOSS TAMIL – COMMON MAN AUDITION
              </p>
              <h1 className="display mt-2 text-gold text-[clamp(1.1rem,4vw,1.6rem)] leading-tight">
                CONFESSION ROOM – DIGITAL CONSENT, AI INTERACTION &amp; RECORDING RELEASE
              </h1>
            </div>

            <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:divide-x lg:divide-primary/20">
              <div className="lg:w-64 lg:shrink-0 lg:pr-8">
                <JourneyList info={state.info} outcome={outcome} />
              </div>

              <div className="min-w-0 flex-1 lg:pl-8">
                {!outcome && (
                  <ConsentPanel
                    info={state.info}
                    detailsAddress={detailsAddress}
                    accepted={accepted}
                    onAcceptedChange={setAccepted}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    submitting={submitting}
                  />
                )}

                {outcome?.kind === "accepted" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                  >
                    <GoldConfetti count={60} mode="fall" />
                    <h1 className="display text-gold text-center text-[clamp(1.6rem,5vw,2.2rem)] leading-none">
                      Congratulations!
                    </h1>
                    <div className="mt-8">
                      <EntryCoupon
                        participant={{
                          name: state.info.name ?? "",
                          phone: state.info.phone ?? "",
                        }}
                        code={outcome.couponCode}
                      />
                    </div>
                  </motion.div>
                )}

                {outcome?.kind === "declined" && <DeclinedPanel />}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}

interface JourneyStep {
  label: string;
  detail: string;
  status: "done" | "current" | "upcoming";
}

function buildJourneySteps(info: ClaimInfo, outcome: Outcome | null): JourneyStep[] {
  const consentDone = outcome !== null;
  return [
    {
      label: "Spin Wheel",
      detail: info.wheelSpinCompletedAt ? formatStamp(info.wheelSpinCompletedAt) : "",
      status: info.wheelSpinCompletedAt ? "done" : "upcoming",
    },
    {
      label: `Task Performance${info.wheelCategory ? ` (${info.wheelCategory})` : ""}`,
      detail: info.taskCompletedAt ? formatStamp(info.taskCompletedAt) : "",
      status: info.taskCompletedAt ? "done" : "upcoming",
    },
    {
      label: "Flip Coin",
      detail: info.coinFlipCompletedAt ? formatStamp(info.coinFlipCompletedAt) : "",
      status: info.coinFlipCompletedAt ? "done" : "upcoming",
    },
    {
      label: "Details Submitted",
      detail: info.detailsSubmittedAt ? formatStamp(info.detailsSubmittedAt) : "",
      status: info.detailsSubmittedAt ? "done" : "upcoming",
    },
    {
      label: "Consent Letter",
      detail: consentDone
        ? `${outcome?.kind === "accepted" ? "Accepted" : "Declined"}\n${formatStamp(outcome?.at)}`
        : "Please review & accept",
      status: consentDone ? "done" : "current",
    },
    {
      label: "Coupon Code",
      detail:
        outcome?.kind === "accepted"
          ? `Ready\n${formatStamp(outcome.at)}`
          : outcome?.kind === "declined"
            ? "Not issued"
            : "Will be shown after acceptance",
      status: outcome?.kind === "accepted" ? "done" : "upcoming",
    },
  ];
}

function JourneyList({ info, outcome }: { info: ClaimInfo; outcome: Outcome | null }) {
  const steps = buildJourneySteps(info, outcome);

  return (
    <div>
      <p className="text-xs font-bold tracking-[0.25em] text-primary">YOUR JOURNEY</p>
      <ol className="mt-5 space-y-5">
        {steps.map((step, i) => (
          <li key={step.label} className="relative flex gap-3 pl-1">
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "absolute left-[11px] top-6 h-[calc(100%+0.25rem)] w-px",
                  step.status === "done" ? "bg-primary/50" : "bg-border",
                )}
              />
            )}
            {step.status === "done" ? (
              <CheckCircle2 className="size-[22px] shrink-0 text-primary" />
            ) : (
              <Circle
                className={cn(
                  "size-[22px] shrink-0",
                  step.status === "current" ? "text-primary" : "text-muted-foreground/50",
                )}
              />
            )}
            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  step.status === "upcoming" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {step.label}
              </p>
              {step.detail && (
                <p className="mt-0.5 whitespace-pre-line text-xs text-muted-foreground">
                  {step.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AutoField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div>
        <p className="text-[0.65rem] tracking-[0.25em] text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function ConsentPanel({
  info,
  detailsAddress,
  accepted,
  onAcceptedChange,
  onAccept,
  onDecline,
  submitting,
}: {
  info: ClaimInfo;
  detailsAddress: string | null;
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
  submitting: boolean;
}) {
  const submittedDate = info.detailsSubmittedAt
    ? new Date(info.detailsSubmittedAt).toLocaleDateString("en-IN")
    : "—";

  const locationText =
    info.detailsLocationLat !== null && info.detailsLocationLng !== null
      ? (detailsAddress ??
        `${info.detailsLocationLat.toFixed(5)}, ${info.detailsLocationLng.toFixed(5)}`)
      : "Not captured";

  return (
    <div>
      <p className="text-xs font-bold tracking-[0.25em] text-primary">CONSENT LETTER</p>
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
        Please read the terms and conditions carefully before you proceed.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-primary/30 bg-black/20 px-5 py-4 sm:grid-cols-2">
        <AutoField icon={UserIcon} label="PARTICIPANT NAME" value={info.name || "Common Man"} />
        <AutoField
          icon={PhoneIcon}
          label="MOBILE NUMBER"
          value={info.phone ? formatPhone(info.phone) : "—"}
        />
        <AutoField icon={UserIcon} label="PARTICIPANT ID" value={info.participantId} />
        <AutoField icon={UserIcon} label="DATE" value={submittedDate} />
        <div className="sm:col-span-2">
          <AutoField icon={MapPin} label="LOCATION" value={locationText} />
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{CONSENT_INTRO}</p>

      <div className="mt-4 max-h-72 space-y-5 overflow-y-auto rounded-xl border border-primary/20 bg-black/20 px-5 py-5 text-left text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {CONSENT_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-bold tracking-wide text-primary sm:text-sm">
              {section.title}
            </p>
            {section.paragraphs.map((p, i) =>
              typeof p === "string" ? (
                <p key={i} className="mt-1.5">
                  {p}
                </p>
              ) : (
                <div key={i}>
                  <p className="mt-1.5">{p.intro}</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    {p.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-primary/30 bg-black/20 px-5 py-5">
        <p className="text-xs font-bold tracking-wide text-primary sm:text-sm">
          PARTICIPANT CONFIRMATION
        </p>
        <p className="mt-3 text-left text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {CONSENT_CONFIRMATION_TEXT}
        </p>

        <label className="mt-4 flex items-start gap-3 text-left text-xs leading-relaxed text-foreground sm:text-sm">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => onAcceptedChange(e.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-primary"
          />
          I have read and understood the above terms and conditions and I agree to proceed.
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onDecline}
          disabled={submitting}
          className="btn-ghost-gold flex-1 px-10 py-4 text-sm sm:text-base"
        >
          <span className="block">Decline</span>
          <span className="block text-xs font-normal normal-case opacity-70">I do not agree</span>
        </button>
        <button
          type="button"
          onClick={onAccept}
          disabled={!accepted || submitting}
          className="btn-gold flex-1 px-10 py-4 text-sm sm:text-base"
        >
          <span className="block">{submitting ? "Please wait…" : "Accept & Proceed"}</span>
          <span className="block text-xs font-normal normal-case opacity-70">
            I agree to the terms
          </span>
        </button>
      </div>

      <p className="mt-4 text-center text-[0.65rem] text-muted-foreground">
        Your data is secure and will not be shared with third parties.
      </p>
    </div>
  );
}

function DeclinedPanel() {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <img
        src={import.meta.env.BASE_URL + "images/bb-eye.png"}
        alt="Bigg Boss"
        className="mx-auto h-11 w-auto object-contain"
      />
      <h1 className="display mt-6 text-[clamp(1.4rem,4vw,2rem)] leading-none text-destructive">
        Coupon Declined
      </h1>
      <p className="mt-4 text-sm text-muted-foreground sm:text-base">
        You've chosen not to enter the Confession Room. Your Common Man Challenge Entry Coupon has
        been declined
      </p>
    </motion.div>
  );
}

function ExpiredCard({ name }: { name: string | null }) {
  return (
    <motion.div
      className="w-full max-w-xl text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <img
        src={import.meta.env.BASE_URL + "images/bb-logo.png"}
        alt="Bigg Boss Season 10"
        className="mx-auto h-16 w-auto object-contain"
      />
      <h1 className="display text-gold mt-6 text-[clamp(1.8rem,6vw,2.6rem)] leading-none">
        Your Link Has Expired
      </h1>
      <p className="mt-4 text-sm text-muted-foreground sm:text-base">
        {/* {name ? `${name}, this` : "This"} claim link was valid for 30 minutes and has expired
        because it wasn't accepted in time. */}
        The 30-minute validity period has ended, and the claim was not accepted in time.
      </p>
    </motion.div>
  );
}
