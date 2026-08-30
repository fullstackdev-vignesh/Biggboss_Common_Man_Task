import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Gauge, LayoutGrid, TicketCheck, TrendingDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  fetchCampaignDays,
  fetchCampaignSettings,
  setActiveCampaignSlot,
} from "@/lib/admin/api";
import { todayKey } from "@/lib/admin/report-filters";

export function CampaignQuotaPanel() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const settingsQuery = useQuery({
    queryKey: ["admin-campaign-settings"],
    queryFn: fetchCampaignSettings,
    refetchOnWindowFocus: false,
  });

  const today = todayKey();
  const daysQuery = useQuery({
    queryKey: ["admin-campaign-days", today],
    queryFn: () => fetchCampaignDays({ from: today, to: today }),
    refetchOnWindowFocus: false,
  });

  const todaySummary = daysQuery.data?.[0];
  const dailyCap = settingsQuery.data?.dailyCap ?? todaySummary?.dailyCap ?? 0;
  const issued = todaySummary?.dailyIssued ?? 0;
  const remaining = todaySummary?.dailyRemaining ?? Math.max(dailyCap - issued, 0);
  const activeSlot = settingsQuery.data?.activeSlot ?? 1;

  async function handleSelectSlot(slot: 1 | 2) {
    if (slot === activeSlot || saving) return;
    setSaving(true);
    try {
      await setActiveCampaignSlot(slot);
      await queryClient.invalidateQueries({ queryKey: ["admin-campaign-settings"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-campaign-days"] });
      toast.success(`Active campaign slot set to Slot Plan ${slot}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the campaign slot.");
    } finally {
      setSaving(false);
    }
  }

  const loading = settingsQuery.isLoading || daysQuery.isLoading;

  return (
    <div className="glass-panel flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid flex-1 grid-cols-3 gap-3">
        <div className="flex items-start gap-2">
          <Gauge className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Daily Coupon Cap
            </p>
            {loading ? (
              <div className="shimmer mt-2 h-6 w-16 rounded" />
            ) : (
              <p className="display-font mt-1 text-2xl gold-text">{dailyCap}</p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <TicketCheck className="mt-0.5 size-5 shrink-0 text-amber" />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Coupons Issued
            </p>
            {loading ? (
              <div className="shimmer mt-2 h-6 w-16 rounded" />
            ) : (
              <p className="display-font mt-1 text-2xl gold-text">
                {issued} / {dailyCap}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <TrendingDown className="mt-0.5 size-5 shrink-0 text-success" />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Coupons Remaining
            </p>
            {loading ? (
              <div className="shimmer mt-2 h-6 w-16 rounded" />
            ) : (
              <p className="display-font mt-1 text-2xl gold-text">{remaining}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LayoutGrid className="size-4 text-muted-foreground" />
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Active Campaign Slot
        </p>
        <div className="flex gap-2">
          {([1, 2] as const).map((slot) => (
            <Button
              key={slot}
              size="sm"
              variant={activeSlot === slot ? "default" : "outline"}
              disabled={saving || loading}
              onClick={() => void handleSelectSlot(slot)}
            >
              Slot Plan {slot}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
