import { AIBriefChip } from "@/components/command-center/ai-brief-chip";
import { MapAiChatPanel } from "@/components/command-center/map-ai-chat-panel";

type CommandCenterTopBarProps = {
  /** Short line from PRD (AI Brief short). */
  summary: string;
};

/**
 * Fixed top strip, right-aligned: AI brief above AI chat (stacked column).
 * Outer shell uses pointer-events-none so the map stays draggable; chat opts back in for typing.
 */
export function CommandCenterTopBar({ summary }: CommandCenterTopBarProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-20 px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="flex w-full justify-end">
        <div className="flex w-full max-w-md flex-col gap-3 sm:max-w-lg xl:max-w-xl">
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
