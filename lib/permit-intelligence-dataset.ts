/**
 * Rich permit records for the command center detail card and future flows (reviews, inspections, documents).
 * Proof of concept: BP-0441 — high-risk commercial project stuck in plan review.
 */

export type HealthScoreFactor = {
  /** Stable id for tests and analytics-style keys */
  id: string;
  /** Short label shown on the health breakdown */
  label: string;
  /** Sub-score 1–100 (higher = healthier) */
  score: number;
  /** Weight in the composite (0–1); all five should sum to 1 */
  weight: number;
};

export type PermitHealthScore = {
  /** Weighted composite 1–100, same scale as map marker */
  composite: number;
  /** Human label for the band (pair with color in UI — do not rely on color alone) */
  bandLabel: string;
  factors: readonly HealthScoreFactor[];
  blockingReasons: readonly string[];
  recommendedActions: readonly string[];
};

export type PermitJourneyStep = {
  id: string;
  label: string;
  status: "complete" | "current" | "upcoming";
  /** Extra context, e.g. duration or date */
  detail?: string;
};

export type PermitReviewRow = {
  department: string;
  status: string;
  cycles: number;
  detail?: string;
};

export type PermitInspectionRow = {
  type: string;
  status: string;
  scheduledFor?: string;
  detail?: string;
};

export type PermitDocumentRow = {
  name: string;
  status: string;
  detail?: string;
};

export type PermitLiveSiteStatus = {
  /** Drives dot color: critical = red-ish, warning = yellow, ok = mint */
  tone: "critical" | "warning" | "ok";
  headline: string;
};

export type PermitDetailRecord = {
  id: string;
  /** Uppercase chip next to permit #, e.g. COMMERCIAL */
  typeTag: string;
  projectName: string;
  addressLine1: string;
  addressLine2: string;
  liveSiteStatus: PermitLiveSiteStatus;
  aiInsight: string;
  lastInspectionDisplay: string;
  permitExpiresDisplay: string;
  contractor: string;
  openViolationsDisplay: string;
  /** Days used vs term length for the progress bar */
  permitDaysElapsed: number;
  permitDaysTotal: number;
  primaryCtaLabel: string;
  health_score: PermitHealthScore;
  journey: readonly PermitJourneyStep[];
  reviews: readonly PermitReviewRow[];
  inspections: readonly PermitInspectionRow[];
  documents: readonly PermitDocumentRow[];
};

/** Canonical hero permits (expand to six over time). */
export const PERMIT_DETAIL_BY_ID: Readonly<
  Record<string, PermitDetailRecord>
> = {
  "BP-0441": {
    id: "BP-0441",
    typeTag: "Commercial · new construction",
    projectName: "Boca Chica logistics annex",
    addressLine1: "1842 E Elizabeth St",
    addressLine2: "Brownsville, TX 78520",
    liveSiteStatus: {
      tone: "warning",
      headline: "Site idle — no field activity in 18 days (plan review hold)",
    },
    aiInsight:
      "Plan review has exceeded the 60-day target by 43 days. Fire marshal comments from cycle 4 are still unresolved. Escalate a combined plan review session or risk further slip.",
    lastInspectionDisplay: "Pre-construction (withdrawn)",
    permitExpiresDisplay: "Aug 12, 2026",
    contractor: "Coastal Industrial Partners LLC",
    openViolationsDisplay: "0 site violations (planning holds only)",
    permitDaysElapsed: 238,
    permitDaysTotal: 365,
    primaryCtaLabel: "Escalate plan review",
    health_score: {
      composite: 25,
      bandLabel: "Critical",
      /* Weighted average of these scores ≈ composite (for demo consistency). */
      factors: [
        {
          id: "timeline",
          label: "Timeline & cycle health",
          score: 10,
          weight: 0.28,
        },
        {
          id: "review",
          label: "Cross-dept review coherence",
          score: 18,
          weight: 0.24,
        },
        {
          id: "documents",
          label: "Document completeness",
          score: 32,
          weight: 0.2,
        },
        {
          id: "inspection_readiness",
          label: "Inspection readiness",
          score: 22,
          weight: 0.16,
        },
        {
          id: "compliance",
          label: "Compliance & contractor standing",
          score: 65,
          weight: 0.12,
        },
      ],
      blockingReasons: [
        "103 consecutive days in plan review (target 60)",
        "Fire marshal — life-safety sheet revision pending resubmittal",
        "Structural peer review — second cycle comments not addressed",
      ],
      recommendedActions: [
        "Schedule joint plan review with fire + structural leads",
        "Upload revised life-safety narrative (R3) within 5 business days",
        "Notify contractor of revised anticipated issuance window",
      ],
    },
    journey: [
      {
        id: "intake",
        label: "Intake",
        status: "complete",
        detail: "Completed Nov 6, 2025",
      },
      {
        id: "prescreen",
        label: "Prescreen",
        status: "complete",
        detail: "Cleared Nov 14, 2025",
      },
      {
        id: "plan_review",
        label: "Plan review",
        status: "current",
        detail: "Day 103 of active review",
      },
      {
        id: "issuance",
        label: "Issuance",
        status: "upcoming",
      },
      {
        id: "inspections",
        label: "Inspections",
        status: "upcoming",
      },
    ],
    reviews: [
      {
        department: "Building",
        status: "Comments issued — awaiting applicant",
        cycles: 5,
        detail: "Latest: Jan 8, 2026",
      },
      {
        department: "Fire prevention",
        status: "Hold — life-safety package",
        cycles: 4,
        detail: "Awaiting R3 upload",
      },
      {
        department: "Public works / stormwater",
        status: "Cleared",
        cycles: 2,
      },
      {
        department: "Structural (peer)",
        status: "Second review — open",
        cycles: 2,
        detail: "Shear wall calcs",
      },
    ],
    inspections: [
      {
        type: "Foundation",
        status: "Not scheduled",
        detail: "Blocked until permit issuance",
      },
      {
        type: "Framing",
        status: "Not scheduled",
        detail: "—",
      },
      {
        type: "Final building",
        status: "Not scheduled",
        detail: "—",
      },
    ],
    documents: [
      {
        name: "Architectural — sheet A2.3 (egress)",
        status: "Revision required",
        detail: "Marked up Jan 2, 2026",
      },
      {
        name: "Life-safety narrative",
        status: "Missing revision",
        detail: "Fire hold",
      },
      {
        name: "Structural calculations package",
        status: "Under peer review",
        detail: "Returned Dec 19, 2025",
      },
      {
        name: "Stormwater BMP plan",
        status: "Approved",
        detail: "Nov 22, 2025",
      },
    ],
  },
};

export function getPermitDetailRecord(
  permitDetailId: string,
): PermitDetailRecord | undefined {
  return PERMIT_DETAIL_BY_ID[permitDetailId];
}
