/**
 * Inactive construction site pins — shared by the map markers and KPI layout tuning.
 * `city-map-metrics.ts` uses `INACTIVE_SITES.length` for inactive counts; nudge regional KPI
 * positions when you move pins so labels do not cover icons.
 */

export type InactiveSite = {
  id: string;
  /** Horizontal position, 0 = left edge of map, 100 = right */
  xPercent: number;
  /** Vertical position, 0 = top, 100 = bottom */
  yPercent: number;
  /** True when this pin sits on a deepest-red heat core — drawn in white on the hotspot. */
  isHeatCore?: boolean;
  /**
   * When set (west hotspot pin), click opens the permit card — demo only.
   */
  showHoverInsightCard?: boolean;
};

export const INACTIVE_SITES: readonly InactiveSite[] = [
  { id: "inv-01", xPercent: 20, yPercent: 30 },
  /* On west “hot” core (heat-layer lobe cx 12, cy 37) */
  {
    id: "inv-02",
    xPercent: 12,
    yPercent: 37,
    isHeatCore: true,
    showHoverInsightCard: true,
  },
  { id: "inv-03", xPercent: 28, yPercent: 54 },
  { id: "inv-04", xPercent: 46, yPercent: 20 },
  /* On east “hot” core (heat-layer lobe cx 59, cy 24) */
  { id: "inv-05", xPercent: 59, yPercent: 24, isHeatCore: true },
  { id: "inv-06", xPercent: 66, yPercent: 36 },
  { id: "inv-07", xPercent: 56, yPercent: 48 },
  /* On south “hot” core (heat-layer lobe cx 42, cy 60) */
  { id: "inv-08", xPercent: 42, yPercent: 60, isHeatCore: true },
  { id: "inv-09", xPercent: 24, yPercent: 70 },
  { id: "inv-10", xPercent: 52, yPercent: 74 },
  { id: "inv-11", xPercent: 80, yPercent: 52 },
  { id: "inv-12", xPercent: 88, yPercent: 40 },
];
