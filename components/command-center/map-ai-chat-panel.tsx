"use client";

import { montserrat } from "@/lib/fonts";
import { useCallback, useState, type FormEvent } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const INITIAL_ASSISTANT_REPLY =
  "Ask about inactive sites, risk alerts, or permit delays—this panel is a concept preview only (no live model).";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Send icon — simplified outline to match the Figma send button. */
function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 5.5 19 12 5 18.5V5.5Z" />
      <path d="M7.75 12H15.25" />
    </svg>
  );
}

type MapAiChatPanelProps = {
  /** Optional class on the root (e.g. `h-full` when paired with the AI brief). */
  className?: string;
  /** When set, header shows a control to hide the panel (parent usually swaps to a compact FAB). */
  onCollapse?: () => void;
};

/**
 * AI chat panel — demo messages only; wire your model when ready.
 * Used with the AI brief in `command-center-top-bar.tsx` (stacked, right-aligned).
 */
/** Expand-corner icon matches the Figma chrome more closely than a chevron. */
function ExpandCornerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14.5 5.5H18.5V9.5" />
      <path d="M18.5 5.5L13.5 10.5" />
      <path d="M9.5 18.5H5.5V14.5" />
      <path d="M5.5 18.5L10.5 13.5" />
    </svg>
  );
}

export function MapAiChatPanel({ className, onCollapse }: MapAiChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "seed",
      role: "assistant",
      text: INITIAL_ASSISTANT_REPLY,
    },
  ]);
  const [draft, setDraft] = useState("");

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const trimmed = draft.trim();
      if (!trimmed) return;

      const assistantText = `Got it—“${trimmed.slice(0, 80)}${trimmed.length > 80 ? "…" : ""}”. Connect this to your model when ready.`;

      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "user", text: trimmed },
        { id: makeId(), role: "assistant", text: assistantText },
      ]);
      setDraft("");
    },
    [draft],
  );

  return (
    <div
      className={`${montserrat.className} relative flex min-h-[13.25rem] flex-col overflow-hidden rounded-2xl border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.35)] ${className ?? ""}`}
      role="region"
      aria-label="AI assistant chat (demo)"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-[rgba(12,16,28,0.92)] backdrop-blur-[12px]"
        aria-hidden
      />
      <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-[14px]">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="inline-flex min-h-6 w-fit max-w-full shrink-0 items-center justify-center rounded-md bg-white px-[10px] py-1 text-center text-[11px] font-medium uppercase leading-none tracking-wide text-[#0a0a0a] [overflow-wrap:anywhere]"
                aria-hidden
              >
                AI chat
              </span>
              <span className="min-w-0 truncate text-[11px] tracking-[0.33px] text-white/60">
                Demo preview
              </span>
            </div>
            {onCollapse ? (
              <button
                type="button"
                onClick={onCollapse}
                className="flex h-6 w-6 shrink-0 items-center justify-center text-white transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                aria-label="Collapse AI chat"
              >
                <ExpandCornerIcon className="h-6 w-6 opacity-90" />
              </button>
            ) : null}
          </div>
          <div
            className="h-px shrink-0 bg-white/6"
            aria-hidden
          />
        </div>

        {/* Scrollable transcript — keeps the input bar pinned to the bottom of the panel. */}
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3 [scrollbar-width:thin]">
          {messages.map((m) => (
            <p
              key={m.id}
              className={`${
                m.role === "user"
                  ? "ml-4 rounded-lg bg-[color-mix(in_srgb,var(--surface-glass-panel)_65%,#0a0c14)] px-2.5 py-1.5 text-base leading-[1.55] text-white"
                  : "text-[14px] leading-[1.72] text-white"
              }`}
            >
              {m.role === "assistant" ? (
                <span className="font-semibold text-white">Assistant · </span>
              ) : (
                <span className="font-semibold text-white">You · </span>
              )}
              {m.text}
            </p>
          ))}
        </div>

        <div className="flex shrink-0 flex-col">
          <div
            className="h-px shrink-0 bg-white/6"
            aria-hidden
          />
          <form
            onSubmit={handleSubmit}
            className="shrink-0 px-4 py-2.5 outline-none"
          >
            <label className="sr-only" htmlFor="map-ai-chat-input">
              Message to AI
            </label>
            <div className="relative rounded-2xl bg-[#0b0f1a] shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-[box-shadow] duration-200 ease-out focus-within:shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_20px_5px_rgba(255,255,255,0.08)]">
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl bg-[#0b0f1a]"
                aria-hidden
              />
              <div className="relative z-[1] flex min-w-0 items-stretch">
                <input
                  id="map-ai-chat-input"
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask about city permit data…"
                  autoComplete="off"
                  className="h-10 min-w-0 flex-1 rounded-l-2xl border-0 bg-transparent py-0 pl-3 pr-2 text-sm text-white shadow-none outline-none ring-0 ring-offset-0 placeholder:text-white/45 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                />
                <button
                  type="submit"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-r-2xl border-0 bg-[#2563eb] text-white transition-colors duration-150 hover:bg-[#1f5ad7] focus:outline-none focus-visible:outline-none focus-visible:ring-0 active:scale-[0.98]"
                  aria-label="Send message"
                >
                  <SendIcon className="h-6 w-6 opacity-95 group-hover:opacity-100" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
