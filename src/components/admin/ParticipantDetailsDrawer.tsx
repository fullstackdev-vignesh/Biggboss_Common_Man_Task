import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDate, formatTime } from "@/lib/admin/format";
import { formatPhone } from "@/lib/utils";
import { COIN_RESULT_LABEL } from "@/components/admin/StatusBadge";
import type { ParticipantJourney } from "@/types/admin";

export function ParticipantDetailsDrawer({
  participant,
  onClose,
}: {
  participant: ParticipantJourney | null;
  onClose: () => void;
}) {
  const p = participant;
  const events: { time: string | null | undefined; label: string; detail?: string | undefined }[] =
    p
      ? [
          { time: p.registeredAt, label: "Participant Started" },
          { time: p.wheelSpinStartedAt, label: "Wheel Spin Started" },
          {
            time: p.wheelSpinCompletedAt,
            label: "Wheel Stopped",
            detail: p.wheelCategory
              ? `Category ${p.wheelCategory} · ${p.wheelTask ?? ""}`
              : undefined,
          },
          { time: p.taskCompletedAt, label: "Task Completed" },
          { time: p.taskFailedAt, label: "Task Failed" },
          { time: p.coinFlipStartedAt, label: "Coin Flip Started" },
          {
            time: p.coinFlipCompletedAt,
            label: "Coin Flip Completed",
            detail: p.coinResult ? COIN_RESULT_LABEL[p.coinResult] : undefined,
          },
        ].filter((e) => !!e.time)
      : [];

  return (
    <Sheet open={!!p} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {p && (
          <>
            <SheetHeader>
              <SheetTitle className=" text-xl ">
                {p.name?.trim() || "Guest"}
              </SheetTitle>
              <SheetDescription>{formatPhone(p.phone)}</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-8">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {formatDate(p.registeredAt)} · Journey Timeline
              </p>
              <ol className="space-y-4 border-l border-border pl-4">
                {events.map((e) => (
                  <li key={e.label} className="relative">
                    <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
                    <p className="text-sm font-semibold">{formatTime(e.time)}</p>
                    <p className="text-sm text-muted-foreground">{e.label}</p>
                    {e.detail && <p className="mt-1 text-sm">{e.detail}</p>}
                  </li>
                ))}
              </ol>
              {p.couponCode && (
                <div className="rounded-xl border border-primary/40 bg-primary/10 p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Coupon</p>
                  <p className="font-mono text-xl tracking-widest text-primary">{p.couponCode}</p>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
