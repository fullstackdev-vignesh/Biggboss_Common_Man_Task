/** Frontend business-mode flag, mirroring the backend's SLOT_BASED_BUSINESS.
 * Only drives UI behavior (which admin controls are shown); the real
 * business rule is always enforced by the backend. Defaults to true (the
 * current slot-based production behavior) when the env var is unset, and is
 * parsed safely so only the exact string "false" disables it. */
const SLOT_BASED_BUSINESS = import.meta.env?.["NEXT_PUBLIC_SLOT_BASED_BUSINESS"];

export function isSlotBasedBusiness(): boolean {
  return SLOT_BASED_BUSINESS !== "false";
}
