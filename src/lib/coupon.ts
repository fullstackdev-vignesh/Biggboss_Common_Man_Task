const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generates a coupon code such as BB-CM-8F32K7. */
export function generateCouponCode(length = 6): string {
  let code = "";
  const bytes = new Uint32Array(length);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) code += ALPHABET[bytes[i]! % ALPHABET.length];
  } else {
    for (let i = 0; i < length; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `BB-CM-${code}`;
}

/**
 * Placeholder delivery hook. Wire an SMS provider here later — the UI already
 * tells the participant the coupon will be sent to their phone.
 */
export async function sendCouponToPhone(phone: string, code: string): Promise<void> {
  if (import.meta.env.DEV) {
    console.info(`[coupon] would send ${code} to ${phone}`);
  }
}
