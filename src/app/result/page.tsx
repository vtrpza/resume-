"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { setRoute } from "@/lib/sentry";
import { capture, captureResultViewed } from "@/lib/analytics";
import type { ScanAnalysis } from "@/lib/ai-analysis-contract";
import { validateAndNormalizeAnalysis } from "@/lib/ai-analysis-validation";
import { PageLoadingView } from "@/components/PageLoadingView";

export default function ResultPage() {
  const [analysis, setAnalysis] = useState<ScanAnalysis | null | undefined>(undefined);

  useEffect(() => {
    setRoute("result");
  }, []);

  useEffect(() => {
    const analysisJson = sessionStorage.getItem("scan_analysis");
    if (!analysisJson) {
      setAnalysis(null);
      return;
    }
    try {
      const parsed = JSON.parse(analysisJson) as unknown;
      const validated = validateAndNormalizeAnalysis(parsed);
      setAnalysis(validated ?? null);
    } catch {
      setAnalysis(null);
    }
  }, []);

  const resultViewedSent = useRef(false);
  useEffect(() => {
    if (analysis == null || resultViewedSent.current) return;
    resultViewedSent.current = true;
    captureResultViewed({
      matchScore: analysis.matchScore,
      missingKeywords: analysis.missingKeywords,
      atsRisks: analysis.atsRisks,
    });
  }, [analysis]);

  if (analysis === undefined) {
    return <PageLoadingView variant="result" showSkeleton />;
  }

  if (analysis === null) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-zinc-400">
          Your report isn&apos;t here—it may have been cleared. Run a new scan
          to get your analysis.
        </p>
        <Link
          href="/scan"
          className="focus-ring active:opacity-90 mt-6 inline-block rounded-lg bg-white px-6 py-3.5 text-center text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
        >
          Run a new scan
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
      <Link
        href="/"
        className="focus-ring -mx-2 inline-block min-h-[44px] py-2 pl-2 text-sm text-zinc-500 hover:text-zinc-300"
      >
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-white">Your scan results</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Review your match score, gaps, and improvement suggestions below.
      </p>
      <div className="mt-4">
        <ExportReportButton analysis={analysis} />
      </div>

      <AnalysisView data={analysis} />

      {/* Upsell: next scan = $2 */}
      <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
        <p className="text-sm font-medium text-zinc-300">
          Scan another job for $2 — same full report.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          One-time payment per scan. No subscription.
        </p>
        <Link
          href="/scan"
          className="focus-ring active:opacity-90 mt-4 inline-block min-h-[44px] rounded-lg bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
        >
          Scan another resume
        </Link>
      </div>
    </main>
  );
}

function buildReportMarkdown(analysis: ScanAnalysis): string {
  const lines: string[] = [
    "# Resume Match Report",
    "",
    `## Match score: ${analysis.matchScore}%`,
    "",
  ];
  if (analysis.matchScoreReasoning) {
    lines.push(analysis.matchScoreReasoning, "");
  }
  lines.push("## Gaps to close", "");
  if (analysis.missingKeywords.length > 0) {
    lines.push("### Missing keywords", "", ...analysis.missingKeywords.map((k) => `- ${k}`), "");
  }
  if (analysis.missingSkills.length > 0) {
    lines.push("### Missing skills", "", ...analysis.missingSkills.map((s) => `- ${s}`), "");
  }
  if (analysis.missingKeywords.length === 0 && analysis.missingSkills.length === 0) {
    lines.push("No major keyword or skill gaps identified.", "");
  }
  lines.push("## ATS risk flags", "");
  if (analysis.atsRisks.length > 0) {
    lines.push(...analysis.atsRisks.map((r) => `- ${r}`), "");
  } else {
    lines.push("No ATS risk flags identified.", "");
  }
  if (analysis.weakBullets.length > 0 && analysis.rewrittenBullets.length === analysis.weakBullets.length) {
    lines.push("## Bullet improvements", "");
    analysis.weakBullets.forEach((weak, i) => {
      lines.push("**Original:**", weak, "", "**Suggested:**", analysis.rewrittenBullets[i] ?? "", "");
    });
  }
  lines.push("## Tailored summary", "", analysis.tailoredSummary);
  return lines.join("\n");
}

function ExportReportButton({ analysis }: { analysis: ScanAnalysis }) {
  const handleExport = useCallback(() => {
    const md = buildReportMarkdown(analysis);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-match-report.md";
    a.click();
    URL.revokeObjectURL(url);
    capture("export_clicked", { format: "md" });
  }, [analysis]);
  return (
    <button
      type="button"
      onClick={handleExport}
      className="focus-ring active:opacity-90 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700"
    >
      Export report (MD)
    </button>
  );
}

const cardClass =
  "rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6";

const scoreCardClass =
  "rounded-xl border-2 border-zinc-700 bg-zinc-900/80 p-6 sm:p-8";

function scoreBand(score: number): { label: string; ring: string } {
  if (score >= 80) return { label: "Strong match. Your resume aligns well with this role.", ring: "ring-emerald-500/30 bg-emerald-950/20" };
  if (score >= 60) return { label: "Good match. Consider adding missing keywords to improve your score.", ring: "ring-amber-500/30 bg-amber-950/20" };
  return { label: "Room for improvement. Review missing keywords and skills below.", ring: "ring-red-500/20 bg-red-950/10" };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
      {children}
    </p>
  );
}

function AnalysisView({ data }: { data: ScanAnalysis }) {
  const [copied, setCopied] = useState(false);
  const [copiedBulletIndex, setCopiedBulletIndex] = useState<number | null>(null);
  const summary = data.tailoredSummary;

  const handleCopySummary = useCallback(async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      capture("summary_copied", { summary_length: summary.length });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op
    }
  }, [summary]);

  const handleCopyBullet = useCallback(async (text: string, index: number) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBulletIndex(index);
      capture("bullet_copied", { index });
      setTimeout(() => setCopiedBulletIndex(null), 2000);
    } catch {
      // no-op
    }
  }, []);

  const weakBullets = data.weakBullets;
  const rewrittenBullets = data.rewrittenBullets;
  const canPair =
    weakBullets.length > 0 &&
    rewrittenBullets.length > 0 &&
    weakBullets.length === rewrittenBullets.length;

  const showLowQualityNotice =
    data.extractionQuality === "low" || data.confidence < 0.7;

  const score = data.matchScore;
  const band = scoreBand(score);

  return (
    <div className="mt-8 space-y-8">
      {showLowQualityNotice && (
        <p className="rounded-lg border border-amber-800/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
          We had trouble reading some parts of your PDF; results may be less
          accurate.
        </p>
      )}

      {/* Match score hero */}
      <section className={`${scoreCardClass} ring-2 ${band.ring}`}>
          <h2 className="text-sm font-medium text-zinc-500 mb-4">Match score</h2>
          <div className="flex flex-col items-center py-4 sm:py-6">
            <p className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
              {score}%
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Overall alignment with job requirements
            </p>
            <p className="mt-4 text-sm text-zinc-300 text-center max-w-sm">
              {band.label}
            </p>
            {data.matchScoreReasoning && (
              <p className="mt-3 text-xs text-zinc-500 text-center max-w-md">
                {data.matchScoreReasoning}
              </p>
            )}
          </div>
        </section>

      {/* Gaps to close */}
      <div className="space-y-5">
        <SectionLabel>Gaps to close</SectionLabel>
        {data.missingKeywords.length > 0 || data.missingSkills.length > 0 ? (
          <>
            {data.missingKeywords.length > 0 && (
              <section className={cardClass}>
                <h2 className="text-sm font-medium text-zinc-400">
                  Missing keywords
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Terms from the job description not in your resume. Adding them where they fit can improve ATS compatibility.
                </p>
                <ul className="mt-3 list-inside list-disc space-y-1.5 text-zinc-300">
                  {data.missingKeywords.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                </ul>
              </section>
            )}
            {data.missingSkills.length > 0 && (
              <section className={cardClass}>
                <h2 className="text-sm font-medium text-zinc-400">
                  Missing skills
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Skills the job requires that aren&apos;t clearly present. Only add skills you actually have.
                </p>
                <ul className="mt-3 list-inside list-disc space-y-1.5 text-zinc-300">
                  {data.missingSkills.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-400">
            No major keyword or skill gaps identified.
          </p>
        )}
      </div>

      {/* Risks to fix */}
      <div className="space-y-5">
        <SectionLabel>Risks to fix</SectionLabel>
        <section className={cardClass}>
          <h2 className="text-sm font-medium text-zinc-400">
            ATS risk flags
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Formatting or content issues that could affect how applicant tracking systems read your resume.
          </p>
          {data.atsRisks.length > 0 ? (
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-zinc-300">
              {data.atsRisks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">
              No ATS risk flags identified.
            </p>
          )}
        </section>
      </div>

      {/* Improvements */}
      {(canPair || weakBullets.length > 0 || rewrittenBullets.length > 0) ? (
        <div className="space-y-5">
          <SectionLabel>Improvements</SectionLabel>
          {canPair ? (
            <section className={cardClass}>
              <h2 className="text-sm font-medium text-zinc-400">
                Bullet improvements
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Stronger, more impactful versions using only what&apos;s in your resume—no invented metrics.
              </p>
              <ul className="mt-4 space-y-6">
                {weakBullets.map((weak, i) => (
                  <li key={i} className="space-y-2 border-t border-zinc-800 pt-5 first:border-t-0 first:pt-0">
                    <p className="text-xs font-medium text-zinc-500">Original</p>
                    <p className="text-zinc-400 line-through">{weak}</p>
                    <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
                      <p className="text-xs font-medium text-zinc-500">Suggested</p>
                      <button
                        type="button"
                        onClick={() => handleCopyBullet(rewrittenBullets[i], i)}
                        className="focus-ring active:opacity-90 shrink-0 rounded border border-zinc-600 bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700"
                      >
                        {copiedBulletIndex === i ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-zinc-300">{rewrittenBullets[i]}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <>
              {weakBullets.length > 0 && (
                <section className={cardClass}>
                  <h2 className="text-sm font-medium text-zinc-400">Weak bullets</h2>
                  <ul className="mt-2 space-y-1.5 text-zinc-300">
                    {weakBullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </section>
              )}
              {rewrittenBullets.length > 0 && (
                <section className={cardClass}>
                  <h2 className="text-sm font-medium text-zinc-400">Rewritten bullets</h2>
                  <ul className="mt-2 space-y-2 text-zinc-300">
                    {rewrittenBullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      ) : null}

      {/* Summary */}
      {summary && (
        <div className="space-y-5">
          <SectionLabel>Summary</SectionLabel>
          <section className={cardClass}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-medium text-zinc-400">
                  Tailored summary
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Job-specific summary you can drop into applications or cover letters.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopySummary}
                className="focus-ring active:opacity-90 shrink-0 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
              >
                {copied ? "✓ Copied" : "Copy summary"}
              </button>
            </div>
            <p className="mt-4 text-zinc-300 leading-relaxed">{summary}</p>
            <p className="mt-4 text-xs text-zinc-500">
              Use the summary in your application or cover letter; address the gaps and risks above before you apply.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
