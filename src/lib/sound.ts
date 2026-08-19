/**
 * Sound architecture placeholder. Drop real audio files into `public/sounds/`
 * and fill in the map below — nothing autoplays until then.
 */
export type SoundKey =
  | "splash-reveal"
  | "wheel-spin"
  | "pointer-tick"
  | "result-reveal"
  | "coin-spin"
  | "win-celebration";

const SOUND_SOURCES: Partial<Record<SoundKey, string>> = {
  // "wheel-spin": "/sounds/wheel-spin.mp3",
};

const cache = new Map<SoundKey, HTMLAudioElement>();

export function playSound(key: SoundKey, volume = 0.6): void {
  const src = SOUND_SOURCES[key];
  if (!src || typeof window === "undefined") return;
  let audio = cache.get(key);
  if (!audio) {
    audio = new Audio(src);
    cache.set(key, audio);
  }
  audio.volume = volume;
  audio.currentTime = 0;
  void audio.play().catch(() => undefined);
}
