/**
 * Analytics (PostHog). No-op if key missing.
 * Events per project rule: landing_viewed, cta_clicked, scan_started, scan_completed,
 * scan_failed, result_viewed, paywall_viewed, checkout_started, checkout_completed, etc.
 */

const key = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_POSTHOG_KEY : null;

export function capture(event: string, properties?: Record<string, unknown>): void {
  if (!key) return;
  try {
    if (typeof window !== "undefined" && (window as unknown as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog) {
      (window as unknown as { posthog: { capture: (e: string, p?: Record<string, unknown>) => void } }).posthog.capture(event, properties);
    }
  } catch {
    // no-op
  }
}
