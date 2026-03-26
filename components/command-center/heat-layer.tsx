/**
 * Mock “signal density” heat — wide contour-like bands (sharp steps); halo = gold then blue.
 * A blue underlay joins the three clusters so brown map doesn’t show between halos.
 * ViewBox 0–100, preserveAspectRatio="none".
 */

type LobeFill = "hot" | "mid" | "halo";

type Lobe = {
  cx: number;
  cy: number;
  /** Elongation: unequal rx/ry + rot reads like corridors / merged hotspots */
  rx: number;
  ry: number;
  rot: number;
  opacity: number;
  fill: LobeFill;
};

type ZoneSpec = {
  id: string;
  lobes: Lobe[];
};

/**
 * East = largest “downtown cluster”: several lobes at different angles (overlapping merge).
 * West = smaller, a bit more vertical stretch. South = mid-size, two plumes + a warm core.
 */
const ZONES: ZoneSpec[] = [
  {
    id: "east",
    lobes: [
      {
        cx: 52,
        cy: 23,
        rx: 26,
        ry: 9,
        rot: 22,
        opacity: 0.58,
        fill: "halo",
      },
      {
        cx: 61,
        cy: 28,
        rx: 14,
        ry: 20,
        rot: -40,
        opacity: 0.55,
        fill: "halo",
      },
      {
        cx: 56,
        cy: 30,
        rx: 18,
        ry: 12,
        rot: 58,
        opacity: 0.72,
        fill: "mid",
      },
      {
        cx: 59,
        cy: 24,
        rx: 11,
        ry: 8,
        rot: 8,
        opacity: 0.98,
        fill: "hot",
      },
      {
        cx: 63,
        cy: 33,
        rx: 13,
        ry: 16,
        rot: -22,
        opacity: 0.52,
        fill: "mid",
      },
    ],
  },
  {
    id: "west",
    lobes: [
      {
        cx: 10,
        cy: 35,
        rx: 8,
        ry: 18,
        rot: 6,
        opacity: 0.52,
        fill: "halo",
      },
      {
        cx: 14,
        cy: 40,
        rx: 16,
        ry: 10,
        rot: -32,
        opacity: 0.6,
        fill: "mid",
      },
      {
        cx: 12,
        cy: 37,
        rx: 9,
        ry: 7,
        rot: 15,
        opacity: 0.9,
        fill: "hot",
      },
    ],
  },
  {
    id: "south",
    lobes: [
      {
        cx: 38,
        cy: 58,
        rx: 20,
        ry: 10,
        rot: -18,
        opacity: 0.54,
        fill: "halo",
      },
      {
        cx: 45,
        cy: 62,
        rx: 12,
        ry: 15,
        rot: 35,
        opacity: 0.58,
        fill: "halo",
      },
      {
        cx: 42,
        cy: 60,
        rx: 10,
        ry: 8,
        rot: 0,
        opacity: 0.88,
        fill: "hot",
      },
    ],
  },
];

/**
 * Nearly hard steps: wide flat plateaus + tiny gap (STEP) = thick “contour” rings.
 * Fewer hues than before so each jump is easy to see; pair with low blur on the filter.
 */
const STEP = 0.04;

function HeatGradients() {
  return (
    <>
      <radialGradient
        id="heat-fill-hot"
        gradientUnits="objectBoundingBox"
        cx="0.44"
        cy="0.4"
        r="0.68"
        fx="0.38"
        fy="0.34"
      >
        <stop offset="0%" stopColor="var(--heat-core-deep)" stopOpacity="1" />
        <stop offset="9%" stopColor="var(--heat-core-deep)" stopOpacity="1" />
        <stop offset={`${9 + STEP}%`} stopColor="var(--heat-core-mid)" stopOpacity="0.98" />
        <stop offset="18%" stopColor="var(--heat-core-mid)" stopOpacity="0.98" />
        <stop offset={`${18 + STEP}%`} stopColor="var(--heat-hot)" stopOpacity="0.95" />
        <stop offset="27%" stopColor="var(--heat-hot)" stopOpacity="0.95" />
        <stop offset={`${27 + STEP}%`} stopColor="#ea580c" stopOpacity="0.92" />
        <stop offset="36%" stopColor="#ea580c" stopOpacity="0.92" />
        <stop offset={`${36 + STEP}%`} stopColor="#f97316" stopOpacity="0.85" />
        <stop offset="45%" stopColor="#f97316" stopOpacity="0.85" />
        <stop offset={`${45 + STEP}%`} stopColor="#f59e0b" stopOpacity="0.72" />
        <stop offset="54%" stopColor="#f59e0b" stopOpacity="0.72" />
        <stop offset={`${54 + STEP}%`} stopColor="#eab308" stopOpacity="0.58" />
        <stop offset="63%" stopColor="#eab308" stopOpacity="0.58" />
        <stop offset={`${63 + STEP}%`} stopColor="#facc15" stopOpacity="0.44" />
        <stop offset="72%" stopColor="#facc15" stopOpacity="0.44" />
        <stop offset={`${72 + STEP}%`} stopColor="#fcd34d" stopOpacity="0.3" />
        <stop offset="81%" stopColor="#fcd34d" stopOpacity="0.3" />
        <stop offset={`${81 + STEP}%`} stopColor="#fef3c7" stopOpacity="0.14" />
        <stop offset="92%" stopColor="#fef3c7" stopOpacity="0.14" />
        <stop offset={`${92 + STEP}%`} stopColor="#fffbeb" stopOpacity="0.04" />
        <stop offset="100%" stopColor="#fffbeb" stopOpacity={0} />
      </radialGradient>

      <radialGradient
        id="heat-fill-mid"
        gradientUnits="objectBoundingBox"
        cx="0.48"
        cy="0.46"
        r="0.72"
        fx="0.42"
        fy="0.4"
      >
        <stop offset="0%" stopColor="var(--heat-core-mid)" stopOpacity="0.82" />
        <stop offset="11%" stopColor="var(--heat-core-mid)" stopOpacity="0.82" />
        <stop offset={`${11 + STEP}%`} stopColor="#ea580c" stopOpacity="0.74" />
        <stop offset="23%" stopColor="#ea580c" stopOpacity="0.74" />
        <stop offset={`${23 + STEP}%`} stopColor="#f97316" stopOpacity="0.62" />
        <stop offset="35%" stopColor="#f97316" stopOpacity="0.62" />
        <stop offset={`${35 + STEP}%`} stopColor="#f59e0b" stopOpacity="0.5" />
        <stop offset="47%" stopColor="#f59e0b" stopOpacity="0.5" />
        <stop offset={`${47 + STEP}%`} stopColor="#eab308" stopOpacity="0.38" />
        <stop offset="59%" stopColor="#eab308" stopOpacity="0.38" />
        <stop offset={`${59 + STEP}%`} stopColor="#facc15" stopOpacity="0.26" />
        <stop offset="71%" stopColor="#facc15" stopOpacity="0.26" />
        <stop offset={`${71 + STEP}%`} stopColor="#fcd34d" stopOpacity="0.16" />
        <stop offset="85%" stopColor="#fcd34d" stopOpacity="0.16" />
        <stop offset={`${85 + STEP}%`} stopColor="#fef3c7" stopOpacity="0.06" />
        <stop offset="100%" stopColor="#fef3c7" stopOpacity={0} />
      </radialGradient>

      {/* Gold center → blue rings; outer blue stays visible late so edges don’t “hole out” */}
      <radialGradient
        id="heat-fill-halo"
        gradientUnits="objectBoundingBox"
        cx="0.5"
        cy="0.5"
        r="0.82"
        fx="0.46"
        fy="0.44"
      >
        <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.5" />
        <stop offset="12%" stopColor="#fffbeb" stopOpacity="0.5" />
        <stop offset={`${12 + STEP}%`} stopColor="#fde68a" stopOpacity="0.44" />
        <stop offset="26%" stopColor="#fde68a" stopOpacity="0.44" />
        <stop offset={`${26 + STEP}%`} stopColor="#fbbf24" stopOpacity="0.36" />
        <stop offset="38%" stopColor="#fbbf24" stopOpacity="0.36" />
        <stop offset={`${38 + STEP}%`} stopColor="#eab308" stopOpacity="0.28" />
        <stop offset="48%" stopColor="#eab308" stopOpacity="0.28" />
        <stop offset={`${48 + STEP}%`} stopColor="#38bdf8" stopOpacity="0.38" />
        <stop offset="58%" stopColor="#38bdf8" stopOpacity="0.38" />
        <stop offset={`${58 + STEP}%`} stopColor="#0ea5e9" stopOpacity="0.32" />
        <stop offset="68%" stopColor="#0ea5e9" stopOpacity="0.32" />
        <stop offset={`${68 + STEP}%`} stopColor="#0284c7" stopOpacity="0.26" />
        <stop offset="78%" stopColor="#0284c7" stopOpacity="0.26" />
        <stop offset={`${78 + STEP}%`} stopColor="#0369a1" stopOpacity="0.2" />
        <stop offset="88%" stopColor="#0369a1" stopOpacity="0.2" />
        <stop offset={`${88 + STEP}%`} stopColor="#1e3a8a" stopOpacity="0.14" />
        <stop offset="96%" stopColor="#1e3a8a" stopOpacity="0.14" />
        <stop offset={`${96 + STEP}%`} stopColor="#172554" stopOpacity="0.06" />
        <stop offset="100%" stopColor="#172554" stopOpacity={0} />
      </radialGradient>
    </>
  );
}

function fillUrl(kind: LobeFill): string {
  if (kind === "hot") return "url(#heat-fill-hot)";
  if (kind === "mid") return "url(#heat-fill-mid)";
  return "url(#heat-fill-halo)";
}

function LobeShape({ lobe }: { lobe: Lobe }) {
  const { cx, cy, rx, ry, rot, opacity, fill } = lobe;
  return (
    <g
      transform={`rotate(${rot} ${cx} ${cy})`}
      opacity={opacity}
    >
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fillUrl(fill)} />
    </g>
  );
}

/**
 * Large, overlapping blue ellipses under the heat lobes — fills brown gaps between the
 * three neighborhoods so the cool fringe reads as one connected field (same blur as heat).
 */
const BLUE_FIELD = [
  { cx: 46, cy: 38, rx: 58, ry: 46, rot: -7, fillOpacity: 0.2 },
  { cx: 20, cy: 42, rx: 36, ry: 44, rot: 10, fillOpacity: 0.16 },
  { cx: 54, cy: 52, rx: 48, ry: 38, rot: 18, fillOpacity: 0.15 },
  { cx: 36, cy: 56, rx: 42, ry: 28, rot: -22, fillOpacity: 0.14 },
] as const;

function BlueFieldUnderlay() {
  return (
    <>
      {BLUE_FIELD.map((b, i) => (
        <g key={`blue-field-${i}`} transform={`rotate(${b.rot} ${b.cx} ${b.cy})`}>
          <ellipse
            cx={b.cx}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            fill="#0ea5e9"
            fillOpacity={b.fillOpacity}
          />
        </g>
      ))}
    </>
  );
}

export function HeatLayer() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen opacity-[0.96]"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <HeatGradients />
          {/* Strong feather — merges lobes and fades edges into the basemap (see reference). */}
          <filter
            id="heat-feather"
            x="-65%"
            y="-65%"
            width="230%"
            height="230%"
          >
            {/* Low blur so contour bands stay crisp (obvious steps) */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.15" />
          </filter>
        </defs>

        {/* One filtered stack: shared blue base + all zones blur together (no gaps between). */}
        <g filter="url(#heat-feather)">
          <BlueFieldUnderlay />
          {ZONES.map((zone) => (
            <g key={zone.id}>
              {zone.lobes
                .filter((l) => l.fill !== "hot")
                .map((l, i) => (
                  <LobeShape key={`${zone.id}-b-${i}`} lobe={l} />
                ))}
              {zone.lobes
                .filter((l) => l.fill === "hot")
                .map((l, i) => (
                  <LobeShape key={`${zone.id}-h-${i}`} lobe={l} />
                ))}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
