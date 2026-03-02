/**
 * Analytics (PostHog). No-op if key missing.
 * All client events are enriched with route, UTM params, and session_id.
 *
 * Events (main properties):
 * - landing_viewed
 * - cta_clicked: cta
 * - sample_report_viewed
 * - resume_uploaded: file_name, file_size, file_size_bucket, file_type
 * - jd_pasted: text_length, text_length_bucket, input_type
 * - scan_started: file_size, file_size_bucket, jd_length, jd_length_bucket
 * - scan_completed: match_score, match_score_bucket, confidence, scan_duration_ms?, ...
 * - scan_failed: error, error_category, error_type?
 * - result_viewed: match_score, has_missing_keywords, has_ats_risks, ...
 * - paywall_viewed
 * - checkout_started
 * - checkout_completed: source, revenue, currency
 * - checkout_failed: error
 * - premium_unlocked: source, revenue, currency
 * - export_clicked: format
 * - cover_letter_generated: (when feature exists)
 */

import { getOrCreateSessionId } from "@/lib/cookies";

const key = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_POSTHOG_KEY : null;

/**
 * Get current route pathname
 */
function getRoute(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname;
}

/**
 * Extract UTM parameters from URL
 */
function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (key.startsWith("utm_")) {
      utm[key] = value;
    }
  }
  return utm;
}

/**
 * Bucket file size for analytics (exported for scan_started consistency).
 */
export function getFileSizeBucket(sizeBytes: number): string {
  if (sizeBytes < 100 * 1024) return "<100KB";
  if (sizeBytes < 500 * 1024) return "100-500KB";
  if (sizeBytes < 1024 * 1024) return "500KB-1MB";
  if (sizeBytes < 2 * 1024 * 1024) return "1-2MB";
  if (sizeBytes < 5 * 1024 * 1024) return "2-5MB";
  return "5MB+";
}

/**
 * Bucket text length for analytics (exported for scan_started consistency).
 */
export function getTextLengthBucket(length: number): string {
  if (length < 100) return "<100";
  if (length < 500) return "100-500";
  if (length < 1000) return "500-1K";
  if (length < 2000) return "1K-2K";
  if (length < 5000) return "2K-5K";
  return "5K+";
}

/**
 * Bucket match score for analytics
 */
function getScoreBucket(score: number): string {
  if (score >= 80) return "80-100";
  if (score >= 60) return "60-79";
  if (score >= 40) return "40-59";
  return "0-39";
}

/**
 * Bucket confidence for analytics
 */
function getConfidenceBucket(confidence: number): string {
  if (confidence >= 0.9) return "0.9-1.0";
  if (confidence >= 0.7) return "0.7-0.9";
  if (confidence >= 0.5) return "0.5-0.7";
  return "0.0-0.5";
}

/**
 * Categorize error for analytics
 */
function getErrorCategory(error: string | null | undefined): string {
  if (!error) return "unknown";
  const err = error.toLowerCase();
  if (err.includes("file") || err.includes("upload") || err.includes("pdf")) return "file_upload";
  if (err.includes("parse") || err.includes("extract") || err.includes("read")) return "extraction";
  if (err.includes("api") || err.includes("openai") || err.includes("model")) return "api";
  if (err.includes("size") || err.includes("too large") || err.includes("mb")) return "file_size";
  if (err.includes("network") || err.includes("fetch") || err.includes("timeout")) return "network";
  return "other";
}

type PostHogWindow = {
  posthog?: {
    capture: (e: string, p?: Record<string, unknown>) => void;
    identify: (distinctId: string) => void;
  };
};

/**
 * Identify the current user/session in PostHog. Call once when PostHog is ready (e.g. in provider).
 * Uses app session ID so all events are attributed to one anonymous person per session.
 */
export function identifySession(sessionId: string): void {
  if (!key || !sessionId) return;
  try {
    if (typeof window !== "undefined") {
      const ph = (window as unknown as PostHogWindow).posthog;
      if (ph?.identify) ph.identify(sessionId);
    }
  } catch {
    // no-op
  }
}

/**
 * Capture analytics event with automatic route, UTM, and session_id
 */
export function capture(event: string, properties?: Record<string, unknown>): void {
  if (!key) return;
  try {
    if (typeof window !== "undefined") {
      const ph = (window as unknown as PostHogWindow).posthog;
      if (ph) {
        const sessionId = getOrCreateSessionId();
        const enriched = {
          ...properties,
          ...(sessionId && { session_id: sessionId }),
          route: getRoute(),
          ...getUtmParams(),
        };
        ph.capture(event, enriched);
      }
    }
  } catch {
    // no-op
  }
}

/**
 * Helper to capture file upload event with size bucket
 */
export function captureFileUpload(file: File | null): void {
  if (!file) return;
  capture("resume_uploaded", {
    file_name: file.name,
    file_size: file.size,
    file_size_bucket: getFileSizeBucket(file.size),
    file_type: file.type,
  });
}

/**
 * Helper to capture text input event with length bucket
 */
export function captureTextInput(text: string, inputType: "jd" | "other"): void {
  capture("jd_pasted", {
    text_length: text.length,
    text_length_bucket: getTextLengthBucket(text.length),
    input_type: inputType,
  });
}

/**
 * Helper to capture scan completion with analysis metadata and optional duration.
 */
export function captureScanCompleted(analysis: {
  matchScore?: number;
  confidence?: number;
  extractionQuality?: string;
  model?: string;
  scanDurationMs?: number;
}): void {
  const props: Record<string, unknown> = {};
  if (typeof analysis.matchScore === "number") {
    props.match_score = analysis.matchScore;
    props.match_score_bucket = getScoreBucket(analysis.matchScore);
  }
  if (typeof analysis.confidence === "number") {
    props.confidence = analysis.confidence;
    props.confidence_bucket = getConfidenceBucket(analysis.confidence);
  }
  if (analysis.extractionQuality) {
    props.extraction_quality = analysis.extractionQuality;
  }
  if (analysis.model) {
    props.model = analysis.model;
  }
  if (typeof analysis.scanDurationMs === "number") {
    props.scan_duration_ms = analysis.scanDurationMs;
  }
  capture("scan_completed", props);
}

/**
 * Helper to capture scan failure with error categorization
 */
export function captureScanFailed(error: string | null | undefined, context?: Record<string, unknown>): void {
  capture("scan_failed", {
    error: error || "Unknown error",
    error_category: getErrorCategory(error),
    ...context,
  });
}

/**
 * Helper to capture checkout completion with revenue (client-side, e.g. redirect).
 */
export function captureCheckoutCompleted(props: { source: string; revenue?: number; currency?: string }): void {
  capture("checkout_completed", {
    source: props.source,
    revenue: props.revenue ?? 2,
    currency: props.currency ?? "USD",
  });
}

/**
 * Helper to capture result view with result metadata
 */
export function captureResultViewed(analysis: {
  matchScore?: number;
  missingKeywords?: unknown[];
  atsRisks?: unknown[];
}): void {
  const props: Record<string, unknown> = {};
  if (typeof analysis.matchScore === "number") {
    props.match_score = analysis.matchScore;
    props.match_score_bucket = getScoreBucket(analysis.matchScore);
  }
  props.has_missing_keywords = Array.isArray(analysis.missingKeywords) && analysis.missingKeywords.length > 0;
  props.has_ats_risks = Array.isArray(analysis.atsRisks) && analysis.atsRisks.length > 0;
  capture("result_viewed", props);
}
