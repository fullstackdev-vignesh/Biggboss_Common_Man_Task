import {
  CheckCircle2,
  CircleSlash,
  Coins,
  Frown,
  Link2,
  RotateCw,
  Ticket,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CARDS = [
  { key: "spins", label: "Wheel Spins", icon: RotateCw, tone: "text-primary" },
  { key: "failed", label: "Task Failed", icon: XCircle, tone: "text-destructive" },
  { key: "coinRound", label: "Coin Flips", icon: Coins, tone: "text-amber" },
  { key: "betterLuck", label: "Better Luck Next Time", icon: Frown, tone: "text-amber" },
  { key: "consentLinks", label: "Consent Links", icon: Link2, tone: "text-primary" },
  { key: "consentAccepted", label: "Consent Accepted", icon: CheckCircle2, tone: "text-success" },
  {
    key: "consentDeclined",
    label: "Consent Declined",
    icon: CircleSlash,
    tone: "text-destructive",
  },
  { key: "couponClaim", label: "Coupon Claim", icon: Ticket, tone: "text-primary" },
] as const;

export function ReportStats({
  stats,
  loading,
}: {
  stats: Record<string, number>;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.key} className="glass-panel flex items-start gap-3 rounded-xl px-4 py-3">
            <Icon className={cn("mt-0.5 size-5 shrink-0", card.tone)} />
            <div className="min-w-0">
              <p className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">
                {card.label}
              </p>
              {loading ? (
                <div className="shimmer mt-2 h-7 w-12 rounded" />
              ) : (
                <p className="display-font mt-1 text-3xl gold-text">{stats[card.key] ?? 0}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
