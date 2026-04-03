"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";

/**
 * Hosted style URL for “Brownsville Smart City - Night” (Mapbox Studio).
 * The exported `style.json` under `public/Brownsville-Smart-City-Night(...)/` is a reference
 * copy; the app loads the live style from Mapbox so tiles, fonts, and Standard basemap resolve.
 */
const MAP_STYLE_URL = "mapbox://styles/lucie-c/cmn7iurvc004f01s7guux2lu1";

/** Initial camera — matches your Studio export (center / zoom / pitch / bearing). */
const INITIAL_VIEW = {
  center: [-97.4975, 25.9017] as [number, number],
  zoom: 14.5,
  pitch: 60,
  bearing: -15,
};

type MapboxBasemapProps = {
  /** Public token from Mapbox Account → Tokens. Never commit real tokens to git. */
  accessToken: string;
};

/**
 * Non-interactive Mapbox GL map: pan/zoom still come from the command-center CSS layer
 * (`MapZoomProvider` + drag surface), same as the old static PNG.
 */
export function MapboxBasemap({ accessToken }: MapboxBasemapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setLoadError(null);
    const el = containerRef.current;
    if (!el) return;

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: el,
      style: MAP_STYLE_URL,
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      /* Let the app’s overlay handle drag; this is only the painted basemap. */
      interactive: false,
      attributionControl: true,
    });

    const onError = (e: { error?: Error }) => {
      const message = e.error?.message ?? "Map failed to load";
      setLoadError(message);
    };
    map.on("error", onError);

    /* First layout tick after style load — avoids a 0×0 canvas when parents are still settling. */
    const onLoad = () => {
      map.resize();
      requestAnimationFrame(() => {
        map.resize();
      });
    };
    map.once("load", onLoad);

    /* Keep the WebGL canvas sized when the layout (or window) changes. */
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
      map.off("load", onLoad);
      map.off("error", onError);
      map.remove();
    };
  }, [accessToken]);

  return (
    <div className="absolute inset-0">
      {/*
        Opacity on the map container can break WebGL compositing in some browsers; the command
        center already dims the scene with `bg-black/25` above the basemap slot.
      */}
      <div ref={containerRef} className="absolute inset-0 h-full w-full" aria-hidden />
      {loadError ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--map-fallback-bg)] px-6 text-center"
          role="alert"
        >
          <p className="max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
            Mapbox could not load the style. Check the browser network tab and your token
            scopes, then confirm the style URL is still published in Mapbox Studio.
          </p>
          <p className="font-mono text-xs text-[var(--text-secondary)]">{loadError}</p>
        </div>
      ) : null}
    </div>
  );
}
