import { CommandCenterTopBar } from "@/components/command-center/command-center-top-bar";
import { HeatLayer } from "@/components/command-center/heat-layer";
import { InactiveSiteMarkers } from "@/components/command-center/inactive-site-markers";
import { MapChromeBoundsProvider } from "@/components/command-center/map-chrome-bounds-context";
import { MapKpiLayer } from "@/components/command-center/map-kpi-layer";
import { MapZoomProvider } from "@/components/command-center/map-zoom-context";
import { MapBasemapSlot, MapCanvas } from "@/components/command-center/map-canvas";
import { PermitFilterProvider } from "@/components/command-center/permit-filter-context";
import { CITY_MAP_METRICS } from "@/lib/city-map-metrics";
import { INACTIVE_SITES } from "@/lib/inactive-sites";

/**
 * Screen 1 — Instant read (PRD): full-bleed map, search & filters top-left, AI + chat top-right.
 */
export function Screen1() {
  const aiSummary = {
    updatedAtLabel: "As of Apr 6, 2026 · 10:05 AM",
    headline: `${CITY_MAP_METRICS.inactiveSiteCount} inactive construction sites detected — ${CITY_MAP_METRICS.activeRiskAlerts} carry active safety risks`,
    metrics: [
      { value: String(CITY_MAP_METRICS.activeRiskAlerts), label: "Safety risks", tone: "risk" as const },
      { value: String(CITY_MAP_METRICS.inactiveSiteCount), label: "Inactive sites", tone: "warning" as const },
      { value: "22", label: "On track", tone: "ok" as const },
    ],
    highlights: [
      {
        permitId: "BP-0441",
        text: "Plan review 43 days over target. Fire marshal cycle 4 unresolved.",
        tone: "risk" as const,
      },
      {
        permitId: "BP-0463",
        text: "Work stoppage. Unregistered contractor + 3 active violations.",
        tone: "risk" as const,
      },
      {
        permitId: "BP-0298",
        text: "Slab inspection failed Mar 12. Re-inspect window still open.",
        tone: "warning" as const,
      },
      {
        permitId: "BP-0512",
        text: "New submission. First review comments expected within 10 business days.",
        tone: "info" as const,
      },
    ],
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--shell-bg)] text-white">
      <PermitFilterProvider allSites={INACTIVE_SITES}>
        <MapChromeBoundsProvider>
          <MapZoomProvider basemap={<MapBasemapSlot />}>
            <MapCanvas>
              <HeatLayer />
              <MapKpiLayer />
              <InactiveSiteMarkers />
            </MapCanvas>
          </MapZoomProvider>

          <CommandCenterTopBar summary={aiSummary} />
        </MapChromeBoundsProvider>
      </PermitFilterProvider>
    </div>
  );
}
