// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import {
//   CalendarDays,
//   CheckCircle2,
//   Circle,
//   MapPin,
//   Phone as PhoneIcon,
//   User as UserIcon,
// } from "lucide-react";
// import type { LucideIcon } from "lucide-react";

// import { AnimatedBackground } from "@/components/AnimatedBackground";
// import { GoldConfetti } from "@/components/GoldConfetti";
// import { EntryCoupon } from "@/components/EntryCoupon";
// import { SignaturePad } from "@/components/admin/SignaturePad";
// import { cn, formatPhone } from "@/lib/utils";
// import { acceptClaim, declineClaimLink, getClaim, type ClaimInfo } from "@/lib/api";
// import {
//   RELEASE_CLAUSES,
//   RELEASE_CONFIRMATION_TEXT,
//   RELEASE_ENDING_PARAGRAPHS,
//   formatReleaseDate,
// } from "@/data/confessionConsent";

// type LoadState =
//   | { status: "loading" }
//   | { status: "error"; message: string }
//   | { status: "expired"; name: string | null }
//   | { status: "ready"; info: ClaimInfo };

// type Outcome =
//   | { kind: "accepted"; couponCode: string; at: string }
//   | { kind: "declined"; at: string };

// function formatStamp(iso: string | null | undefined): string {
//   if (!iso) return "";
//   const date = new Date(iso).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
//   const time = new Date(iso).toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: true,
//   });
//   return `${date}\n${time}`;
// }

// export function ClaimConsentFlow({ token }: { token: string }) {
//   const [state, setState] = useState<LoadState>({ status: "loading" });
//   const [accepted, setAccepted] = useState(false);
//   const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
//   const [signaturePulse, setSignaturePulse] = useState(0);
//   const [signatureError, setSignatureError] = useState<string | null>(null);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [outcome, setOutcome] = useState<Outcome | null>(null);

//   useEffect(() => {
//     let cancelled = false;
//     getClaim(token)
//       .then((info) => {
//         if (cancelled) return;
//         if (info.expired) {
//           setState({ status: "expired", name: info.name });
//           return;
//         }
//         setState({ status: "ready", info });
//         if (info.claimAccepted) {
//           setOutcome({
//             kind: "accepted",
//             couponCode: info.couponCode ?? "",
//             at: info.claimAcceptedAt ?? "",
//           });
//         } else if (info.claimLinkDeclined) {
//           setOutcome({ kind: "declined", at: info.claimLinkDeclinedAt ?? "" });
//         }
//       })
//       .catch((err) => {
//         if (cancelled) return;
//         setState({
//           status: "error",
//           message: err instanceof Error ? err.message : "Link not found.",
//         });
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, [token]);

//   function handleFailure(err: unknown) {
//     const message = err instanceof Error ? err.message : "Could not submit. Please try again.";
//     if (message.toLowerCase().includes("expired")) {
//       setState((prev) =>
//         prev.status === "ready" ? { status: "expired", name: prev.info.name } : prev,
//       );
//       return;
//     }
//     setSubmitError(message);
//   }

//   async function handleAccept() {
//     setSubmitError(null);

//     if (!signatureDataUrl) {
//       setSignatureError("Please provide your signature to continue.");
//       setSignaturePulse((value) => value + 1);
//       window.setTimeout(() => {
//         document.getElementById("consent-signature")?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       }, 50);
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const result = await acceptClaim(token, signatureDataUrl);
//       setOutcome({
//         kind: "accepted",
//         couponCode: result.couponCode,
//         at: new Date().toISOString(),
//       });
//     } catch (err) {
//       handleFailure(err);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   async function handleDecline() {
//     setSubmitError(null);
//     setSubmitting(true);
//     try {
//       await declineClaimLink(token);
//       setOutcome({ kind: "declined", at: new Date().toISOString() });
//     } catch (err) {
//       handleFailure(err);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <section className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-8 sm:py-14">
//       <AnimatedBackground particleCount={16} />

//       {state.status === "loading" && (
//         <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-6">
//           <img
//             src={import.meta.env.BASE_URL + "images/bb-logo.png"}
//             alt="Bigg Boss Season 10"
//             className="h-24 w-auto object-contain sm:h-28"
//           />
//           <p className="text-sm text-muted-foreground">Loading…</p>
//         </div>
//       )}

//       {state.status === "error" && (
//         <div className="relative z-10 flex min-h-[70vh] items-center justify-center">
//           <p className="text-center text-sm text-destructive">{state.message}</p>
//         </div>
//       )}

//       {state.status === "expired" && (
//         <div className="relative z-10 flex min-h-[70vh] items-center justify-center">
//           <ExpiredCard name={state.name} />
//         </div>
//       )}

//       {state.status === "ready" && (
//         <motion.div
//           className="relative z-10 mx-auto w-full max-w-6xl"
//           initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
//           animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
//           transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
//         >
//           <div
//             className="relative overflow-hidden rounded-2xl border border-primary/50 px-5 py-6 sm:px-8 sm:py-8"
//             style={{
//               background:
//                 "linear-gradient(150deg, oklch(0.22 0.02 60), oklch(0.13 0.012 60)), radial-gradient(circle at 20% 0%, color-mix(in oklab, var(--gold) 20%, transparent), transparent 55%)",
//               boxShadow: "var(--shadow-gold), var(--shadow-deep)",
//             }}
//           >
//             <span className="pointer-events-none absolute -left-px -top-px size-8 rounded-tl-2xl border-l-2 border-t-2 border-primary" />
//             <span className="pointer-events-none absolute -bottom-px -right-px size-8 rounded-br-2xl border-b-2 border-r-2 border-primary" />

//             <div className="text-center">
//               <img
//                 src={import.meta.env.BASE_URL + "images/bb-logo.png"}
//                 alt="Bigg Boss Season 10"
//                 className="mx-auto h-24 w-auto object-contain sm:h-28"
//               />
//               <p className="mt-5 text-xs tracking-[0.3em] text-primary sm:text-sm">
//                 BIGG BOSS TAMIL – AUDITION
//               </p>
//               <h1 className="display mt-2 text-gold text-[clamp(1.1rem,4vw,1.6rem)] leading-tight">
//                 RELEASE LETTER
//               </h1>
//             </div>

//             <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:divide-x lg:divide-primary/20">
//               <div className="lg:w-64 lg:shrink-0 lg:pr-8">
//                 <JourneyList info={state.info} outcome={outcome} />
//               </div>

//               <div className="min-w-0 flex-1 lg:pl-8">
//                 {!outcome && (
//                   <ConsentPanel
//                     info={state.info}
//                     accepted={accepted}
//                     onAcceptedChange={setAccepted}
//                     signatureDataUrl={signatureDataUrl}
//                     onSignatureChange={(value) => {
//                       setSignatureDataUrl(value);
//                       if (value) setSignatureError(null);
//                     }}
//                     signaturePulse={signaturePulse}
//                     signatureError={signatureError}
//                     submitError={submitError}
//                     onAccept={handleAccept}
//                     onDecline={handleDecline}
//                     submitting={submitting}
//                   />
//                 )}

//                 {outcome?.kind === "accepted" && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.7 }}
//                   >
//                     <GoldConfetti count={60} mode="fall" />
//                     <h1 className="display text-gold text-center text-[clamp(1.6rem,5vw,2.2rem)] leading-none">
//                       Congratulations!
//                     </h1>
//                     <div className="mt-8">
//                       <EntryCoupon
//                         participant={{
//                           name: state.info.name ?? "",
//                           phone: state.info.phone ?? "",
//                         }}
//                         code={outcome.couponCode}
//                       />
//                     </div>
//                   </motion.div>
//                 )}

//                 {outcome?.kind === "declined" && <DeclinedPanel />}
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </section>
//   );
// }

// interface JourneyStep {
//   label: string;
//   detail: string;
//   status: "done" | "current" | "upcoming";
// }

// function buildJourneySteps(info: ClaimInfo, outcome: Outcome | null): JourneyStep[] {
//   const consentDone = outcome !== null;
//   return [
//     {
//       label: "Spin Wheel",
//       detail: info.wheelSpinCompletedAt ? formatStamp(info.wheelSpinCompletedAt) : "",
//       status: info.wheelSpinCompletedAt ? "done" : "upcoming",
//     },
//     {
//       label: `Task Performance${info.wheelCategory ? ` (${info.wheelCategory})` : ""}`,
//       detail: info.taskCompletedAt ? formatStamp(info.taskCompletedAt) : "",
//       status: info.taskCompletedAt ? "done" : "upcoming",
//     },
//     {
//       label: "Flip Coin",
//       detail: info.coinFlipCompletedAt ? formatStamp(info.coinFlipCompletedAt) : "",
//       status: info.coinFlipCompletedAt ? "done" : "upcoming",
//     },
//     {
//       label: "Details Submitted",
//       detail: info.detailsSubmittedAt ? formatStamp(info.detailsSubmittedAt) : "",
//       status: info.detailsSubmittedAt ? "done" : "upcoming",
//     },
//     {
//       label: "Consent Letter",
//       detail: consentDone
//         ? `${outcome?.kind === "accepted" ? "Accepted" : "Declined"}\n${formatStamp(outcome?.at)}`
//         : "Please review, sign & accept",
//       status: consentDone ? "done" : "current",
//     },
//     {
//       label: "Coupon Code",
//       detail:
//         outcome?.kind === "accepted"
//           ? `Ready\n${formatStamp(outcome.at)}`
//           : outcome?.kind === "declined"
//             ? "Not issued"
//             : "Will be shown after acceptance",
//       status: outcome?.kind === "accepted" ? "done" : "upcoming",
//     },
//   ];
// }

// function JourneyList({ info, outcome }: { info: ClaimInfo; outcome: Outcome | null }) {
//   const steps = buildJourneySteps(info, outcome);

//   return (
//     <div>
//       <p className="text-xs font-bold tracking-[0.25em] text-primary">YOUR JOURNEY</p>
//       <ol className="mt-5 space-y-5">
//         {steps.map((step, i) => (
//           <li key={step.label} className="relative flex gap-3 pl-1">
//             {i < steps.length - 1 && (
//               <span
//                 className={cn(
//                   "absolute left-[11px] top-6 h-[calc(100%+0.25rem)] w-px",
//                   step.status === "done" ? "bg-primary/50" : "bg-border",
//                 )}
//               />
//             )}
//             {step.status === "done" ? (
//               <CheckCircle2 className="size-[22px] shrink-0 text-primary" />
//             ) : (
//               <Circle
//                 className={cn(
//                   "size-[22px] shrink-0",
//                   step.status === "current" ? "text-primary" : "text-muted-foreground/50",
//                 )}
//               />
//             )}
//             <div>
//               <p
//                 className={cn(
//                   "text-sm font-semibold",
//                   step.status === "upcoming" ? "text-muted-foreground" : "text-foreground",
//                 )}
//               >
//                 {step.label}
//               </p>
//               {step.detail && (
//                 <p className="mt-0.5 whitespace-pre-line text-xs text-muted-foreground">
//                   {step.detail}
//                 </p>
//               )}
//             </div>
//           </li>
//         ))}
//       </ol>
//     </div>
//   );
// }

// function AutoField({
//   icon: Icon,
//   label,
//   value,
// }: {
//   icon: LucideIcon;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="flex items-start gap-2">
//       <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
//       <div>
//         <p className="text-[0.65rem] tracking-[0.25em] text-muted-foreground">{label}</p>
//         <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
//       </div>
//     </div>
//   );
// }

// function ConsentPanel({
//   info,
//   accepted,
//   onAcceptedChange,
//   signatureDataUrl,
//   onSignatureChange,
//   signaturePulse,
//   signatureError,
//   submitError,
//   onAccept,
//   onDecline,
//   submitting,
// }: {
//   info: ClaimInfo;
//   accepted: boolean;
//   onAcceptedChange: (accepted: boolean) => void;
//   signatureDataUrl: string | null;
//   onSignatureChange: (value: string | null) => void;
//   signaturePulse: number;
//   signatureError: string | null;
//   submitError: string | null;
//   onAccept: () => void;
//   onDecline: () => void;
//   submitting: boolean;
// }) {
//   const currentDate = formatReleaseDate(new Date());
//   const location = info.currentLocation?.trim() || "Not configured";
//   const state = info.state?.trim() || "Tamil Nadu";
//   const participantName = info.name?.trim() || "Participant";

//   return (
//     <div>
//       <p className="text-xs font-bold tracking-[0.25em] text-primary">CONSENT LETTER</p>
//       <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
//         Please read the release carefully, confirm it and provide your signature.
//       </p>

//       <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-primary/30 bg-black/20 px-5 py-4 sm:grid-cols-2">
//         <AutoField icon={UserIcon} label="PARTICIPANT NAME" value={participantName} />
//         <AutoField
//           icon={PhoneIcon}
//           label="MOBILE NUMBER"
//           value={info.phone ? formatPhone(info.phone) : "—"}
//         />
//         <AutoField icon={UserIcon} label="PARTICIPANT ID" value={info.participantId} />
//         <AutoField icon={MapPin} label="LOCATION" value={location} />
//         <AutoField icon={CalendarDays} label="DATE" value={currentDate} />
//       </div>

//       {!info.currentLocation?.trim() && (
//         <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
//           Campaign location is not configured. Please contact the administrator before accepting.
//         </p>
//       )}

//       <div className="mt-4 max-h-[32rem] space-y-4 overflow-y-auto rounded-xl border border-primary/20 bg-black/20 px-5 py-5 text-left text-xs leading-relaxed text-muted-foreground sm:text-sm">
//         <p className="text-foreground">{currentDate}</p>
//         <p className="text-center text-sm font-bold tracking-wide text-primary sm:text-base">
//           RELEASE LETTER
//         </p>
//         <p>
//           I, <span className="font-semibold text-foreground">{participantName}</span>, an adult
//           citizen and resident of India, residing at{" "}
//           <span className="font-semibold text-foreground">{location}</span>,{" "}
//           <span className="font-semibold text-foreground">{state}</span>, state that:
//         </p>

//         {RELEASE_CLAUSES.map((paragraph) => (
//           <p key={paragraph.slice(0, 8)}>{paragraph}</p>
//         ))}

//         {RELEASE_ENDING_PARAGRAPHS.map((paragraph) => (
//           <p key={paragraph.slice(0, 20)}>{paragraph}</p>
//         ))}

//         <div className="pt-2 text-foreground">
//           <p>Regards,</p>
//           <p className="mt-2">Name: {participantName}</p>
//           <p>Place: {location}</p>
//         </div>
//       </div>

//       <div className="mt-5 rounded-xl border border-primary/30 bg-black/20 px-5 py-5">
//         <p className="text-xs font-bold tracking-wide text-primary sm:text-sm">
//           PARTICIPANT CONFIRMATION
//         </p>
//         <p className="mt-3 text-left text-xs leading-relaxed text-muted-foreground sm:text-sm">
//           {RELEASE_CONFIRMATION_TEXT}
//         </p>

//         <label className="mt-4 flex items-start gap-3 text-left text-xs leading-relaxed text-foreground sm:text-sm">
//           <input
//             type="checkbox"
//             checked={accepted}
//             onChange={(e) => onAcceptedChange(e.target.checked)}
//             className="mt-0.5 size-5 shrink-0 accent-primary"
//           />
//           I have read and understood the above terms and conditions and I agree to proceed.
//         </label>
//       </div>

//       <div id="consent-signature" className="mt-5 scroll-mt-8">
//         <SignaturePad
//           value={signatureDataUrl}
//           onChange={onSignatureChange}
//           invalidPulse={signaturePulse}
//         />
//         {signatureError && <p className="mt-2 text-sm text-destructive">{signatureError}</p>}
//       </div>

//       {submitError && (
//         <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {submitError}
//         </p>
//       )}

//       <div className="mt-5 flex flex-col gap-3 sm:flex-row">
//         <button
//           type="button"
//           onClick={onDecline}
//           disabled={submitting}
//           className="btn-ghost-gold flex-1 px-10 py-4 text-sm sm:text-base"
//         >
//           <span className="block">Decline</span>
//           <span className="block text-xs font-normal normal-case opacity-70">I do not agree</span>
//         </button>
//         <button
//           type="button"
//           onClick={onAccept}
//           disabled={!accepted || submitting || !info.currentLocation?.trim()}
//           className="btn-gold flex-1 px-10 py-4 text-sm sm:text-base"
//         >
//           <span className="block">{submitting ? "Please wait…" : "Accept & Proceed"}</span>
//           <span className="block text-xs font-normal normal-case opacity-70">
//             I agree to the terms
//           </span>
//         </button>
//       </div>

//       <p className="mt-4 text-center text-[0.65rem] text-muted-foreground">
//         Your signature is securely stored with your finalized release letter.
//       </p>
//     </div>
//   );
// }

// function DeclinedPanel() {
//   return (
//     <motion.div
//       className="text-center"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.7 }}
//     >
//       <img
//         src={import.meta.env.BASE_URL + "images/bb-eye.png"}
//         alt="Bigg Boss"
//         className="mx-auto h-11 w-auto object-contain"
//       />
//       <h1 className="display mt-6 text-[clamp(1.4rem,4vw,2rem)] leading-none text-destructive">
//         Coupon Declined
//       </h1>
//       <p className="mt-4 text-sm text-muted-foreground sm:text-base">
//         You&apos;ve chosen not to proceed. Your Challenge Entry Coupon has been declined.
//       </p>
//     </motion.div>
//   );
// }

// function ExpiredCard({ name: _name }: { name: string | null }) {
//   return (
//     <motion.div
//       className="w-full max-w-xl text-center"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.7 }}
//     >
//       <img
//         src={import.meta.env.BASE_URL + "images/bb-logo.png"}
//         alt="Bigg Boss Season 10"
//         className="mx-auto h-16 w-auto object-contain"
//       />
//       <h1 className="display text-gold mt-6 text-[clamp(1.8rem,6vw,2.6rem)] leading-none">
//         Your Link Has Expired
//       </h1>
//       <p className="mt-4 text-sm text-muted-foreground sm:text-base">
//         The 5-minute validity period has ended, and the claim was not accepted in time.
//       </p>
//     </motion.div>
//   );
// }


// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import {
//   CalendarDays,
//   CheckCircle2,
//   Circle,
//   MapPin,
//   Phone as PhoneIcon,
//   User as UserIcon,
// } from "lucide-react";
// import type { LucideIcon } from "lucide-react";
// import { AnimatedBackground } from "@/components/AnimatedBackground";
// import { GoldConfetti } from "@/components/GoldConfetti";
// import { EntryCoupon } from "@/components/EntryCoupon";
// import { SignaturePad } from "@/components/admin/SignaturePad";
// import { cn, formatPhone } from "@/lib/utils";
// import {
//   acceptClaim,
//   declineClaimLink,
//   getClaim,
//   type ClaimInfo,
// } from "@/lib/api";
// import {
//   RELEASE_CLAUSES,
//   RELEASE_CONFIRMATION_TEXT,
//   RELEASE_ENDING_PARAGRAPHS,
//   formatReleaseDate,
// } from "@/data/confessionConsent";
// type LoadState =
//   | { status: "loading" }
//   | { status: "error"; message: string }
//   | { status: "expired"; name: string | null }
//   | { status: "ready"; info: ClaimInfo };
// type Outcome =
//   | { kind: "accepted"; couponCode: string; at: string }
//   | { kind: "declined"; at: string };
// function formatStamp(iso: string | null | undefined): string {
//   if (!iso) return "";
//   const date = new Date(iso).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
//   const time = new Date(iso).toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: true,
//   });
//   return `${date}\n${time}`;
// }
// export function ClaimConsentFlow({ token }: { token: string }) {
//   const [state, setState] = useState<LoadState>({ status: "loading" });
//   const [accepted, setAccepted] = useState(false);
//   const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
//   const [signaturePulse, setSignaturePulse] = useState(0);
//   const [signatureError, setSignatureError] = useState<string | null>(null);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [outcome, setOutcome] = useState<Outcome | null>(null);
//   useEffect(() => {
//     let cancelled = false;
//     getClaim(token)
//       .then((info) => {
//         if (cancelled) return;
//         if (info.expired) {
//           setState({ status: "expired", name: info.name });
//           return;
//         }
//         setState({ status: "ready", info });
//         if (info.claimAccepted) {
//           setOutcome({
//             kind: "accepted",
//             couponCode: info.couponCode ?? "",
//             at: info.claimAcceptedAt ?? "",
//           });
//         } else if (info.claimLinkDeclined) {
//           setOutcome({
//             kind: "declined",
//             at: info.claimLinkDeclinedAt ?? "",
//           });
//         }
//       })
//       .catch((err: unknown) => {
//         if (cancelled) return;
//         setState({
//           status: "error",
//           message: err instanceof Error ? err.message : "Link not found.",
//         });
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, [token]);
//   function handleFailure(err: unknown) {
//     const message =
//       err instanceof Error
//         ? err.message
//         : "Could not submit. Please try again.";
//     if (message.toLowerCase().includes("expired")) {
//       setState((previous) =>
//         previous.status === "ready"
//           ? {
//               status: "expired",
//               name: previous.info.name,
//             }
//           : previous,
//       );
//       return;
//     }
//     setSubmitError(message);
//   }
//   async function handleAccept() {
//     setSubmitError(null);
//     if (!signatureDataUrl) {
//       setSignatureError("Please provide your signature to continue.");
//       setSignaturePulse((value) => value + 1);
//       window.setTimeout(() => {
//         document.getElementById("consent-signature")?.scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       }, 50);
//       return;
//     }
//     setSignatureError(null);
//     setSubmitting(true);
//     try {
//       const result = await acceptClaim(token, signatureDataUrl);
//       setOutcome({
//         kind: "accepted",
//         couponCode: result.couponCode,
//         at: new Date().toISOString(),
//       });
//     } catch (err: unknown) {
//       handleFailure(err);
//     } finally {
//       setSubmitting(false);
//     }
//   }
//   async function handleDecline() {
//     setSubmitError(null);
//     setSubmitting(true);
//     try {
//       await declineClaimLink(token);
//       setOutcome({
//         kind: "declined",
//         at: new Date().toISOString(),
//       });
//     } catch (err: unknown) {
//       handleFailure(err);
//     } finally {
//       setSubmitting(false);
//     }
//   }
//   return (
//     <section className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-8 sm:py-14">
//       <AnimatedBackground particleCount={16} />
//       {state.status === "loading" && (
//         <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-6">
//           <img
//             src={import.meta.env.BASE_URL + "images/bb-logo.png"}
//             alt="Bigg Boss Season 10"
//             className="h-24 w-auto object-contain sm:h-28"
//           />
//           <p className="text-sm text-muted-foreground">Loading…</p>
//         </div>
//       )}
//       {state.status === "error" && (
//         <div className="relative z-10 flex min-h-[70vh] items-center justify-center">
//           <p className="text-center text-sm text-destructive">
//             {state.message}
//           </p>
//         </div>
//       )}
//       {state.status === "expired" && (
//         <div className="relative z-10 flex min-h-[70vh] items-center justify-center">
//           <ExpiredCard name={state.name} />
//         </div>
//       )}
//       {state.status === "ready" && (
//         <motion.div
//           className="relative z-10 mx-auto w-full max-w-6xl"
//           initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
//           animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
//           transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
//         >
//           <div
//             className="relative overflow-hidden rounded-2xl border border-primary/50 px-5 py-6 sm:px-8 sm:py-8"
//             style={{
//               background:
//                 "linear-gradient(150deg, oklch(0.22 0.02 60), oklch(0.13 0.012 60)), radial-gradient(circle at 20% 0%, color-mix(in oklab, var(--gold) 20%, transparent), transparent 55%)",
//               boxShadow: "var(--shadow-gold), var(--shadow-deep)",
//             }}
//           >
//             <span className="pointer-events-none absolute -left-px -top-px size-8 rounded-tl-2xl border-l-2 border-t-2 border-primary" />
//             <span className="pointer-events-none absolute -bottom-px -right-px size-8 rounded-br-2xl border-b-2 border-r-2 border-primary" />
//             <div className="text-center">
//               <img
//                 src={import.meta.env.BASE_URL + "images/bb-logo.png"}
//                 alt="Bigg Boss Season 10"
//                 className="mx-auto h-24 w-auto object-contain sm:h-28"
//               />
//               <p className="mt-5 text-xs tracking-[0.3em] text-primary sm:text-sm">
//                 BIGG BOSS TAMIL – AUDITION
//               </p>
//               <h1 className="display text-gold mt-2 text-[clamp(1.1rem,4vw,1.6rem)] leading-tight">
//                 RELEASE LETTER
//               </h1>
//             </div>
//             <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:divide-x lg:divide-primary/20">
//               <div className="lg:w-64 lg:shrink-0 lg:pr-8">
//                 <JourneyList info={state.info} outcome={outcome} />
//               </div>
//               <div className="min-w-0 flex-1 lg:pl-8">
//                 {!outcome && (
//                   <ConsentPanel
//                     info={state.info}
//                     accepted={accepted}
//                     onAcceptedChange={setAccepted}
//                     signatureDataUrl={signatureDataUrl}
//                     onSignatureChange={(value) => {
//                       setSignatureDataUrl(value);
//                       if (value) setSignatureError(null);
//                     }}
//                     signaturePulse={signaturePulse}
//                     signatureError={signatureError}
//                     submitError={submitError}
//                     onAccept={handleAccept}
//                     onDecline={handleDecline}
//                     submitting={submitting}
//                   />
//                 )}
//                 {outcome?.kind === "accepted" && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.7 }}
//                   >
//                     <GoldConfetti count={60} mode="fall" />
//                     <h1 className="display text-gold text-center text-[clamp(1.6rem,5vw,2.2rem)] leading-none">
//                       Congratulations!
//                     </h1>
//                     <div className="mt-8">
//                       <EntryCoupon
//                         participant={{
//                           name: state.info.name ?? "",
//                           phone: state.info.phone ?? "",
//                         }}
//                         code={outcome.couponCode}
//                       />
//                     </div>
//                   </motion.div>
//                 )}
//                 {outcome?.kind === "declined" && <DeclinedPanel />}
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </section>
//   );
// }
// interface JourneyStep {
//   label: string;
//   detail: string;
//   status: "done" | "current" | "upcoming";
// }
// function buildJourneySteps(
//   info: ClaimInfo,
//   outcome: Outcome | null,
// ): JourneyStep[] {
//   const consentDone = outcome !== null;
//   return [
//     {
//       label: "Spin Wheel",
//       detail: info.wheelSpinCompletedAt
//         ? formatStamp(info.wheelSpinCompletedAt)
//         : "",
//       status: info.wheelSpinCompletedAt ? "done" : "upcoming",
//     },
//     {
//       label: `Task Performance${
//         info.wheelCategory ? ` (${info.wheelCategory})` : ""
//       }`,
//       detail: info.taskCompletedAt ? formatStamp(info.taskCompletedAt) : "",
//       status: info.taskCompletedAt ? "done" : "upcoming",
//     },
//     {
//       label: "Flip Coin",
//       detail: info.coinFlipCompletedAt
//         ? formatStamp(info.coinFlipCompletedAt)
//         : "",
//       status: info.coinFlipCompletedAt ? "done" : "upcoming",
//     },
//     {
//       label: "Details Submitted",
//       detail: info.detailsSubmittedAt
//         ? formatStamp(info.detailsSubmittedAt)
//         : "",
//       status: info.detailsSubmittedAt ? "done" : "upcoming",
//     },
//     {
//       label: "Consent Letter",
//       detail: consentDone
//         ? `${outcome?.kind === "accepted" ? "Accepted" : "Declined"}\n${formatStamp(
//             outcome?.at,
//           )}`
//         : "Please review, sign & accept",
//       status: consentDone ? "done" : "current",
//     },
//     {
//       label: "Coupon Code",
//       detail:
//         outcome?.kind === "accepted"
//           ? `Ready\n${formatStamp(outcome.at)}`
//           : outcome?.kind === "declined"
//             ? "Not issued"
//             : "Will be shown after acceptance",
//       status: outcome?.kind === "accepted" ? "done" : "upcoming",
//     },
//   ];
// }
// function JourneyList({
//   info,
//   outcome,
// }: {
//   info: ClaimInfo;
//   outcome: Outcome | null;
// }) {
//   const steps = buildJourneySteps(info, outcome);
//   return (
//     <div>
//       <p className="text-xs font-bold tracking-[0.25em] text-primary">
//         YOUR JOURNEY
//       </p>
//       <ol className="mt-5 space-y-5">
//         {steps.map((step, index) => (
//           <li key={step.label} className="relative flex gap-3 pl-1">
//             {index < steps.length - 1 && (
//               <span
//                 className={cn(
//                   "absolute left-[11px] top-6 h-[calc(100%+0.25rem)] w-px",
//                   step.status === "done" ? "bg-primary/50" : "bg-border",
//                 )}
//               />
//             )}
//             {step.status === "done" ? (
//               <CheckCircle2 className="size-[22px] shrink-0 text-primary" />
//             ) : (
//               <Circle
//                 className={cn(
//                   "size-[22px] shrink-0",
//                   step.status === "current"
//                     ? "text-primary"
//                     : "text-muted-foreground/50",
//                 )}
//               />
//             )}
//             <div>
//               <p
//                 className={cn(
//                   "text-sm font-semibold",
//                   step.status === "upcoming"
//                     ? "text-muted-foreground"
//                     : "text-foreground",
//                 )}
//               >
//                 {step.label}
//               </p>
//               {step.detail && (
//                 <p className="mt-0.5 whitespace-pre-line text-xs text-muted-foreground">
//                   {step.detail}
//                 </p>
//               )}
//             </div>
//           </li>
//         ))}
//       </ol>
//     </div>
//   );
// }
// function AutoField({
//   icon: Icon,
//   label,
//   value,
// }: {
//   icon: LucideIcon;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="flex items-start gap-2">
//       <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
//       <div>
//         <p className="text-[0.65rem] tracking-[0.25em] text-muted-foreground">
//           {label}
//         </p>
//         <p className="mt-0.5 text-sm font-semibold text-foreground">
//           {value}
//         </p>
//       </div>
//     </div>
//   );
// }
// interface ConsentPanelProps {
//   info: ClaimInfo;
//   accepted: boolean;
//   onAcceptedChange: (accepted: boolean) => void;
//   signatureDataUrl: string | null;
//   onSignatureChange: (value: string | null) => void;
//   signaturePulse: number;
//   signatureError: string | null;
//   submitError: string | null;
//   onAccept: () => void;
//   onDecline: () => void;
//   submitting: boolean;
// }
// function ConsentPanel({
//   info,
//   accepted,
//   onAcceptedChange,
//   signatureDataUrl,
//   onSignatureChange,
//   signaturePulse,
//   signatureError,
//   submitError,
//   onAccept,
//   onDecline,
//   submitting,
// }: ConsentPanelProps) {
//   const currentDate = formatReleaseDate(new Date());
//   const location = info.currentLocation?.trim() || "Not configured";
//   const state = info.state?.trim() || "Tamil Nadu";
//   const participantName = info.name?.trim() || "Participant";
//   return (
//     <div>
//       <p className="text-xs font-bold tracking-[0.25em] text-primary">
//         CONSENT LETTER
//       </p>
//       <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
//         Please read the release carefully, confirm it and provide your signature.
//       </p>
//       <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-primary/30 bg-black/20 px-5 py-4 sm:grid-cols-2">
//         <AutoField
//           icon={UserIcon}
//           label="PARTICIPANT NAME"
//           value={participantName}
//         />
//         <AutoField
//           icon={PhoneIcon}
//           label="MOBILE NUMBER"
//           value={info.phone ? formatPhone(info.phone) : "—"}
//         />
//         <AutoField
//           icon={UserIcon}
//           label="PARTICIPANT ID"
//           value={info.participantId}
//         />
//         <AutoField icon={MapPin} label="LOCATION" value={location} />
//         <AutoField icon={CalendarDays} label="DATE" value={currentDate} />
//       </div>
//       {!info.currentLocation?.trim() && (
//         <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
//           Campaign location is not configured. Please contact the administrator
//           before accepting.
//         </p>
//       )}
//       <div className="mt-4 max-h-[32rem] space-y-4 overflow-y-auto rounded-xl border border-primary/20 bg-black/20 px-5 py-5 text-left text-xs leading-relaxed text-muted-foreground sm:text-sm">
//         <p className="text-foreground">{currentDate}</p>
//         <p className="text-center text-sm font-bold tracking-wide text-primary sm:text-base">
//           RELEASE LETTER
//         </p>
//         <p>
//           I,{" "}
//           <span className="font-semibold text-foreground">
//             {participantName}
//           </span>
//           , an adult citizen and resident of India, residing at{" "}
//           <span className="font-semibold text-foreground">{location}</span>,{" "}
//           <span className="font-semibold text-foreground">{state}</span>, state
//           that:
//         </p>
//         {RELEASE_CLAUSES.map((paragraph) => (
//           <p key={paragraph.slice(0, 8)}>{paragraph}</p>
//         ))}
//         {RELEASE_ENDING_PARAGRAPHS.map((paragraph) => (
//           <p key={paragraph.slice(0, 20)}>{paragraph}</p>
//         ))}
//         <div className="pt-2 text-foreground">
//           <p>Regards,</p>
//           <p className="mt-2">Name: {participantName}</p>
//           <p>Place: {location}</p>
//         </div>
//       </div>
//       <div className="mt-5 rounded-xl border border-primary/30 bg-black/20 px-5 py-5">
//         <p className="text-xs font-bold tracking-wide text-primary sm:text-sm">
//           PARTICIPANT CONFIRMATION
//         </p>
//         <p className="mt-3 text-left text-xs leading-relaxed text-muted-foreground sm:text-sm">
//           {RELEASE_CONFIRMATION_TEXT}
//         </p>
//         <label className="mt-4 flex items-start gap-3 text-left text-xs leading-relaxed text-foreground sm:text-sm">
//           <input
//             type="checkbox"
//             checked={accepted}
//             onChange={(event) => onAcceptedChange(event.target.checked)}
//             className="mt-0.5 size-5 shrink-0 accent-primary"
//           />
//           I have read and understood the above terms and conditions and I agree
//           to proceed.
//         </label>
//       </div>
//       <div id="consent-signature" className="mt-5 scroll-mt-8">
//         <SignaturePad
//           value={signatureDataUrl}
//           onChange={(value) => {
//             onSignatureChange(value);
//           }}
//           invalidPulse={signaturePulse}
//         />
//         {signatureError && (
//           <p className="mt-2 text-sm text-destructive">{signatureError}</p>
//         )}
//       </div>
//       {submitError && (
//         <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {submitError}
//         </p>
//       )}
//       <div className="mt-5 flex flex-col gap-3 sm:flex-row">
//         <button
//           type="button"
//           onClick={onDecline}
//           disabled={submitting}
//           className="btn-ghost-gold flex-1 px-10 py-4 text-sm sm:text-base"
//         >
//           <span className="block">Decline</span>
//           <span className="block text-xs font-normal normal-case opacity-70">
//             I do not agree
//           </span>
//         </button>
//         <button
//           type="button"
//           onClick={onAccept}
//           disabled={
//             !accepted ||
//             submitting ||
//             !info.currentLocation?.trim()
//           }
//           className="btn-gold flex-1 px-10 py-4 text-sm sm:text-base"
//         >
//           <span className="block">
//             {submitting ? "Please wait…" : "Accept & Proceed"}
//           </span>
//           <span className="block text-xs font-normal normal-case opacity-70">
//             I agree to the terms
//           </span>
//         </button>
//       </div>
//       <p className="mt-4 text-center text-[0.65rem] text-muted-foreground">
//         Your signature is securely stored with your finalized release letter.
//       </p>
//     </div>
//   );
// }
// function DeclinedPanel() {
//   return (
//     <motion.div
//       className="text-center"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.7 }}
//     >
//       <img
//         src={import.meta.env.BASE_URL + "images/bb-eye.png"}
//         alt="Bigg Boss"
//         className="mx-auto h-11 w-auto object-contain"
//       />
//       <h1 className="display mt-6 text-[clamp(1.4rem,4vw,2rem)] leading-none text-destructive">
//         Coupon Declined
//       </h1>
//       <p className="mt-4 text-sm text-muted-foreground sm:text-base">
//         You&apos;ve chosen not to proceed. Your Challenge Entry Coupon has been
//         declined.
//       </p>
//     </motion.div>
//   );
// }
// function ExpiredCard({ name: _name }: { name: string | null }) {
//   return (
//     <motion.div
//       className="w-full max-w-xl text-center"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.7 }}
//     >
//       <img
//         src={import.meta.env.BASE_URL + "images/bb-logo.png"}
//         alt="Bigg Boss Season 10"
//         className="mx-auto h-16 w-auto object-contain"
//       />
//       <h1 className="display text-gold mt-6 text-[clamp(1.8rem,6vw,2.6rem)] leading-none">
//         Your Link Has Expired
//       </h1>
//       <p className="mt-4 text-sm text-muted-foreground sm:text-base">
//         The 5-minute validity period has ended, and the claim was not accepted
//         in time.
//       </p>
//     </motion.div>
//   );
// }



import { useEffect,useState,type ReactNode } from "react";
import { motion } from "framer-motion";
import {
CalendarDays,
CheckCircle2,
Circle,
MapPin,
Phone as PhoneIcon,
User as UserIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { GoldConfetti } from "@/components/GoldConfetti";
import { EntryCoupon } from "@/components/EntryCoupon";
import { SignaturePad } from "@/components/admin/SignaturePad";
import { cn,formatPhone } from "@/lib/utils";
import {
acceptClaim,
declineClaimLink,
getClaim,
type ClaimInfo,
} from "@/lib/api";
import {
LEGAL_POLICY_URL,
RELEASE_CLAUSES,
RELEASE_CONFIRMATION_TEXT,
RELEASE_ENDING_PARAGRAPHS,
formatReleaseDate,
} from "@/data/confessionConsent";
type LoadState=
|{status:"loading"}
|{status:"error";message:string}
|{status:"expired";name:string|null}
|{status:"ready";info:ClaimInfo};
type Outcome=
|{kind:"accepted";couponCode:string;at:string}
|{kind:"declined";at:string};
function formatStamp(iso:string|null|undefined):string{
if(!iso)return "";
const date=new Date(iso).toLocaleDateString("en-GB",{
day:"2-digit",
month:"short",
year:"numeric",
});
const time=new Date(iso).toLocaleTimeString("en-IN",{
hour:"2-digit",
minute:"2-digit",
second:"2-digit",
hour12:true,
});
return `${date}\n${time}`;
}
function renderReleaseParagraph(paragraph:string):ReactNode{
if(!paragraph.includes(LEGAL_POLICY_URL))return paragraph;
const [beforeLink,afterLink]=paragraph.split(LEGAL_POLICY_URL);
return (
<>
{beforeLink}
<a
href={LEGAL_POLICY_URL}
target="_blank"
rel="noopener noreferrer"
className="font-medium text-blue-500 underline decoration-blue-500/80 underline-offset-2 transition-colors hover:text-blue-400"
>
{LEGAL_POLICY_URL}
</a>
{afterLink}
</>
);
}
export function ClaimConsentFlow({token}:{token:string}){
const [state,setState]=useState<LoadState>({status:"loading"});
const [accepted,setAccepted]=useState(false);
const [signatureDataUrl,setSignatureDataUrl]=useState<string|null>(null);
const [signaturePulse,setSignaturePulse]=useState(0);
const [signatureError,setSignatureError]=useState<string|null>(null);
const [submitError,setSubmitError]=useState<string|null>(null);
const [submitting,setSubmitting]=useState(false);
const [outcome,setOutcome]=useState<Outcome|null>(null);
useEffect(()=>{
let cancelled=false;
getClaim(token)
.then((info)=>{
if(cancelled)return;
if(info.expired){
setState({status:"expired",name:info.name});
return;
}
setState({status:"ready",info});
if(info.claimAccepted){
setOutcome({
kind:"accepted",
couponCode:info.couponCode??"",
at:info.claimAcceptedAt??"",
});
}else if(info.claimLinkDeclined){
setOutcome({
kind:"declined",
at:info.claimLinkDeclinedAt??"",
});
}
})
.catch((err:unknown)=>{
if(cancelled)return;
setState({
status:"error",
message:err instanceof Error?err.message:"Link not found.",
});
});
return()=>{
cancelled=true;
};
},[token]);
function handleFailure(err:unknown){
const message=err instanceof Error?err.message:"Could not submit. Please try again.";
if(message.toLowerCase().includes("expired")){
setState((previous)=>
previous.status==="ready"
?{status:"expired",name:previous.info.name}
:previous,
);
return;
}
setSubmitError(message);
}
async function handleAccept(){
setSubmitError(null);
if(!signatureDataUrl){
setSignatureError("Please provide your signature to continue.");
setSignaturePulse((value)=>value+1);
window.setTimeout(()=>{
document.getElementById("consent-signature")?.scrollIntoView({
behavior:"smooth",
block:"center",
});
},50);
return;
}
setSignatureError(null);
setSubmitting(true);
try{
const result=await acceptClaim(token,signatureDataUrl);
setOutcome({
kind:"accepted",
couponCode:result.couponCode,
at:new Date().toISOString(),
});
}catch(err:unknown){
handleFailure(err);
}finally{
setSubmitting(false);
}
}
async function handleDecline(){
setSubmitError(null);
setSubmitting(true);
try{
await declineClaimLink(token);
setOutcome({
kind:"declined",
at:new Date().toISOString(),
});
}catch(err:unknown){
handleFailure(err);
}finally{
setSubmitting(false);
}
}
return (
<section className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-8 sm:py-14">
<AnimatedBackground particleCount={16}/>
{state.status==="loading"&&(
<div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-6">
<img
src={import.meta.env.BASE_URL+"images/bb-logo.png"}
alt="Bigg Boss Season 10"
className="h-24 w-auto object-contain sm:h-28"
/>
<p className="text-sm text-muted-foreground">Loading…</p>
</div>
)}
{state.status==="error"&&(
<div className="relative z-10 flex min-h-[70vh] items-center justify-center">
<p className="text-center text-sm text-destructive">{state.message}</p>
</div>
)}
{state.status==="expired"&&(
<div className="relative z-10 flex min-h-[70vh] items-center justify-center">
<ExpiredCard name={state.name}/>
</div>
)}
{state.status==="ready"&&(
<motion.div
className="relative z-10 mx-auto w-full max-w-6xl"
initial={{opacity:0,y:24,filter:"blur(10px)"}}
animate={{opacity:1,y:0,filter:"blur(0px)"}}
transition={{duration:0.8,ease:[0.16,1,0.3,1]}}
>
<div
className="relative overflow-hidden rounded-2xl border border-primary/50 px-5 py-6 sm:px-8 sm:py-8"
style={{
background:"linear-gradient(150deg, oklch(0.22 0.02 60), oklch(0.13 0.012 60)), radial-gradient(circle at 20% 0%, color-mix(in oklab, var(--gold) 20%, transparent), transparent 55%)",
boxShadow:"var(--shadow-gold), var(--shadow-deep)",
}}
>
<span className="pointer-events-none absolute -left-px -top-px size-8 rounded-tl-2xl border-l-2 border-t-2 border-primary"/>
<span className="pointer-events-none absolute -bottom-px -right-px size-8 rounded-br-2xl border-b-2 border-r-2 border-primary"/>
<div className="text-center">
<img
src={import.meta.env.BASE_URL+"images/bb-logo.png"}
alt="Bigg Boss Season 10"
className="mx-auto h-24 w-auto object-contain sm:h-28"
/>
<p className="mt-5 text-xs tracking-[0.3em] text-primary sm:text-sm">
BIGG BOSS TAMIL – AUDITION
</p>
<h1 className="display text-gold mt-2 text-[clamp(1.1rem,4vw,1.6rem)] leading-tight">
RELEASE LETTER
</h1>
</div>
<div className="mt-8 flex flex-col gap-8 lg:flex-row lg:divide-x lg:divide-primary/20">
<div className="lg:w-64 lg:shrink-0 lg:pr-8">
<JourneyList info={state.info} outcome={outcome}/>
</div>
<div className="min-w-0 flex-1 lg:pl-8">
{!outcome&&(
<ConsentPanel
info={state.info}
accepted={accepted}
onAcceptedChange={setAccepted}
signatureDataUrl={signatureDataUrl}
onSignatureChange={(value)=>{
setSignatureDataUrl(value);
if(value)setSignatureError(null);
}}
signaturePulse={signaturePulse}
signatureError={signatureError}
submitError={submitError}
onAccept={handleAccept}
onDecline={handleDecline}
submitting={submitting}
/>
)}
{outcome?.kind==="accepted"&&(
<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
transition={{duration:0.7}}
>
<GoldConfetti count={60} mode="fall"/>
<h1 className="display text-gold text-center text-[clamp(1.6rem,5vw,2.2rem)] leading-none">
Congratulations!
</h1>
<div className="mt-8">
<EntryCoupon
participant={{
name:state.info.name??"",
phone:state.info.phone??"",
}}
code={outcome.couponCode}
/>
</div>
</motion.div>
)}
{outcome?.kind==="declined"&&<DeclinedPanel/>}
</div>
</div>
</div>
</motion.div>
)}
</section>
);
}
interface JourneyStep{
label:string;
detail:string;
status:"done"|"current"|"upcoming";
}
function buildJourneySteps(info:ClaimInfo,outcome:Outcome|null):JourneyStep[]{
const consentDone=outcome!==null;
return [
{
label:"Spin Wheel",
detail:info.wheelSpinCompletedAt?formatStamp(info.wheelSpinCompletedAt):"",
status:info.wheelSpinCompletedAt?"done":"upcoming",
},
{
label:`Task Performance${info.wheelCategory?` (${info.wheelCategory})`:""}`,
detail:info.taskCompletedAt?formatStamp(info.taskCompletedAt):"",
status:info.taskCompletedAt?"done":"upcoming",
},
{
label:"Flip Coin",
detail:info.coinFlipCompletedAt?formatStamp(info.coinFlipCompletedAt):"",
status:info.coinFlipCompletedAt?"done":"upcoming",
},
{
label:"Details Submitted",
detail:info.detailsSubmittedAt?formatStamp(info.detailsSubmittedAt):"",
status:info.detailsSubmittedAt?"done":"upcoming",
},
{
label:"Consent Letter",
detail:consentDone
?`${outcome?.kind==="accepted"?"Accepted":"Declined"}\n${formatStamp(outcome?.at)}`
:"Please review, sign & accept",
status:consentDone?"done":"current",
},
{
label:"Coupon Code",
detail:
outcome?.kind==="accepted"
?`Ready\n${formatStamp(outcome.at)}`
:outcome?.kind==="declined"
?"Not issued"
:"Will be shown after acceptance",
status:outcome?.kind==="accepted"?"done":"upcoming",
},
];
}
function JourneyList({info,outcome}:{info:ClaimInfo;outcome:Outcome|null}){
const steps=buildJourneySteps(info,outcome);
return (
<div>
<p className="text-xs font-bold tracking-[0.25em] text-primary">YOUR JOURNEY</p>
<ol className="mt-5 space-y-5">
{steps.map((step,index)=>(
<li key={step.label} className="relative flex gap-3 pl-1">
{index<steps.length-1&&(
<span
className={cn(
"absolute left-[11px] top-6 h-[calc(100%+0.25rem)] w-px",
step.status==="done"?"bg-primary/50":"bg-border",
)}
/>
)}
{step.status==="done"?(
<CheckCircle2 className="size-[22px] shrink-0 text-primary"/>
):(
<Circle
className={cn(
"size-[22px] shrink-0",
step.status==="current"?"text-primary":"text-muted-foreground/50",
)}
/>
)}
<div>
<p
className={cn(
"text-sm font-semibold",
step.status==="upcoming"?"text-muted-foreground":"text-foreground",
)}
>
{step.label}
</p>
{step.detail&&(
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
icon:Icon,
label,
value,
}:{
icon:LucideIcon;
label:string;
value:string;
}){
return (
<div className="flex items-start gap-2">
<Icon className="mt-0.5 size-4 shrink-0 text-primary"/>
<div>
<p className="text-[0.65rem] tracking-[0.25em] text-muted-foreground">{label}</p>
<p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
</div>
</div>
);
}
interface ConsentPanelProps{
info:ClaimInfo;
accepted:boolean;
onAcceptedChange:(accepted:boolean)=>void;
signatureDataUrl:string|null;
onSignatureChange:(value:string|null)=>void;
signaturePulse:number;
signatureError:string|null;
submitError:string|null;
onAccept:()=>void;
onDecline:()=>void;
submitting:boolean;
}
function ConsentPanel({
info,
accepted,
onAcceptedChange,
signatureDataUrl,
onSignatureChange,
signaturePulse,
signatureError,
submitError,
onAccept,
onDecline,
submitting,
}:ConsentPanelProps){
const currentDate=formatReleaseDate(new Date());
const location=info.currentLocation?.trim()||"Not configured";
const state=info.state?.trim()||"Tamil Nadu";
const participantName=info.name?.trim()||"Participant";
return (
<div>
<p className="text-xs font-bold tracking-[0.25em] text-primary">CONSENT LETTER</p>
<p className="mt-1 text-xs text-muted-foreground sm:text-sm">
Please read the release carefully, confirm it and provide your signature.
</p>
<div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-primary/30 bg-black/20 px-5 py-4 sm:grid-cols-2">
<AutoField icon={UserIcon} label="PARTICIPANT NAME" value={participantName}/>
<AutoField
icon={PhoneIcon}
label="MOBILE NUMBER"
value={info.phone?formatPhone(info.phone):"—"}
/>
<AutoField icon={UserIcon} label="PARTICIPANT ID" value={info.participantId}/>
<AutoField icon={MapPin} label="LOCATION" value={location}/>
<AutoField icon={CalendarDays} label="DATE" value={currentDate}/>
</div>
{!info.currentLocation?.trim()&&(
<p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
Campaign location is not configured. Please contact the administrator before accepting.
</p>
)}
<div className="mt-4 max-h-[32rem] space-y-4 overflow-y-auto rounded-xl border border-primary/20 bg-black/20 px-5 py-5 text-left text-xs leading-relaxed text-muted-foreground sm:text-sm">
<p className="text-foreground">{currentDate}</p>
<p className="text-center text-sm font-bold tracking-wide text-primary sm:text-base">
RELEASE LETTER
</p>
<p>
I,{" "}
<span className="font-semibold text-foreground">{participantName}</span>
, an adult citizen and resident of India, residing at{" "}
<span className="font-semibold text-foreground">{location}</span>,{" "}
<span className="font-semibold text-foreground">{state}</span>, state that:
</p>
{RELEASE_CLAUSES.map((paragraph)=>(
<p key={paragraph.slice(0,8)}>
{renderReleaseParagraph(paragraph)}
</p>
))}
{RELEASE_ENDING_PARAGRAPHS.map((paragraph)=>(
<p key={paragraph.slice(0,20)}>{paragraph}</p>
))}
<div className="pt-2 text-foreground">
<p>Regards,</p>
<p className="mt-2">Name: {participantName}</p>
<p>Place: {location}</p>
</div>
</div>
<div className="mt-5 rounded-xl border border-primary/30 bg-black/20 px-5 py-5">
<p className="text-xs font-bold tracking-wide text-primary sm:text-sm">
PARTICIPANT CONFIRMATION
</p>
<p className="mt-3 text-left text-xs leading-relaxed text-muted-foreground sm:text-sm">
{RELEASE_CONFIRMATION_TEXT}
</p>
<label className="mt-4 flex items-start gap-3 text-left text-xs leading-relaxed text-foreground sm:text-sm">
<input
type="checkbox"
checked={accepted}
onChange={(event)=>onAcceptedChange(event.target.checked)}
className="mt-0.5 size-5 shrink-0 accent-primary"
/>
I have read and understood the above terms and conditions and I agree to proceed.
</label>
</div>
<div id="consent-signature" className="mt-5 scroll-mt-8">
<SignaturePad
value={signatureDataUrl}
onChange={(value)=>onSignatureChange(value)}
invalidPulse={signaturePulse}
/>
{signatureError&&(
<p className="mt-2 text-sm text-destructive">{signatureError}</p>
)}
</div>
{submitError&&(
<p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
{submitError}
</p>
)}
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
disabled={!accepted||submitting||!info.currentLocation?.trim()}
className="btn-gold flex-1 px-10 py-4 text-sm sm:text-base"
>
<span className="block">{submitting?"Please wait…":"Accept & Proceed"}</span>
<span className="block text-xs font-normal normal-case opacity-70">
I agree to the terms
</span>
</button>
</div>
<p className="mt-4 text-center text-[0.65rem] text-muted-foreground">
Your signature is securely stored with your finalized release letter.
</p>
</div>
);
}
function DeclinedPanel(){
return (
<motion.div
className="text-center"
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
transition={{duration:0.7}}
>
<img
src={import.meta.env.BASE_URL+"images/bb-eye.png"}
alt="Bigg Boss"
className="mx-auto h-11 w-auto object-contain"
/>
<h1 className="display mt-6 text-[clamp(1.4rem,4vw,2rem)] leading-none text-destructive">
Coupon Declined
</h1>
<p className="mt-4 text-sm text-muted-foreground sm:text-base">
You&apos;ve chosen not to proceed. Your Challenge Entry Coupon has been declined.
</p>
</motion.div>
);
}
function ExpiredCard({name:_name}:{name:string|null}){
return (
<motion.div
className="w-full max-w-xl text-center"
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
transition={{duration:0.7}}
>
<img
src={import.meta.env.BASE_URL+"images/bb-logo.png"}
alt="Bigg Boss Season 10"
className="mx-auto h-16 w-auto object-contain"
/>
<h1 className="display text-gold mt-6 text-[clamp(1.8rem,6vw,2.6rem)] leading-none">
Your Link Has Expired
</h1>
<p className="mt-4 text-sm text-muted-foreground sm:text-base">
The 5-minute validity period has ended, and the claim was not accepted in time.
</p>
</motion.div>
);
}