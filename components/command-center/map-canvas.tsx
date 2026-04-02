"use client";

import { MapManualPanSurface } from "@/components/command-center/map-manual-pan-surface";
import Image from "next/image";
import { useCallback, useState } from "react";

type MapCanvasProps = {
  /** Heat blobs, vignettes, etc. sit above the map image. */
  children?: React.ReactNode;
};

/**
 * Full-bleed background: PRD map asset `/brownsville_map.png`, or a neutral
 * placeholder if the file is not in `public/` yet (no silent failure in UI).
 */
export function MapCanvas({ children }: MapCanvasProps) {
  const [mapLoadFailed, setMapLoadFailed] = useState(false);

  const handleImageError = useCallback(() => {
    setMapLoadFailed(true);
  }, []);

  return (
    <div className="absolute inset-0 bg-[var(--shell-bg)]">
      {/* Base tone when the map is missing or still loading */}
      <div
        className="absolute inset-0 bg-[var(--map-fallback-bg)]"
        aria-hidden
      />

      {!mapLoadFailed ? (
        <div className="absolute inset-0">
          <Image
            src="/brownsville_map.png"
            alt=""
            fill
            className="object-cover opacity-[0.92]"
            sizes="100vw"
            priority
            /* Serves `/brownsville_map.png` directly; avoids `/_next/image?...` if the optimizer misbehaves in your environment. */
            unoptimized
            onError={handleImageError}
          />
        </div>
      ) : (
        <MapFallback />
      )}

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

/** Visible when `public/brownsville_map.png` is absent — still feels like a map surface. */
function MapFallback() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0d1118] via-[#080a10] to-[#121820] px-6 text-center"
      role="img"
      aria-label="Map placeholder: add brownsville_map.png to public folder"
    >
      <div
        className="h-px w-48 bg-[var(--border-subtle)] opacity-60"
        aria-hidden
      />
      <p className="max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">
        Drop your map file at{" "}
        <span className="font-mono text-[var(--text-secondary)]">
          public/brownsville_map.png
        </span>{" "}
        for the full-bleed background.
      </p>
    </div>
  );
}
