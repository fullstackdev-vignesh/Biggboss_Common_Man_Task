import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Gauge, Sliders, TrendingDown, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchParticipantLimit, setParticipantLimit } from "@/lib/admin/api";

export function DailyLimitPanel() {
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const query = useQuery({
    queryKey: ["admin-participant-limit"],
    queryFn: fetchParticipantLimit,
  });

  useEffect(() => {
    if (query.data) setValue(String(query.data.limit || ""));
  }, [query.data]);

  async function handleSave() {
    const limit = Number(value);
    if (!Number.isFinite(limit) || limit <= 0) {
      toast.error("Enter a valid limit greater than 0.");
      return;
    }
    setSaving(true);
    try {
      await setParticipantLimit(limit);
      await queryClient.invalidateQueries({ queryKey: ["admin-participant-limit"] });
      toast.success(`Participant limit set to ${limit}. This applies every day until changed.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the participant limit.");
    } finally {
      setSaving(false);
    }
  }

  const used = query.data?.usedCount ?? 0;
  const limit = query.data?.limit ?? 0;
  const remaining = query.data?.configured ? Math.max(limit - used, 0) : 0;

  return (
    <div className="glass-panel flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid flex-1 grid-cols-3 gap-3">
        <div className="flex items-start gap-2">
          <Gauge className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Today Limit
            </p>
            {query.isLoading ? (
              <div className="shimmer mt-2 h-6 w-16 rounded" />
            ) : (
              <p className="display-font mt-1 text-2xl gold-text">
                {query.data?.configured ? limit : "—"}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Users className="mt-0.5 size-5 shrink-0 text-amber" />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Used Today</p>
            {query.isLoading ? (
              <div className="shimmer mt-2 h-6 w-16 rounded" />
            ) : (
              <p className="display-font mt-1 text-2xl gold-text">
                {used}
                {query.data?.configured ? ` / ${limit}` : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <TrendingDown className="mt-0.5 size-5 shrink-0 text-success" />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Remaining</p>
            {query.isLoading ? (
              <div className="shimmer mt-2 h-6 w-16 rounded" />
            ) : (
              <p className="display-font mt-1 text-2xl gold-text">
                {query.data?.configured ? remaining : "—"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Sliders className="size-4 text-muted-foreground" />
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Set Daily Limit
        </p>
        <Input
          type="number"
          min={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 100"
          className="w-[110px]"
        />
        <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Saving…" : "Save Limit"}
        </Button>
      </div>
    </div>
  );
}
