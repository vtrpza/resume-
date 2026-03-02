import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        The page you’re looking for doesn’t exist or was moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="focus-ring active:opacity-90 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-3.5 text-center text-sm font-medium text-[var(--bg-deep)] transition hover:bg-[var(--accent-hover)]"
        >
          Home
        </Link>
        <Link
          href="/scan"
          className="focus-ring active:opacity-90 inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-transparent px-6 py-3.5 text-center text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-surface)]"
        >
          Run free scan
        </Link>
      </div>
    </main>
  );
}
