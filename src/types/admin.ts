export type TaskStatus = "PENDING" | "COMPLETED" | "FAILED";

export type CoinResult =
  "COUPON" | "COUPON_PENDING" | "BETTER_LUCK_NEXT_TIME" | "NOT_ELIGIBLE" | "NOT_FLIPPED";

export type FinalStatus =
  | "REGISTERED"
  | "WHEEL_PENDING"
  | "TASK_PENDING"
  | "TASK_FAILED"
  | "COIN_PENDING"
  | "COUPON_WINNER"
  | "COUPON_PENDING"
  | "BETTER_LUCK_NEXT_TIME";

export interface ParticipantJourney {
  id: string;
  name?: string | null;
  phone: string;
  registeredAt: string;
  wheelSpinStartedAt?: string | null;
  wheelSpinCompletedAt?: string | null;
  wheelCategory?: string | null;
  wheelTask?: string | null;
  taskStatus?: TaskStatus | null;
  taskCompletedAt?: string | null;
  taskFailedAt?: string | null;
  coinEligible: boolean;
  coinFlipStartedAt?: string | null;
  coinFlipCompletedAt?: string | null;
  coinResult?: CoinResult | null;
  couponCode?: string | null;
  claimAccepted?: boolean;
  completedAt?: string | null;
}

export function finalStatusOf(p: ParticipantJourney): FinalStatus {
  if (p.coinResult === "COUPON") return "COUPON_WINNER";
  if (p.coinResult === "COUPON_PENDING") return "COUPON_PENDING";
  if (p.coinResult === "BETTER_LUCK_NEXT_TIME") return "BETTER_LUCK_NEXT_TIME";
  if (p.taskStatus === "FAILED") return "TASK_FAILED";
  if (p.taskStatus === "COMPLETED") return "COIN_PENDING";
  if (p.wheelSpinCompletedAt) return "TASK_PENDING";
  if (p.wheelSpinStartedAt) return "WHEEL_PENDING";
  return "REGISTERED";
}

export const FINAL_STATUS_LABEL: Record<FinalStatus, string> = {
  REGISTERED: "Registered",
  WHEEL_PENDING: "Wheel Pending",
  TASK_PENDING: "Task Pending",
  TASK_FAILED: "Task Failed",
  COIN_PENDING: "Coin Pending",
  COUPON_WINNER: "Coupon Winner",
  COUPON_PENDING: "Coupon Pending (Claim Link)",
  BETTER_LUCK_NEXT_TIME: "Better Luck Next Time",
};
