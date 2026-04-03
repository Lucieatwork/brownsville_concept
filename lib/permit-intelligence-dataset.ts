/**
 * Rich permit records for the command center detail card and future flows (reviews, inspections, documents).
 * Six hero scenarios — each linked from a map marker via `permitDetailId` in `inactive-sites.ts`.
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

/** Canonical hero permits — IDs match map `permitDetailId`. */
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

  "BP-0387": {
    id: "BP-0387",
    typeTag: "Residential · new construction",
    projectName: "Brighton Estates — lot 14",
    addressLine1: "612 Mesquite Ln",
    addressLine2: "Brownsville, TX 78526",
    liveSiteStatus: {
      tone: "ok",
      headline: "Active — framing inspection passed Mar 28; crew on site today",
    },
    aiInsight:
      "Cycle times are ahead of city median. Next milestone is rough MEP — no department holds. Keep the current inspection cadence.",
    lastInspectionDisplay: "Framing — passed Mar 28, 2026",
    permitExpiresDisplay: "Nov 2, 2026",
    contractor: "Rio Grande Homebuilders Inc.",
    openViolationsDisplay: "0",
    permitDaysElapsed: 96,
    permitDaysTotal: 365,
    primaryCtaLabel: "Schedule next inspection",
    health_score: {
      composite: 82,
      bandLabel: "Healthy",
      factors: [
        { id: "timeline", label: "Timeline & cycle health", score: 88, weight: 0.28 },
        { id: "review", label: "Cross-dept review coherence", score: 85, weight: 0.24 },
        { id: "documents", label: "Document completeness", score: 80, weight: 0.2 },
        {
          id: "inspection_readiness",
          label: "Inspection readiness",
          score: 78,
          weight: 0.16,
        },
        { id: "compliance", label: "Compliance & contractor standing", score: 75, weight: 0.12 },
      ],
      blockingReasons: [],
      recommendedActions: [
        "Book rough electrical + plumbing (combined slot if available)",
        "Upload updated window schedule before insulation stage",
      ],
    },
    journey: [
      { id: "intake", label: "Intake", status: "complete", detail: "Dec 18, 2025" },
      { id: "plan_review", label: "Plan review", status: "complete", detail: "Cleared Jan 9" },
      { id: "issuance", label: "Issuance", status: "complete", detail: "Jan 22, 2026" },
      {
        id: "inspections",
        label: "Inspections",
        status: "current",
        detail: "Foundation ✓ · Framing ✓ · MEP next",
      },
      { id: "final", label: "Final / CO", status: "upcoming" },
    ],
    reviews: [
      { department: "Building", status: "Approved — permit issued", cycles: 1 },
      { department: "Fire prevention", status: "Deferred to rough inspection", cycles: 1 },
      { department: "Public works", status: "Cleared", cycles: 1 },
    ],
    inspections: [
      { type: "Foundation", status: "Passed", detail: "Feb 4, 2026" },
      { type: "Framing", status: "Passed", detail: "Mar 28, 2026" },
      { type: "Rough MEP", status: "Scheduled", detail: "Apr 8, 2026 · 9:00 a.m." },
      { type: "Final building", status: "Not scheduled", detail: "—" },
    ],
    documents: [
      { name: "Structural plans (signed)", status: "Approved", detail: "On file" },
      { name: "Energy compliance (TREC)", status: "Approved", detail: "Jan 2026" },
      { name: "Site safety plan", status: "Current", detail: "Updated Mar 1" },
    ],
  },

  "BP-0512": {
    id: "BP-0512",
    typeTag: "Commercial · clinic tenant improvement",
    projectName: "Valley Community Health — suite build-out",
    addressLine1: "2200 Central Blvd, Suite 140",
    addressLine2: "Brownsville, TX 78520",
    liveSiteStatus: {
      tone: "ok",
      headline: "No field work yet — permit pending first review",
    },
    aiInsight:
      "Fresh submission with complete architectural set. Expect first-pass comments within 10 business days if queue holds steady.",
    lastInspectionDisplay: "Not applicable (pre-issuance)",
    permitExpiresDisplay: "Apr 1, 2027",
    contractor: "MedFit Commercial Interiors LLC",
    openViolationsDisplay: "0",
    permitDaysElapsed: 12,
    permitDaysTotal: 365,
    primaryCtaLabel: "Track review status",
    health_score: {
      composite: 68,
      bandLabel: "Stable",
      factors: [
        { id: "timeline", label: "Timeline & cycle health", score: 75, weight: 0.28 },
        { id: "review", label: "Cross-dept review coherence", score: 70, weight: 0.24 },
        { id: "documents", label: "Document completeness", score: 72, weight: 0.2 },
        {
          id: "inspection_readiness",
          label: "Inspection readiness",
          score: 55,
          weight: 0.16,
        },
        { id: "compliance", label: "Compliance & contractor standing", score: 68, weight: 0.12 },
      ],
      blockingReasons: ["Awaiting first building plan review assignment"],
      recommendedActions: [
        "Confirm medical gas drawings are sealed before fire desk intake",
        "Pre-notify clinic operations of any after-hours inspection windows",
      ],
    },
    journey: [
      { id: "intake", label: "Intake", status: "complete", detail: "Mar 18, 2026" },
      { id: "plan_review", label: "Plan review", status: "current", detail: "Day 4 in queue" },
      { id: "issuance", label: "Issuance", status: "upcoming" },
      { id: "inspections", label: "Inspections", status: "upcoming" },
    ],
    reviews: [
      { department: "Building", status: "Queued — not yet assigned", cycles: 1 },
      { department: "Fire prevention", status: "Awaiting building intake", cycles: 0 },
      { department: "Health (county advisory)", status: "Optional consult scheduled", cycles: 1 },
    ],
    inspections: [
      { type: "Above-ceiling / life safety", status: "Not scheduled", detail: "Post-issuance" },
      { type: "Final building", status: "Not scheduled", detail: "—" },
    ],
    documents: [
      { name: "TI architectural (ADA paths)", status: "Submitted", detail: "Mar 18, 2026" },
      { name: "Mechanical / med gas riser", status: "Submitted", detail: "Pending shop drawing seal" },
      { name: "Infection control narrative", status: "Draft on file", detail: "Applicant upload" },
    ],
  },

  "BP-0298": {
    id: "BP-0298",
    typeTag: "Commercial · warehouse expansion",
    projectName: "Resaca cold storage — Phase B shell",
    addressLine1: "2550 E 14th St",
    addressLine2: "Brownsville, TX 78521",
    liveSiteStatus: {
      tone: "warning",
      headline: "Active — slab on hold; last inspection slip 11 days",
    },
    aiInsight:
      "High permit valuation puts this on the intervention list. Steel is on site but slab sign-off missed two windows — prioritize a field supervisor visit this week.",
    lastInspectionDisplay: "Slab / rebar — failed Mar 12 (re-inspect pending)",
    permitExpiresDisplay: "Sep 30, 2026",
    contractor: "Laredo Structural Works",
    openViolationsDisplay: "1 stop-work (partial) · cover securement",
    permitDaysElapsed: 201,
    permitDaysTotal: 365,
    primaryCtaLabel: "Reschedule slab inspection",
    health_score: {
      composite: 44,
      bandLabel: "At risk",
      factors: [
        { id: "timeline", label: "Timeline & cycle health", score: 38, weight: 0.28 },
        { id: "review", label: "Cross-dept review coherence", score: 52, weight: 0.24 },
        { id: "documents", label: "Document completeness", score: 48, weight: 0.2 },
        {
          id: "inspection_readiness",
          label: "Inspection readiness",
          score: 35,
          weight: 0.16,
        },
        { id: "compliance", label: "Compliance & contractor standing", score: 50, weight: 0.12 },
      ],
      blockingReasons: [
        "Slab inspection not rebooked after failed visit",
        "Partial stop-work until OSHA documentation uploaded",
      ],
      recommendedActions: [
        "Upload corrected rebar placement photos + engineer letter",
        "Book re-inspection within 5 business days",
        "Brief warehouse tenant on revised concrete pour window",
      ],
    },
    journey: [
      { id: "intake", label: "Intake", status: "complete", detail: "Aug 2025" },
      { id: "plan_review", label: "Plan review", status: "complete", detail: "Cleared Oct 2025" },
      { id: "issuance", label: "Issuance", status: "complete", detail: "Nov 2025" },
      {
        id: "inspections",
        label: "Inspections",
        status: "current",
        detail: "Slab cycle · 2 attempts",
      },
      { id: "final", label: "Final / CO", status: "upcoming" },
    ],
    reviews: [
      { department: "Building", status: "Permit issued — field issues only", cycles: 2 },
      { department: "Fire", status: "Underground — cleared", cycles: 1 },
      { department: "Public works", status: "Cleared", cycles: 1 },
    ],
    inspections: [
      { type: "Slab / rebar", status: "Failed — re-inspect needed", detail: "Tie spacing + vapor barrier" },
      { type: "Structural steel", status: "On hold", detail: "Behind slab sign-off" },
      { type: "Fire sprinkler rough", status: "Not scheduled", detail: "—" },
    ],
    documents: [
      { name: "Geotech report (revised)", status: "Approved", detail: "Feb 2026" },
      { name: "Special inspection log", status: "Incomplete", detail: "Missing slab pour sign-off" },
      { name: "OSHA site safety acknowledgment", status: "Required upload", detail: "Hold item" },
    ],
  },

  "BP-0463": {
    id: "BP-0463",
    typeTag: "Residential · remodel",
    projectName: "Encanto Terrace — kitchen & load-bearing wall",
    addressLine1: "904 Los Ebanos Blvd",
    addressLine2: "Brownsville, TX 78521",
    liveSiteStatus: {
      tone: "critical",
      headline: "Work stoppage — contractor not registered with city",
    },
    aiInsight:
      "Owner-hired crew removed a load-bearing wall without an engineer letter on file. Compliance score is dragging the whole permit. Do not clear inspections until registration + structural review close.",
    lastInspectionDisplay: "Rough framing — red tag Mar 30, 2026",
    permitExpiresDisplay: "Jul 8, 2026",
    contractor: "Unregistered: “HandyNest” (no city registration #)",
    openViolationsDisplay: "3 active (structural, contractor, egress)",
    permitDaysElapsed: 312,
    permitDaysTotal: 365,
    primaryCtaLabel: "Hold work — compliance review",
    health_score: {
      composite: 18,
      bandLabel: "Critical",
      factors: [
        { id: "timeline", label: "Timeline & cycle health", score: 25, weight: 0.28 },
        { id: "review", label: "Cross-dept review coherence", score: 19, weight: 0.24 },
        { id: "documents", label: "Document completeness", score: 16, weight: 0.2 },
        {
          id: "inspection_readiness",
          label: "Inspection readiness",
          score: 13,
          weight: 0.16,
        },
        { id: "compliance", label: "Compliance & contractor standing", score: 9, weight: 0.12 },
      ],
      blockingReasons: [
        "Contractor not registered — all field work must stop",
        "Load-bearing wall alteration — no sealed structural letter",
        "Egress window in secondary bedroom not to code per inspection",
      ],
      recommendedActions: [
        "Issue formal stop-work until licensed GC registers",
        "Require engineer of record letter + revised plans",
        "Schedule re-inspection only after both are uploaded",
      ],
    },
    journey: [
      { id: "intake", label: "Intake", status: "complete", detail: "2025" },
      { id: "plan_review", label: "Plan review", status: "complete", detail: "Owner-drawn — waived peer" },
      { id: "issuance", label: "Issuance", status: "complete", detail: "Jan 2026" },
      {
        id: "inspections",
        label: "Inspections",
        status: "current",
        detail: "Red-tagged rough framing",
      },
      { id: "final", label: "Final / CO", status: "upcoming" },
    ],
    reviews: [
      { department: "Building", status: "Enforcement referral — contractor", cycles: 3 },
      { department: "Code enforcement", status: "Open case CE-2026-118", cycles: 1 },
    ],
    inspections: [
      { type: "Rough framing / structural", status: "Failed (red tag)", detail: "Mar 30, 2026" },
      { type: "Electrical rough", status: "Not authorized", detail: "Stop-work" },
      { type: "Final", status: "Not scheduled", detail: "—" },
    ],
    documents: [
      { name: "As-built framing photos", status: "Submitted", detail: "Shows removed wall" },
      { name: "Structural engineer letter", status: "Missing", detail: "Required" },
      { name: "Contractor registration", status: "Not on file", detail: "Blocker" },
    ],
  },

  "BP-0501": {
    id: "BP-0501",
    typeTag: "Commercial · restaurant renovation",
    projectName: "12th St Bistro — kitchen & patio",
    addressLine1: "801 E Elizabeth St",
    addressLine2: "Brownsville, TX 78520",
    liveSiteStatus: {
      tone: "ok",
      headline: "Post-issuance — equipment setting starts next week",
    },
    aiInsight:
      "Permit issued with zero open department holds. Hood suppression and grease interceptor already signed off on plan. Good candidate for a ‘green lane’ case study in monthly briefing.",
    lastInspectionDisplay: "Pre-opening walk-through (planning) — Apr 2, 2026",
    permitExpiresDisplay: "Mar 15, 2027",
    contractor: "Gulf Coast Restaurant Group (GC licensed)",
    openViolationsDisplay: "0",
    permitDaysElapsed: 88,
    permitDaysTotal: 365,
    primaryCtaLabel: "Open permit packet",
    health_score: {
      composite: 91,
      bandLabel: "Strong",
      factors: [
        { id: "timeline", label: "Timeline & cycle health", score: 92, weight: 0.28 },
        { id: "review", label: "Cross-dept review coherence", score: 90, weight: 0.24 },
        { id: "documents", label: "Document completeness", score: 95, weight: 0.2 },
        {
          id: "inspection_readiness",
          label: "Inspection readiness",
          score: 88,
          weight: 0.16,
        },
        { id: "compliance", label: "Compliance & contractor standing", score: 88, weight: 0.12 },
      ],
      blockingReasons: [],
      recommendedActions: [
        "Confirm final health inspection window with Cameron County",
        "Upload contractor COI renewal before May 1",
      ],
    },
    journey: [
      { id: "intake", label: "Intake", status: "complete", detail: "Jan 2026" },
      { id: "plan_review", label: "Plan review", status: "complete", detail: "Single cycle" },
      { id: "issuance", label: "Issuance", status: "complete", detail: "Mar 22, 2026 — issued" },
      {
        id: "inspections",
        label: "Inspections",
        status: "current",
        detail: "Rough MEP cleared · finishes next",
      },
      { id: "final", label: "Final / CO", status: "upcoming" },
    ],
    reviews: [
      { department: "Building", status: "Issued", cycles: 1 },
      { department: "Fire — hood / suppression", status: "Plan approved", cycles: 1 },
      { department: "Public health (plan review)", status: "Approved", cycles: 1 },
      { department: "Public works / grease", status: "Interceptor approved", cycles: 1 },
    ],
    inspections: [
      { type: "Rough MEP + hood", status: "Passed", detail: "Mar 10, 2026" },
      { type: "Health — interim", status: "Scheduled", detail: "Apr 18, 2026" },
      { type: "Final building + fire", status: "Not scheduled", detail: "—" },
    ],
    documents: [
      { name: "Architectural (kitchen layout)", status: "Approved", detail: "Issuance set" },
      { name: "Hood suppression shop drawings", status: "Approved", detail: "Feb 2026" },
      { name: "Grease interceptor sizing calc", status: "Approved", detail: "On file" },
    ],
  },
};

export function getPermitDetailRecord(
  permitDetailId: string,
): PermitDetailRecord | undefined {
  return PERMIT_DETAIL_BY_ID[permitDetailId];
}
