"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { setRoute } from "@/lib/sentry";
import { capture, captureResultViewed } from "@/lib/analytics";
import type { ScanAnalysis, ApplyRecommendation } from "@/lib/ai-analysis-contract";
import { validateAndNormalizeAnalysis } from "@/lib/ai-analysis-validation";
import { PageLoadingView } from "@/components/PageLoadingView";
import { AnimatedScore } from "@/components/AnimatedScore";
import { CopyButton } from "@/components/CopyButton";

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
  const resultMissingSent = useRef(false);
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
    if (!resultMissingSent.current) {
      resultMissingSent.current = true;
      capture("result_missing");
    }
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-[var(--text-secondary)]">
          Your report isn&apos;t here—it may have been cleared. Run a new scan
          to get your analysis.
        </p>
        <Link
          href="/scan"
          className="focus-ring active:opacity-90 mt-6 inline-block rounded-lg bg-[var(--accent)] px-6 py-3.5 text-center text-sm font-medium text-[var(--bg-deep)] transition hover:bg-[var(--accent-hover)]"
        >
          Run a new scan
        </Link>
      </main>
    );
  }

  return (
    <main className="result-page mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
      <Link
        href="/"
        className="focus-ring -mx-2 inline-block min-h-[44px] py-2 pl-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
      >
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">Match Report</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Your fit for this role and what to do next.
      </p>

      <AnalysisView data={analysis} />

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <ExportReportButton analysis={analysis} />
      </div>

      {/* Upsell: next scan = $2 */}
      <div className="mt-10 border-t border-[var(--border-subtle)] pt-10">
        <div className="rounded-xl card-surface border border-[var(--border-subtle)] p-5 sm:p-6 ring-1 ring-[var(--accent)]/20">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Run the next role before you apply
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Each job changes the match. One scan = one decision. Same full report for $2—cover letter, full rewrite, gaps, and bullets. One-time, no subscription.
          </p>
          <p className="mt-3 text-xs text-[var(--text-faint)]">
            Don&apos;t send the next one blind.
          </p>
          <Link
            href="/scan"
            className="focus-ring active:opacity-90 mt-4 inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--accent)] px-7 py-3.5 text-base font-semibold text-[var(--bg-deep)] transition hover:bg-[var(--accent-hover)]"
          >
            Run another scan — $2
          </Link>
        </div>
      </div>
    </main>
  );
}

function buildReportMarkdown(analysis: ScanAnalysis): string {
  const verdictLabels: Record<ApplyRecommendation, string> = {
    apply_now: "Strong fit",
    apply_with_edits: "Good fit with a few meaningful gaps",
    improve_first: "Partial fit",
    low_priority: "Weak fit for this role",
  };
  const lines: string[] = [
    "# Resume Match Report",
    "",
    `## ${verdictLabels[analysis.applyRecommendation]}`,
    "",
    analysis.applyRecommendationNote,
    "",
    `## Match score: ${analysis.matchScore}%`,
    "",
  ];
  if (analysis.scoreMeaning) {
    lines.push(analysis.scoreMeaning, "");
  } else if (analysis.matchScoreReasoning) {
    lines.push(analysis.matchScoreReasoning, "");
  }

  lines.push("## Fit summary", "", analysis.tailoredSummary, "");

  lines.push("## Where to improve", "");
  const hasGapGroups = analysis.gapGroups && analysis.gapGroups.length > 0;

  if (analysis.missingSignalInsights && analysis.missingSignalInsights.length > 0) {
    lines.push("### Context for key gaps", "");
    analysis.missingSignalInsights.forEach((insight) => {
      const parts = [insight.term];
      if (insight.gapType) parts.push(`(${insight.gapType})`);
      if (insight.whyItMatters) parts.push(`— ${insight.whyItMatters}`);
      lines.push(`- ${parts.join(" ")}`);
    });
    lines.push("");
  }

  if (hasGapGroups) {
    analysis.gapGroups!.forEach((group, idx) => {
      lines.push(`### ${idx === 0 ? "Biggest blockers" : group.theme}`, "");
      group.items.forEach((item) => lines.push(`- ${item}`));
      lines.push("");
    });
  } else {
    const hasCriticalKeywords = analysis.criticalMissingKeywords && analysis.criticalMissingKeywords.length > 0;
    const hasCriticalSkills = analysis.criticalMissingSkills && analysis.criticalMissingSkills.length > 0;
    const hasCriticalGaps = hasCriticalKeywords || hasCriticalSkills;

    if (hasCriticalGaps) {
      lines.push("### Biggest blockers", "");
      if (hasCriticalKeywords) {
        lines.push("**Keywords:**", "", ...analysis.criticalMissingKeywords!.map((k) => `- ${k}`), "");
      }
      if (hasCriticalSkills) {
        lines.push("**Skills:**", "", ...analysis.criticalMissingSkills!.map((s) => `- ${s}`), "");
      }
      lines.push("");
    }

    const criticalKeywordSet = new Set(analysis.criticalMissingKeywords || []);
    const criticalSkillSet = new Set(analysis.criticalMissingSkills || []);
    const otherKeywords = analysis.missingKeywords.filter((k) => !criticalKeywordSet.has(k));
    const otherSkills = analysis.missingSkills.filter((s) => !criticalSkillSet.has(s));

    if (otherKeywords.length > 0 || otherSkills.length > 0) {
      lines.push("### Secondary gaps", "");
      if (otherKeywords.length > 0) {
        lines.push("**Keywords:**", "", ...otherKeywords.map((k) => `- ${k}`), "");
      }
      if (otherSkills.length > 0) {
        lines.push("**Skills:**", "", ...otherSkills.map((s) => `- ${s}`), "");
      }
      lines.push("");
    } else if (!hasCriticalGaps) {
      if (analysis.missingKeywords.length > 0) {
        lines.push("### Secondary gaps — keywords", "", ...analysis.missingKeywords.map((k) => `- ${k}`), "");
      }
      if (analysis.missingSkills.length > 0) {
        lines.push("### Secondary gaps — skills", "", ...analysis.missingSkills.map((s) => `- ${s}`), "");
      }
      if (analysis.missingKeywords.length === 0 && analysis.missingSkills.length === 0) {
        lines.push("No major keyword or skill gaps identified.", "");
      }
    }
  }

  lines.push("## Format & parsing", "");
  if (analysis.atsRisks.length > 0) {
    lines.push("### ATS risk flags", "", ...analysis.atsRisks.map((r) => `- ${r}`), "");
  } else {
    lines.push("No ATS risk flags identified.", "");
  }
  lines.push("");

  if (analysis.weakBullets.length > 0 && analysis.rewrittenBullets.length === analysis.weakBullets.length) {
    lines.push("## Bullet improvements", "");
    analysis.weakBullets.forEach((weak, i) => {
      lines.push("**Original:**", weak, "", "**Suggested:**", analysis.rewrittenBullets[i] ?? "", "");
      if (analysis.rewriteReasons?.[i]) {
        lines.push(`_${analysis.rewriteReasons[i]}_`, "");
      }
    });
    lines.push("");
  }

  if (analysis.coverLetter) {
    lines.push("## Cover letter", "", analysis.coverLetter, "");
  }

  if (analysis.fullRewrite && analysis.fullRewrite.length > 0) {
    lines.push("## Full experience rewrite", "");
    analysis.fullRewrite.forEach((item) => {
      lines.push("**Original:**", item.original, "", "**Rewritten:**", item.rewritten, "", `_${item.rationale}_`, "");
    });
  }

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
      className="focus-ring active:opacity-90 rounded-lg border-2 border-[var(--accent)]/50 bg-[var(--accent-muted)] px-5 py-2.5 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/20 hover:border-[var(--accent)]"
    >
      Export report (MD)
    </button>
  );
}

const cardClass =
  "rounded-xl card-surface p-5 sm:p-6";

const scoreCardClass =
  "rounded-xl card-surface border-2 border-[var(--border-subtle)] p-6 sm:p-8";

function verdictConfig(
  rec: ApplyRecommendation
): { label: string; ring: string; badge: string } {
  switch (rec) {
    case "apply_now":
      return {
        label: "Strong fit",
        ring: "ring-emerald-500/30 bg-emerald-950/20",
        badge: "bg-emerald-950/50 border-emerald-700/60 text-emerald-200",
      };
    case "apply_with_edits":
      return {
        label: "Good fit with a few meaningful gaps",
        ring: "ring-emerald-500/20 bg-emerald-950/10",
        badge: "bg-teal-950/50 border-teal-700/60 text-teal-200",
      };
    case "improve_first":
      return {
        label: "Partial fit",
        ring: "ring-amber-500/30 bg-amber-950/20",
        badge: "bg-amber-950/50 border-amber-700/60 text-amber-200",
      };
    case "low_priority":
      return {
        label: "Weak fit for this role",
        ring: "ring-red-500/20 bg-red-950/10",
        badge: "bg-red-950/50 border-red-700/60 text-red-200",
      };
  }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">
      {children}
    </p>
  );
}

/** Derive a short improvement label for a bullet rewrite (heuristic). */
function bulletImprovementLabel(
  original: string,
  rewritten: string,
  criticalTerms: string[]
): string {
  const o = original.toLowerCase().trim();
  const r = rewritten.toLowerCase().trim();
  const oFirst = o.split(/\s+/)[0]?.replace(/\W/g, "") ?? "";
  const rFirst = r.split(/\s+/)[0]?.replace(/\W/g, "") ?? "";
  if (r.length < o.length * 0.9) return "Tighter";
  if (oFirst && rFirst && oFirst !== rFirst) return "Stronger opening";
  const rWords = new Set(r.split(/\s+/));
  const hasCritical = criticalTerms.some((t) => rWords.has(t.toLowerCase()));
  if (hasCritical) return "Role-aligned";
  return "More direct";
}

function AnalysisView({ data }: { data: ScanAnalysis }) {
  const [copied, setCopied] = useState(false);
  const [copiedBulletIndex, setCopiedBulletIndex] = useState<number | null>(null);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [copiedFullRewrite, setCopiedFullRewrite] = useState(false);
  const [showAllRewrites, setShowAllRewrites] = useState(false);
  const summary = data.tailoredSummary;
  const REWRITES_VISIBLE_INITIAL = 5;

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

  const handleCopyCoverLetter = useCallback(async () => {
    if (!data.coverLetter) return;
    try {
      await navigator.clipboard.writeText(data.coverLetter);
      setCopiedCoverLetter(true);
      capture("cover_letter_copied", {});
      setTimeout(() => setCopiedCoverLetter(false), 2000);
    } catch {
      // no-op
    }
  }, [data.coverLetter]);

  const fullRewriteText =
    data.fullRewrite?.map((r) => r.rewritten).join("\n\n") ?? "";
  const handleCopyFullRewrite = useCallback(async () => {
    if (!fullRewriteText) return;
    try {
      await navigator.clipboard.writeText(fullRewriteText);
      setCopiedFullRewrite(true);
      capture("full_rewrite_copied", { count: data.fullRewrite?.length ?? 0 });
      setTimeout(() => setCopiedFullRewrite(false), 2000);
    } catch {
      // no-op
    }
  }, [fullRewriteText, data.fullRewrite?.length]);

  const weakBullets = data.weakBullets;
  const rewrittenBullets = data.rewrittenBullets;
  const canPair =
    weakBullets.length > 0 &&
    rewrittenBullets.length > 0 &&
    weakBullets.length === rewrittenBullets.length;

  const showLowQualityNotice = data.extractionQuality === "low";

  const score = data.matchScore;
  const verdict = verdictConfig(data.applyRecommendation);

  return (
    <div className="mt-8 space-y-12">
      {showLowQualityNotice && (
        <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <p className="rounded-lg border border-amber-800/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
            We had trouble reading some parts of your PDF; results may be less
            accurate.
          </p>
        </div>
      )}

      {/* Verdict + score hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
      <section className={`${scoreCardClass} ring-2 ${verdict.ring}`}>
        <div className="flex flex-col items-center py-4 sm:py-6">
          <span
            className={`inline-flex rounded-lg border px-3 py-1.5 text-sm font-semibold ${verdict.badge}`}
          >
            {verdict.label}
          </span>
          <p className="mt-4 text-5xl font-bold tracking-tight text-[var(--text-primary)] sm:text-6xl">
            <AnimatedScore value={score} />
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Match score — overall alignment with job requirements
          </p>
          {(data.scoreMeaning ?? data.matchScoreReasoning) && (
            <p className="mt-3 text-sm text-[var(--text-secondary)] text-center max-w-md">
              {data.scoreMeaning ?? (() => {
                const r = data.matchScoreReasoning!;
                const first = r.split(/[.!]/)[0]?.trim();
                return first ? `${first}.` : r;
              })()}
            </p>
          )}
          <p className="mt-4 text-sm text-[var(--text-secondary)] text-center max-w-md">
            {data.applyRecommendationNote}
          </p>
          <p className="mt-2 text-base font-semibold text-[var(--text-primary)] text-center">
            {data.applyRecommendation === "apply_now" && "Apply now."}
            {data.applyRecommendation === "apply_with_edits" && "Make a few edits, then apply."}
            {data.applyRecommendation === "improve_first" && "Improve alignment before applying."}
            {data.applyRecommendation === "low_priority" && "Deprioritize this role."}
          </p>
          {data.matchScoreReasoning && !data.scoreMeaning && data.matchScoreReasoning.length > 80 && (
            <p className="mt-3 text-xs text-[var(--text-faint)] text-center max-w-md">
              {data.matchScoreReasoning}
            </p>
          )}
        </div>
      </section>
      </motion.div>

      {/* Summary - moved up */}
      {summary && (
        <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <SectionLabel>Summary</SectionLabel>
          <section className={cardClass}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-medium text-[var(--text-muted)]">
                  Fit summary
                </h2>
                <p className="mt-1 text-xs text-[var(--text-faint)]">
                  Job-specific summary you can drop into applications or cover letters.
                </p>
              </div>
              <CopyButton
                onClick={handleCopySummary}
                copied={copied}
                label="Copy summary"
                copiedLabel="✓ Copied"
              />
            </div>
            <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">{summary}</p>
          </section>
        </div>
      )}

      {/* Gaps to close */}
      <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <SectionLabel>Where to improve</SectionLabel>
        <p className="mb-1 text-xs text-[var(--text-faint)]">
          Some of these may reflect experience you have but haven&apos;t stated explicitly—only add what genuinely applies.
        </p>
        {data.missingSignalInsights && data.missingSignalInsights.length > 0 && (
          <section className={cardClass}>
            <h2 className="text-sm font-medium text-zinc-400">
              Context for key gaps
            </h2>
            <ul className="mt-3 space-y-2">
              {data.missingSignalInsights.map((insight, i) => (
                <li key={i} className="flex flex-col gap-1">
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <span className="font-medium text-zinc-300">{insight.term}</span>
                    {insight.gapType && (
                      <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-400">
                        {insight.gapType === "fully_missing" ? "Not in resume" : insight.gapType === "phrasing" ? "Phrasing" : "Experience gap"}
                      </span>
                    )}
                  </span>
                  {insight.whyItMatters && (
                    <span className="text-xs text-zinc-500">{insight.whyItMatters}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {(() => {
          // Check if gapGroups is present and non-empty
          const hasGapGroups = data.gapGroups && data.gapGroups.length > 0;

          if (hasGapGroups) {
            // First group = biggest blockers, rest = themed secondary
            return (
              <>
                {data.gapGroups!.map((group, groupIdx) => (
                  <section
                    key={groupIdx}
                    className={groupIdx === 0 ? `${cardClass} border-l-4 border-red-800/60` : cardClass}
                  >
                    <h2 className="text-sm font-medium text-zinc-400">
                      {groupIdx === 0 ? "Biggest blockers" : group.theme}
                    </h2>
                    {groupIdx === 0 && (
                      <p className="mt-1 text-xs text-zinc-500">
                        Highest impact for this role.
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.items.map((item, itemIdx) => (
                        <span
                          key={itemIdx}
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${groupIdx === 0 ? "bg-red-950/40 border border-red-800/50 text-red-300" : "bg-zinc-800/80 text-zinc-300"}`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </section>
                ))}
              </>
            );
          }

          // Fallback to Critical/Other/flat structure
          const hasCriticalKeywords = data.criticalMissingKeywords && data.criticalMissingKeywords.length > 0;
          const hasCriticalSkills = data.criticalMissingSkills && data.criticalMissingSkills.length > 0;
          const hasCriticalGaps = hasCriticalKeywords || hasCriticalSkills;

          // Calculate other gaps (excluding items already in critical)
          const criticalKeywordSet = new Set(data.criticalMissingKeywords || []);
          const criticalSkillSet = new Set(data.criticalMissingSkills || []);
          const otherKeywords = data.missingKeywords.filter((k) => !criticalKeywordSet.has(k));
          const otherSkills = data.missingSkills.filter((s) => !criticalSkillSet.has(s));

          const hasOtherGaps = otherKeywords.length > 0 || otherSkills.length > 0;
          const hasAnyGaps = hasCriticalGaps || hasOtherGaps || data.missingKeywords.length > 0 || data.missingSkills.length > 0;

          if (!hasAnyGaps) {
            return (
              <p className="text-sm text-zinc-400">
                No major keyword or skill gaps identified.
              </p>
            );
          }

          return (
            <>
              {hasCriticalGaps && (
                <section className={`${cardClass} border-l-4 border-red-800/60`}>
                  <h2 className="text-sm font-medium text-zinc-400">
                    Biggest blockers
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Core requirements or repeatedly mentioned—most important for this role.
                  </p>
                  {hasCriticalKeywords && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-zinc-500 mb-2">Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {data.criticalMissingKeywords!.map((k, i) => (
                          <span key={i} className="inline-flex items-center rounded-md bg-red-950/40 border border-red-800/50 px-2.5 py-1 text-xs font-medium text-red-300">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasCriticalSkills && (
                    <div className={hasCriticalKeywords ? "mt-3" : "mt-3"}>
                      <p className="text-xs font-medium text-zinc-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {data.criticalMissingSkills!.map((s, i) => (
                          <span key={i} className="inline-flex items-center rounded-md bg-red-950/40 border border-red-800/50 px-2.5 py-1 text-xs font-medium text-red-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {hasOtherGaps && (
                <>
                  {otherKeywords.length > 0 && (
                    <section className={cardClass}>
                      <h2 className="text-sm font-medium text-zinc-400">
                        Secondary gaps — keywords
                      </h2>
                      <p className="mt-1 text-xs text-zinc-500">
                        Lower priority; add where they fit.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {otherKeywords.map((k, i) => (
                          <span key={i} className="inline-flex items-center rounded-md bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300">
                            {k}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                  {otherSkills.length > 0 && (
                    <section className={cardClass}>
                      <h2 className="text-sm font-medium text-zinc-400">
                        Secondary gaps — skills
                      </h2>
                      <p className="mt-1 text-xs text-zinc-500">
                        Lower priority; only add skills you actually have.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {otherSkills.map((s, i) => (
                          <span key={i} className="inline-flex items-center rounded-md bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              {!hasCriticalGaps && !hasOtherGaps && (
                <>
                  {data.missingKeywords.length > 0 && (
                    <section className={cardClass}>
                      <h2 className="text-sm font-medium text-zinc-400">
                        Secondary gaps — keywords
                      </h2>
                      <p className="mt-1 text-xs text-zinc-500">
                        Terms from the job description not in your resume—add where they fit.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {data.missingKeywords.map((k, i) => (
                          <span key={i} className="inline-flex items-center rounded-md bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300">
                            {k}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                  {data.missingSkills.length > 0 && (
                    <section className={cardClass}>
                      <h2 className="text-sm font-medium text-zinc-400">
                        Secondary gaps — skills
                      </h2>
                      <p className="mt-1 text-xs text-zinc-500">
                        Skills the job requires that aren&apos;t clearly present—only add what you have.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {data.missingSkills.map((s, i) => (
                          <span key={i} className="inline-flex items-center rounded-md bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </>
          );
        })()}
      </div>

      {/* Bullet improvements — before ATS for progressive disclosure */}
      {(canPair || weakBullets.length > 0 || rewrittenBullets.length > 0) ? (
        <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <SectionLabel>Bullet improvements</SectionLabel>
          {canPair ? (
            <section className={`${cardClass} border-l-4 border-emerald-800/50`}>
              <h2 className="text-sm font-medium text-zinc-400">
                Stronger, role-aligned versions
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Use only what applies—no invented metrics. Copy and drop into your resume.
              </p>
              <ul className="mt-4 space-y-6">
                {(showAllRewrites ? weakBullets : weakBullets.slice(0, REWRITES_VISIBLE_INITIAL)).map((weak, i) => {
                  const rewritten = rewrittenBullets[i] ?? "";
                  const criticalTerms = [
                    ...(data.criticalMissingKeywords ?? []),
                    ...(data.missingKeywords.slice(0, 5)),
                  ];
                  const improvementTag = data.rewriteReasons?.[i] ?? bulletImprovementLabel(weak, rewritten, criticalTerms);
                  return (
                    <li key={i} className="space-y-2 border-t border-[var(--border-subtle)] pt-5 first:border-t-0 first:pt-0">
                      <p className="text-xs font-medium text-[var(--text-faint)]">Original</p>
                      <p className="text-[var(--text-muted)] line-through">{weak}</p>
                      <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
                        <p className="text-xs font-medium text-[var(--text-faint)]">Stronger version</p>
                        <CopyButton
                          onClick={() => handleCopyBullet(rewritten, i)}
                          copied={copiedBulletIndex === i}
                          label="Copy"
                          copiedLabel="✓ Copied"
                          size="sm"
                        />
                      </div>
                      <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 px-3 py-2.5">
                        <p className="text-[var(--text-secondary)]">{rewritten}</p>
                        <span className="mt-2 inline-block text-xs font-medium text-emerald-400/90">
                          {improvementTag}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {weakBullets.length > REWRITES_VISIBLE_INITIAL && !showAllRewrites && (
                <button
                  type="button"
                  onClick={() => setShowAllRewrites(true)}
                  className="focus-ring mt-4 text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  Show {weakBullets.length - REWRITES_VISIBLE_INITIAL} more improvements
                </button>
              )}
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

      {/* Format & parsing (ATS) */}
      <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
        <SectionLabel>Format & parsing</SectionLabel>
        <section className={`${cardClass} border-l-4 border-amber-700/50`}>
          <h2 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
            <span className="text-amber-400/90" aria-hidden>⚠</span>
            ATS risk flags
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Formatting or content issues that could affect how applicant tracking systems read your resume. Address these before you apply.
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

      {/* Next steps — before premium content */}
      <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
        <SectionLabel>What to do next</SectionLabel>
        <section className={cardClass}>
          <h2 className="text-sm font-medium text-[var(--text-muted)]">
            {data.applyRecommendation === "apply_now" && "What to do next: Apply now."}
            {data.applyRecommendation === "apply_with_edits" && "What to do next: Make a few edits, then apply."}
            {data.applyRecommendation === "improve_first" && "What to do next: Improve alignment before applying."}
            {data.applyRecommendation === "low_priority" && "What to do next: Deprioritize this role."}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
            {data.atsRisks.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-faint)] mt-0.5 shrink-0">1.</span>
                <span>Fix format & parsing issues first so ATS can read your resume correctly.</span>
              </li>
            )}
            {(data.criticalMissingKeywords?.length ?? 0) + (data.criticalMissingSkills?.length ?? 0) > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-faint)] mt-0.5 shrink-0">{data.atsRisks.length > 0 ? "2." : "1."}</span>
                <span>Address the biggest blockers above where you have experience.</span>
              </li>
            )}
            {canPair && (
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-faint)] mt-0.5 shrink-0">
                  {data.atsRisks.length > 0 || (data.criticalMissingKeywords?.length ?? 0) + (data.criticalMissingSkills?.length ?? 0) > 0 ? "3." : "1."}
                </span>
                <span>Use the stronger bullet versions above to improve impact and role alignment.</span>
              </li>
            )}
            {summary && (data.applyRecommendation === "apply_now" || data.applyRecommendation === "apply_with_edits") && (
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-faint)] mt-0.5 shrink-0">
                  {data.atsRisks.length > 0 || (data.criticalMissingKeywords?.length ?? 0) + (data.criticalMissingSkills?.length ?? 0) > 0 || canPair ? "4." : "1."}
                </span>
                <span>Drop the fit summary into your application or cover letter.</span>
              </li>
            )}
            {data.applyRecommendation === "low_priority" && (
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-faint)] mt-0.5 shrink-0">1.</span>
                <span>Run a scan on roles that align more closely with your experience—you&apos;ll get clearer, more actionable reports.</span>
              </li>
            )}
            {!data.atsRisks.length && !(data.criticalMissingKeywords?.length ?? 0) && !(data.criticalMissingSkills?.length ?? 0) && !canPair && data.applyRecommendation !== "low_priority" && !(summary && (data.applyRecommendation === "apply_now" || data.applyRecommendation === "apply_with_edits")) && (
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-faint)] mt-0.5 shrink-0">1.</span>
                <span>Use the report above to polish and apply when ready.</span>
              </li>
            )}
          </ul>
          <p className="mt-4 text-xs text-[var(--text-faint)]">
            This report is for this role only. Run another scan for your next target role to get a new match.
          </p>
        </section>
      </div>

      {/* Cover letter — premium */}
      {data.coverLetter && (
        <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
          <SectionLabel>Cover letter</SectionLabel>
          <section className={`${cardClass} border-l-4 border-sky-800/50 relative overflow-hidden`}>
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-sky-600/60 to-sky-400/40" aria-hidden />
            <div className="flex flex-wrap items-start justify-between gap-4 pt-1">
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-sky-400/90">Premium</span>
                <h2 className="mt-1 text-sm font-medium text-[var(--text-muted)]">
                  Tailored to this role
                </h2>
                <p className="mt-1 text-xs text-[var(--text-faint)]">
                  Edit and personalize before sending.
                </p>
              </div>
              <CopyButton
                onClick={handleCopyCoverLetter}
                copied={copiedCoverLetter}
                label="Copy cover letter"
                copiedLabel="✓ Copied"
              />
            </div>
            <div className="mt-4 whitespace-pre-wrap text-[var(--text-secondary)] leading-relaxed">
              {data.coverLetter}
            </div>
          </section>
        </div>
      )}

      {/* Full experience rewrite — premium */}
      {data.fullRewrite && data.fullRewrite.length > 0 && (
        <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: "460ms" }}>
          <SectionLabel>Full experience rewrite</SectionLabel>
          <section className={`${cardClass} border-l-4 border-violet-800/50 relative overflow-hidden`}>
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-violet-600/60 to-violet-400/40" aria-hidden />
            <div className="flex flex-wrap items-start justify-between gap-4 pt-1">
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-violet-400/90">Premium</span>
                <h2 className="mt-1 text-sm font-medium text-[var(--text-muted)]">
                  Every bullet rewritten for this role
                </h2>
                <p className="mt-1 text-xs text-[var(--text-faint)]">
                  Only use what applies—no invented experience.
                </p>
              </div>
              <CopyButton
                onClick={handleCopyFullRewrite}
                copied={copiedFullRewrite}
                label="Copy all"
                copiedLabel="✓ Copied"
              />
            </div>
            <ul className="mt-4 space-y-6">
              {data.fullRewrite.map((item, i) => (
                <li key={i} className="space-y-2 border-t border-[var(--border-subtle)] pt-5 first:border-t-0 first:pt-0">
                  <p className="text-xs font-medium text-[var(--text-faint)]">Original</p>
                  <p className="text-[var(--text-muted)] line-through">{item.original}</p>
                  <div className="mt-3">
                    <p className="text-xs font-medium text-[var(--text-faint)]">Rewritten</p>
                    <div className="rounded-lg border border-violet-900/50 bg-violet-950/20 px-3 py-2.5 mt-1">
                      <p className="text-[var(--text-secondary)]">{item.rewritten}</p>
                      <span className="mt-2 inline-block text-xs font-medium text-violet-400/90">
                        {item.rationale}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
