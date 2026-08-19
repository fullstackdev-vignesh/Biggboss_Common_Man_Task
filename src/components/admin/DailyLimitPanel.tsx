import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const reached = query.data?.configured && used >= limit;

  return (
    <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Participant Limit{" "}
          <span className="normal-case text-muted-foreground/70">(applies every day)</span>
        </p>
        {query.isLoading ? (
          <div className="shimmer mt-2 h-6 w-40 rounded" />
        ) : (
          <p className="display-font mt-1 text-xl gold-text">
            {query.data?.configured ? `${used} / ${limit} today` : "Not configured yet"}
            {reached && (
              <span className="ml-2 text-xs font-normal text-destructive">Limit reached</span>
            )}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 100"
          className="w-[140px]"
        />
        <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Saving…" : "Save Limit"}
        </Button>
      </div>
    </div>
  );
}
