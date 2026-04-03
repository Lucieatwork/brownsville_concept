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

/** Send icon — paper plane stroke so we don’t add a dependency. */
function SendIcon({ className }: { className?: string }) {
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
      <path d="m22 2-7 20-4-9-9-4 18-7Z" />
      <path d="M22 2 11 13" />
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
/** Chevron up — matches `ai-brief-chip` collapse control. */
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
      className={`${montserrat.className} relative flex h-[min(28vh,12rem)] min-h-[9.5rem] flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] shadow-[0_8px_32px_rgba(0,0,0,0.35)] ${className ?? ""}`}
      role="region"
      aria-label="AI assistant chat (demo)"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-xl bg-[var(--surface-glass-panel)] backdrop-blur-xl backdrop-saturate-150"
        aria-hidden
      />
      <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 flex-col">
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="inline-flex min-h-6 w-fit max-w-full shrink-0 items-center justify-center rounded-md bg-white px-2.5 py-1 text-center text-[11px] font-medium uppercase leading-none tracking-wide text-neutral-950 [overflow-wrap:anywhere] sm:px-3 sm:py-1.5"
                aria-hidden
              >
                AI chat
              </span>
              <span className="min-w-0 truncate text-sm text-white">
                Demo preview
              </span>
            </div>
            {onCollapse ? (
              <button
                type="button"
                onClick={onCollapse}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-[opacity,background-color] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                aria-label="Collapse AI chat"
              >
                <ChevronUpIcon className="opacity-90" />
              </button>
            ) : null}
          </div>
          <div
            className="h-px shrink-0 bg-[var(--divider-subtle)]"
            aria-hidden
          />
        </div>

        {/* Scrollable transcript — keeps the input bar pinned to the bottom of the panel. */}
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2 [scrollbar-width:thin]">
          {messages.map((m) => (
            <p
              key={m.id}
              className={`leading-snug ${
                m.role === "user"
                  ? "ml-4 text-[15px] sm:text-base rounded-lg bg-[color-mix(in_srgb,var(--surface-glass-panel)_65%,#0a0c14)] px-2.5 py-1.5 text-white"
                  : "text-[13px] sm:text-sm text-white"
              }`}
            >
              {m.role === "assistant" ? (
                <span className="text-white">Assistant · </span>
              ) : (
                <span className="text-white">You · </span>
              )}
              {m.text}
            </p>
          ))}
        </div>

        <div className="flex shrink-0 flex-col">
          <div
            className="h-px shrink-0 bg-[var(--divider-subtle)]"
            aria-hidden
          />
          <form
            onSubmit={handleSubmit}
            className="shrink-0 px-3 py-2 outline-none"
          >
            <label className="sr-only" htmlFor="map-ai-chat-input">
              Message to AI
            </label>
            {/* Match permit search bar: no stroke, focus-within glow, glass plate, hairline + blue send */}
            <div className="relative rounded-2xl border-0 shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-[box-shadow] duration-200 ease-out focus-within:shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_20px_5px_rgba(255,255,255,0.14),0_0_40px_12px_rgba(255,255,255,0.06)]">
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl bg-[var(--surface-glass-panel)] backdrop-blur-xl backdrop-saturate-150"
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
                  className="h-10 min-w-0 flex-1 rounded-l-2xl border-0 bg-transparent py-0 pl-3 pr-2 text-sm text-white shadow-none outline-none ring-0 ring-offset-0 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                />
                <span
                  className="w-px shrink-0 self-stretch bg-white/25"
                  aria-hidden
                />
                <button
                  type="submit"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-r-2xl border-0 bg-blue-600 text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus-visible:outline-none focus-visible:ring-0 active:scale-[0.98]"
                  aria-label="Send message"
                >
                  <SendIcon className="opacity-95 group-hover:opacity-100" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
