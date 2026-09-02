import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Link2,
  PanelRightOpen,
  Sparkles,
  Target,
  TimerOff,
  XCircle,
} from "lucide-react";
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

function CopyChip({
  label,
  value,
  icon: Icon = Copy,
}: {
  label: string;
  value: string;
  icon?: typeof Copy;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 font-mono text-xs tracking-widest text-primary"
    >
      {label}
      {copied ? <Check className="size-3" /> : <Icon className="size-3" />}
    </button>
  );
}

const CLAIM_WINDOW_MS = 5 * 60 * 1000;

function isClaimExpired(p: ParticipantJourney): boolean {
  if (p.claimAccepted || p.claimLinkDeclined) return false;
  if (!p.detailsSubmittedAt) return false;
  return Date.now() - new Date(p.detailsSubmittedAt).getTime() > CLAIM_WINDOW_MS;
}

function claimExpiresAt(p: ParticipantJourney): string | null {
  if (!p.detailsSubmittedAt) return null;
  return new Date(new Date(p.detailsSubmittedAt).getTime() + CLAIM_WINDOW_MS).toISOString();
}

function ConsentAcknowledgement({ p }: { p: ParticipantJourney }) {
  if (p.coinResult === "COUPON")
    return (
      <StatusBadge tone="success" icon={CheckCircle2}>
        Accepted
      </StatusBadge>
    );
  if (p.coinResult === "COUPON_DECLINED")
    return (
      <StatusBadge tone="danger" icon={XCircle}>
        Declined
      </StatusBadge>
    );
  if (p.coinResult === "COUPON_PENDING") {
    if (isClaimExpired(p))
      return (
        <StatusBadge tone="danger" icon={TimerOff}>
          Link Expired
        </StatusBadge>
      );
    return (
      <StatusBadge tone="pending" icon={Clock}>
        Pending
      </StatusBadge>
    );
  }
  return <span className="text-muted-foreground">N/A</span>;
}

export function ParticipantJourneyRow({
  participant,
  index,
  onOpen,
  onOpenConsent,
}: {
  participant: ParticipantJourney;
  index: number;
  onOpen: (p: ParticipantJourney) => void;
  onOpenConsent: (p: ParticipantJourney) => void;
}) {
  const p = participant;
  const coinResult = p.coinResult ?? "NOT_FLIPPED";

  return (
    <tr className="border-b border-border/60 align-top transition-colors hover:bg-surface-raised/60">
      <td className="px-4 py-4 text-sm text-muted-foreground">{String(index).padStart(2, "0")}</td>
      <td className="px-4 py-4">
        <p className="font-semibold">{p.name?.trim() || "Guest"}</p>
        <p className="text-xs text-muted-foreground">{p.phone ? formatPhone(p.phone) : "—"}</p>
      </td>
      <td className="px-4 py-4 text-sm">
        <p>{formatDate(p.registeredAt)}</p>
        <p className="text-xs text-muted-foreground">{formatTime(p.registeredAt)}</p>
      </td>
      <td className="px-4 py-4">
        {p.wheelCategory ? (
          <>
            <StatusBadge tone="gold" icon={Target}>
              {p.wheelCategory}
            </StatusBadge>
            <p className="mt-1 text-xs text-muted-foreground">
              Spun at {formatTime(p.wheelSpinStartedAt ?? p.wheelSpinCompletedAt)}
            </p>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-4">
        <StatusBadge
          tone={taskStatusTone(p.taskStatus)}
          icon={
            p.taskStatus === "COMPLETED"
              ? CheckCircle2
              : p.taskStatus === "FAILED"
                ? XCircle
                : Clock
          }
        >
          {p.taskStatus ?? "PENDING"}
        </StatusBadge>
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
        <StatusBadge tone={coinResultTone(coinResult)} icon={coinResultIcon(coinResult)}>
          {COIN_RESULT_LABEL[coinResult]}
        </StatusBadge>
        {p.coinFlipCompletedAt && (
          <p className="mt-1 text-xs text-muted-foreground">{formatTime(p.coinFlipCompletedAt)}</p>
        )}
      </td>
      <td className="px-4 py-4">
        {p.claimToken ? (
          <>
            <CopyChip
              label="Link"
              icon={Link2}
              value={`${window.location.origin}/bcm/?token=${p.claimToken}`}
            />
            <p className="mt-1 text-xs text-muted-foreground">{formatDate(p.detailsSubmittedAt)}</p>
            <p className="text-xs text-muted-foreground">{formatTime(p.detailsSubmittedAt)}</p>
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-4">
        <ConsentAcknowledgement p={p} />
        {(p.claimAcceptedAt || p.claimLinkDeclinedAt) && (
          <>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(p.claimAcceptedAt ?? p.claimLinkDeclinedAt)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTime(p.claimAcceptedAt ?? p.claimLinkDeclinedAt)}
            </p>
          </>
        )}
        {!p.claimAcceptedAt && !p.claimLinkDeclinedAt && isClaimExpired(p) && (
          <>
            <p className="mt-1 text-xs text-destructive">Expired {formatDate(claimExpiresAt(p))}</p>
            <p className="text-xs text-destructive">{formatTime(claimExpiresAt(p))}</p>
          </>
        )}
      </td>
      <td className="px-4 py-4">
        {p.couponCode ? (
          <>
            <CopyChip label={p.couponCode} value={p.couponCode} />
            <p className="mt-1 text-xs text-muted-foreground">{formatDate(p.claimAcceptedAt)}</p>
            <p className="text-xs text-muted-foreground">{formatTime(p.claimAcceptedAt)}</p>
          </>
        ) : coinResult === "COUPON_PENDING" ? (
          isClaimExpired(p) ? (
            <span className="text-xs text-destructive">Link Expired — not claimed</span>
          ) : (
            <span className="text-xs text-amber">Awaiting consent acknowledgement</span>
          )
        ) : coinResult === "COUPON_DECLINED" ? (
          <span className="text-xs text-destructive">Declined by participant</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-2 py-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onOpen(p)} aria-label="View journey">
            <PanelRightOpen />
          </Button>
          {p.claimAccepted && p.consentPdfKey && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenConsent(p)}
              aria-label="View consent PDF"
              title="View consent PDF"
            >
              <FileText className="text-primary" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

function coinResultIcon(result: string) {
  if (result === "COUPON") return Sparkles;
  if (result === "COUPON_DECLINED") return XCircle;
  if (result === "NOT_INTERESTED") return XCircle;
  if (result === "BETTER_LUCK_NEXT_TIME") return TimerOff;
  if (result === "COUPON_PENDING") return Clock;
  return undefined;
}

function finalStatusIcon(status: string) {
  if (status === "COUPON_WINNER") return Sparkles;
  if (status === "TASK_FAILED" || status === "COUPON_DECLINED") return XCircle;
  if (status === "BETTER_LUCK_NEXT_TIME") return TimerOff;
  if (status === "COUPON_PENDING") return Clock;
  return undefined;
}

export function ParticipantJourneyCard({
  participant,
  onOpen,
  onOpenConsent,
}: {
  participant: ParticipantJourney;
  onOpen: (p: ParticipantJourney) => void;
  onOpenConsent: (p: ParticipantJourney) => void;
}) {
  const p = participant;
  const status = finalStatusOf(p);
  const coinResult = p.coinResult ?? "NOT_FLIPPED";

  return (
    <div className="glass-panel space-y-3 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{p.name?.trim() || "Guest"}</p>
          <p className="text-xs text-muted-foreground">{p.phone ? formatPhone(p.phone) : "—"}</p>
        </div>
        <StatusBadge
          tone={
            status === "COUPON_WINNER" ? "gold" : status === "COUPON_PENDING" ? "amber" : "muted"
          }
          icon={finalStatusIcon(status)}
        >
          {FINAL_STATUS_LABEL[status]}
        </StatusBadge>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Participant Started</p>
          <p>{formatTime(p.registeredAt)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">Wheel</p>
          <p>{p.wheelCategory ?? "—"}</p>
        </div>
      </div>
      {p.wheelTask && <p className="text-sm leading-snug">{p.wheelTask}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge
          tone={taskStatusTone(p.taskStatus)}
          icon={
            p.taskStatus === "COMPLETED"
              ? CheckCircle2
              : p.taskStatus === "FAILED"
                ? XCircle
                : Clock
          }
        >
          {p.taskStatus ?? "PENDING"}
        </StatusBadge>
        <StatusBadge tone={coinResultTone(coinResult)} icon={coinResultIcon(coinResult)}>
          {COIN_RESULT_LABEL[coinResult]}
        </StatusBadge>
        {p.couponCode && <CopyChip label={p.couponCode} value={p.couponCode} />}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button variant="outline" size="sm" className="w-full" onClick={() => onOpen(p)}>
          <PanelRightOpen className="size-4" /> View Details
        </Button>
        {p.claimAccepted && p.consentPdfKey && (
          <Button variant="outline" size="sm" className="w-full" onClick={() => onOpenConsent(p)}>
            <FileText className="size-4" /> Consent PDF
          </Button>
        )}
      </div>
    </div>
  );
}
