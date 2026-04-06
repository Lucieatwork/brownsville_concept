"use client";

import {
  AIBriefChip,
  type AIBriefSummary,
} from "@/components/command-center/ai-brief-chip";
import { useMapChromeBoundsOptional } from "@/components/command-center/map-chrome-bounds-context";
import { MapAiChatPanel } from "@/components/command-center/map-ai-chat-panel";
import { PermitFilterPanel } from "@/components/command-center/permit-filter-panel";
import { montserrat } from "@/lib/fonts";
import { useCallback, useState } from "react";

/** Document lines — collapsed “AI brief” FAB (same stroke language as KPI cycle button). */
function IconAiBrief() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75m8.25 12.75h-9a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 6.75 4.5h6.375c.621 0 1.125.504 1.125 1.125v3.659a2.25 2.25 0 0 0 1.091.607l2.652 1.09a2.25 2.25 0 0 1 1.307 2.042V12"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 3h4.5m-4.5 3h3"
      />
    </svg>
  );
}

/** Chat bubble — collapsed “AI chat” FAB. */
function IconAiChat() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.716 15.634 3 13.82 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
      />
    </svg>
  );
}

/** Matches stacked KPI FABs in `map-kpi-layer.tsx` (bottom-right cycle + regional). */
const AI_STACK_FAB_CLASS =
  "group flex min-h-12 min-w-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full bg-blue-600 px-2 text-white shadow-md transition-[background-color,transform] duration-200 ease-out hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:scale-[0.97]";

type CommandCenterTopBarProps = {
  /** Structured data for the richer live-summary card. */
  summary: AIBriefSummary;
};

/**
 * Fixed top strip: search & filters top-left; AI brief and chat top-right.
 * Outer shell uses pointer-events-none so the map stays draggable; panels opt back in.
 */
export function CommandCenterTopBar({ summary }: CommandCenterTopBarProps) {
  const chrome = useMapChromeBoundsOptional();
  const [isBriefExpanded, setIsBriefExpanded] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(true);

  const collapseBrief = useCallback(() => setIsBriefExpanded(false), []);
  const collapseChat = useCallback(() => setIsChatExpanded(false), []);
  const expandBrief = useCallback(() => setIsBriefExpanded(true), []);
  const expandChat = useCallback(() => setIsChatExpanded(true), []);

  return (
    <div
      ref={chrome?.topBarRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-20 px-4 pt-4 sm:px-6 sm:pt-6"
    >
      <div className="flex w-full items-start justify-between gap-4">
        <div
          ref={chrome?.leftStackRef}
          className="pointer-events-auto min-w-0 max-w-[42rem] flex-1 pr-2"
        >
          <PermitFilterPanel />
        </div>
        <div
          ref={chrome?.rightStackRef}
          className={`pointer-events-auto flex w-full max-w-[36rem] shrink-0 flex-col items-end gap-2 ${montserrat.className}`}
        >
          {isBriefExpanded ? (
            <div className="min-w-0 w-full">
              <AIBriefChip summary={summary} onCollapse={collapseBrief} />
            </div>
          ) : (
            <button
              type="button"
              onClick={expandBrief}
              className={AI_STACK_FAB_CLASS}
              aria-expanded={false}
              aria-label="Show AI brief summary"
            >
              <span className="flex flex-col items-center justify-center gap-0.5">
                <span className="opacity-95 group-hover:opacity-100" aria-hidden>
                  <IconAiBrief />
                </span>
                <span className="max-w-[3.25rem] text-center text-[9px] font-semibold uppercase leading-tight tracking-wide text-white">
                  Brief
                </span>
              </span>
            </button>
          )}

          {isChatExpanded ? (
            <div className="min-w-0 w-full">
              <MapAiChatPanel onCollapse={collapseChat} />
            </div>
          ) : (
            <button
              type="button"
              onClick={expandChat}
              className={AI_STACK_FAB_CLASS}
              aria-expanded={false}
              aria-label="Show AI assistant chat"
            >
              <span className="flex flex-col items-center justify-center gap-0.5">
                <span className="opacity-95 group-hover:opacity-100" aria-hidden>
                  <IconAiChat />
                </span>
                <span className="max-w-[3.25rem] text-center text-[9px] font-semibold uppercase leading-tight tracking-wide text-white">
                  Chat
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
