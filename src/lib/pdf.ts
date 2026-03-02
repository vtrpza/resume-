import { setScanStage, captureScanError } from "./sentry";

/**
 * Light normalization of extracted PDF text: collapse runs of spaces/newlines to a single space.
 * Keeps meaning intact while reducing noise for the LLM.
 */
function normalizeExtractedText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract plain text from a PDF buffer.
 * Uses pdf-parse (Node.js). Returns normalized, trimmed string or throws.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  setScanStage("pdf_extract");
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    const text = typeof data?.text === "string" ? data.text : "";
    const trimmed = text.trim();
    if (!trimmed) throw new Error("No text extracted from PDF");
    return normalizeExtractedText(trimmed);
  } catch (err) {
    captureScanError(err, { stage: "pdf_extract", code: "pdf_parse_failed" });
    throw err;
  }
}
