import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';
import { geoContains, geoEqualEarth, geoPath, type GeoProjection } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';
import { WORLD_FEATURES, countryFeature } from './WorldMap';
import { hashUnit, mainlandCentroid, mainlandFeature } from '../map/geo';
import { useViewport } from '../hooks/useViewport';

/** Absurdistan is fictional and has no shape in the topology: it is drawn as the mock's dashed
 * ellipse («границы условные») at this made-up spot, over open water. */
const ABSURDISTAN_CENTER: [number, number] = [51, 41.5];
/** Map zoom for Absurdistan, relative to the whole world fitting the screen (mock: ×2.6). */
const ABSURDISTAN_ZOOM = 2.6;
/** Cap on how far a small country is magnified (relative to the world fit) — the 110m
 * topology turns blocky past this. */
const MAX_COUNTRY_ZOOM = 14;
/** Player pan/pinch zoom range on top of the framed view. */
const MAX_PAN_ZOOM = 4;
/** How far past the screen edge the player may drag the map, as a share of the screen. */
const PAN_SLACK = 0.25;

interface View {
  x: number;
  y: number;
  k: number;
}
const HOME: View = { x: 0, y: 0, k: 1 };

export interface EventPin {
  /** Event id — seeds the pin's (stable) position around the country. */
  id: string;
  label: string;
  onOpen: () => void;
}

interface Props {
  countryId: string;
  /** Country name, next to the marker. */
  label: string;
  /** Muted line under the name («34 млн · границы условные»). */
  sublabel: string;
  /** A pending event's pin, or null. */
  eventPin: EventPin | null;
}

interface Frame {
  /** World country paths in screen space (the player's country included, for context). */
  paths: { key: string; d: string }[];
  /** The player's country outline, or null for Absurdistan (an ellipse instead). */
  countryPath: string | null;
  /** The country's marker point in screen space (before the player's pan/zoom). */
  point: [number, number];
  /** Map-space pin spot for an event id: inside the country when it is big enough on screen. */
  pinFor: (eventId: string) => [number, number] | null;
}

/** Projects the world so the player's country fills the area right of center where the mock
 * places it (center ≈ 64% x / 48% y — a touch lower than the mock's 42% so the label clears
 * the agenda panel, which runs taller at our type sizes), rotated onto the central meridian so countries that
 * cross ±180° (Russia, Fiji…) stay in one piece. */
function buildFrame(countryId: string, w: number, h: number): Frame {
  const shape = countryFeature(countryId);
  const center = shape ? mainlandCentroid(shape) : ABSURDISTAN_CENTER;
  const box = { cx: w * 0.64, cy: h * 0.48, bw: w * 0.34, bh: h * 0.4 };

  const worldScale = geoEqualEarth().fitSize([w, h], { type: 'Sphere' }).scale();
  const projection: GeoProjection = geoEqualEarth().rotate([-center[0], 0]);
  if (shape) {
    projection.fitExtent(
      [
        [box.cx - box.bw / 2, box.cy - box.bh / 2],
        [box.cx + box.bw / 2, box.cy + box.bh / 2],
      ],
      mainlandFeature(shape),
    );
    if (projection.scale() > worldScale * MAX_COUNTRY_ZOOM) projection.scale(worldScale * MAX_COUNTRY_ZOOM);
  } else {
    projection.scale(worldScale * ABSURDISTAN_ZOOM);
  }
  // Re-center on the marker point (fitExtent centers the bounding box, which can sit off the
  // mainland centroid; the scale cap above also discards fitExtent's translate).
  projection.translate([0, 0]);
  const raw = projection(center) ?? [0, 0];
  projection.translate([box.cx - raw[0], box.cy - raw[1]]);

  const path = geoPath(projection);
  const paths: Frame['paths'] = [];
  WORLD_FEATURES.forEach((f, i) => {
    const d = path(f);
    if (d) paths.push({ key: String(f.id ?? i), d });
  });
  const point: [number, number] = [box.cx, box.cy];
  return { paths, countryPath: shape ? path(shape) : null, point, pinFor: (id) => pinInside(id, shape, projection, point, w) };
}

/** Minimum on-screen distance (as a share of screen width) between the country marker and an
 * event pin — closer than this they overlap, and the pin falls back to an outside spot. */
const PIN_MIN_GAP = 0.07;

/** A stable spot for an event pin inside the player's country: up to 24 hash-seeded
 * candidates across the country's on-screen bounds, the first that is on land of that country
 * and clear of the marker. Absurdistan uses its ellipse. Null when the country is too small. */
function pinInside(id: string, shape: Feature<Geometry> | null, projection: GeoProjection, point: [number, number], w: number): [number, number] | null {
  const minGap = w * PIN_MIN_GAP;
  if (!shape) {
    const angle = hashUnit(id) * Math.PI * 2;
    return [point[0] + Math.cos(angle) * w * 0.05, point[1] + Math.sin(angle) * w * 0.04];
  }
  const [[x0, y0], [x1, y1]] = geoPath(projection).bounds(mainlandFeature(shape));
  for (let i = 0; i < 24; i++) {
    const x = x0 + (0.1 + 0.8 * hashUnit(`${id}:x${i}`)) * (x1 - x0);
    const y = y0 + (0.1 + 0.8 * hashUnit(`${id}:y${i}`)) * (y1 - y0);
    if (Math.hypot(x - point[0], y - point[1]) < minGap) continue;
    const lonLat = projection.invert?.([x, y]);
    if (lonLat && geoContains(shape, lonLat)) return [x, y];
  }
  return null;
}

function clampView(v: View, w: number, h: number): View {
  const k = Math.min(MAX_PAN_ZOOM, Math.max(1, v.k));
  const clampAxis = (t: number, size: number) => Math.min(size * PAN_SLACK, Math.max(size - k * size - size * PAN_SLACK, t));
  return { k, x: clampAxis(v.x, w), y: clampAxis(v.y, h) };
}

/**
 * Main screen map layer (handoff screen 03): the player's country, zoomed in, with the rest of
 * the world around it as quiet context; a veil that dims everything but the country and fades
 * behind the stats panel and the header; a slow drift; the country marker with pulsing rings
 * and its label; and the pending event's pin. The player can pan and pinch/wheel-zoom within
 * bounds; double-tap re-centres. Presentation only — no game state is read beyond the props.
 */
export function CountryMap({ countryId, label, sublabel, eventPin }: Props) {
  const { width: w, height: h } = useViewport();
  const frame = useMemo(() => buildFrame(countryId, w, h), [countryId, w, h]);
  const [view, setView] = useState<View>(HOME);
  const pinId = eventPin?.id ?? null;
  const inside = useMemo(() => (pinId ? frame.pinFor(pinId) : null), [frame, pinId]);

  // --- Pan / pinch / wheel ---
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ view: View; points: { x: number; y: number }[] } | null>(null);

  function restartGesture(current: View) {
    gesture.current = { view: current, points: [...pointers.current.values()] };
  }
  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    restartGesture(view);
  }
  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const start = gesture.current;
    const now = [...pointers.current.values()];
    if (now.length === 1 && start.points.length === 1) {
      setView(clampView({ ...start.view, x: start.view.x + now[0].x - start.points[0].x, y: start.view.y + now[0].y - start.points[0].y }, w, h));
    } else if (now.length >= 2 && start.points.length >= 2) {
      const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      const k = Math.min(MAX_PAN_ZOOM, Math.max(1, start.view.k * (dist(now[0], now[1]) / dist(start.points[0], start.points[1]))));
      const m0 = mid(start.points[0], start.points[1]);
      const m1 = mid(now[0], now[1]);
      const ratio = k / start.view.k;
      setView(clampView({ k, x: m1.x - (m0.x - start.view.x) * ratio, y: m1.y - (m0.y - start.view.y) * ratio }, w, h));
    }
  }
  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    restartGesture(view);
  }
  function onWheel(e: ReactWheelEvent<HTMLDivElement>) {
    const k = Math.min(MAX_PAN_ZOOM, Math.max(1, view.k * Math.exp(-e.deltaY * 0.002)));
    const ratio = k / view.k;
    setView(clampView({ k, x: e.clientX - (e.clientX - view.x) * ratio, y: e.clientY - (e.clientY - view.y) * ratio }, w, h));
  }

  // Screen position of the country point under the current pan/zoom.
  const sx = view.x + view.k * frame.point[0];
  const sy = view.y + view.k * frame.point[1];
  const veil = (a: number) => `rgba(var(--veil-rgb), ${a})`;

  // Event pin: a stable spot inside the country (see pinInside), under the current pan/zoom;
  // for countries too small to hold one, a stable spot just outside it.
  let pin: { x: number; y: number } | null = null;
  if (inside) {
    pin = { x: view.x + view.k * inside[0], y: view.y + view.k * inside[1] };
  } else if (eventPin) {
    const angle = ((-50 + hashUnit(eventPin.id) * 110) * Math.PI) / 180;
    const r = Math.min(w, h) * 0.24;
    pin = {
      x: Math.min(w - 180, Math.max(w * 0.32, sx + r * Math.cos(angle))),
      y: Math.min(h * 0.66, Math.max(h * 0.24, sy + r * Math.sin(angle))),
    };
  }

  // Absurdistan's ellipse: the mock's 100×76pt on the 640pt canvas.
  const ellipse = { rx: w * 0.078, ry: w * 0.059 };

  return (
    <div
      className="absolute inset-0 touch-none select-none overflow-hidden bg-(--map-ocean)"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      onDoubleClick={() => setView(HOME)}
    >
      <svg width={w} height={h} className="absolute inset-0" aria-hidden>
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          <g className="map-drift" style={{ transformOrigin: `${frame.point[0]}px ${frame.point[1]}px` }}>
            {frame.paths.map((p) => (
              <path key={p.key} d={p.d} fill="var(--map-land)" stroke="var(--line)" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
            ))}
            {frame.countryPath ? (
              <path
                d={frame.countryPath}
                fill="var(--selected)"
                stroke="var(--accent)"
                strokeOpacity={0.7}
                strokeWidth={1}
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            ) : (
              <ellipse
                cx={frame.point[0]}
                cy={frame.point[1]}
                rx={ellipse.rx}
                ry={ellipse.ry}
                fill="var(--selected)"
                stroke="var(--accent)"
                strokeOpacity={0.7}
                strokeWidth={1}
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </g>
        </g>
      </svg>

      {/* Veil: clear around the country, dimmed beyond; extra fades behind the stats panel
          (left) and the header (top). */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            `radial-gradient(circle at ${sx}px ${sy}px, ${veil(0)} 0, ${veil(0)} ${w * 0.11}px, ${veil(0.72)} ${w * 0.3}px)`,
            `linear-gradient(90deg, ${veil(0.85)} 0, ${veil(0)} ${w * 0.34}px)`,
            `linear-gradient(180deg, ${veil(0.9)} 0, ${veil(0)} ${h * 0.17}px)`,
          ].join(', '),
        }}
      />

      {/* Tutorial anchor (step «Карта и донесения»): an invisible box around the country point. */}
      <div data-tutorial="map-focus" className="pointer-events-none absolute" style={{ left: sx - w * 0.14, top: sy - h * 0.2, width: w * 0.28, height: h * 0.4 }} aria-hidden />

      {/* Country marker: 8pt accent dot with a veil ring and two pulsing rings, label to the right. */}
      <div className="pointer-events-none absolute text-(--accent)" style={{ left: sx, top: sy }} aria-hidden>
        <span className="absolute -left-5 -top-5 h-10 w-10">
          <span className="ring-pulse" />
          <span className="ring-pulse" style={{ animationDelay: '1.3s' }} />
        </span>
        <span className="marker-dot absolute -left-1 -top-1 h-2 w-2 rounded-full bg-(--accent)" style={{ boxShadow: `0 0 0 3px ${veil(0.9)}` }} />
      </div>
      <div className="pointer-events-none absolute flex max-w-[180px] flex-col gap-0.5" style={{ left: sx + 18, top: sy - 22 }}>
        <span className="font-serif text-label leading-none text-(--text)">{label}</span>
        <span className="text-caption leading-none text-(--muted)">{sublabel}</span>
      </div>

      {eventPin && pin && (
        <button
          type="button"
          // Near the right edge the pill flips to the left of the dot so it never runs off-screen.
          className={`press absolute flex items-center gap-sp-2 ${pin.x > w - 200 ? 'flex-row-reverse' : ''}`}
          style={pin.x > w - 200 ? { right: w - pin.x - 7, top: pin.y - 7 } : { left: pin.x - 7, top: pin.y - 7 }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={eventPin.onOpen}
        >
          <span className="relative h-3.5 w-3.5 shrink-0 text-(--warning)" aria-hidden>
            <span className="ring-pulse fast" />
            <span className="absolute inset-[3px] rounded-full bg-(--warning)" />
          </span>
          <span className="glass max-w-[180px] truncate rounded-chip px-sp-2 py-1 text-caption font-medium text-(--text)">{eventPin.label}</span>
        </button>
      )}
    </div>
  );
}
