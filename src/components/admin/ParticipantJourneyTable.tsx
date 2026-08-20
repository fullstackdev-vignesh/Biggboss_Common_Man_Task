import {
  ArrowDown,
  ArrowUp,
  Award,
  Calendar,
  Coins,
  Flag,
  Hash,
  Link2,
  ListTodo,
  MoreHorizontal,
  RotateCw,
  ShieldCheck,
  Ticket,
  User,
} from "lucide-react";

import {
  ParticipantJourneyCard,
  ParticipantJourneyRow,
} from "@/components/admin/ParticipantJourneyRow";
import { Button } from "@/components/ui/button";
import type { SortKey } from "@/lib/admin/report-filters";
import type { ParticipantJourney } from "@/types/admin";

const COLUMNS: {
  label: string;
  sort?: SortKey;
  className?: string;
  icon?: typeof Hash;
}[] = [
  { label: "S.No", icon: Hash },
  { label: "Participant", icon: User },
  { label: "Registered", sort: "registeredAt", icon: Calendar },
  { label: "Wheel", sort: "wheelSpinCompletedAt", icon: RotateCw },
  // { label: "Task", icon: ListTodo }, // hidden for now — future use
  { label: "Task Status", sort: "taskStatus", icon: ShieldCheck },
  { label: "Coin Round", sort: "coinFlipCompletedAt", icon: Coins },
  { label: "Coin Result", sort: "coinResult", icon: Award },
  { label: "Consent Link", icon: Link2 },
  { label: "Consent Acknowledgement", icon: ShieldCheck },
  { label: "Coupon Claim", icon: Ticket },
  // { label: "Final Status", icon: Flag }, // hidden for now — future use
  { label: "Action", icon: MoreHorizontal },
];

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-border/60">
          {COLUMNS.map((c, j) => (
            <td key={j} className="px-4 py-5">
              <div className="shimmer h-4 w-full rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function ParticipantJourneyTable({
  rows,
  startIndex,
  loading,
  error,
  emptyMessage,
  sortKey,
  sortDir,
  onSort,
  onOpen,
  onRetry,
}: {
  rows: ParticipantJourney[];
  startIndex: number;
  loading: boolean;
  error: boolean;
  emptyMessage: string;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  onOpen: (p: ParticipantJourney) => void;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-10 text-center">
        <p className="text-sm text-muted-foreground">Unable to load participant reports.</p>
        <Button className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="glass-panel hidden overflow-x-auto rounded-2xl md:block">
        <table className="w-full min-w-[1420px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface-raised/95 backdrop-blur">
            <tr>
              {COLUMNS.map((col) => {
                const Icon = col.icon;
                return (
                  <th
                    key={col.label}
                    className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {col.sort ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.sort!)}
                        className="inline-flex items-center gap-1.5 hover:text-primary"
                      >
                        {Icon && <Icon className="size-3.5" />}
                        {col.label}
                        {sortKey === col.sort &&
                          (sortDir === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : (
                            <ArrowDown className="size-3" />
                          ))}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        {Icon && <Icon className="size-3.5" />}
                        {col.label}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-16 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((p, i) => (
                <ParticipantJourneyRow
                  key={p.id}
                  participant={p}
                  index={startIndex + i}
                  onOpen={onOpen}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer h-40 rounded-xl" />
          ))
        ) : rows.length === 0 ? (
          <div className="glass-panel rounded-xl p-10 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          rows.map((p) => <ParticipantJourneyCard key={p.id} participant={p} onOpen={onOpen} />)
        )}
      </div>
    </>
  );
}
