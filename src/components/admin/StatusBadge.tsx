import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "gold" | "success" | "danger" | "muted" | "pending" | "amber";

const TONE_CLASS: Record<Tone, string> = {
  gold: "border-primary/50 bg-primary/15 text-primary",
  success: "border-success/50 bg-success/15 text-success",
  danger: "border-destructive/50 bg-destructive/15 text-destructive",
  muted: "border-border bg-muted/50 text-muted-foreground",
  pending: "border-amber/40 bg-amber/10 text-amber",
  amber: "border-amber/50 bg-amber/15 text-amber",
};

export function StatusBadge({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function taskStatusTone(status?: string | null): Tone {
  if (status === "COMPLETED") return "success";
  if (status === "FAILED") return "danger";
  return "pending";
}

export function coinResultTone(result?: string | null): Tone {
  if (result === "COUPON") return "gold";
  if (result === "COUPON_PENDING") return "pending";
  if (result === "BETTER_LUCK_NEXT_TIME") return "amber";
  if (result === "NOT_ELIGIBLE") return "muted";
  return "pending";
}

export const COIN_RESULT_LABEL: Record<string, string> = {
  COUPON: "Coupon Winner",
  COUPON_PENDING: "Pending (Claim Link)",
  BETTER_LUCK_NEXT_TIME: "Better Luck Next Time",
  NOT_ELIGIBLE: "Not Eligible",
  NOT_FLIPPED: "Not Flipped Yet",
};
