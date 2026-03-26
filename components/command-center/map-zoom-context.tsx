"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

/** How much the map grows when “focused” on the permit card (tweak for stronger/weaker zoom). */
const MAP_FOCUS_ZOOM = 1.65;

type MapZoomContextValue = {
  /** The box we measure against so the zoom origin matches the visible map. */
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  isZoomed: boolean;
  /** First click: zoom so the card sits in focus; second click: return to full map. */
  toggleZoomFromCard: (cardElement: HTMLElement | null) => void;
  /** Call when the permit card closes so the map does not stay zoomed with no card. */
  resetZoom: () => void;
};

const MapZoomContext = createContext<MapZoomContextValue | null>(null);

export function MapZoomProvider({ children }: { children: React.ReactNode }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("50% 50%");

  const focusOnElement = useCallback((element: HTMLElement) => {
    const mapEl = mapContainerRef.current;
    if (!mapEl) return;
    const mapRect = mapEl.getBoundingClientRect();
    const elRect = element.getBoundingClientRect();
    /*
     * Horizontal: center of the card — zoom feels balanced left/right.
     * Vertical: **top** of the card, not the center — if the origin were the
     * midpoint, scaling would pull the top edge **up** and the card would grow
     * into the fixed AI brief strip. Anchoring the top edge keeps the card
     * below that band while it scales down and to the sides.
     */
    const cxPercent =
      ((elRect.left + elRect.width / 2 - mapRect.left) / mapRect.width) * 100;
    const cyPercent =
      ((elRect.top - mapRect.top) / mapRect.height) * 100;
    setTransformOrigin(`${cxPercent}% ${cyPercent}%`);
    setIsZoomed(true);
  }, []);

  const resetZoom = useCallback(() => {
    setIsZoomed(false);
  }, []);

  const toggleZoomFromCard = useCallback(
    (cardElement: HTMLElement | null) => {
      if (isZoomed) {
        resetZoom();
        return;
      }
      if (cardElement) {
        focusOnElement(cardElement);
      }
    },
    [isZoomed, focusOnElement, resetZoom],
  );

  const value = useMemo(
    () => ({
      mapContainerRef,
      isZoomed,
      toggleZoomFromCard,
      resetZoom,
    }),
    [isZoomed, toggleZoomFromCard, resetZoom],
  );

  return (
    <MapZoomContext.Provider value={value}>
      {/* Clips the scaled map so it does not spill past the screen edge. */}
      <div ref={mapContainerRef} className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 will-change-transform transition-transform duration-500 ease-out"
          style={{
            transformOrigin,
            transform: isZoomed ? `scale(${MAP_FOCUS_ZOOM})` : "scale(1)",
          }}
        >
          {children}
        </div>
      </div>
    </MapZoomContext.Provider>
  );
}

/** Use inside `MapZoomProvider` (e.g. command center screen). Returns null if the card renders elsewhere. */
export function useMapZoomOptional() {
  return useContext(MapZoomContext);
}
