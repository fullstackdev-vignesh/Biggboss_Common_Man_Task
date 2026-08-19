import type { ParticipantJourney } from "@/types/admin";
import { todayKey } from "./report-filters";

const HEADERS = [
  "Participant ID",
  "Name",
  "Phone",
  "Registered At",
  "Wheel Spin Started At",
  "Wheel Spin Completed At",
  "Wheel Category",
  "Wheel Task",
  "Task Status",
  "Task Completed At",
  "Task Failed At",
  "Coin Eligible",
  "Coin Flip Started At",
  "Coin Flip Completed At",
  "Coin Result",
  "Coupon Code",
  "Completed At",
];

function cell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export function toCsv(rows: ParticipantJourney[]): string {
  const lines = [HEADERS.map(cell).join(",")];
  for (const p of rows) {
    lines.push(
      [
        p.id,
        p.name ?? "",
        p.phone,
        p.registeredAt,
        p.wheelSpinStartedAt ?? "",
        p.wheelSpinCompletedAt ?? "",
        p.wheelCategory ?? "",
        p.wheelTask ?? "",
        p.taskStatus ?? "",
        p.taskCompletedAt ?? "",
        p.taskFailedAt ?? "",
        p.coinEligible ? "TRUE" : "FALSE",
        p.coinFlipStartedAt ?? "",
        p.coinFlipCompletedAt ?? "",
        p.coinResult ?? "",
        p.couponCode ?? "",
        p.completedAt ?? "",
      ]
        .map(cell)
        .join(","),
    );
  }
  return lines.join("\n");
}

export function downloadCsv(rows: ParticipantJourney[]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `biggboss-report-${todayKey()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
