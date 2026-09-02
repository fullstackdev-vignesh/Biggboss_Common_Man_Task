import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchAdminLocation, updateAdminLocation } from "@/lib/admin/api";
import { formatDate, formatTime } from "@/lib/admin/format";

export function AdminLocationPanel() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const locationQuery = useQuery({
    queryKey: ["admin-location"],
    queryFn: fetchAdminLocation,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (open) setValue(locationQuery.data?.currentLocation ?? "");
  }, [open, locationQuery.data?.currentLocation]);

  async function save() {
    const location = value.trim().replace(/\s+/g, " ");
    if (!location) {
      toast.error("Location is required.");
      return;
    }

    setSaving(true);
    try {
      await updateAdminLocation(location);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-location"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-location-history"] }),
      ]);
      setOpen(false);
      toast.success(`Current location updated to ${location}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update location.");
    } finally {
      setSaving(false);
    }
  }

  const data = locationQuery.data;

  return (
    <>
      <div className="glass-panel flex flex-col gap-3 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Current Location
            </p>
            {locationQuery.isLoading ? (
              <div className="shimmer mt-2 h-6 w-32 rounded" />
            ) : (
              <p className="display-font mt-1 truncate text-xl gold-text">
                {data?.currentLocation || "Not configured"}
              </p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {data?.state || "Tamil Nadu"}
              {data?.updatedAt
                ? ` · Last updated ${formatDate(data.updatedAt)} ${formatTime(data.updatedAt)}`
                : ""}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="size-4" /> Update Location
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Current Location</DialogTitle>
            <DialogDescription>
              New consent letters will use this admin-managed campaign location.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label htmlFor="admin-location" className="text-xs uppercase tracking-wider text-muted-foreground">
              Location
            </label>
            <Input
              id="admin-location"
              value={value}
              maxLength={120}
              autoFocus
              placeholder="Example: Madurai"
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void save();
              }}
            />
            <p className="text-xs text-muted-foreground">State: {data?.state || "Tamil Nadu"}</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : "Update Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
