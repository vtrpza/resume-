/**
 * Cookie helpers for session ID and fallback paywall state (when DB unavailable).
 */

export const SESSION_COOKIE = "rgs_session";

const FREE_SCAN_USED = "rgs_free_used";
const PREMIUM = "rgs_premium";

export function getSessionId(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1].trim() : null;
}

export function setSessionId(id: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=${id}; path=/; max-age=31536000`;
}

export function getOrCreateSessionId(): string {
  let id = getSessionId();
  if (!id) {
    id = crypto.randomUUID();
    setSessionId(id);
  }
  return id;
}

export function getFreeScanUsed(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(`${FREE_SCAN_USED}=1`);
}

export function getPremium(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(`${PREMIUM}=1`);
}

export function setFreeScanUsed(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${FREE_SCAN_USED}=1; path=/; max-age=31536000`;
}

export function setPremium(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${PREMIUM}=1; path=/; max-age=31536000`;
}

export function shouldShowPaywall(): boolean {
  return getFreeScanUsed() && !getPremium();
}
