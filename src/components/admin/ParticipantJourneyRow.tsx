import { Check, Copy, PanelRightOpen } from "lucide-react";
import { useState } from "react";

import {
  COIN_RESULT_LABEL,
  StatusBadge,
  coinResultTone,
  taskStatusTone,
} from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/admin/format";
import { formatPhone } from "@/lib/utils";
import { FINAL_STATUS_LABEL, finalStatusOf, type ParticipantJourney } from "@/types/admin";

function CouponCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 font-mono text-xs tracking-widest text-primary"
    >
      {code}
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  );
}

export function ParticipantJourneyRow({
  participant,
  index,
  onOpen,
}: {
  participant: ParticipantJourney;
  index: number;
  onOpen: (p: ParticipantJourney) => void;
}) {
  const p = participant;
  const status = finalStatusOf(p);
  const coinResult = p.coinResult ?? "NOT_FLIPPED";

  return (
    <tr className="border-b border-border/60 align-top transition-colors hover:bg-surface-raised/60">
      <td className="px-4 py-4 text-sm text-muted-foreground">{String(index).padStart(2, "0")}</td>
      <td className="px-4 py-4">
        <p className="font-semibold">{p.name?.trim() || "Guest Participant"}</p>
        <p className="text-xs text-muted-foreground">{p.phone ? formatPhone(p.phone) : "—"}</p>
      </td>
      <td className="px-4 py-4 text-sm">
        <p>{formatDate(p.registeredAt)}</p>
        <p className="text-xs text-muted-foreground">{formatTime(p.registeredAt)}</p>
      </td>
      <td className="px-4 py-4">
        {p.wheelCategory ? (
          <>
            <StatusBadge tone="gold">{p.wheelCategory}</StatusBadge>
            <p className="mt-1 text-xs text-muted-foreground">
              Spun at {formatTime(p.wheelSpinStartedAt ?? p.wheelSpinCompletedAt)}
            </p>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </td>
      <td className="max-w-[260px] px-4 py-4 text-sm leading-snug" title={p.wheelTask ?? ""}>
        {p.wheelTask ? (
          <span className="line-clamp-3 block">{p.wheelTask}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-4">
        <StatusBadge tone={taskStatusTone(p.taskStatus)}>{p.taskStatus ?? "PENDING"}</StatusBadge>
        {(p.taskCompletedAt || p.taskFailedAt) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatTime(p.taskCompletedAt ?? p.taskFailedAt)}
          </p>
        )}
      </td>
      <td className="px-4 py-4 text-sm">
        {p.coinEligible ? (
          <>
            <p className="font-medium text-success">Eligible</p>
            <p className="text-xs text-muted-foreground">
              {p.coinFlipStartedAt
                ? `Flipped ${formatTime(p.coinFlipStartedAt)}`
                : "Not flipped yet"}
            </p>
          </>
        ) : (
          <span className="text-muted-foreground">Not Eligible</span>
        )}
      </td>
      <td className="px-4 py-4">
        <StatusBadge tone={coinResultTone(coinResult)}>{COIN_RESULT_LABEL[coinResult]}</StatusBadge>
        {p.coinFlipCompletedAt && (
          <p className="mt-1 text-xs text-muted-foreground">{formatTime(p.coinFlipCompletedAt)}</p>
        )}
      </td>
      <td className="px-4 py-4">
        {p.couponCode ? (
          <CouponCode code={p.couponCode} />
        ) : coinResult === "COUPON_PENDING" ? (
          <span className="text-xs text-amber">Awaiting claim link</span>
        ) : coinResult === "COUPON_DECLINED" ? (
          <span className="text-destructive text-xs">Declined by participant</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-4">
        <StatusBadge
          tone={
            status === "COUPON_WINNER"
              ? "gold"
              : status === "TASK_FAILED" || status === "COUPON_DECLINED"
                ? "danger"
                : status === "BETTER_LUCK_NEXT_TIME" || status === "COUPON_PENDING"
                  ? "amber"
                  : "muted"
          }
        >
          {FINAL_STATUS_LABEL[status]}
        </StatusBadge>
      </td>
      <td className="px-2 py-4">
        <Button variant="ghost" size="icon" onClick={() => onOpen(p)} aria-label="View details">
          <PanelRightOpen />
        </Button>
      </td>
    </tr>
  );
}

export function ParticipantJourneyCard({
  participant,
  onOpen,
}: {
  participant: ParticipantJourney;
  onOpen: (p: ParticipantJourney) => void;
}) {
  const p = participant;
  const status = finalStatusOf(p);
  const coinResult = p.coinResult ?? "NOT_FLIPPED";
  return (
    <div className="glass-panel space-y-3 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{p.name?.trim() || "Guest Participant"}</p>
          <p className="text-xs text-muted-foreground">{p.phone ? formatPhone(p.phone) : "—"}</p>
        </div>
        <StatusBadge
          tone={
            status === "COUPON_WINNER" ? "gold" : status === "COUPON_PENDING" ? "amber" : "muted"
          }
        >
          {FINAL_STATUS_LABEL[status]}
        </StatusBadge>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Registered</p>
          <p>{formatTime(p.registeredAt)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Wheel</p>
          <p>{p.wheelCategory ?? "—"}</p>
        </div>
      </div>
      {p.wheelTask && <p className="text-sm leading-snug">{p.wheelTask}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={taskStatusTone(p.taskStatus)}>{p.taskStatus ?? "PENDING"}</StatusBadge>
        <StatusBadge tone={coinResultTone(coinResult)}>{COIN_RESULT_LABEL[coinResult]}</StatusBadge>
        {p.couponCode && <CouponCode code={p.couponCode} />}
      </div>
      <Button variant="outline" size="sm" className="w-full" onClick={() => onOpen(p)}>
        View Details
      </Button>
    </div>
  );
}
