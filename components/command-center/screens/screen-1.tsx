import { CommandCenterTopBar } from "@/components/command-center/command-center-top-bar";
import { HeatLayer } from "@/components/command-center/heat-layer";
import { InactiveSiteMarkers } from "@/components/command-center/inactive-site-markers";
import { MapKpiLayer } from "@/components/command-center/map-kpi-layer";
import { MapZoomProvider } from "@/components/command-center/map-zoom-context";
import { MapCanvas } from "@/components/command-center/map-canvas";
import { CITY_MAP_METRICS } from "@/lib/city-map-metrics";

/**
 * Screen 1 — Instant read (PRD): full-bleed map, AI chip top-left, heat obvious, minimal chrome.
 */
export function Screen1() {
  const aiSummary = `${CITY_MAP_METRICS.inactiveSiteCount} inactive construction sites • ${CITY_MAP_METRICS.activeRiskAlerts} safety risks detected as of 12/4/2026 10:05 am`;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--shell-bg)] text-white">
      <MapZoomProvider>
        <MapCanvas>
          <HeatLayer />
          <MapKpiLayer />
          <InactiveSiteMarkers />
        </MapCanvas>
      </MapZoomProvider>

      <CommandCenterTopBar summary={aiSummary} />
    </div>
  );
}
