export const WHEEL_CATEGORIES = [
  "POSE",
  "DIALOGUE",
  "DANCE",
  "REACTION",
  "CITY",
  "FOOD",
  "INTRO",
  "SURPRISE",
] as const;

export type WheelCategory = (typeof WHEEL_CATEGORIES)[number];
