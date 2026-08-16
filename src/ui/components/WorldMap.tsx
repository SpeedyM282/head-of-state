import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, useMapContext } from 'react-simple-maps';
import { merge } from 'topojson-client';
import type { GeometryObject, MultiPolygon as TopoMultiPolygon, Polygon as TopoPolygon, Topology } from 'topojson-specification';
import type { MultiPolygon as GeoMultiPolygon } from 'geojson';
import { loc } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { countries } from '../../data';
import { WESTERN_EUROPE_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericWesternEurope';
import { EASTERN_EUROPE_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericEasternEurope';
import { NORTH_AMERICA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericNorthAmerica';
import { SOUTH_AMERICA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericSouthAmerica';
import { CENTRAL_ASIA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericCentralAsia';
import { MIDDLE_EAST_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericMiddleEast';
import { EASTERN_ASIA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericEasternAsia';
import { SOUTH_SOUTHEAST_ASIA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericSouthSoutheastAsia';
import { OCEANIA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericOceania';
import worldTopologyJson from '../../assets/world-110m.json';

// TS's JSON-module inference widens string literals (e.g. "type": "Topology") to `string`,
// so it can't structurally satisfy topojson-specification's Topology on its own — this
// asserts the accurate, verified-correct nominal type for an opaque vendored asset (its
// real shape genuinely is a Topology; RSM's own <Geographies> already treats it as one).
const rawWorldTopology = worldTopologyJson as unknown as Topology;

/**
 * Drops specific polygon parts (by index into the country's MultiPolygon `arcs`) from one
 * country's geometry, once at load time. Used below for countries whose Natural Earth shape
 * bundles in a genuine, far-flung exclave alongside the mainland the map actually cares
 * about — not to redraw any border, just to stop that exclave from rendering as a
 * disconnected dot thousands of km from everything else, and from skewing merge()'d region
 * silhouettes and their numerically-fit center/zoom. Safe for neighboring countries that
 * happen to share arcs with the dropped part (e.g. Suriname/Brazil bordering French Guiana):
 * arc indices are shared pointers into the topology's arc pool, not owned by any one
 * geometry, so this only removes this one country's own reference to them.
 */
function dropMultiPolygonParts(topology: Topology, id: string, partIndices: readonly number[]): Topology {
  const countriesObject = topology.objects.countries;
  if (countriesObject.type !== 'GeometryCollection') return topology;
  const drop = new Set(partIndices);
  const geometries = countriesObject.geometries.map((g) => {
    if (g.id !== id || g.type !== 'MultiPolygon') return g;
    return { ...g, arcs: g.arcs.filter((_, i) => !drop.has(i)) };
  });
  return { ...topology, objects: { ...topology.objects, countries: { ...countriesObject, geometries } } };
}

// France (id "250"): part 0 of its 3-part MultiPolygon is French Guiana, thousands of km
// away in South America — legally an integral part of France, not a separate country in
// Natural Earth's data. Verified by inspection: bbox lon -54.5..-51.7, lat 2.1..5.8. Parts
// 1/2 (kept) are mainland France and Corsica. This is why WESTERN_EUROPE's fit below looks
// nothing like a naive guess would — it's numerically fit on the corrected geometry.
const withoutFrenchGuiana = dropMultiPolygonParts(rawWorldTopology, '250', [0]);
// United States (id "840"): parts 1-5 of its 10-part MultiPolygon are the Hawaiian islands,
// ~4000km from the mainland — bundled in the same way, unlike e.g. Puerto Rico, which gets
// its own (unselected) topology entry rather than being folded into the US's shape. Verified
// by inspection: bbox lon -159.8..-154.7, lat 18.9..22.2. Part 0 (kept) is the CONUS
// mainland; parts 6-9 (kept) are Alaska, including the Aleutians — still North America,
// unlike Hawaii, so not dropped.
const worldTopology = dropMultiPolygonParts(withoutFrenchGuiana, '840', [1, 2, 3, 4, 5]);

export type RegionKey =
  | 'westernEurope'
  | 'easternEurope'
  | 'northAmerica'
  | 'southAmerica'
  | 'centralAsia'
  | 'middleEast'
  | 'southSoutheastAsia'
  | 'easternAsia'
  | 'oceania';
const REGION_KEYS: RegionKey[] = [
  'westernEurope',
  'easternEurope',
  'northAmerica',
  'southAmerica',
  'centralAsia',
  'middleEast',
  'southSoutheastAsia',
  'easternAsia',
  'oceania',
];

/** Offset (px) of the hover tooltip from the cursor so it doesn't sit under the pointer. */
const TOOLTIP_OFFSET = 14;

const WIDTH = 560;
const HEIGHT = 560;
/**
 * A single static whole-world projection — never rotated or rescaled at runtime. Region
 * "zoom" is purely `ZoomableGroup`'s pan/zoom transform (center + zoom) layered on top of
 * this fixed base, so the transition between the world view and a region is a plain 2D
 * pan/scale the browser can animate (see .rsm-zoomable-group in index.css), not a projection
 * swap. `geoEqualEarth` fitted to the whole sphere via fitSize([560,560], {type:'Sphere'}) —
 * scale computed numerically (not eyeballed).
 */
const WORLD_PROJECTION_CONFIG = { rotate: [0, 0, 0] as [number, number, number], scale: 103.45 };
/** Identity view: shows the whole fitted world with no additional pan/zoom. */
const WORLD_VIEW = { center: [0, 0] as [number, number], zoom: 1 };

interface RegionConfig {
  isoMap: Record<string, string>;
  /** [lon, lat] and zoom multiplier that frame this region under WORLD_PROJECTION_CONFIG —
   * fit numerically the same way the old per-continent projections were (not eyeballed).
   * Russia's Far East (Eastern Europe) and Fiji (Oceania — it straddles the antimeridian,
   * which would otherwise blow the fit bbox out to near-global width) were excluded from
   * their region's FIT bbox only — both countries stay selectable once inside their region,
   * just not load-bearing for framing. Western Europe's and North America's fits are clean
   * of France's/the US's dropped exclaves by construction — see dropMultiPolygonParts above
   * — rather than by exclusion. */
  center: [number, number];
  zoom: number;
}

const REGIONS: Record<RegionKey, RegionConfig> = {
  westernEurope: { isoMap: WESTERN_EUROPE_ISO_NUMERIC_TO_ALPHA2, center: [8.522, 52.784], zoom: 6.007 },
  easternEurope: { isoMap: EASTERN_EUROPE_ISO_NUMERIC_TO_ALPHA2, center: [29.837, 46.898], zoom: 9.585 },
  northAmerica: { isoMap: NORTH_AMERICA_ISO_NUMERIC_TO_ALPHA2, center: [-93.41, 37.196], zoom: 3.108 },
  southAmerica: { isoMap: SOUTH_AMERICA_ISO_NUMERIC_TO_ALPHA2, center: [-59.548, -19.343], zoom: 3.934 },
  centralAsia: { isoMap: CENTRAL_ASIA_ISO_NUMERIC_TO_ALPHA2, center: [64.829, 44.798], zoom: 8.601 },
  middleEast: { isoMap: MIDDLE_EAST_ISO_NUMERIC_TO_ALPHA2, center: [48.598, 27.456], zoom: 7.501 },
  southSoutheastAsia: { isoMap: SOUTH_SOUTHEAST_ASIA_ISO_NUMERIC_TO_ALPHA2, center: [99.564, 13.359], zoom: 3.403 },
  easternAsia: { isoMap: EASTERN_ASIA_ISO_NUMERIC_TO_ALPHA2, center: [105.788, 34.715], zoom: 4.652 },
  oceania: { isoMap: OCEANIA_ISO_NUMERIC_TO_ALPHA2, center: [140.582, -23.501], zoom: 4.909 },
};

function isPolygonal(g: GeometryObject): g is TopoPolygon | TopoMultiPolygon {
  return g.type === 'Polygon' || g.type === 'MultiPolygon';
}

/**
 * One dissolved shape per region — every member country merged into a single outline with
 * internal borders removed (topojson-client's `merge`, which resolves shared arcs in the
 * topology; this is exactly what it's for). Computed once at module load: `worldTopology`
 * is a static import, so this never needs to re-run.
 */
const REGION_MERGED_GEOMETRY: Record<RegionKey, GeoMultiPolygon> = (() => {
  const countriesObject = worldTopology.objects.countries;
  const geometries = countriesObject.type === 'GeometryCollection' ? countriesObject.geometries : [];
  const result = {} as Record<RegionKey, GeoMultiPolygon>;
  for (const region of REGION_KEYS) {
    const ids = new Set(Object.keys(REGIONS[region].isoMap));
    // `@types/topojson-specification`'s Properties (via Topology's default generic) allows
    // `null`, but `@types/topojson-client`'s merge() is hard-typed to its own default
    // (non-null) Properties — a cross-package generic mismatch between two DefinitelyTyped
    // packages, not a real runtime concern: merge() never reads `.properties`, only
    // `.type`/`.arcs`/`.id`, all of which are verified by the filter below.
    const members = (geometries as unknown as GeometryObject[]).filter(
      (g): g is TopoPolygon | TopoMultiPolygon => g.id !== undefined && ids.has(String(g.id)) && isPolygonal(g),
    );
    result[region] = merge(worldTopology, members);
  }
  return result;
})();

type GeographyStyle = { default: CSSProperties; hover: CSSProperties; pressed: CSSProperties };

const STYLE_CONTEXT: GeographyStyle = {
  default: { fill: 'var(--ink-soft)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', pointerEvents: 'none' },
  hover: { fill: 'var(--ink-soft)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', pointerEvents: 'none' },
  pressed: { fill: 'var(--ink-soft)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', pointerEvents: 'none' },
};
/** Fully invisible and non-interactive: a region's member country while that region is NOT
 * the active one, or (once any region is active) any country outside the map's 9 regions
 * entirely. Selecting a region hides everything else on the map, not just the other regions'
 * borders — the region overlay (world view) is what represents non-active regions instead. */
const STYLE_HIDDEN: GeographyStyle = {
  default: { fill: 'none', stroke: 'none', outline: 'none', pointerEvents: 'none' },
  hover: { fill: 'none', stroke: 'none', outline: 'none', pointerEvents: 'none' },
  pressed: { fill: 'none', stroke: 'none', outline: 'none', pointerEvents: 'none' },
};
// Hover/pressed reuse the exact same border as default (no emphasis, no width change) —
// only the fill shifts, so hovering never draws a new/thicker outline around the shape.
const STYLE_SELECTABLE: GeographyStyle = {
  default: { fill: 'var(--paper-dim)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', cursor: 'pointer' },
  hover: { fill: 'var(--gold-soft)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', cursor: 'pointer' },
  pressed: { fill: 'var(--gold)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', cursor: 'pointer' },
};
const STYLE_SELECTED: GeographyStyle = {
  default: { fill: 'var(--gold)', stroke: 'var(--gold)', strokeWidth: 1.25, outline: 'none', cursor: 'pointer' },
  hover: { fill: 'var(--gold)', stroke: 'var(--gold)', strokeWidth: 1.25, outline: 'none', cursor: 'pointer' },
  pressed: { fill: 'var(--gold)', stroke: 'var(--gold)', strokeWidth: 1.25, outline: 'none', cursor: 'pointer' },
};

/** The subset of a react-simple-maps prepared feature that this component reads directly. */
interface RsmFeature {
  rsmKey: string;
  id?: string;
}

interface MapGeographyProps {
  geo: RsmFeature;
  /** Belongs to one of the map regions at all (regardless of which is currently active). */
  isRegionMember: boolean;
  /** True only at the world overview (no active region) — the only time a non-region country
   * should render as muted background context instead of disappearing entirely. */
  showBackgroundContext: boolean;
  alpha2: string | null;
  isSelected: boolean;
  label: string | undefined;
  onActivate: (alpha2: string) => void;
  onHoverStart: (label: string) => void;
  onHoverEnd: () => void;
}

/**
 * Memoized so panning/zooming (which re-invokes the <Geographies> children render-prop
 * every frame) only re-renders the one or two geographies whose state actually changed,
 * not all ~180 world shapes.
 */
const MapGeography = memo(function MapGeography({
  geo,
  isRegionMember,
  showBackgroundContext,
  alpha2,
  isSelected,
  label,
  onActivate,
  onHoverStart,
  onHoverEnd,
}: MapGeographyProps) {
  const handleClick = useCallback(() => {
    if (alpha2) onActivate(alpha2);
  }, [alpha2, onActivate]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<SVGPathElement>) => {
      if (!alpha2) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate(alpha2);
      }
    },
    [alpha2, onActivate],
  );

  const handleMouseEnter = useCallback(() => {
    if (alpha2 && label) onHoverStart(label);
  }, [alpha2, label, onHoverStart]);

  const style = !isRegionMember
    ? (showBackgroundContext ? STYLE_CONTEXT : STYLE_HIDDEN)
    : alpha2
      ? isSelected
        ? STYLE_SELECTED
        : STYLE_SELECTABLE
      : STYLE_HIDDEN;

  return (
    <Geography
      geography={geo}
      style={style}
      tabIndex={alpha2 ? 0 : -1}
      role={alpha2 ? 'button' : undefined}
      aria-pressed={alpha2 ? isSelected : undefined}
      aria-label={label}
      onClick={alpha2 ? handleClick : undefined}
      onKeyDown={alpha2 ? handleKeyDown : undefined}
      onMouseEnter={alpha2 ? handleMouseEnter : undefined}
      onMouseLeave={alpha2 ? onHoverEnd : undefined}
    >
      {label ? <title>{label}</title> : null}
    </Geography>
  );
});
MapGeography.displayName = 'MapGeography';

interface RegionGeographyProps {
  svgPath: string;
  region: RegionKey;
  label: string;
  onActivate: (region: RegionKey) => void;
}

/** One region blob at the world overview — a dissolved shape (no member-country borders),
 * clicking it enters that region. */
const RegionGeography = memo(function RegionGeography({ svgPath, region, label, onActivate }: RegionGeographyProps) {
  const handleClick = useCallback(() => onActivate(region), [region, onActivate]);
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<SVGPathElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate(region);
      }
    },
    [region, onActivate],
  );
  return (
    <Geography geography={{ svgPath }} style={STYLE_SELECTABLE} tabIndex={0} role="button" aria-label={label} onClick={handleClick} onKeyDown={handleKeyDown}>
      <title>{label}</title>
    </Geography>
  );
});
RegionGeography.displayName = 'RegionGeography';

interface RegionOverlayProps {
  labels: Record<RegionKey, string>;
  onEnterRegion: (region: RegionKey) => void;
}

/** Renders the dissolved region shapes, one per REGION_KEYS entry. Needs `path` from the
 * live projection context, so it must live inside <ComposableMap> — that's the only reason
 * this is a separate component. */
function RegionOverlay({ labels, onEnterRegion }: RegionOverlayProps) {
  const { path } = useMapContext();
  const shapes = useMemo(
    () => REGION_KEYS.map((region) => ({ region, svgPath: path(REGION_MERGED_GEOMETRY[region]) ?? '' })),
    [path],
  );
  return (
    <>
      {shapes.map(({ region, svgPath }) => (
        <RegionGeography key={region} svgPath={svgPath} region={region} label={labels[region]} onActivate={onEnterRegion} />
      ))}
    </>
  );
}

interface Props {
  activeRegion: RegionKey | null;
  onEnterRegion: (region: RegionKey) => void;
  selectedCountryId: string | null;
  onSelectCountry: (id: string) => void;
}

/**
 * One world map. By default it's divided into dissolved regions (no country borders
 * showing yet) — click one and the camera zooms into it (2D pan/scale over a fixed
 * projection, see WORLD_PROJECTION_CONFIG) and it splits into its individual, selectable
 * countries. A "‹ Regions" affordance (rendered by the parent) zooms back out.
 */
export function WorldMap({ activeRegion, onEnterRegion, selectedCountryId, onSelectCountry }: Props) {
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  const byId = useMemo(() => new Map(countries.map((c) => [c.id, c])), []);

  // numeric topology id -> which region (if any) owns that geography, and its alpha2.
  const geoIndex = useMemo(() => {
    const index: Record<string, { alpha2: string; region: RegionKey }> = {};
    for (const region of REGION_KEYS) {
      for (const [numericId, alpha2] of Object.entries(REGIONS[region].isoMap)) {
        index[numericId] = { alpha2, region };
      }
    }
    return index;
  }, []);

  const regionLabels = useMemo(() => {
    const labels = {} as Record<RegionKey, string>;
    for (const region of REGION_KEYS) labels[region] = ui.map.continents[region];
    return labels;
  }, [ui]);

  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleHoverStart = useCallback((label: string) => {
    setHoverLabel(label);
  }, []);
  const handleHoverEnd = useCallback(() => {
    setHoverLabel(null);
  }, []);

  // Tooltip follows the cursor via a direct style write (not React state) so
  // dragging the mouse across a large country doesn't re-render the whole map.
  const handlePointerMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    if (!tooltip || !container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left + TOOLTIP_OFFSET;
    const y = e.clientY - rect.top + TOOLTIP_OFFSET;
    tooltip.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  const view = activeRegion ? REGIONS[activeRegion] : WORLD_VIEW;

  return (
    <div ref={containerRef} className="relative" onMouseMove={handlePointerMove}>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={WORLD_PROJECTION_CONFIG}
        width={WIDTH}
        height={HEIGHT}
        className="h-auto w-full"
        style={{ background: 'var(--ink-soft)' }}
      >
        <ZoomableGroup
          center={view.center}
          zoom={view.zoom}
          minZoom={1}
          maxZoom={10}
          translateExtent={[
            [0, 0],
            [WIDTH, HEIGHT],
          ]}
        >
          <Geographies geography={worldTopology}>
            {({ geographies }: { geographies: RsmFeature[] }) =>
              geographies.map((geo) => {
                const entry = geoIndex[geo.id ?? ''];
                // A country is individually visible/interactive only once its region is
                // the active one — otherwise it's either represented by the region overlay
                // (world view) or simply off-screen (a different region is zoomed in).
                const isActiveCountry = entry !== undefined && entry.region === activeRegion;
                const alpha2 = isActiveCountry ? entry.alpha2 : null;
                const country = isActiveCountry ? byId.get(entry.alpha2) : undefined;
                const label = country ? loc(country.name, lang) : undefined;
                return (
                  <MapGeography
                    key={geo.rsmKey}
                    geo={geo}
                    isRegionMember={entry !== undefined}
                    showBackgroundContext={activeRegion === null}
                    alpha2={alpha2}
                    isSelected={activeRegion !== null && alpha2 === selectedCountryId}
                    label={label}
                    onActivate={onSelectCountry}
                    onHoverStart={handleHoverStart}
                    onHoverEnd={handleHoverEnd}
                  />
                );
              })
            }
          </Geographies>

          {activeRegion === null && <RegionOverlay labels={regionLabels} onEnterRegion={onEnterRegion} />}
        </ZoomableGroup>
      </ComposableMap>

      <div
        ref={tooltipRef}
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap border border-(--paper-line) bg-(--paper) px-2 py-1 text-xs font-bold text-(--text-ink) shadow-sm"
        style={{ opacity: hoverLabel ? 1 : 0, transition: 'opacity 100ms ease' }}
      >
        {hoverLabel}
      </div>
    </div>
  );
}
