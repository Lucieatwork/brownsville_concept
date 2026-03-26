"use client";

import { useMapZoomOptional } from "@/components/command-center/map-zoom-context";
import { montserrat } from "@/lib/fonts";
import type { InactiveSite } from "@/lib/inactive-sites";
import { INACTIVE_SITES } from "@/lib/inactive-sites";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Renders mock **inactive** construction sites from `INACTIVE_SITES` in `lib/inactive-sites.ts`.
 * Positions use the same 0–100% idea as `HeatLayer`’s SVG (spread across the basemap).
 * Pin-shaped markers (tip on the site); dashed outline + inner dot read as inactive.
 *
 * Three markers sit on the **hot** lobe centers in `heat-layer.tsx` (deepest red cores):
 * east cx/cy 59/24, west 12/37, south 42/60 — keep these in sync if you move the heat.
 * Those three use `isHeatCore` so they render as **white** pins on the pink / rose heat; the rest stay muted dashed.
 */

/** Map pin: tip at bottom center of viewBox so we anchor the needle on the lat/lng point. */
function InactivePinIcon({
  isHeatCore,
  /** When true (e.g. permit card open), keep the rose / red “hover” look until the user clicks away. */
  isActive,
}: {
  isHeatCore?: boolean;
  isActive?: boolean;
}) {
  /* Body fill uses currentColor on the <svg> so hover pink always resolves (same tokens as heat map). */
  const bodyClass = isHeatCore
    ? isActive
      ? "fill-current stroke-[var(--map-pin-hover-outline)] transition-[stroke] duration-300 ease-out [paint-order:stroke_fill]"
      : "fill-current stroke-[var(--map-pin-outline)] transition-[stroke] duration-300 ease-out [paint-order:stroke_fill] group-hover:stroke-[var(--map-pin-hover-outline)]"
    : "fill-[var(--map-pin-muted-fill)] stroke-[var(--map-pin-muted-stroke)] [stroke-dasharray:4_3]";

  /* Inner dot: shell-tinted on default; hover = light tint of `--heat-hot` + rose-tinted ring */
  const innerCircleClass = isHeatCore
    ? isActive
      ? "fill-[var(--map-pin-hover-inner-fill)] stroke-[var(--map-pin-hover-inner-outline)] transition-[fill,stroke] duration-300 ease-out [paint-order:stroke_fill]"
      : "fill-[var(--map-pin-heat-inner)] stroke-[var(--map-pin-outline-soft)] transition-[fill,stroke] duration-300 ease-out [paint-order:stroke_fill] group-hover:fill-[var(--map-pin-hover-inner-fill)] group-hover:stroke-[var(--map-pin-hover-inner-outline)]"
    : "fill-[var(--map-pin-muted-inner-fill)] stroke-[var(--map-pin-muted-inner-stroke)]";

  return (
    <svg
      className={`h-11 w-9 transition-[color,filter] duration-300 ease-out ${
        isHeatCore
          ? isActive
            ? "text-[var(--map-pin-hover-fill)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]"
            : "text-[var(--map-pin-heat-fill)] group-hover:text-[var(--map-pin-hover-fill)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]"
          : "drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
      }`}
      viewBox="0 0 32 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Teardrop: default = dashed muted; heat-core = white fill for contrast on deepest red */}
      <path
        d="M16 40.5C16 40.5 3.5 22.5 3.5 14.5C3.5 7.32 9.07 1.5 16 1.5C22.93 1.5 28.5 7.32 28.5 14.5C28.5 22.5 16 40.5 16 40.5Z"
        className={bodyClass}
        strokeWidth={isHeatCore ? 1.35 : 1.75}
        strokeLinejoin="round"
      />
      {/* Round cap in the bulb (classic map-pin look) */}
      <circle
        className={`${innerCircleClass} [paint-order:stroke_fill]`}
        cx={16}
        cy={12}
        r={4.25}
        strokeWidth={0.85}
      />
    </svg>
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
  const isInteractive = Boolean(site.isHeatCore);
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
    /* Tip of the pin sits on the coordinate (not the visual center of the icon). */
    transform: "translate(-50%, -100%)",
  } as const;

  if (showInsightCard) {
    return (
      <div
        ref={markerRootRef}
        className="pointer-events-auto absolute z-[6] flex justify-center"
        style={positionStyle}
      >
        <button
          type="button"
          aria-expanded={cardOpen}
          aria-label={
            cardOpen
              ? "Close permit details for this site"
              : "Open permit details for this site"
          }
          className="group flex cursor-pointer justify-center rounded-sm border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          onClick={toggleCard}
        >
          <InactivePinIcon isHeatCore={site.isHeatCore} isActive={cardOpen} />
        </button>
        <SiteHoverInsightCard isOpen={cardOpen} />
      </div>
    );
  }

  return (
    <div
      className={
        isInteractive
          ? "group pointer-events-auto absolute z-[6] flex cursor-pointer justify-center"
          : "pointer-events-none absolute flex justify-center"
      }
      style={positionStyle}
    >
      <InactivePinIcon isHeatCore={site.isHeatCore} />
    </div>
  );
}

export function InactiveSiteMarkers() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5]"
      role="group"
      aria-label="Inactive construction sites on the map; white pins on heat hotspots turn rose when hovered; the west hotspot pin opens permit details and stays rose until you click elsewhere or close the card"
    >
      {INACTIVE_SITES.map((site) => (
        <InactiveSiteMarker key={site.id} site={site} />
      ))}
    </div>
  );
}
