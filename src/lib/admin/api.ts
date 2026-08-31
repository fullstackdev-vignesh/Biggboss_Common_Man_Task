import type { BiggUser } from "@/lib/api";
import type { CoinResult, ParticipantJourney, TaskStatus } from "@/types/admin";

const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "https://backend-bq11.onrender.com";
// const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:3001";

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.ok) {
    throw new Error(body?.message ?? "Something went wrong. Please try again.");
  }
  return body as T;
}

function toTaskStatus(spinnerStatus: BiggUser["spinnerStatus"]): TaskStatus {
  if (spinnerStatus === "completed") return "COMPLETED";
  if (spinnerStatus === "rejected") return "FAILED";
  return "PENDING";
}

// A coin win only becomes "COUPON" once the participant has opened their
// claim link, ticked "I Accept" and submitted — until then it's pending,
// and the coupon code stays hidden (see the claim-link flow in api.ts).
function toCoinResult(user: BiggUser): CoinResult {
  if (user.coinResult === "win") {
    if (user.claimDeclined) return "NOT_INTERESTED";
    if (user.claimLinkDeclined) return "COUPON_DECLINED";
    return user.claimAccepted ? "COUPON" : "COUPON_PENDING";
  }
  if (user.coinResult === "lose") return "BETTER_LUCK_NEXT_TIME";
  if (user.spinnerStatus === "rejected") return "NOT_ELIGIBLE";
  return "NOT_FLIPPED";
}

function toJourney(user: BiggUser): ParticipantJourney {
  return {
    id: user._id,
    name: user.name ?? null,
    phone: user.phone ?? "",
    registeredAt: user.createdAt,
    wheelSpinStartedAt: user.wheelSpinStartedAt ?? null,
    wheelSpinCompletedAt: user.wheelSpinCompletedAt ?? null,
    wheelCategory: user.wheelCategory ?? user.spinnerResult ?? null,
    wheelTask: user.wheelTask ?? null,
    taskStatus: toTaskStatus(user.spinnerStatus),
    taskCompletedAt: user.taskCompletedAt ?? null,
    taskFailedAt: user.taskFailedAt ?? null,
    coinEligible: user.spinnerStatus === "completed",
    coinFlipStartedAt: user.coinFlipStartedAt ?? null,
    coinFlipCompletedAt: user.coinFlipCompletedAt ?? null,
    coinResult: toCoinResult(user),
    couponCode: user.claimAccepted ? (user.couponCode ?? null) : null,
    windowKey: user.windowKey ?? null,
    slotPlan: user.slotPlanSnapshot ?? null,
    claimToken: user.claimToken ?? null,
    detailsSubmittedAt: user.claimTokenIssuedAt ?? null,
    claimAccepted: user.claimAccepted ?? false,
    claimAcceptedAt: user.claimAcceptedAt ?? null,
    claimDeclined: user.claimDeclined ?? false,
    claimLinkDeclined: user.claimLinkDeclined ?? false,
    claimLinkDeclinedAt: user.claimLinkDeclinedAt ?? null,
    completedAt: user.completedAt ?? null,
  };
}

/** "All Time" has no natural range for the backend's dateStr index, so span from a safe epoch to today. */
const ALL_TIME_FROM = "2000-01-01";

export async function fetchJourneys(range: {
  from?: string;
  to?: string;
}): Promise<ParticipantJourney[]> {
  const from = range.from ?? ALL_TIME_FROM;
  const to = range.to ?? new Date().toISOString().slice(0, 10);
  const { users } = await request<{ ok: true; users: BiggUser[] }>(
    `/api/user/list?start=${from}&end=${to}`,
  );
  return users.map(toJourney);
}

export interface CampaignSettings {
  activeSlot: 1 | 2;
  dailyCap: number;
}

/** Active campaign slot plan + the (env-configured, read-only) daily coupon cap. */
export async function fetchCampaignSettings(): Promise<CampaignSettings> {
  return request<CampaignSettings & { ok: true }>("/api/admin/settings");
}

/** Persists the admin's chosen slot plan — applies to every day touched from now on. */
export async function setActiveCampaignSlot(slot: 1 | 2): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/active-slot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slot }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.ok) {
    throw new Error(body?.message ?? "Could not update the active campaign slot.");
  }
}

export interface CampaignWindowSummary {
  windowKey: string;
  label: string;
  /** The plan active when THIS window was first reached — a day can mix
   * plans if admin switches mid-day, so this can differ from the day's
   * current `slotPlan`. */
  slotPlan: 1 | 2;
  basePercent: number;
  baseQuota: number;
  carryIn: number;
  effectiveQuota: number;
  /** Reserved the moment a coin win is decided — prevents overselling while a claim is pending. */
  used: number;
  remaining: number;
  /** Consent letter actually Accepted — the real business number. */
  confirmed: number;
}

export interface CampaignDaySummary {
  dateStr: string;
  /** The plan currently governing the rest of this day — see each window's own `slotPlan` for its history. */
  slotPlan: 1 | 2;
  dailyCap: number;
  /** Reserved the moment a coin win is decided — prevents overselling while a claim is pending. */
  dailyIssued: number;
  dailyRemaining: number;
  /** Consent letter actually Accepted — the real business number. */
  dailyConfirmed: number;
  windows: CampaignWindowSummary[];
}

/** Per-date slot/window coupon-quota breakdown — powers the quota panel,
 * the slot/window report filters, and PDF/Excel exports. */
export async function fetchCampaignDays(range: {
  from?: string;
  to?: string;
}): Promise<CampaignDaySummary[]> {
  const from = range.from ?? ALL_TIME_FROM;
  const to = range.to ?? new Date().toISOString().slice(0, 10);
  const { days } = await request<{ ok: true; days: CampaignDaySummary[] }>(
    `/api/admin/campaign-days?start=${from}&end=${to}`,
  );
  return days;
}
