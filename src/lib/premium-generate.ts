/**
 * Premium content generation: cover letter + full experience rewrite.
 * Uses gpt-4o for tailored cover letter and all-bullet rewrites.
 * Never fabricates candidate experience.
 */

import OpenAI from "openai";
import { setScanStage, setScanContext, captureScanError } from "./sentry";
import type { ScanAnalysis, ExperienceRewrite } from "./ai-analysis-contract";
import { validatePremiumContent as validatePremiumContentFromValidation } from "./ai-analysis-validation";

// ============================================================================
// 1. TYPES
// ============================================================================

export type { ExperienceRewrite } from "./ai-analysis-contract";

export interface PremiumContent {
  coverLetter: string;
  fullRewrite: ExperienceRewrite[];
}

// ============================================================================
// 2. STRICT JSON SCHEMA
// ============================================================================

/**
 * Strict JSON Schema for gpt-4o structured output (cover letter + full rewrite).
 */
export const PREMIUM_JSON_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "premium_content",
    strict: true,
    schema: {
      type: "object",
      properties: {
        coverLetter: {
          type: "string",
          minLength: 150,
          maxLength: 4000,
          description:
            "Tailored cover letter in U.S. business letter style. 3-4 paragraphs. Opens with role/company if identifiable. References only real experience from the resume. Addresses key gaps honestly. No fabrication, no hype.",
        },
        fullRewrite: {
          type: "array",
          items: {
            type: "object",
            properties: {
              original: {
                type: "string",
                minLength: 10,
                maxLength: 400,
                description: "Exact or close quote of the original experience bullet from the resume.",
              },
              rewritten: {
                type: "string",
                minLength: 20,
                maxLength: 400,
                description:
                  "Rewritten bullet aligned to this job. Only facts from the original. May incorporate JD keywords where candidate has the experience. Never invent metrics or scope.",
              },
              rationale: {
                type: "string",
                minLength: 10,
                maxLength: 120,
                description:
                  "Short rationale for the rewrite, e.g. 'Added JD keyword X', 'Tightened for impact', 'Role-aligned opening'.",
              },
            },
            required: ["original", "rewritten", "rationale"],
            additionalProperties: false,
          },
          minItems: 0,
          maxItems: 25,
          description:
            "Every experience bullet from the resume, rewritten for this specific role. Same order as resume. Only use facts from the original.",
        },
      },
      required: ["coverLetter", "fullRewrite"],
      additionalProperties: false,
    },
  } as const
}
// ============================================================================
// 3. SYSTEM PROMPT
// ============================================================================

export const PREMIUM_SYSTEM_PROMPT =
  "You are an expert at writing job application materials. You produce a tailored cover letter and a full experience rewrite for a candidate applying to a specific role.\n\n" +
  "CRITICAL RULES:\n" +
  "1. NEVER fabricate candidate experience, achievements, skills, metrics, or employers.\n" +
  "2. ONLY use information present in the provided resume text and job description.\n" +
  "3. Cover letter and rewrites must be grounded in the resume. If something isn't in the resume, do not claim it.\n" +
  "4. Do not invent numbers, team sizes, impact figures, or scope not supported by the source.\n\n" +
  "COVER LETTER:\n" +
  "- U.S. business letter style. 3-4 paragraphs.\n" +
  '- Open with the specific role and company name if clearly identifiable from the job description; otherwise use "this position" or "your team."\n' +
  "- Reference real experience from the resume. Lead with 2-3 strengths that match the role.\n" +
  '- Address key gaps honestly where relevant (e.g., "I am building experience in X" only if the resume supports it). Do not overclaim.\n' +
  '- Tone: Professional, credible, practical. No hype, no "guaranteed interview," no generic flattery.\n' +
  "- Length: 150-600 words (roughly 800-4000 characters).\n\n" +
  "FULL REWRITE:\n" +
  "- Rewrite ALL experience bullets from the resume (every bullet in the work/experience section). Do not skip bullets.\n" +
  "- Preserve the order of bullets as they appear in the resume.\n" +
  "- Each rewritten bullet must: (a) use only facts from the original, (b) align language with the job description where the candidate genuinely has that experience, (c) never add metrics or scope not in the original.\n" +
  '- For each item output: original (exact or close quote of the resume bullet), rewritten (improved version for this role), rationale (short reason, e.g. "Added JD keyword React", "Tightened for impact").\n' +
  "- If the resume has no clear experience bullets (e.g. very short or garbled), output fullRewrite as an empty array and still produce a best-effort cover letter.\n\n" +
  "CONSISTENCY:\n" +
  "- The cover letter and full rewrite should align with the analysis summary and match score provided. Do not claim strength in an area the analysis flags as a critical gap unless the resume clearly supports it.\n" +
  "- Use the tailoredSummary and applyRecommendation from the analysis to keep tone and emphasis consistent.\n\n" +
  "OUTPUT: Strict JSON with coverLetter (string) and fullRewrite (array of { original, rewritten, rationale }).";

/**
 * Build user prompt for premium generation (resume + JD + analysis context).
 */
export function buildPremiumPrompt(
  resumeText: string,
  jobDescription: string,
  analysis: ScanAnalysis
): string {
  const truncatedResume = resumeText.slice(0, 12000);
  const truncatedJd = jobDescription.slice(0, 8000);
  const reasoningLine =
    analysis.matchScoreReasoning != null && analysis.matchScoreReasoning !== ""
      ? "- Reasoning: " + analysis.matchScoreReasoning + "\n\n"
      : "";
  return (
    "Generate the cover letter and full experience rewrite for this candidate and role.\n\n" +
    "RESUME TEXT:\n" +
    truncatedResume +
    "\n\nJOB DESCRIPTION:\n" +
    truncatedJd +
    "\n\nANALYSIS CONTEXT (use for alignment; do not fabricate):\n" +
    "- Match score: " +
    analysis.matchScore +
    "%\n" +
    "- Apply recommendation: " +
    analysis.applyRecommendation +
    "\n" +
    "- Summary: " +
    analysis.tailoredSummary +
    "\n" +
    reasoningLine +
    "Output strict JSON with coverLetter and fullRewrite (array of { original, rewritten, rationale }) for every experience bullet in the resume."
  );
}

// ============================================================================
// 4. GENERATE
// ============================================================================

const PREMIUM_MODEL = "gpt-4o";

/**
 * Generate premium content (cover letter + full experience rewrite) using gpt-4o.
 * Returns null on failure; caller should not block the scan.
 */
export async function generatePremiumContent(
  resumeText: string,
  jobDescription: string,
  analysis: ScanAnalysis
): Promise<PremiumContent | null> {
  setScanStage("premium_generate");
  setScanContext({ model: PREMIUM_MODEL });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const openai = new OpenAI({ apiKey });
  const userContent = buildPremiumPrompt(resumeText, jobDescription, analysis);

  try {
    const response = await openai.chat.completions.create({
      model: PREMIUM_MODEL,
      messages: [
        { role: "system", content: PREMIUM_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      response_format: PREMIUM_JSON_SCHEMA,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }

    const validated = validatePremiumContentFromValidation(
      parsed as Record<string, unknown>
    );
    if (validated) {
      setScanContext({ model: PREMIUM_MODEL, premiumValid: true });
    }
    return validated;
  } catch (err) {
    captureScanError(
      err instanceof Error ? err : new Error(String(err)),
      { stage: "premium_generate", code: "premium_generate_failed" }
    );
    return null;
  }
}
