import { INACTIVE_SITES } from "@/lib/inactive-sites";

/**
 * Mock city-wide numbers for the command center map. `inactiveSiteCount` follows `INACTIVE_SITES`.
 */
export const CITY_MAP_METRICS = {
  /** Construction / permit sites included in this view (denominator for % inactive). */
  totalSitesTracked: 67,
  /** Same count as pins on the map (`lib/inactive-sites.ts`). */
  inactiveSiteCount: INACTIVE_SITES.length,
  /** Open risk signals requiring attention (safety, compliance, etc.). */
  activeRiskAlerts: 3,
  /** Positive = delays lengthening vs prior period (bad for throughput). */
  delayTrendPercentVsPriorMonth: 12,
  /** Permits sitting in plan review or technical review. */
  permitsInReview: 28,
  /** Inspections scheduled in the next 7 days citywide. */
  inspectionsDueThisWeek: 9,
  /** Rolling 30-day citations tied to site conditions (mock). */
  citationsIssued30d: 14,
} as const;

export function getInactiveSitePercent(
  metrics: typeof CITY_MAP_METRICS = CITY_MAP_METRICS,
): number {
  if (metrics.totalSitesTracked <= 0) return 0;
  return Math.round(
    (metrics.inactiveSiteCount / metrics.totalSitesTracked) * 100,
  );
}

/** How the card’s horizontal edge lines up with `xPercent` (see `RegionalBadge` in `map-kpi-layer.tsx`). */
export type RegionalCardHorizontalAlign = "start" | "center" | "end";

/**
 * Three regions match the **east / west / south** `ZONES` in `heat-layer.tsx` (same 0–100 viewBox).
 * Each card is anchored **inside** its heat blob: west = upper-left halo, east = upper downtown
 * cluster, south = lower plume — spaced apart on the map. `horizontalAlign` nudges cards off pins.
 *
 * Vertical position still uses `max(10rem, y%)` so callouts clear the AI brief.
 */
export const REGIONAL_MAP_SNAPSHOTS = [
  {
    id: "east",
    label: "East corridor",
    /* East zone: right edge far right in the downtown cluster (horizontalAlign end). */
    xPercent: 84,
    yPercent: 36,
    horizontalAlign: "end" as const satisfies RegionalCardHorizontalAlign,
    inactiveNearby: 4,
    riskLevel: "Elevated" as const,
    delayVsCity: "+2d vs city avg",
  },
  {
    id: "west",
    label: "West district",
    /* West zone hot ~12,37; anchor left edge. Higher y% was covering inv-02’s pin — keep the card above it. */
    xPercent: 22,
    yPercent: 24,
    horizontalAlign: "start" as const satisfies RegionalCardHorizontalAlign,
    inactiveNearby: 3,
    riskLevel: "Watch" as const,
    delayVsCity: "At city avg",
  },
  {
    id: "south",
    label: "South basin",
    /* South zone hot ~42,60; centered in the south plume, higher in the heat blob. */
    xPercent: 40,
    yPercent: 66,
    horizontalAlign: "center" as const satisfies RegionalCardHorizontalAlign,
    inactiveNearby: 5,
    riskLevel: "Elevated" as const,
    delayVsCity: "+6d vs city avg",
  },
] as const;

/**
 * Alternate bottom-strip KPI sets (concept demo). Values align loosely with `CITY_MAP_METRICS`
 * so the story feels consistent across views.
 */
export const INVESTMENT_TRENDS_KPIS = {
  totalConstructionValueDisplay: "$42.8M",
  permitValueWowPercent: 8,
  newProjectsCount: 12,
  ongoingProjectsCount: 41,
  topGrowthNeighborhood: "East corridor",
  privateInvestmentPercent: 72,
} as const;

export const RISK_EXPOSURE_KPIS = {
  inactivePercentWeightedAvg: 22,
  highRiskSitesCityWide: 14,
  elevatedHeatZones: 3,
  riskMomTrendPercent: 4,
  immediateAttentionSites: 3,
} as const;

export const INTERVENTION_KPIS = {
  suggestedActionsQueued: 12,
  behindSchedulePriorityZones: 5,
  recommendedInspectorDelta: 2,
  fundingFocusArea: "South basin",
  historicalDelayReductionPercent: 18,
} as const;
