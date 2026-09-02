
/* eslint-disable */
// @ts-nocheck

import type { BiggUser } from "@/lib/api";
import type { CoinResult, ParticipantJourney, TaskStatus } from "@/types/admin";

// const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:3001";
const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "https://backend-bq11.onrender.com";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
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

    signatureUrl: user.signatureUrl ?? null,
    consentPdfKey: user.consentPdfKey ?? null,
    consentPdfUrl: user.consentPdfUrl ?? null,
  };
}

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

export async function fetchCampaignSettings(): Promise<CampaignSettings> {
  return request<CampaignSettings & { ok: true }>("/api/admin/settings");
}

export async function setActiveCampaignSlot(slot: 1 | 2): Promise<void> {
  await request<{ ok: true; activeSlot: 1 | 2 }>("/api/admin/active-slot", {
    method: "POST",
    body: JSON.stringify({ slot }),
  });
}

export interface CampaignWindowSummary {
  windowKey: string;
  label: string;
  slotPlan: 1 | 2;
  basePercent: number;
  baseQuota: number;
  carryIn: number;
  effectiveQuota: number;
  used: number;
  remaining: number;
  confirmed: number;
}

export interface CampaignDaySummary {
  dateStr: string;
  slotPlan: 1 | 2;
  dailyCap: number;
  dailyIssued: number;
  dailyRemaining: number;
  dailyConfirmed: number;
  windows: CampaignWindowSummary[];
}

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

export interface AdminLocation {
  currentLocation: string;
  state: string;
  updatedAt: string | null;
}

export interface AdminLocationHistoryEntry {
  location: string;
  updatedAt: string;
  dateStr: string;
}

export async function fetchAdminLocation(): Promise<AdminLocation> {
  const data = await request<{ ok: true } & AdminLocation>("/api/admin/location");
  return data;
}

export async function updateAdminLocation(
  location: string,
  state?: string,
): Promise<AdminLocation> {
  const data = await request<{ ok: true } & AdminLocation>("/api/admin/location", {
    method: "POST",
    body: JSON.stringify({ location, state }),
  });
  return data;
}

export async function fetchAdminLocationHistory(range: {
  from?: string;
  to?: string;
}): Promise<AdminLocationHistoryEntry[]> {
  const params = new URLSearchParams();
  if (range.from) params.set("start", range.from);
  if (range.to) params.set("end", range.to);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const data = await request<{ ok: true; history: AdminLocationHistoryEntry[] }>(
    `/api/admin/location-history${suffix}`,
  );
  return data.history;
}

export function adminConsentPdfUrl(userId: string, download = false): string {
  return `${API_BASE_URL}/api/admin/consent-pdf/${encodeURIComponent(userId)}${
    download ? "?download=1" : ""
  }`;
}
