import Link from "next/link";
import { CtaLink } from "@/components/CtaLink";

export function Header() {
  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-deep)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="focus-ring flex min-h-[44px] items-center py-2 text-base font-medium text-[var(--text-primary)] transition hover:text-[var(--text-secondary)]"
        >
          <span className="font-display text-lg">Resume Match</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-[var(--text-faint)] sm:inline">
            Match your resume to the job
          </span>
          <CtaLink
            href="/scan"
            cta="header_scan"
            className="focus-ring active:opacity-90 flex min-h-[44px] items-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--bg-deep)] transition hover:bg-[var(--accent-hover)]"
          >
            Run free scan
          </CtaLink>
        </div>
      </div>
    </header>
  );
}
