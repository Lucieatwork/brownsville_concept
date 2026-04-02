"use client";

import { AIBriefChip } from "@/components/command-center/ai-brief-chip";
import { useMapChromeBoundsOptional } from "@/components/command-center/map-chrome-bounds-context";
import { MapAiChatPanel } from "@/components/command-center/map-ai-chat-panel";
import { PermitFilterPanel } from "@/components/command-center/permit-filter-panel";

type CommandCenterTopBarProps = {
  /** Short line from PRD (AI Brief short). */
  summary: string;
};

/**
 * Fixed top strip: search & filters top-left; AI brief and chat top-right.
 * Outer shell uses pointer-events-none so the map stays draggable; panels opt back in.
 */
export function CommandCenterTopBar({ summary }: CommandCenterTopBarProps) {
  const chrome = useMapChromeBoundsOptional();

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
          className="flex w-full max-w-sm shrink-0 flex-col gap-3 sm:max-w-md xl:max-w-lg"
        >
          <div className="min-w-0">
            <AIBriefChip summary={summary} />
          </div>
          <div className="pointer-events-auto min-w-0">
            <MapAiChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
