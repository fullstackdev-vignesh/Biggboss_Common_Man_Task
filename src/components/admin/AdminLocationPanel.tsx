import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LocateFixed, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { fetchAdminLocation, updateAdminLocation } from "@/lib/admin/api";
import { formatDate, formatTime } from "@/lib/admin/format";

interface DetectedLocation {
  label: string;
  state: string;
}

async function reverseGeocode(lat: number, lon: number): Promise<DetectedLocation> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error("Could not resolve address for your location.");
  const body = await res.json();
  const address = body?.address ?? {};
  const area =
    address.suburb || address.town || address.city_district || address.city || address.county;
  const city = address.city || address.town || address.county;
  const label = [area, city]
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(" - ");
  const state = address.state || "Tamil Nadu";
  if (!label) throw new Error("Could not determine a location name from GPS.");
  return { label, state };
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

function geolocationErrorMessage(err: unknown): string {
  if (typeof GeolocationPositionError !== "undefined" && err instanceof GeolocationPositionError) {
    if (err.code === err.PERMISSION_DENIED) {
      return "Location permission is blocked. Please enable Location access for this site in your browser settings and try again.";
    }
    if (err.code === err.TIMEOUT) {
      return "Location request timed out. Please try again.";
    }
    return "Could not get your GPS location. Please check your device's location settings.";
  }
  return err instanceof Error ? err.message : "Could not update location.";
}

export function AdminLocationPanel() {
  const queryClient = useQueryClient();
  const [working, setWorking] = useState(false);

  const locationQuery = useQuery({
    queryKey: ["admin-location"],
    queryFn: fetchAdminLocation,
    refetchOnWindowFocus: false,
  });

  async function handleUpdateLocation() {
    if (working) return;

    setWorking(true);
    try {
      const position = await getCurrentPosition();
      const detected = await reverseGeocode(position.coords.latitude, position.coords.longitude);

      await updateAdminLocation(detected.label, detected.state);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-location"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-location-history"] }),
      ]);
      toast.success(`Current location updated to ${detected.label}.`);
    } catch (err) {
      toast.error(geolocationErrorMessage(err));
    } finally {
      setWorking(false);
    }
  }

  const data = locationQuery.data;

  return (
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

      <Button
        variant="outline"
        size="sm"
        onClick={() => void handleUpdateLocation()}
        disabled={working}
      >
        <LocateFixed className={working ? "size-4 animate-pulse" : "size-4"} />
        {working ? "Detecting location…" : "Update Location"}
      </Button>
    </div>
  );
}
