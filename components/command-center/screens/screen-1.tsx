import { CommandCenterTopBar } from "@/components/command-center/command-center-top-bar";
import { HeatLayer } from "@/components/command-center/heat-layer";
import { InactiveSiteMarkers } from "@/components/command-center/inactive-site-markers";
import { MapChromeBoundsProvider } from "@/components/command-center/map-chrome-bounds-context";
import { MapKpiLayer } from "@/components/command-center/map-kpi-layer";
import { MapZoomProvider } from "@/components/command-center/map-zoom-context";
import { MapCanvas } from "@/components/command-center/map-canvas";
import { PermitFilterProvider } from "@/components/command-center/permit-filter-context";
import { CITY_MAP_METRICS } from "@/lib/city-map-metrics";
import { INACTIVE_SITES } from "@/lib/inactive-sites";

/**
 * Screen 1 — Instant read (PRD): full-bleed map, search & filters top-left, AI + chat top-right.
 */
export function Screen1() {
  const aiSummary = `${CITY_MAP_METRICS.inactiveSiteCount} inactive construction sites • ${CITY_MAP_METRICS.activeRiskAlerts} safety risks detected as of 12/4/2026 10:05 am`;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--shell-bg)] text-white">
      <PermitFilterProvider allSites={INACTIVE_SITES}>
        <MapChromeBoundsProvider>
          <MapZoomProvider>
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
