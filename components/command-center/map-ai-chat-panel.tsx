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
};

/**
 * AI chat panel — demo messages only; wire your model when ready.
 * Used with the AI brief in `command-center-top-bar.tsx` (stacked, right-aligned).
 */
export function MapAiChatPanel({ className }: MapAiChatPanelProps) {
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
      className={`${montserrat.className} flex h-[min(28vh,12rem)] min-h-[9.5rem] flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-glass)_92%,transparent)] shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-md ${className ?? ""}`}
      role="region"
      aria-label="AI assistant chat (demo)"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="inline-flex h-6 shrink-0 items-center justify-center rounded-full bg-blue-600 px-2.5 text-center text-[11px] font-medium uppercase leading-none tracking-wide text-white"
            aria-hidden
          >
            AI chat
          </span>
          <span className="truncate text-[11px] text-white">
            Demo preview
          </span>
        </div>
      </div>

      {/* Scrollable transcript — keeps the input bar pinned to the bottom of the panel. */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2 [scrollbar-width:thin]">
        {messages.map((m) => (
          <p
            key={m.id}
            className={`text-[13px] leading-snug ${
              m.role === "user"
                ? "ml-4 rounded-lg bg-[color-mix(in_srgb,var(--surface-glass)_100%,#0a0c14)] px-2.5 py-1.5 text-white"
                : "text-white"
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

      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 gap-2 border-t border-[var(--border-subtle)] px-3 py-2"
      >
        <label className="sr-only" htmlFor="map-ai-chat-input">
          Message to AI
        </label>
        <input
          id="map-ai-chat-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about city permit data…"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg border border-[var(--border-subtle)] bg-[color-mix(in_srgb,#0a0c14_55%,transparent)] px-3 py-2 text-sm text-white outline-none placeholder:text-white focus-visible:border-white/40 focus-visible:ring-1 focus-visible:ring-white/30"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-glass)_80%,#0a0c14)] px-3 py-2 text-white transition hover:border-white/25 hover:bg-[color-mix(in_srgb,var(--surface-glass)_65%,#0a0c14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:scale-[0.98]"
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
