"use client";

const VARIANT_MESSAGES: Record<"scan" | "result" | "suspense", string> = {
  scan: "Checking your scan count…",
  result: "Preparing your report…",
  suspense: "Preparing scan…",
};

export function PageLoadingView({
  message,
  variant,
  showSkeleton = false,
}: {
  message?: string;
  variant?: "scan" | "result" | "suspense";
  showSkeleton?: boolean;
}) {
  const displayMessage = message ?? (variant ? VARIANT_MESSAGES[variant] : "Preparing…");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
      <div
        role="status"
        aria-live="polite"
        aria-label={displayMessage}
        className="flex flex-col items-center gap-5 py-8"
      >
        <span
          className="h-8 w-8 shrink-0 animate-spin rounded-full border-2 border-zinc-700 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm font-medium text-zinc-300">{displayMessage}</p>
        {showSkeleton && (
          <div className="mt-4 w-full space-y-3" aria-hidden>
            <div className="h-16 w-full max-w-[200px] rounded-lg bg-zinc-800/80 animate-pulse-soft mx-auto" />
            <div className="h-4 w-full rounded bg-zinc-800/60 animate-pulse-soft" />
            <div className="h-4 w-[85%] rounded bg-zinc-800/50 animate-pulse-soft" />
          </div>
        )}
      </div>
    </main>
  );
}
