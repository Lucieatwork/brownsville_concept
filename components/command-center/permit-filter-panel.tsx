"use client";

import { usePermitFilters } from "@/components/command-center/permit-filter-context";
import { montserrat } from "@/lib/fonts";
import {
  COUNCIL_DISTRICTS,
  PERMIT_STAGES,
  PERMIT_STATUSES,
  PERMIT_TYPES,
  ZIP_CODES,
} from "@/lib/permit-filters";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";

/** Widest one-line label among placeholder + option strings — drives popover `min-width` in `ch`. */
const longestFilterTextChars = Math.max(
  ...PERMIT_TYPES.map((t) => t.length),
  "All permit types".length,
  ...PERMIT_STATUSES.map((t) => t.length),
  "All statuses".length,
  ...PERMIT_STAGES.map((t) => t.length),
  "All stages".length,
  "All districts".length,
);

/**
 * Extra `ch` beyond longest text for select padding (`pl-2.5` + `pr-10`) and custom chevron.
 * Keeps the box wide enough even when the browser sizes the closed select to a short placeholder.
 */
const filterPopoverMinCh = longestFilterTextChars + 6;

/**
 * Native `<select>` arrows ignore horizontal padding in most browsers, so we strip the system
 * chrome (`appearance-none`) and draw our own chevron inset from the right edge.
 */
const selectClassName =
  "w-full cursor-pointer rounded-lg border border-white/15 bg-black/25 py-2 pl-2.5 pr-10 text-xs text-white appearance-none focus:border-white/35 focus:outline-none focus:ring-1 focus:ring-white/25";

function SelectChevron() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * Wraps `<select>` with a positioned chevron so right spacing is reliable across browsers.
 */
const FacetedSelect = forwardRef<
  HTMLSelectElement,
  ComponentPropsWithoutRef<"select">
>(function FacetedSelect({ className, ...props }, ref) {
  const merged = className
    ? `${selectClassName} ${className}`.trim()
    : selectClassName;
  return (
    <div className="relative mt-0.5 isolate w-full min-w-0">
      <select ref={ref} className={merged} {...props} />
      {/* Inset from the box edge so the arrow matches the visual balance of `pl-2.5` on the left */}
      <span
        className="pointer-events-none absolute inset-y-0 right-3 z-[1] flex w-4 items-center justify-center text-white/85"
        aria-hidden
      >
        <SelectChevron />
      </span>
    </div>
  );
});
FacetedSelect.displayName = "FacetedSelect";

/** Search bar in the top row — same height and glass treatment as the Filters chip. */
const searchBarClassName =
  "h-10 w-full min-w-0 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] px-3 text-xs text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md placeholder:text-[var(--text-muted)] focus:border-white/35 focus:outline-none focus:ring-1 focus:ring-white/25";

/** Simple funnel icon — reads as “filters” without adding an icon package. */
function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 5h18M6 12h12M10 19h4" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * Search stays always visible next to an icon-only filter control; dropdown facets open in a popover.
 */
export function PermitFilterPanel() {
  const rootRef = useRef<HTMLDivElement>(null);
  const statusSelectRef = useRef<HTMLSelectElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const popoverId = useId();
  const searchId = useId();
  const statusId = useId();
  const typeId = useId();
  const districtId = useId();
  const stageId = useId();

  const {
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
    clearFacetFilters,
    visibleSiteCount,
  } = usePermitFilters();

  const hasActiveFacets =
    statusFilter !== "" ||
    permitTypeFilter !== "" ||
    districtFilter !== "" ||
    stageFilter !== "";

  const activeFacetCount = [
    statusFilter !== "",
    permitTypeFilter !== "",
    districtFilter !== "",
    stageFilter !== "",
  ].filter(Boolean).length;

  const close = useCallback(() => setIsOpen(false), []);

  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  /* Click outside closes the popover (capture phase so it runs before map drag handlers). */
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  /* When the popover opens, focus the first dropdown so keyboard users start in the panel. */
  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      statusSelectRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className={`flex w-full items-center gap-2 ${montserrat.className}`}
    >
      <div className="min-w-0 flex-1">
        <label htmlFor={searchId} className="sr-only">
          Search permits by number, site name, or address
        </label>
        <input
          id={searchId}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search permits…"
          autoComplete="off"
          className={searchBarClassName}
        />
      </div>

      {/* `relative` only on this wrapper so the popover’s `top-full` sits under the icon, not the search field. */}
      <div className="relative z-[30] shrink-0">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={popoverId}
          aria-haspopup="dialog"
          aria-label={
            activeFacetCount > 0
              ? `Open filters (${activeFacetCount} active)`
              : "Open filters"
          }
          onClick={toggle}
          className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
        >
          <FilterIcon className="text-white opacity-90" />
          {activeFacetCount > 0 ? (
            <span
              className="absolute -right-1 -top-1 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold leading-none text-white"
              aria-hidden
            >
              {activeFacetCount}
            </span>
          ) : null}
        </button>

        {isOpen ? (
          <div
            id={popoverId}
            role="dialog"
            aria-label="Filter permits on the map"
            style={{
              minWidth: `min(100%, ${filterPopoverMinCh}ch)`,
            }}
            className="absolute left-0 top-full z-[30] mt-2 flex max-h-[min(70vh,calc(100vh-6rem))] w-max min-w-0 max-w-[calc(100vw-2rem)] flex-col overflow-y-auto overflow-x-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] px-2.5 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md [scrollbar-width:thin]"
          >
          <div className="flex min-w-0 items-start justify-between gap-2 border-b border-white/10 pb-1.5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white">
                Filters
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-white">
                {visibleSiteCount} site{visibleSiteCount === 1 ? "" : "s"} on map
              </p>
            </div>
            <div className="flex shrink-0 items-start gap-1">
              {hasActiveFacets ? (
                <button
                  type="button"
                  onClick={clearFacetFilters}
                  className="rounded-md px-2 py-1.5 text-[10px] font-semibold text-white underline-offset-2 transition-colors hover:bg-white/15 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                >
                  Clear filters
                </button>
              ) : null}
              <button
                type="button"
                onClick={close}
                aria-label="Close filter panel"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className="mt-1.5 min-w-0 w-full">
            <label
              htmlFor={statusId}
              className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]"
            >
              Status
            </label>
            <FacetedSelect
              ref={statusSelectRef}
              id={statusId}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value === ""
                    ? ""
                    : (e.target.value as (typeof PERMIT_STATUSES)[number]),
                )
              }
            >
              <option value="">All statuses</option>
              {PERMIT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </FacetedSelect>
          </div>

          <div className="mt-1.5 min-w-0 w-full">
            <label
              htmlFor={typeId}
              className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]"
            >
              Permit type
            </label>
            <FacetedSelect
              id={typeId}
              value={permitTypeFilter}
              onChange={(e) =>
                setPermitTypeFilter(
                  e.target.value === ""
                    ? ""
                    : (e.target.value as (typeof PERMIT_TYPES)[number]),
                )
              }
            >
              <option value="">All permit types</option>
              {PERMIT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </FacetedSelect>
          </div>

          <div className="mt-1.5 min-w-0 w-full">
            <label
              htmlFor={districtId}
              className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]"
            >
              District
            </label>
            <FacetedSelect
              id={districtId}
              value={districtFilter}
              onChange={(e) => setDistrictFilterFromSelect(e.target.value)}
            >
              <option value="">All districts</option>
              <optgroup label="By zip code">
                {ZIP_CODES.map((z) => (
                  <option key={z} value={`zip:${z}`}>
                    {z}
                  </option>
                ))}
              </optgroup>
              <optgroup label="By council district">
                {COUNCIL_DISTRICTS.map((d) => (
                  <option key={d} value={`council:${d}`}>
                    District {d}
                  </option>
                ))}
              </optgroup>
            </FacetedSelect>
          </div>

          <div className="mt-1.5 min-w-0 w-full pb-0.5">
            <label
              htmlFor={stageId}
              className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]"
            >
              Stage
            </label>
            <FacetedSelect
              id={stageId}
              value={stageFilter}
              onChange={(e) =>
                setStageFilter(
                  e.target.value === ""
                    ? ""
                    : (e.target.value as (typeof PERMIT_STAGES)[number]),
                )
              }
            >
              <option value="">All stages</option>
              {PERMIT_STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </FacetedSelect>
          </div>
        </div>
        ) : null}
      </div>
    </div>
  );
}
