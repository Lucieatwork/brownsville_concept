import { montserrat } from "@/lib/fonts";

type AIBriefChipProps = {
  /** Short line from PRD section 6 (AI Brief short). */
  summary: string;
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

/**
 * AI brief card only (header + summary). Parent supplies fixed positioning — see `command-center-top-bar.tsx`.
 */
export function AIBriefChip({ summary }: AIBriefChipProps) {
  return (
    <div
      className={`${montserrat.className} flex h-full min-h-0 w-full flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <span
            className="inline-flex h-6 shrink-0 items-center justify-center rounded-full bg-blue-600 px-2.5 text-center text-[11px] font-medium uppercase leading-none tracking-wide text-white"
            aria-hidden
          >
            AI brief
          </span>
          <span className="shrink-0 text-[11px] text-white">Live summary</span>
        </div>
        <span className="shrink-0 text-white" title="Summary refresh">
          <RefreshIcon className="opacity-90" />
        </span>
      </div>
      {/* Main stats line sits under the header so the top row stays scannable. */}
      <div className="min-w-0 overflow-x-auto [scrollbar-width:thin]">
        <p className="whitespace-nowrap text-sm font-medium leading-snug tracking-tight text-[var(--text-primary)] sm:text-[15px] sm:leading-relaxed">
          {summary}
        </p>
      </div>
    </div>
  );
}
