"use client";

import { usePermitFiltersOptional } from "@/components/command-center/permit-filter-context";
import {
  MAP_PAN_TRANSITION_MS,
  useMapZoomOptional,
} from "@/components/command-center/map-zoom-context";
import { montserrat } from "@/lib/fonts";
import type { InactiveSite } from "@/lib/inactive-sites";
import { INACTIVE_SITES } from "@/lib/inactive-sites";
import {
  getPermitDetailRecord,
  type PermitDetailRecord,
} from "@/lib/permit-intelligence-dataset";
import type { MouseEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * While a permit card is open, keep nudging the map so its bounding box stays
 * out from under fixed search / AI / KPI chrome. Resize and zoom transitions
 * both change layout, so we observe and re-run after the zoom animation.
 */
function useMapPanForOpenPermitCard(
  shellRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  /** e.g. drill panel open/closed — anything that changes card size */
  layoutRevision: unknown,
) {
  const mapZoom = useMapZoomOptional();

  useEffect(() => {
    if (!isOpen || !mapZoom) return;
    const el = shellRef.current;
    if (!el) return;

    const run = () => {
      mapZoom.updatePanForPermitCard(el);
    };

    run();
    let innerRaf = 0;
    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(run);
    });

    const ro = new ResizeObserver(run);
    ro.observe(el);
    window.addEventListener("resize", run);

    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
      ro.disconnect();
      window.removeEventListener("resize", run);
    };
  }, [isOpen, mapZoom, layoutRevision]);

  const isZoomed = mapZoom?.isZoomed ?? false;
  useEffect(() => {
    if (!isOpen || !mapZoom) return;
    const el = shellRef.current;
    if (!el) return;
    /* Pan duration is MAP_PAN_TRANSITION_MS; zoom is 500ms — brief buffer so layout is stable. */
    const t = window.setTimeout(() => {
      mapZoom.updatePanForPermitCard(el);
    }, MAP_PAN_TRANSITION_MS + 50);
    return () => clearTimeout(t);
  }, [isOpen, isZoomed, mapZoom]);
}

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
/** Keep equal to `MAP_PAN_TRANSITION_MS` in `map-zoom-context.tsx` so card + map pan stay in sync. */
const PERMIT_CARD_TRANSITION_MS = MAP_PAN_TRANSITION_MS;

/** Sub-panel drill-down keys — detail opens to the right (or below on narrow screens). */
type PermitCardDrillSection =
  | "health"
  | "journey"
  | "reviews"
  | "inspections"
  | "documents";

/** Matches map marker scale: crimson ≤33, yellow &lt;67, mint ≥67 */
function factorBarFillColor(score: number): string {
  const n = clampHealthScore(score);
  if (n <= 33) return "#DC143C";
  if (n < 67) return "#E8C547";
  return "#00E8A0";
}

function liveStatusDotClass(
  tone: PermitDetailRecord["liveSiteStatus"]["tone"],
): string {
  if (tone === "critical") return "bg-[#DC143C]";
  if (tone === "ok") return "bg-[#00E8A0]";
  return "bg-[#eed000]";
}

/**
 * Weighted factor rows — same semantics as the future full health score card (see `healthscorecard.png` in public when added).
 * `subpanel`: larger type for the drill-down card; omits duplicate section title (shown in subcard header).
 */
function PermitHealthBreakdown({
  detail,
  subpanel = false,
}: {
  detail: PermitDetailRecord;
  subpanel?: boolean;
}) {
  const { health_score: hs } = detail;
  const composite = clampHealthScore(hs.composite);
  const bandClass = subpanel
    ? "mt-0 text-xs font-medium text-white"
    : "mt-1 text-[11px] font-medium text-white";
  const rowText = subpanel ? "text-[11px]" : "text-[10px]";
  const listText = subpanel
    ? "text-[11px] leading-relaxed"
    : "text-[10px] leading-relaxed";
  const sectionLabel = "text-[10px] font-bold uppercase text-white";

  return (
    <div className="rounded-lg border border-white/15 bg-black/20 px-3 py-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          {!subpanel ? (
            <p className="text-[10px] font-bold uppercase tracking-wide text-white">
              Permit health
            </p>
          ) : null}
          <p className={bandClass}>{hs.bandLabel}</p>
        </div>
        <div
          className={`flex shrink-0 flex-col items-center justify-center rounded-full border-2 border-solid text-center ${subpanel ? "size-[3.5rem]" : "size-14"}`}
          style={{
            borderColor: factorBarFillColor(composite),
            backgroundColor: `color-mix(in srgb, ${factorBarFillColor(composite)} 35%, transparent)`,
          }}
          aria-label={`Permit health score ${composite} out of 100, ${hs.bandLabel}`}
        >
          <span
            className={`font-bold leading-none text-white tabular-nums ${subpanel ? "text-lg" : "text-base"}`}
          >
            {composite}
          </span>
          <span className="text-[9px] font-semibold text-white/90">/ 100</span>
        </div>
      </div>

      <ul className="mt-3 flex flex-col gap-2" aria-label="Health score factors">
        {hs.factors.map((f) => (
          <li key={f.id} className="flex flex-col gap-1">
            <div
              className={`flex items-baseline justify-between gap-2 font-medium text-white ${rowText}`}
            >
              <span className="min-w-0">{f.label}</span>
              <span className="shrink-0 tabular-nums text-white/80">
                {Math.round(f.weight * 100)}% wt · {clampHealthScore(f.score)}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-sm bg-[#38342a]">
              <div
                className="h-full rounded-sm transition-[width] duration-300"
                style={{
                  width: `${clampHealthScore(f.score)}%`,
                  backgroundColor: factorBarFillColor(f.score),
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      {hs.blockingReasons.length > 0 ? (
        <div className="mt-4 border-t border-white/10 pt-3">
          <p className={sectionLabel}>Blocking reasons</p>
          <ul className="mt-2 list-inside list-disc text-white marker:text-white/80">
            {hs.blockingReasons.map((reason) => (
              <li key={reason} className={listText}>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hs.recommendedActions.length > 0 ? (
        <div className="mt-3">
          <p className={sectionLabel}>Recommended actions</p>
          <ol className="mt-2 list-inside list-decimal text-white marker:text-white/80">
            {hs.recommendedActions.map((action) => (
              <li key={action} className={listText}>
                {action}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

/** Permit journey timeline — `hideTitle` when the subcard header already names the section. */
function PermitJourneyCompact({
  detail,
  hideTitle = false,
  large = false,
}: {
  detail: PermitDetailRecord;
  hideTitle?: boolean;
  large?: boolean;
}) {
  const stepText = large
    ? "text-xs leading-relaxed"
    : "text-[11px] leading-relaxed";
  const detailText = large
    ? "text-[11px] text-white/80"
    : "text-[10px] text-white/80";

  return (
    <div className="flex flex-col gap-2">
      {!hideTitle ? (
        <p className="text-[11px] font-semibold text-white">Permit journey</p>
      ) : null}
      <ol className="flex flex-col gap-2 border-l border-white/25 pl-3">
        {detail.journey.map((step) => {
          const mark =
            step.status === "complete"
              ? "text-white/55 line-through decoration-white/35"
              : step.status === "current"
                ? "font-semibold text-white"
                : "text-white/45";
          return (
            <li key={step.id} className={`${stepText} ${mark}`}>
              <span className="sr-only">
                {step.status === "complete"
                  ? "Completed: "
                  : step.status === "current"
                    ? "Current: "
                    : "Upcoming: "}
              </span>
              {step.label}
              {step.detail ? (
                <span className={`mt-0.5 block font-normal ${detailText}`}>
                  {step.detail}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function PermitReviewsList({
  detail,
  large = false,
}: {
  detail: PermitDetailRecord;
  large?: boolean;
}) {
  const boxText = large
    ? "text-[11px] leading-relaxed"
    : "text-[10px] leading-relaxed";
  return (
    <ul className="flex flex-col gap-2">
      {detail.reviews.map((r, index) => (
        <li
          key={`${r.department}-${r.status}-${index}`}
          className={`rounded-lg bg-black/20 px-3 py-2 text-white ${boxText}`}
        >
          <span className="font-semibold text-white">{r.department}</span>
          {" · "}
          {r.status}
          <span className="text-white/75"> · {r.cycles} cycles</span>
          {r.detail ? (
            <span className="mt-1 block text-white/80">{r.detail}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function PermitInspectionsList({
  detail,
  large = false,
}: {
  detail: PermitDetailRecord;
  large?: boolean;
}) {
  const rowText = large
    ? "text-xs leading-relaxed"
    : "text-[11px] leading-relaxed";
  return (
    <ul className="flex flex-col gap-2">
      {detail.inspections.map((row) => (
        <li key={row.type} className={`text-white ${rowText}`}>
          <span className="font-semibold">{row.type}</span>
          {": "}
          {row.status}
          {row.detail && row.detail !== "—" ? (
            <span className="text-white/80"> — {row.detail}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function PermitDocumentsList({
  detail,
  large = false,
}: {
  detail: PermitDetailRecord;
  large?: boolean;
}) {
  const rowText = large
    ? "text-xs leading-relaxed"
    : "text-[11px] leading-relaxed";
  return (
    <ul className="flex flex-col gap-2.5">
      {detail.documents.map((doc) => (
        <li key={doc.name} className={`text-white ${rowText}`}>
          <span className="font-semibold">{doc.name}</span>
          <span className="text-white/80"> — {doc.status}</span>
          {doc.detail ? (
            <span className="mt-0.5 block text-white/75">{doc.detail}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Chevron for expandable row — points right when closed, down when open (rotate on HTML wrapper so motion is reliable). */
function RowChevron({ expanded }: { expanded: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center text-white/90 transition-transform duration-200 ease-out ${
        expanded ? "rotate-90" : "rotate-0"
      }`}
      aria-hidden
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Shared look for detail drill rows: 1px border, subtle white rim on hover / when expanded (keeps copy legible). */
const PERMIT_DETAIL_DRILL_BTN =
  "flex w-full items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-2.5 py-2.5 text-left transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-white hover:bg-black/30 hover:shadow-[0_0_12px_rgba(255,255,255,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 active:border-white active:bg-black/30 active:shadow-[0_0_12px_rgba(255,255,255,0.14)]";
const PERMIT_DETAIL_DRILL_BTN_EXPANDED =
  "border-white bg-black/30 shadow-[0_0_12px_rgba(255,255,255,0.14)]";

const DRILL_SECTION_LABELS: Record<PermitCardDrillSection, string> = {
  health: "Permit health",
  journey: "Permit journey",
  reviews: "Department reviews",
  inspections: "Inspections",
  documents: "Documents",
};

function journeyCurrentLabel(detail: PermitDetailRecord): string {
  const step = detail.journey.find((s) => s.status === "current");
  return step?.label ?? detail.journey[0]?.label ?? "—";
}

function permitHealthPreviewLine(detail: PermitDetailRecord): string {
  const hs = detail.health_score;
  const n = hs.blockingReasons.length;
  return `${hs.bandLabel} · ${clampHealthScore(hs.composite)}/100 · ${n} blocking ${n === 1 ? "reason" : "reasons"}`;
}

function documentsAttentionSummary(detail: PermitDetailRecord): string {
  const open = detail.documents.filter((d) => d.status !== "Approved").length;
  if (open === 0) return "All listed documents clear";
  return `${open} need attention`;
}

/** Glass shell: main summary card + optional drill-down panel (right on wide view, below on narrow). */
function SiteHoverInsightCard({
  isOpen,
  detail,
  drillSection,
  onDrillSectionChange,
}: {
  isOpen: boolean;
  detail: PermitDetailRecord;
  drillSection: PermitCardDrillSection | null;
  onDrillSectionChange: (section: PermitCardDrillSection | null) => void;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const mapZoom = useMapZoomOptional();
  const drillCloseRef = useRef<HTMLButtonElement>(null);

  const daysRemaining = Math.max(
    0,
    detail.permitDaysTotal - detail.permitDaysElapsed,
  );
  const permitBarFill = Math.min(
    1,
    detail.permitDaysElapsed / detail.permitDaysTotal,
  );

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
    mapZoom.toggleZoomFromCard(shellRef.current);
  };

  const toggleDrill = (section: PermitCardDrillSection) => {
    onDrillSectionChange(drillSection === section ? null : section);
  };

  useEffect(() => {
    if (!isOpen || !drillSection) return;
    drillCloseRef.current?.focus({ preventScroll: true });
  }, [isOpen, drillSection]);

  useMapPanForOpenPermitCard(shellRef, isOpen && Boolean(mapZoom), drillSection);

  const drillPanelId = `permit-drill-${detail.id}`;

  function renderDrillBody(section: PermitCardDrillSection) {
    switch (section) {
      case "health":
        return <PermitHealthBreakdown detail={detail} subpanel />;
      case "journey":
        return <PermitJourneyCompact detail={detail} hideTitle large />;
      case "reviews":
        return <PermitReviewsList detail={detail} large />;
      case "inspections":
        return <PermitInspectionsList detail={detail} large />;
      case "documents":
        return <PermitDocumentsList detail={detail} large />;
      default:
        return null;
    }
  }

  return (
    <div
      ref={shellRef}
      aria-hidden={!isOpen}
      style={cardMotionStyle}
      className={`${montserrat.className} absolute left-full top-1/2 z-[8] ml-3 flex max-w-[min(100vw-1rem,calc(100vw-1rem))] flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-start ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <aside
        className={`relative flex w-full max-h-[min(52vh,calc(0.62*_(100vh_-_3rem)))] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md sm:w-[min(28rem,calc(100vw-1.25rem))] ${
          isOpen ? "" : ""
        }`}
        aria-label="Permit summary"
      >
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
            className="absolute right-3 top-3 z-[3] flex size-9 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-transparent hover:bg-transparent hover:text-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
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

        {/* Sticky top: permit id, project, address — stays visible while body scrolls */}
        <header className="sticky top-0 z-[2] shrink-0 border-b border-white/15 bg-[var(--surface-glass)]/95 px-4 pb-3 pt-4 backdrop-blur-md">
          <div
            className={`flex flex-wrap items-center gap-2 ${mapZoom ? "pr-10" : ""}`}
          >
            <p className="text-[10px] font-semibold leading-none tracking-wide text-white">
              PERMIT #{detail.id}
            </p>
            <span className="max-w-[11rem] rounded-[3px] bg-white px-1.5 py-[3px] text-[9px] font-semibold leading-tight text-black">
              {detail.typeTag.toUpperCase()}
            </span>
          </div>

          <h2 className="mt-3 text-base font-bold leading-[22px] text-white">
            {detail.projectName}
          </h2>
          <div className="mt-1 text-xs leading-[18px] text-white">
            <p>{detail.addressLine1}</p>
            <p>{detail.addressLine2}</p>
          </div>
        </header>

        {/* Scrolls between header and sticky actions */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold leading-none text-white">
              Live site status
            </p>
            <div className="flex items-start gap-1.5">
              <span
                className={`mt-1 box-border size-2.5 shrink-0 rounded-full border-2 border-white ${liveStatusDotClass(detail.liveSiteStatus.tone)}`}
                aria-hidden
              />
              <p className="text-[13px] font-semibold leading-5 text-white">
                {detail.liveSiteStatus.headline}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1 rounded-md bg-[#eed000] px-3 py-2.5">
            <p className="text-[9px] font-bold leading-none text-black">
              AI insight
            </p>
            <p className="text-xs font-medium leading-[18px] text-black">
              {detail.aiInsight}
            </p>
          </div>

          <div className="my-4 h-px w-full bg-white/25" aria-hidden />

          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-[10px] font-medium text-white">
                  Last inspection
                </p>
                <p className="text-xs font-semibold leading-[18px] text-white">
                  {detail.lastInspectionDisplay}
                </p>
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 text-right">
                <p className="text-[10px] font-medium text-white">
                  Permit expires
                </p>
                <p className="text-xs font-semibold leading-[18px] text-white">
                  {detail.permitExpiresDisplay}
                </p>
              </div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-[10px] font-medium text-white">Contractor</p>
                <p className="text-xs font-semibold leading-[18px] text-white">
                  {detail.contractor}
                </p>
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 text-right">
                <p className="text-[10px] font-medium text-white">
                  Open violations
                </p>
                <p className="text-xs font-semibold leading-[18px] text-white">
                  {detail.openViolationsDisplay}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <p className="font-medium text-white">Days remaining on permit</p>
              <p className="font-semibold tabular-nums text-white">
                {daysRemaining} / {detail.permitDaysTotal}
              </p>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-sm bg-[#38342a]">
              <div
                className="h-full rounded-sm bg-[#eed000]"
                style={{ width: `${permitBarFill * 100}%` }}
              />
            </div>
          </div>

          <div className="my-4 h-px w-full bg-white/25" aria-hidden />

          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold text-white">Details</p>

            <button
              type="button"
              onClick={() => toggleDrill("health")}
              aria-expanded={drillSection === "health"}
              aria-controls={drillPanelId}
              className={`${PERMIT_DETAIL_DRILL_BTN} ${drillSection === "health" ? PERMIT_DETAIL_DRILL_BTN_EXPANDED : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">
                  {DRILL_SECTION_LABELS.health}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-white/75">
                  {permitHealthPreviewLine(detail)}
                </p>
              </div>
              <RowChevron expanded={drillSection === "health"} />
            </button>

            <button
              type="button"
              onClick={() => toggleDrill("journey")}
              aria-expanded={drillSection === "journey"}
              aria-controls={drillPanelId}
              className={`${PERMIT_DETAIL_DRILL_BTN} ${drillSection === "journey" ? PERMIT_DETAIL_DRILL_BTN_EXPANDED : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">
                  {DRILL_SECTION_LABELS.journey}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-white/75">
                  Current: {journeyCurrentLabel(detail)}
                </p>
              </div>
              <RowChevron expanded={drillSection === "journey"} />
            </button>

            <button
              type="button"
              onClick={() => toggleDrill("reviews")}
              aria-expanded={drillSection === "reviews"}
              aria-controls={drillPanelId}
              className={`${PERMIT_DETAIL_DRILL_BTN} ${drillSection === "reviews" ? PERMIT_DETAIL_DRILL_BTN_EXPANDED : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">
                  {DRILL_SECTION_LABELS.reviews}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-white/75">
                  {detail.reviews.length} departments · tap for status by desk
                </p>
              </div>
              <RowChevron expanded={drillSection === "reviews"} />
            </button>

            <button
              type="button"
              onClick={() => toggleDrill("inspections")}
              aria-expanded={drillSection === "inspections"}
              aria-controls={drillPanelId}
              className={`${PERMIT_DETAIL_DRILL_BTN} ${drillSection === "inspections" ? PERMIT_DETAIL_DRILL_BTN_EXPANDED : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">
                  {DRILL_SECTION_LABELS.inspections}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-white/75">
                  {detail.inspections.length} types · mostly blocked until
                  issuance
                </p>
              </div>
              <RowChevron expanded={drillSection === "inspections"} />
            </button>

            <button
              type="button"
              onClick={() => toggleDrill("documents")}
              aria-expanded={drillSection === "documents"}
              aria-controls={drillPanelId}
              className={`${PERMIT_DETAIL_DRILL_BTN} ${drillSection === "documents" ? PERMIT_DETAIL_DRILL_BTN_EXPANDED : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">
                  {DRILL_SECTION_LABELS.documents}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-white/75">
                  {detail.documents.length} on file ·{" "}
                  {documentsAttentionSummary(detail)}
                </p>
              </div>
              <RowChevron expanded={drillSection === "documents"} />
            </button>
          </div>
        </div>

        {/* Sticky bottom: primary CTA + secondary links stay visible */}
        <footer className="sticky bottom-0 z-[2] shrink-0 border-t border-white/15 bg-[var(--surface-glass)]/95 px-4 pb-4 pt-3 backdrop-blur-md">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-center rounded-lg bg-white text-[13px] font-semibold text-black transition-all duration-200 ease-out hover:-translate-y-px hover:bg-neutral-200 hover:shadow-[0_4px_14px_rgba(0,0,0,0.22)] hover:ring-2 hover:ring-black/15 active:translate-y-0 active:bg-neutral-300 active:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/50"
          >
            {detail.primaryCtaLabel}
          </button>

          <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] font-medium text-white">
            <button
              type="button"
              className="min-w-0 truncate rounded-md px-2 py-1.5 text-left underline-offset-2 transition-colors duration-150 hover:bg-white/20 hover:underline hover:decoration-2"
            >
              View activity history
            </button>
            <button
              type="button"
              className="min-w-0 shrink-0 rounded-md px-2 py-1.5 text-right underline-offset-2 transition-colors duration-150 hover:bg-white/20 hover:underline hover:decoration-2"
            >
              Open permit docs ↗
            </button>
          </div>
        </footer>
      </aside>

      {drillSection ? (
        <aside
          key={drillSection}
          id={drillPanelId}
          role="region"
          aria-label={DRILL_SECTION_LABELS[drillSection]}
          className="w-full max-h-[min(52vh,calc(0.62*_(100vh_-_3rem)))] min-w-0 overflow-y-auto overflow-x-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md sm:w-[min(28rem,calc(100vw-1.25rem))]"
        >
          <div className="flex items-start justify-between gap-2 border-b border-white/15 pb-2.5">
            <h3 className="text-sm font-bold text-white">
              {DRILL_SECTION_LABELS[drillSection]}
            </h3>
            <button
              ref={drillCloseRef}
              type="button"
              onClick={() => onDrillSectionChange(null)}
              className="shrink-0 rounded-lg border border-white/30 px-2 py-1 text-[10px] font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
            >
              Close
            </button>
          </div>
          <div className="mt-3 text-white">
            {renderDrillBody(drillSection)}
          </div>
        </aside>
      ) : null}
    </div>
  );
}

/** Visible when a site requests the card but the dataset record is missing — avoids silent failure while developing. */
function SiteHoverInsightCardMissingData({
  isOpen,
  siteId,
  permitDetailId,
  measureRef,
}: {
  isOpen: boolean;
  siteId: string;
  permitDetailId: string | undefined;
  measureRef: RefObject<HTMLDivElement | null>;
}) {
  const cardMotionStyle = {
    opacity: isOpen ? 1 : 0,
    transform: isOpen
      ? "translate3d(0, calc(-50% + 5rem), 0)"
      : "translate3d(0, calc(-50% + 5rem + 5rem), 0)",
    transition: `opacity ${PERMIT_CARD_TRANSITION_MS}ms ease-in-out, transform ${PERMIT_CARD_TRANSITION_MS}ms ease-in-out`,
  } as const;

  return (
    <div
      ref={measureRef}
      aria-hidden={!isOpen}
      style={cardMotionStyle}
      className={`absolute left-full top-1/2 z-[8] ml-3 flex justify-center ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
    <aside
      className={`${montserrat.className} w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-red-400/50 bg-red-950/90 p-4 text-white backdrop-blur-md`}
      role="alert"
    >
      <p className="text-sm font-semibold">Permit card data missing</p>
      <p className="mt-2 text-xs leading-snug text-white/90">
        Site <code className="rounded bg-black/30 px-1">{siteId}</code> has{" "}
        <code className="rounded bg-black/30 px-1">showHoverInsightCard</code>{" "}
        but no matching record.{" "}
        <code className="rounded bg-black/30 px-1">
          permitDetailId={permitDetailId === undefined ? "undefined" : `"${permitDetailId}"`}
        </code>{" "}
        — add an entry in{" "}
        <code className="rounded bg-black/30 px-1">permit-intelligence-dataset.ts</code>
        .
      </p>
    </aside>
    </div>
  );
}

function InactiveSiteMarker({ site }: { site: InactiveSite }) {
  const showInsightCard = Boolean(site.showHoverInsightCard);
  const permitDetail = site.permitDetailId
    ? getPermitDetailRecord(site.permitDetailId)
    : undefined;
  const [cardOpen, setCardOpen] = useState(false);
  const [drillSection, setDrillSection] = useState<PermitCardDrillSection | null>(
    null,
  );
  const mapZoom = useMapZoomOptional();
  const markerRootRef = useRef<HTMLDivElement>(null);
  const missingCardShellRef = useRef<HTMLDivElement>(null);

  const toggleCard = useCallback(() => {
    if (!showInsightCard) return;
    setCardOpen((open) => !open);
  }, [showInsightCard]);

  /* Collapse drill-down when the main permit card closes */
  useEffect(() => {
    if (!cardOpen) setDrillSection(null);
  }, [cardOpen]);

  useEffect(() => {
    if (!showInsightCard || !cardOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (drillSection) {
        setDrillSection(null);
      } else {
        setCardOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showInsightCard, cardOpen, drillSection]);

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
  const resetMapPan = mapZoom?.resetPan;

  /* If the card closes (pin, Escape, etc.), return the map to normal zoom so it does not stay magnified. */
  useEffect(() => {
    if (!showInsightCard || cardOpen) return;
    resetMapZoom?.();
    resetMapPan?.();
  }, [showInsightCard, cardOpen, resetMapZoom, resetMapPan]);

  useMapPanForOpenPermitCard(
    missingCardShellRef,
    cardOpen && !permitDetail,
    site.id,
  );

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
        {permitDetail ? (
          <SiteHoverInsightCard
            isOpen={cardOpen}
            detail={permitDetail}
            drillSection={drillSection}
            onDrillSectionChange={setDrillSection}
          />
        ) : (
          <SiteHoverInsightCardMissingData
            isOpen={cardOpen}
            siteId={site.id}
            permitDetailId={site.permitDetailId}
            measureRef={missingCardShellRef}
          />
        )}
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
