import type {
  CouncilDistrict,
  PermitStage,
  PermitStatus,
  PermitType,
  PermitZipCode,
} from "@/lib/permit-filters";

/**
 * Inactive construction sites on the map — shared by markers and KPI layout tuning.
 * `city-map-metrics.ts` uses `INACTIVE_SITES.length` for inactive counts; nudge regional KPI
 * positions when you move markers so labels do not cover them.
 */

export type InactiveSite = {
  id: string;
  /** Horizontal position, 0 = left edge of map, 100 = right */
  xPercent: number;
  /** Vertical position, 0 = top, 100 = bottom */
  yPercent: number;
  /** True when this marker sits on a deepest-red heat core — extra ring for contrast on the hotspot. */
  isHeatCore?: boolean;
  /** Permit health score 1–100; drives map marker fill (crimson / yellow / gold / mint). */
  healthScore: number;
  /**
   * When set (west hotspot pin), click opens the permit card — demo only.
   */
  showHoverInsightCard?: boolean;
  /**
   * When set, card content loads from `lib/permit-intelligence-dataset.ts` (rich mock permit).
   */
  permitDetailId?: string;
  /** Mock permit row — powers top-left filters and search on the map. */
  permitNumber: string;
  siteName: string;
  /** One line for search (address / neighborhood). */
  addressSummary: string;
  status: PermitStatus;
  permitType: PermitType;
  zipCode: PermitZipCode;
  councilDistrict: CouncilDistrict;
  stage: PermitStage;
};

export const INACTIVE_SITES: readonly InactiveSite[] = [
  {
    id: "inv-01",
    xPercent: 20,
    yPercent: 30,
    healthScore: 28,
    permitNumber: "BLV-2026-1201",
    siteName: "Palm Grove duplex pair",
    addressSummary: "420 W Jefferson St, Brownsville TX 78521",
    status: "Pending",
    permitType: "New Residential Construction",
    zipCode: "78521",
    councilDistrict: 2,
    stage: "Review",
  },
  /* On west “hot” core (heat-layer lobe cx 12, cy 37) — permit card demo (BP-0441 dataset) */
  {
    id: "inv-02",
    xPercent: 12,
    yPercent: 37,
    isHeatCore: true,
    showHoverInsightCard: true,
    permitDetailId: "BP-0441",
    healthScore: 25,
    permitNumber: "BP-0441",
    siteName: "Boca Chica logistics annex",
    addressSummary: "1842 E Elizabeth St, Brownsville TX 78520",
    status: "Pending",
    permitType: "New Commercial Construction",
    zipCode: "78520",
    councilDistrict: 1,
    stage: "Review",
  },
  {
    id: "inv-03",
    xPercent: 28,
    yPercent: 54,
    healthScore: 74,
    permitNumber: "BLV-2025-0892",
    siteName: "Los Vecinos kitchen & bath",
    addressSummary: "910 Ringgold St, Brownsville TX 78526",
    status: "Approved",
    permitType: "Residential Remodel / Renovation",
    zipCode: "78526",
    councilDistrict: 3,
    stage: "Complete",
  },
  {
    id: "inv-04",
    xPercent: 46,
    yPercent: 20,
    healthScore: 88,
    permitNumber: "BLV-2026-2104",
    siteName: "Downtown office fit-out",
    addressSummary: "115 E 12th St, Brownsville TX 78520",
    status: "Submitted",
    permitType: "Commercial Remodel / Renovation",
    zipCode: "78520",
    councilDistrict: 1,
    stage: "Intake",
  },
  /* On east “hot” core (heat-layer lobe cx 59, cy 24) */
  {
    id: "inv-05",
    xPercent: 59,
    yPercent: 24,
    isHeatCore: true,
    healthScore: 22,
    permitNumber: "BLV-2025-3400",
    siteName: "Eastside warehouse shell",
    addressSummary: "2550 E 14th St, Brownsville TX 78521",
    status: "Pending",
    permitType: "Addition / Expansion",
    zipCode: "78521",
    councilDistrict: 2,
    stage: "Issuance",
  },
  {
    id: "inv-06",
    xPercent: 66,
    yPercent: 36,
    healthScore: 15,
    permitNumber: "BLV-2024-9910",
    siteName: "Harbor View demo pad",
    addressSummary: "88 Paredes Line Rd, Brownsville TX 78526",
    status: "Expired",
    permitType: "Demolition",
    zipCode: "78526",
    councilDistrict: 4,
    stage: "Complete",
  },
  {
    id: "inv-07",
    xPercent: 56,
    yPercent: 48,
    healthScore: 91,
    permitNumber: "BLV-2026-0455",
    siteName: "Sunset retail strip rebuild",
    addressSummary: "3310 Pablo Kisel Blvd, Brownsville TX 78526",
    status: "Approved",
    permitType: "New Commercial Construction",
    zipCode: "78526",
    councilDistrict: 3,
    stage: "Inspections",
  },
  /* On south “hot” core (heat-layer lobe cx 42, cy 60) */
  {
    id: "inv-08",
    xPercent: 42,
    yPercent: 60,
    isHeatCore: true,
    healthScore: 41,
    permitNumber: "BLV-2026-1888",
    siteName: "Southmost ADU pilot",
    addressSummary: "604 Southmost Rd, Brownsville TX 78521",
    status: "Pending",
    permitType: "Addition / Expansion",
    zipCode: "78521",
    councilDistrict: 4,
    stage: "Review",
  },
  {
    id: "inv-09",
    xPercent: 24,
    yPercent: 70,
    healthScore: 62,
    permitNumber: "BLV-2025-7601",
    siteName: "Resaca trailhead restrooms",
    addressSummary: "1900 Central Blvd, Brownsville TX 78520",
    status: "Submitted",
    permitType: "New Residential Construction",
    zipCode: "78520",
    councilDistrict: 2,
    stage: "Intake",
  },
  {
    id: "inv-10",
    xPercent: 52,
    yPercent: 74,
    healthScore: 79,
    permitNumber: "BLV-2026-0022",
    siteName: "Price Rd industrial bay",
    addressSummary: "4820 Price Rd, Brownsville TX 78526",
    status: "Approved",
    permitType: "Commercial Remodel / Renovation",
    zipCode: "78526",
    councilDistrict: 3,
    stage: "Issuance",
  },
  {
    id: "inv-11",
    xPercent: 80,
    yPercent: 52,
    healthScore: 8,
    permitNumber: "BLV-2024-5503",
    siteName: "Old bridge pier removal",
    addressSummary: "1 International Blvd, Brownsville TX 78521",
    status: "Expired",
    permitType: "Demolition",
    zipCode: "78521",
    councilDistrict: 4,
    stage: "Complete",
  },
  {
    id: "inv-12",
    xPercent: 88,
    yPercent: 40,
    healthScore: 54,
    permitNumber: "BLV-2026-3030",
    siteName: "Boca Chica crew housing",
    addressSummary: "7700 State Hwy 4, Brownsville TX 78521",
    status: "Pending",
    permitType: "New Residential Construction",
    zipCode: "78521",
    councilDistrict: 4,
    stage: "Inspections",
  },
];
