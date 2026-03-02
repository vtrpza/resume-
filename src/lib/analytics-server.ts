/**
 * Server-side PostHog capture. Used for conversion events that must be recorded
 * even when the client never returns (e.g. Stripe webhook after payment).
 * Uses POSTHOG_API_KEY (or NEXT_PUBLIC_POSTHOG_KEY) and POSTHOG_HOST.
 */

import { PostHog } from "posthog-node";

const apiKey = process.env.POSTHOG_API_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.POSTHOG_HOST ?? process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"; // pragma: allowlist secret

let client: PostHog | null = null;

function getClient(): PostHog | null {
  if (!apiKey) return null;
  if (!client) {
    client = new PostHog(apiKey, { host });
  }
  return client;
}

export type CaptureCheckoutCompletedProps = {
  source: string;
  revenue?: number;
  currency?: string;
};

/**
 * Capture checkout_completed and premium_unlocked server-side (e.g. from Stripe webhook).
 * Uses distinctId (app session ID) so events match the same person as client-side.
 * Awaits capture so the response can be sent after events are enqueued.
 */
export async function captureCheckoutCompletedServer(
  distinctId: string,
  props: CaptureCheckoutCompletedProps = { source: "webhook" }
): Promise<void> {
  const ph = getClient();
  if (!ph) return;

  const revenue = props.revenue ?? 2;
  const currency = props.currency ?? "USD";
  const properties = {
    source: props.source,
    revenue,
    currency,
  };

  await ph.captureImmediate({
    distinctId,
    event: "checkout_completed",
    properties,
  });
  await ph.captureImmediate({
    distinctId,
    event: "premium_unlocked",
    properties,
  });
}
