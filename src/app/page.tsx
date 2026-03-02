import { LandingTracker } from "@/components/LandingTracker";
import { CtaLink } from "@/components/CtaLink";
import { StaggerChildren } from "@/components/StaggerChildren";
import { ScrollReveal } from "@/components/ScrollReveal";
import { HoverScale } from "@/components/HoverScale";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <div
        className="landing-bg pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
      />
      <LandingTracker />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
        {/* Hero: monospace label, serif headline, dot-grid bg, amber CTA */}
        <section className="relative mx-auto max-w-3xl text-center">
          <div className="landing-dot-grid pointer-events-none absolute -inset-8 -z-10 rounded-2xl sm:-inset-12" aria-hidden />
          <StaggerChildren>
            <h1 className="text-4xl font-normal tracking-tight text-[var(--text-primary)] sm:text-5xl sm:leading-[1.15] md:text-6xl">
              Match your resume to the job—before you apply
            </h1>
            <p className="mt-5 text-lg text-[var(--text-secondary)] sm:mt-6 sm:text-xl">
              Upload your PDF, paste the job description. Get a match score,
              missing keywords, ATS risks, stronger bullets, a tailored cover letter,
              and a full experience rewrite—in seconds. No fluff, no fabrication. Your data stays private.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:justify-center">
              <CtaLink
                href="/scan"
                cta="hero_scan"
                className="focus-ring active:opacity-90 rounded-lg bg-[var(--accent)] px-6 py-3.5 text-center text-sm font-medium text-[var(--bg-deep)] transition hover:bg-[var(--accent-hover)] sm:text-base"
              >
                Run my free scan
              </CtaLink>
              <CtaLink
                href="#preview"
                cta="hero_sample_report"
                alsoCapture="sample_report_viewed"
                className="focus-ring active:opacity-90 rounded-lg border border-[var(--border-subtle)] bg-transparent px-6 py-3.5 text-center text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-surface)] sm:text-base"
              >
                See what you&apos;ll get
              </CtaLink>
            </div>
          </StaggerChildren>
        </section>

        <div className="section-divider mx-auto mt-24 max-w-4xl sm:mt-32" aria-hidden />

        {/* How it works: horizontal timeline with connecting line */}
        <ScrollReveal className="mx-auto mt-24 max-w-4xl sm:mt-32" id="how-it-works">
          <section>
          <h2 className="text-center text-2xl font-normal text-[var(--text-primary)] sm:text-3xl">
            How it works
          </h2>
          <p className="mt-2 text-center text-[var(--text-muted)]">Three steps, one report.</p>
          <div className="relative mt-12 grid gap-8 sm:mt-16 sm:grid-cols-3 sm:gap-4">
            {/* Connecting line (desktop) */}
            <div
              className="absolute left-1/2 top-12 hidden h-0.5 w-[calc(100%-4rem)] -translate-x-1/2 sm:block"
              style={{ background: "linear-gradient(90deg, transparent, var(--border-subtle) 15%, var(--border-subtle) 85%, transparent)" }}
              aria-hidden
            />
            <div className="relative flex flex-col items-center text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono text-sm font-medium text-[var(--accent)]">
                1
              </div>
              <div className="flex min-h-[6rem] flex-col">
                <h3 className="mt-0 text-lg font-medium text-[var(--text-primary)]">
                  Upload your resume
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Upload your resume PDF. We analyze content, structure, and formatting.
                </p>
              </div>
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono text-sm font-medium text-[var(--accent)]">
                2
              </div>
              <div className="flex min-h-[6rem] flex-col">
                <h3 className="mt-0 text-lg font-medium text-[var(--text-primary)]">
                  Paste the job description
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Paste the full job description. We compare it against your resume.
                </p>
              </div>
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-mono text-sm font-medium text-[var(--accent)]">
                3
              </div>
              <div className="flex min-h-[6rem] flex-col">
                <h3 className="mt-0 text-lg font-medium text-[var(--text-primary)]">
                  Get your report
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Get a full report—match score, gaps, ATS risks, stronger bullets, a cover letter, and every experience bullet rewritten for the role.
                </p>
              </div>
            </div>
          </div>
          </section>
        </ScrollReveal>

        <div className="section-divider mx-auto mt-24 max-w-4xl sm:mt-32" aria-hidden />

        {/* Benefits */}
        <ScrollReveal className="mx-auto mt-24 max-w-3xl sm:mt-32">
          <section>
          <h2 className="text-center text-2xl font-normal text-[var(--text-primary)] sm:text-3xl">
            Why scan before you apply
          </h2>
          <div className="mt-12 space-y-8">
            {[
              { title: "Focus on roles where you're a strong fit", body: "See where you stand before you spend time applying. Put energy into roles where your resume actually matches." },
              { title: "Add the right keywords so your resume gets past filters", body: "We show exactly which keywords and skills are in the job but missing from your resume. Add them where they fit." },
              { title: "Fix formatting and structure so ATS systems read your resume", body: "Get flagged for layout issues, missing sections, or other problems that can get you filtered out. Fix them before you apply." },
              { title: "Turn vague bullets into clear, quantifiable impact", body: "We only improve what's already on your resume—no invented achievements. Get rewritten bullets that are stronger and specific." },
              { title: "Highlight the experience that matters for this job", body: "Get a job-specific summary that surfaces your most relevant experience for this role." },
              { title: "Get a cover letter you can actually use", body: "We generate a tailored cover letter grounded in your real experience—not a generic template. Copy it, edit it, send it." },
              { title: "See every bullet rewritten for this role", body: "Your entire experience section, rewritten to align with the job description. Same facts, better framing. Each rewrite includes a short rationale so you know why." },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="text-lg font-medium text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[var(--text-secondary)]">{item.body}</p>
              </div>
            ))}
          </div>
          </section>
        </ScrollReveal>

        <div className="section-divider mx-auto mt-24 max-w-4xl sm:mt-32" aria-hidden />

        {/* Report Preview: document treatment, corner marks, MATCH REPORT header */}
        <ScrollReveal className="mx-auto mt-24 max-w-4xl sm:mt-32 scroll-mt-24">
          <section id="preview">
          <h2 className="text-center text-2xl font-normal text-[var(--text-primary)] sm:text-3xl">
            What you&apos;ll get
          </h2>
          <p className="mt-2 text-center text-[var(--text-muted)]">
            One scan returns a report like this—match score, gaps, risks, and concrete improvements.
          </p>
          <HoverScale className="relative mt-12 overflow-hidden rounded-xl card-surface p-px sm:mt-16">
            {/* Corner marks */}
            <span className="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-[var(--border-muted)]" aria-hidden />
            <span className="absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-[var(--border-muted)]" aria-hidden />
            <span className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-[var(--border-muted)]" aria-hidden />
            <span className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-[var(--border-muted)]" aria-hidden />
            <div className="relative rounded-[11px] bg-[var(--bg-surface)] p-6 sm:p-8">
              {/* Document header bar */}
              <div className="mb-6 flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--text-faint)]">
                  Match report
                </p>
              </div>
              <div className="space-y-8">
                {/* Verdict + score hero */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--accent-muted)]/30 p-5 ring-1 ring-[var(--accent)]/20 sm:p-6">
                  <div className="flex flex-col items-center py-2 sm:py-4">
                    <span className="inline-flex rounded-lg border border-teal-700/60 bg-teal-950/50 px-3 py-1.5 text-sm font-semibold text-teal-200">
                      Good fit — minor edits needed
                    </span>
                    <p className="font-mono mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">72%</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Match score — overall alignment with job requirements</p>
                    <p className="mt-3 max-w-md text-center text-sm text-[var(--text-secondary)]">
                      Address the two critical gaps (Kubernetes, CI/CD) where you have experience, then apply.
                    </p>
                  </div>
                </div>

                {/* Critical gaps + other gaps */}
                <div className="border-t border-[var(--border-subtle)] pt-8">
                  <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">Where to improve</p>
                  <div className="mt-4 rounded-xl border border-[var(--border-subtle)] border-l-4 border-l-red-800/60 bg-[var(--bg-surface)] p-4">
                    <h3 className="text-sm font-medium text-[var(--text-muted)]">Critical gaps</h3>
                    <p className="mt-1 text-xs text-[var(--text-faint)]">Most important for this role</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-md border border-red-800/50 bg-red-950/40 px-2.5 py-1 font-mono text-xs font-medium text-red-300">Kubernetes</span>
                      <span className="inline-flex items-center rounded-md border border-red-800/50 bg-red-950/40 px-2.5 py-1 font-mono text-xs font-medium text-red-300">CI/CD</span>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
                    <h3 className="text-sm font-medium text-[var(--text-muted)]">Other missing keywords</h3>
                    <p className="mt-1 text-xs text-[var(--text-faint)]">Lower priority</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-md bg-[var(--bg-surface-hover)] px-2.5 py-1 font-mono text-xs font-medium text-[var(--text-secondary)]">GraphQL</span>
                      <span className="inline-flex items-center rounded-md bg-[var(--bg-surface-hover)] px-2.5 py-1 font-mono text-xs font-medium text-[var(--text-secondary)]">Cloud architecture</span>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
                    <h3 className="text-sm font-medium text-[var(--text-muted)]">Other missing skills</h3>
                    <p className="mt-1 text-xs text-[var(--text-faint)]">Lower priority</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-md bg-[var(--bg-surface-hover)] px-2.5 py-1 font-mono text-xs font-medium text-[var(--text-secondary)]">Container orchestration</span>
                      <span className="inline-flex items-center rounded-md bg-[var(--bg-surface-hover)] px-2.5 py-1 font-mono text-xs font-medium text-[var(--text-secondary)]">System design</span>
                    </div>
                  </div>
                </div>

                {/* ATS risks */}
                <div className="border-t border-[var(--border-subtle)] pt-8">
                  <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">Format & parsing</p>
                  <div className="mt-4 rounded-xl border border-[var(--border-subtle)] border-l-4 border-l-amber-700/50 bg-[var(--bg-surface)] p-4">
                    <h3 className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                      <span className="text-amber-400/90" aria-hidden>⚠</span>
                      ATS risk flags
                    </h3>
                    <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-[var(--text-secondary)]">
                      <li>Two-column layout may confuse ATS parsers</li>
                      <li>No quantified achievements in first 3 bullets</li>
                    </ul>
                  </div>
                </div>

                {/* Bullet improvements */}
                <div className="border-t border-[var(--border-subtle)] pt-8">
                  <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">Bullet improvements</p>
                  <div className="mt-4 rounded-xl border border-[var(--border-subtle)] border-l-4 border-l-emerald-800/50 bg-[var(--bg-surface)] p-4">
                    <h3 className="text-sm font-medium text-[var(--text-muted)]">Stronger version</h3>
                    <p className="mt-1 text-xs text-[var(--text-faint)]">Using only what&apos;s in your resume—no invented metrics.</p>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-[var(--text-faint)]">Original</p>
                        <p className="text-sm text-[var(--text-muted)] line-through">Responsible for managing team projects</p>
                        <p className="text-xs font-medium text-[var(--text-faint)]">Stronger version</p>
                        <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 px-3 py-2.5">
                          <p className="text-sm text-[var(--text-secondary)]">Led team projects from planning through delivery; coordinated stakeholders and tracked milestones</p>
                          <span className="mt-2 inline-block text-xs font-medium text-emerald-400/90">Stronger opening</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fit summary */}
                <div className="border-t border-[var(--border-subtle)] pt-8">
                  <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">Summary</p>
                  <div className="mt-4 flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-[var(--text-muted)]">Fit summary</h3>
                    <span className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-hover)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-faint)]" aria-hidden>Copy</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-faint)]">Job-specific summary you can drop into applications or cover letters.</p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    Full-stack engineer with 5+ years building scalable web applications. Proven track record in React, Node.js, and cloud-native architectures with a focus on performance and developer experience.
                  </p>
                </div>

                {/* Cover letter — premium teaser */}
                <div className="border-t border-[var(--border-subtle)] pt-8">
                  <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">Cover letter</p>
                  <div className="mt-4 rounded-xl border border-[var(--border-subtle)] border-l-4 border-l-sky-800/50 bg-[var(--bg-surface)] relative overflow-hidden p-5 sm:p-6">
                    <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-sky-600/60 to-sky-400/40" aria-hidden />
                    <div className="pt-3">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-sky-400/90">Premium</span>
                      <h3 className="mt-1 text-sm font-medium text-[var(--text-muted)]">Tailored to this role</h3>
                      <p className="mt-1 text-xs text-[var(--text-faint)]">Edit and personalize before sending.</p>
                    </div>
                    <div className="mt-5 relative">
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
                        Dear Hiring Manager,{"\n\n"}
                        I&apos;m writing to express my interest in the Senior Full-Stack Engineer position. With 5+ years building scalable web applications in React and Node.js, my experience aligns closely with your team&apos;s core stack and emphasis on performance…
                      </p>
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg-surface)] to-transparent pointer-events-none" aria-hidden />
                    </div>
                  </div>
                </div>

                {/* Full experience rewrite — premium teaser */}
                <div className="border-t border-[var(--border-subtle)] pt-8">
                  <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">Full experience rewrite</p>
                  <div className="mt-4 rounded-xl border border-[var(--border-subtle)] border-l-4 border-l-violet-800/50 bg-[var(--bg-surface)] relative overflow-hidden p-5 sm:p-6">
                    <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-violet-600/60 to-violet-400/40" aria-hidden />
                    <div className="pt-3">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-violet-400/90">Premium</span>
                      <h3 className="mt-1 text-sm font-medium text-[var(--text-muted)]">Every bullet rewritten for this role</h3>
                      <p className="mt-1 text-xs text-[var(--text-faint)]">Only use what applies—no invented experience.</p>
                    </div>
                    <ul className="mt-5 space-y-6">
                      <li className="space-y-2 border-t border-[var(--border-subtle)] pt-5 first:border-t-0 first:pt-0">
                        <p className="text-xs font-medium text-[var(--text-faint)]">Original</p>
                        <p className="text-sm text-[var(--text-muted)] line-through">Built REST APIs for internal tools</p>
                        <div className="mt-3">
                          <p className="text-xs font-medium text-[var(--text-faint)]">Rewritten</p>
                          <div className="rounded-lg border border-violet-900/50 bg-violet-950/20 px-3 py-2.5 mt-1.5">
                            <p className="text-sm text-[var(--text-secondary)]">Designed and shipped REST APIs powering 3 internal tools used by 40+ engineers; reduced integration time by half</p>
                            <span className="mt-2 inline-block text-xs font-medium text-violet-400/90">Role-aligned; tightened scope</span>
                          </div>
                        </div>
                      </li>
                      <li className="space-y-2 border-t border-[var(--border-subtle)] pt-5">
                        <p className="text-xs font-medium text-[var(--text-faint)]">Original</p>
                        <p className="text-sm text-[var(--text-muted)] line-through">Worked on frontend features</p>
                        <div className="mt-3">
                          <p className="text-xs font-medium text-[var(--text-faint)]">Rewritten</p>
                          <div className="rounded-lg border border-violet-900/50 bg-violet-950/20 px-3 py-2.5 mt-1.5">
                            <p className="text-sm text-[var(--text-secondary)]">Delivered 12 user-facing React features across 2 product launches, driving 20% improvement in task completion</p>
                            <span className="mt-2 inline-block text-xs font-medium text-violet-400/90">Added JD keyword React; quantified impact</span>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </HoverScale>
          </section>
        </ScrollReveal>

        <div className="section-divider mx-auto mt-24 max-w-4xl sm:mt-32" aria-hidden />

        {/* Trust */}
        <ScrollReveal className="mx-auto mt-24 max-w-3xl sm:mt-32">
          <section>
          <h2 className="text-center text-2xl font-normal text-[var(--text-primary)] sm:text-3xl">
            Honest analysis, no fabrication
          </h2>
          <div className="mt-12 space-y-6 text-center">
            <p className="text-[var(--text-secondary)]">
              We only use what&apos;s in your resume—no invented achievements or
              skills. Every suggestion is grounded in your real background and
              how it maps to the job.
            </p>
            <div className="card-surface rounded-xl p-4 text-left sm:p-5">
              <p className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <span aria-hidden className="text-[var(--text-muted)]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                Your privacy matters
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Your resume and job description are processed securely and deleted immediately after analysis.
                We don&apos;t store your documents, share your data with third parties, or use it to train AI models.
                Your information stays private.
              </p>
            </div>
          </div>
          </section>
        </ScrollReveal>

        <div className="section-divider mx-auto mt-24 max-w-4xl sm:mt-32" aria-hidden />

        {/* Pricing: $2 as hero — card offer, accent price, scannable list */}
        <ScrollReveal className="mx-auto mt-24 max-w-3xl sm:mt-32">
          <section aria-labelledby="pricing-heading">
            <h2 id="pricing-heading" className="text-center text-2xl font-normal text-[var(--text-primary)] sm:text-3xl">
              Pricing
            </h2>
            <div className="relative mt-8 overflow-hidden rounded-2xl card-surface p-px sm:mt-12">
              {/* Accent top edge */}
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent" aria-hidden />
              <div className="relative rounded-[15px] bg-[var(--bg-surface)] p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col items-center text-center">
                  <span className="inline-flex items-center rounded-full border border-[var(--accent)]/40 bg-[var(--accent-muted)] px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                    First scan free
                  </span>
                  <div className="mt-6 flex flex-col items-center sm:mt-8">
                    <p className="font-display text-5xl font-normal tracking-tight text-[var(--text-primary)] sm:text-6xl md:text-7xl">
                      $2
                    </p>
                    <p className="mt-1 font-mono text-sm uppercase tracking-wider text-[var(--text-muted)]">
                      per report
                    </p>
                  </div>
                  <p className="mt-4 max-w-md text-[var(--text-secondary)]">
                    One-time payment. No subscription. Use it before each application.
                  </p>
                </div>
                <div className="mx-auto mt-8 max-w-lg sm:mt-10">
                  <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)]">
                    Every report includes
                  </p>
                  <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 sm:gap-y-3.5" role="list">
                    {[
                      "Match score and fit verdict",
                      "Missing keywords and skills",
                      "ATS risk flags",
                      "Bullet rewrites",
                      "Tailored cover letter",
                      "Full experience rewrite",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20" aria-hidden>
                          <svg className="h-2.5 w-2.5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-6 text-center text-xs text-[var(--text-faint)]">
                  Pay once per report. No recurring charges.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <div className="section-divider mx-auto mt-24 max-w-4xl sm:mt-32" aria-hidden />

        {/* FAQ */}
        <ScrollReveal className="mx-auto mt-24 max-w-3xl sm:mt-32">
          <section>
          <h2 className="text-center text-2xl font-normal text-[var(--text-primary)] sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-12 space-y-8">
            {[
              { q: "How does the scan work?", a: "Upload your resume PDF and paste the job description. We analyze both, extract keywords and requirements, and return a structured report: match score, gaps, ATS risk flags, bullet rewrites, a tailored cover letter, and a full experience rewrite. We flag formatting issues that can hurt ATS parsing—we don't guarantee any system will pass, but we help you fix obvious risks." },
              { q: "Is my data private?", a: "Yes. We process your documents securely and don't store them after analysis. We don't share your data with third parties or use it for training." },
              { q: "Do you rewrite or fabricate experience?", a: "No. We only improve bullets that are already in your resume. We never invent achievements, add skills you don't have, or fabricate experience." },
              { q: "Who is this for?", a: "U.S. job seekers in software engineering, product, data/analytics, and design. Works best when you have a specific job description to match against." },
            ].map((faq, i) => (
              <div key={i}>
                <h3 className="text-lg font-medium text-[var(--text-primary)]">{faq.q}</h3>
                <p className="mt-2 text-[var(--text-secondary)]">{faq.a}</p>
              </div>
            ))}
          </div>
          </section>
        </ScrollReveal>

        <div className="section-divider mx-auto mt-24 max-w-4xl sm:mt-32" aria-hidden />

        {/* Final CTA */}
        <ScrollReveal className="mx-auto mt-24 max-w-2xl text-center sm:mt-32">
          <section>
          <h2 className="text-2xl font-normal text-[var(--text-primary)] sm:text-3xl">
            Don&apos;t send the next application blind
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Each role is different—check every one before you apply. One free
            scan, then $2 per report. No subscription.
          </p>
          <CtaLink
            href="/scan"
            cta="final_scan"
            className="focus-ring active:opacity-90 mt-8 inline-block rounded-lg bg-[var(--accent)] px-8 py-3.5 text-base font-medium text-[var(--bg-deep)] transition hover:bg-[var(--accent-hover)]"
          >
            Run my free scan
          </CtaLink>
          </section>
        </ScrollReveal>
      </main>
    </div>
  );
}
