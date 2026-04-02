"use client";

import type { InactiveSite } from "@/lib/inactive-sites";
import type {
  CouncilDistrict,
  PermitStage,
  PermitStatus,
  PermitType,
  PermitZipCode,
} from "@/lib/permit-filters";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Serialized `<select>` value for the combined district control (`zip:…` vs `council:…`). */
export type DistrictDropdownValue =
  | ""
  | `zip:${PermitZipCode}`
  | `council:${CouncilDistrict}`;

type PermitFilterContextValue = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: PermitStatus | "";
  setStatusFilter: (value: PermitStatus | "") => void;
  permitTypeFilter: PermitType | "";
  setPermitTypeFilter: (value: PermitType | "") => void;
  districtFilter: DistrictDropdownValue;
  /** Use this from `<select onChange>` — parses `zip:…` / `council:…` / empty. */
  setDistrictFilterFromSelect: (raw: string) => void;
  stageFilter: PermitStage | "";
  setStageFilter: (value: PermitStage | "") => void;
  /** Resets search plus every dropdown (full reset). */
  clearAllFilters: () => void;
  /** Resets only status / type / district / stage — leaves search text as-is. */
  clearFacetFilters: () => void;
  /** True when this site should stay visible on the map (search + facet filters). */
  siteMatchesFilters: (site: InactiveSite) => boolean;
  /** Count of sites currently visible after filters (for the demo UI). */
  visibleSiteCount: number;
};

const PermitFilterContext = createContext<PermitFilterContextValue | null>(
  null,
);

const ZIP_PREFIX = "zip:" as const;
const COUNCIL_PREFIX = "council:" as const;

function parseDistrictFromSelect(raw: string): DistrictDropdownValue {
  if (raw === "") return "";
  if (raw.startsWith(ZIP_PREFIX) || raw.startsWith(COUNCIL_PREFIX)) {
    return raw as DistrictDropdownValue;
  }
  return "";
}

function matchesDistrict(site: InactiveSite, value: DistrictDropdownValue): boolean {
  if (value === "") return true;
  if (value.startsWith(ZIP_PREFIX)) {
    const zip = value.slice(ZIP_PREFIX.length) as PermitZipCode;
    return site.zipCode === zip;
  }
  if (value.startsWith(COUNCIL_PREFIX)) {
    const n = Number(value.slice(COUNCIL_PREFIX.length)) as CouncilDistrict;
    return site.councilDistrict === n;
  }
  return true;
}

function matchesSearch(site: InactiveSite, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  const haystack =
    `${site.permitNumber} ${site.siteName} ${site.addressSummary}`.toLowerCase();
  return haystack.includes(trimmed);
}

/**
 * Holds search text and dropdown selections for the map. Empty string on a dropdown means “any”
 * for that dimension; search is substring match on permit #, site name, and address line.
 */
export function PermitFilterProvider({
  children,
  allSites,
}: {
  children: ReactNode;
  allSites: readonly InactiveSite[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PermitStatus | "">("");
  const [permitTypeFilter, setPermitTypeFilter] = useState<PermitType | "">(
    "",
  );
  const [districtFilter, setDistrictFilter] =
    useState<DistrictDropdownValue>("");
  const [stageFilter, setStageFilter] = useState<PermitStage | "">("");

  const setDistrictFilterFromSelect = useCallback((raw: string) => {
    setDistrictFilter(parseDistrictFromSelect(raw));
  }, []);

  const siteMatchesFilters = useCallback(
    (site: InactiveSite): boolean => {
      if (!matchesSearch(site, searchQuery)) return false;
      if (statusFilter !== "" && site.status !== statusFilter) return false;
      if (permitTypeFilter !== "" && site.permitType !== permitTypeFilter)
        return false;
      if (!matchesDistrict(site, districtFilter)) return false;
      if (stageFilter !== "" && site.stage !== stageFilter) return false;
      return true;
    },
    [districtFilter, permitTypeFilter, searchQuery, stageFilter, statusFilter],
  );

  const visibleSiteCount = useMemo(
    () => allSites.filter(siteMatchesFilters).length,
    [allSites, siteMatchesFilters],
  );

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("");
    setPermitTypeFilter("");
    setDistrictFilter("");
    setStageFilter("");
  }, []);

  const clearFacetFilters = useCallback(() => {
    setStatusFilter("");
    setPermitTypeFilter("");
    setDistrictFilter("");
    setStageFilter("");
  }, []);

  const value = useMemo(
    (): PermitFilterContextValue => ({
      searchQuery,
      setSearchQuery,
      statusFilter,
      setStatusFilter,
      permitTypeFilter,
      setPermitTypeFilter,
      districtFilter,
      setDistrictFilterFromSelect,
      stageFilter,
      setStageFilter,
      clearAllFilters,
      clearFacetFilters,
      siteMatchesFilters,
      visibleSiteCount,
    }),
    [
      clearAllFilters,
      clearFacetFilters,
      districtFilter,
      permitTypeFilter,
      searchQuery,
      setDistrictFilterFromSelect,
      siteMatchesFilters,
      stageFilter,
      statusFilter,
      visibleSiteCount,
    ],
  );

  return (
    <PermitFilterContext.Provider value={value}>
      {children}
    </PermitFilterContext.Provider>
  );
}

export function usePermitFilters(): PermitFilterContextValue {
  const ctx = useContext(PermitFilterContext);
  if (!ctx) {
    throw new Error("usePermitFilters must be used within PermitFilterProvider");
  }
  return ctx;
}

/** For map layers that may render outside the provider — falls back to showing every site. */
export function usePermitFiltersOptional(): PermitFilterContextValue | null {
  return useContext(PermitFilterContext);
}
