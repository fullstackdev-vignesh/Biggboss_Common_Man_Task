import type { BiggUser } from "@/lib/api";
import type { CoinResult, ParticipantJourney, TaskStatus } from "@/types/admin";

const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "https://backend-bq11.onrender.com";


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

export interface ParticipantLimitInfo {
  configured: boolean;
  limit: number;
  usedCount: number;
}

/** The participant limit is a single global setting — it applies every day until an admin changes it. */
export async function fetchParticipantLimit(): Promise<ParticipantLimitInfo> {
  return request<ParticipantLimitInfo & { ok: true }>("/api/admin/limit");
}

export async function setParticipantLimit(limit: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/set-limit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.ok) {
    throw new Error(body?.message ?? "Could not update the participant limit.");
  }
}
