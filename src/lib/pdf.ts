/**
 * Extract plain text from a PDF buffer.
 * Uses pdf-parse (Node.js). Returns trimmed string or throws.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  const text = typeof data?.text === "string" ? data.text : "";
  return text.trim() || Promise.reject(new Error("No text extracted from PDF"));
}
