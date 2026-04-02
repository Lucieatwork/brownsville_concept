"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

/**
 * Refs to fixed viewport chrome used when auto-panning the map so the permit
 * card does not sit under search, AI panels, or KPI controls.
 */
export type MapChromeBoundsContextValue = {
  topBarRef: RefObject<HTMLDivElement | null>;
  leftStackRef: RefObject<HTMLDivElement | null>;
  rightStackRef: RefObject<HTMLDivElement | null>;
  kpiStripRef: RefObject<HTMLDivElement | null>;
  fabStackRef: RefObject<HTMLDivElement | null>;
};

const MapChromeBoundsContext =
  createContext<MapChromeBoundsContextValue | null>(null);

export function MapChromeBoundsProvider({ children }: { children: ReactNode }) {
  const topBarRef = useRef<HTMLDivElement>(null);
  const leftStackRef = useRef<HTMLDivElement>(null);
  const rightStackRef = useRef<HTMLDivElement>(null);
  const kpiStripRef = useRef<HTMLDivElement>(null);
  const fabStackRef = useRef<HTMLDivElement>(null);

  const value = useMemo(
    (): MapChromeBoundsContextValue => ({
      topBarRef,
      leftStackRef,
      rightStackRef,
      kpiStripRef,
      fabStackRef,
    }),
    [],
  );

  return (
    <MapChromeBoundsContext.Provider value={value}>
      {children}
    </MapChromeBoundsContext.Provider>
  );
}

/** Used on screen 1 only; returns null elsewhere so shared components stay optional. */
export function useMapChromeBoundsOptional() {
  return useContext(MapChromeBoundsContext);
}
