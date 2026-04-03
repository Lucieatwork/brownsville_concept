"use client";

import { montserrat } from "@/lib/fonts";

type AIBriefChipProps = {
  /** Short line from PRD section 6 (AI Brief short). */
  summary: string;
  /** When set, shows a control to hide the card (parent usually swaps to a compact FAB). */
  onCollapse?: () => void;
};

/** Standard refresh / reload icon (stroke) so we don’t add an icon dependency. */
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

/** Chevron up — same stroke weight as other command-center icons. */
function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

/**
 * AI brief card only (header + summary). Parent supplies fixed positioning — see `command-center-top-bar.tsx`.
 */
export function AIBriefChip({ summary, onCollapse }: AIBriefChipProps) {
  return (
    <div
      className={`${montserrat.className} relative flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] shadow-[0_8px_32px_rgba(0,0,0,0.35)]`}
    >
      {/* Same darker glass as the map permit card — single frosted plate behind content */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-[var(--surface-glass-panel)] backdrop-blur-xl backdrop-saturate-150"
        aria-hidden
      />
      <div className="relative z-[1] flex w-full flex-col gap-2 px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <span
              className="inline-flex min-h-6 w-fit max-w-full shrink-0 items-center justify-center rounded-md bg-white px-2.5 py-1 text-center text-[11px] font-medium uppercase leading-none tracking-wide text-neutral-950 [overflow-wrap:anywhere] sm:px-3 sm:py-1.5"
              aria-hidden
            >
              AI brief
            </span>
            <span className="min-w-0 shrink-0 text-sm text-white">
              Live summary
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-white" title="Summary refresh">
              <RefreshIcon className="opacity-90" />
            </span>
            {onCollapse ? (
              <button
                type="button"
                onClick={onCollapse}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-[opacity,background-color] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                aria-label="Collapse AI brief"
              >
                <ChevronUpIcon className="opacity-90" />
              </button>
            ) : null}
          </div>
        </div>
        <div
          className="h-px w-[calc(100%+1.5rem)] shrink-0 bg-[var(--divider-subtle)] -mx-3"
          aria-hidden
        />
        {/* Summary wraps to multiple lines so the card grows taller — no horizontal scrollbar. */}
        <div className="min-w-0">
          <p className="break-words text-[13px] font-medium leading-relaxed tracking-tight text-[var(--text-primary)] sm:text-sm">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}
