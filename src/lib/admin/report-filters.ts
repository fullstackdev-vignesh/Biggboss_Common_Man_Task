import { finalStatusOf, type ParticipantJourney } from "@/types/admin";
import { normalizePhone } from "./format";

export type DatePreset =
  "TODAY" | "YESTERDAY" | "LAST_7" | "LAST_30" | "CUSTOM_DATE" | "CUSTOM_RANGE" | "ALL";

export const DATE_PRESET_LABEL: Record<DatePreset, string> = {
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  LAST_7: "Last 7 Days",
  LAST_30: "Last 30 Days",
  CUSTOM_DATE: "Custom Date",
  CUSTOM_RANGE: "Custom Range",
  ALL: "All Time",
};

export interface ReportFilters {
  search: string;
  datePreset: DatePreset;
  fromDate: string;
  toDate: string;
  taskStatus: "ALL" | "COMPLETED" | "FAILED" | "PENDING";
  category: string;
  coinResult:
    "ALL" | "COUPON" | "COUPON_PENDING" | "BETTER_LUCK_NEXT_TIME" | "NOT_ELIGIBLE" | "NOT_FLIPPED";
}

const TZ = "Asia/Kolkata";

/** yyyy-mm-dd in Asia/Kolkata for a given instant. */
export function istDayKey(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function todayKey(): string {
  return istDayKey(new Date());
}

function shiftKey(days: number): string {
  return istDayKey(new Date(Date.now() + days * 86400000));
}

export function defaultFilters(): ReportFilters {
  return {
    search: "",
    datePreset: "TODAY",
    fromDate: todayKey(),
    toDate: todayKey(),
    taskStatus: "ALL",
    category: "ALL",
    coinResult: "ALL",
  };
}

export function dateRangeFor(f: ReportFilters): { from?: string; to?: string } {
  switch (f.datePreset) {
    case "TODAY":
      return { from: todayKey(), to: todayKey() };
    case "YESTERDAY":
      return { from: shiftKey(-1), to: shiftKey(-1) };
    case "LAST_7":
      return { from: shiftKey(-6), to: todayKey() };
    case "LAST_30":
      return { from: shiftKey(-29), to: todayKey() };
    case "CUSTOM_DATE":
      return { from: f.fromDate, to: f.fromDate };
    case "CUSTOM_RANGE":
      return { from: f.fromDate, to: f.toDate };
    case "ALL":
    default:
      return {};
  }
}

export function applyFilters(rows: ParticipantJourney[], f: ReportFilters): ParticipantJourney[] {
  const { from, to } = dateRangeFor(f);
  const term = f.search.trim().toLowerCase();
  const phoneTerm = normalizePhone(f.search);
  const searchIsPhone = phoneTerm.length >= 2 && /\d/.test(f.search);

  return rows.filter((p) => {
    const key = istDayKey(p.registeredAt);
    if (from && key < from) return false;
    if (to && key > to) return false;

    if (term) {
      const nameHit = (p.name ?? "").toLowerCase().includes(term);
      const phoneHit = searchIsPhone && normalizePhone(p.phone).includes(phoneTerm);
      if (!nameHit && !phoneHit) return false;
    }

    if (f.taskStatus !== "ALL") {
      const status = p.taskStatus ?? "PENDING";
      if (status !== f.taskStatus) return false;
    }

    if (f.category !== "ALL" && p.wheelCategory !== f.category) return false;

    if (f.coinResult !== "ALL") {
      const result = p.coinResult ?? "NOT_FLIPPED";
      if (result !== f.coinResult) return false;
    }

    return true;
  });
}

export type SortKey =
  "registeredAt" | "wheelSpinCompletedAt" | "taskStatus" | "coinFlipCompletedAt" | "coinResult";

export function sortRows(
  rows: ParticipantJourney[],
  key: SortKey,
  dir: "asc" | "desc",
): ParticipantJourney[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = (a[key] ?? "") as string;
    const bv = (b[key] ?? "") as string;
    if (av === bv) return 0;
    return av > bv ? sign : -sign;
  });
}

export function computeStats(rows: ParticipantJourney[]) {
  return {
    total: rows.length,
    spins: rows.filter((p) => !!p.wheelSpinCompletedAt).length,
    completed: rows.filter((p) => p.taskStatus === "COMPLETED").length,
    failed: rows.filter((p) => p.taskStatus === "FAILED").length,
    coinRound: rows.filter((p) => !!p.coinFlipCompletedAt).length,
    winners: rows.filter((p) => p.coinResult === "COUPON" || p.coinResult === "COUPON_PENDING")
      .length,
    betterLuck: rows.filter((p) => p.coinResult === "BETTER_LUCK_NEXT_TIME").length,
  };
}

export function statusSummary(p: ParticipantJourney) {
  return finalStatusOf(p);
}
