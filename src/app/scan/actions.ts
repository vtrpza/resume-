"use server";

import { extractTextFromPdf } from "@/lib/pdf";
import { analyzeResume, type ScanAnalysis } from "@/lib/analyze";
import { getOrCreateAndIncrementScan } from "@/lib/db";

const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_JD_LENGTH = 50_000;

export type ScanResult =
  | { ok: true; analysis: ScanAnalysis }
  | { ok: false; error: string };

export async function runScan(formData: FormData): Promise<ScanResult> {
  const file = formData.get("resume") as File | null;
  const jd = (formData.get("jd") as string)?.trim() ?? "";
  const sessionId = (formData.get("sessionId") as string)?.trim() ?? "";

  if (!file || file.size === 0) {
    return { ok: false, error: "Please upload a PDF resume." };
  }
  if (file.type !== "application/pdf") {
    return { ok: false, error: "Resume must be a PDF file." };
  }
  if (file.size > MAX_PDF_BYTES) {
    return { ok: false, error: "Resume must be under 5 MB." };
  }
  if (!jd) {
    return { ok: false, error: "Please paste the job description." };
  }
  if (jd.length > MAX_JD_LENGTH) {
    return { ok: false, error: "Job description is too long." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const resumeText = await extractTextFromPdf(buffer);
    if (!resumeText) {
      return {
        ok: false,
        error: "Could not extract text from the PDF (e.g. scanned image).",
      };
    }
    const analysis = await analyzeResume(resumeText, jd);
    if (sessionId) {
      await getOrCreateAndIncrementScan(sessionId);
    }
    return { ok: true, analysis };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Scan failed.";
    return { ok: false, error: message };
  }
}
