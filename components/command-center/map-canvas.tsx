"use client";

import { MapboxBasemap } from "@/components/command-center/mapbox-basemap";
import { MapManualPanSurface } from "@/components/command-center/map-manual-pan-surface";

type MapCanvasProps = {
  /** Heat blobs, KPI pins, etc. sit above the basemap (basemap is passed to `MapZoomProvider`). */
  children?: React.ReactNode;
};

/**
 * Map + token message for `MapZoomProvider`’s `basemap` slot — kept **outside** the scaled
 * overlay layer so Mapbox WebGL is not affected by the permit-card `scale()` transform.
 */
export function MapBasemapSlot() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

  return (
    <>
      {/* Base tone while WebGL initializes */}
      <div
        className="absolute inset-0 bg-[var(--map-fallback-bg)]"
        aria-hidden
      />
      {mapboxToken ? (
        <MapboxBasemap accessToken={mapboxToken} />
      ) : (
        <MapboxTokenMissing />
      )}
    </>
  );
}

/**
 * Overlays only: vignette, drag surface, heat, pins. Pair with `basemap={<MapBasemapSlot />}` on
 * `MapZoomProvider`. Token: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in `.env.local`.
 */
export function MapCanvas({ children }: MapCanvasProps) {
  return (
    <div className="absolute inset-0">
      {/* Slight darken so overlays (heat) read more clearly */}
      <div
        className="pointer-events-none absolute inset-0 bg-black/25"
        aria-hidden
      />

      {/* Only active when wrapped in MapZoomProvider (screen 1). */}
      <MapManualPanSurface />

      {children}
    </div>
  );
}

/** Shown when the public Mapbox token env var is not set — avoids a silent blank map. */
function MapboxTokenMissing() {
  return (
    <div
      className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0d1118] via-[#080a10] to-[#121820] px-6 text-center"
      role="status"
      aria-label="Mapbox token required"
    >
      <div
        className="h-px w-48 bg-white/10 opacity-80"
        aria-hidden
      />
      <p className="max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">
        Add your Mapbox public token to{" "}
        <span className="font-mono text-[var(--text-secondary)]">
          NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        </span>{" "}
        in <span className="font-mono text-[var(--text-secondary)]">.env.local</span>{" "}
        (restart <span className="font-mono text-[var(--text-secondary)]">npm run dev</span>{" "}
        after saving).
      </p>
    </div>
  );
}
