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
import { montserrat } from "@/lib/fonts";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useState } from "react";

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

/** Small inline icons so we don’t add a dependency; paired with text for accessibility. */
function IconInactive() {
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
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

function IconRisk() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-white"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconDelay() {
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
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function IconInbox() {
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
        d="M2.25 13.5h3.86a2.25 2.25 0 011.983 1.191l.7 1.3a2.25 2.25 0 002.154 1.059H16.5M2.25 13.5V9a2.25 2.25 0 012.25-2.25h3.379a2.25 2.25 0 011.06.275m-6.621 6.621L2.25 13.5m0 0L9 20.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function IconClipboard() {
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
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664v.75h-.75V6.25c0-.231.035-.454.1-.664M6.25 7.5h-.75v8.25c0 .414.336.75.75.75h12a.75.75 0 00.75-.75V6.25h-.75m-13.5-3A2.25 2.25 0 0113.5 3h3a2.25 2.25 0 012.25 2.25v.75h-9V4.5z"
      />
    </svg>
  );
}

/** Grid — default “ops” KPI strip. */
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

function IconTrendingUp() {
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
        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
      />
    </svg>
  );
}

function IconBuildingOffice() {
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
        d="M2.25 21h19.5m-18-18v18m2.25-18v18m9-13.5V9M12 6.75V9m0 0V6.75M12 9v3.75M12 12.75v3.75m0-6.75V6.75m0 0h-.008v.008H12V6.75zm-9 3.75h3.75v3.75H3v-3.75zm16.5 0h-3.75v3.75H19.5v-3.75zm0 9v3.75H19.5v-3.75zm-16.5 0v3.75H3v-3.75z"
      />
    </svg>
  );
}

function IconMapPinArea() {
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
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

function IconScale() {
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
        d="M12 3v17.25m0 0l-4.5-4.5M12 20.25l4.5-4.5M3.375 9.75h17.25m0 0l-4.5 4.5M20.625 9.75l-4.5-4.5"
      />
    </svg>
  );
}

/** Overlapping dots suggest a clustered neighborhood heatmap. */
function IconHeatCluster() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-white"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="8" cy="9" r="4" opacity={0.95} />
      <circle cx="16" cy="9" r="4" opacity={0.72} />
      <circle cx="8" cy="17" r="4" opacity={0.82} />
      <circle cx="16" cy="17" r="4" opacity={0.58} />
    </svg>
  );
}

function IconExclamationTriangle() {
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
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

function IconUsersGear() {
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
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.813-2.38M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

/** Down arrow — reads as “reduction” for historical delay improvement. */
function IconArrowDown() {
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
        d="M12 4.5v15m0 0l-6.75-6.75M12 19.5l6.75-6.75"
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
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
};

/** One stat in the bottom strip: label stays small; value is the hero number. */
function KpiChip({ icon, label, value, hint }: KpiChipProps) {
  return (
    <div className="flex min-w-[12rem] shrink-0 flex-col gap-1 rounded-2xl border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-glass)_92%,transparent)] px-4 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-md sm:min-w-[12.5rem]">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide text-white">
          {label}
        </span>
      </div>
      <p className="text-2xl font-semibold leading-none tracking-tight text-white sm:text-[1.75rem]">
        {value}
      </p>
      {hint ? (
        <p className="text-xs leading-snug text-white">{hint}</p>
      ) : null}
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
  /* Risk line: light pill on semi-transparent black card. */
  const riskStyles =
    riskLevel === "Elevated"
      ? "text-[var(--heat-hot)]"
      : "text-white";

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
        className={`${montserrat.className} max-w-[min(15rem,42vw)] rounded-xl border border-white/15 bg-black/60 px-4 py-3.5 shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-sm will-change-[opacity,transform]`}
        style={motionStyle}
        aria-hidden={!isVisible}
      >
        <p className="text-sm font-semibold leading-tight text-white sm:text-[15px]">
          {label}
        </p>
        <p className="mt-2 text-xs leading-snug text-white sm:text-[13px]">
          {inactiveNearby} inactive nearby
        </p>
        <p className="mt-1.5 text-xs font-medium leading-snug sm:text-[13px]">
          <span
            className={`inline-block rounded-md px-2 py-1 [box-decoration-break:clone] bg-white/15 ${riskStyles}`}
          >
            Risk: {riskLevel}
          </span>
        </p>
        <p className="mt-1.5 text-xs leading-snug text-white sm:text-[13px]">
          Delays {delayVsCity}
        </p>
      </div>
    </div>
  );
}

/**
 * KPI layer: bottom strip (city totals) + three regional callouts over east / west / south heat.
 * Sits above the heat SVG but below inactive pins (z-index) so interactions stay correct.
 */
export function MapKpiLayer() {
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

      {/* KPI view cycle (above) + regional ellipsis (below): fixed stack, bottom-right. */}
      <div
        className={`${montserrat.className} fixed bottom-4 right-4 z-[25] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6`}
      >
        <button
          type="button"
          onClick={cycleKpiView}
          className="group flex min-h-12 min-w-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full border border-white/15 bg-[color-mix(in_srgb,var(--surface-glass)_40%,transparent)] px-2 shadow-[0_2px_16px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-[background-color,opacity,transform] duration-200 ease-out hover:border-white/30 hover:bg-[color-mix(in_srgb,var(--surface-glass)_65%,#0a0c14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:scale-[0.97]"
          aria-label={`Cycle KPI strip. Now showing: ${kpiViewModeTitle(kpiViewMode)}. Next: ${kpiViewModeTitle(nextKpiViewMode(kpiViewMode))}.`}
        >
          <span className="opacity-90 group-hover:opacity-100" aria-hidden>
            <KpiViewToggleIcon mode={kpiViewMode} />
          </span>
          {/* Short label so the control reads as “analytics themes,” not a generic icon. */}
          <span className="max-w-[3.25rem] text-center text-[9px] font-semibold uppercase leading-tight tracking-wide text-white">
            {kpiViewMode === "default" ? "Ops" : kpiViewMode === "investment" ? "Growth" : kpiViewMode === "risk" ? "Risk" : "Action"}
          </span>
        </button>

        <button
          type="button"
          onClick={toggleRegionalCards}
          aria-expanded={regionalCardsExpanded}
          className="group flex min-h-12 min-w-12 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[color-mix(in_srgb,var(--surface-glass)_40%,transparent)] shadow-[0_2px_16px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-[background-color,opacity,transform] duration-200 ease-out hover:border-white/30 hover:bg-[color-mix(in_srgb,var(--surface-glass)_65%,#0a0c14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:scale-[0.97]"
          aria-label={
            regionalCardsExpanded
              ? "Hide the three regional map summaries."
              : "Show west, south, and east regional map summaries in sequence with overlapping animation. Click again to hide in reverse order."
          }
        >
          {/* Three dots hint at three zones; keep the surface mostly empty so it reads as a hotspot. */}
          <span
            className="flex gap-1 opacity-70 group-hover:opacity-100"
            aria-hidden
          >
            <span className="size-1.5 rounded-full bg-white/80" />
            <span className="size-1.5 rounded-full bg-white/80" />
            <span className="size-1.5 rounded-full bg-white/80" />
          </span>
        </button>
      </div>

      {/* City-wide metrics — fixed to the bottom so it reads like an ops ticker */}
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-[16] px-3 pb-20 pt-2 sm:px-6 sm:pb-24 ${montserrat.className}`}
      >
        <div
          className="mx-auto flex max-w-6xl flex-wrap items-stretch justify-center gap-3 sm:gap-4"
          role="region"
          aria-label={`City map KPIs — ${kpiViewModeTitle(kpiViewMode)}`}
        >
          {kpiViewMode === "default" ? (
            <>
              <KpiChip
                icon={<IconInactive />}
                label="Inactive sites"
                value={`${inactivePct}%`}
                hint={`${m.inactiveSiteCount} of ${m.totalSitesTracked} tracked sites`}
              />
              <KpiChip
                icon={<IconRisk />}
                label="Active risk alerts"
                value={String(m.activeRiskAlerts)}
                hint="Safety & compliance signals"
              />
              <KpiChip
                icon={<IconDelay />}
                label="Delay trend"
                value={`+${m.delayTrendPercentVsPriorMonth}%`}
                hint="Vs prior month (cycle time)"
              />
              <KpiChip
                icon={<IconInbox />}
                label="Permits in review"
                value={String(m.permitsInReview)}
                hint="Plan & technical queue"
              />
              <KpiChip
                icon={<IconClipboard />}
                label="Inspections due (7d)"
                value={String(m.inspectionsDueThisWeek)}
                hint={`${m.citationsIssued30d} citations (30d)`}
              />
            </>
          ) : null}

          {kpiViewMode === "investment" ? (
            <>
              <KpiChip
                icon={<IconChartBar />}
                label="Total construction value"
                value={inv.totalConstructionValueDisplay}
                hint="Aggregated permit value — bar or map heat by neighborhood"
              />
              <KpiChip
                icon={<IconTrendingUp />}
                label="Permit value trend"
                value={`+${inv.permitValueWowPercent}% WoW`}
                hint="Week-over-week; switch to month-over-month in full build"
              />
              <KpiChip
                icon={<IconBuildingOffice />}
                label="New vs ongoing"
                value={`${inv.newProjectsCount} new · ${inv.ongoingProjectsCount} ongoing`}
                hint="District roll-up — compare to map overlays"
              />
              <KpiChip
                icon={<IconMapPinArea />}
                label="Top growth neighborhood"
                value={inv.topGrowthNeighborhood}
                hint="Side panel + map highlight — high vs low activity"
              />
              <KpiChip
                icon={<IconScale />}
                label="Private vs public"
                value={`${inv.privateInvestmentPercent}% private`}
                hint="Stacked share — pair with public overlay on map"
              />
            </>
          ) : null}

          {kpiViewMode === "risk" ? (
            <>
              <KpiChip
                icon={<IconInactive />}
                label="Inactive sites (area avg)"
                value={`${risk.inactivePercentWeightedAvg}%`}
                hint="Weighted across districts — tie to map for context"
              />
              <KpiChip
                icon={<IconExclamationTriangle />}
                label="High-risk sites"
                value={String(risk.highRiskSitesCityWide)}
                hint="City-wide — no activity, violations, or unpermitted work"
              />
              <KpiChip
                icon={<IconHeatCluster />}
                label="Risk heat clusters"
                value={`${risk.elevatedHeatZones} elevated`}
                hint="Neighborhood heatmap — red/yellow/green coding"
              />
              <KpiChip
                icon={<IconTrendingUp />}
                label="Risk trend"
                value={`↑${risk.riskMomTrendPercent}% MoM`}
                hint="Trailing 30 days — risk increasing vs decreasing"
              />
              <KpiChip
                icon={<IconShieldAlert />}
                label="Immediate attention"
                value={String(risk.immediateAttentionSites)}
                hint="Quick total — urgent queue vs city-wide high-risk"
              />
            </>
          ) : null}

          {kpiViewMode === "intervention" ? (
            <>
              <KpiChip
                icon={<IconClipboard />}
                label="Suggested actions"
                value={String(act.suggestedActionsQueued)}
                hint="Inspections, compliance checks, funding from risk signals"
              />
              <KpiChip
                icon={<IconDelay />}
                label="Behind schedule"
                value={`${act.behindSchedulePriorityZones} in priority zones`}
                hint="Alerts where leadership may need to step in"
              />
              <KpiChip
                icon={<IconUsersGear />}
                label="Resource deployment"
                value={`+${act.recommendedInspectorDelta} inspectors`}
                hint="Staffing suggestion — adjust to zoning focus as needed"
              />
              <KpiChip
                icon={<IconMapPinArea />}
                label="Funding / zoning focus"
                value={act.fundingFocusArea}
                hint="Capital & policy — pair with high-priority corridors"
              />
              <KpiChip
                icon={<IconArrowDown />}
                label="Historical impact"
                value={`−${act.historicalDelayReductionPercent}% delay`}
                hint="Similar interventions — outcomes improved over 12 months"
              />
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
