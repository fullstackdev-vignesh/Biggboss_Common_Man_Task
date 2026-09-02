// const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:3001";

// export class ApiError extends Error {
//   constructor(message: string) {
//     super(message);
//     this.name = "ApiError";
//   }
// }

// async function request<T>(path: string, init?: RequestInit): Promise<T> {
//   const res = await fetch(`${API_BASE_URL}${path}`, {
//     ...init,
//     headers: { "Content-Type": "application/json", ...init?.headers },
//   });
//   const body = await res.json().catch(() => null);
//   if (!res.ok || !body?.ok) {
//     throw new ApiError(body?.message ?? "Something went wrong. Please try again.");
//   }
//   return body as T;
// }

// export interface BiggUser {
//   _id: string;
//   name?: string | null;
//   phone?: string | null;
//   sessionId?: string | null;
//   dateStr: string;
//   spinnerResult?: string | null;
//   wheelCategory?: string | null;
//   wheelTask?: string | null;
//   spinnerStatus: "pending" | "completed" | "rejected";
//   wheelSpinStartedAt?: string | null;
//   wheelSpinCompletedAt?: string | null;
//   taskCompletedAt?: string | null;
//   taskFailedAt?: string | null;
//   coinResult?: "win" | "lose" | null;
//   coinStatus: "pending" | "completed";
//   coinFlipStartedAt?: string | null;
//   coinFlipCompletedAt?: string | null;
//   couponCode?: string | null;
//   windowKey?: string | null;
//   slotPlanSnapshot?: number | null;
//   claimToken?: string | null;
//   claimTokenIssuedAt?: string | null;
//   claimAccepted?: boolean;
//   claimAcceptedAt?: string | null;
//   claimDeclined?: boolean;
//   claimLinkDeclined?: boolean;
//   claimLinkDeclinedAt?: string | null;
//   completedAt?: string | null;

//   // Finalized consent files. Admin location is intentionally NOT stored here.
//   signatureKey?: string | null;
//   signatureUrl?: string | null;
//   signatureSavedAt?: string | null;
//   consentPdfKey?: string | null;
//   consentPdfUrl?: string | null;

//   createdAt: string;
// }

// export function startSession() {
//   return request<{ ok: true; sessionId: string; user: BiggUser | null }>("/api/user/session", {
//     method: "POST",
//   });
// }

// export function startSpin(sessionId: string) {
//   return request<{ ok: true; user: BiggUser }>("/api/spinner/start", {
//     method: "POST",
//     body: JSON.stringify({ sessionId }),
//   });
// }

// export function saveSpinnerResult(sessionId: string, activity: string, task: string) {
//   return request<{ ok: true; user: BiggUser }>("/api/spinner/save", {
//     method: "POST",
//     body: JSON.stringify({ sessionId, activity, task }),
//   });
// }

// export function rejectSpinner(sessionId: string, activity: string, task: string) {
//   return request<{ ok: true; user: BiggUser }>("/api/spinner/reject", {
//     method: "POST",
//     body: JSON.stringify({ sessionId, activity, task }),
//   });
// }

// export function startCoin(sessionId: string) {
//   return request<{ ok: true; user: BiggUser }>("/api/coin/start", {
//     method: "POST",
//     body: JSON.stringify({ sessionId }),
//   });
// }

// export function saveCoinResult(sessionId: string) {
//   return request<{ ok: true; user: BiggUser }>("/api/coin/save", {
//     method: "POST",
//     body: JSON.stringify({ sessionId }),
//   });
// }

// export function registerClaim(sessionId: string, name: string, phone: string) {
//   return request<{ ok: true; claimToken: string }>("/api/claim/register", {
//     method: "POST",
//     body: JSON.stringify({ sessionId, name, phone }),
//   });
// }

// export function declineClaim(sessionId: string) {
//   return request<{ ok: true }>("/api/claim/decline", {
//     method: "POST",
//     body: JSON.stringify({ sessionId }),
//   });
// }

// export interface ClaimInfo {
//   expired: boolean;
//   name: string | null;
//   phone: string | null;
//   participantId: string;
//   wheelCategory: string | null;
//   wheelSpinCompletedAt: string | null;
//   taskCompletedAt: string | null;
//   coinFlipCompletedAt: string | null;
//   detailsSubmittedAt: string | null;
//   claimAccepted: boolean;
//   claimAcceptedAt: string | null;
//   claimLinkDeclined: boolean;
//   claimLinkDeclinedAt: string | null;
//   couponCode: string | null;

//   // Live centralized admin location returned by backend.
//   currentLocation: string;
//   state: string;
// }

// export function getClaim(token: string) {
//   return request<{ ok: true } & ClaimInfo>(`/api/claim/${token}`);
// }

// /**
//  * Consent acceptance now requires a PNG signature data URL.
//  * Backend is authoritative for current admin location and creates the final PDF.
//  */
// // export function acceptClaim(token: string, signatureDataUrl: string) {
// //   return request<{ ok: true; name: string | null; couponCode: string }>(
// //     `/api/claim/${token}/accept`,
// //     {
// //       method: "POST",
// //       body: JSON.stringify({ signatureDataUrl }),
// //     },
// //   );
// // }


// export function acceptClaim(
//   token: string,
//   signatureDataUrl: string,
// ) {
//   return request<{
//     ok: true;
//     name: string | null;
//     couponCode: string;
//     signatureUrl?: string | null;
//     consentPdfUrl?: string | null;
//   }>(
//     `/api/claim/${token}/accept`,
//     {
//       method: "POST",
//       body: JSON.stringify({
//         signatureDataUrl,
//       }),
//     },
//   );
// }

// export function declineClaimLink(token: string) {
//   return request<{ ok: true; name: string | null }>(`/api/claim/${token}/decline`, {
//     method: "POST",
//   });
// }




// const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:3001";

const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "https://backend-bq11.onrender.com";
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body: unknown = await res.json().catch(() => null);
  const responseBody = body as
    | {
        ok?: boolean;
        message?: string;
      }
    | null;
  if (!res.ok || !responseBody?.ok) {
    throw new ApiError(
      responseBody?.message ?? "Something went wrong. Please try again.",
    );
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
  windowKey?: string | null;
  slotPlanSnapshot?: number | null;
  claimToken?: string | null;
  claimTokenIssuedAt?: string | null;
  claimAccepted?: boolean;
  claimAcceptedAt?: string | null;
  claimDeclined?: boolean;
  claimLinkDeclined?: boolean;
  claimLinkDeclinedAt?: string | null;
  completedAt?: string | null;
  signatureKey?: string | null;
  signatureUrl?: string | null;
  signatureSavedAt?: string | null;
  consentPdfKey?: string | null;
  consentPdfUrl?: string | null;
  createdAt: string;
}
export interface ClaimInfo {
  expired: boolean;
  name: string | null;
  phone: string | null;
  participantId: string;
  wheelCategory: string | null;
  wheelSpinCompletedAt: string | null;
  taskCompletedAt: string | null;
  coinFlipCompletedAt: string | null;
  detailsSubmittedAt: string | null;
  claimAccepted: boolean;
  claimAcceptedAt: string | null;
  claimLinkDeclined: boolean;
  claimLinkDeclinedAt: string | null;
  couponCode: string | null;
  currentLocation: string;
  state: string;
}
export function startSession() {
  return request<{
    ok: true;
    sessionId: string;
    user: BiggUser | null;
  }>("/api/user/session", {
    method: "POST",
  });
}
export function startSpin(sessionId: string) {
  return request<{
    ok: true;
    user: BiggUser;
  }>("/api/spinner/start", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}
export function saveSpinnerResult(
  sessionId: string,
  activity: string,
  task: string,
) {
  return request<{
    ok: true;
    user: BiggUser;
  }>("/api/spinner/save", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      activity,
      task,
    }),
  });
}
export function rejectSpinner(
  sessionId: string,
  activity: string,
  task: string,
) {
  return request<{
    ok: true;
    user: BiggUser;
  }>("/api/spinner/reject", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      activity,
      task,
    }),
  });
}
export function startCoin(sessionId: string) {
  return request<{
    ok: true;
    user: BiggUser;
  }>("/api/coin/start", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}
export function saveCoinResult(sessionId: string) {
  return request<{
    ok: true;
    user: BiggUser;
  }>("/api/coin/save", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}
export function registerClaim(
  sessionId: string,
  name: string,
  phone: string,
) {
  return request<{
    ok: true;
    claimToken: string;
  }>("/api/claim/register", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      name,
      phone,
    }),
  });
}
export function declineClaim(sessionId: string) {
  return request<{
    ok: true;
  }>("/api/claim/decline", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}
export function getClaim(token: string) {
  return request<
    {
      ok: true;
    } & ClaimInfo
  >(`/api/claim/${token}`);
}
export function acceptClaim(
  token: string,
  signatureDataUrl: string,
) {
  return request<{
    ok: true;
    name: string | null;
    couponCode: string;
    signatureUrl?: string | null;
    consentPdfUrl?: string | null;
  }>(`/api/claim/${token}/accept`, {
    method: "POST",
    body: JSON.stringify({
      signatureDataUrl,
    }),
  });
}
export function declineClaimLink(token: string) {
  return request<{
    ok: true;
    name: string | null;
  }>(`/api/claim/${token}/decline`, {
    method: "POST",
  });
}
