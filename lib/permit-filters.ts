/**
 * Shared permit filter enums and option lists for the command center map.
 * Values match the product filter UI; each inactive site carries one value per dimension (mock data).
 */

export const PERMIT_STATUSES = [
  "Submitted",
  "Pending",
  "Approved",
  "Expired",
] as const;

export type PermitStatus = (typeof PERMIT_STATUSES)[number];

export const PERMIT_TYPES = [
  "New Residential Construction",
  "New Commercial Construction",
  "Residential Remodel / Renovation",
  "Commercial Remodel / Renovation",
  "Addition / Expansion",
  "Demolition",
] as const;

export type PermitType = (typeof PERMIT_TYPES)[number];

export const ZIP_CODES = ["78520", "78521", "78526"] as const;

export type PermitZipCode = (typeof ZIP_CODES)[number];

export const COUNCIL_DISTRICTS = [1, 2, 3, 4] as const;

export type CouncilDistrict = (typeof COUNCIL_DISTRICTS)[number];

export const PERMIT_STAGES = [
  "Intake",
  "Review",
  "Issuance",
  "Inspections",
  "Complete",
] as const;

export type PermitStage = (typeof PERMIT_STAGES)[number];
