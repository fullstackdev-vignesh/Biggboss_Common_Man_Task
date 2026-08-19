const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:3001";
// const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://192.168.1.64:3001";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.ok) {
    throw new ApiError(body?.message ?? "Something went wrong. Please try again.");
  }
  return body as T;
}

export interface BiggUser {
  _id: string;
  name?: string | null;
  phone?: string | null;
  sessionId?: string | null;
  dateStr: string;
  spinnerResult?: string | null;
  wheelCategory?: string | null;
  wheelTask?: string | null;
  spinnerStatus: "pending" | "completed" | "rejected";
  wheelSpinStartedAt?: string | null;
  wheelSpinCompletedAt?: string | null;
  taskCompletedAt?: string | null;
  taskFailedAt?: string | null;
  coinResult?: "win" | "lose" | null;
  coinStatus: "pending" | "completed";
  coinFlipStartedAt?: string | null;
  coinFlipCompletedAt?: string | null;
  couponCode?: string | null;
  claimAccepted?: boolean;
  completedAt?: string | null;
  createdAt: string;
}

/** Called when "Enter the Task" is tapped — creates an anonymous session
 * (enforces the daily participant limit) before the wheel spin. */
export function startSession() {
  return request<{ ok: true; sessionId: string; user: BiggUser }>("/api/user/session", {
    method: "POST",
  });
}

export function startSpin(sessionId: string) {
  return request<{ ok: true; user: BiggUser }>("/api/spinner/start", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

export function saveSpinnerResult(sessionId: string, activity: string, task: string) {
  return request<{ ok: true; user: BiggUser }>("/api/spinner/save", {
    method: "POST",
    body: JSON.stringify({ sessionId, activity, task }),
  });
}

export function rejectSpinner(sessionId: string, activity: string, task: string) {
  return request<{ ok: true; user: BiggUser }>("/api/spinner/reject", {
    method: "POST",
    body: JSON.stringify({ sessionId, activity, task }),
  });
}

export function startCoin(sessionId: string) {
  return request<{ ok: true; user: BiggUser }>("/api/coin/start", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

export function saveCoinResult(sessionId: string, result: "win" | "lose") {
  return request<{ ok: true; user: BiggUser }>("/api/coin/save", {
    method: "POST",
    body: JSON.stringify({ sessionId, result }),
  });
}

/** Coin-win "Name + Phone" form submit — mints the claim link token. */
export function registerClaim(sessionId: string, name: string, phone: string) {
  return request<{ ok: true; claimToken: string }>("/api/claim/register", {
    method: "POST",
    body: JSON.stringify({ sessionId, name, phone }),
  });
}

export interface ClaimInfo {
  name: string | null;
  wheelCategory: string | null;
  wheelTask: string | null;
  claimAccepted: boolean;
  couponCode: string | null;
}

export function getClaim(token: string) {
  return request<{ ok: true } & ClaimInfo>(`/api/claim/${token}`);
}

export function acceptClaim(token: string) {
  return request<{ ok: true; name: string | null; couponCode: string }>(
    `/api/claim/${token}/accept`,
    { method: "POST" },
  );
}
