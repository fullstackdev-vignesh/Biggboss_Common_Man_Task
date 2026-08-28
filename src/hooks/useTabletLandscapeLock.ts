import { useCallback, useEffect, useRef, useState } from "react";

/** `lock` isn't declared on `ScreenOrientation` in this project's DOM lib target. */
type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>;
};

/** Tablet-ish, touch-capable viewport — the range we want to nudge toward landscape. */
function isTabletCandidate(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const hasTouch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
  if (!hasTouch) return false;

  const isCoarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? true;
  if (!isCoarsePointer) return false;

  const minDim = Math.min(window.innerWidth, window.innerHeight);
  const maxDim = Math.max(window.innerWidth, window.innerHeight);
  // Tablet-sized viewport (excludes typical phones and desktops), covers the
  // realme Pad Mini (800x1340) in either orientation.
  return minDim >= 600 && maxDim <= 1400;
}

/**
 * Tracks whether a tablet-sized touch device is currently in portrait, and
 * exposes a user-gesture-driven `requestLandscape()` for a caller-rendered
 * "rotate your device" overlay.
 *
 * - `isTablet` / `isPortrait` are live (updated on orientation change) so the
 *   caller can show/hide its overlay as the device is rotated — nothing is
 *   locked or requested until the user taps a button.
 * - `requestLandscape()` must be called from a click handler: it requests
 *   fullscreen (if needed/supported) and then attempts
 *   `screen.orientation.lock("landscape-primary")`, falling back to
 *   `"landscape"` if that specific value isn't accepted. Feature-detected
 *   and wrapped in try/catch throughout, so unsupported or blocked browsers
 *   never throw — failures are logged (not swallowed) for debugging.
 * - Once a lock is acquired it is intentionally left alone — it is NOT
 *   released just because the device re-reports portrait, and re-renders
 *   never re-trigger fullscreen/lock requests. It's only released when the
 *   route unmounts (leaving `/admin/reports`), restoring normal behavior
 *   for every other route.
 */
export function useTabletLandscapeLock() {
  const [isTablet] = useState(isTabletCandidate);
  const [isPortrait, setIsPortrait] = useState(() =>
    typeof window === "undefined"
      ? false
      : (window.matchMedia?.("(orientation: portrait)").matches ?? window.innerHeight > window.innerWidth),
  );
  const [isLocked, setIsLocked] = useState(false);

  const lockedByUsRef = useRef(false);
  const fullscreenedByUsRef = useRef(false);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    if (!isTablet || typeof window === "undefined") return;

    const mql = window.matchMedia("(orientation: portrait)");
    const onChange = () => setIsPortrait(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [isTablet]);

  // Undo anything this page acquired, but ONLY when the route actually
  // unmounts — never as a reaction to orientation/state changes.
  useEffect(() => {
    return () => {
      const orientation = screen.orientation as LockableScreenOrientation | undefined;
      if (lockedByUsRef.current && orientation && typeof orientation.unlock === "function") {
        try {
          orientation.unlock();
        } catch (err) {
          console.warn("[admin/reports] orientation.unlock failed", err);
        }
        lockedByUsRef.current = false;
      }
      if (fullscreenedByUsRef.current && document.fullscreenElement) {
        document.exitFullscreen?.().catch((err: unknown) => {
          console.warn("[admin/reports] exitFullscreen failed", err);
        });
        fullscreenedByUsRef.current = false;
      }
    };
  }, []);

  const requestLandscape = useCallback(async () => {
    if (requestInFlightRef.current || lockedByUsRef.current) return;
    requestInFlightRef.current = true;
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        try {
          await document.documentElement.requestFullscreen();
          fullscreenedByUsRef.current = true;
        } catch (err) {
          console.warn("[admin/reports] requestFullscreen failed", err);
        }
      } else if (!document.documentElement.requestFullscreen) {
        console.warn("[admin/reports] Fullscreen API unavailable");
      }

      const orientation = screen.orientation as LockableScreenOrientation | undefined;
      if (!orientation || typeof orientation.lock !== "function") {
        console.warn("[admin/reports] Screen Orientation lock API unavailable");
        return;
      }

      try {
        await orientation.lock("landscape-primary");
        lockedByUsRef.current = true;
        setIsLocked(true);
      } catch (primaryErr) {
        console.warn(
          "[admin/reports] orientation.lock('landscape-primary') failed, trying 'landscape'",
          primaryErr,
        );
        try {
          await orientation.lock("landscape");
          lockedByUsRef.current = true;
          setIsLocked(true);
        } catch (err) {
          console.warn("[admin/reports] orientation.lock('landscape') failed", err);
        }
      }
    } finally {
      requestInFlightRef.current = false;
    }
  }, []);

  return { isTablet, isPortrait, isLocked, requestLandscape };
}
