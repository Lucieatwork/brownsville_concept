"use client";

import {
  CITY_MAP_METRICS,
  getInactiveSitePercent,
  INVESTMENT_TRENDS_KPIS,
  INTERVENTION_KPIS,
  type RegionalCardHorizontalAlign,
  REGIONAL_MAP_SNAPSHOTS,
  RISK_EXPOSURE_KPIS,
} from "@/lib/city-map-metrics";
import { useMapChromeBoundsOptional } from "@/components/command-center/map-chrome-bounds-context";
import { montserrat } from "@/lib/fonts";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Same timing as the permit overlay card in `inactive-site-markers.tsx` (fade + slide). */
const REGIONAL_CARD_ANIMATION_MS = 1000;

/** Next card starts this many ms after the previous so motions overlap slightly (with 1s duration). */
const REGIONAL_STAGGER_MS = 240;

/**
 * Display order: west → south → east. Snapshots in `city-map-metrics` are not stored in this order,
 * so we resolve by `id`.
 */
const REGIONAL_CYCLE_IDS = ["west", "south", "east"] as const;

function getRegionalSnapshotsInCycleOrder() {
  return REGIONAL_CYCLE_IDS.map((id) => {
    const region = REGIONAL_MAP_SNAPSHOTS.find((r) => r.id === id);
    if (!region) {
      throw new Error(`Missing regional snapshot for id "${id}"`);
    }
    return region;
  });
}

/** Inline icons for the bottom-right KPI view cycle button only (no extra dependency). */
function IconKpiGrid() {
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
        d="M3.75 6A2.25 2.25 0 016 3.75h3A2.25 2.25 0 0111.25 6v3A2.25 2.25 0 019 11.25H6A2.25 2.25 0 013.75 9V6zM12.75 6A2.25 2.25 0 0115 3.75h3A2.25 2.25 0 0120.25 6v3A2.25 2.25 0 0118 11.25h-3A2.25 2.25 0 0112.75 9V6zM6 12.75A2.25 2.25 0 018.25 15v3A2.25 2.25 0 016 20.25 3.75 18 3.75 15v-3A2.25 2.25 0 016 12.75zM12.75 15a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-3A2.25 2.25 0 0112.75 18v-3z"
      />
    </svg>
  );
}

/** Bar chart — investment & growth themes. */
function IconChartBar() {
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
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v7.875C7.5 21.496 6.996 22 6.375 22h-2.25A1.125 1.125 0 013 20.875v-7.875zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  );
}

/** Shield — risk & compliance framing. */
function IconShieldAlert() {
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
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

/** Light bulb — leadership actions & insights. */
function IconLightbulb() {
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
        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75.479v-4.5m-3.75 4.5v-4.5m0 0h-8.25a11.985 11.985 0 01-.065-4.125 12 12 0 012.645-6.38 12 12 0 0110.69-3.998 12 12 0 012.645 6.38c.09.688.135 1.382.135 2.123v.003z"
      />
    </svg>
  );
}

type KpiViewMode = "default" | "investment" | "risk" | "intervention";

const KPI_VIEW_CYCLE: KpiViewMode[] = [
  "default",
  "investment",
  "risk",
  "intervention",
];

function nextKpiViewMode(current: KpiViewMode): KpiViewMode {
  const i = KPI_VIEW_CYCLE.indexOf(current);
  return KPI_VIEW_CYCLE[(i + 1) % KPI_VIEW_CYCLE.length]!;
}

function kpiViewModeTitle(mode: KpiViewMode): string {
  switch (mode) {
    case "default":
      return "Operational summary";
    case "investment":
      return "Investment trends";
    case "risk":
      return "Risk exposure";
    case "intervention":
      return "Intervention priority";
  }
}

function KpiViewToggleIcon({ mode }: { mode: KpiViewMode }) {
  switch (mode) {
    case "default":
      return <IconKpiGrid />;
    case "investment":
      return <IconChartBar />;
    case "risk":
      return <IconShieldAlert />;
    case "intervention":
      return <IconLightbulb />;
  }
}

type KpiChipProps = {
  label: string;
  value: string;
  hint?: string;
};

/**
 * One stat in the bottom strip: white label pill first, then value, then hint (wrapped, no ellipsis).
 */
function KpiChip({ label, value, hint }: KpiChipProps) {
  return (
    <div className="relative flex min-h-[6.25rem] min-w-0 flex-1 basis-0 flex-col overflow-hidden rounded-lg border border-[var(--border-subtle)] shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:min-h-[7rem] sm:rounded-xl md:min-h-[7.5rem]">
      {/* Match AI brief / permit card: one frosted plate per chip */}
      <div
        className="pointer-events-none absolute inset-0 rounded-lg bg-[var(--surface-glass-panel)] backdrop-blur-xl backdrop-saturate-150 sm:rounded-xl"
        aria-hidden
      />
      <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col gap-2 px-2 py-2.5 sm:px-2.5 sm:py-3">
        {/* Metric name: white pill, black type — matches AI brief / chat label chips */}
        <span className="inline-flex min-h-6 w-fit max-w-full shrink-0 items-center justify-center rounded-md bg-white px-2.5 py-1 text-center text-[11px] font-medium uppercase leading-none tracking-wide text-neutral-950 [overflow-wrap:anywhere] sm:px-3 sm:py-1.5">
          {label}
        </span>
        {/* Full-bleed hairline: cancel chip horizontal padding so the rule spans card inner edge to edge */}
        <div
          className="h-px w-[calc(100%+1rem)] shrink-0 bg-[var(--divider-subtle)] sm:w-[calc(100%+1.25rem)] -mx-2 sm:-mx-2.5"
          aria-hidden
        />
        <p className="w-full shrink-0 text-base font-semibold leading-snug tracking-tight text-white tabular-nums [overflow-wrap:anywhere] sm:text-lg md:text-xl">
          {value}
        </p>
        {hint ? (
          <p className="min-w-0 text-[9px] leading-snug text-white [overflow-wrap:anywhere] sm:text-[10px] md:text-xs">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type RegionalBadgeProps = {
  label: string;
  inactiveNearby: number;
  riskLevel: string;
  delayVsCity: string;
  /** Horizontal position on the map (0–100), same space as the heat layer. */
  xPercent: number;
  /**
   * Desired vertical position as a percent of viewport height; combined with `top: max(10rem, y%)`
   * so cards never sit under the AI brief (fixed top bar, z-20).
   */
  yPercent: number;
  /** Which edge of the card sits at `xPercent` — spreads labels across each heat zone without stacking on one column. */
  horizontalAlign: RegionalCardHorizontalAlign;
  /** Driven by the bottom-right hotspot: fade + slide like the permit card when false. */
  isVisible: boolean;
  /** 0 = first in sequence (west); stagger delays stack for overlapping in/out. */
  staggerIndex: number;
  /** How many cards participate in the stagger (used to reverse delay on exit). */
  staggerCount: number;
};

function regionalBadgeTranslateClass(
  horizontalAlign: RegionalCardHorizontalAlign,
): string {
  switch (horizontalAlign) {
    case "start":
      return "translate-x-0";
    case "end":
      return "-translate-x-full";
    default:
      return "-translate-x-1/2";
  }
}

/** Keeps regional cards below the AI brief bar on all breakpoints; tune if the brief layout changes. */
const REGIONAL_CARD_MIN_TOP = "10rem";

/**
 * Floating regional summary anchored to map % coords. `pointer-events-none` so map pins
 * underneath keep receiving clicks. Cards hang **downward** from the anchor so they don’t
 * extend into the AI brief zone.
 */
function RegionalBadge({
  label,
  inactiveNearby,
  riskLevel,
  delayVsCity,
  xPercent,
  yPercent,
  horizontalAlign,
  isVisible,
  staggerIndex,
  staggerCount,
}: RegionalBadgeProps) {
  /* Enter: west → south → east (0, 1, 2…). Exit: reverse so the last one in eases out first — overlap on both. */
  const staggerDelayMs = isVisible
    ? staggerIndex * REGIONAL_STAGGER_MS
    : Math.max(0, staggerCount - 1 - staggerIndex) * REGIONAL_STAGGER_MS;

  /* Closed: sits slightly lower so it glides up with the fade (same idea as the permit card). */
  const motionStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible
      ? "translate3d(0, 0, 0)"
      : "translate3d(0, 1.25rem, 0)",
    transition: `opacity ${REGIONAL_CARD_ANIMATION_MS}ms ease-in-out ${staggerDelayMs}ms, transform ${REGIONAL_CARD_ANIMATION_MS}ms ease-in-out ${staggerDelayMs}ms`,
  } as const;

  return (
    <div
      className={`pointer-events-none absolute z-[4] max-w-[min(15rem,42vw)] ${regionalBadgeTranslateClass(horizontalAlign)}`}
      style={
        {
          left: `${xPercent}%`,
          top: `max(${REGIONAL_CARD_MIN_TOP}, ${yPercent}%)`,
        } satisfies CSSProperties
      }
    >
      <div
        className={`${montserrat.className} relative max-w-[min(15rem,42vw)] overflow-hidden rounded-xl border border-[var(--border-subtle)] shadow-[0_8px_32px_rgba(0,0,0,0.35)] will-change-[opacity,transform]`}
        style={motionStyle}
        aria-hidden={!isVisible}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-xl bg-[var(--surface-glass-panel)] backdrop-blur-xl backdrop-saturate-150"
          aria-hidden
        />
        <div className="relative z-[1] px-4 py-3.5">
          <p className="text-sm font-semibold leading-tight text-white sm:text-[15px]">
            {label}
          </p>
          <p className="mt-2 text-xs leading-snug text-white sm:text-[13px]">
            {inactiveNearby} inactive nearby
          </p>
          <p className="mt-1.5 text-xs font-medium leading-snug sm:text-[13px]">
            <span
              className={`inline-block rounded-md bg-white px-2.5 py-1 [box-decoration-break:clone] text-[11px] sm:text-xs ${
                riskLevel === "Elevated"
                  ? "font-semibold text-[var(--heat-hot)]"
                  : "text-neutral-950"
              }`}
            >
              Risk: {riskLevel}
            </span>
          </p>
          <p className="mt-1.5 text-xs leading-snug text-white sm:text-[13px]">
            Delays {delayVsCity}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * KPI layer: bottom strip (city totals) + FABs + three regional callouts on the map.
 * Regional badges stay inside the panned/zoomed map. The ticker and FABs are portaled to
 * `document.body` so `position: fixed` is viewport-anchored (transform ancestors would
 * otherwise make them drift with the map — see `MapZoomProvider`).
 */
export function MapKpiLayer() {
  const chrome = useMapChromeBoundsOptional();
  /** Client-only: portal root so fixed KPI chrome is not under `MapZoomProvider` transforms. */
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  const inactivePct = getInactiveSitePercent();
  const m = CITY_MAP_METRICS;
  const inv = INVESTMENT_TRENDS_KPIS;
  const risk = RISK_EXPOSURE_KPIS;
  const act = INTERVENTION_KPIS;

  /**
   * Hotspot toggles all three regional cards: staggered in (west → south → east, overlapping),
   * then staggered out (east → south → west, overlapping).
   */
  const [regionalCardsExpanded, setRegionalCardsExpanded] = useState(false);

  /** Cycles bottom KPI strip: operational → investment → risk → intervention → … */
  const [kpiViewMode, setKpiViewMode] = useState<KpiViewMode>("default");

  const regionalSnapshotsOrdered = getRegionalSnapshotsInCycleOrder();
  const regionalStaggerCount = regionalSnapshotsOrdered.length;

  const toggleRegionalCards = useCallback(() => {
    setRegionalCardsExpanded((open) => !open);
  }, []);

  const cycleKpiView = useCallback(() => {
    setKpiViewMode((prev) => nextKpiViewMode(prev));
  }, []);

  const regionalStatusLabel = regionalCardsExpanded
    ? "West, south, and east regional summaries are visible on the map."
    : "Regional map summaries are hidden.";

  const kpiStripStatusLabel = `KPI strip: ${kpiViewModeTitle(kpiViewMode)}.`;

  return (
    <>
      {/* Region callouts — positioned in the same 0–100% space as the heat layer */}
      <div
        className="pointer-events-none absolute inset-0 z-[4]"
        role="status"
        aria-live="polite"
        aria-relevant="additions text"
      >
        <span className="sr-only">
          {regionalStatusLabel} {kpiStripStatusLabel}
        </span>
        {regionalSnapshotsOrdered.map((region, index) => (
          <RegionalBadge
            key={region.id}
            label={region.label}
            inactiveNearby={region.inactiveNearby}
            riskLevel={region.riskLevel}
            delayVsCity={region.delayVsCity}
            xPercent={region.xPercent}
            yPercent={region.yPercent}
            horizontalAlign={region.horizontalAlign}
            isVisible={regionalCardsExpanded}
            staggerIndex={index}
            staggerCount={regionalStaggerCount}
          />
        ))}
      </div>

      {portalRoot
        ? createPortal(
            <>
              {/* KPI view cycle + regional ellipsis: fixed stack, bottom-right (viewport-fixed). */}
              <div
                ref={chrome?.fabStackRef}
                className={`${montserrat.className} fixed bottom-4 right-4 z-[25] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6`}
              >
                <button
                  type="button"
                  onClick={cycleKpiView}
                  className="group flex min-h-12 min-w-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full bg-blue-600 px-2 text-white shadow-md transition-[background-color,transform] duration-200 ease-out hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:scale-[0.97]"
                  aria-label={`Cycle KPI strip. Now showing: ${kpiViewModeTitle(kpiViewMode)}. Next: ${kpiViewModeTitle(nextKpiViewMode(kpiViewMode))}.`}
                >
                  <span className="flex flex-col items-center justify-center gap-0.5">
                    <span className="opacity-95 group-hover:opacity-100" aria-hidden>
                      <KpiViewToggleIcon mode={kpiViewMode} />
                    </span>
                    <span className="max-w-[3.25rem] text-center text-[9px] font-semibold uppercase leading-tight tracking-wide text-white">
                      {kpiViewMode === "default" ? "Ops" : kpiViewMode === "investment" ? "Growth" : kpiViewMode === "risk" ? "Risk" : "Action"}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleRegionalCards}
                  aria-expanded={regionalCardsExpanded}
                  className="group flex min-h-12 min-w-12 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-[background-color,transform] duration-200 ease-out hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:scale-[0.97]"
                  aria-label={
                    regionalCardsExpanded
                      ? "Hide the three regional map summaries."
                      : "Show west, south, and east regional map summaries in sequence with overlapping animation. Click again to hide in reverse order."
                  }
                >
                  <span className="flex gap-1 opacity-90 group-hover:opacity-100" aria-hidden>
                    <span className="size-1.5 rounded-full bg-white" />
                    <span className="size-1.5 rounded-full bg-white" />
                    <span className="size-1.5 rounded-full bg-white" />
                  </span>
                </button>
              </div>

              {/* City-wide metrics — `px` / `pb` mirror `CommandCenterTopBar` (`px` / `pt`). */}
              <div
                ref={chrome?.kpiStripRef}
                className={`pointer-events-none fixed inset-x-0 bottom-0 z-[16] px-4 pb-4 pt-2 sm:px-6 sm:pb-6 ${montserrat.className}`}
              >
                <div
                  className="mx-auto flex w-full max-w-6xl flex-nowrap items-stretch gap-1 sm:gap-2"
                  role="region"
                  aria-label={`City map KPIs — ${kpiViewModeTitle(kpiViewMode)}`}
                >
                  {kpiViewMode === "default" ? (
                    <>
                      <KpiChip
                        label="Inactive sites"
                        value={`${inactivePct}%`}
                        hint={`${m.inactiveSiteCount} of ${m.totalSitesTracked} tracked sites`}
                      />
                      <KpiChip
                        label="Active risk alerts"
                        value={String(m.activeRiskAlerts)}
                        hint="Safety & compliance signals"
                      />
                      <KpiChip
                        label="Delay trend"
                        value={`+${m.delayTrendPercentVsPriorMonth}%`}
                        hint="Vs prior month (cycle time)"
                      />
                      <KpiChip
                        label="Permits in review"
                        value={String(m.permitsInReview)}
                        hint="Plan & technical queue"
                      />
                      <KpiChip
                        label="Inspections due (7d)"
                        value={String(m.inspectionsDueThisWeek)}
                        hint={`${m.citationsIssued30d} citations (30d)`}
                      />
                    </>
                  ) : null}

                  {kpiViewMode === "investment" ? (
                    <>
                      <KpiChip
                        label="Total construction value"
                        value={inv.totalConstructionValueDisplay}
                        hint="Aggregated permit value — bar or map heat by neighborhood"
                      />
                      <KpiChip
                        label="Permit value trend"
                        value={`+${inv.permitValueWowPercent}% WoW`}
                        hint="Week-over-week; switch to month-over-month in full build"
                      />
                      <KpiChip
                        label="New vs ongoing"
                        value={`${inv.newProjectsCount} new · ${inv.ongoingProjectsCount} ongoing`}
                        hint="District roll-up — compare to map overlays"
                      />
                      <KpiChip
                        label="Top growth neighborhood"
                        value={inv.topGrowthNeighborhood}
                        hint="Side panel + map highlight — high vs low activity"
                      />
                      <KpiChip
                        label="Private vs public"
                        value={`${inv.privateInvestmentPercent}% private`}
                        hint="Stacked share — pair with public overlay on map"
                      />
                    </>
                  ) : null}

                  {kpiViewMode === "risk" ? (
                    <>
                      <KpiChip
                        label="Inactive sites (area avg)"
                        value={`${risk.inactivePercentWeightedAvg}%`}
                        hint="Weighted across districts — tie to map for context"
                      />
                      <KpiChip
                        label="High-risk sites"
                        value={String(risk.highRiskSitesCityWide)}
                        hint="City-wide — no activity, violations, or unpermitted work"
                      />
                      <KpiChip
                        label="Risk heat clusters"
                        value={`${risk.elevatedHeatZones} elevated`}
                        hint="Neighborhood heatmap — red/yellow/green coding"
                      />
                      <KpiChip
                        label="Risk trend"
                        value={`↑${risk.riskMomTrendPercent}% MoM`}
                        hint="Trailing 30 days — risk increasing vs decreasing"
                      />
                      <KpiChip
                        label="Immediate attention"
                        value={String(risk.immediateAttentionSites)}
                        hint="Quick total — urgent queue vs city-wide high-risk"
                      />
                    </>
                  ) : null}

                  {kpiViewMode === "intervention" ? (
                    <>
                      <KpiChip
                        label="Suggested actions"
                        value={String(act.suggestedActionsQueued)}
                        hint="Inspections, compliance checks, funding from risk signals"
                      />
                      <KpiChip
                        label="Behind schedule"
                        value={`${act.behindSchedulePriorityZones} in priority zones`}
                        hint="Alerts where leadership may need to step in"
                      />
                      <KpiChip
                        label="Resource deployment"
                        value={`+${act.recommendedInspectorDelta} inspectors`}
                        hint="Staffing suggestion — adjust to zoning focus as needed"
                      />
                      <KpiChip
                        label="Funding / zoning focus"
                        value={act.fundingFocusArea}
                        hint="Capital & policy — pair with high-priority corridors"
                      />
                      <KpiChip
                        label="Historical impact"
                        value={`−${act.historicalDelayReductionPercent}% delay`}
                        hint="Similar interventions — outcomes improved over 12 months"
                      />
                    </>
                  ) : null}
                </div>
              </div>
            </>,
            portalRoot,
          )
        : null}
    </>
  );
}
