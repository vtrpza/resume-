/**
 * Validation utilities for AI analysis contract.
 * Ensures outputs conform to schema and handles edge cases.
 */

import * as Sentry from "@sentry/nextjs";
import type { ScanAnalysis } from "./ai-analysis-contract";
import {
  normalizeConfidence,
  normalizeMatchScore,
} from "./ai-analysis-contract";

// Re-export for type compatibility
export type { ScanAnalysis } from "./ai-analysis-contract";

/**
 * Validate and normalize a ScanAnalysis result.
 * Handles edge cases, clamps values, ensures array consistency.
 */
export function validateAndNormalizeAnalysis(
  raw: unknown
): ScanAnalysis | null {
  if (!raw || typeof raw !== "object") {
    Sentry.setTag(
      "validation_fail",
      !raw ? "raw_falsy" : "raw_not_object"
    );
    return null;
  }

  const obj = raw as Record<string, unknown>;

  // Validate and normalize matchScore
  const matchScore = normalizeMatchScore(obj.matchScore);

  // Validate arrays
  const missingKeywords = validateStringArray(obj.missingKeywords, 0, 20, 100);
  const missingSkills = validateStringArray(obj.missingSkills, 0, 15, 100);
  const atsRisks = validateStringArray(obj.atsRisks, 0, 10, 200);
  const weakBullets = validateStringArray(obj.weakBullets, 0, 10, 300);
  const rewrittenBullets = validateStringArray(
    obj.rewrittenBullets,
    0,
    10,
    300
  );

  // Validate optional critical gap arrays
  const criticalMissingKeywords = validateStringArray(
    obj.criticalMissingKeywords,
    0,
    5,
    100
  );
  const criticalMissingSkills = validateStringArray(
    obj.criticalMissingSkills,
    0,
    5,
    100
  );

  // Ensure 1:1 mapping between weakBullets and rewrittenBullets
  const normalizedBullets = normalizeBulletPairs(weakBullets, rewrittenBullets);

  // Filter out cosmetic rewrites (optional similarity check)
  const filteredBullets = filterCosmeticRewrites(
    normalizedBullets.weak,
    normalizedBullets.rewritten
  );

  // Validate tailoredSummary
  const tailoredSummary = validateString(
    obj.tailoredSummary,
    50,
    500,
    "Professional with relevant experience."
  );

  // Validate confidence
  const confidence = normalizeConfidence(obj.confidence);

  // Validate extractionQuality
  const extractionQuality = validateExtractionQuality(
    obj.extractionQuality
  ) as "high" | "medium" | "low";

  // Optional matchScoreReasoning (20-200 chars)
  let matchScoreReasoning: string | undefined;
  if (typeof obj.matchScoreReasoning === "string") {
    const s = obj.matchScoreReasoning.trim().slice(0, 200);
    if (s.length >= 20) matchScoreReasoning = s;
  }

  const result: ScanAnalysis = {
    matchScore,
    missingKeywords,
    missingSkills,
    atsRisks,
    weakBullets: filteredBullets.weak,
    rewrittenBullets: filteredBullets.rewritten,
    tailoredSummary,
    confidence,
    extractionQuality,
    ...(matchScoreReasoning !== undefined && { matchScoreReasoning }),
  };

  // Add optional critical gap fields if present
  if (criticalMissingKeywords.length > 0) {
    result.criticalMissingKeywords = criticalMissingKeywords;
  }
  if (criticalMissingSkills.length > 0) {
    result.criticalMissingSkills = criticalMissingSkills;
  }

  return result;
}

/**
 * Validate string array with length and item constraints.
 */
function validateStringArray(
  value: unknown,
  minItems: number,
  maxItems: number,
  maxItemLength: number
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(0, maxItems)
    .map((item) => {
      if (typeof item !== "string") {
        return String(item).slice(0, maxItemLength);
      }
      return item.trim().slice(0, maxItemLength);
    })
    .filter((item) => item.length > 0);
}

/**
 * Validate string with length constraints.
 */
function validateString(
  value: unknown,
  minLength: number,
  maxLength: number,
  fallback: string
): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    return fallback;
  }

  return trimmed.slice(0, maxLength);
}

/**
 * Validate extractionQuality enum.
 */
function validateExtractionQuality(value: unknown): "high" | "medium" | "low" {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return "medium"; // Default to medium if invalid
}

/**
 * Normalize bullet pairs to ensure 1:1 mapping.
 * If lengths don't match, truncate longer array or pad shorter one.
 */
function normalizeBulletPairs(
  weak: string[],
  rewritten: string[]
): { weak: string[]; rewritten: string[] } {
  if (weak.length === rewritten.length) {
    return { weak, rewritten };
  }

  // Truncate longer array to match shorter
  const minLength = Math.min(weak.length, rewritten.length);
  return {
    weak: weak.slice(0, minLength),
    rewritten: rewritten.slice(0, minLength),
  };
}

/**
 * Filter out cosmetic rewrites that are too similar to the original.
 * Uses word overlap and edit distance heuristics to identify low-value rewrites.
 */
function filterCosmeticRewrites(
  weak: string[],
  rewritten: string[]
): { weak: string[]; rewritten: string[] } {
  if (weak.length !== rewritten.length) {
    return { weak, rewritten };
  }

  const filtered: { weak: string[]; rewritten: string[] } = {
    weak: [],
    rewritten: [],
  };

  for (let i = 0; i < weak.length; i++) {
    const original = weak[i].toLowerCase().trim();
    const rewrite = rewritten[i].toLowerCase().trim();

    // Skip if either is empty
    if (!original || !rewrite) {
      continue;
    }

    // Calculate word overlap ratio
    const originalWords = new Set(original.split(/\s+/));
    const rewriteWords = new Set(rewrite.split(/\s+/));
    const intersection = new Set(
      [...originalWords].filter((w) => rewriteWords.has(w))
    );
    const union = new Set([...originalWords, ...rewriteWords]);
    const overlapRatio = union.size > 0 ? intersection.size / union.size : 0;

    // Calculate simple edit distance ratio (Levenshtein-like heuristic)
    const maxLen = Math.max(original.length, rewrite.length);
    const editDistance = simpleEditDistance(original, rewrite);
    const editRatio = maxLen > 0 ? editDistance / maxLen : 0;

    // Keep if rewrite is meaningfully different:
    // - Word overlap < 0.85 (not just reordering/synonyms)
    // - Edit distance ratio > 0.15 (substantial changes)
    // - Or rewrite is significantly longer (likely added specificity)
    const isSignificantlyLonger = rewrite.length > original.length * 1.3;

    if (
      overlapRatio < 0.85 ||
      editRatio > 0.15 ||
      isSignificantlyLonger
    ) {
      filtered.weak.push(weak[i]);
      filtered.rewritten.push(rewritten[i]);
    }
  }

  return filtered;
}

/**
 * Simple edit distance calculation (Levenshtein-like).
 * Returns the minimum number of single-character edits needed.
 */
function simpleEditDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Create matrix
  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Check if resume text indicates edge cases.
 */
export function detectEdgeCases(resumeText: string): {
  isEmpty: boolean;
  isGarbled: boolean;
  isVeryLong: boolean;
  isNonEnglish: boolean;
} {
  const trimmed = resumeText.trim();

  // Empty or very short
  const isEmpty = trimmed.length < 200;

  // Garbled: excessive non-ASCII, merged words (heuristic)
  const nonAsciiRatio =
    (trimmed.match(/[^\x00-\x7F]/g) || []).length / trimmed.length;
  const isGarbled = nonAsciiRatio > 0.3 || trimmed.match(/\S{30,}/g) !== null; // Very long words suggest merging

  // Very long
  const isVeryLong = trimmed.length > 12000;

  // Non-English: heuristic based on common English words
  const commonEnglishWords = [
    "the",
    "and",
    "for",
    "with",
    "experience",
    "skills",
    "education",
    "work",
    "project",
  ];
  const lowerText = trimmed.toLowerCase();
  const englishWordCount = commonEnglishWords.filter((word) =>
    lowerText.includes(word)
  ).length;
  const isNonEnglish = trimmed.length > 500 && englishWordCount < 3;

  return {
    isEmpty,
    isGarbled,
    isVeryLong,
    isNonEnglish,
  };
}

/**
 * Adjust confidence based on detected edge cases.
 */
export function adjustConfidenceForEdgeCases(
  baseConfidence: number,
  edgeCases: ReturnType<typeof detectEdgeCases>
): number {
  let adjusted = baseConfidence;

  if (edgeCases.isEmpty) {
    adjusted = Math.min(adjusted, 0.5);
  }

  if (edgeCases.isGarbled) {
    adjusted = Math.min(adjusted, 0.6);
  }

  if (edgeCases.isNonEnglish) {
    adjusted = Math.min(adjusted, 0.6);
  }

  return Math.max(0, Math.min(1, adjusted));
}