"use client";

import type { MapChromeBoundsContextValue } from "@/components/command-center/map-chrome-bounds-context";
import { useMapChromeBoundsOptional } from "@/components/command-center/map-chrome-bounds-context";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/** How much the map grows when “focused” on the permit card (tweak for stronger/weaker zoom). */
const MAP_FOCUS_ZOOM = 1.65;

/** Space between permit card and fixed chrome when auto-panning. */
const CHROME_CLEAR_MARGIN_PX = 10;

/** Limit how far the map can slide so the basemap never feels “lost” on small screens. */
const MAX_PAN_DRIFT_RATIO = 0.22;

/**
 * Pan transition should match the permit card’s motion (`inactive-site-markers.tsx`
 * PERMIT_CARD_TRANSITION_MS) so the map and card feel like one gesture, not two speeds.
 */
export const MAP_PAN_TRANSITION_MS = 1000;

/** Ignore sub-pixel pan tweaks so CSS transitions are not restarted every frame. */
const PAN_EPSILON_PX = 0.75;

type ObstacleEdge = "top" | "bottom" | "left" | "right";

function unionDomRect(a: DOMRectReadOnly, b: DOMRectReadOnly): DOMRect {
  const left = Math.min(a.left, b.left);
  const top = Math.min(a.top, b.top);
  const right = Math.max(a.right, b.right);
  const bottom = Math.max(a.bottom, b.bottom);
  return new DOMRect(left, top, right - left, bottom - top);
}

function rectsOverlap(a: DOMRectReadOnly, b: DOMRectReadOnly): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function collectChromeZones(
  chrome: MapChromeBoundsContextValue | null,
): Array<{ rect: DOMRectReadOnly; edge: ObstacleEdge }> {
  if (!chrome) return [];
  const out: Array<{ rect: DOMRectReadOnly; edge: ObstacleEdge }> = [];

  const top = chrome.topBarRef.current?.getBoundingClientRect();
  if (top && top.width >= 1 && top.height >= 1) {
    out.push({ rect: top, edge: "top" });
  }

  const left = chrome.leftStackRef.current?.getBoundingClientRect();
  if (left && left.width >= 1 && left.height >= 1) {
    out.push({ rect: left, edge: "left" });
  }

  const right = chrome.rightStackRef.current?.getBoundingClientRect();
  if (right && right.width >= 1 && right.height >= 1) {
    out.push({ rect: right, edge: "right" });
  }

  const k = chrome.kpiStripRef.current?.getBoundingClientRect();
  const f = chrome.fabStackRef.current?.getBoundingClientRect();
  let bottom: DOMRectReadOnly | undefined;
  if (
    k &&
    f &&
    k.width >= 1 &&
    k.height >= 1 &&
    f.width >= 1 &&
    f.height >= 1
  ) {
    bottom = unionDomRect(k, f);
  } else if (k && k.width >= 1 && k.height >= 1) {
    bottom = k;
  } else if (f && f.width >= 1 && f.height >= 1) {
    bottom = f;
  }
  if (bottom) {
    out.push({ rect: bottom, edge: "bottom" });
  }

  return out;
}

/**
 * How far to nudge the map (in screen pixels) so the card clears overlapping chrome.
 * Uses axis-aligned constraints per edge; prefers zero movement when already clear.
 */
function computePanDelta(
  card: DOMRectReadOnly,
  zones: Array<{ rect: DOMRectReadOnly; edge: ObstacleEdge }>,
  margin: number,
): { dx: number; dy: number } {
  const BIG = 1e6;
  let dxMin = -BIG;
  let dxMax = BIG;
  let dyMin = -BIG;
  let dyMax = BIG;

  for (const z of zones) {
    if (!rectsOverlap(card, z.rect)) continue;
    const o = z.rect;
    switch (z.edge) {
      case "top":
        dyMin = Math.max(dyMin, o.bottom + margin - card.top);
        break;
      case "bottom":
        dyMax = Math.min(dyMax, o.top - margin - card.bottom);
        break;
      case "left":
        dxMin = Math.max(dxMin, o.right + margin - card.left);
        break;
      case "right":
        dxMax = Math.min(dxMax, o.left - margin - card.right);
        break;
    }
  }

  const pick = (lo: number, hi: number) => {
    if (lo <= 0 && hi >= 0) return 0;
    if (lo > hi) return (lo + hi) / 2;
    if (lo > 0) return lo;
    return hi;
  };

  return { dx: pick(dxMin, dxMax), dy: pick(dyMin, dyMax) };
}

function getMaxPanDriftPx(): { maxX: number; maxY: number } {
  if (typeof window === "undefined") {
    return { maxX: 320, maxY: 320 };
  }
  return {
    maxX: window.innerWidth * MAX_PAN_DRIFT_RATIO,
    maxY: window.innerHeight * MAX_PAN_DRIFT_RATIO,
  };
}

/** Spread onto the transparent hit layer in `MapManualPanSurface` (below pins, above heat). */
export type MapManualPanPointerHandlers = {
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onLostPointerCapture: (e: ReactPointerEvent<HTMLDivElement>) => void;
};

type MapZoomContextValue = {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  isZoomed: boolean;
  toggleZoomFromCard: (cardElement: HTMLElement | null) => void;
  resetZoom: () => void;
  /**
   * Clears **auto** pan (permit-card avoidance). Manual drag offset is kept so the user
   * does not lose their framing when the card closes.
   */
  resetPan: () => void;
  /**
   * Repositions the map so the permit card (wrapper element) avoids fixed chrome.
   * Pass null to clear auto-pan only (manual pan preserved).
   */
  updatePanForPermitCard: (cardElement: HTMLElement | null) => void;
  /** Grab/drag handlers for `MapManualPanSurface`; null when not inside this provider. */
  manualPanHandlers: MapManualPanPointerHandlers;
};

const MapZoomContext = createContext<MapZoomContextValue | null>(null);

export function MapZoomProvider({ children }: { children: React.ReactNode }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  /** Zoom origin % must be measured against this layer (same box `transform-origin` uses). */
  const scaleLayerRef = useRef<HTMLDivElement>(null);
  const chrome = useMapChromeBoundsOptional();
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("50% 50%");
  /** Permit-card avoidance only; combined with `userPan` for the final transform. */
  const [autoPan, setAutoPan] = useState({ x: 0, y: 0 });
  /** Drag offset; kept when the card closes so manual framing persists. */
  const [userPan, setUserPan] = useState({ x: 0, y: 0 });
  const [isManualPanning, setIsManualPanning] = useState(false);

  const autoPanRef = useRef(autoPan);
  const userPanRef = useRef(userPan);
  /** Effective total pan — used by auto-pan flush (card rect already includes both). */
  const panRef = useRef({ x: 0, y: 0 });
  /** Coalesce ResizeObserver / resize / multi-rAF into one layout read per frame (avoids restarting CSS transitions). */
  const pendingPanCardRef = useRef<HTMLElement | null>(null);
  const panRafRef = useRef<number | null>(null);
  const manualDragRef = useRef<{ lastX: number; lastY: number } | null>(null);

  useEffect(() => {
    autoPanRef.current = autoPan;
  }, [autoPan]);
  useEffect(() => {
    userPanRef.current = userPan;
  }, [userPan]);

  const effectivePan = useMemo(
    () => ({ x: autoPan.x + userPan.x, y: autoPan.y + userPan.y }),
    [autoPan, userPan],
  );

  useEffect(() => {
    panRef.current = effectivePan;
  }, [effectivePan]);

  useEffect(
    () => () => {
      if (panRafRef.current !== null) {
        cancelAnimationFrame(panRafRef.current);
        panRafRef.current = null;
      }
    },
    [],
  );

  const focusOnElement = useCallback((element: HTMLElement) => {
    const measureEl = scaleLayerRef.current ?? mapContainerRef.current;
    if (!measureEl) return;
    const mapRect = measureEl.getBoundingClientRect();
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
    const cyPercent = ((elRect.top - mapRect.top) / mapRect.height) * 100;
    setTransformOrigin(`${cxPercent}% ${cyPercent}%`);
    setIsZoomed(true);
  }, []);

  const resetZoom = useCallback(() => {
    setIsZoomed(false);
  }, []);

  const resetPan = useCallback(() => {
    pendingPanCardRef.current = null;
    if (panRafRef.current !== null) {
      cancelAnimationFrame(panRafRef.current);
      panRafRef.current = null;
    }
    setAutoPan({ x: 0, y: 0 });
  }, []);

  const applyUserPanDelta = useCallback((ddx: number, ddy: number) => {
    if (ddx === 0 && ddy === 0) return;
    const { maxX, maxY } = getMaxPanDriftPx();
    setUserPan((u) => {
      const a = autoPanRef.current;
      const tx = a.x + u.x + ddx;
      const ty = a.y + u.y + ddy;
      const nx = Math.min(maxX, Math.max(-maxX, tx));
      const ny = Math.min(maxY, Math.max(-maxY, ty));
      return { x: nx - a.x, y: ny - a.y };
    });
  }, []);

  const endManualPan = useCallback(() => {
    manualDragRef.current = null;
    setIsManualPanning(false);
  }, []);

  const onManualPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsManualPanning(true);
      manualDragRef.current = { lastX: e.clientX, lastY: e.clientY };
    },
    [],
  );

  const onManualPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = manualDragRef.current;
      if (!d) return;
      const ddx = e.clientX - d.lastX;
      const ddy = e.clientY - d.lastY;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      applyUserPanDelta(ddx, ddy);
    },
    [applyUserPanDelta],
  );

  const onManualPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* capture may already be released */
      }
      endManualPan();
    },
    [endManualPan],
  );

  const manualPanHandlers = useMemo<MapManualPanPointerHandlers>(
    () => ({
      onPointerDown: onManualPointerDown,
      onPointerMove: onManualPointerMove,
      onPointerUp: onManualPointerUp,
      onLostPointerCapture: endManualPan,
    }),
    [
      onManualPointerDown,
      onManualPointerMove,
      onManualPointerUp,
      endManualPan,
    ],
  );

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

  const flushPanForPermitCard = useCallback(() => {
    panRafRef.current = null;
    const cardElement = pendingPanCardRef.current;
    pendingPanCardRef.current = null;
    if (!cardElement) return;

    const cardRect = cardElement.getBoundingClientRect();
    if (cardRect.width < 1 || cardRect.height < 1) return;

    const zones = collectChromeZones(chrome);
    const { dx, dy } = computePanDelta(
      cardRect,
      zones,
      CHROME_CLEAR_MARGIN_PX,
    );

    const { maxX, maxY } = getMaxPanDriftPx();

    const prev = panRef.current;
    const nextTotalX = Math.min(maxX, Math.max(-maxX, prev.x + dx));
    const nextTotalY = Math.min(maxY, Math.max(-maxY, prev.y + dy));

    if (
      Math.abs(nextTotalX - prev.x) < PAN_EPSILON_PX &&
      Math.abs(nextTotalY - prev.y) < PAN_EPSILON_PX
    ) {
      return;
    }

    const u = userPanRef.current;
    setAutoPan({
      x: nextTotalX - u.x,
      y: nextTotalY - u.y,
    });
  }, [chrome]);

  const updatePanForPermitCard = useCallback(
    (cardElement: HTMLElement | null) => {
      if (!cardElement) {
        pendingPanCardRef.current = null;
        if (panRafRef.current !== null) {
          cancelAnimationFrame(panRafRef.current);
          panRafRef.current = null;
        }
        setAutoPan({ x: 0, y: 0 });
        return;
      }

      pendingPanCardRef.current = cardElement;
      if (panRafRef.current === null) {
        panRafRef.current = requestAnimationFrame(flushPanForPermitCard);
      }
    },
    [flushPanForPermitCard],
  );

  const value = useMemo(
    () => ({
      mapContainerRef,
      isZoomed,
      toggleZoomFromCard,
      resetZoom,
      resetPan,
      updatePanForPermitCard,
      manualPanHandlers,
    }),
    [
      isZoomed,
      toggleZoomFromCard,
      resetZoom,
      resetPan,
      updatePanForPermitCard,
      manualPanHandlers,
    ],
  );

  const overscanPct = MAX_PAN_DRIFT_RATIO * 100;
  const panLayerSpanPct = 100 + 2 * overscanPct;

  return (
    <MapZoomContext.Provider value={value}>
      {/* Clips the scaled map so it does not spill past the screen edge. */}
      <div ref={mapContainerRef} className="absolute inset-0 overflow-hidden">
        {/*
          Oversized pan layer: translating a viewport-sized layer exposed shell/void at the
          edges. Extra size (2× max drift per axis) keeps map pixels under the clip while panning.
        */}
        <div
          className="absolute [backface-visibility:hidden] will-change-transform motion-reduce:transition-none"
          style={{
            width: `${panLayerSpanPct}%`,
            height: `${panLayerSpanPct}%`,
            left: `${-overscanPct}%`,
            top: `${-overscanPct}%`,
            transform: `translate3d(${effectivePan.x}px, ${effectivePan.y}px, 0)`,
            transition: isManualPanning
              ? "none"
              : `transform ${MAP_PAN_TRANSITION_MS}ms cubic-bezier(0.45, 0, 0.55, 1)`,
          }}
        >
          <div
            ref={scaleLayerRef}
            className="absolute inset-0 will-change-transform transition-transform duration-500 ease-out"
            style={{
              transformOrigin,
              transform: isZoomed ? `scale(${MAP_FOCUS_ZOOM})` : "scale(1)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </MapZoomContext.Provider>
  );
}

/** Use inside `MapZoomProvider` (e.g. command center screen). Returns null if the card renders elsewhere. */
export function useMapZoomOptional() {
  return useContext(MapZoomContext);
}
