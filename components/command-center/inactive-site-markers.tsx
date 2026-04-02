"use client";

import { usePermitFiltersOptional } from "@/components/command-center/permit-filter-context";
import { useMapZoomOptional } from "@/components/command-center/map-zoom-context";
import { montserrat } from "@/lib/fonts";
import type { InactiveSite } from "@/lib/inactive-sites";
import { INACTIVE_SITES } from "@/lib/inactive-sites";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Renders mock **inactive** construction sites from `INACTIVE_SITES` in `lib/inactive-sites.ts`.
 * Positions use the same 0–100% idea as `HeatLayer`’s SVG (spread across the basemap).
 * Each site is a **health score** inside a color-coded circle centered on the coordinate.
 *
 * Three markers sit on the **hot** lobe centers in `heat-layer.tsx` (deepest red cores):
 * east cx/cy 59/24, west 12/37, south 42/60 — keep these in sync if you move the heat.
 * Markers use `pointer-events-auto` so every score circle can show hover (0.5px white ring + soft glow).
 */

/** Keeps mock data in the 1–100 band expected by the color scale. */
function clampHealthScore(raw: number): number {
  if (Number.isNaN(raw)) return 1;
  return Math.max(1, Math.min(100, Math.round(raw)));
}

/**
 * Map marker: score inside a circle. Crimson 1–33 (white text); yellow 34–66 (black text); mint 67–100.
 * 2px fill stroke: crimson/yellow 70/30 mix with white; mint 50/50. Hover + selected: 0.5px white ring + soft glow.
 */
function HealthScoreCircle({
  score,
  /** When true (e.g. permit card open), keep emphasis until the user dismisses the card. */
  isActive,
}: {
  score: number;
  isActive?: boolean;
}) {
  const n = clampHealthScore(score);

  let fillHex: string;
  let textClass: string;
  if (n <= 33) {
    fillHex = "#DC143C";
    textClass = "text-white";
  } else if (n < 67) {
    fillHex = "#E8C547";
    textClass = "text-black";
  } else {
    fillHex = "#00E8A0";
    textClass = "text-black";
  }

  /* Mint stroke is 50/50 with white; crimson and yellow stay 70/30. */
  const borderColor =
    n >= 67
      ? `color-mix(in srgb, ${fillHex} 50%, white 50%)`
      : `color-mix(in srgb, ${fillHex} 70%, white 30%)`;

  const whiteRingActive =
    "ring-[0.5px] ring-white ring-offset-2 ring-offset-transparent";
  const whiteRingHover =
    "hover:ring-[0.5px] hover:ring-white hover:ring-offset-2 hover:ring-offset-transparent";

  const ringClass = isActive ? whiteRingActive : whiteRingHover;

  /* Full literal classes so Tailwind can see the arbitrary shadows (avoid template-built class names). */
  const emphasisClass = isActive
    ? "scale-105 shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_28px_rgba(255,255,255,0.1),0_0_48px_rgba(255,255,255,0.05)]"
    : "hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_28px_rgba(255,255,255,0.1),0_0_48px_rgba(255,255,255,0.05)]";

  return (
    <span
      className={`box-border flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-solid text-[13px] font-bold tabular-nums shadow-[0_2px_10px_rgba(0,0,0,0.45)] transition-[transform,box-shadow] duration-300 ease-out ${textClass} ${ringClass} ${emphasisClass}`}
      style={{
        backgroundColor: fillHex,
        borderColor,
      }}
      aria-hidden
    >
      {n}
    </span>
  );
}

/** Same duration for opacity + transform so fade and slide stay in sync (inline styles avoid Tailwind transform merge issues). */
const PERMIT_CARD_TRANSITION_MS = 1000;

/** Glass popover beside a heat-core pin — content matches Figma “Permit Site Overlay Card” (node 301:121). */
function SiteHoverInsightCard({ isOpen }: { isOpen: boolean }) {
  const cardRef = useRef<HTMLElement>(null);
  const mapZoom = useMapZoomOptional();

  /* Slightly fuller bar than 127/365 alone so it reads as “still in warning” (yellow), not critical red. */
  const permitBarFill = Math.min(1, (127 / 365) * 1.18);

  /* Closed: sits lower (extra translateY) so it glides up with the fade. translate3d keeps transform on the GPU. */
  const cardMotionStyle = {
    opacity: isOpen ? 1 : 0,
    transform: isOpen
      ? "translate3d(0, calc(-50% + 5rem), 0)"
      : "translate3d(0, calc(-50% + 5rem + 5rem), 0)",
    transition: `opacity ${PERMIT_CARD_TRANSITION_MS}ms ease-in-out, transform ${PERMIT_CARD_TRANSITION_MS}ms ease-in-out`,
  } as const;

  const handleZoomToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!mapZoom) return;
    mapZoom.toggleZoomFromCard(cardRef.current);
  };

  return (
    <aside
      ref={cardRef}
      aria-hidden={!isOpen}
      style={cardMotionStyle}
      className={`${montserrat.className} absolute left-full top-1/2 z-[8] ml-3 w-[min(20rem,calc(100vw-2rem))] max-h-[min(90vh,calc(100vh-4rem))] overflow-y-auto overflow-x-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-label="Permit site details and recommended actions"
    >
      {/* Top-right: invisible control — same tap target as before; icon uses currentColor so text-transparent hides it. */}
      {mapZoom && isOpen ? (
        <button
          type="button"
          onClick={handleZoomToggle}
          aria-pressed={mapZoom.isZoomed}
          aria-label={
            mapZoom.isZoomed
              ? "Zoom map back out"
              : "Zoom map in on this permit card"
          }
          className="absolute right-3 top-3 z-[1] flex size-9 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-transparent hover:bg-transparent hover:text-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none"
            aria-hidden
          >
            <path
              d="M9 3H3v6M15 3h6v6M3 15v6h6M21 15v6h-6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}

      {/* Header: permit id + type tag — matches Figma node 301:121; extra right padding when zoom control is visible */}
      <div
        className={`flex flex-wrap items-center gap-2 ${mapZoom ? "pr-10" : ""}`}
      >
        <p className="text-[10px] font-semibold leading-none text-white">
          PERMIT #BTX-2024-04471
        </p>
        <span className="rounded-[3px] bg-white px-1.5 py-[3px] text-[9px] font-semibold leading-none text-black">
          CONSTRUCTION
        </span>
      </div>

      <h2 className="mt-3 text-base font-bold leading-[22px] text-white">
        Riverside Commons – Phase 2
      </h2>
      <div className="mt-1 text-xs leading-[18px] text-white">
        <p>1800 E Elizabeth St, Suite 200</p>
        <p>Brownsville, TX 78520</p>
      </div>

      <div className="my-4 h-px w-full bg-white/25" aria-hidden />

      {/* Live site status */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-semibold leading-none text-white">
          LIVE SITE STATUS
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className="box-border size-2.5 shrink-0 rounded-full border-2 border-white bg-[#eed000]"
            aria-hidden
          />
          <p className="text-[13px] font-semibold leading-5 text-white">
            ⚠ No activity — 6 days
          </p>
        </div>
      </div>

      {/* AI insight — yellow callout so it reads as distinct from the glass surface */}
      <div className="mt-4 flex flex-col gap-1 rounded-md bg-[#eed000] px-3 py-2.5">
        <p className="text-[9px] font-bold leading-none text-black">AI INSIGHT</p>
        <p className="text-xs font-medium leading-[18px] text-black">
          &ldquo;At risk. Recommend inspection before permit expiry.&rdquo;
        </p>
      </div>

      <div className="my-4 h-px w-full bg-white/25" aria-hidden />

      {/* Stats grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-[10px] font-medium text-white">
              LAST INSPECTION
            </p>
            <p className="text-xs font-semibold leading-[18px] text-white">
              Mar 3, 2025
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 text-right">
            <p className="text-[10px] font-medium text-white">
              PERMIT EXPIRES
            </p>
            <p className="text-xs font-semibold leading-[18px] text-white">
              Jun 15, 2025
            </p>
          </div>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-[10px] font-medium text-white">
              CONTRACTOR
            </p>
            <p className="text-xs font-semibold leading-[18px] text-white">
              Meridian Build Co.
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 text-right">
            <p className="text-[10px] font-medium text-white">
              OPEN VIOLATIONS
            </p>
            <p className="text-xs font-semibold leading-[18px] text-white">
              2 flagged
            </p>
          </div>
        </div>
      </div>

      {/* Days remaining */}
      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <p className="font-medium text-white">Days remaining on permit</p>
          <p className="font-semibold text-white">127 / 365</p>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-sm bg-[#38342a]">
          <div
            className="h-full rounded-sm bg-[#eed000]"
            style={{ width: `${permitBarFill * 100}%` }}
          />
        </div>
      </div>

      <div className="my-4 h-px w-full bg-white/25" aria-hidden />

      <button
        type="button"
        className="flex h-10 w-full items-center justify-center rounded-lg bg-white text-[13px] font-semibold text-black transition-all duration-200 ease-out hover:-translate-y-px hover:bg-neutral-200 hover:shadow-[0_4px_14px_rgba(0,0,0,0.22)] hover:ring-2 hover:ring-black/15 active:translate-y-0 active:bg-neutral-300 active:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/50"
      >
        Schedule Inspection
      </button>

      <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] font-medium text-white">
        <button
          type="button"
          className="min-w-0 truncate rounded-md px-2 py-1.5 text-left text-white underline-offset-2 transition-colors duration-150 hover:bg-white/20 hover:underline hover:decoration-2"
        >
          View Activity History
        </button>
        <button
          type="button"
          className="min-w-0 shrink-0 rounded-md px-2 py-1.5 text-right text-white underline-offset-2 transition-colors duration-150 hover:bg-white/20 hover:underline hover:decoration-2"
        >
          Open Permit Docs ↗
        </button>
      </div>
    </aside>
  );
}

function InactiveSiteMarker({ site }: { site: InactiveSite }) {
  const showInsightCard = Boolean(site.showHoverInsightCard);
  const [cardOpen, setCardOpen] = useState(false);
  const mapZoom = useMapZoomOptional();
  const markerRootRef = useRef<HTMLDivElement>(null);

  const toggleCard = useCallback(() => {
    if (!showInsightCard) return;
    setCardOpen((open) => !open);
  }, [showInsightCard]);

  useEffect(() => {
    if (!showInsightCard || !cardOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCardOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showInsightCard, cardOpen]);

  /* Click / tap outside the pin + card closes the card and returns the pin to the default (white) look. */
  useEffect(() => {
    if (!showInsightCard || !cardOpen) return;
    const onPointerDownCapture = (e: PointerEvent) => {
      if (markerRootRef.current?.contains(e.target as Node)) return;
      setCardOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDownCapture, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDownCapture, true);
  }, [showInsightCard, cardOpen]);

  const resetMapZoom = mapZoom?.resetZoom;

  /* If the card closes (pin, Escape, etc.), return the map to normal zoom so it does not stay magnified. */
  useEffect(() => {
    if (!showInsightCard || cardOpen) return;
    resetMapZoom?.();
  }, [showInsightCard, cardOpen, resetMapZoom]);

  const positionStyle = {
    left: `${site.xPercent}%`,
    top: `${site.yPercent}%`,
    /* Circle is centered on the coordinate (unlike the old pin tip). */
    transform: "translate(-50%, -50%)",
  } as const;

  if (showInsightCard) {
    // Open permit card: raise this marker so the popover paints above every other pin (they share z-[6]).
    return (
      <div
        ref={markerRootRef}
        className={`pointer-events-auto absolute flex justify-center ${cardOpen ? "z-[60]" : "z-[6]"}`}
        style={positionStyle}
      >
        <button
          type="button"
          aria-expanded={cardOpen}
          aria-label={
            cardOpen
              ? `Close permit details for this site (health score ${clampHealthScore(site.healthScore)})`
              : `Open permit details for this site (health score ${clampHealthScore(site.healthScore)})`
          }
          className="flex cursor-pointer justify-center rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-[0.5px] focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          onClick={toggleCard}
        >
          <HealthScoreCircle score={site.healthScore} isActive={cardOpen} />
        </button>
        <SiteHoverInsightCard isOpen={cardOpen} />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-auto absolute z-[6] flex cursor-default justify-center"
      style={positionStyle}
    >
      <HealthScoreCircle score={site.healthScore} />
    </div>
  );
}

export function InactiveSiteMarkers() {
  const permitFilters = usePermitFiltersOptional();
  const visibleSites = permitFilters
    ? INACTIVE_SITES.filter(permitFilters.siteMatchesFilters)
    : INACTIVE_SITES;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5]"
      role="group"
      aria-label="Inactive construction sites on the map; each marker shows a health score in a color-coded circle; the west hotspot opens permit details when activated"
    >
      {visibleSites.map((site) => (
        <InactiveSiteMarker key={site.id} site={site} />
      ))}
    </div>
  );
}
