"use client";

import { useMapZoomOptional } from "@/components/command-center/map-zoom-context";

/**
 * Invisible layer above the basemap and heat, below site pins: click-drag pans the map.
 * Pins and the permit card stay interactive because they sit higher in the z-order.
 */
export function MapManualPanSurface() {
  const map = useMapZoomOptional();
  if (!map) return null;

  return (
    <div
      className="absolute inset-0 z-[4] cursor-grab touch-none active:cursor-grabbing motion-reduce:cursor-default"
      style={{ touchAction: "none" }}
      aria-label="Drag to pan the map"
      {...map.manualPanHandlers}
    />
  );
}
