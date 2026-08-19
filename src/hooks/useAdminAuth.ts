const AUTH_KEY = "bb-admin-auth";
const ADMIN_USERNAME = "vignesh";
const ADMIN_PASSWORD = "9345771779";

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(AUTH_KEY) === "1";
  } catch {
    return false;
  }
}

export function tryAdminLogin(username: string, password: string): boolean {
  const ok = username.trim().toLowerCase() === ADMIN_USERNAME && password.trim() === ADMIN_PASSWORD;
  if (ok) {
    try {
      window.sessionStorage.setItem(AUTH_KEY, "1");
    } catch {
      /* storage unavailable — session state still lives for this tab */
    }
  }
  return ok;
}

export function adminLogout() {
  try {
    window.sessionStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
}
