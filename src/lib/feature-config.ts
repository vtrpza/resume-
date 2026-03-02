/**
 * Server-only feature configuration.
 * When RESUME_MATCH_FULL_APP=1, the app requires real services (DB, etc.)
 * and does not use stub/fallback behavior.
 */

export function isFullAppEnabled(): boolean {
  return process.env.RESUME_MATCH_FULL_APP === "1";
}

/** True when DATABASE_URL is set and DB can be used. */
export function isDatabaseAvailable(): boolean {
  return !!process.env.DATABASE_URL?.trim();
}

export interface RequiredServicesStatus {
  database: boolean;
  stripe: boolean;
}

import { stripe, STRIPE_PRICE_SCAN } from "./stripe";

export function getRequiredServicesStatus(): RequiredServicesStatus {
  return {
    database: isDatabaseAvailable(),
    stripe: !!(stripe && STRIPE_PRICE_SCAN),
  };
}
