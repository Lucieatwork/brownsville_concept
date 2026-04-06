"use client";

import { montserrat } from "@/lib/fonts";

export type AIBriefMetricTone = "risk" | "warning" | "ok";

export type AIBriefHighlightTone = "risk" | "warning" | "info";

export type AIBriefSummary = {
  updatedAtLabel: string;
  headline: string;
  metrics: readonly {
    value: string;
    label: string;
    tone: AIBriefMetricTone;
  }[];
  highlights: readonly {
    permitId: string;
    text: string;
    tone: AIBriefHighlightTone;
  }[];
};

type AIBriefChipProps = {
  /** Structured content so the brief can show a headline, stat tiles, and key alerts. */
  summary: AIBriefSummary;
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

function metricToneClasses(tone: AIBriefMetricTone): string {
  switch (tone) {
    case "risk":
      return "border-[#7a2333] bg-[#2a151d] text-[#ff6f8a]";
    case "warning":
      return "border-[#735723] bg-[#241d12] text-[#f3c75c]";
    case "ok":
      return "border-[#1c6c62] bg-[#102522] text-[#28d7bf]";
  }
}

function highlightDotClasses(tone: AIBriefHighlightTone): string {
  switch (tone) {
    case "risk":
      return "bg-[#ff6f8a]";
    case "warning":
      return "bg-[#f3c75c]";
    case "info":
      return "bg-[#61a7ff]";
  }
}

/**
 * AI brief card only (header + summary). Parent supplies fixed positioning — see `command-center-top-bar.tsx`.
 */
export function AIBriefChip({ summary, onCollapse }: AIBriefChipProps) {
  return (
    <div
      className={`${montserrat.className} relative flex w-full flex-col overflow-hidden rounded-[1.75rem] border border-[var(--border-subtle)] shadow-[0_8px_32px_rgba(0,0,0,0.35)]`}
    >
      {/* Same darker glass as the map permit card — single frosted plate behind content */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-[color-mix(in_srgb,var(--surface-glass-panel)_88%,#05070a)] backdrop-blur-xl backdrop-saturate-150"
        aria-hidden
      />
      <div className="relative z-[1] flex w-full flex-col gap-3 px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="inline-flex min-h-6 w-fit shrink-0 items-center justify-center rounded-md bg-white px-2.5 py-1 text-center text-[11px] font-medium uppercase leading-none tracking-wide text-neutral-950">
              AI brief
            </span>
            <p className="inline-flex min-h-6 min-w-0 items-center text-[12px] leading-none tracking-wide text-[var(--text-muted)] sm:text-[13px]">
              {summary.updatedAtLabel}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="inline-flex h-8 w-8 items-center justify-center text-white" title="Summary refresh">
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
          className="h-px w-[calc(100%+2rem)] shrink-0 bg-[var(--divider-subtle)] -mx-4"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="break-words text-[15px] font-medium leading-relaxed tracking-[-0.01em] text-[var(--text-primary)] sm:text-[16px]">
            {summary.headline}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {summary.metrics.map((metric) => (
            <div
              key={metric.label}
              className={`flex min-h-[5.25rem] flex-col items-center justify-center rounded-2xl border px-2.5 py-2 text-center ${metricToneClasses(metric.tone)}`}
            >
              <p className="text-[1.45rem] font-semibold leading-none tracking-[-0.03em] sm:text-[1.6rem]">
                {metric.value}
              </p>
              <p className="mt-2 text-[0.68rem] font-semibold uppercase leading-tight tracking-[0.18em] text-white/78">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        <ul className="flex flex-col divide-y divide-[var(--divider-subtle)]">
          {summary.highlights.map((highlight) => (
            <li key={highlight.permitId} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span
                className={`mt-[0.38rem] size-2 shrink-0 rounded-full ${highlightDotClasses(highlight.tone)}`}
                aria-hidden
              />
              <p className="min-w-0 text-[13px] leading-relaxed text-[var(--text-secondary)] sm:text-[13.5px]">
                <span className="font-semibold tracking-[-0.01em] text-white">
                  {highlight.permitId}
                </span>
                {" — "}
                {highlight.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
