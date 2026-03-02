"use client";

import { useState, useEffect, useRef } from "react";
import { capture } from "@/lib/analytics";

const DIALOG_TITLE_ID = "paywall-title";

export function Paywall({
  onClose,
  onPay,
  loading,
}: {
  onClose: () => void;
  onPay: () => void;
  loading: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const isBusy = loading || busy;
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    capture("paywall_viewed");
  }, []);

  // Capture focus on open and trap focus inside dialog
  useEffect(() => {
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const el = dialogRef.current;
      if (!el) return;
      const focusable = el.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    dialog.addEventListener("keydown", handleKeyDown);
    return () => {
      dialog.removeEventListener("keydown", handleKeyDown);
      previousActiveRef.current?.focus?.();
    };
  }, []);

  async function handlePay() {
    setBusy(true);
    try {
      await onPay();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" aria-hidden="true">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={DIALOG_TITLE_ID}
        className="w-full max-w-md rounded-xl card-surface border border-[var(--border-subtle)] p-6 shadow-xl"
      >
        <h2 id={DIALOG_TITLE_ID} className="text-lg font-semibold text-[var(--text-primary)]">
          One free scan done—your next one&apos;s $2
        </h2>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Every role has different wording. Check the next one before you apply—same full report: match score, gaps, cover letter, and full experience rewrite.
        </p>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-2xl font-normal text-[var(--accent)]">$2</span>
          <span className="text-xs text-[var(--text-faint)]">one-time · no subscription</span>
        </div>
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handlePay}
            disabled={isBusy}
            className="focus-ring active:opacity-90 w-full rounded-lg bg-[var(--accent)] py-3.5 text-sm font-semibold text-[var(--bg-deep)] transition hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBusy ? (
              <span className="flex items-center justify-center gap-3">
                <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[var(--bg-deep)] border-t-transparent" aria-hidden />
                <span>Redirecting to checkout…</span>
              </span>
            ) : (
              "Run another scan — $2"
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          className="focus-ring mt-4 flex min-h-[44px] w-full items-center justify-center text-sm text-[var(--text-faint)] hover:text-[var(--text-secondary)] disabled:opacity-50"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
